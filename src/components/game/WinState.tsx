'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { NumberTicker } from '@/components/ui/number-ticker'
import NextChallengeCountdown from '@/components/NextChallengeCountdown'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import ReminderDialog from '@/components/ReminderDialog'

interface WinStateProps {
  attemptsUsed: number
  attemptsRemaining: number
  targetWord: string
  locale: string
}

export default function WinState({ attemptsUsed, attemptsRemaining, targetWord, locale }: WinStateProps) {
  const t = useTranslations('game')
  const tReminders = useTranslations('reminders')
  const [showReminderDialog, setShowReminderDialog] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [checkingSubscription, setCheckingSubscription] = useState(true)

  useEffect(() => {
    checkSubscriptionStatus()
  }, [])

  const checkSubscriptionStatus = async () => {
    try {
      const browserId = localStorage.getItem('browserId') || undefined

      const response = await fetch('/api/reminders/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ browserId }),
      })
      const data = await response.json()
      setIsSubscribed(data.isSubscribed)
    } catch (error) {
      console.error('Error checking subscription status:', error)
    } finally {
      setCheckingSubscription(false)
    }
  }

  const handleReminderSuccess = () => {
    setIsSubscribed(true)
  }
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', duration: 0.6 }}
      className='text-center py-12 space-y-6'
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 10, 0],
          y: [0, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className='text-8xl mb-6'
      >
        🎉
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <p className='text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4'>
          {t('solved')}
        </p>

        {/* Target Word Display */}
        {targetWord && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            className='inline-block relative mb-6'
          >
            <motion.div
              className='relative px-8 py-4 rounded-2xl bg-gradient-to-r from-green-100 via-emerald-100 to-green-100 dark:from-green-900/40 dark:via-emerald-900/40 dark:to-green-900/40 border-2 border-green-300 dark:border-green-700 shadow-2xl'
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              {/* Animated shimmer effect */}
              <motion.div
                className='absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent rounded-2xl'
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{ width: '50%' }}
              />
              <div className='relative z-10 flex flex-col items-center gap-2'>
                <span className='text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wider'>{t('targetWord')}</span>
                <motion.span
                  className='text-4xl font-black text-transparent bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 dark:from-green-400 dark:via-emerald-400 dark:to-green-400 bg-clip-text uppercase tracking-wide'
                  animate={{
                    backgroundPosition: ['0%', '100%', '0%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  style={{ backgroundSize: '200% 100%' }}
                >
                  {targetWord}
                </motion.span>
                <motion.span
                  className='text-2xl'
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  ✨
                </motion.span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {/* Stats Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className='flex justify-center gap-4 '
      >
        {/* Attempts Used */}
        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          className='px-6 py-3 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 border-2 border-blue-300 dark:border-blue-700 shadow-lg'
        >
          <div className='text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1'>{t('attemptsUsed')}</div>
          <div className='text-3xl font-black text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text'>
            {attemptsUsed}
          </div>
        </motion.div>

        {/* Attempts Remaining */}
        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          className='px-6 py-3 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 border-2 border-purple-300 dark:border-purple-700 shadow-lg'
        >
          <div className='text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider mb-1'>{t('attemptsLeft')}</div>
          <div className='text-3xl font-black text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text'>
            {attemptsRemaining}
          </div>
        </motion.div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className='text-gray-600 dark:text-gray-400 mt-4'
      >
        {t('comeTomorrow')}
      </motion.p>

      <NextChallengeCountdown locale={locale} />

      {/* Reminder Button */}
      {!checkingSubscription && !isSubscribed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className='mt-4 px-4 relative'
        >
          {/* Glow effect */}
          <motion.div
            className='absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 rounded-lg blur-xl opacity-60'
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              y: [0, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className='relative'
          >
            <Button
              onClick={() => setShowReminderDialog(true)}
              className='relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-sm sm:text-base whitespace-normal h-auto py-3 px-4 shadow-2xl hover:shadow-3xl transition-all overflow-hidden group border-0'
            >
              {/* Animated shimmer effect */}
              <motion.div
                className='absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent'
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{ width: '50%' }}
              />

              {/* Sparkles */}
              <motion.span
                className='absolute top-1 right-2 text-yellow-300'
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                ✨
              </motion.span>

              <motion.span
                className='absolute bottom-1 left-2 text-yellow-300'
                animate={{
                  scale: [1.2, 0.8, 1.2],
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.75,
                }}
              >
                ✨
              </motion.span>

              <motion.span
                animate={{
                  rotate: [0, -15, 15, -15, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className='inline-block mr-1 text-lg'
              >
                🔔
              </motion.span>
              <span className='relative z-10'>{tReminders('buttonText')}</span>
            </Button>
          </motion.div>
        </motion.div>
      )}

      <ReminderDialog open={showReminderDialog} onOpenChange={setShowReminderDialog} locale={locale} onSuccess={handleReminderSuccess} />
    </motion.div>
  )
}
