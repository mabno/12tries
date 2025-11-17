'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Sparkles, Heart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface RockyPopupProps {
  isVisible: boolean
  onAccept: () => void
  onDecline: () => void
}

export default function RockyPopup({ isVisible, onAccept, onDecline }: RockyPopupProps) {
  const t = useTranslations('rocky')
  const [mounted, setMounted] = useState(false)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; rotation: number }>>([])

  // Wait for component to mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Generate random particles when visible
  useEffect(() => {
    if (isVisible) {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        rotation: Math.random() * 360,
      }))
      setParticles(newParticles)
    }
  }, [isVisible])

  // Block body scroll when popup is visible
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
  }, [isVisible])

  if (!mounted) return null

  const popupContent = (
    <AnimatePresence mode='wait'>
      {isVisible && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            key='backdrop'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onDecline}
            className='fixed inset-0 bg-black/80 backdrop-blur-md overflow-hidden cursor-pointer'
            style={{
              zIndex: 9999,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              position: 'fixed',
            }}
          />

          {/* Floating particles */}
          {particles.map((particle) => (
            <motion.div
              key={`particle-${particle.id}`}
              initial={{
                x: 0,
                y: 0,
                opacity: 0,
                scale: 0,
              }}
              animate={{
                x: particle.x * 8,
                y: particle.y * 8,
                opacity: [0, 1, 0.8, 0],
                scale: [0, 1, 1.5, 0],
                rotate: [0, particle.rotation, particle.rotation * 2],
              }}
              transition={{
                duration: 2,
                ease: 'easeOut',
                times: [0, 0.2, 0.8, 1],
              }}
              className='text-yellow-400'
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                zIndex: 10001,
                pointerEvents: 'none',
              }}
            >
              ✨
            </motion.div>
          ))}

          {/* Main popup container */}
          <motion.div
            key='popup'
            initial={{
              opacity: 0,
              scale: 0,
              rotateY: -180,
              x: '-50%',
              y: '-50%',
            }}
            animate={{
              opacity: 1,
              scale: 1,
              rotateY: 0,
              x: '-50%',
              y: '-50%',
            }}
            exit={{
              opacity: 0,
              scale: 0.5,
              rotateY: 180,
              x: '-50%',
              y: '-50%',
              transition: {
                duration: 0.4,
                ease: [0.43, 0.13, 0.23, 0.96],
              },
            }}
            transition={{
              duration: 0.6,
              ease: [0.34, 1.56, 0.64, 1],
              type: 'spring',
              stiffness: 100,
              damping: 15,
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              zIndex: 10000,
              width: '90vw',
              maxWidth: '28rem',
              perspective: '2000px',
            }}
          >
            {/* Pulsing glow rings */}
            <motion.div
              className='absolute inset-0 rounded-3xl'
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                boxShadow: '0 0 60px 20px rgba(168, 85, 247, 0.6), 0 0 100px 40px rgba(236, 72, 153, 0.6)',
              }}
            />

            {/* Main card */}
            <div className='relative bg-white dark:bg-gray-900 rounded-3xl border-4 border-purple-500 shadow-2xl overflow-hidden'>
              {/* Color gradient overlay */}
              <div className='absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-yellow-500/20 dark:from-purple-500/30 dark:via-pink-500/30 dark:to-yellow-500/30' />

              {/* Animated gradient background */}
              <motion.div
                className='absolute inset-0'
                animate={{
                  background: [
                    'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                    'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                    'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />

              {/* Content */}
              <div className='relative p-4 sm:p-6 md:p-8 space-y-6'>
                {/* Rocky Character with bounce animation */}
                <motion.div
                  animate={{
                    y: [0, -15, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className='flex justify-center -mt-4'
                >
                  <div className='relative w-48 h-48 sm:w-56 sm:h-56'>
                    {/* Glow effect behind Rocky */}
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                      className='absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-400 rounded-full blur-3xl'
                    />
                    {/* Rocky Image */}
                    <div className='relative w-full h-full'>
                      <img
                        src='/rockycaricatura-removebg-preview.png'
                        alt='Rocky the mascot'
                        className='scale-150 w-full h-full object-contain drop-shadow-2xl'
                      />
                    </div>
                    {/* Floating hearts */}
                    <motion.div
                      animate={{
                        y: [-10, -50],
                        x: [0, 15],
                        opacity: [1, 0],
                        scale: [0.5, 1.3],
                        rotate: [0, 20],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 0.3,
                      }}
                      className='absolute -top-2 -right-2 text-3xl'
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                    >
                      ❤️
                    </motion.div>
                    <motion.div
                      animate={{
                        y: [-10, -50],
                        x: [0, -15],
                        opacity: [1, 0],
                        scale: [0.5, 1.3],
                        rotate: [0, -20],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 0.3,
                        delay: 0.6,
                      }}
                      className='absolute -top-2 -left-2 text-3xl'
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                    >
                      ✨
                    </motion.div>
                    <motion.div
                      animate={{
                        y: [-10, -50],
                        x: [0, 0],
                        opacity: [1, 0],
                        scale: [0.5, 1.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 0.3,
                        delay: 1.2,
                      }}
                      className='absolute -top-2 left-1/2 -translate-x-1/2 text-3xl'
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                    >
                      🍀
                    </motion.div>
                  </div>
                </motion.div>

                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className='text-center space-y-2'
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  >
                    <h2 className='text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent'>
                      {t('title')}
                    </h2>
                  </motion.div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    <p className='text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-medium'>{t('message')}</p>
                  </motion.div>
                </motion.div>

                {/* Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className='flex flex-col sm:flex-row gap-2 sm:gap-3'
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className='flex-1 min-w-0'>
                    <Button
                      onClick={onAccept}
                      className='w-full h-12 sm:h-13 text-sm sm:text-base font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-1 sm:px-3'
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                        }}
                        className='flex items-center justify-center gap-1 sm:gap-2 w-full'
                      >
                        <Sparkles className='w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0' />
                        <span className='truncate text-xs sm:text-sm md:text-base font-extrabold'>{t('accept')}</span>
                        <Heart className='w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0' />
                      </motion.div>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className='flex-1 min-w-0'>
                    <Button
                      onClick={onDecline}
                      variant='outline'
                      className='w-full h-12 sm:h-13 text-sm sm:text-base font-semibold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-800 px-1 sm:px-3'
                    >
                      <span className='truncate text-xs sm:text-sm md:text-base'>{t('decline')}</span>
                    </Button>
                  </motion.div>
                </motion.div>

                {/* Fun fact */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className='text-center pt-2 border-t border-purple-200 dark:border-purple-800'
                >
                  <motion.p
                    animate={{
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                    }}
                    className='text-sm text-gray-600 dark:text-gray-400 italic font-medium'
                  >
                    🐾 {t('believes')} 🍀
                  </motion.p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return createPortal(popupContent, document.body)
}
