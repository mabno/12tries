import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

const MAX_DAILY_ATTEMPTS = 200
const BAN_DURATION_HOURS = 24

/**
 * Get the real IP address from the request
 */
export function getClientIp(request: NextRequest): string {
  // Check various headers for the real IP (useful behind proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip') // Cloudflare

  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return forwarded.split(',')[0].trim()
  }

  if (realIp) {
    return realIp
  }

  if (cfConnectingIp) {
    return cfConnectingIp
  }

  // Try to get IP from socket (direct connection)
  try {
    // @ts-ignore - NextRequest might have ip property in some environments
    if (request.ip) {
      return request.ip
    }
  } catch (e) {
    // Ignore errors
  }

  // Fallback to localhost (for development)
  return '127.0.0.1'
}

/**
 * Check if an IP is banned
 */
export async function isIpBanned(ipAddress: string): Promise<boolean> {
  const now = new Date()

  const bannedIp = await prisma.bannedIp.findFirst({
    where: {
      ipAddress,
      expiresAt: {
        gt: now, // Ban is still active
      },
    },
  })

  return bannedIp !== null
}

/**
 * Get the number of attempts from an IP in the last 24 hours
 */
export async function getIpAttemptCount(ipAddress: string): Promise<number> {
  const last24Hours = new Date()
  last24Hours.setHours(last24Hours.getHours() - 24)

  const count = await prisma.attempt.count({
    where: {
      ipAddress,
      attemptedAt: {
        gte: last24Hours,
      },
    },
  })

  return count
}

/**
 * Ban an IP address
 */
export async function banIp(ipAddress: string, reason?: string): Promise<void> {
  const now = new Date()
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + BAN_DURATION_HOURS)

  await prisma.bannedIp.upsert({
    where: { ipAddress },
    create: {
      ipAddress,
      reason: reason || 'Exceeded daily attempt limit',
      expiresAt,
    },
    update: {
      reason: reason || 'Exceeded daily attempt limit',
      bannedAt: now,
      expiresAt,
    },
  })

  console.log(`[SECURITY] Banned IP: ${ipAddress} until ${expiresAt.toISOString()}`)
}

/**
 * Check IP security before allowing a guess attempt
 * Returns { allowed: boolean, reason?: string }
 */
export async function checkIpSecurity(ipAddress: string): Promise<{ allowed: boolean; reason?: string }> {
  // Check if IP is already banned
  const isBanned = await isIpBanned(ipAddress)
  if (isBanned) {
    return {
      allowed: false,
      reason: 'IP address is temporarily banned due to excessive requests',
    }
  }

  // Check attempt count
  const attemptCount = await getIpAttemptCount(ipAddress)
  console.log(`[SECURITY] IP ${ipAddress} has made ${attemptCount} attempts in the last 24 hours`)

  if (attemptCount >= MAX_DAILY_ATTEMPTS) {
    // Ban the IP
    await banIp(ipAddress, `Exceeded ${MAX_DAILY_ATTEMPTS} attempts in 24 hours`)
    return {
      allowed: false,
      reason: 'Too many attempts. Your IP has been temporarily banned.',
    }
  }

  return { allowed: true }
}

/**
 * Clean up expired bans (can be called periodically)
 */
export async function cleanupExpiredBans(): Promise<number> {
  const now = new Date()

  const result = await prisma.bannedIp.deleteMany({
    where: {
      expiresAt: {
        lt: now,
      },
    },
  })

  if (result.count > 0) {
    console.log(`[SECURITY] Cleaned up ${result.count} expired IP bans`)
  }

  return result.count
}
