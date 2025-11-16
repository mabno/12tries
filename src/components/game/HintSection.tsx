'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface HintSectionProps {
  hintAvailable: boolean
  remainingForHint: number
  hint: string | null
  hintLoading: boolean
  hintError: string
  onGetHint: () => void
}

export default function HintSection({ hintAvailable, remainingForHint, hint, hintLoading, hintError, onGetHint }: HintSectionProps) {
  const t = useTranslations('game')

  return (
    <AnimatePresence>
      {!hintAvailable && remainingForHint > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className='bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-3 text-center'
        >
          <p className='text-sm text-purple-700 dark:text-purple-300 font-medium flex items-center justify-center gap-2'>
            <Sparkles className='h-4 w-4' />
            {t('hint.notAvailable', { remaining: remainingForHint })}
          </p>
        </motion.div>
      )}

      {hintAvailable && !hint && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className='bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg p-4'
        >
          <div className='flex flex-col md:flex-row items-center justify-between gap-3'>
            <div className='text-center md:text-left'>
              <p className='text-sm font-bold text-yellow-900 dark:text-yellow-100 flex items-center justify-center md:justify-start gap-2'>
                <Sparkles className='h-5 w-5' />
                {t('hint.unlocked')}
              </p>
              <p className='text-xs text-yellow-700 dark:text-yellow-300 mt-1'>{t('hint.available')}</p>
            </div>
            <Button
              type='button'
              onClick={onGetHint}
              disabled={hintLoading}
              className='bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold shadow-lg'
            >
              {hintLoading ? t('hint.loading') : t('hint.button')}
            </Button>
          </div>
        </motion.div>
      )}

      {hint && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className='bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-4'
        >
          <div className='flex items-start gap-3'>
            <div className='flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center'>
              <span className='text-2xl'>💡</span>
            </div>
            <div className='flex-1'>
              <p className='font-bold text-blue-900 dark:text-blue-100 mb-1'>{t('hint.title')}</p>
              <p className='text-sm text-blue-800 dark:text-blue-200 italic leading-relaxed'>{hint}</p>
            </div>
          </div>
        </motion.div>
      )}

      {hintError && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className='text-sm text-orange-600 dark:text-orange-400 font-medium text-center'
        >
          {hintError}
        </motion.p>
      )}
    </AnimatePresence>
  )
}
