'use client'

import { useEffect, useState } from 'react'
import { Marquee } from '@/components/ui/marquee'
import { motion } from 'framer-motion'
import { Avatar } from '@/components/ui/avatar'
import { Clock } from 'lucide-react'

interface AttemptData {
  id: string
  userName: string
  userImage: string | null
  guessText: string
  language: string
  attemptedAt: Date
}

const AttemptCard = ({ attempt }: { attempt: AttemptData }) => {
  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'ahora'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `hace ${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `hace ${hours}h`
    return `hace ${Math.floor(hours / 24)}d`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='flex items-center gap-3 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-purple-200/50 dark:border-purple-800/50 px-4 py-3 shadow-sm min-w-[300px]'
    >
      <div className='flex items-center gap-2 flex-1 min-w-0'>
        {attempt.userImage ? (
          <img
            src={attempt.userImage}
            alt={attempt.userName}
            className='h-8 w-8 rounded-full border-2 border-purple-300 dark:border-purple-700'
          />
        ) : (
          <div className='h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm'>
            {attempt.userName[0]?.toUpperCase()}
          </div>
        )}
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2'>
            <p className='text-sm font-semibold text-gray-900 dark:text-gray-100 truncate'>{attempt.userName}</p>
            <span className='text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1'>
              <Clock className='h-3 w-3' />
              {timeAgo(attempt.attemptedAt)}
            </span>
          </div>
          <p className='text-xs text-gray-600 dark:text-gray-300'>
            intentó <span className='font-bold text-purple-600 dark:text-purple-400'>&quot;{attempt.guessText}&quot;</span>
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default function RecentAttempts() {
  const [attempts, setAttempts] = useState<AttemptData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const response = await fetch('/api/recent-attempts')
        const data = await response.json()
        setAttempts(data)
      } catch (error) {
        console.error('Error fetching recent attempts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAttempts()

    // Actualizar cada 30 segundos
    const interval = setInterval(fetchAttempts, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className='w-full pt-16'>
        <h3 className='text-xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
          Últimos intentos de la comunidad
        </h3>
        <div className='flex items-center justify-center gap-2'>
          <div className='h-2 w-2 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.3s]' />
          <div className='h-2 w-2 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.15s]' />
          <div className='h-2 w-2 rounded-full bg-purple-500 animate-bounce' />
        </div>
      </div>
    )
  }

  if (attempts.length === 0) {
    return null
  }

  return (
    <div className='w-screen max-w-none pt-16 relative left-1/2 right-1/2 -translate-x-1/2'>
      <motion.h3
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className='text-xl font-bold text-center mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'
      >
        🔥 Últimos intentos de la comunidad
      </motion.h3>
      <div className='relative flex flex-col'>
        {/* Marquee normal */}
        <Marquee pauseOnHover className='[--duration:80s]'>
          {attempts.map((attempt) => (
            <AttemptCard key={attempt.id} attempt={attempt} />
          ))}
        </Marquee>
        {/* Marquee en dirección opuesta */}
        <Marquee pauseOnHover reverse className='[--duration:80s]'>
          {[...attempts].reverse().map((attempt) => (
            <AttemptCard key={'reverse-' + attempt.id} attempt={attempt} />
          ))}
        </Marquee>
      </div>
    </div>
  )
}
