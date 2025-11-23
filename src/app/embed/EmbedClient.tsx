'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { getSimilarityColor, getSimilarityLabel } from '@/lib/utils'
import { Send, Trophy, Crown, Medal, Award, Target, HelpCircle } from 'lucide-react'
import Confetti from '@/components/ui/confetti'
import { NextIntlClientProvider } from 'next-intl'

interface Attempt {
  guess: string
  similarity: number
  attemptedAt: Date
}

interface LeaderboardEntry {
  rank: number
  name: string
  image: string
  attempts: number
  score: number
  solved: boolean
  bestSimilarity: number
}

// Messages for translations
const messages = {
  en: {
    embed: {
      gameTitle: 'Guess the Word',
      enterNickname: 'Enter a nickname to play',
      yourNickname: 'Your nickname',
      startPlaying: 'Start Playing',
      playingAs: 'Playing as:',
      youWon: '🎉 You Won!',
      gameOver: '😢 Game Over',
      attemptsLeft: 'Attempts Left',
      category: 'Category:',
      enterGuess: 'Enter your guess...',
      theWordWas: 'The word was:',
      solvedIn: 'Solved in {count} attempts!',
      yourAttempts: 'Your Attempts:',
      todayLeaderboard: "Today's Leaderboard",
      attempts: 'attempts',
      noPlayers: 'No one has played today yet. Be the first!',
      playFullVersion: 'Play the full version →',
      howToPlay: 'How to Play',
      howToPlayTitle: 'How to Play',
      howToPlayDesc: 'Simple guide to get started',
      objective: 'Game Objective',
      objectiveText: 'Guess the secret word of the day. You have 12 tries to find it!',
      howItWorks: 'How does it work?',
      howItWorksText:
        'When you write a word and send it, the game tells you how similar your word is to the secret word. The closer to 100%, the more similar your word is in meaning.',
      exampleTitle: 'Example',
      exampleText:
        'If the secret word is "happy" and you write "joyful", you\'ll get a high percentage because both words mean similar things. If you write "table", you\'ll get a low percentage because they have nothing in common.',
      tips: 'Helpful Tips',
      tip1: 'Think about words that mean the same or similar things',
      tip2: 'Pay attention to the category - it gives you a big clue!',
      tip3: "Each guess shows you if you're on the right track or need to think differently",
    },
  },
  es: {
    embed: {
      gameTitle: 'Adivina la Palabra',
      enterNickname: 'Ingresa un apodo para jugar',
      yourNickname: 'Tu apodo',
      startPlaying: 'Comenzar a Jugar',
      playingAs: 'Jugando como:',
      youWon: '🎉 ¡Ganaste!',
      gameOver: '😢 Juego Terminado',
      attemptsLeft: 'Intentos Restantes',
      category: 'Categoría:',
      enterGuess: 'Ingresa tu intento...',
      theWordWas: 'La palabra era:',
      solvedIn: '¡Resuelto en {count} intentos!',
      yourAttempts: 'Tus Intentos:',
      todayLeaderboard: 'Clasificación de Hoy',
      attempts: 'intentos',
      noPlayers: 'Nadie ha jugado hoy aún. ¡Sé el primero!',
      playFullVersion: 'Juega la versión completa →',
      howToPlay: 'Cómo Jugar',
      howToPlayTitle: 'Cómo Jugar',
      howToPlayDesc: 'Guía simple para empezar',
      objective: 'Objetivo del Juego',
      objectiveText: 'Adivina la palabra secreta del día. ¡Tienes 12 intentos para encontrarla!',
      howItWorks: '¿Cómo funciona?',
      howItWorksText:
        'Cuando escribes una palabra y la envías, el juego te dice qué tan parecida es tu palabra a la palabra secreta. Mientras más cerca del 100%, más parecido es el significado.',
      exampleTitle: 'Ejemplo',
      exampleText:
        'Si la palabra secreta es "feliz" y tú escribes "alegre", obtendrás un porcentaje alto porque ambas palabras significan cosas parecidas. Si escribes "mesa", obtendrás un porcentaje bajo porque no tienen nada que ver.',
      tips: 'Consejos Útiles',
      tip1: 'Piensa en palabras que signifiquen lo mismo o algo parecido',
      tip2: '¡Fíjate en la categoría - te da una gran pista!',
      tip3: 'Cada intento te muestra si vas por buen camino o necesitas pensar diferente',
    },
  },
}

export default function EmbedClient() {
  const [locale, setLocale] = useState<'en' | 'es'>('en')
  const [guess, setGuess] = useState('')
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [attemptsRemaining, setAttemptsRemaining] = useState(12)
  const [solved, setSolved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [browserId, setBrowserId] = useState<string | null>(null)
  const [nickname, setNickname] = useState<string>('')
  const [nicknameSet, setNicknameSet] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [category, setCategory] = useState<string | null>(null)
  const [wordLength, setWordLength] = useState<number | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [targetWord, setTargetWord] = useState<string | null>(null)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  // Get locale from query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const lang = params.get('lang') || params.get('locale') || 'en'
    // Validate locale (only allow 'en' or 'es')
    setLocale(['en', 'es'].includes(lang) ? (lang as 'en' | 'es') : 'en')
  }, [])

  // Initialize browserId
  useEffect(() => {
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
      setNicknameSet(true)
    }
  }, [])

  // Load progress
  useEffect(() => {
    const loadProgress = async () => {
      if (!browserId) return

      try {
        const url = new URL('/api/challenge', window.location.origin)
        url.searchParams.set('locale', locale)
        url.searchParams.set('browserId', browserId)

        const response = await fetch(url.toString())
        if (!response.ok) throw new Error('Failed to fetch challenge')

        const data = await response.json()

        const loadedAttempts = (data.attempts || []).map((a: any) => ({
          ...a,
          attemptedAt: new Date(a.attemptedAt),
        }))

        setAttempts(loadedAttempts)
        setAttemptsRemaining(data.attemptsRemaining ?? 12)
        setSolved(data.solved ?? false)
        setCategory(data.category ?? null)
        setWordLength(data.wordLength ?? null)
      } catch (error) {
        console.error('Error loading progress:', error)
      }
    }

    if (browserId && locale) {
      loadProgress()
    }
  }, [browserId, locale])

  // Load leaderboard
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`/api/leaderboard?daysAgo=0&locale=${locale}`)
        if (!response.ok) return

        const data = await response.json()
        setLeaderboard(data.leaderboard?.slice(0, 5) || [])
        setTargetWord(data.targetWord)
      } catch (err) {
        console.error('Failed to load leaderboard:', err)
      }
    }

    fetchLeaderboard()
  }, [solved, locale])

  const handleNicknameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (nickname.trim().length >= 2) {
      localStorage.setItem('nickname', nickname.trim())
      setNicknameSet(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!guess.trim() || loading || !nicknameSet) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guess: guess.trim(),
          locale: locale,
          attemptsUsed: 12 - attemptsRemaining,
          browserId,
          nickname,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'An error occurred')
        setLoading(false)
        return
      }

      const newAttempt = {
        guess: guess.trim(),
        similarity: data.similarity,
        attemptedAt: new Date(),
      }

      setAttempts([newAttempt, ...attempts])
      setAttemptsRemaining(data.attemptsRemaining)
      setSolved(data.correct)
      setGuess('')

      if (data.correct) {
        setShowConfetti(true)
        setShowLeaderboard(true)
        setTimeout(() => setShowConfetti(false), 5000)
      }
    } catch (err) {
      setError('Failed to submit guess')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className='h-5 w-5 text-yellow-500' />
    if (rank === 2) return <Medal className='h-5 w-5 text-gray-400' />
    if (rank === 3) return <Award className='h-5 w-5 text-amber-600' />
    return <span className='text-sm font-medium text-gray-600'>#{rank}</span>
  }

  if (!nicknameSet) {
    const t = messages[locale].embed
    return (
      <div className='min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle className='text-2xl text-center'>{t.gameTitle}</CardTitle>
            <CardDescription className='text-center'>{t.enterNickname}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleNicknameSubmit} className='space-y-4'>
              <Input
                type='text'
                placeholder={t.yourNickname}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                minLength={2}
                maxLength={20}
                required
                className='text-center text-lg'
              />
              <Button type='submit' className='w-full' disabled={nickname.trim().length < 2}>
                {t.startPlaying}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  const t = messages[locale].embed

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4'>
      {showConfetti && <Confetti />}

      <div className='max-w-4xl mx-auto space-y-4'>
        <div className='text-center mb-4'>
          <div className='flex flex-col items-center gap-3 mb-2'>
            <h1 className='text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>{t.gameTitle}</h1>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant='outline' size='sm' className='gap-2 hover:bg-purple-100'>
                  <HelpCircle className='h-4 w-4' />
                  {t.howToPlay}
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                  <DialogTitle className='text-2xl'>{t.howToPlayTitle}</DialogTitle>
                  <DialogDescription>{t.howToPlayDesc}</DialogDescription>
                </DialogHeader>
                <div className='space-y-4 mt-4'>
                  {/* Objective */}
                  <div className='bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg'>
                    <h3 className='font-bold text-lg mb-2 text-purple-900 dark:text-purple-100'>{t.objective}</h3>
                    <p className='text-gray-700 dark:text-gray-300'>{t.objectiveText}</p>
                  </div>

                  {/* How it works */}
                  <div>
                    <h3 className='font-bold text-lg mb-2'>{t.howItWorks}</h3>
                    <p className='text-gray-600 dark:text-gray-300 leading-relaxed'>{t.howItWorksText}</p>
                  </div>

                  {/* Example */}
                  <div className='bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500'>
                    <h3 className='font-bold text-lg mb-2 text-blue-900 dark:text-blue-100'>{t.exampleTitle}</h3>
                    <p className='text-gray-700 dark:text-gray-300 leading-relaxed'>{t.exampleText}</p>
                  </div>

                  {/* Tips */}
                  <div>
                    <h3 className='font-bold text-lg mb-3'>{t.tips}</h3>
                    <ul className='space-y-2'>
                      <li className='flex gap-2'>
                        <span className='text-purple-600 font-bold'>•</span>
                        <span className='text-gray-600 dark:text-gray-300'>{t.tip1}</span>
                      </li>
                      <li className='flex gap-2'>
                        <span className='text-purple-600 font-bold'>•</span>
                        <span className='text-gray-600 dark:text-gray-300'>{t.tip2}</span>
                      </li>
                      <li className='flex gap-2'>
                        <span className='text-purple-600 font-bold'>•</span>
                        <span className='text-gray-600 dark:text-gray-300'>{t.tip3}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <p className='text-sm text-gray-600'>
            {t.playingAs} {nickname}
          </p>
        </div>

        <div className='grid md:grid-cols-2 gap-4'>
          {/* Game Section */}
          <Card>
            <CardHeader>
              <CardTitle>{solved ? t.youWon : attemptsRemaining === 0 ? t.gameOver : `${attemptsRemaining} ${t.attemptsLeft}`}</CardTitle>
              {category && (
                <CardDescription>
                  {t.category} {category}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className='space-y-4'>
              {!solved && attemptsRemaining > 0 && (
                <form onSubmit={handleSubmit} className='flex gap-2'>
                  <Input
                    type='text'
                    placeholder={t.enterGuess}
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    disabled={loading || solved}
                    maxLength={30}
                    className='flex-1'
                  />
                  <Button type='submit' disabled={loading || !guess.trim() || solved}>
                    <Send className='h-4 w-4' />
                  </Button>
                </form>
              )}

              {error && <p className='text-sm text-red-500'>{error}</p>}

              {solved && targetWord && (
                <div className='text-center p-4 bg-green-100 rounded-lg'>
                  <p className='text-lg font-bold text-green-800'>{t.theWordWas}</p>
                  <p className='text-2xl font-black text-green-900'>{targetWord}</p>
                  <p className='text-sm text-green-700 mt-2'>{t.solvedIn.replace('{count}', String(12 - attemptsRemaining))}</p>
                </div>
              )}

              {!solved && attemptsRemaining === 0 && targetWord && (
                <div className='text-center p-4 bg-red-100 rounded-lg'>
                  <p className='text-lg font-bold text-red-800'>{t.gameOver}</p>
                  <p className='text-xl font-black text-red-900'>
                    {t.theWordWas} {targetWord}
                  </p>
                </div>
              )}

              {/* Attempts History */}
              {attempts.length > 0 && (
                <div className='space-y-2 max-h-64 overflow-y-auto'>
                  <h3 className='font-semibold text-sm'>{t.yourAttempts}</h3>
                  <AnimatePresence>
                    {attempts.map((attempt, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className='flex justify-between items-center p-2 rounded bg-gray-50'
                      >
                        <span className='font-medium'>{attempt.guess}</span>
                        <span
                          className='px-2 py-1 rounded text-xs font-bold'
                          style={{
                            backgroundColor: getSimilarityColor(attempt.similarity),
                            color: 'white',
                          }}
                        >
                          {(attempt.similarity * 100).toFixed(1)}%
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Leaderboard Section */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Trophy className='h-5 w-5 text-yellow-500' />
                {t.todayLeaderboard}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboard.length > 0 ? (
                <div className='space-y-2'>
                  {leaderboard.map((entry) => (
                    <motion.div
                      key={entry.rank}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: entry.rank * 0.1 }}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        entry.rank <= 3 ? 'bg-gradient-to-r from-purple-50 to-pink-50' : 'bg-gray-50'
                      }`}
                    >
                      <div className='flex items-center gap-3'>
                        {getRankIcon(entry.rank)}
                        <div>
                          <p className='font-semibold text-sm'>{entry.name}</p>
                          {entry.solved && (
                            <p className='text-xs text-gray-600'>
                              {entry.attempts} {t.attempts} • {entry.score} pts
                            </p>
                          )}
                        </div>
                      </div>
                      {entry.solved ? (
                        <Target className='h-4 w-4 text-green-600' />
                      ) : (
                        <span className='text-xs text-gray-500'>{(entry.bestSimilarity * 100).toFixed(0)}%</span>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className='text-sm text-gray-500 text-center py-8'>{t.noPlayers}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className='text-center text-xs text-gray-500 mt-4'>
          <a href={window.location.origin} target='_blank' rel='noopener noreferrer' className='hover:text-purple-600 underline'>
            {t.playFullVersion}
          </a>
        </div>
      </div>
    </div>
  )
}
