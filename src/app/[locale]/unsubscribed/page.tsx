'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function UnsubscribedPage() {
  const t = useTranslations('reminders')

  return (
    <div className='container mx-auto px-4 py-12 max-w-2xl'>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className='text-center'>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className='text-6xl mb-6'
        >
          ✅
        </motion.div>

        <h1 className='text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
          {t('unsubscribed.title')}
        </h1>

        <p className='text-lg text-gray-700 dark:text-gray-300 mb-8'>{t('unsubscribed.message')}</p>

        <p className='text-gray-600 dark:text-gray-400 mb-8'>{t('unsubscribed.comeback')}</p>

        <Link href='/'>
          <Button className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'>
            {t('unsubscribed.backToGame')}
          </Button>
        </Link>
      </motion.div>
    </div>
  )
}
