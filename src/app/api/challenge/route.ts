import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTodayUTC } from '@/lib/utils'
import OpenAI from 'openai'
import type { DailyChallenge, Word, DailyProgress, Attempt, User } from '@prisma/client'

// ===========================
// CONSTANTS
// ===========================

const MAX_ATTEMPTS = 12
const RECENT_CHALLENGES_LIMIT = 20
const DEFAULT_LOCALE = 'en'
const DEFAULT_CATEGORY = 'general'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// ===========================
// TYPES
// ===========================

type ChallengeWithWord = DailyChallenge & { word: Word }

interface CategoryGeneration {
  categoryEn: string
  categoryEs: string
}

interface AttemptResponse {
  guess: string
  similarity: number
  attemptedAt: string
}

interface ChallengeResponse {
  challengeId: string
  category: string
  attemptsUsed: number
  attemptsRemaining: number
  solved: boolean
  attempts: AttemptResponse[]
  bestSimilarity: number
  anonymous: boolean
  shouldShowRocky: boolean
  rockyBonusUsed: boolean
}

// ===========================
// AI CATEGORY GENERATION
// ===========================

async function generateCategory(wordEn: string, wordEs: string): Promise<CategoryGeneration> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert at categorizing words. Given a word, provide ONE or maximum TWO words that indicate the category/group/classification to narrow down the universe of possibilities. This is NOT a hint, just a category. IMPORTANT: The category MUST be different from the target word itself.',
        },
        {
          role: 'user',
          content: `Word in English: "${wordEn}"
Word in Spanish: "${wordEs}"

Provide the category in BOTH languages. The category should be a general classification (1-2 words maximum) that helps narrow possibilities without being a direct hint.

CRITICAL RULE: The category MUST NOT be the same as the target word. If the word is "doctor", the category cannot be "doctor". It should be "profession" or "health" instead.

Examples:
- If the word is "vacation", the category could be "travel" or "leisure" (NOT "vacation")
- If the word is "doctor", the category could be "profession" or "health" (NOT "doctor")
- If the word is "pizza", the category could be "food" or "cuisine" (NOT "pizza")

Respond in JSON format:
{
  "categoryEn": "category in English (1-2 words, DIFFERENT from '${wordEn}')",
  "categoryEs": "categoría en español (1-2 palabras, DIFERENTE de '${wordEs}')"
}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 50,
      response_format: { type: 'json_object' },
    })

    const response = completion.choices[0]?.message?.content?.trim()
    if (!response) {
      return { categoryEn: DEFAULT_CATEGORY, categoryEs: DEFAULT_CATEGORY }
    }

    const parsed = JSON.parse(response)
    return {
      categoryEn: parsed.categoryEn || DEFAULT_CATEGORY,
      categoryEs: parsed.categoryEs || DEFAULT_CATEGORY,
    }
  } catch (error) {
    console.error('Error generating category:', error)
    return { categoryEn: DEFAULT_CATEGORY, categoryEs: DEFAULT_CATEGORY }
  }
}

// ===========================
// CHALLENGE MANAGEMENT
// ===========================

async function getRecentlyUsedWordIds(): Promise<string[]> {
  const recentChallenges = await prisma.dailyChallenge.findMany({
    take: RECENT_CHALLENGES_LIMIT,
    orderBy: { date: 'desc' },
    select: { wordId: true },
  })

  return recentChallenges.map((c) => c.wordId)
}

async function selectRandomWord(): Promise<Word> {
  const recentWordIds = await getRecentlyUsedWordIds()

  let words = await prisma.word.findMany({
    where: { id: { notIn: recentWordIds } },
  })

  if (words.length === 0) {
    words = await prisma.word.findMany()
  }

  return words[Math.floor(Math.random() * words.length)]
}

async function createNewChallenge(today: Date): Promise<ChallengeWithWord> {
  const randomWord = await selectRandomWord()

  console.log(`[CHALLENGE] Generating category for word: ${randomWord.textEn} / ${randomWord.textEs}`)
  const { categoryEn, categoryEs } = await generateCategory(randomWord.textEn, randomWord.textEs)
  console.log(`[CHALLENGE] Generated categories: ${categoryEn} / ${categoryEs}`)

  return await prisma.dailyChallenge.create({
    data: {
      wordId: randomWord.id,
      date: today,
      categoryEn,
      categoryEs,
    },
    include: { word: true },
  })
}

async function getTodayChallenge(today: Date): Promise<ChallengeWithWord> {
  const existingChallenge = await prisma.dailyChallenge.findFirst({
    where: { date: today },
    include: { word: true },
  })

  return existingChallenge || (await createNewChallenge(today))
}

// ===========================
// USER PROGRESS & ATTEMPTS
// ===========================

async function getUserAttempts(userId: string, wordId: string, today: Date): Promise<Attempt[]> {
  return await prisma.attempt.findMany({
    where: {
      userId,
      wordId,
      attemptedAt: { gte: today },
    },
    orderBy: { attemptedAt: 'desc' },
  })
}

async function getOrCreateProgress(userId: string, challengeId: string): Promise<DailyProgress> {
  const existingProgress = await prisma.dailyProgress.findUnique({
    where: {
      userId_challengeId: {
        userId,
        challengeId,
      },
    },
  })

  if (existingProgress) {
    return existingProgress
  }

  return await prisma.dailyProgress.create({
    data: {
      userId,
      challengeId,
    },
  })
}

async function countPreviousCompletedChallenges(userId: string, currentChallengeId: string): Promise<number> {
  return await prisma.dailyProgress.count({
    where: {
      userId,
      challengeId: { not: currentChallengeId },
    },
  })
}

function shouldShowRockyPopup(completedChallengesCount: number, timesOfRockyBonusUsed: number): boolean {
  console.log(`[ROCKY POPUP] Completed Challenges: ${completedChallengesCount}, Rocky Bonus Used: ${timesOfRockyBonusUsed}`)

  // Primera vez: no mostrar Rocky
  if (completedChallengesCount === 0) {
    return false
  }

  // No es la primera vez, pero nunca ha usado el bono de Rocky: SIEMPRE mostrar Rocky
  if (timesOfRockyBonusUsed === 0) {
    return true
  }

  // Tercera vez en adelante: 40% de probabilidad (puede aparecer múltiples veces)
  return Math.random() < 0.4
}

// ===========================
// RESPONSE BUILDERS
// ===========================

function getLocalizedCategory(challenge: ChallengeWithWord, locale: string): string {
  return locale === 'es' ? challenge.categoryEs || DEFAULT_CATEGORY : challenge.categoryEn || DEFAULT_CATEGORY
}

function formatAttempts(attempts: Attempt[]): AttemptResponse[] {
  return attempts.map((a) => ({
    guess: a.guessText,
    similarity: a.similarity,
    attemptedAt: a.attemptedAt.toISOString(),
  }))
}

function buildChallengeResponse(
  challenge: ChallengeWithWord,
  progress: DailyProgress | null,
  attempts: Attempt[],
  locale: string,
  isAnonymous: boolean,
  shouldShowRocky: boolean
): ChallengeResponse {
  const rockyBonusUsed = progress?.rockyBonusUsed || false
  const maxAttempts = rockyBonusUsed ? MAX_ATTEMPTS + 1 : MAX_ATTEMPTS

  return {
    challengeId: challenge.id,
    category: getLocalizedCategory(challenge, locale),
    attemptsUsed: progress?.attemptsCount || 0,
    attemptsRemaining: maxAttempts - (progress?.attemptsCount || 0),
    solved: progress?.solved || false,
    attempts: formatAttempts(attempts),
    bestSimilarity: progress?.bestSimilarity || 0,
    anonymous: isAnonymous,
    shouldShowRocky,
    rockyBonusUsed,
  }
}

// ===========================
// ANONYMOUS USER HANDLERS
// ===========================

async function handleAnonymousUser(
  challenge: ChallengeWithWord,
  browserId: string | null,
  locale: string,
  today: Date
): Promise<ChallengeResponse> {
  if (!browserId) {
    return buildChallengeResponse(challenge, null, [], locale, true, false)
  }

  const anonymousUser = await prisma.user.findUnique({
    where: { browserId },
  })

  if (!anonymousUser) {
    return buildChallengeResponse(challenge, null, [], locale, true, false)
  }

  const previousCompleted = await prisma.dailyProgress.count({
    where: {
      userId: anonymousUser.id,
      challengeId: { not: challenge.id },
    },
  })
  const timesOfRockyBonusUsed = await prisma.dailyProgress.count({
    where: {
      userId: anonymousUser.id,
      rockyBonusUsed: true,
    },
  })

  const shouldShowRocky = shouldShowRockyPopup(previousCompleted, timesOfRockyBonusUsed)

  const progress = await getOrCreateProgress(anonymousUser.id, challenge.id)

  const attempts = await getUserAttempts(anonymousUser.id, challenge.wordId, today)

  return buildChallengeResponse(challenge, progress, attempts, locale, true, shouldShowRocky)
}

// ===========================
// AUTHENTICATED USER HANDLERS
// ===========================

async function handleAuthenticatedUser(
  challenge: ChallengeWithWord,
  userId: string,
  locale: string,
  today: Date
): Promise<ChallengeResponse> {
  const attempts = await getUserAttempts(userId, challenge.wordId, today)
  const previousCompleted = await countPreviousCompletedChallenges(userId, challenge.id)
  const timesOfRockyBonusUsed = await prisma.dailyProgress.count({
    where: {
      userId: userId,
      rockyBonusUsed: true,
    },
  })
  const shouldShowRocky = shouldShowRockyPopup(previousCompleted, timesOfRockyBonusUsed)
  const progress = await getOrCreateProgress(userId, challenge.id)

  return buildChallengeResponse(challenge, progress, attempts, locale, false, shouldShowRocky)
}

// ===========================
// MAIN ROUTE HANDLER
// ===========================

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const searchParams = request.nextUrl.searchParams
    const locale = searchParams.get('locale') || DEFAULT_LOCALE
    const today = getTodayUTC()

    const challenge = await getTodayChallenge(today)

    if (!session?.user) {
      const browserId = searchParams.get('browserId')
      const response = await handleAnonymousUser(challenge, browserId, locale, today)
      return NextResponse.json(response)
    }

    const response = await handleAuthenticatedUser(challenge, session.user.id, locale, today)
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching daily challenge:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
