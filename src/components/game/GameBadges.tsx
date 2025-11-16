'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface GameBadgesProps {
  category: string | null
  attemptsRemaining: number
  solved: boolean
  hintAvailable: boolean
}

export default function GameBadges({ category, attemptsRemaining, solved, hintAvailable }: GameBadgesProps) {
  const t = useTranslations('game')

  if (!category && (solved || attemptsRemaining === 0)) return null

  return (
    <motion.div
      className='mb-6 flex justify-center flex-wrap gap-3'
      initial={{ opacity: 0, scale: 0.8, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
    >
      {/* Category Badge */}
      {category && (
        <motion.div
          className='inline-flex items-center gap-2 relative overflow-hidden bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 dark:from-purple-900/40 dark:via-pink-900/40 dark:to-purple-900/40 border-2 border-purple-300 dark:border-purple-700 rounded-full px-5 py-2.5 shadow-lg shadow-purple-200/50 dark:shadow-purple-900/30'
          whileHover={{ scale: 1.05, y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          {/* Animated shimmer effect */}
          <motion.div
            className='absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent'
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
          <div className='flex items-center gap-2 flex-wrap justify-center relative z-10'>
            <motion.span
              className='text-sm text-center font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider'
              animate={{
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {t('category.label')}
            </motion.span>
            <motion.span
              className='text-base font-black text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 dark:from-purple-400 dark:via-pink-400 dark:to-purple-400 bg-clip-text uppercase tracking-wide'
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
              {category}
            </motion.span>
          </div>
          <motion.span
            className='text-xl relative z-10'
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            ✨
          </motion.span>
        </motion.div>
      )}

      {/* Attempts Badge */}
      {!solved && attemptsRemaining > 0 && (
        <motion.div
          key={attemptsRemaining}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
          className='inline-flex items-center gap-2 relative overflow-hidden bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 dark:from-purple-900/40 dark:via-pink-900/40 dark:to-purple-900/40 border-2 border-purple-300 dark:border-purple-700 rounded-full px-5 py-2.5 shadow-lg shadow-purple-200/50 dark:shadow-purple-900/30'
          whileHover={{ scale: 1.05, y: -2 }}
        >
          {/* Animated shimmer effect */}
          <motion.div
            className='absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent'
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
          <motion.span
            className='text-sm font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider relative z-10'
            animate={{
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {t('attemptsLeft')}
          </motion.span>
          <motion.span
            initial={{ scale: 1.2, filter: 'brightness(1.5)' }}
            animate={{
              scale: 1,
              filter: 'brightness(1)',
              backgroundPosition: ['0%', '100%', '0%'],
            }}
            transition={{
              scale: { duration: 0.3, delay: 0.1 },
              filter: { duration: 0.3, delay: 0.1 },
              backgroundPosition: { duration: 3, repeat: Infinity, ease: 'linear' },
            }}
            className='text-base font-black text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 dark:from-purple-400 dark:via-pink-400 dark:to-purple-400 bg-clip-text uppercase tracking-wide relative z-10 tabular-nums'
            style={{ backgroundSize: '200% 100%' }}
          >
            {attemptsRemaining}
          </motion.span>
          {hintAvailable && (
            <motion.span
              className='text-xl relative z-10'
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              💡
            </motion.span>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
