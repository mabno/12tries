/**
 * Script para generar un nuevo Daily Challenge (DEV)
 *
 * Este script:
 * 1. Elimina el challenge actual del día
 * 2. Genera un nuevo challenge con una palabra aleatoria
 * 3. Limpia el progreso de usuarios para el nuevo challenge
 *
 * Uso:
 *   npm run challenge:new
 *   npm run challenge:new -- --word=cat
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Get word from command line argument
const args = process.argv.slice(2)
const wordArg = args.find((arg) => arg.startsWith('--word='))
const specificWord = wordArg ? wordArg.split('=')[1] : null

async function main() {
  console.log('🎯 Generating new Daily Challenge...\n')

  // Get today's date (UTC)
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  console.log(`📅 Date: ${today.toISOString().split('T')[0]}`)

  // Find existing challenge for today
  const existingChallenge = await prisma.dailyChallenge.findFirst({
    where: {
      date: today,
    },
    include: {
      word: true,
      dailyProgress: true,
    },
  })

  if (existingChallenge) {
    console.log(`\n❌ Removing existing challenge...`)
    console.log(`   Word: ${existingChallenge.word.textEn} / ${existingChallenge.word.textEs}`)
    console.log(`   Progress entries: ${existingChallenge.dailyProgress.length}`)

    // Delete daily progress entries first (due to foreign key constraint)
    await prisma.dailyProgress.deleteMany({
      where: {
        challengeId: existingChallenge.id,
      },
    })

    // Delete attempts for today
    await prisma.attempt.deleteMany({
      where: {
        wordId: existingChallenge.wordId,
        attemptedAt: {
          gte: today,
        },
      },
    })

    // Delete the challenge
    await prisma.dailyChallenge.delete({
      where: {
        id: existingChallenge.id,
      },
    })

    console.log('   ✓ Removed')
  }

  // Select word (specific or random)
  let selectedWord

  if (specificWord) {
    // Try to find the specific word (check both English and Spanish)
    selectedWord = await prisma.word.findFirst({
      where: {
        OR: [{ textEn: specificWord.toLowerCase() }, { textEs: specificWord.toLowerCase() }],
      },
    })

    if (!selectedWord) {
      console.log(`\n❌ Word "${specificWord}" not found in database`)
      console.log('   Available words: run "npm run db:studio" to see all words')
      process.exit(1)
    }

    console.log(`\n✅ Using specified word: ${selectedWord.textEn} / ${selectedWord.textEs}`)
  } else {
    // Get the last 20 challenges to avoid repeating words
    const recentChallenges = await prisma.dailyChallenge.findMany({
      take: 20,
      orderBy: { date: 'desc' },
      select: { wordId: true },
    })

    const recentWordIds = recentChallenges.map((c) => c.wordId)

    console.log(`\n🔍 Excluding ${recentWordIds.length} recently used words...`)

    // Get words that haven't been used recently
    const words = await prisma.word.findMany({
      where: {
        id: {
          notIn: recentWordIds,
        },
      },
    })

    if (words.length === 0) {
      console.log('\n⚠️  All words have been used recently. Selecting from all words...')
      const allWords = await prisma.word.findMany()

      if (allWords.length === 0) {
        console.log('\n❌ No words found in database')
        console.log('   Run: npm run db:seed')
        process.exit(1)
      }

      selectedWord = allWords[Math.floor(Math.random() * allWords.length)]
    } else {
      selectedWord = words[Math.floor(Math.random() * words.length)]
    }

    console.log(`\n🎲 Randomly selected: ${selectedWord.textEn} / ${selectedWord.textEs}`)
  }

  // Create new challenge
  const newChallenge = await prisma.dailyChallenge.create({
    data: {
      wordId: selectedWord.id,
      date: today,
    },
    include: {
      word: true,
    },
  })

  console.log('\n✅ New challenge created!')
  console.log(`   ID: ${newChallenge.id}`)
  console.log(`   English: ${newChallenge.word.textEn}`)
  console.log(`   Spanish: ${newChallenge.word.textEs}`)
  console.log(`   Length: EN=${newChallenge.word.textEn.length}, ES=${newChallenge.word.textEs.length}`)

  // Show statistics
  const totalWords = await prisma.word.count()
  const totalChallenges = await prisma.dailyChallenge.count()
  const totalUsers = await prisma.user.count()

  console.log('\n📊 Database Statistics:')
  console.log(`   Total words: ${totalWords}`)
  console.log(`   Total challenges: ${totalChallenges}`)
  console.log(`   Total users: ${totalUsers}`)

  console.log('\n🎉 Done! Start your dev server and try the new challenge!')
}

main()
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
