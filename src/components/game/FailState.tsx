'use client'

import { motion } from 'framer-motion'
import NextChallengeCountdown from '@/components/NextChallengeCountdown'
import { useTranslations } from 'next-intl'

interface FailStateProps {
  locale: string
}

export default function FailState({ locale }: FailStateProps) {
  const t = useTranslations('game')
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className='text-center py-12'
    >
      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className='text-8xl mb-6'>
        😔
      </motion.div>
      <p className='text-3xl font-bold text-gray-600'>{t('failed')}</p>
      <NextChallengeCountdown locale={locale} />
    </motion.div>
  )
}
