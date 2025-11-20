import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import { render } from '@react-email/components'
import ChallengeReminderEmail from '@/emails/ChallengeReminderEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    // Verify API key
    const apiKey = req.headers.get('x-api-key')

    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all subscribed users
    const subscribedUsers = await prisma.emailReminder.findMany({
      where: {
        isSubscribed: true,
      },
      include: {
        user: true,
      },
    })

    if (subscribedUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No subscribed users found',
        sent: 0,
      })
    }

    // Prepare batch emails
    const emails = await Promise.all(
      subscribedUsers.map(async (reminder) => {
        const locale = reminder.locale || 'en'

        const emailHtml = await render(
          ChallengeReminderEmail({
            unsubscribeToken: reminder.unsubscribeToken,
            locale: locale as 'en' | 'es',
          })
        )

        return {
          from: '12Tries <reminders@12tries.com>',
          to: reminder.email,
          subject: locale === 'es' ? '🎉 ¡Nuevo Desafío Disponible en 12Tries!' : '🎉 New Challenge Available on 12Tries!',
          html: emailHtml,
        }
      })
    )

    // Send emails using Resend batch API
    const { data, error } = await resend.batch.send(emails)

    if (error) {
      console.error('Error sending batch emails:', error)
      return NextResponse.json(
        {
          error: 'Failed to send emails',
          message: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      sent: data?.length || 0,
      total: subscribedUsers.length,
      data,
    })
  } catch (error) {
    console.error('Error sending reminder emails:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
