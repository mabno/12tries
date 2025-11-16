'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { validateNickname } from '@/lib/profanity-filter'
import { User, Sparkles } from 'lucide-react'

interface NicknameModalProps {
  isOpen: boolean
  onSave: (nickname: string) => void
  onClose?: () => void
}

export default function NicknameModal({ isOpen, onSave, onClose }: NicknameModalProps) {
  const t = useTranslations('game.nickname')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')

  const handleSave = async () => {
    const validation = await validateNickname(nickname)

    if (!validation.isValid) {
      setError(validation.error || 'Invalid nickname')
      return
    }

    onSave(nickname.trim())
    setNickname('')
    setError('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && onClose) {
      setNickname('')
      setError('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <div className='flex justify-center mb-4'>
            <div className='p-3 bg-primary/10 rounded-full'>
              <User className='w-8 h-8 text-primary' />
            </div>
          </div>
          <DialogTitle className='text-2xl flex items-center justify-center gap-2'>
            <Sparkles className='w-5 h-5 text-yellow-500' />
            {t('title')}
            <Sparkles className='w-5 h-5 text-yellow-500' />
          </DialogTitle>
          <DialogDescription className='text-base mt-2 text-center'>{t('description')}</DialogDescription>
        </DialogHeader>
        <div className='space-y-4 mt-4'>
          <div className='space-y-2'>
            <Input
              type='text'
              placeholder={t('placeholder')}
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value)
                setError('')
              }}
              onKeyPress={handleKeyPress}
              maxLength={20}
              className='text-center text-lg'
              autoFocus
            />
            {error && <p className='text-sm text-red-500 text-center animate-in fade-in slide-in-from-top-1'>{error}</p>}
          </div>
          <Button onClick={handleSave} className='w-full' size='lg'>
            {t('save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
