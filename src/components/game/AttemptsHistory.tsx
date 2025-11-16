'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TextAnimate } from '@/components/ui/text-animate'
import { NumberTicker } from '@/components/ui/number-ticker'
import { Sparkles, TrendingUp } from 'lucide-react'
import { getSimilarityColor, getSimilarityLabel } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface Attempt {
  guess: string
  similarity: number
  attemptedAt: Date
}

interface AttemptsHistoryProps {
  attempts: Attempt[]
  getFeedbackEmoji: (similarity: number) => string
}

export default function AttemptsHistory({ attempts, getFeedbackEmoji }: AttemptsHistoryProps) {
  const t = useTranslations('game')

  if (attempts.length === 0) return null

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
      <Card className='border-2 border-purple-200/50 shadow-lg'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5 text-purple-600' />
            {t('yourAttempts')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            <AnimatePresence mode='popLayout'>
              {attempts.map((attempt, index) => (
                <motion.div
                  key={`${attempt.guess}-${index}`}
                  layout
                  initial={{ opacity: 0, x: -50, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 50, scale: 0.8 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                  }}
                  className='relative overflow-hidden group'
                >
                  <motion.div
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                    className={`relative flex items-center justify-between p-4 rounded-xl border-2 shadow-md overflow-hidden transition-shadow duration-300 group-hover:shadow-xl cursor-pointer ${
                      attempt.similarity >= 0.9
                        ? 'bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/40 dark:via-orange-950/40 dark:to-yellow-950/40 border-orange-300 dark:border-orange-700 group-hover:shadow-orange-200 dark:group-hover:shadow-orange-900/50'
                        : attempt.similarity >= 0.7
                        ? 'bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-purple-950/40 dark:via-pink-950/40 dark:to-purple-950/40 border-purple-300 dark:border-purple-700 group-hover:shadow-purple-200 dark:group-hover:shadow-purple-900/50'
                        : attempt.similarity >= 0.5
                        ? 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 dark:from-blue-950/40 dark:via-cyan-950/40 dark:to-blue-950/40 border-blue-300 dark:border-blue-700 group-hover:shadow-blue-200 dark:group-hover:shadow-blue-900/50'
                        : attempt.similarity >= 0.3
                        ? 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/40 dark:to-slate-900/40 border-gray-300 dark:border-gray-700 group-hover:shadow-gray-200 dark:group-hover:shadow-gray-900/50'
                        : 'bg-gradient-to-br from-slate-100 to-gray-100 dark:from-slate-950/50 dark:to-gray-950/50 border-gray-400 dark:border-gray-600 group-hover:shadow-gray-300 dark:group-hover:shadow-gray-800/50'
                    }`}
                  >
                    <div className='flex items-center gap-3 flex-1'>
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          delay: index * 0.05,
                          type: 'spring',
                          stiffness: 200,
                        }}
                        className={`flex items-center justify-center w-12 h-12 rounded-lg shadow-sm transition-transform duration-200 group-hover:scale-110 group-hover:animate-[wiggle_0.5s_ease-in-out] ${
                          attempt.similarity >= 0.9
                            ? 'bg-gradient-to-br from-orange-200 to-yellow-200 dark:from-orange-900/60 dark:to-yellow-900/60'
                            : attempt.similarity >= 0.7
                            ? 'bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-900/60 dark:to-pink-900/60'
                            : attempt.similarity >= 0.5
                            ? 'bg-gradient-to-br from-blue-200 to-cyan-200 dark:from-blue-900/60 dark:to-cyan-900/60'
                            : 'bg-gradient-to-br from-gray-200 to-slate-200 dark:from-gray-800/60 dark:to-slate-800/60'
                        }`}
                      >
                        <span className='text-3xl group-hover:inline-block group-hover:animate-[wiggle_0.5s_ease-in-out]'>
                          {getFeedbackEmoji(attempt.similarity)}
                        </span>
                      </motion.div>
                      <div className='flex-1 min-w-0'>
                        <TextAnimate
                          animation='slideLeft'
                          by='character'
                          className='font-black text-xl text-gray-900 dark:text-gray-100 mb-0.5'
                          once
                        >
                          {attempt.guess}
                        </TextAnimate>
                        <p className='text-xs font-semibold text-muted-foreground flex items-center gap-1.5'>
                          <span className='inline-block w-1.5 h-1.5 rounded-full bg-current' />
                          {getSimilarityLabel(attempt.similarity, t)}
                        </p>
                      </div>
                    </div>
                    <div className='text-right ml-3'>
                      <motion.div
                        initial={{ scale: 0, rotate: 90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: index * 0.05, type: 'spring', stiffness: 200 }}
                      >
                        <p className={`text-3xl font-black leading-none ${getSimilarityColor(attempt.similarity)}`}>
                          <NumberTicker
                            value={attempt.similarity * 100}
                            decimalPlaces={1}
                            className={getSimilarityColor(attempt.similarity)}
                          />
                          %
                        </p>
                      </motion.div>
                      <p className='text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-end gap-1 mt-0.5'>
                        <Sparkles className='h-2.5 w-2.5' />
                        {t('similarityLabel')}
                      </p>
                    </div>

                    {/* Progress bar */}
                    <div className='absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 overflow-hidden rounded-b-xl'>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${attempt.similarity * 100}%` }}
                        transition={{ delay: index * 0.05 + 0.2, duration: 0.8, ease: 'easeOut' }}
                        className={`h-full relative ${
                          attempt.similarity >= 0.9
                            ? 'bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500'
                            : attempt.similarity >= 0.7
                            ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600'
                            : attempt.similarity >= 0.5
                            ? 'bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600'
                            : attempt.similarity >= 0.3
                            ? 'bg-gradient-to-r from-gray-400 to-gray-500'
                            : 'bg-gradient-to-r from-gray-500 to-gray-600'
                        }`}
                      >
                        <motion.div
                          className='absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent'
                          animate={{
                            x: ['-100%', '200%'],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'linear',
                            delay: index * 0.1,
                          }}
                          style={{ width: '50%' }}
                        />
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
