import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateNickname } from '@/lib/profanity-filter'

// Error messages by locale
const ERROR_MESSAGES = {
  en: {
    invalidNickname: 'Invalid nickname',
    nicknameTaken: 'This nickname is already taken. Please choose another one.',
  },
  es: {
    invalidNickname: 'Apodo inválido',
    nicknameTaken: 'Este apodo ya está en uso. Por favor elige otro.',
  },
}

// Helper: Get error message in the correct locale
function getErrorMessage(key: keyof typeof ERROR_MESSAGES.en, locale: string = 'en'): string {
  const lang = locale === 'es' ? 'es' : 'en'
  return ERROR_MESSAGES[lang][key]
}

export async function POST(request: NextRequest) {
  try {
    const { nickname, browserId, locale } = await request.json()

    if (!nickname || typeof nickname !== 'string') {
      return NextResponse.json({ valid: false, error: getErrorMessage('invalidNickname', locale) }, { status: 400 })
    }

    // Validate nickname format and profanity
    const validation = await validateNickname(nickname)
    if (!validation.isValid) {
      return NextResponse.json({ valid: false, error: validation.error || getErrorMessage('invalidNickname', locale) }, { status: 400 })
    }

    // Check if nickname is already taken by another anonymous user
    const existingNickname = await prisma.user.findFirst({
      where: {
        nickname: nickname.trim(),
        isAnonymous: true,
        browserId: browserId ? { not: browserId } : undefined,
      },
    })

    if (existingNickname) {
      return NextResponse.json({ valid: false, error: getErrorMessage('nicknameTaken', locale) }, { status: 400 })
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error('Error validating nickname:', error)
    return NextResponse.json({ valid: false, error: 'Internal server error' }, { status: 500 })
  }
}
