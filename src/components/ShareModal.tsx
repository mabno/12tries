'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Copy, Check, MessageCircle, Send } from 'lucide-react'
import { FaWhatsapp, FaFacebook, FaTelegram, FaLinkedin, FaReddit } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ShareModal({ isOpen, onClose }: ShareModalProps) {
  const t = useTranslations('share')
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://12tries.com'
  const shareText = '¡Desafía tu vocabulario con 12Tries! Adivina la palabra del día usando similitud semántica con IA. 🎯'

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      color: 'bg-green-500 hover:bg-green-600',
      url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
    },
    {
      name: 'Twitter',
      icon: FaXTwitter,
      color: 'bg-black hover:bg-gray-800',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Facebook',
      icon: FaFacebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Telegram',
      icon: FaTelegram,
      color: 'bg-sky-500 hover:bg-sky-600',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Reddit',
      icon: FaReddit,
      color: 'bg-orange-600 hover:bg-orange-700',
      url: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`,
    },
  ]

  const handleShare = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
            {t('title')}
          </DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Copy Link Button */}
          <div className='flex items-center gap-2'>
            <input
              type='text'
              value={shareUrl}
              readOnly
              className='flex-1 px-3 py-2 text-sm border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
            />
            <Button onClick={handleCopyLink} variant='outline' size='icon' className='shrink-0'>
              {copied ? <Check className='h-4 w-4 text-green-600' /> : <Copy className='h-4 w-4' />}
            </Button>
          </div>

          {copied && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className='text-sm text-green-600 dark:text-green-400 text-center'
            >
              {t('linkCopied')}
            </motion.p>
          )}

          {/* Share Options */}
          <div className='space-y-2'>
            <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>{t('shareOn')}:</p>
            <div className='grid grid-cols-2 gap-2'>
              {shareOptions.map((option) => {
                const IconComponent = option.icon
                return (
                  <motion.button
                    key={option.name}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleShare(option.url)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg text-white font-medium transition-colors ${option.color}`}
                  >
                    <IconComponent className='w-5 h-5' />
                    <span className='text-sm'>{option.name}</span>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
