/**
 * Script para ver el Daily Challenge actual
 *
 * Muestra información sobre el challenge del día
 *
 * Uso:
 *   npm run challenge:info
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🎯 Current Daily Challenge Info\n')

  // Get today's date (UTC)
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  console.log(`📅 Date: ${today.toISOString().split('T')[0]}\n`)

  // Find challenge for today
  const challenge = await prisma.dailyChallenge.findFirst({
    where: {
      date: today,
    },
    include: {
      word: true,
      dailyProgress: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              nickname: true,
              isAnonymous: true,
            },
          },
        },
        orderBy: {
          bestSimilarity: 'desc',
        },
      },
    },
  })

  if (!challenge) {
    console.log('❌ No challenge found for today')
    console.log('\n💡 Create one with: npm run challenge:new')
    return
  }

  console.log('📝 Challenge Details:')
  console.log(`   ID: ${challenge.id}`)
  console.log(`   English: ${challenge.word.textEn}`)
  console.log(`   Spanish: ${challenge.word.textEs}`)
  console.log(`   Length: EN=${challenge.word.textEn.length}, ES=${challenge.word.textEs.length}`)

  // Get attempts count
  const attemptsCount = await prisma.attempt.count({
    where: {
      wordId: challenge.wordId,
      attemptedAt: {
        gte: today,
      },
    },
  })

  console.log(`\n📊 Statistics:`)
  console.log(`   Total players: ${challenge.dailyProgress.length}`)
  console.log(`   Total attempts: ${attemptsCount}`)

  const solved = challenge.dailyProgress.filter((p) => p.solved).length
  const solveRate = challenge.dailyProgress.length > 0 ? ((solved / challenge.dailyProgress.length) * 100).toFixed(1) : '0'

  console.log(`   Solved: ${solved}/${challenge.dailyProgress.length} (${solveRate}%)`)

  if (challenge.dailyProgress.length > 0) {
    const avgAttempts = challenge.dailyProgress.reduce((sum, p) => sum + p.attemptsCount, 0) / challenge.dailyProgress.length
    const avgSimilarity = challenge.dailyProgress.reduce((sum, p) => sum + p.bestSimilarity, 0) / challenge.dailyProgress.length

    console.log(`   Avg attempts: ${avgAttempts.toFixed(1)}`)
    console.log(`   Avg best similarity: ${(avgSimilarity * 100).toFixed(1)}%`)
  }

  // Top 5 players
  if (challenge.dailyProgress.length > 0) {
    console.log('\n🏆 Top Players (by best similarity):')
    const top5 = challenge.dailyProgress.slice(0, 5)
    top5.forEach((progress, index) => {
      const playerName = progress.user.isAnonymous ? progress.user.nickname || 'Anonymous' : progress.user.name || 'Unknown'
      const status = progress.solved ? '✓' : '✗'
      console.log(
        `   ${index + 1}. ${playerName} - Attempts: ${progress.attemptsCount}, Best: ${(progress.bestSimilarity * 100).toFixed(
          1
        )}% ${status}`
      )
    })
  }

  // Show word distribution
  const totalWords = await prisma.word.count()
  const totalChallenges = await prisma.dailyChallenge.count()
  const uniqueWords = await prisma.dailyChallenge.findMany({
    select: { wordId: true },
    distinct: ['wordId'],
  })

  console.log('\n📚 Word Pool:')
  console.log(`   Total words available: ${totalWords}`)
  console.log(`   Total challenges created: ${totalChallenges}`)
  console.log(`   Unique words used: ${uniqueWords.length}`)
  console.log(`   Words never used: ${totalWords - uniqueWords.length}`)
}

main()
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
