'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Medal, Award, Crown, Star, ArrowLeft, Info, Target, Zap, Globe } from 'lucide-react'
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

interface GlobalLeaderboardEntry {
  rank: number
  name: string
  image: string
  solvedCount: number
  isAnonymous?: boolean
}

type LeaderboardMode = 'daily' | 'global'

export default function LeaderboardPage({ params }: { params: { locale: string } }) {
  const t = useTranslations('leaderboard')
  const [mode, setMode] = useState<LeaderboardMode>('daily')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [globalLeaderboard, setGlobalLeaderboard] = useState<GlobalLeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [daysAgo, setDaysAgo] = useState(0)
  const [targetWord, setTargetWord] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      setError('')
      try {
        if (mode === 'daily') {
          const response = await fetch(`/api/leaderboard?daysAgo=${daysAgo}&locale=${params.locale}`)
          if (!response.ok) {
            throw new Error('Failed to fetch leaderboard')
          }
          const data = await response.json()
          setLeaderboard(data.leaderboard || [])
          setTargetWord(data.targetWord)
        } else {
          const response = await fetch('/api/leaderboard/global')
          if (!response.ok) {
            throw new Error('Failed to fetch global leaderboard')
          }
          const data = await response.json()
          setGlobalLeaderboard(data.leaderboard || [])
        }
      } catch (err) {
        setError('Failed to load leaderboard')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [mode, daysAgo, params.locale])

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className='h-6 w-6 text-yellow-500 dark:text-yellow-400 drop-shadow-lg' />
    if (rank === 2) return <Medal className='h-6 w-6 text-gray-400 dark:text-gray-300 drop-shadow-lg' />
    if (rank === 3) return <Award className='h-6 w-6 text-amber-600 dark:text-amber-500 drop-shadow-lg' />
    return <Star className='h-5 w-5 text-purple-400 dark:text-purple-500' />
  }

  const getRankColor = (rank: number) => {
    if (rank === 1)
      return 'from-yellow-500/30 via-pink-500/10 to-pink-500/10 border-yellow-500 dark:border-yellow-400 shadow-xl shadow-yellow-500/20'
    if (rank === 2)
      return 'from-gray-300/25 via-pink-500/10 to-pink-500/10 border-gray-400 dark:border-gray-500 shadow-lg shadow-gray-400/15'
    if (rank === 3)
      return 'from-amber-500/25 via-pink-500/10 to-pink-500/10 border-amber-600 dark:border-amber-500 shadow-lg shadow-amber-600/15'
    return 'from-purple-500/10 to-pink-500/10 border-purple-300 dark:border-purple-800'
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
              <div className='flex flex-col gap-4'>
                {/* Mode Tabs */}
                <div className='flex justify-center gap-2'>
                  <motion.button
                    onClick={() => setMode('daily')}
                    className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 flex items-center gap-2 ${
                      mode === 'daily'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trophy className='h-4 w-4' />
                    {t('dailyTab')}
                  </motion.button>
                  <motion.button
                    onClick={() => setMode('global')}
                    className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 flex items-center gap-2 ${
                      mode === 'global'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Globe className='h-4 w-4' />
                    {t('globalTab')}
                  </motion.button>
                </div>

                {/* Header Title */}
                <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
                  <div className='flex flex-col gap-1'>
                    <CardTitle className='text-2xl md:text-3xl font-bold flex items-center gap-3'>
                      {mode === 'daily' ? (
                        <Trophy className='h-6 w-6 md:h-8 md:w-8 text-purple-600 dark:text-purple-400' />
                      ) : (
                        <Globe className='h-6 w-6 md:h-8 md:w-8 text-purple-600 dark:text-purple-400' />
                      )}
                      <span className='bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent'>
                        {mode === 'daily' ? t('title') : t('globalTitle')}
                      </span>
                    </CardTitle>
                    <p className='text-sm text-gray-600 dark:text-gray-400 ml-10 md:ml-11'>
                      {mode === 'daily' ? t('topPlayers') : t('globalSubtitle')}
                    </p>
                  </div>

                  {/* Date navigation - only show in daily mode */}
                  {mode === 'daily' && (
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
                          className='gap-1 md:gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm hover:shadow'
                        >
                          <ArrowLeft className='h-3 w-3 md:h-4 md:w-4' />
                          <span className='hidden sm:inline'>{t('previous')}</span>
                        </Button>
                      </motion.div>
                      <motion.div
                        className='px-4 md:px-5 py-2 md:py-2.5 bg-white dark:bg-gray-800 rounded-lg font-bold min-w-[120px] md:min-w-[160px] text-center text-gray-900 dark:text-gray-100 shadow-md border-2 border-gray-200 dark:border-gray-700 text-sm md:text-base'
                        whileHover={{ scale: 1.02 }}
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
                          className='gap-1 md:gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm hover:shadow'
                        >
                          <span className='hidden sm:inline'>{t('next')}</span>
                          <ArrowLeft className='h-3 w-3 md:h-4 md:w-4 rotate-180' />
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </div>

                {/* Scoring explanation - only show in daily mode */}
                {mode === 'daily' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className='p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700'
                  >
                    <div className='flex items-start gap-2'>
                      <Info className='h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5' />
                      <div className='flex-1'>
                        <h3 className='text-sm font-semibold text-purple-900 dark:text-purple-100 mb-1'>{t('scoringTitle')}</h3>
                        <p className='text-xs text-purple-700 dark:text-purple-300 leading-relaxed'>{t('scoringExplanation')}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Global explanation - only show in global mode */}
                {mode === 'global' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className='p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700'
                  >
                    <div className='flex items-start gap-2'>
                      <Info className='h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5' />
                      <div className='flex-1'>
                        <h3 className='text-sm font-semibold text-purple-900 dark:text-purple-100 mb-1'>{t('globalExplanationTitle')}</h3>
                        <p className='text-xs text-purple-700 dark:text-purple-300 leading-relaxed'>{t('globalExplanation')}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Show target word for past days - only in daily mode */}
              {mode === 'daily' && targetWord && (
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

              {!loading && !error && mode === 'daily' && leaderboard.length > 0 && (
                <div className='space-y-3'>
                  {/* Table Headers - Desktop */}
                  <motion.div
                    className='hidden md:grid grid-cols-[70px_1fr_100px_110px_100px_90px] lg:grid-cols-[80px_1fr_140px_140px_140px_100px] gap-2 lg:gap-4 px-3 lg:px-4 py-3 bg-gradient-to-r from-purple-100/50 via-pink-100/50 to-purple-100/50 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-purple-900/30 rounded-lg border border-purple-200/50 dark:border-purple-700/50'
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, type: 'spring' }}
                  >
                    <div className='flex items-center justify-center'>
                      <span className='text-[10px] lg:text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider'>
                        {t('rank')}
                      </span>
                    </div>
                    <div className='flex items-center'>
                      <span className='text-[10px] lg:text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider'>
                        {t('player')}
                      </span>
                    </div>
                    <div className='flex items-center justify-center gap-1'>
                      <Target className='h-3 w-3 lg:h-3.5 lg:w-3.5 text-purple-600 dark:text-purple-400 flex-shrink-0' />
                      <span className='text-[10px] lg:text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide lg:tracking-wider truncate'>
                        {t('attemptsLabel')}
                      </span>
                    </div>
                    <div className='flex items-center justify-center gap-1'>
                      <Zap className='h-3 w-3 lg:h-3.5 lg:w-3.5 text-purple-600 dark:text-purple-400 flex-shrink-0' />
                      <span className='text-[10px] lg:text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide lg:tracking-wider truncate'>
                        {t('bestMatchLabel')}
                      </span>
                    </div>
                    <div className='flex items-center justify-center gap-1'>
                      <span className='text-[10px] lg:text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide lg:tracking-wider'>
                        {t('status')}
                      </span>
                    </div>
                    <div className='flex items-center justify-center gap-1'>
                      <Trophy className='h-3 w-3 lg:h-3.5 lg:w-3.5 text-purple-600 dark:text-purple-400 flex-shrink-0' />
                      <span className='text-[10px] lg:text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide lg:tracking-wider'>
                        {t('score')}
                      </span>
                    </div>
                  </motion.div>

                  {/* Leaderboard Entries */}
                  <div className='space-y-4'>
                    {leaderboard.map((entry, index) => (
                      <>
                        {/* Podio Separator */}
                        {entry.rank === 4 && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.5, type: 'spring' }}
                            className='relative py-8 my-6'
                          >
                            {/* Decorative lines */}
                            <div className='absolute inset-0 flex items-center'>
                              <motion.div
                                className='w-full border-t-2 border-dashed border-purple-300 dark:border-purple-700'
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.6, duration: 0.6 }}
                              />
                            </div>
                            {/* Podio label */}
                            <motion.div
                              className='relative flex justify-center'
                              initial={{ y: -20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.7, duration: 0.4, type: 'spring', stiffness: 200 }}
                            >
                              <motion.div
                                className='px-6 py-2 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 dark:from-yellow-500 dark:via-amber-500 dark:to-yellow-500 rounded-full shadow-lg flex items-center gap-2'
                                whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
                                transition={{ duration: 0.3 }}
                              >
                                <Trophy className='h-5 w-5 text-yellow-900 dark:text-yellow-100' />
                                <span className='text-sm font-black text-yellow-900 dark:text-yellow-100 uppercase tracking-wider'>
                                  {t('podium') || 'Podio'}
                                </span>
                                <Trophy className='h-5 w-5 text-yellow-900 dark:text-yellow-100' />
                              </motion.div>
                            </motion.div>
                          </motion.div>
                        )}
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -50, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          transition={{
                            delay: index * 0.03,
                            duration: 0.4,
                            type: 'spring',
                            stiffness: 300,
                            damping: 25,
                          }}
                          whileHover={{
                            scale: 1.015,
                            y: -2,
                            transition: { duration: 0.2, type: 'spring', stiffness: 400 },
                          }}
                          className='relative'
                        >
                          <Card
                            className={`border-2 bg-gradient-to-r ${getRankColor(
                              entry.rank
                            )} transition-all duration-300 hover:shadow-xl overflow-hidden group relative ${
                              entry.rank <= 3 ? 'shadow-2xl shadow-black/30' : ''
                            }`}
                          >
                            <CardContent className='p-0'>
                              {/* Desktop Layout */}
                              <div className='hidden md:grid grid-cols-[70px_1fr_100px_110px_100px_90px] lg:grid-cols-[80px_1fr_140px_140px_140px_100px] gap-2 lg:gap-4 items-center px-3 lg:px-4 py-2.5 lg:py-3'>
                                {/* Rank */}
                                <motion.div
                                  className='flex flex-col items-center justify-center relative'
                                  whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                                  transition={{ duration: 0.3 }}
                                >
                                  {entry.rank <= 3 && (
                                    <motion.div
                                      className='absolute -inset-2 bg-gradient-to-r from-yellow-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-md'
                                      animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.3, 0.6, 0.3],
                                      }}
                                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                    />
                                  )}
                                  <motion.span
                                    className={`text-2xl lg:text-3xl font-black relative z-10 ${
                                      entry.rank === 1
                                        ? 'text-yellow-600 dark:text-yellow-400'
                                        : entry.rank === 2
                                        ? 'text-gray-600 dark:text-gray-300'
                                        : entry.rank === 3
                                        ? 'text-amber-600 dark:text-amber-500'
                                        : 'text-gray-800 dark:text-gray-100'
                                    }`}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: index * 0.03 + 0.1, type: 'spring', stiffness: 500 }}
                                  >
                                    {entry.rank}
                                  </motion.span>
                                  <motion.div
                                    className='relative z-10'
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: index * 0.03 + 0.2, type: 'spring', stiffness: 300 }}
                                  >
                                    {getRankIcon(entry.rank)}
                                  </motion.div>
                                </motion.div>

                                {/* Player */}
                                <div className='flex items-center gap-2 lg:gap-3'>
                                  <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: 'spring', stiffness: 400 }}>
                                    {entry.image ? (
                                      <img
                                        src={entry.image}
                                        alt={entry.name}
                                        className='h-9 w-9 lg:h-11 lg:w-11 rounded-full border-2 border-purple-400 dark:border-purple-600 shadow-md'
                                      />
                                    ) : (
                                      <div className='h-9 w-9 lg:h-11 lg:w-11 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-base lg:text-lg shadow-md'>
                                        {entry.name[0]?.toUpperCase()}
                                      </div>
                                    )}
                                  </motion.div>
                                  <div className='flex-1 min-w-0'>
                                    <div className='flex items-center gap-1.5 lg:gap-2'>
                                      <span className='font-bold text-sm lg:text-base text-gray-900 dark:text-white truncate'>
                                        {entry.name}
                                      </span>
                                      {entry.isAnonymous && (
                                        <motion.span
                                          className='text-[10px] lg:text-xs px-1.5 lg:px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full border border-amber-300 dark:border-amber-700 font-semibold'
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          transition={{ delay: index * 0.03 + 0.3, type: 'spring' }}
                                        >
                                          {t('anonymous')}
                                        </motion.span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Attempts */}
                                <motion.div
                                  className='flex items-center justify-center'
                                  whileHover={{ scale: 1.1 }}
                                  transition={{ type: 'spring', stiffness: 400 }}
                                >
                                  <motion.span
                                    className='text-xl lg:text-2xl font-bold text-purple-700 dark:text-purple-300'
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: index * 0.03 + 0.25, type: 'spring', stiffness: 500 }}
                                  >
                                    {entry.attempts}
                                  </motion.span>
                                </motion.div>

                                {/* Best Match */}
                                <motion.div
                                  className='flex items-center justify-center'
                                  whileHover={{ scale: 1.1 }}
                                  transition={{ type: 'spring', stiffness: 400 }}
                                >
                                  <motion.div
                                    className='px-2 py-1 lg:px-3 lg:py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 rounded-full border border-purple-300 dark:border-purple-700'
                                    initial={{ scale: 0, rotate: -90 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: index * 0.03 + 0.3, type: 'spring', stiffness: 300 }}
                                  >
                                    <span className='text-sm lg:text-base font-bold text-purple-800 dark:text-purple-200'>
                                      {(entry.bestSimilarity * 100).toFixed(1)}%
                                    </span>
                                  </motion.div>
                                </motion.div>

                                {/* Status */}
                                <motion.div
                                  className='flex items-center justify-center'
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: index * 0.03 + 0.35 }}
                                >
                                  <motion.div
                                    className={`flex items-center gap-1 lg:gap-1.5 px-2 py-1 lg:px-3 lg:py-1.5 rounded-full font-semibold text-xs lg:text-sm ${
                                      entry.solved
                                        ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700'
                                        : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                                    }`}
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: 'spring', stiffness: 400 }}
                                  >
                                    {entry.solved ? (
                                      <>
                                        <Trophy className='h-3 w-3 lg:h-3.5 lg:w-3.5' />
                                        <span className='hidden lg:inline'>{t('solved')}</span>
                                      </>
                                    ) : (
                                      <>
                                        <Target className='h-3 w-3 lg:h-3.5 lg:w-3.5' />
                                        <span className='hidden lg:inline'>{t('attempted')}</span>
                                      </>
                                    )}
                                  </motion.div>
                                </motion.div>

                                {/* Score */}
                                <motion.div
                                  className='flex items-center justify-center'
                                  whileHover={{ scale: 1.15, rotate: [0, -10, 10, 0] }}
                                  transition={{ duration: 0.5 }}
                                >
                                  <motion.div
                                    className='px-3 py-1.5 lg:px-4 lg:py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 text-white rounded-full font-black text-lg lg:text-xl shadow-lg relative overflow-hidden'
                                    initial={{ scale: 0, rotate: 180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: index * 0.03 + 0.4, type: 'spring', stiffness: 300 }}
                                  >
                                    <motion.div
                                      className='absolute inset-0 bg-white/20'
                                      initial={{ x: '-100%' }}
                                      whileHover={{ x: '100%' }}
                                      transition={{ duration: 0.6 }}
                                    />
                                    <span className='relative z-10'>{entry.score}</span>
                                  </motion.div>
                                </motion.div>
                              </div>

                              {/* Mobile Layout */}
                              <div className='md:hidden p-3 space-y-2'>
                                {/* Top Row */}
                                <div className='flex items-center gap-3'>
                                  <motion.div
                                    className='flex flex-col items-center relative'
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: index * 0.03, type: 'spring' }}
                                  >
                                    {entry.rank <= 3 && (
                                      <motion.div
                                        className='absolute -inset-2 bg-gradient-to-r from-yellow-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-md'
                                        animate={{
                                          scale: [1, 1.2, 1],
                                          opacity: [0.3, 0.6, 0.3],
                                        }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                      />
                                    )}
                                    <span
                                      className={`text-2xl font-black relative z-10 ${
                                        entry.rank === 1
                                          ? 'text-yellow-600 dark:text-yellow-400'
                                          : entry.rank === 2
                                          ? 'text-gray-600 dark:text-gray-300'
                                          : entry.rank === 3
                                          ? 'text-amber-600 dark:text-amber-500'
                                          : 'text-gray-800 dark:text-gray-100'
                                      }`}
                                    >
                                      {entry.rank}
                                    </span>
                                    <div className='relative z-10'>{getRankIcon(entry.rank)}</div>
                                  </motion.div>

                                  {entry.image ? (
                                    <img
                                      src={entry.image}
                                      alt={entry.name}
                                      className='h-10 w-10 rounded-full border-2 border-purple-400 dark:border-purple-600'
                                    />
                                  ) : (
                                    <div className='h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm'>
                                      {entry.name[0]?.toUpperCase()}
                                    </div>
                                  )}

                                  <div className='flex-1 min-w-0'>
                                    <div className='flex items-center gap-1.5 flex-wrap'>
                                      <span className='font-bold text-sm text-gray-900 dark:text-white truncate'>{entry.name}</span>
                                      {entry.isAnonymous && (
                                        <span className='text-[10px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full border border-amber-300 dark:border-amber-700 font-medium'>
                                          {t('anonymous')}
                                        </span>
                                      )}
                                    </div>
                                    <div
                                      className={`text-xs font-semibold flex items-center gap-1 mt-0.5 ${
                                        entry.solved ? 'text-purple-600 dark:text-purple-400' : 'text-purple-500 dark:text-purple-500'
                                      }`}
                                    >
                                      {entry.solved ? (
                                        <>
                                          <Trophy className='h-3 w-3' />
                                          {t('solved')}
                                        </>
                                      ) : (
                                        <>
                                          <Target className='h-3 w-3' />
                                          {t('attempted')}
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Stats Grid */}
                                <div className='grid grid-cols-3 gap-2'>
                                  <motion.div
                                    className='flex flex-col items-center justify-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800'
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 + 0.2 }}
                                  >
                                    <Target className='h-4 w-4 text-purple-600 dark:text-purple-400 mb-1' />
                                    <span className='text-lg font-bold text-purple-900 dark:text-purple-100'>{entry.attempts}</span>
                                    <span className='text-[9px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide mt-0.5'>
                                      {t('attemptsLabel')}
                                    </span>
                                  </motion.div>
                                  <motion.div
                                    className='flex flex-col items-center justify-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800'
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 + 0.25 }}
                                  >
                                    <Zap className='h-4 w-4 text-purple-600 dark:text-purple-400 mb-1' />
                                    <span className='text-lg font-bold text-purple-900 dark:text-purple-100'>
                                      {(entry.bestSimilarity * 100).toFixed(1)}%
                                    </span>
                                    <span className='text-[9px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide mt-0.5'>
                                      {t('bestMatchLabel')}
                                    </span>
                                  </motion.div>
                                  <motion.div
                                    className='flex flex-col items-center justify-center p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-md'
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 + 0.3 }}
                                  >
                                    <Trophy className='h-4 w-4 text-white mb-1' />
                                    <span className='text-lg font-bold text-white'>{entry.score}</span>
                                    <span className='text-[9px] font-semibold text-white/90 uppercase tracking-wide mt-0.5'>
                                      {t('score')}
                                    </span>
                                  </motion.div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </>
                    ))}
                  </div>
                </div>
              )}

              {/* Global Leaderboard */}
              {!loading && !error && mode === 'global' && globalLeaderboard.length > 0 && (
                <div className='space-y-3'>
                  {/* Table Headers - Desktop */}
                  <motion.div
                    className='hidden md:grid grid-cols-[80px_1fr_200px] lg:grid-cols-[100px_1fr_250px] gap-4 px-4 py-3 bg-gradient-to-r from-purple-100/50 via-pink-100/50 to-purple-100/50 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-purple-900/30 rounded-lg border border-purple-200/50 dark:border-purple-700/50'
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, type: 'spring' }}
                  >
                    <div className='flex items-center justify-center'>
                      <span className='text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider'>{t('rank')}</span>
                    </div>
                    <div className='flex items-center'>
                      <span className='text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider'>{t('player')}</span>
                    </div>
                    <div className='flex items-center justify-center gap-2'>
                      <Trophy className='h-4 w-4 text-purple-600 dark:text-purple-400' />
                      <span className='text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider'>
                        {t('wordsSolved')}
                      </span>
                    </div>
                  </motion.div>

                  {/* Leaderboard Entries */}
                  <div className='space-y-4'>
                    {globalLeaderboard.map((entry, index) => (
                      <>
                        {/* Podio Separator */}
                        {entry.rank === 4 && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.5, type: 'spring' }}
                            className='relative py-8 my-6'
                          >
                            <div className='absolute inset-0 flex items-center'>
                              <motion.div
                                className='w-full border-t-2 border-dashed border-purple-300 dark:border-purple-700'
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.6, duration: 0.6 }}
                              />
                            </div>
                            <motion.div
                              className='relative flex justify-center'
                              initial={{ y: -20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.7, duration: 0.4, type: 'spring', stiffness: 200 }}
                            >
                              <motion.div
                                className='px-6 py-2 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 dark:from-yellow-500 dark:via-amber-500 dark:to-yellow-500 rounded-full shadow-lg flex items-center gap-2'
                                whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
                                transition={{ duration: 0.3 }}
                              >
                                <Trophy className='h-5 w-5 text-yellow-900 dark:text-yellow-100' />
                                <span className='text-sm font-black text-yellow-900 dark:text-yellow-100 uppercase tracking-wider'>
                                  {t('podium')}
                                </span>
                                <Trophy className='h-5 w-5 text-yellow-900 dark:text-yellow-100' />
                              </motion.div>
                            </motion.div>
                          </motion.div>
                        )}

                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -50, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          transition={{
                            delay: index * 0.03,
                            duration: 0.4,
                            type: 'spring',
                            stiffness: 300,
                            damping: 25,
                          }}
                          whileHover={{
                            scale: 1.015,
                            y: -2,
                            transition: { duration: 0.2, type: 'spring', stiffness: 400 },
                          }}
                        >
                          <Card
                            className={`border-2 bg-gradient-to-r ${getRankColor(
                              entry.rank
                            )} transition-all duration-300 hover:shadow-xl overflow-hidden ${
                              entry.rank <= 3 ? 'shadow-2xl shadow-black/30' : ''
                            }`}
                          >
                            <CardContent className='p-0'>
                              {/* Desktop Layout */}
                              <div className='hidden md:grid grid-cols-[80px_1fr_200px] lg:grid-cols-[100px_1fr_250px] gap-4 items-center px-4 py-3'>
                                {/* Rank */}
                                <motion.div
                                  className='flex flex-col items-center justify-center relative'
                                  whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                                  transition={{ duration: 0.3 }}
                                >
                                  {entry.rank <= 3 && (
                                    <motion.div
                                      className='absolute -inset-2 bg-gradient-to-r from-yellow-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-md'
                                      animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.3, 0.6, 0.3],
                                      }}
                                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                    />
                                  )}
                                  <motion.span
                                    className={`text-3xl font-black relative z-10 ${
                                      entry.rank === 1
                                        ? 'text-yellow-600 dark:text-yellow-400'
                                        : entry.rank === 2
                                        ? 'text-gray-600 dark:text-gray-300'
                                        : entry.rank === 3
                                        ? 'text-amber-600 dark:text-amber-500'
                                        : 'text-gray-800 dark:text-gray-100'
                                    }`}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: index * 0.03 + 0.1, type: 'spring', stiffness: 500 }}
                                  >
                                    {entry.rank}
                                  </motion.span>
                                  <motion.div
                                    className='relative z-10'
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: index * 0.03 + 0.2, type: 'spring', stiffness: 300 }}
                                  >
                                    {getRankIcon(entry.rank)}
                                  </motion.div>
                                </motion.div>

                                {/* Player */}
                                <div className='flex items-center gap-3'>
                                  <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: 'spring', stiffness: 400 }}>
                                    {entry.image ? (
                                      <img
                                        src={entry.image}
                                        alt={entry.name}
                                        className='h-12 w-12 rounded-full border-2 border-purple-400 dark:border-purple-600 shadow-md'
                                      />
                                    ) : (
                                      <div className='h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-md'>
                                        {entry.name[0]?.toUpperCase()}
                                      </div>
                                    )}
                                  </motion.div>
                                  <div className='flex-1 min-w-0'>
                                    <div className='flex items-center gap-2'>
                                      <span className='font-bold text-base text-gray-900 dark:text-white truncate'>{entry.name}</span>
                                      {entry.isAnonymous && (
                                        <motion.span
                                          className='text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full border border-amber-300 dark:border-amber-700 font-semibold'
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          transition={{ delay: index * 0.03 + 0.3, type: 'spring' }}
                                        >
                                          {t('anonymous')}
                                        </motion.span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Words Solved */}
                                <motion.div
                                  className='flex items-center justify-center'
                                  whileHover={{ scale: 1.15, rotate: [0, -10, 10, 0] }}
                                  transition={{ duration: 0.5 }}
                                >
                                  <motion.div
                                    className='px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 text-white rounded-full font-black text-2xl shadow-lg relative overflow-hidden'
                                    initial={{ scale: 0, rotate: 180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: index * 0.03 + 0.4, type: 'spring', stiffness: 300 }}
                                  >
                                    <motion.div
                                      className='absolute inset-0 bg-white/20'
                                      initial={{ x: '-100%' }}
                                      whileHover={{ x: '100%' }}
                                      transition={{ duration: 0.6 }}
                                    />
                                    <span className='relative z-10'>{entry.solvedCount}</span>
                                  </motion.div>
                                </motion.div>
                              </div>

                              {/* Mobile Layout */}
                              <div className='md:hidden p-3 space-y-2'>
                                <div className='flex items-center gap-3'>
                                  <motion.div
                                    className='flex flex-col items-center relative'
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: index * 0.03, type: 'spring' }}
                                  >
                                    {entry.rank <= 3 && (
                                      <motion.div
                                        className='absolute -inset-2 bg-gradient-to-r from-yellow-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-md'
                                        animate={{
                                          scale: [1, 1.2, 1],
                                          opacity: [0.3, 0.6, 0.3],
                                        }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                      />
                                    )}
                                    <span
                                      className={`text-2xl font-black relative z-10 ${
                                        entry.rank === 1
                                          ? 'text-yellow-600 dark:text-yellow-400'
                                          : entry.rank === 2
                                          ? 'text-gray-600 dark:text-gray-300'
                                          : entry.rank === 3
                                          ? 'text-amber-600 dark:text-amber-500'
                                          : 'text-gray-800 dark:text-gray-100'
                                      }`}
                                    >
                                      {entry.rank}
                                    </span>
                                    <div className='relative z-10'>{getRankIcon(entry.rank)}</div>
                                  </motion.div>

                                  {entry.image ? (
                                    <img
                                      src={entry.image}
                                      alt={entry.name}
                                      className='h-10 w-10 rounded-full border-2 border-purple-400 dark:border-purple-600'
                                    />
                                  ) : (
                                    <div className='h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm'>
                                      {entry.name[0]?.toUpperCase()}
                                    </div>
                                  )}

                                  <div className='flex-1 min-w-0'>
                                    <div className='flex items-center gap-1.5 flex-wrap'>
                                      <span className='font-bold text-sm text-gray-900 dark:text-white truncate'>{entry.name}</span>
                                      {entry.isAnonymous && (
                                        <span className='text-[10px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full border border-amber-300 dark:border-amber-700 font-medium'>
                                          {t('anonymous')}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <motion.div
                                  className='flex items-center justify-center p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-md'
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.03 + 0.2 }}
                                >
                                  <Trophy className='h-5 w-5 text-white mr-2' />
                                  <span className='text-2xl font-bold text-white'>{entry.solvedCount}</span>
                                  <span className='text-xs font-semibold text-white/90 uppercase tracking-wide ml-2'>
                                    {t('wordsSolved')}
                                  </span>
                                </motion.div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
