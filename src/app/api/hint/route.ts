import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTodayUTC } from '@/lib/utils'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const { locale, browserId } = await request.json()

    // Get today's challenge
    const today = getTodayUTC()
    const challenge = await prisma.dailyChallenge.findFirst({
      where: {
        date: today,
      },
      include: {
        word: true,
      },
    })

    if (!challenge) {
      return NextResponse.json({ error: 'No challenge found for today' }, { status: 404 })
    }

    // Get user progress to check attempts count
    let progress
    let userId: string | null = null

    if (session?.user) {
      userId = session.user.id
      progress = await prisma.dailyProgress.findUnique({
        where: {
          userId_challengeId: {
            userId,
            challengeId: challenge.id,
          },
        },
      })
    } else if (browserId) {
      // Anonymous user
      const anonymousUser = await prisma.user.findUnique({
        where: {
          browserId,
        },
      })

      if (anonymousUser) {
        userId = anonymousUser.id
        progress = await prisma.dailyProgress.findUnique({
          where: {
            userId_challengeId: {
              userId: anonymousUser.id,
              challengeId: challenge.id,
            },
          },
        })
      }
    }

    // Check if user has made at least 6 attempts
    if (!progress || progress.attemptsCount < 6) {
      return NextResponse.json(
        {
          error:
            locale === 'es'
              ? 'Necesitas hacer al menos 6 intentos para obtener una pista'
              : 'You need to make at least 6 attempts to get a hint',
        },
        { status: 403 }
      )
    }

    // Check if already solved
    if (progress.solved) {
      return NextResponse.json(
        { error: locale === 'es' ? 'Ya has resuelto el desafío' : 'You have already solved the challenge' },
        { status: 400 }
      )
    }

    // Check if hint is already cached in the database
    const cachedHint = locale === 'es' ? challenge.hintEs : challenge.hintEn

    if (cachedHint) {
      console.log(`[HINT] Using cached hint for challenge ${challenge.id} (${locale})`)
      return NextResponse.json({
        hint: cachedHint,
        attemptsCount: progress.attemptsCount,
        cached: true,
      })
    }

    // Generate hint using OpenAI (only if not cached)
    console.log(`[HINT] Generating new hint for challenge ${challenge.id} (${locale})`)
    const targetWord = locale === 'es' ? challenge.word.textEs : challenge.word.textEn

    const systemPrompt =
      locale === 'es'
        ? 'Eres un asistente que da pistas creativas para adivinar palabras. La pista debe ser sutil pero útil, sin revelar la palabra directamente.'
        : 'You are an assistant that gives creative hints for guessing words. The hint should be subtle but helpful, without directly revealing the word.'

    const userPrompt =
      locale === 'es'
        ? `Dame una pista creativa y sutil para adivinar la palabra "${targetWord}". La pista debe:
1. No mencionar la palabra directamente
2. Describir características, usos o asociaciones comunes
3. Ser útil pero no obvia
4. Tener máximo 2 oraciones cortas
5. Ser en español

Responde solo con la pista, sin introducción.`
        : `Give me a creative and subtle hint for guessing the word "${targetWord}". The hint should:
1. Not mention the word directly
2. Describe characteristics, uses, or common associations
3. Be helpful but not obvious
4. Be maximum 2 short sentences
5. Be in English

Respond only with the hint, no introduction.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 100,
    })

    const hint = completion.choices[0]?.message?.content?.trim() || ''

    if (!hint) {
      return NextResponse.json({ error: locale === 'es' ? 'Error al generar la pista' : 'Error generating hint' }, { status: 500 })
    }

    // Save hint to database for future use
    try {
      await prisma.dailyChallenge.update({
        where: { id: challenge.id },
        data: {
          [locale === 'es' ? 'hintEs' : 'hintEn']: hint,
        },
      })
      console.log(`[HINT] Cached hint saved to database for challenge ${challenge.id} (${locale})`)
    } catch (error) {
      console.error('[HINT] Error saving hint to database:', error)
      // Continue even if caching fails
    }

    return NextResponse.json({
      hint,
      attemptsCount: progress.attemptsCount,
    })
  } catch (error) {
    console.error('Error generating hint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
