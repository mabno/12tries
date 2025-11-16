// Profanity filter for nickname validation
// Uses allprofanity package for comprehensive bad word detection

import allprofanity from 'allprofanity'
import { prisma } from './prisma'

// Initialize with English and Spanish languages
allprofanity.loadLanguages(['english', 'spanish'])

// Variable to track if words have been loaded
let wordsLoaded = false

/**
 * Load all words from the database and add them to the whitelist
 */
async function loadDatabaseWords() {
  if (wordsLoaded) return

  try {
    const words = await prisma.word.findMany({
      select: {
        textEn: true,
        textEs: true,
      },
    })

    // Collect all words (English and Spanish) to add to whitelist
    const whitelistWords = words.flatMap((word) => [word.textEn.toLowerCase(), word.textEs.toLowerCase()])

    // Add all words to the whitelist
    allprofanity.addToWhitelist(whitelistWords)

    wordsLoaded = true
    console.log(`Loaded ${words.length * 2} words to profanity filter whitelist`)
  } catch (error) {
    console.error('Error loading words for profanity filter:', error)
  }
}

/**
 * Checks if a text contains profanity
 * @param text - The text to check
 * @param language - Language code ('en' or 'es') - optional, checks both languages
 * @returns true if profanity is found, false otherwise
 */
export async function containsProfanity(text: string, language: string = 'en'): Promise<boolean> {
  // Ensure database words are loaded
  await loadDatabaseWords()

  const normalizedText = text.toLowerCase().trim()

  // Since both languages are loaded, it will check against both
  // The package automatically detects profanity in any loaded language
  return allprofanity.check(normalizedText)
}

/**
 * Validates a nickname for profanity and length
 * @param nickname - The nickname to validate
 * @returns An object with isValid and error message
 */
export async function validateNickname(nickname: string): Promise<{ isValid: boolean; error?: string }> {
  if (!nickname || nickname.trim().length === 0) {
    return { isValid: false, error: 'Nickname cannot be empty' }
  }

  if (nickname.length < 2) {
    return { isValid: false, error: 'Nickname must be at least 2 characters long' }
  }

  if (nickname.length > 20) {
    return { isValid: false, error: 'Nickname must be less than 20 characters' }
  }

  if (await containsProfanity(nickname)) {
    return { isValid: false, error: 'Nickname contains inappropriate language' }
  }

  return { isValid: true }
}
