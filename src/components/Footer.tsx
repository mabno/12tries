'use client'
import { motion } from 'framer-motion'
import { Twitter } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

export default function Footer() {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  const t = useTranslations('footer')

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
      className='border-t-2 border-purple-200/50 py-8 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md relative z-10'
    >
      <div className='container mx-auto px-4'>
        <div className='flex flex-col items-center gap-4'>
          <motion.p whileHover={{ scale: 1.05 }} className='text-sm text-muted-foreground flex items-center gap-2'>
            {t('madeWith')}{' '}
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className='inline-block text-red-500'
            >
              ❤️
            </motion.span>
          </motion.p>

          <div className='flex items-center gap-4 text-sm text-muted-foreground'>
            <Link
              href={`/${locale}/terms`}
              className='hover:text-purple-600 dark:hover:text-purple-400 transition-colors underline-offset-4 hover:underline'
            >
              {t('terms')}
            </Link>
            <span className='text-gray-300 dark:text-gray-700'>•</span>
            <Link
              href={`/${locale}/privacy`}
              className='hover:text-purple-600 dark:hover:text-purple-400 transition-colors underline-offset-4 hover:underline'
            >
              {t('privacy')}
            </Link>
            <span className='text-gray-300 dark:text-gray-700'>•</span>
            <Link
              href={`/${locale}/embed-info`}
              className='hover:text-purple-600 dark:hover:text-purple-400 transition-colors underline-offset-4 hover:underline'
            >
              {t('embed')}
            </Link>
          </div>

          <motion.a
            href='https://x.com/Mabno5'
            target='_blank'
            rel='noopener noreferrer'
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className='flex items-center gap-2 text-sm text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors'
          >
            <Twitter className='h-4 w-4' />
            <span>@Mabno5</span>
          </motion.a>
        </div>
      </div>
    </motion.footer>
  )
}
