'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Sparkles, Flame, Star, Snowflake } from 'lucide-react'
import { NumberTicker } from '@/components/ui/number-ticker'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface AchievementPopupProps {
  similarity: number | null
  isVisible: boolean
  getFeedbackEmoji: (similarity: number) => string
  getFeedbackText: (similarity: number) => string
}

export default function AchievementPopup({ similarity, isVisible, getFeedbackEmoji, getFeedbackText }: AchievementPopupProps) {
  const t = useTranslations('game')
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; rotation: number; scale: number }>>([])
  const [mounted, setMounted] = useState(false)

  // Wait for component to mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Generate random particles on mount
  useEffect(() => {
    if (isVisible && similarity !== null) {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        rotation: Math.random() * 360,
        scale: Math.random() * 0.5 + 0.5,
      }))
      setParticles(newParticles)
    }
  }, [isVisible, similarity])

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

  if (!mounted || similarity === null) return null

  const getColors = (sim: number) => {
    if (sim >= 0.9) {
      return {
        bg: 'from-orange-500/20 via-red-500/20 to-yellow-500/20',
        bgDark: 'dark:from-orange-500/30 dark:via-red-500/30 dark:to-yellow-500/30',
        border: 'border-orange-500',
        glow: 'rgba(249, 115, 22, 0.6)',
        text: 'text-orange-600 dark:text-orange-400',
        gradient: 'from-orange-600 via-red-600 to-yellow-600',
        icon: <Flame className='w-6 h-6' />,
      }
    }
    if (sim >= 0.7) {
      return {
        bg: 'from-purple-500/20 via-fuchsia-500/20 to-pink-500/20',
        bgDark: 'dark:from-purple-500/30 dark:via-fuchsia-500/30 dark:to-pink-500/30',
        border: 'border-purple-500',
        glow: 'rgba(168, 85, 247, 0.6)',
        text: 'text-purple-600 dark:text-purple-400',
        gradient: 'from-purple-600 via-fuchsia-600 to-pink-600',
        icon: <Sparkles className='w-6 h-6' />,
      }
    }
    if (sim >= 0.5) {
      return {
        bg: 'from-blue-500/20 via-cyan-500/20 to-sky-500/20',
        bgDark: 'dark:from-blue-500/30 dark:via-cyan-500/30 dark:to-sky-500/30',
        border: 'border-blue-500',
        glow: 'rgba(59, 130, 246, 0.6)',
        text: 'text-blue-600 dark:text-blue-400',
        gradient: 'from-blue-600 via-cyan-600 to-sky-600',
        icon: <Star className='w-6 h-6' />,
      }
    }
    return {
      bg: 'from-slate-500/20 via-gray-500/20 to-zinc-500/20',
      bgDark: 'dark:from-slate-500/30 dark:via-gray-500/30 dark:to-zinc-500/30',
      border: 'border-slate-500',
      glow: 'rgba(100, 116, 139, 0.6)',
      text: 'text-slate-600 dark:text-slate-400',
      gradient: 'from-slate-600 via-gray-600 to-zinc-600',
      icon: <Snowflake className='w-6 h-6' />,
    }
  }

  const colors = getColors(similarity)

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
            className='fixed inset-0 bg-black/80 backdrop-blur-md overflow-hidden'
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
                scale: [0, particle.scale, particle.scale * 1.5, 0],
                rotate: [0, particle.rotation, particle.rotation * 2],
              }}
              transition={{
                duration: 2,
                ease: 'easeOut',
                times: [0, 0.2, 0.8, 1],
              }}
              className={colors.text}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                zIndex: 10001,
                pointerEvents: 'none',
              }}
            >
              {colors.icon}
            </motion.div>
          ))}

          {/* Main popup container */}
          <motion.div
            key='popup'
            initial={{
              opacity: 0,
              scale: 0,
              rotateY: -180,
              rotateX: -90,
              x: '-50%',
              y: '-50%',
            }}
            animate={{
              opacity: 1,
              scale: 1,
              rotateY: 0,
              rotateX: 0,
              x: '-50%',
              y: '-50%',
            }}
            exit={{
              opacity: 0,
              scale: 0.5,
              rotateY: 180,
              rotateX: 90,
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
                boxShadow: `0 0 60px 20px ${colors.glow}, 0 0 100px 40px ${colors.glow}`,
              }}
            />

            {/* Main card */}
            <div className={`relative bg-white dark:bg-gray-900 rounded-3xl border-4 ${colors.border} shadow-2xl overflow-hidden`}>
              {/* Color gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} ${colors.bgDark}`} />
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

              {/* Scanning line effect */}
              <motion.div className='absolute inset-0 overflow-hidden' initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <motion.div
                  className='absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent'
                  animate={{
                    y: ['-100%', '400%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  style={{ boxShadow: '0 0 20px 5px rgba(255,255,255,0.5)' }}
                />
              </motion.div>

              {/* Content container */}
              <div className='relative z-10 p-8'>
                {/* Top badge with icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    delay: 0.2,
                    type: 'spring',
                    stiffness: 200,
                    damping: 10,
                  }}
                  className='flex justify-center mb-4'
                >
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      rotate: {
                        duration: 4,
                        repeat: Infinity,
                        ease: 'linear',
                      },
                      scale: {
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      },
                    }}
                    className={`w-20 h-20 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg`}
                    style={{
                      boxShadow: `0 0 30px ${colors.glow}, 0 0 60px ${colors.glow}`,
                    }}
                  >
                    <Trophy className='w-10 h-10 text-white' />
                  </motion.div>
                </motion.div>

                {/* Giant animated emoji */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{
                    scale: 1,
                    rotate: 0,
                  }}
                  transition={{
                    delay: 0.3,
                    type: 'spring',
                    stiffness: 150,
                    damping: 12,
                  }}
                  className='flex justify-center mb-4'
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, -10, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className='text-8xl drop-shadow-2xl'
                    style={{
                      filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.3))',
                    }}
                  >
                    {getFeedbackEmoji(similarity)}
                  </motion.div>
                </motion.div>

                {/* Feedback text */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className='text-center mb-4'
                >
                  <motion.h3
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className={`text-4xl font-black mb-2 ${colors.text}`}
                    style={{
                      textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    }}
                  >
                    {getFeedbackText(similarity)}
                  </motion.h3>
                </motion.div>

                {/* Similarity percentage */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.5,
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                  }}
                  className='text-center mb-6'
                >
                  <div className='flex items-center justify-center gap-3'>
                    <span className={`text-lg font-bold uppercase tracking-wider ${colors.text}`}>{t('similarityLabel')}</span>
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className={`text-6xl font-black text-transparent bg-gradient-to-r ${colors.gradient} bg-clip-text`}
                      style={{
                        filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
                      }}
                    >
                      <NumberTicker value={similarity * 100} decimalPlaces={1} />%
                    </motion.div>
                  </div>
                </motion.div>

                {/* Animated progress bar */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
                  className='relative h-4 bg-black/20 dark:bg-white/10 rounded-full overflow-hidden'
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${similarity * 100}%` }}
                    transition={{
                      delay: 0.7,
                      duration: 1,
                      ease: 'easeOut',
                    }}
                    className={`h-full bg-gradient-to-r ${colors.gradient} relative rounded-full`}
                    style={{
                      boxShadow: `0 0 20px ${colors.glow}`,
                    }}
                  >
                    {/* Animated shine on progress bar */}
                    <motion.div
                      className='absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent'
                      animate={{
                        x: ['-100%', '200%'],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'linear',
                        repeatDelay: 0.5,
                      }}
                    />
                  </motion.div>
                </motion.div>

                {/* Decorative sparkles */}
                <div className='absolute top-4 right-4'>
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className={colors.text}
                  >
                    <Sparkles className='w-6 h-6' />
                  </motion.div>
                </div>
                <div className='absolute top-4 left-4'>
                  <motion.div
                    animate={{
                      rotate: [360, 0],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className={colors.text}
                  >
                    <Sparkles className='w-6 h-6' />
                  </motion.div>
                </div>
              </div>

              {/* Bottom glow */}
              <motion.div
                className='absolute bottom-0 inset-x-0 h-1'
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  background: `linear-gradient(90deg, transparent, ${colors.glow}, transparent)`,
                  boxShadow: `0 0 20px ${colors.glow}`,
                }}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return createPortal(popupContent, document.body)
}
