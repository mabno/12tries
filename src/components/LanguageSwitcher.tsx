'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Languages } from 'lucide-react'

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLanguage = () => {
    const newLocale = locale === 'en' ? 'es' : 'en'
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPathname)
  }

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        variant='ghost'
        onClick={switchLanguage}
        className='gap-2 font-bold hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-all border-2 border-transparent hover:border-purple-300'
      >
        <motion.div transition={{ type: 'spring', stiffness: 200 }}>
          <img
            src={locale === 'es' ? '/flags/es.svg' : '/flags/us.svg'}
            alt={locale === 'es' ? 'Español' : 'English'}
            className='h-4 w-5 rounded shadow-sm border border-gray-300 dark:border-gray-700'
          />
        </motion.div>
        <span className='text-lg'>{locale === 'es' ? 'ES' : 'EN'}</span>
      </Button>
    </motion.div>
  )
}
