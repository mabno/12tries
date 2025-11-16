'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface LoadingStateProps {}

export default function LoadingState() {
  const t = useTranslations('game')
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Card className='relative overflow-hidden border-2 border-primary/20 shadow-2xl'>
        <div className='absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-purple-500/5' />
        <CardContent className='relative pt-12 pb-12'>
          <div className='text-center'>
            <div className='relative inline-flex items-center justify-center mb-6'>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className='absolute'>
                <div className='w-20 h-20 rounded-full border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400' />
              </motion.div>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sparkles className='h-12 w-12 text-purple-500' />
              </motion.div>
            </div>
            <motion.p
              className='text-lg font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent'
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {t('loading')}
            </motion.p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
