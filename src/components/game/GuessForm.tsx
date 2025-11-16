'use client'

import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { CoolMode } from '@/components/ui/cool-mode'
import { Send } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface GuessFormProps {
  guess: string
  loading: boolean
  shake: boolean
  onGuessChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
}

export default function GuessForm({ guess, loading, shake, onGuessChange, onSubmit }: GuessFormProps) {
  const t = useTranslations('game')

  return (
    <motion.form
      onSubmit={onSubmit}
      className='space-y-4'
      animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      <div className='flex gap-2 flex-col md:flex-row'>
        <motion.div className='flex-1' whileFocus={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Input
            type='text'
            placeholder={t('placeholder')}
            value={guess}
            onChange={(e) => onGuessChange(e.target.value)}
            className='h-14 text-lg font-medium border-2 transition-all focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/20'
            disabled={loading}
            autoFocus
          />
        </motion.div>

        <CoolMode>
          <RainbowButton type='submit' disabled={loading || !guess.trim()} size='lg' className='h-14 px-8 text-lg font-bold w-full'>
            {loading ? (
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                ⚡
              </motion.span>
            ) : (
              <div className='flex items-center'>
                <Send className='h-5 w-5 mr-2' />
                {t('submit')}
              </div>
            )}
          </RainbowButton>
        </CoolMode>
      </div>
    </motion.form>
  )
}
