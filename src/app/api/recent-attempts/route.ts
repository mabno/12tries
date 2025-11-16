import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    // Obtener los últimos 20 intentos de usuarios con información relacionada
    const recentAttempts = await prisma.attempt.findMany({
      take: 20,
      orderBy: {
        attemptedAt: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
            nickname: true,
            isAnonymous: true,
          },
        },
        word: {
          select: {
            textEn: true,
            textEs: true,
          },
        },
      },
    })

    // Formatear los datos para la respuesta
    const formattedAttempts = recentAttempts.map((attempt: any) => ({
      id: attempt.id,
      userName: attempt.user.isAnonymous ? attempt.user.nickname || 'Anonymous' : attempt.user.name || 'Anonymous',
      userImage: attempt.user.isAnonymous ? '' : attempt.user.image,
      guessText: attempt.guessText,
      language: attempt.language,
      attemptedAt: attempt.attemptedAt,
      isAnonymous: attempt.user.isAnonymous,
    }))

    return NextResponse.json(formattedAttempts)
  } catch (error) {
    console.error('Error fetching recent attempts:', error)
    return NextResponse.json({ error: 'Failed to fetch recent attempts' }, { status: 500 })
  }
}
