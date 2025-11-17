import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTodayUTC } from '@/lib/utils'

// ===========================
// ROCKY BONUS ENDPOINT
// ===========================
// This endpoint activates Rocky's bonus attempt
// Called when user accepts Rocky's offer

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const { browserId } = await request.json()

    // Get today's challenge
    const today = getTodayUTC()
    const challenge = await prisma.dailyChallenge.findFirst({
      where: { date: today },
    })

    if (!challenge) {
      return NextResponse.json({ error: 'No challenge found' }, { status: 404 })
    }

    // Handle anonymous users
    if (!session?.user) {
      if (!browserId) {
        return NextResponse.json({ error: 'Browser ID required' }, { status: 400 })
      }

      const anonymousUser = await prisma.user.findUnique({
        where: { browserId },
      })

      if (!anonymousUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Get progress
      const progress = await prisma.dailyProgress.findUnique({
        where: {
          userId_challengeId: {
            userId: anonymousUser.id,
            challengeId: challenge.id,
          },
        },
      })

      if (!progress) {
        return NextResponse.json({ error: 'Progress not found' }, { status: 404 })
      }

      if (progress.rockyBonusUsed) {
        return NextResponse.json({ error: 'Rocky bonus already used' }, { status: 400 })
      }

      // Activate Rocky bonus
      await prisma.dailyProgress.update({
        where: { id: progress.id },
        data: { rockyBonusUsed: true },
      })

      return NextResponse.json({ success: true })
    }

    // Handle authenticated users
    const progress = await prisma.dailyProgress.findUnique({
      where: {
        userId_challengeId: {
          userId: session.user.id,
          challengeId: challenge.id,
        },
      },
    })

    if (!progress) {
      return NextResponse.json({ error: 'Progress not found' }, { status: 404 })
    }

    if (progress.rockyBonusUsed) {
      return NextResponse.json({ error: 'Rocky bonus already used' }, { status: 400 })
    }

    // Activate Rocky bonus
    await prisma.dailyProgress.update({
      where: { id: progress.id },
      data: { rockyBonusUsed: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error activating Rocky bonus:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
