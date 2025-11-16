'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { validateNickname } from '@/lib/profanity-filter'
import { User, Sparkles } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { GoogleIcon } from '@/components/ui/google-icon'

interface NicknameModalProps {
  isOpen: boolean
  onSave: (nickname: string) => void
  onClose?: () => void
  browserId?: string | null
  locale?: string
}

export default function NicknameModal({ isOpen, onSave, onClose, browserId, locale = 'en' }: NicknameModalProps) {
  const t = useTranslations('game.nickname')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [isValidating, setIsValidating] = useState(false)

  const handleSave = async () => {
    setIsValidating(true)
    setError('')

    // First, validate locally
    const validation = await validateNickname(nickname)

    if (!validation.isValid) {
      setError(validation.error || 'Invalid nickname')
      setIsValidating(false)
      return
    }

    // Then, check with the backend if the nickname is unique
    try {
      const response = await fetch('/api/validate-nickname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: nickname.trim(),
          browserId,
          locale,
        }),
      })

      const data = await response.json()

      if (!data.valid) {
        setError(data.error || t('errors.taken'))
        setIsValidating(false)
        return
      }

      // If validation passes, save the nickname
      onSave(nickname.trim())
      setNickname('')
      setError('')
    } catch (err) {
      console.error('Error validating nickname:', err)
      setError('Failed to validate nickname')
    } finally {
      setIsValidating(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && onClose) {
      setNickname('')
      setError('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <div className='flex justify-center mb-4'>
            <div className='p-3 bg-primary/10 rounded-full'>
              <User className='w-8 h-8 text-primary' />
            </div>
          </div>
          <DialogTitle className='text-2xl flex items-center justify-center gap-2'>
            <Sparkles className='w-5 h-5 text-yellow-500' />
            {t('title')}
            <Sparkles className='w-5 h-5 text-yellow-500' />
          </DialogTitle>
          <DialogDescription className='text-base mt-2 text-center'>{t('description')}</DialogDescription>
        </DialogHeader>

        {/* Better with account message */}
        <div className='mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg'>
          <p className='text-sm text-blue-900 dark:text-blue-100 text-center leading-relaxed'>{t('betterWithAccount')}</p>
        </div>

        {/* Sign In Button */}
        <Button
          onClick={() => signIn('google')}
          className='w-full bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold border-2 border-gray-200 dark:border-gray-700'
          size='lg'
        >
          <GoogleIcon className='w-5 h-5 mr-2' />
          {t('signIn')}
        </Button>

        {/* Divider */}
        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-gray-300 dark:border-gray-700' />
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='px-2 bg-white dark:bg-gray-950 text-gray-500'>{t('continueAsGuest')}</span>
          </div>
        </div>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Input
              type='text'
              placeholder={t('placeholder')}
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value)
                setError('')
              }}
              onKeyPress={handleKeyPress}
              maxLength={20}
              className='text-center text-lg'
              autoFocus
            />
            {error && <p className='text-sm text-red-500 text-center animate-in fade-in slide-in-from-top-1'>{error}</p>}
          </div>
          <Button
            onClick={handleSave}
            disabled={isValidating || !nickname.trim()}
            className='w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            size='lg'
          >
            {isValidating ? (
              <>
                <span className='animate-spin mr-2'>⏳</span>
                Validando...
              </>
            ) : (
              <>
                <Sparkles className='w-4 h-4 mr-2' />
                {t('save')}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
