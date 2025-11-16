'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Trophy, HelpCircle, Menu, X } from 'lucide-react'
import AuthButton from '@/components/AuthButton'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import ShareButton from '@/components/ShareButton'

export default function Header({ locale }: { locale: string }) {
  const t = useTranslations('navigation')
  const tApp = useTranslations('app')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigationLinks = [
    { href: `/${locale}`, icon: Home, label: t('home') },
    { href: `/${locale}/leaderboard`, icon: Trophy, label: t('leaderboard') },
    { href: `/${locale}/how-to-play`, icon: HelpCircle, label: t('howToPlay') },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
      className='border-b-2 border-purple-200/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 shadow-lg'
    >
      <div className='container mx-auto px-4 py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex gap-6'>
            {/* Logo */}
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link href={`/${locale}`} className='flex items-center gap-2 sm:gap-3'>
                <motion.div
                  animate={{
                    rotate: [0, 5, -5, 5, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className='relative w-8 h-8 sm:w-10 sm:h-10'
                >
                  <Image src='/logo.svg' alt='Guess the Word Logo' fill className='object-contain' priority />
                </motion.div>
                <h1 className='text-xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent hidden sm:block'>
                  {tApp('title')}
                </h1>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className='hidden md:flex items-center gap-2'>
              {navigationLinks.map((link) => {
                const Icon = link.icon
                return (
                  <motion.div key={link.href} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href={link.href}>
                      <Button variant='ghost' className='gap-2 hover:bg-purple-100 dark:hover:bg-purple-900/30'>
                        <Icon className='h-4 w-4' />
                        <span>{link.label}</span>
                      </Button>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </div>
          {/* Right side: Share + Language + Auth + Mobile Menu */}
          <div className='flex items-center gap-2'>
            <div className='hidden sm:flex items-center gap-2'>
              <LanguageSwitcher />
              <ShareButton />
              <AuthButton />
            </div>

            {/* Mobile menu button */}
            <Button
              variant='ghost'
              size='icon'
              className='md:hidden hover:bg-purple-100 dark:hover:bg-purple-900/30'
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className='md:hidden overflow-hidden'
            >
              <div className='py-4 space-y-2 border-t border-purple-200/50 mt-4'>
                {navigationLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant='ghost' className='w-full justify-start gap-2 hover:bg-purple-100 dark:hover:bg-purple-900/30'>
                        <Icon className='h-4 w-4' />
                        {link.label}
                      </Button>
                    </Link>
                  )
                })}

                {/* Mobile Share + Language + Auth */}
                <div className='sm:hidden flex flex-col gap-2 pt-2 border-t border-purple-200/50'>
                  <div className='flex items-center justify-between px-3'>
                    <span className='text-sm text-gray-600 dark:text-gray-400'>{t('language') || 'Language'}</span>
                    <LanguageSwitcher />
                  </div>
                  <div className='flex items-center justify-between'>
                    <ShareButton />
                  </div>

                  <div className='w-full'>
                    <AuthButton />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}
