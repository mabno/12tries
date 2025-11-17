import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get all users with their total score
    const usersWithScore = await prisma.user.findMany({
      where: {
        dailyProgress: {
          some: {
            attemptsCount: {
              gt: 0,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        image: true,
        nickname: true,
        isAnonymous: true,
        browserId: true,
        dailyProgress: {
          select: {
            score: true,
          },
        },
      },
    })

    // Map to leaderboard entries with total score
    const leaderboardWithDuplicates = usersWithScore.map((user) => ({
      userId: user.id,
      name: user.isAnonymous ? user.nickname || 'Anonymous' : user.name || 'Anonymous',
      image: user.isAnonymous ? '' : user.image || '',
      isAnonymous: user.isAnonymous,
      browserId: user.browserId,
      totalScore: user.dailyProgress.reduce((sum, progress) => sum + progress.score, 0),
    }))

    // Deduplicate users - keep only one entry per unique user
    const userMap = new Map<string, any>()

    leaderboardWithDuplicates.forEach((entry) => {
      // Use userId as unique key for authenticated users, browserId for anonymous
      const uniqueKey = entry.isAnonymous && entry.browserId ? `anon_${entry.browserId}` : `user_${entry.userId}`

      const existingEntry = userMap.get(uniqueKey)

      // Keep the entry with the highest total score (or first encountered)
      if (!existingEntry || entry.totalScore > existingEntry.totalScore) {
        userMap.set(uniqueKey, entry)
      }
    })

    // Convert map to array and sort by total score (descending)
    const uniqueLeaderboard = Array.from(userMap.values()).sort((a, b) => b.totalScore - a.totalScore)

    // Add rank and limit to top 50
    const formattedLeaderboard = uniqueLeaderboard.slice(0, 50).map((entry, index) => ({
      rank: index + 1,
      name: entry.name,
      image: entry.image,
      totalScore: entry.totalScore,
      isAnonymous: entry.isAnonymous,
    }))

    return NextResponse.json({
      leaderboard: formattedLeaderboard,
    })
  } catch (error) {
    console.error('Error fetching global leaderboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
