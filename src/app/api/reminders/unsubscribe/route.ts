import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Unsubscribe token is required' }, { status: 400 })
    }

    const reminder = await prisma.emailReminder.findUnique({
      where: { unsubscribeToken: token },
    })

    if (!reminder) {
      return NextResponse.json({ error: 'Invalid unsubscribe token' }, { status: 404 })
    }

    await prisma.emailReminder.update({
      where: { unsubscribeToken: token },
      data: {
        isSubscribed: false,
        updatedAt: new Date(),
      },
    })

    // Redirect to a confirmation page
    const locale = req.nextUrl.searchParams.get('locale') || 'en'
    return NextResponse.redirect(new URL(`/${locale}/unsubscribed`, req.nextUrl.origin))
  } catch (error) {
    console.error('Error unsubscribing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
