import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateEmbedding, normalizeText } from '@/lib/embeddings'
import { getTodayUTC } from '@/lib/utils'
import { validateNickname, containsProfanity } from '@/lib/profanity-filter'
import { getClientIp, checkIpSecurity } from '@/lib/ip-security'

const MAX_ATTEMPTS = 12

// Calculate score based on similarity and attempts
function calculateScore(bestSimilarity: number, attemptsCount: number): number {
  const baseScore = bestSimilarity * 1000

  let attemptPenalty = 0

  if (attemptsCount <= 8) {
    // Gentle exponential growth for attempts 1-8
    attemptPenalty = Math.pow(attemptsCount, 2.2)
  } else {
    // Moderate exponential penalty after hint becomes available (attempt 9+)
    const baseAttempt8Penalty = Math.pow(8, 2.2)
    const additionalAttempts = attemptsCount - 8
    attemptPenalty = baseAttempt8Penalty + Math.pow(additionalAttempts, 2.3) * 30
  }

  // Cap penalty at 85% of base score to avoid negative or near-zero scores
  const maxPenalty = baseScore * 0.85
  attemptPenalty = Math.min(attemptPenalty, maxPenalty)

  const finalScore = baseScore - attemptPenalty
  return Math.round(Math.max(0, finalScore))
}

// Error messages by locale
const ERROR_MESSAGES = {
  en: {
    profanity: 'Guess contains inappropriate language',
    invalidGuess: 'Invalid guess',
    invalidNickname: 'Invalid nickname',
    nicknameTaken: 'This nickname is already taken. Please choose another one.',
  },
  es: {
    profanity: 'El intento contiene lenguaje inapropiado',
    invalidGuess: 'Intento inválido',
    invalidNickname: 'Apodo inválido',
    nicknameTaken: 'Este apodo ya está en uso. Por favor elige otro.',
  },
}

// Helper: Get error message in the correct locale
function getErrorMessage(key: keyof typeof ERROR_MESSAGES.en, locale: string = 'en'): string {
  const lang = locale === 'es' ? 'es' : 'en'
  return ERROR_MESSAGES[lang][key]
}

// Helper: Validate input data
async function validateInput(guess: string, locale: string, nickname?: string) {
  if (!guess || typeof guess !== 'string') {
    return { valid: false, error: getErrorMessage('invalidGuess', locale) }
  }

  const guessText = guess.toLowerCase().trim()

  if (await containsProfanity(guessText, locale)) {
    return { valid: false, error: getErrorMessage('profanity', locale) }
  }

  if (nickname) {
    const validation = await validateNickname(nickname)
    if (!validation.isValid) {
      return { valid: false, error: validation.error || getErrorMessage('invalidNickname', locale) }
    }
  }

  return { valid: true, guessText }
}

// Helper: Get today's challenge
async function getTodayChallenge() {
  const today = getTodayUTC()
  const challenge = await prisma.dailyChallenge.findFirst({
    where: { date: today },
    include: { word: true },
  })
  return { challenge, today }
}

// Helper: Calculate similarity
async function calculateSimilarity(guessText: string, wordId: string, locale: string) {
  const guessEmbedding = await generateEmbedding(guessText)
  const vectorString = `[${guessEmbedding.join(',')}]`

  const result =
    locale === 'es'
      ? await prisma.$queryRaw<Array<{ similarity: number }>>`
        SELECT 1 - ("embeddingEs"::vector <=> ${vectorString}::vector) as similarity
        FROM words WHERE id = ${wordId}
      `
      : await prisma.$queryRaw<Array<{ similarity: number }>>`
        SELECT 1 - (embedding::vector <=> ${vectorString}::vector) as similarity
        FROM words WHERE id = ${wordId}
      `

  return result[0]?.similarity || 0
}

// Helper: Get or create user progress
async function getOrCreateProgress(userId: string, challengeId: string) {
  let progress = await prisma.dailyProgress.findUnique({
    where: { userId_challengeId: { userId, challengeId } },
  })

  if (!progress) {
    progress = await prisma.dailyProgress.create({
      data: { userId, challengeId },
    })
  }

  return progress
}

// Helper: Validate attempt permission
function validateAttemptPermission(progress: any) {
  if (progress.solved) {
    return { canAttempt: false, error: 'Challenge already solved' }
  }

  // Allow 13 attempts if Rocky bonus was used, otherwise 12
  const maxAllowedAttempts = progress.rockyBonusUsed ? MAX_ATTEMPTS + 1 : MAX_ATTEMPTS

  if (progress.attemptsCount >= maxAllowedAttempts) {
    return { canAttempt: false, error: 'No attempts remaining' }
  }
  return { canAttempt: true }
}

// Helper: Save attempt and update progress
async function saveAttemptAndUpdateProgress(
  userId: string,
  wordId: string,
  guessText: string,
  similarity: number,
  locale: string,
  progressId: string,
  currentAttempts: number,
  currentBestSimilarity: number,
  isCorrect: boolean,
  ipAddress?: string
) {
  await prisma.attempt.create({
    data: { userId, wordId, guessText, similarity, language: locale || 'en', ipAddress },
  })

  const newAttemptsCount = currentAttempts + 1
  const newBestSimilarity = Math.max(currentBestSimilarity, similarity)
  const newScore = calculateScore(newBestSimilarity, newAttemptsCount)

  await prisma.dailyProgress.update({
    where: { id: progressId },
    data: {
      attemptsCount: newAttemptsCount,
      solved: isCorrect,
      bestSimilarity: newBestSimilarity,
      score: newScore,
      lastAttemptAt: new Date(),
    },
  })

  return newAttemptsCount
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const { guess, locale, attemptsUsed, browserId, nickname } = await request.json()

    // Get client IP and check security
    const clientIp = getClientIp(request)
    const securityCheck = await checkIpSecurity(clientIp)

    if (!securityCheck.allowed) {
      console.log(`[SECURITY] Blocked request from IP: ${clientIp} - ${securityCheck.reason}`)
      return NextResponse.json(
        {
          error: securityCheck.reason || 'Request blocked',
          banned: true,
        },
        { status: 429 }
      )
    }

    // Validate input
    const validation = await validateInput(guess, locale || 'en', nickname)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    const guessText = validation.guessText!

    // Get today's challenge
    const { challenge } = await getTodayChallenge()
    if (!challenge) {
      return NextResponse.json({ error: 'No challenge found' }, { status: 404 })
    }

    // Check for exact match
    const targetWord = locale === 'es' ? challenge.word.textEs : challenge.word.textEn
    const isCorrect = normalizeText(guessText) === normalizeText(targetWord)

    // Calculate similarity
    const similarity = await calculateSimilarity(guessText, challenge.wordId, locale)

    // Handle anonymous users
    if (!session?.user) {
      if (!browserId || !nickname) {
        return NextResponse.json({ error: 'Browser ID and nickname required' }, { status: 400 })
      }

      // Find or create anonymous user
      let anonymousUser = await prisma.user.findUnique({ where: { browserId } })
      if (!anonymousUser) {
        // Check if nickname is already taken by another user
        const existingNickname = await prisma.user.findFirst({
          where: {
            nickname: nickname,
            isAnonymous: true,
            browserId: { not: browserId },
          },
        })

        if (existingNickname) {
          return NextResponse.json({ error: getErrorMessage('nicknameTaken', locale) }, { status: 400 })
        }

        anonymousUser = await prisma.user.create({
          data: { browserId, nickname, isAnonymous: true },
        })
      }

      // Get or create progress
      const progress = await getOrCreateProgress(anonymousUser.id, challenge.id)

      // Validate attempt permission
      const attemptCheck = validateAttemptPermission(progress)
      if (!attemptCheck.canAttempt) {
        return NextResponse.json({ error: attemptCheck.error }, { status: 400 })
      }

      // Save attempt and update progress
      const newAttemptsCount = await saveAttemptAndUpdateProgress(
        anonymousUser.id,
        challenge.wordId,
        guessText,
        similarity,
        locale,
        progress.id,
        progress.attemptsCount,
        progress.bestSimilarity,
        isCorrect,
        clientIp
      )

      return NextResponse.json({
        correct: isCorrect,
        similarity,
        attemptsRemaining: MAX_ATTEMPTS - newAttemptsCount,
        word: isCorrect ? targetWord : undefined,
        anonymous: true,
      })
    }

    // Handle authenticated users
    const progress = await getOrCreateProgress(session.user.id, challenge.id)

    // Validate attempt permission
    const attemptCheck = validateAttemptPermission(progress)
    if (!attemptCheck.canAttempt) {
      return NextResponse.json({ error: attemptCheck.error }, { status: 400 })
    }

    // Save attempt and update progress
    const newAttemptsCount = await saveAttemptAndUpdateProgress(
      session.user.id,
      challenge.wordId,
      guessText,
      similarity,
      locale,
      progress.id,
      progress.attemptsCount,
      progress.bestSimilarity,
      isCorrect,
      clientIp
    )

    return NextResponse.json({
      correct: isCorrect,
      similarity,
      attemptsRemaining: MAX_ATTEMPTS - newAttemptsCount,
      word: isCorrect ? targetWord : undefined,
      anonymous: false,
    })
  } catch (error) {
    console.error('Error submitting guess:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
