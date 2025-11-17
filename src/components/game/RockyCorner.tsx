'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

interface RockyCornerProps {
  isVisible: boolean
}

interface ClickEmoji {
  id: number
  x: number
  y: number
  emoji: string
}

const EMOJIS = ['🔥', '💪', '⚡', '🌟', '✨', '🎯', '🚀', '💥', '👑', '🏆']

export default function RockyCorner({ isVisible }: RockyCornerProps) {
  const t = useTranslations('rocky')
  const [mounted, setMounted] = useState(false)
  const [clickEmojis, setClickEmojis] = useState<ClickEmoji[]>([])
  const [clickCount, setClickCount] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleRockyClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Generate 3-5 emojis per click
    const emojiCount = Math.floor(Math.random() * 3) + 3
    const newEmojis: ClickEmoji[] = []

    for (let i = 0; i < emojiCount; i++) {
      const randomEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
      newEmojis.push({
        id: Date.now() + Math.random(),
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 40,
        emoji: randomEmoji,
      })
    }

    setClickEmojis((prev) => [...prev, ...newEmojis])
    setClickCount((prev) => prev + 1)

    // Remove emojis after animation
    setTimeout(() => {
      setClickEmojis((prev) => prev.filter((emoji) => !newEmojis.includes(emoji)))
    }, 2000)
  }

  if (!mounted || !isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, x: 100, y: 100 }}
      animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, scale: 0, x: 100, y: 100 }}
      transition={{
        duration: 0.5,
        type: 'spring',
        stiffness: 200,
        damping: 20,
      }}
      className='fixed bottom-4 right-4 z-50'
    >
      {/* Floating click emojis */}
      <AnimatePresence>
        {clickEmojis.map((emoji) => (
          <motion.div
            key={emoji.id}
            initial={{
              x: emoji.x,
              y: emoji.y,
              opacity: 1,
              scale: 0,
            }}
            animate={{
              x: emoji.x + (Math.random() - 0.5) * 100,
              y: emoji.y - 150,
              opacity: 0,
              scale: [0, 1.5, 1, 0],
              rotate: (Math.random() - 0.5) * 360,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 2,
              ease: 'easeOut',
            }}
            className='absolute text-3xl pointer-events-none'
            style={{
              left: 0,
              top: 0,
            }}
          >
            {emoji.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Rocky container with bounce animation */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          scale: clickCount > 0 ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        onClick={handleRockyClick}
        className='relative cursor-pointer pointer-events-auto'
      >
        {/* Glow effect */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className='absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-400 rounded-full blur-2xl'
        />

        {/* Rocky Image */}
        <div className='relative w-24 h-24 sm:w-32 sm:h-32'>
          <img
            src='/rockycaricatura-removebg-preview.png'
            alt='Rocky cheering you on'
            className='scale-150 w-full h-full object-contain drop-shadow-2xl'
          />
        </div>

        {/* Floating sparkles */}
        <motion.div
          animate={{
            y: [-5, -25],
            x: [0, 10],
            opacity: [1, 0],
            scale: [0.5, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 0.5,
          }}
          className='absolute top-0 right-0 text-xl'
        >
          ✨
        </motion.div>

        <motion.div
          animate={{
            y: [-5, -25],
            x: [0, -10],
            opacity: [1, 0],
            scale: [0.5, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 0.5,
            delay: 0.7,
          }}
          className='absolute top-0 left-0 text-xl'
        >
          💪
        </motion.div>
      </motion.div>

      {/* Optional tooltip/message */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className='absolute -top-12 right-0 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg border-2 border-purple-500 pointer-events-none'
      >
        <p className='text-xs font-bold text-purple-600 dark:text-purple-400 whitespace-nowrap'>{t('cornerMessage')} 🚀</p>
        {/* Speech bubble arrow */}
        <div className='absolute -bottom-2 right-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-purple-500' />
      </motion.div>

      {/* Click counter (optional) */}
      {clickCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className='absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg pointer-events-none'
        >
          {clickCount} 🦴
        </motion.div>
      )}
    </motion.div>
  )
}
