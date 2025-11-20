'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface ReminderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  locale: string
  onSuccess?: () => void
}

export default function ReminderDialog({ open, onOpenChange, locale, onSuccess }: ReminderDialogProps) {
  const { data: session } = useSession()
  const t = useTranslations('reminders')
  const [email, setEmail] = useState(session?.user?.email || '')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isAuthenticated = !!session?.user

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateEmail(email)) {
      setError(t('invalidEmail'))
      return
    }

    if (!acceptedTerms) {
      setError(t('mustAcceptTerms'))
      return
    }

    setLoading(true)

    try {
      const browserId = localStorage.getItem('browserId') || undefined

      const response = await fetch('/api/reminders/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale, browserId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('errorMessage'))
      }

      onSuccess?.()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorMessage'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
            {t('dialogTitle')}
          </DialogTitle>
          <DialogDescription className='text-gray-600 dark:text-gray-400'>{t('dialogDescription')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6 mt-4'>
          <div className='space-y-2'>
            <label htmlFor='email' className='text-sm font-medium'>
              {t('emailLabel')}
            </label>
            <Input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('emailPlaceholder')}
              disabled={isAuthenticated || loading}
              className='w-full'
              required
            />
          </div>

          <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4'>
            <p className='text-sm text-blue-900 dark:text-blue-100'>🔒 {t('privacyNotice')}</p>
          </div>

          <div className='flex items-start space-x-2'>
            <input
              type='checkbox'
              id='terms'
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className='mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded'
              disabled={loading}
            />
            <label htmlFor='terms' className='text-sm text-gray-700 dark:text-gray-300'>
              {t('termsCheckboxPrefix')}{' '}
              <Link href={`/${locale}/terms`} className='text-purple-600 hover:underline font-medium' target='_blank'>
                {t('termsLink')}
              </Link>{' '}
              {t('termsCheckboxAnd')}{' '}
              <Link href={`/${locale}/privacy`} className='text-purple-600 hover:underline font-medium' target='_blank'>
                {t('privacyLink')}
              </Link>
            </label>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3'
            >
              <p className='text-sm text-red-900 dark:text-red-100'>{error}</p>
            </motion.div>
          )}

          <div className='flex gap-3'>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={loading} className='flex-1'>
              {t('cancelButton')}
            </Button>
            <Button
              type='submit'
              disabled={loading || !acceptedTerms}
              className='flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
            >
              {loading ? '...' : t('confirmButton')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
