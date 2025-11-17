import { PrismaClient } from '@prisma/client'
import { generateEmbedding, vectorToString } from '../src/lib/embeddings'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Function to read words from CSV
function readWordsFromCSV(): Array<{ textEn: string; textEs: string }> {
  const csvPath = path.join(__dirname, '..', 'data', 'palabras.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const lines = csvContent.split('\n').filter((line) => line.trim())

  // Skip header line
  const words = lines.slice(1).map((line) => {
    const [spanish, english] = line.split(',').map((s) => s.trim())
    return {
      textEn: english,
      textEs: spanish,
    }
  })

  return words
}

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  console.log('🗑️  Clearing existing data...')
  await prisma.attempt.deleteMany()
  await prisma.dailyProgress.deleteMany()
  await prisma.dailyChallenge.deleteMany()
  await prisma.word.deleteMany()

  console.log('📝 Creating words with embeddings...')

  // Load words from CSV
  const WORDS = readWordsFromCSV().slice(0, 4)
  console.log(`📊 Loaded ${WORDS.length} words from CSV`)

  for (const wordData of WORDS) {
    try {
      // Generate embeddings for both English and Spanish versions
      const embeddingEn = await generateEmbedding(wordData.textEn)
      const embeddingEs = await generateEmbedding(wordData.textEs)

      // Convert embeddings to string format for pgvector
      const embeddingEnStr = vectorToString(embeddingEn)
      const embeddingEsStr = vectorToString(embeddingEs)

      await prisma.$executeRaw`
        INSERT INTO words (id, "textEn", "textEs", embedding, "embeddingEs", "createdAt")
        VALUES (
          gen_random_uuid()::text,
          ${wordData.textEn},
          ${wordData.textEs},
          ${embeddingEnStr}::vector(3072),
          ${embeddingEsStr}::vector(3072),
          NOW()
        )
      `

      console.log(`✅ Created word: ${wordData.textEn} / ${wordData.textEs}`)
    } catch (error) {
      console.error(`❌ Error creating word ${wordData.textEn}:`, error)
    }
  }

  // Create today's challenge
  console.log('🎯 Creating daily challenge...')
  const words = await prisma.word.findMany()
  const randomWord = words[Math.floor(Math.random() * words.length)]

  await prisma.dailyChallenge.create({
    data: {
      wordId: randomWord.id,
      date: new Date(),
    },
  })

  console.log('✨ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
