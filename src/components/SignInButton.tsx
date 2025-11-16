'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

export default function SignInButton({ locale }: { locale: string }) {
  const t = useTranslations('auth')

  return (
    <Button
      onClick={() => signIn('google', { callbackUrl: `/${locale}` })}
      className='w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
      size='lg'
    >
      {t('signInWithGoogle')}
    </Button>
  )
}
