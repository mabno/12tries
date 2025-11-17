'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HelpCircle, Target, TrendingUp, Clock, Trophy, Flame, Snowflake, Brain } from 'lucide-react'
import { Particles } from '@/components/ui/particles'
import SemanticExplanationDialog from '@/components/SemanticExplanationDialog'

export default function HowToPlayPage({ params }: { params: { locale: string } }) {
  const t = useTranslations('howToPlay')
  const [showSemanticDialog, setShowSemanticDialog] = useState(false)

  const rules = [
    { key: 'rule1', icon: Target, color: 'text-blue-500' },
    { key: 'rule2', icon: TrendingUp, color: 'text-green-500' },
    { key: 'rule3', icon: Flame, color: 'text-orange-500' },
    { key: 'rule4', icon: Snowflake, color: 'text-cyan-500', hasButton: true },
    { key: 'rule5', icon: Clock, color: 'text-purple-500' },
  ]

  const tGame = useTranslations('game')

  const similarityGuide = [
    { label: '90%+', emoji: '🔥', feedback: tGame('onFire'), color: 'bg-red-500' },
    { label: '70-89%', emoji: '✨', feedback: tGame('veryClose'), color: 'bg-orange-500' },
    { label: '50-69%', emoji: '🌤️', feedback: tGame('gettingWarmer'), color: 'bg-yellow-500' },
    { label: '30-49%', emoji: '❄️', feedback: tGame('cold'), color: 'bg-blue-500' },
    { label: '0-29%', emoji: '🧊', feedback: tGame('freezing'), color: 'bg-cyan-500' },
  ]

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 relative overflow-hidden'>
      {/* Background particles */}
      <div className='fixed inset-0 pointer-events-none'>
        <Particles className='h-full' quantity={50} color='#a855f7' />
      </div>

      {/* Main content */}
      <main className='container mx-auto px-4 py-8 relative z-10 max-w-4xl'>
        <div className='space-y-6'>
          {/* Rules Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className='relative overflow-hidden border-2 border-purple-200/50 shadow-2xl'>
              <div className='absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-purple-500/5' />

              <CardHeader className='relative bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 backdrop-blur-sm'>
                <CardTitle className='text-3xl font-bold flex items-center gap-3'>
                  <HelpCircle className='h-8 w-8 text-purple-500' />
                  <span className='bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent'>
                    {t('title')}
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className='relative p-6 space-y-4'>
                {rules.map((rule, index) => {
                  const Icon = rule.icon
                  return (
                    <motion.div
                      key={rule.key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className='flex items-start gap-4 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-purple-200/50 hover:border-purple-400 transition-all hover:shadow-md'
                    >
                      <div className={`flex-shrink-0 p-3 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20`}>
                        <Icon className={`h-6 w-6 ${rule.color}`} />
                      </div>
                      <div className='flex-1'>
                        <p className='text-lg text-gray-700 dark:text-gray-200'>{t(rule.key as any)}</p>
                        {rule.hasButton && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setShowSemanticDialog(true)}
                            className='mt-3 gap-2 border-purple-300 hover:bg-purple-50 dark:border-purple-700 dark:hover:bg-purple-900/30'
                          >
                            <Brain className='h-4 w-4' />
                            {t('whatIsProximity')}
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </CardContent>
            </Card>
          </motion.div>

          {/* Similarity Guide Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <Card className='relative overflow-hidden border-2 border-purple-200/50 shadow-2xl'>
              <div className='absolute inset-0 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-blue-500/5' />

              <CardHeader className='relative bg-gradient-to-r from-orange-500/10 via-red-500/10 to-blue-500/10 backdrop-blur-sm'>
                <CardTitle className='text-2xl font-bold flex items-center gap-3'>
                  <TrendingUp className='h-7 w-7 text-orange-500' />
                  {t('similarityGuide')}
                </CardTitle>
              </CardHeader>

              <CardContent className='relative p-6'>
                <div className='space-y-3'>
                  {similarityGuide.map((guide, index) => (
                    <motion.div
                      key={guide.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className='flex items-center gap-4 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all'
                    >
                      <div
                        className={`w-20 h-10 ${guide.color} rounded-full flex items-center justify-center text-white font-bold text-sm`}
                      >
                        {guide.label}
                      </div>
                      <div className='text-4xl'>{guide.emoji}</div>
                      <div className='flex-1'>
                        <p className='font-semibold text-lg text-gray-800 dark:text-gray-200'>{guide.feedback}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className='mt-6 p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg border-2 border-purple-300 dark:border-purple-700'
                >
                  <p className='text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2'>
                    <Trophy className='h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5' />
                    <span>
                      <strong>{t('tip')}</strong> {t('tipText')}
                    </span>
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className='text-center'
          >
            <Link href={`/${params.locale}`}>
              <Button
                size='lg'
                className='gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transition-all'
              >
                <Target className='h-5 w-5' />
                {t('startPlaying')}
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>

      <SemanticExplanationDialog open={showSemanticDialog} onOpenChange={setShowSemanticDialog} />
    </div>
  )
}
