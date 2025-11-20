import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { email, locale, browserId } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    let userId: string | null = null

    if (session?.user?.id) {
      // Authenticated user
      userId = session.user.id
    } else {
      // Anonymous user - get browserId from request body
      if (!browserId) {
        return NextResponse.json({ error: 'User not found' }, { status: 400 })
      }

      // Find anonymous user by browserId
      const user = await prisma.user.findUnique({
        where: { browserId },
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 400 })
      }

      userId = user.id
    }

    // Check if already subscribed
    const existingReminder = await prisma.emailReminder.findUnique({
      where: { userId },
    })

    if (existingReminder) {
      if (existingReminder.isSubscribed) {
        return NextResponse.json({ error: 'Already subscribed' }, { status: 400 })
      }

      // Reactivate subscription
      await prisma.emailReminder.update({
        where: { userId },
        data: {
          email,
          locale,
          isSubscribed: true,
          updatedAt: new Date(),
        },
      })
    } else {
      // Create new subscription
      await prisma.emailReminder.create({
        data: {
          userId,
          email,
          locale,
          isSubscribed: true,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error subscribing to reminders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
