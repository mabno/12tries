import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

const MAX_DAILY_ATTEMPTS = 200
const BAN_DURATION_HOURS = 24

/**
 * The fallback IP address to use if the real IP address cannot be determined.
 */
const FALLBACK_IP_ADDRESS = '0.0.0.0'

/**
 * Returns the real IP address of the client.
 * @param request - The incoming request.
 * @param cfProxy - Whether the client is behind a Cloudflare proxy.
 * @returns The real IP address of the client.
 */
export function getClientIp(request: NextRequest, cfProxy = true): string {
  const headers = request.headers

  // Log all IP-related headers for debugging
  const headerValues = {
    'cf-connecting-ip': headers.get('cf-connecting-ip'),
    'x-real-ip': headers.get('x-real-ip'),
    'x-forwarded-for': headers.get('x-forwarded-for'),
    'x-vercel-forwarded-for': headers.get('x-vercel-forwarded-for'),
    'x-vercel-proxied-for': headers.get('x-vercel-proxied-for'),
    'request.ip': request.ip,
  }
  console.log('[IP] Header values:', headerValues)

  /**
   * Cloudflare only headers.
   */
  if (cfProxy && headers.has('cf-connecting-ip')) {
    const ip = headers.get('cf-connecting-ip')!
    console.log(`[IP] Using cf-connecting-ip: ${ip}`)
    return ip
  }

  if (headers.has('x-real-ip')) {
    const ip = headers.get('x-real-ip')!
    console.log(`[IP] Using x-real-ip: ${ip}`)
    return ip
  }

  if (headers.has('x-forwarded-for')) {
    const ip = headers.get('x-forwarded-for')!
    console.log(`[IP] Using x-forwarded-for: ${ip}`)
    return ip
  }

  if (headers.has('x-vercel-forwarded-for')) {
    const ip = headers.get('x-vercel-forwarded-for')!
    console.log(`[IP] Using x-vercel-forwarded-for: ${ip}`)
    return ip
  }

  if (headers.has('x-vercel-proxied-for')) {
    const ip = headers.get('x-vercel-proxied-for')!
    console.log(`[IP] Using x-vercel-proxied-for: ${ip}`)
    return ip
  }

  /**
   * The fallback IP address.
   */
  const fallbackIp = request.ip ?? FALLBACK_IP_ADDRESS
  console.log(`[IP] Using fallback: ${fallbackIp}`)
  return fallbackIp
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
