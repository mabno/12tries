'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'

interface NextChallengeCountdownProps {
  locale?: string
}

export default function NextChallengeCountdown({ locale = 'en' }: NextChallengeCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setUTCHours(24, 0, 0, 0) // Next midnight UTC

      const diff = tomorrow.getTime() - now.getTime()

      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        setTimeLeft({ hours, minutes, seconds })
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [])

  const text = locale === 'es' ? 'Próximo desafío en' : 'Next challenge in'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className='mt-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-200 dark:border-purple-700 rounded-xl'
    >
      <div className='flex items-center justify-center gap-2 mb-3'>
        <Clock className='h-5 w-5 text-purple-600 dark:text-purple-400' />
        <p className='text-sm font-semibold text-purple-900 dark:text-purple-100'>{text}</p>
      </div>
      <div className='flex items-center justify-center gap-2'>
        <TimeUnit value={timeLeft.hours} label={locale === 'es' ? 'h' : 'h'} />
        <span className='text-2xl font-bold text-purple-600 dark:text-purple-400'>:</span>
        <TimeUnit value={timeLeft.minutes} label={locale === 'es' ? 'm' : 'm'} />
        <span className='text-2xl font-bold text-purple-600 dark:text-purple-400'>:</span>
        <TimeUnit value={timeLeft.seconds} label={locale === 'es' ? 's' : 's'} />
      </div>
    </motion.div>
  )
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className='flex flex-col items-center'>
      <motion.div
        key={value}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className='bg-white dark:bg-gray-800 rounded-lg shadow-md px-3 py-2 min-w-[3rem]'
      >
        <span className='text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
          {value.toString().padStart(2, '0')}
        </span>
      </motion.div>
      <span className='text-xs text-purple-700 dark:text-purple-300 mt-1 font-medium'>{label}</span>
    </div>
  )
}
