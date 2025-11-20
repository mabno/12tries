import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { browserId } = await req.json()
    let userId: string | null = null

    if (session?.user?.id) {
      userId = session.user.id
    } else {
      if (!browserId) {
        return NextResponse.json({ isSubscribed: false })
      }

      const user = await prisma.user.findUnique({
        where: { browserId },
      })

      if (!user) {
        return NextResponse.json({ isSubscribed: false })
      }

      userId = user.id
    }
    const reminder = await prisma.emailReminder.findUnique({
      where: { userId },
    })

    return NextResponse.json({
      isSubscribed: reminder?.isSubscribed || false,
    })
  } catch (error) {
    console.error('Error checking subscription status:', error)
    return NextResponse.json({ isSubscribed: false })
  }
}
