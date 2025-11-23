'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check, ExternalLink, Code2, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function EmbedInfoClient({ locale }: { locale: string }) {
  const t = useTranslations('embedInfo')
  const [copied, setCopied] = useState(false)
  const [selectedLang, setSelectedLang] = useState<'en' | 'es'>(locale as 'en' | 'es')

  const embedCode = `<iframe 
  src="${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/embed?lang=${selectedLang}" 
  width="100%" 
  height="800" 
  frameborder="0"
  title="Guess the Word Game"
  allow="clipboard-write"
></iframe>`

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20'>
      <div className='container mx-auto px-4 py-12 max-w-4xl'>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='text-center mb-12'>
          <div className='inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-full mb-4'>
            <Code2 className='h-5 w-5 text-purple-600 dark:text-purple-400' />
            <span className='text-sm font-semibold text-purple-900 dark:text-purple-100'>Embed Feature</span>
          </div>

          <h1 className='text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight md:leading-tight pb-1'>
            {t('title')}
          </h1>

          <p className='text-lg text-gray-600 dark:text-gray-300'>{t('subtitle')}</p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='grid md:grid-cols-3 gap-4 mb-12'
        >
          <Card>
            <CardHeader>
              <CardTitle className='text-lg flex items-center gap-2'>
                <Sparkles className='h-5 w-5 text-purple-500' />
                {t('feature1Title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-gray-600 dark:text-gray-300'>{t('feature1Text')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-lg flex items-center gap-2'>
                <Sparkles className='h-5 w-5 text-pink-500' />
                {t('feature2Title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-gray-600 dark:text-gray-300'>{t('feature2Text')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-lg flex items-center gap-2'>
                <Sparkles className='h-5 w-5 text-blue-500' />
                {t('feature3Title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-gray-600 dark:text-gray-300'>{t('feature3Text')}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Code Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className='mb-8'>
            <CardHeader>
              <CardTitle>{t('embedCodeTitle')}</CardTitle>
              <CardDescription>{t('embedCodeDesc')}</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Language Selector */}
              <div className='flex gap-2 justify-center'>
                <Button
                  onClick={() => setSelectedLang('en')}
                  size='sm'
                  variant={selectedLang === 'en' ? 'default' : 'outline'}
                  className='gap-2'
                >
                  <img src='/flags/us.svg' alt='English' className='h-4 w-5 rounded' />
                  {t('english')}
                </Button>
                <Button
                  onClick={() => setSelectedLang('es')}
                  size='sm'
                  variant={selectedLang === 'es' ? 'default' : 'outline'}
                  className='gap-2'
                >
                  <img src='/flags/es.svg' alt='Español' className='h-4 w-5 rounded' />
                  {t('spanish')}
                </Button>
              </div>

              <div className='relative'>
                <pre className='bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm'>
                  <code>{embedCode}</code>
                </pre>
                <Button onClick={handleCopy} size='sm' className='absolute top-2 right-2' variant='secondary'>
                  {copied ? (
                    <>
                      <Check className='h-4 w-4 mr-2' />
                      {t('copied')}
                    </>
                  ) : (
                    <>
                      <Copy className='h-4 w-4 mr-2' />
                      {t('copy')}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className='mb-8'>
            <CardHeader>
              <CardTitle>{t('livePreviewTitle')}</CardTitle>
              <CardDescription>{t('livePreviewDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='border-4 border-dashed border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden'>
                <iframe
                  src={`/embed?lang=${selectedLang}`}
                  className='w-full h-[600px]'
                  title='Embed Preview'
                  allow='clipboard-write'
                  key={selectedLang}
                />
              </div>
            </CardContent>
          </Card>

          {/* Documentation Links */}
          <Card>
            <CardHeader>
              <CardTitle>{t('docsTitle')}</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                <div>
                  <p className='font-semibold'>{t('testEmbedTitle')}</p>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>{t('testEmbedDesc')}</p>
                </div>
                <Button variant='outline' size='sm' asChild>
                  <Link href={`/embed?lang=${selectedLang}`} target='_blank'>
                    <ExternalLink className='h-4 w-4 mr-2' />
                    {t('openEmbed')}
                  </Link>
                </Button>
              </div>

              <div className='p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
                <p className='text-sm text-blue-900 dark:text-blue-100'>
                  <strong>{t('noteTitle')}</strong> {t('noteText')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Back Button */}
          <div className='mt-8 text-center'>
            <Button asChild variant='outline' size='lg'>
              <Link href={`/${locale}`}>← {t('backToGame')}</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
