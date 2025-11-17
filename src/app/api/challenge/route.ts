import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTodayUTC } from '@/lib/utils'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function generateCategory(wordEn: string, wordEs: string): Promise<{ categoryEn: string; categoryEs: string }> {
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
      return { categoryEn: 'general', categoryEs: 'general' }
    }

    const parsed = JSON.parse(response)
    return {
      categoryEn: parsed.categoryEn || 'general',
      categoryEs: parsed.categoryEs || 'general',
    }
  } catch (error) {
    console.error('Error generating category:', error)
    return { categoryEn: 'general', categoryEs: 'general' }
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const searchParams = request.nextUrl.searchParams
    const locale = searchParams.get('locale') || 'en'

    // Get today's challenge (UTC)
    const today = getTodayUTC()

    let challenge = await prisma.dailyChallenge.findFirst({
      where: {
        date: today,
      },
      include: {
        word: true,
      },
    })

    // Create new challenge if none exists for today
    if (!challenge) {
      // Get the last 20 challenges to avoid repeating words
      const recentChallenges = await prisma.dailyChallenge.findMany({
        take: 20,
        orderBy: { date: 'desc' },
        select: { wordId: true },
      })

      const recentWordIds = recentChallenges.map((c) => c.wordId)

      // Get words that haven't been used recently
      let words = await prisma.word.findMany({
        where: {
          id: {
            notIn: recentWordIds,
          },
        },
      })

      // If all words have been used recently, select from all words
      if (words.length === 0) {
        words = await prisma.word.findMany()
      }

      const randomWord = words[Math.floor(Math.random() * words.length)]

      // Generate category for the word
      console.log(`[CHALLENGE] Generating category for word: ${randomWord.textEn} / ${randomWord.textEs}`)
      const { categoryEn, categoryEs } = await generateCategory(randomWord.textEn, randomWord.textEs)
      console.log(`[CHALLENGE] Generated categories: ${categoryEn} / ${categoryEs}`)

      challenge = await prisma.dailyChallenge.create({
        data: {
          wordId: randomWord.id,
          date: today,
          categoryEn,
          categoryEs,
        },
        include: {
          word: true,
        },
      })
    }

    // For anonymous users, check if they have a browserId to load progress
    if (!session?.user) {
      const browserId = searchParams.get('browserId')

      if (browserId) {
        // Try to find anonymous user by browserId
        const anonymousUser = await prisma.user.findUnique({
          where: {
            browserId: browserId,
          },
        })

        if (anonymousUser) {
          // Get progress for anonymous user
          const progress = await prisma.dailyProgress.findUnique({
            where: {
              userId_challengeId: {
                userId: anonymousUser.id,
                challengeId: challenge.id,
              },
            },
          })

          if (progress) {
            // Get user's attempts for this challenge
            const attempts = await prisma.attempt.findMany({
              where: {
                userId: anonymousUser.id,
                wordId: challenge.wordId,
                attemptedAt: {
                  gte: today,
                },
              },
              orderBy: {
                attemptedAt: 'desc',
              },
            })

            return NextResponse.json({
              challengeId: challenge.id,
              wordLength: locale === 'es' ? challenge.word.textEs.length : challenge.word.textEn.length,
              category: locale === 'es' ? challenge.categoryEs : challenge.categoryEn,
              attemptsUsed: progress.attemptsCount,
              attemptsRemaining: 12 - progress.attemptsCount,
              solved: progress.solved,
              attempts: attempts.map((a) => ({
                guess: a.guessText,
                similarity: a.similarity,
                attemptedAt: a.attemptedAt.toISOString(),
              })),
              bestSimilarity: progress.bestSimilarity,
              anonymous: true,
            })
          }
        }
      }

      // No browserId or no progress found, return default
      return NextResponse.json({
        challengeId: challenge.id,
        wordLength: locale === 'es' ? challenge.word.textEs.length : challenge.word.textEn.length,
        category: locale === 'es' ? challenge.categoryEs : challenge.categoryEn,
        attemptsUsed: 0,
        attemptsRemaining: 12,
        solved: false,
        attempts: [],
        bestSimilarity: 0,
        anonymous: true,
      })
    }

    // For authenticated users, get their progress
    let progress = await prisma.dailyProgress.findUnique({
      where: {
        userId_challengeId: {
          userId: session.user.id,
          challengeId: challenge.id,
        },
      },
    })

    if (!progress) {
      progress = await prisma.dailyProgress.create({
        data: {
          userId: session.user.id,
          challengeId: challenge.id,
        },
      })
    }

    // Get user's attempts for this challenge (UTC)
    const attempts = await prisma.attempt.findMany({
      where: {
        userId: session.user.id,
        wordId: challenge.wordId,
        attemptedAt: {
          gte: today,
        },
      },
      orderBy: {
        attemptedAt: 'desc',
      },
    })

    return NextResponse.json({
      challengeId: challenge.id,
      wordLength: locale === 'es' ? challenge.word.textEs.length : challenge.word.textEn.length,
      category: locale === 'es' ? challenge.categoryEs : challenge.categoryEn,
      attemptsUsed: progress.attemptsCount,
      attemptsRemaining: 12 - progress.attemptsCount,
      solved: progress.solved,
      attempts: attempts.map((a) => ({
        guess: a.guessText,
        similarity: a.similarity,
        attemptedAt: a.attemptedAt.toISOString(),
      })),
      bestSimilarity: progress.bestSimilarity,
      anonymous: false,
    })
  } catch (error) {
    console.error('Error fetching daily challenge:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
