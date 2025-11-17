'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft } from 'lucide-react'

interface SemanticExplanationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function SemanticExplanationDialog({ open, onOpenChange }: SemanticExplanationDialogProps) {
  const t = useTranslations('semanticExplanation')
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    // Slide 1: Intro
    {
      content: (
        <div className='flex flex-col items-center justify-center h-full space-y-4 sm:space-y-8 p-4 sm:p-8'>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className='text-6xl sm:text-8xl md:text-9xl'
          >
            🧠
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className='text-base sm:text-lg md:text-xl text-center text-muted-foreground px-4'
          >
            {t('slide1Intro')}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='text-2xl sm:text-3xl md:text-4xl font-black text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent px-4'
          >
            {t('slide1Title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className='text-lg sm:text-xl md:text-2xl text-center text-muted-foreground px-4'
          >
            {t('slide1Subtitle')}
          </motion.p>
        </div>
      ),
    },
    // Slide 2: High Similarity Example
    {
      content: (
        <div className='flex flex-col items-center justify-center h-full space-y-3 sm:space-y-6 p-4 sm:p-8'>
          <div className='flex items-center gap-3 sm:gap-6 md:gap-8'>
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className='flex flex-col items-center gap-1 sm:gap-2'
            >
              <span className='text-5xl sm:text-7xl md:text-8xl'>🐕</span>
              <span className='text-sm sm:text-lg md:text-xl font-bold'>{t('word1')}</span>
            </motion.div>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
              className='text-2xl sm:text-3xl md:text-4xl'
            >
              ↔️
            </motion.span>
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className='flex flex-col items-center gap-1 sm:gap-2'
            >
              <span className='text-5xl sm:text-7xl md:text-8xl'>🐈</span>
              <span className='text-sm sm:text-lg md:text-xl font-bold'>{t('word2')}</span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className='w-full max-w-[280px] sm:max-w-md px-4'
          >
            <div className='relative h-12 sm:h-16 bg-gradient-to-r from-gray-200 to-gray-200 dark:from-gray-800 dark:to-gray-800 rounded-full overflow-hidden'>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '85%' }}
                transition={{ duration: 1.2, delay: 1 }}
                className='h-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center'
              >
                <span className='text-lg sm:text-2xl font-black text-white'>85%</span>
              </motion.div>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className='text-base sm:text-xl md:text-2xl font-bold text-center text-green-600 dark:text-green-400 px-4'
          >
            {t('slide2Text')}
          </motion.p>
        </div>
      ),
    },
    // Slide 3: Low Similarity Example
    {
      content: (
        <div className='flex flex-col items-center justify-center h-full space-y-3 sm:space-y-6 p-4 sm:p-8'>
          <div className='flex items-center gap-3 sm:gap-6 md:gap-8'>
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className='flex flex-col items-center gap-1 sm:gap-2'
            >
              <span className='text-5xl sm:text-7xl md:text-8xl'>🐕</span>
              <span className='text-sm sm:text-lg md:text-xl font-bold'>{t('word1')}</span>
            </motion.div>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
              className='text-2xl sm:text-3xl md:text-4xl'
            >
              ↔️
            </motion.span>
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className='flex flex-col items-center gap-1 sm:gap-2'
            >
              <span className='text-5xl sm:text-7xl md:text-8xl'>🚗</span>
              <span className='text-sm sm:text-lg md:text-xl font-bold'>{t('word3')}</span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className='w-full max-w-[280px] sm:max-w-md px-4'
          >
            <div className='relative h-12 sm:h-16 bg-gradient-to-r from-gray-200 to-gray-200 dark:from-gray-800 dark:to-gray-800 rounded-full overflow-hidden'>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '15%' }}
                transition={{ duration: 1.2, delay: 1 }}
                className='h-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center'
              >
                <span className='text-base sm:text-xl font-black text-white'>15%</span>
              </motion.div>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className='text-base sm:text-xl md:text-2xl font-bold text-center text-red-600 dark:text-red-400 px-4'
          >
            {t('slide3Text')}
          </motion.p>
        </div>
      ),
    },
    // Slide 4: Very High Similarity Example
    {
      content: (
        <div className='flex flex-col items-center justify-center h-full space-y-3 sm:space-y-6 p-4 sm:p-8'>
          <div className='flex items-center gap-3 sm:gap-6 md:gap-8'>
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className='flex flex-col items-center gap-1 sm:gap-2'
            >
              <span className='text-5xl sm:text-7xl md:text-8xl'>🐕</span>
              <span className='text-sm sm:text-lg md:text-xl font-bold'>{t('word1')}</span>
            </motion.div>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
              className='text-2xl sm:text-3xl md:text-4xl'
            >
              ↔️
            </motion.span>
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className='flex flex-col items-center gap-1 sm:gap-2'
            >
              <span className='text-5xl sm:text-7xl md:text-8xl'>🦁</span>
              <span className='text-sm sm:text-lg md:text-xl font-bold'>{t('word4')}</span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className='w-full max-w-[280px] sm:max-w-md px-4'
          >
            <div className='relative h-12 sm:h-16 bg-gradient-to-r from-gray-200 to-gray-200 dark:from-gray-800 dark:to-gray-800 rounded-full overflow-hidden'>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '95%' }}
                transition={{ duration: 1.2, delay: 1 }}
                className='h-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center'
              >
                <span className='text-lg sm:text-2xl font-black text-white'>95%</span>
              </motion.div>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className='text-base sm:text-xl md:text-2xl font-bold text-center text-purple-600 dark:text-purple-400 px-4'
          >
            {t('slide4Text')}
          </motion.p>
        </div>
      ),
    },
    // Slide 5: Final Tip
    {
      content: (
        <div className='flex flex-col items-center justify-center h-full space-y-4 sm:space-y-8 p-4 sm:p-8'>
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className='text-6xl sm:text-8xl md:text-9xl'
          >
            💡
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className='text-xl sm:text-2xl md:text-3xl font-black text-center px-4'
          >
            {t('slide5Title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className='text-base sm:text-lg md:text-xl text-center max-w-[280px] sm:max-w-md text-muted-foreground px-4'
          >
            {t('slide5Text')}
          </motion.p>
        </div>
      ),
    },
  ]

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      onOpenChange(false)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const handleClose = () => {
    setCurrentSlide(0)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='max-w-[95vw] sm:max-w-[90vw] md:max-w-[700px] h-[80vh] sm:h-[70vh] md:h-[500px] max-h-[600px] p-0 overflow-hidden'>
        <div className='relative w-full h-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900'>
          {/* Slide Content */}
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className='w-full h-full'
            >
              {slides[currentSlide].content}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className='absolute bottom-0 left-0 right-0 p-3 sm:p-6 bg-gradient-to-t from-white/80 to-transparent dark:from-gray-900/80 backdrop-blur-sm'>
            <div className='flex items-center justify-between gap-2'>
              <Button
                variant='ghost'
                size='sm'
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className='gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4'
              >
                <ChevronLeft className='w-4 h-4 sm:w-5 sm:h-5' />
                <span className='hidden sm:inline'>{t('previous')}</span>
              </Button>

              {/* Dots Indicator */}
              <div className='flex gap-1.5 sm:gap-2'>
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all ${
                      index === currentSlide ? 'bg-purple-600 w-6 sm:w-8' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              <Button
                size='sm'
                onClick={nextSlide}
                className='gap-1 sm:gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-xs sm:text-sm px-2 sm:px-4'
              >
                <span className='hidden sm:inline'>{currentSlide === slides.length - 1 ? t('gotIt') : t('next')}</span>
                <span className='sm:hidden'>{currentSlide === slides.length - 1 ? '✓' : '→'}</span>
                {currentSlide < slides.length - 1 && <ChevronRight className='w-4 h-4 sm:w-5 sm:h-5 hidden sm:inline' />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
