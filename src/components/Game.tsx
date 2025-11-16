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
import AchievementPopup from '@/components/game/AchievementPopup'
import GameBadges from '@/components/game/GameBadges'
import GuessForm from '@/components/game/GuessForm'
import HintSection from '@/components/game/HintSection'
import AttemptsHistory from '@/components/game/AttemptsHistory'
import WinState from '@/components/game/WinState'
import FailState from '@/components/game/FailState'
import LoadingState from '@/components/game/LoadingState'
import ShareSuggestionPopup from '@/components/ShareSuggestionPopup'

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
  const [showPopup, setShowPopup] = useState(false)
  const [shake, setShake] = useState(false)
  const [showNicknameModal, setShowNicknameModal] = useState(false)
  const [nickname, setNickname] = useState<string | null>(null)
  const [browserId, setBrowserId] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)
  const [hintLoading, setHintLoading] = useState(false)
  const [hintError, setHintError] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [challengeLoading, setChallengeLoading] = useState(true)
  const [showShareSuggestion, setShowShareSuggestion] = useState(false)

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
        setAttemptsRemaining(data.attemptsRemaining ?? 12)
        setSolved(data.solved ?? false)
        setCategory(data.category ?? null)
      } catch (error) {
        console.error('Error loading progress from backend:', error)
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
        setShake(true)
        setTimeout(() => setShake(false), 500)
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

      // Show popup for all guesses
      setShowPopup(true)
      // Auto-hide popup after 4 seconds
      setTimeout(() => {
        setShowPopup(false)
        // Clear similarity after animation completes
        setTimeout(() => {
          setLastSimilarity(null)
        }, 500)
      }, 4000)

      // Show confetti on win
      if (newSolved) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)

        // Check if this is the user's first win and show share suggestion
        const hasShownShareSuggestion = localStorage.getItem('hasShownShareSuggestion')
        if (!hasShownShareSuggestion) {
          setTimeout(() => {
            setShowShareSuggestion(true)
            localStorage.setItem('hasShownShareSuggestion', 'true')
          }, 2000) // Show after 2 seconds to let confetti settle
        }
      }

      // Show share suggestion on loss (no more attempts)
      if (!newSolved && newRemaining === 0) {
        const hasShownShareSuggestion = localStorage.getItem('hasShownShareSuggestion')
        if (!hasShownShareSuggestion) {
          setTimeout(() => {
            setShowShareSuggestion(true)
            localStorage.setItem('hasShownShareSuggestion', 'true')
          }, 1500) // Show after 1.5 seconds
        }
      }

      // Shake on very low similarity
      if (data.similarity < 0.3) {
        setShake(true)
        setTimeout(() => setShake(false), 500)
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

      <NicknameModal
        isOpen={showNicknameModal}
        onSave={handleNicknameSave}
        onClose={() => setShowNicknameModal(false)}
        browserId={browserId}
        locale={locale}
      />

      <ShareSuggestionPopup show={showShareSuggestion} onDismiss={() => setShowShareSuggestion(false)} />

      {/* Loading state */}
      {challengeLoading ? (
        <LoadingState />
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

            <CardContent className='relative pt-6 flex flex-col gap-4'>
              {/* Category & Attempts Badges */}
              <GameBadges category={category} solved={solved} attemptsRemaining={attemptsRemaining} hintAvailable={hintAvailable} />

              {!solved && attemptsRemaining > 0 && (
                <>
                  <GuessForm guess={guess} loading={loading} shake={shake} onGuessChange={setGuess} onSubmit={handleSubmit} />

                  {/* Hint Section */}
                  <HintSection
                    hintAvailable={hintAvailable}
                    remainingForHint={remainingForHint}
                    hint={hint}
                    hintLoading={hintLoading}
                    hintError={hintError}
                    onGetHint={handleGetHint}
                  />

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
                </>
              )}

              {/* Achievement Pop-up - outside conditional so it shows on last attempt */}
              <AchievementPopup
                similarity={lastSimilarity}
                isVisible={showPopup}
                getFeedbackEmoji={getFeedbackEmoji}
                getFeedbackText={getFeedbackText}
              />

              {/* Win state */}
              {solved && attempts.length > 0 && (
                <WinState
                  attemptsUsed={12 - attemptsRemaining}
                  attemptsRemaining={attemptsRemaining}
                  targetWord={attempts[0].guess}
                  locale={locale}
                />
              )}

              {/* Fail state */}
              {!solved && attemptsRemaining === 0 && <FailState locale={locale} />}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Attempts history */}
      {!challengeLoading && (
        <AnimatePresence>
          {attempts.length > 0 && <AttemptsHistory attempts={attempts} getFeedbackEmoji={getFeedbackEmoji} />}
        </AnimatePresence>
      )}
    </div>
  )
}
