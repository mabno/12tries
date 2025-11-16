'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Share2, X } from 'lucide-react'
import ShareModal from './ShareModal'

interface ShareSuggestionPopupProps {
  show: boolean
  onDismiss: () => void
}

export default function ShareSuggestionPopup({ show, onDismiss }: ShareSuggestionPopupProps) {
  const t = useTranslations('share.suggestion')
  const [showShareModal, setShowShareModal] = useState(false)

  const handleShare = () => {
    setShowShareModal(true)
  }

  const handleDismiss = () => {
    onDismiss()
  }

  return (
    <>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            className='fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4'
          >
            <Card className='border-2 border-purple-300 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-2xl w-full max-w-md'>
              <CardContent className='p-4'>
                <div className='flex items-start gap-3'>
                  <div className='flex-1 space-y-2'>
                    <div className='flex items-center gap-2'>
                      <span className='text-2xl'>🎉</span>
                      <h3 className='font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
                        {t('title')}
                      </h3>
                    </div>
                    <p className='text-sm text-gray-600 dark:text-gray-300'>{t('message')}</p>
                    <div className='flex gap-2 pt-2'>
                      <Button
                        onClick={handleShare}
                        className='flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                        size='sm'
                      >
                        <Share2 className='h-4 w-4 mr-2' />
                        {t('shareButton')}
                      </Button>
                      <Button onClick={handleDismiss} variant='outline' size='sm'>
                        {t('dismiss')}
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={handleDismiss}
                    className='h-8 w-8 shrink-0 hover:bg-gray-100 dark:hover:bg-gray-800'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
    </>
  )
}
