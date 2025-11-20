'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'

export default function PrivacyPage() {
  const t = useTranslations('privacy')

  return (
    <div className='container mx-auto px-4 py-12 max-w-4xl'>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className='text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>{t('title')}</h1>

        <div className='prose prose-lg dark:prose-invert max-w-none'>
          <section className='mb-8'>
            <h2 className='text-2xl font-semibold mb-4'>{t('section1.title')}</h2>
            <p className='text-gray-700 dark:text-gray-300 mb-4'>{t('section1.content')}</p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold mb-4'>{t('section2.title')}</h2>
            <p className='text-gray-700 dark:text-gray-300 mb-4'>{t('section2.content')}</p>
            <ul className='list-disc pl-6 space-y-2'>
              <li className='text-gray-700 dark:text-gray-300'>{t('section2.item1')}</li>
              <li className='text-gray-700 dark:text-gray-300'>{t('section2.item2')}</li>
              <li className='text-gray-700 dark:text-gray-300'>{t('section2.item3')}</li>
              <li className='text-gray-700 dark:text-gray-300'>{t('section2.item4')}</li>
            </ul>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold mb-4'>{t('section3.title')}</h2>
            <p className='text-gray-700 dark:text-gray-300 mb-4'>{t('section3.content')}</p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold mb-4'>{t('section4.title')}</h2>
            <p className='text-gray-700 dark:text-gray-300 mb-4'>{t('section4.content')}</p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold mb-4'>{t('section5.title')}</h2>
            <p className='text-gray-700 dark:text-gray-300 mb-4'>{t('section5.content')}</p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold mb-4'>{t('section6.title')}</h2>
            <p className='text-gray-700 dark:text-gray-300 mb-4'>{t('section6.content')}</p>
          </section>

          <section className='mb-8'>
            <p className='text-sm text-gray-600 dark:text-gray-400'>{t('lastUpdated')}</p>
          </section>
        </div>
      </motion.div>
    </div>
  )
}
