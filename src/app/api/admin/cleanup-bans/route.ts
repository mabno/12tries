import { NextRequest, NextResponse } from 'next/server'
import { cleanupExpiredBans } from '@/lib/ip-security'

/**
 * API endpoint to cleanup expired IP bans
 * This can be called manually or set up as a cron job
 *
 * For security, you should protect this endpoint with an API key
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Add API key authentication
    const apiKey = request.headers.get('x-api-key')
    const expectedKey = process.env.ADMIN_API_KEY

    if (expectedKey && apiKey !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const deletedCount = await cleanupExpiredBans()

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount} expired ban(s)`,
      deletedCount,
    })
  } catch (error) {
    console.error('Error cleaning up expired bans:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}
