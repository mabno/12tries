'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Medal, Award, Crown, Star, ArrowLeft } from 'lucide-react'
import { Particles } from '@/components/ui/particles'
import { SparklesText } from '@/components/ui/sparkles-text'

interface LeaderboardEntry {
  rank: number
  name: string
  image: string
  attempts: number
  score: number
  solved: boolean
  bestSimilarity: number
  isAnonymous?: boolean
}

export default function LeaderboardPage({ params }: { params: { locale: string } }) {
  const t = useTranslations('leaderboard')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [daysAgo, setDaysAgo] = useState(0)
  const [targetWord, setTargetWord] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/leaderboard?daysAgo=${daysAgo}&locale=${params.locale}`)
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard')
        }
        const data = await response.json()
        setLeaderboard(data.leaderboard || [])
        setTargetWord(data.targetWord)
      } catch (err) {
        setError('Failed to load leaderboard')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [daysAgo, params.locale])

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className='h-6 w-6 text-yellow-500' />
    if (rank === 2) return <Medal className='h-6 w-6 text-gray-400' />
    if (rank === 3) return <Award className='h-6 w-6 text-amber-600' />
    return <Star className='h-5 w-5 text-purple-500' />
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500'
    if (rank === 2) return 'from-gray-400/20 to-gray-500/20 border-gray-400'
    if (rank === 3) return 'from-amber-600/20 to-amber-700/20 border-amber-600'
    return 'from-purple-500/10 to-pink-500/10 border-purple-300'
  }

  const getDateLabel = () => {
    if (daysAgo === 0) return t('today')
    if (daysAgo === 1) return t('yesterday')
    return t('daysAgo', { days: daysAgo })
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 relative overflow-hidden'>
      {/* Background particles */}
      <div className='fixed inset-0 pointer-events-none'>
        <Particles className='h-full' quantity={50} color='#a855f7' />
      </div>

      {/* Main content */}
      <main className='container mx-auto px-4 py-8 relative z-10'>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className='relative overflow-hidden border-2 border-purple-200/50 shadow-2xl'>
            <div className='absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-purple-500/5' />

            <CardHeader className='relative bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 backdrop-blur-sm'>
              <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                <div className='flex flex-col gap-1'>
                  <CardTitle className='text-2xl md:text-3xl font-bold flex items-center gap-3'>
                    <Trophy className='h-6 w-6 md:h-8 md:w-8 text-yellow-500' />
                    {t('title')}
                  </CardTitle>
                  <p className='text-sm text-gray-600 dark:text-gray-400 ml-10 md:ml-11'>{t('topPlayers')}</p>
                </div>

                {/* Date navigation */}
                <motion.div
                  className='flex items-center gap-2 justify-center md:justify-end'
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setDaysAgo(Math.min(daysAgo + 1, 5))}
                      disabled={daysAgo >= 5}
                      className='gap-1 md:gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border-purple-300 dark:border-purple-700 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm hover:shadow-md'
                    >
                      <ArrowLeft className='h-3 w-3 md:h-4 md:w-4' />
                      <span className='hidden sm:inline'>{t('previous')}</span>
                    </Button>
                  </motion.div>
                  <motion.div
                    className='px-3 md:px-4 py-2 bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 dark:from-purple-900/40 dark:via-pink-900/40 dark:to-purple-900/40 rounded-xl font-bold min-w-[100px] md:min-w-[140px] text-center text-purple-900 dark:text-purple-100 shadow-lg border-2 border-purple-200 dark:border-purple-800 text-sm md:text-base'
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    {getDateLabel()}
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setDaysAgo(Math.max(daysAgo - 1, 0))}
                      disabled={daysAgo === 0}
                      className='gap-1 md:gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border-purple-300 dark:border-purple-700 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm hover:shadow-md'
                    >
                      <span className='hidden sm:inline'>{t('next')}</span>
                      <ArrowLeft className='h-3 w-3 md:h-4 md:w-4 rotate-180' />
                    </Button>
                  </motion.div>
                </motion.div>
              </div>

              {/* Show target word for past days */}
              {targetWord && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='mt-4 p-6 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border-2 border-green-300 dark:border-green-700'
                >
                  <div className='flex flex-col items-center justify-center gap-3'>
                    <div className='flex items-center gap-2'>
                      <Trophy className='h-5 w-5 text-green-600 dark:text-green-400' />
                      <span className='font-semibold text-green-900 dark:text-green-100'>{t('targetWord')}:</span>
                    </div>
                    <SparklesText
                      className='text-4xl font-black text-green-700 dark:text-green-300'
                      colors={{ first: '#16a34a', second: '#10b981' }}
                      sparklesCount={15}
                    >
                      {targetWord.toUpperCase()}
                    </SparklesText>
                  </div>
                </motion.div>
              )}
            </CardHeader>

            <CardContent className='relative p-6'>
              {loading && (
                <div className='text-center py-12'>
                  <div className='relative inline-flex items-center justify-center'>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className='absolute'
                    >
                      <div className='w-20 h-20 rounded-full border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400' />
                    </motion.div>
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Trophy className='h-12 w-12 text-purple-500' />
                    </motion.div>
                  </div>
                  <motion.p
                    className='mt-6 text-lg font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent'
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {t('loading')}
                  </motion.p>
                </div>
              )}

              {error && (
                <div className='text-center py-12'>
                  <p className='text-red-500'>{error}</p>
                </div>
              )}

              {!loading && !error && leaderboard.length === 0 && (
                <div className='text-center py-12'>
                  <Trophy className='h-16 w-16 text-gray-300 mx-auto mb-4' />
                  <p className='text-gray-600 dark:text-gray-400'>{t('noEntries')}</p>
                </div>
              )}

              {!loading && !error && leaderboard.length > 0 && (
                <div className='space-y-3'>
                  {leaderboard.map((entry, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -50, scale: 0.8, rotateX: -15 }}
                      animate={{ opacity: 1, x: 0, scale: 1, rotateX: 0 }}
                      transition={{
                        delay: index * 0.08,
                        duration: 0.5,
                        type: 'spring',
                        stiffness: 260,
                        damping: 20,
                      }}
                      whileHover={{
                        scale: 1.02,
                        y: -4,
                        transition: { duration: 0.2 },
                      }}
                      style={{ transformPerspective: 1000 }}
                    >
                      <Card className={`border-2 bg-gradient-to-r ${getRankColor(entry.rank)} transition-all hover:shadow-2xl`}>
                        <CardContent className='p-4'>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-4'>
                              {/* Rank icon */}
                              <motion.div
                                className='flex items-center justify-center w-12 h-12 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-lg'
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                  delay: index * 0.08 + 0.2,
                                  type: 'spring',
                                  stiffness: 300,
                                  damping: 15,
                                }}
                              >
                                {getRankIcon(entry.rank)}
                              </motion.div>

                              {/* Player info */}
                              <div className='flex items-center gap-3'>
                                {entry.image ? (
                                  <img
                                    src={entry.image}
                                    alt={entry.name}
                                    className='h-12 w-12 rounded-full border-2 border-purple-300 dark:border-purple-700'
                                  />
                                ) : (
                                  <div className='h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg'>
                                    {entry.name[0]?.toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <div className='flex items-center gap-2'>
                                    <span className='font-bold text-gray-700 dark:text-gray-200'>#{entry.rank}</span>
                                    <span className='font-semibold text-lg text-gray-900 dark:text-white'>{entry.name}</span>
                                    {entry.isAnonymous && (
                                      <span className='text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full border border-amber-300 dark:border-amber-700 font-medium'>
                                        {t('anonymous')}
                                      </span>
                                    )}
                                  </div>
                                  <div className='text-sm text-gray-600 dark:text-gray-400'>
                                    {entry.attempts} {t('attempts')} · {(entry.bestSimilarity * 100).toFixed(1)}% {t('similarity')}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Score badge */}
                            <div className='flex flex-col items-end gap-1'>
                              <motion.div
                                className='px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-bold text-lg shadow-lg'
                                initial={{ scale: 0, rotate: 180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                  delay: index * 0.08 + 0.3,
                                  type: 'spring',
                                  stiffness: 300,
                                  damping: 15,
                                }}
                                whileHover={{
                                  scale: 1.1,
                                  rotate: [0, -5, 5, -5, 0],
                                  transition: { duration: 0.5 },
                                }}
                              >
                                {entry.score}
                              </motion.div>
                              <motion.span
                                className={`text-xs font-semibold flex items-center gap-1 ${
                                  entry.solved ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
                                }`}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.08 + 0.4 }}
                              >
                                {entry.solved ? (
                                  <>
                                    <Trophy className='h-3 w-3' />
                                    {t('solved')}
                                  </>
                                ) : (
                                  <span>{t('attempted')}</span>
                                )}
                              </motion.span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
