'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Share2 } from 'lucide-react'
import ShareModal from './ShareModal'

export default function ShareButton() {
  const t = useTranslations('share')
  const [showShareModal, setShowShareModal] = useState(false)

  return (
    <>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className='w-full sm:w-auto'>
        <Button
          onClick={() => setShowShareModal(true)}
          className='gap-2 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto'
          aria-label={t('button')}
        >
          <Share2 className='h-4 w-4' />
          <span>{t('button')}</span>
        </Button>
      </motion.div>

      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
    </>
  )
}
