import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTodayUTC } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const daysAgo = parseInt(searchParams.get('daysAgo') || '0')
    const locale = searchParams.get('locale') || 'en'

    // Calculate the target date (0 = today, 1 = yesterday, etc.)
    const targetDate = new Date(getTodayUTC())
    targetDate.setDate(targetDate.getDate() - daysAgo)

    // Get the challenge for the target date
    const challenge = await prisma.dailyChallenge.findFirst({
      where: {
        date: targetDate,
      },
      include: {
        word: true,
      },
    })

    if (!challenge) {
      return NextResponse.json({ leaderboard: [], targetWord: null })
    }

    // Get all users who attempted the challenge for that day, ordered by best similarity and then attempts
    const leaderboard = await prisma.dailyProgress.findMany({
      where: {
        challenge: {
          date: targetDate,
        },
        attemptsCount: {
          gt: 0, // Only include users who made at least one attempt
        },
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
            nickname: true,
            isAnonymous: true,
            browserId: true,
          },
        },
      },
      orderBy: [
        { solved: 'desc' }, // Resolved challenges first
        { score: 'desc' }, // Highest score second
        { lastAttemptAt: 'asc' }, // Earlier completion if everything else is the same
      ],
      take: 50, // Show only top 50
    })

    // Deduplicate users - keep only the best entry for each unique user
    const userMap = new Map<string, any>()

    leaderboard.forEach((entry) => {
      // Use userId as unique key for authenticated users, browserId for anonymous
      const uniqueKey = entry.user.isAnonymous && entry.user.browserId ? `anon_${entry.user.browserId}` : `user_${entry.userId}`

      const existingEntry = userMap.get(uniqueKey)

      // Keep this entry if:
      // 1. No existing entry for this user
      // 2. This entry is solved and existing is not
      // 3. Both solved/unsolved but this has better score
      // 4. Same score but earlier completion
      if (
        !existingEntry ||
        (entry.solved && !existingEntry.solved) ||
        (entry.solved === existingEntry.solved && entry.score > existingEntry.score) ||
        (entry.solved === existingEntry.solved &&
          entry.score === existingEntry.score &&
          new Date(entry.lastAttemptAt).getTime() < new Date(existingEntry.lastAttemptAt).getTime())
      ) {
        userMap.set(uniqueKey, entry)
      }
    })

    // Convert map back to array and sort by solved status then score
    const uniqueLeaderboard = Array.from(userMap.values()).sort((a, b) => {
      // Sort by solved status first (solved = true comes first)
      if (a.solved !== b.solved) {
        return b.solved ? 1 : -1
      }
      // Then by score (desc)
      if (b.score !== a.score) {
        return b.score - a.score
      }
      // Finally by time (asc)
      return new Date(a.lastAttemptAt).getTime() - new Date(b.lastAttemptAt).getTime()
    })

    const formattedLeaderboard = uniqueLeaderboard.slice(0, 50).map((entry, index) => {
      return {
        rank: index + 1,
        name: entry.user.isAnonymous ? entry.user.nickname || 'Anonymous' : entry.user.name || 'Anonymous',
        image: entry.user.isAnonymous ? '' : entry.user.image || '',
        attempts: entry.attemptsCount,
        score: entry.score, // Use the pre-calculated score from the database
        solved: entry.solved,
        bestSimilarity: entry.bestSimilarity,
        isAnonymous: entry.user.isAnonymous,
      }
    })

    // Only show the target word for past days (not today)
    const targetWord = daysAgo > 0 ? (locale === 'es' ? challenge.word.textEs : challenge.word.textEn) : null

    return NextResponse.json({
      leaderboard: formattedLeaderboard,
      targetWord,
      date: targetDate.toISOString(),
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
