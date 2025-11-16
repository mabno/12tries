'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import Game from '@/components/Game'
import { Particles } from '@/components/ui/particles'
import RecentAttempts from '@/components/RecentAttempts'

export default function HomeClient({ locale }: { locale: string }) {
  const t = useTranslations('app')
  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 relative overflow-hidden'>
      {/* Background particles */}
      <div className='fixed inset-0 pointer-events-none'>
        <Particles className='h-full' size={0.4} quantity={300} color='#a855f7' />
      </div>

      {/* Main content */}
      <main className='container mx-auto px-4 py-8 md:py-12 max-w-4xl relative z-10'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className='mb-12 text-center'
        >
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className='text-4xl md:text-6xl font-black mb-4 pb-2 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent'
          >
            <motion.span
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{
                backgroundSize: '200% auto',
              }}
            >
              {t('pageTitle')}
            </motion.span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className='text-lg md:text-xl  flex items-center justify-center gap-2'
          >
            <Sparkles className='h-5 w-5 text-purple-500' />
            {t('subtitle')}
            <Sparkles className='h-5 w-5 text-pink-500' />
          </motion.p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Game locale={locale} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <RecentAttempts />
        </motion.div>
      </main>
    </div>
  )
}
