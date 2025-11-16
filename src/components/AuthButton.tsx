'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { motion } from 'framer-motion'
import { LogIn, LogOut, Loader2 } from 'lucide-react'

export default function AuthButton() {
  const { data: session, status } = useSession()
  const t = useTranslations('auth')

  if (status === 'loading') {
    return (
      <Button variant='ghost' disabled className='gap-2 w-full sm:w-auto'>
        <Loader2 className='h-4 w-4 animate-spin' />
        <span className='hidden sm:inline'>...</span>
      </Button>
    )
  }

  if (session) {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className='flex items-center gap-3 w-full sm:w-auto'>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Avatar className='h-9 w-9 border-2 border-purple-400 shadow-lg'>
            {session.user?.image && <img src={session.user.image} alt={session.user.name || ''} className='rounded-full' />}
          </Avatar>
        </motion.div>
        <span className='text-sm font-semibold hidden sm:inline bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
          {session.user?.name}
        </span>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className='flex-1 sm:flex-none'>
          <Button
            variant='outline'
            onClick={() => signOut()}
            className='gap-2 border-2 hover:border-purple-400 transition-colors w-full sm:w-auto'
          >
            <LogOut className='h-4 w-4' />
            <span className='hidden sm:inline'>{t('signOut')}</span>
          </Button>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className='w-full sm:w-auto'>
      <Button
        onClick={() => signIn('google')}
        className='gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto'
      >
        <LogIn className='h-4 w-4' />
        {t('signIn')}
      </Button>
    </motion.div>
  )
}
