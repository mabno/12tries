import { PrismaClient } from '@prisma/client'
import { generateEmbedding, vectorToString } from '../src/lib/embeddings'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Starting embeddings update...')

  // Fetch all words from database
  const words = await prisma.word.findMany({
    select: {
      id: true,
      textEn: true,
      textEs: true,
    },
  })

  console.log(`📊 Found ${words.length} words to update`)

  let successCount = 0
  let errorCount = 0

  for (const word of words) {
    try {
      // Generate new embeddings for both English and Spanish versions
      const embeddingEn = await generateEmbedding(word.textEn)
      const embeddingEs = await generateEmbedding(word.textEs)

      // Convert embeddings to string format for pgvector
      const embeddingEnStr = vectorToString(embeddingEn)
      const embeddingEsStr = vectorToString(embeddingEs)

      // Update the word with new embeddings
      await prisma.$executeRaw`
        UPDATE words
        SET 
          embedding = ${embeddingEnStr}::vector(3072),
          "embeddingEs" = ${embeddingEsStr}::vector(3072)
        WHERE id = ${word.id}
      `

      successCount++
      console.log(`✅ Updated embeddings for: ${word.textEn} / ${word.textEs} (${successCount}/${words.length})`)
    } catch (error) {
      errorCount++
      console.error(`❌ Error updating word ${word.textEn}:`, error)
    }
  }

  console.log('\n📈 Update Summary:')
  console.log(`   ✅ Success: ${successCount}`)
  console.log(`   ❌ Errors: ${errorCount}`)
  console.log(`   📊 Total: ${words.length}`)
  console.log('\n✨ Embeddings update completed!')
}

main()
  .catch((e) => {
    console.error('❌ Update failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
