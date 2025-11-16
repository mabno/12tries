'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getSimilarityColor, getSimilarityLabel, getTodayUTCString } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Particles } from '@/components/ui/particles'
import Confetti from '@/components/ui/confetti'
import { NumberTicker } from '@/components/ui/number-ticker'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { CoolMode } from '@/components/ui/cool-mode'
import { TextAnimate } from '@/components/ui/text-animate'
import { Sparkles, Send, Trophy, TrendingUp } from 'lucide-react'
import NicknameModal from '@/components/NicknameModal'
import NextChallengeCountdown from '@/components/NextChallengeCountdown'

interface Attempt {
  guess: string
  similarity: number
  attemptedAt: Date
}

interface GameProps {
  locale: string
}

export default function Game({ locale }: GameProps) {
  const t = useTranslations('game')
  const { data: session, status } = useSession()
  const [guess, setGuess] = useState('')
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [attemptsRemaining, setAttemptsRemaining] = useState(12)
  const [solved, setSolved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [lastSimilarity, setLastSimilarity] = useState<number | null>(null)
  const [shake, setShake] = useState(false)
  const [showNicknameModal, setShowNicknameModal] = useState(false)
  const [nickname, setNickname] = useState<string | null>(null)
  const [browserId, setBrowserId] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)
  const [hintLoading, setHintLoading] = useState(false)
  const [hintError, setHintError] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [challengeLoading, setChallengeLoading] = useState(true)

  // Check session status and update anonymous state
  useEffect(() => {
    if (status === 'authenticated') {
      setIsAnonymous(false)
    } else if (status === 'unauthenticated') {
      setIsAnonymous(true)
      // Load or generate browserId for anonymous users
      const storedBrowserId = localStorage.getItem('browserId')
      const storedNickname = localStorage.getItem('nickname')

      if (storedBrowserId) {
        setBrowserId(storedBrowserId)
      } else {
        const newBrowserId = `browser_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
        localStorage.setItem('browserId', newBrowserId)
        setBrowserId(newBrowserId)
      }

      if (storedNickname) {
        setNickname(storedNickname)
      }
    }
  }, [status, session])

  // Load progress from backend on mount
  useEffect(() => {
    const loadProgress = async () => {
      setChallengeLoading(true)
      try {
        // Add browserId to request for anonymous users
        const url = new URL('/api/challenge', window.location.origin)
        url.searchParams.set('locale', locale)
        if (browserId) {
          url.searchParams.set('browserId', browserId)
        }

        const response = await fetch(url.toString())
        if (!response.ok) {
          throw new Error('Failed to fetch challenge')
        }

        const data = await response.json()

        // Set state with backend data
        // Convert attemptedAt strings back to Date objects and sort by most recent first
        const loadedAttempts = (data.attempts || []).map((a: any) => ({
          ...a,
          attemptedAt: new Date(a.attemptedAt),
        }))

        setAttempts(loadedAttempts)
        setAttemptsRemaining(data.attemptsRemaining || 12)
        setSolved(data.solved || false)
        setCategory(data.category || null)

        // For anonymous users, also save to localStorage as backup
        if (data.anonymous) {
          const today = getTodayUTCString()
          const storageKey = `game-progress-${today}`
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              attempts: loadedAttempts,
              attemptsRemaining: data.attemptsRemaining || 12,
              solved: data.solved || false,
              isAnonymous: data.anonymous,
              date: today,
            })
          )
        }
      } catch (error) {
        console.error('Error loading progress from backend:', error)

        // Fallback to localStorage for anonymous users
        const today = getTodayUTCString()
        const storageKey = `game-progress-${today}`
        const savedProgress = localStorage.getItem(storageKey)

        if (savedProgress) {
          try {
            const progress = JSON.parse(savedProgress)
            // Convert attemptedAt strings to Date objects
            const progressAttempts = (progress.attempts || []).map((a: any) => ({
              ...a,
              attemptedAt: new Date(a.attemptedAt),
            }))
            setAttempts(progressAttempts)
            setAttemptsRemaining(progress.attemptsRemaining || 12)
            setSolved(progress.solved || false)
          } catch (e) {
            console.error('Error loading progress from localStorage:', e)
          }
        }
      } finally {
        setChallengeLoading(false)
      }
    }

    // Only load progress when session status is determined and we have browserId (if anonymous)
    if (status !== 'loading' && (status === 'authenticated' || browserId)) {
      loadProgress()
    } else if (status !== 'loading') {
      setChallengeLoading(false)
    }
  }, [status, locale, browserId])

  // Save anonymous user's progress to localStorage
  const saveProgress = (newAttempts: Attempt[], remaining: number, isSolved: boolean, anonymous: boolean) => {
    const today = getTodayUTCString()
    const storageKey = `game-progress-${today}`
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        attempts: newAttempts,
        attemptsRemaining: remaining,
        solved: isSolved,
        isAnonymous: anonymous,
        date: today,
      })
    )
  }

  const handleNicknameSave = (newNickname: string) => {
    setNickname(newNickname)
    localStorage.setItem('nickname', newNickname)
    setShowNicknameModal(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!guess.trim() || loading) return

    const trimmedGuess = guess.trim()

    // Validate: only one word (no spaces)
    if (trimmedGuess.includes(' ')) {
      setError(t('errors.multipleWords'))
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }

    // Validate: maximum 30 characters
    if (trimmedGuess.length > 30) {
      setError(t('errors.tooLong'))
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }

    // For anonymous users, check if they have a nickname
    if (isAnonymous && !nickname) {
      setShowNicknameModal(true)
      return
    }

    setLoading(true)
    setError('')

    try {
      const attemptsUsed = 10 - attemptsRemaining

      const response = await fetch('/api/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guess: guess.trim(),
          locale,
          attemptsUsed,
          browserId: isAnonymous ? browserId : undefined,
          nickname: isAnonymous ? nickname : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'An error occurred')
        setLoading(false)
        return
      }

      // Add new attempt to the list
      const newAttempt = {
        guess: guess.trim(),
        similarity: data.similarity,
        attemptedAt: new Date(),
      }
      const newAttempts = [newAttempt, ...attempts]
      const newRemaining = data.attemptsRemaining
      const newSolved = data.correct
      const anonymous = data.anonymous || false

      setAttempts(newAttempts)
      setAttemptsRemaining(newRemaining)
      setSolved(newSolved)
      setIsAnonymous(anonymous)
      setGuess('')
      setLastSimilarity(data.similarity)

      // Show confetti on win
      if (newSolved) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
      }

      // Shake on very low similarity
      if (data.similarity < 0.3) {
        setShake(true)
        setTimeout(() => setShake(false), 500)
      }

      // Save progress for anonymous users
      if (anonymous) {
        saveProgress(newAttempts, newRemaining, newSolved, anonymous)
      }
    } catch (err) {
      setError('Failed to submit guess')
    } finally {
      setLoading(false)
    }
  }

  const getFeedbackEmoji = (similarity: number) => {
    if (similarity >= 0.9) return '🔥'
    if (similarity >= 0.8) return '🌟'
    if (similarity >= 0.7) return '✨'
    if (similarity >= 0.6) return '⭐'
    if (similarity >= 0.5) return '🌤️'
    if (similarity >= 0.4) return '💨'
    if (similarity >= 0.3) return '❄️'
    return '🧊'
  }

  const handleGetHint = async () => {
    setHintLoading(true)
    setHintError('')

    try {
      const response = await fetch('/api/hint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locale,
          browserId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setHintError(data.error || 'Failed to get hint')
        return
      }

      setHint(data.hint)
    } catch (err) {
      setHintError('Failed to get hint')
    } finally {
      setHintLoading(false)
    }
  }

  const attemptsUsed = 12 - attemptsRemaining
  const hintAvailable = attemptsUsed >= 9 && !solved
  const remainingForHint = Math.max(0, 9 - attemptsUsed)

  const getFeedbackText = (similarity: number) => {
    if (similarity >= 0.9) return t('onFire')
    if (similarity >= 0.7) return t('veryClose')
    if (similarity >= 0.5) return t('gettingWarmer')
    if (similarity >= 0.3) return t('cold')
    return t('freezing')
  }

  return (
    <div className='relative space-y-6'>
      {showConfetti && <Confetti />}
      <Particles className='h-full' quantity={30} color='#a855f7' />

      <NicknameModal isOpen={showNicknameModal} onSave={handleNicknameSave} onClose={() => setShowNicknameModal(false)} />

      {/* Loading state */}
      {challengeLoading ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Card className='relative overflow-hidden border-2 border-primary/20 shadow-2xl'>
            <div className='absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-purple-500/5' />
            <CardContent className='relative pt-12 pb-12'>
              <div className='text-center'>
                <div className='relative inline-flex items-center justify-center mb-6'>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className='absolute'>
                    <div className='w-20 h-20 rounded-full border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400' />
                  </motion.div>
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Sparkles className='h-12 w-12 text-purple-500' />
                  </motion.div>
                </div>
                <motion.p
                  className='text-lg font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent'
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {t('loading')}
                </motion.p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        /* Main game card */
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
          <Card className='relative overflow-hidden border-2 border-primary/20 shadow-2xl'>
            <div className='absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-purple-500/5' />

            <CardHeader className='relative bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 backdrop-blur-sm'>
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <CardTitle className='text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent'>
                  {t('title')}
                </CardTitle>
              </motion.div>
            </CardHeader>

            <CardContent className='relative pt-6'>
              {/* Category & Attempts Badges */}
              {(category || (!solved && attemptsRemaining > 0)) && (
                <motion.div
                  className='mb-6 flex justify-center flex-wrap gap-3'
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                  {/* Category Badge */}
                  {category && (
                    <motion.div
                      className='inline-flex items-center gap-2 relative overflow-hidden bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 dark:from-purple-900/40 dark:via-pink-900/40 dark:to-purple-900/40 border-2 border-purple-300 dark:border-purple-700 rounded-full px-5 py-2.5 shadow-lg shadow-purple-200/50 dark:shadow-purple-900/30'
                      whileHover={{ scale: 1.05, y: -2 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    >
                      {/* Animated shimmer effect */}
                      <motion.div
                        className='absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent'
                        animate={{
                          x: ['-100%', '200%'],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        style={{ width: '50%' }}
                      />
                      <motion.span
                        className='text-sm font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider relative z-10'
                        animate={{
                          opacity: [0.8, 1, 0.8],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      >
                        {t('category.label')}
                      </motion.span>
                      <motion.span
                        className='text-base font-black text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 dark:from-purple-400 dark:via-pink-400 dark:to-purple-400 bg-clip-text uppercase tracking-wide relative z-10'
                        animate={{
                          backgroundPosition: ['0%', '100%', '0%'],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        style={{ backgroundSize: '200% 100%' }}
                      >
                        {category}
                      </motion.span>
                      <motion.span
                        className='text-xl relative z-10'
                        animate={{
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      >
                        ✨
                      </motion.span>
                    </motion.div>
                  )}

                  {/* Attempts Badge */}
                  {!solved && attemptsRemaining > 0 && (
                    <motion.div
                      key={attemptsRemaining}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                      className='inline-flex items-center gap-2 relative overflow-hidden bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 dark:from-purple-900/40 dark:via-pink-900/40 dark:to-purple-900/40 border-2 border-purple-300 dark:border-purple-700 rounded-full px-5 py-2.5 shadow-lg shadow-purple-200/50 dark:shadow-purple-900/30'
                      whileHover={{ scale: 1.05, y: -2 }}
                    >
                      {/* Animated shimmer effect */}
                      <motion.div
                        className='absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent'
                        animate={{
                          x: ['-100%', '200%'],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        style={{ width: '50%' }}
                      />
                      <motion.span
                        className='text-sm font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider relative z-10'
                        animate={{
                          opacity: [0.8, 1, 0.8],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      >
                        {t('attemptsLeft')}
                      </motion.span>
                      <motion.span
                        initial={{ scale: 1.2, filter: 'brightness(1.5)' }}
                        animate={{
                          scale: 1,
                          filter: 'brightness(1)',
                          backgroundPosition: ['0%', '100%', '0%'],
                        }}
                        transition={{
                          scale: { duration: 0.3, delay: 0.1 },
                          filter: { duration: 0.3, delay: 0.1 },
                          backgroundPosition: { duration: 3, repeat: Infinity, ease: 'linear' },
                        }}
                        className='text-base font-black text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 dark:from-purple-400 dark:via-pink-400 dark:to-purple-400 bg-clip-text uppercase tracking-wide relative z-10 tabular-nums'
                        style={{ backgroundSize: '200% 100%' }}
                      >
                        {attemptsRemaining}
                      </motion.span>
                      {hintAvailable && (
                        <motion.span
                          className='text-xl relative z-10'
                          animate={{
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        >
                          💡
                        </motion.span>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {!solved && attemptsRemaining > 0 && (
                <motion.form
                  onSubmit={handleSubmit}
                  className='space-y-4'
                  animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <div className='flex gap-2 flex-col md:flex-row'>
                    <motion.div className='flex-1' whileFocus={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
                      <Input
                        type='text'
                        placeholder={t('placeholder')}
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        className='h-14 text-lg font-medium border-2 transition-all focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/20'
                        disabled={loading}
                        autoFocus
                      />
                    </motion.div>

                    <CoolMode>
                      <RainbowButton
                        type='submit'
                        disabled={loading || !guess.trim()}
                        size='lg'
                        className='h-14 px-8 text-lg font-bold w-full'
                      >
                        {loading ? (
                          <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                            ⚡
                          </motion.span>
                        ) : (
                          <div className='flex items-center'>
                            <Send className='h-5 w-5 mr-2' />
                            {t('submit')}
                          </div>
                        )}
                      </RainbowButton>
                    </CoolMode>
                  </div>

                  {/* Hint Section */}
                  <AnimatePresence>
                    {!hintAvailable && remainingForHint > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className='bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-3 text-center'
                      >
                        <p className='text-sm text-purple-700 dark:text-purple-300 font-medium flex items-center justify-center gap-2'>
                          <Sparkles className='h-4 w-4' />
                          {t('hint.notAvailable', { remaining: remainingForHint })}
                        </p>
                      </motion.div>
                    )}

                    {hintAvailable && !hint && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className='bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg p-4'
                      >
                        <div className='flex flex-col md:flex-row items-center justify-between gap-3'>
                          <div className='text-center md:text-left'>
                            <p className='text-sm font-bold text-yellow-900 dark:text-yellow-100 flex items-center justify-center md:justify-start gap-2'>
                              <Sparkles className='h-5 w-5' />
                              {t('hint.unlocked')}
                            </p>
                            <p className='text-xs text-yellow-700 dark:text-yellow-300 mt-1'>{t('hint.available')}</p>
                          </div>
                          <Button
                            type='button'
                            onClick={handleGetHint}
                            disabled={hintLoading}
                            className='bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold shadow-lg'
                          >
                            {hintLoading ? t('hint.loading') : t('hint.button')}
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {hint && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className='bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-4'
                      >
                        <div className='flex items-start gap-3'>
                          <div className='flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center'>
                            <span className='text-2xl'>💡</span>
                          </div>
                          <div className='flex-1'>
                            <p className='font-bold text-blue-900 dark:text-blue-100 mb-1'>{t('hint.title')}</p>
                            <p className='text-sm text-blue-800 dark:text-blue-200 italic leading-relaxed'>{hint}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {hintError && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className='text-sm text-orange-600 dark:text-orange-400 font-medium text-center'
                      >
                        {hintError}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className='text-sm text-destructive font-medium'
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Feedback hint */}
                  <AnimatePresence>
                    {lastSimilarity !== null && !solved && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className='flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-200 dark:border-purple-700'
                      >
                        <motion.span
                          className='text-4xl'
                          animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, -10, 0],
                          }}
                          transition={{ duration: 0.5 }}
                        >
                          {getFeedbackEmoji(lastSimilarity)}
                        </motion.span>
                        <div>
                          <p className='font-bold text-purple-900 dark:text-purple-100'>{getFeedbackText(lastSimilarity)}</p>
                          <p className='text-sm text-purple-700 dark:text-purple-300'>
                            {t('similarityLabel')}:{' '}
                            <NumberTicker value={lastSimilarity * 100} decimalPlaces={1} className='text-purple-700 dark:text-purple-300' />
                            %
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.form>
              )}

              {/* Win state */}
              {solved && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', duration: 0.6 }}
                  className='text-center py-12 space-y-6'
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 10, 0],
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className='text-8xl mb-6'
                  >
                    🎉
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <p className='text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4'>
                      {t('solved')}
                    </p>

                    {/* Target Word Display */}
                    {attempts.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                        className='inline-block relative mb-6'
                      >
                        <motion.div
                          className='relative px-8 py-4 rounded-2xl bg-gradient-to-r from-green-100 via-emerald-100 to-green-100 dark:from-green-900/40 dark:via-emerald-900/40 dark:to-green-900/40 border-2 border-green-300 dark:border-green-700 shadow-2xl'
                          whileHover={{ scale: 1.05, y: -2 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                        >
                          {/* Animated shimmer effect */}
                          <motion.div
                            className='absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent rounded-2xl'
                            animate={{
                              x: ['-100%', '200%'],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                            style={{ width: '50%' }}
                          />
                          <div className='relative z-10 flex flex-col items-center gap-2'>
                            <span className='text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wider'>
                              {t('targetWord', { defaultValue: 'The Word Was' })}
                            </span>
                            <motion.span
                              className='text-4xl font-black text-transparent bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 dark:from-green-400 dark:via-emerald-400 dark:to-green-400 bg-clip-text uppercase tracking-wide'
                              animate={{
                                backgroundPosition: ['0%', '100%', '0%'],
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: 'linear',
                              }}
                              style={{ backgroundSize: '200% 100%' }}
                            >
                              {attempts[0].guess}
                            </motion.span>
                            <motion.span
                              className='text-2xl'
                              animate={{
                                rotate: [0, 10, -10, 0],
                                scale: [1, 1.2, 1],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                              }}
                            >
                              ✨
                            </motion.span>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Stats Display */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className='flex justify-center gap-4 flex-wrap'
                  >
                    {/* Attempts Used */}
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      className='px-6 py-3 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 border-2 border-blue-300 dark:border-blue-700 shadow-lg'
                    >
                      <div className='text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1'>
                        {t('attemptsUsed', { defaultValue: 'Attempts Used' })}
                      </div>
                      <div className='text-3xl font-black text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text'>
                        {12 - attemptsRemaining}
                      </div>
                    </motion.div>

                    {/* Attempts Remaining */}
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      className='px-6 py-3 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 border-2 border-purple-300 dark:border-purple-700 shadow-lg'
                    >
                      <div className='text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider mb-1'>
                        {t('attemptsLeft')}
                      </div>
                      <div className='text-3xl font-black text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text'>
                        {attemptsRemaining}
                      </div>
                    </motion.div>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className='text-gray-600 dark:text-gray-400 mt-4'
                  >
                    {t('comeTomorrow')}
                  </motion.p>
                  <NextChallengeCountdown locale={locale} />
                </motion.div>
              )}

              {/* Fail state */}
              {!solved && attemptsRemaining === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className='text-center py-12'
                >
                  <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className='text-8xl mb-6'>
                    😔
                  </motion.div>
                  <p className='text-3xl font-bold text-gray-600'>{t('failed')}</p>
                  <NextChallengeCountdown locale={locale} />
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Attempts history */}
      {!challengeLoading && (
        <AnimatePresence>
          {attempts.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
              <Card className='border-2 border-purple-200/50 shadow-lg'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <TrendingUp className='h-5 w-5 text-purple-600' />
                    {t('yourAttempts')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    <AnimatePresence mode='popLayout'>
                      {attempts.map((attempt, index) => (
                        <motion.div
                          key={`${attempt.guess}-${index}`}
                          layout
                          initial={{ opacity: 0, x: -50, scale: 0.8 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 50, scale: 0.8 }}
                          transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 25,
                          }}
                          className='relative overflow-hidden group'
                        >
                          <motion.div
                            whileHover={{ y: -2 }}
                            transition={{ duration: 0.2 }}
                            className={`relative flex items-center justify-between p-4 rounded-xl border-2 shadow-md overflow-hidden transition-shadow duration-300 group-hover:shadow-xl cursor-pointer ${
                              attempt.similarity >= 0.9
                                ? 'bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/40 dark:via-orange-950/40 dark:to-yellow-950/40 border-orange-300 dark:border-orange-700 group-hover:shadow-orange-200 dark:group-hover:shadow-orange-900/50'
                                : attempt.similarity >= 0.7
                                ? 'bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-purple-950/40 dark:via-pink-950/40 dark:to-purple-950/40 border-purple-300 dark:border-purple-700 group-hover:shadow-purple-200 dark:group-hover:shadow-purple-900/50'
                                : attempt.similarity >= 0.5
                                ? 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 dark:from-blue-950/40 dark:via-cyan-950/40 dark:to-blue-950/40 border-blue-300 dark:border-blue-700 group-hover:shadow-blue-200 dark:group-hover:shadow-blue-900/50'
                                : attempt.similarity >= 0.3
                                ? 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/40 dark:to-slate-900/40 border-gray-300 dark:border-gray-700 group-hover:shadow-gray-200 dark:group-hover:shadow-gray-900/50'
                                : 'bg-gradient-to-br from-slate-100 to-gray-100 dark:from-slate-950/50 dark:to-gray-950/50 border-gray-400 dark:border-gray-600 group-hover:shadow-gray-300 dark:group-hover:shadow-gray-800/50'
                            }`}
                          >
                            <div className='flex items-center gap-3 flex-1'>
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                  delay: index * 0.05,
                                  type: 'spring',
                                  stiffness: 200,
                                }}
                                className={`flex items-center justify-center w-12 h-12 rounded-lg shadow-sm transition-transform duration-200 group-hover:scale-110 group-hover:animate-[wiggle_0.5s_ease-in-out] ${
                                  attempt.similarity >= 0.9
                                    ? 'bg-gradient-to-br from-orange-200 to-yellow-200 dark:from-orange-900/60 dark:to-yellow-900/60'
                                    : attempt.similarity >= 0.7
                                    ? 'bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-900/60 dark:to-pink-900/60'
                                    : attempt.similarity >= 0.5
                                    ? 'bg-gradient-to-br from-blue-200 to-cyan-200 dark:from-blue-900/60 dark:to-cyan-900/60'
                                    : 'bg-gradient-to-br from-gray-200 to-slate-200 dark:from-gray-800/60 dark:to-slate-800/60'
                                }`}
                              >
                                <span className='text-3xl group-hover:inline-block group-hover:animate-[wiggle_0.5s_ease-in-out]'>
                                  {getFeedbackEmoji(attempt.similarity)}
                                </span>
                              </motion.div>
                              <div className='flex-1 min-w-0'>
                                <TextAnimate
                                  animation='slideLeft'
                                  by='character'
                                  className='font-black text-xl text-gray-900 dark:text-gray-100 mb-0.5'
                                  once
                                >
                                  {attempt.guess}
                                </TextAnimate>
                                <p className='text-xs font-semibold text-muted-foreground flex items-center gap-1.5'>
                                  <span className='inline-block w-1.5 h-1.5 rounded-full bg-current' />
                                  {getSimilarityLabel(attempt.similarity, t)}
                                </p>
                              </div>
                            </div>
                            <div className='text-right ml-3'>
                              <motion.div
                                initial={{ scale: 0, rotate: 90 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: index * 0.05, type: 'spring', stiffness: 200 }}
                              >
                                <p className={`text-3xl font-black leading-none ${getSimilarityColor(attempt.similarity)}`}>
                                  <NumberTicker
                                    value={attempt.similarity * 100}
                                    decimalPlaces={1}
                                    className={getSimilarityColor(attempt.similarity)}
                                  />
                                  %
                                </p>
                              </motion.div>
                              <p className='text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-end gap-1 mt-0.5'>
                                <Sparkles className='h-2.5 w-2.5' />
                                {t('similarityLabel')}
                              </p>
                            </div>

                            {/* Progress bar */}
                            <div className='absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 overflow-hidden rounded-b-xl'>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${attempt.similarity * 100}%` }}
                                transition={{ delay: index * 0.05 + 0.2, duration: 0.8, ease: 'easeOut' }}
                                className={`h-full relative ${
                                  attempt.similarity >= 0.9
                                    ? 'bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500'
                                    : attempt.similarity >= 0.7
                                    ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600'
                                    : attempt.similarity >= 0.5
                                    ? 'bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600'
                                    : attempt.similarity >= 0.3
                                    ? 'bg-gradient-to-r from-gray-400 to-gray-500'
                                    : 'bg-gradient-to-r from-gray-500 to-gray-600'
                                }`}
                              >
                                <motion.div
                                  className='absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent'
                                  animate={{
                                    x: ['-100%', '200%'],
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'linear',
                                    delay: index * 0.1,
                                  }}
                                  style={{ width: '50%' }}
                                />
                              </motion.div>
                            </div>
                          </motion.div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
