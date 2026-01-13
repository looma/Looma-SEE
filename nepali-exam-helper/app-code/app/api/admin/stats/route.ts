import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
    try {
        const { db } = await connectToDatabase()

        // Get all user progress records (registered users)
        const progressCollection = db.collection("user_progress")
        const allProgress = await progressCollection.find({}).toArray()

        // Grade ranking for comparison (higher is better)
        const gradeRank: Record<string, number> = {
            'A+': 6, 'A': 5, 'B+': 4, 'B': 3, 'C+': 2, 'C': 1, 'D': 0, 'E': -1
        }

        // Group by email to get unique users
        const userMap = new Map<string, {
            email: string
            testsAttempted: string[]
            totalAttempts: number
            lastActive: string
            bestGrades: Map<string, string> // testId -> best grade
        }>()

        for (const record of allProgress) {
            const email = record.email || record.studentId
            if (!email) continue

            const existing = userMap.get(email)
            const testId = record.testId || "unknown"
            // Handle Date objects and strings for lastUpdated
            const rawDate = record.lastUpdated || record.updatedAt
            const lastUpdated = rawDate instanceof Date
                ? rawDate.toISOString()
                : (typeof rawDate === 'string' ? rawDate : "")

            // Get best grade from attempts array
            let bestGrade = ''
            if (record.attempts && Array.isArray(record.attempts)) {
                for (const attempt of record.attempts) {
                    const grade = attempt.grade || ''
                    if (!bestGrade || (gradeRank[grade] ?? -2) > (gradeRank[bestGrade] ?? -2)) {
                        bestGrade = grade
                    }
                }
            }

            if (existing) {
                if (!existing.testsAttempted.includes(testId)) {
                    existing.testsAttempted.push(testId)
                }
                existing.totalAttempts += (record.attempts?.length || 1)
                if (lastUpdated && lastUpdated > existing.lastActive) {
                    existing.lastActive = lastUpdated
                }
                // Update best grade for this test if better
                const currentBest = existing.bestGrades.get(testId) || ''
                if ((gradeRank[bestGrade] ?? -2) > (gradeRank[currentBest] ?? -2)) {
                    existing.bestGrades.set(testId, bestGrade)
                }
            } else {
                const bestGrades = new Map<string, string>()
                if (bestGrade) bestGrades.set(testId, bestGrade)
                userMap.set(email, {
                    email,
                    testsAttempted: [testId],
                    totalAttempts: record.attempts?.length || 1,
                    lastActive: lastUpdated,
                    bestGrades
                })
            }
        }

        // Convert to array and sort by last active, counting A/A+ grades
        const registeredUsers = Array.from(userMap.values())
            .map(user => {
                // Count unique tests with A or A+ as best grade
                let aGrades = 0
                user.bestGrades.forEach((grade) => {
                    if (grade === 'A' || grade === 'A+') {
                        aGrades++
                    }
                })
                return {
                    email: user.email,
                    testsAttempted: user.testsAttempted,
                    totalAttempts: user.totalAttempts,
                    lastActive: user.lastActive,
                    aGrades
                }
            })
            .sort((a, b) => (b.lastActive || "").localeCompare(a.lastActive || ""))

        // Get guest session count from analytics collection
        const analyticsCollection = db.collection("analytics")
        const guestStats = await analyticsCollection.findOne({ _id: "guest_sessions" as unknown as import("mongodb").ObjectId })
        const guestCount = guestStats?.count || 0
        const guestLastSeen = guestStats?.lastSeen || null

        // Calculate total test attempts (sum of all user attempts)
        const totalTests = registeredUsers.reduce((sum, user) => sum + user.totalAttempts, 0)

        return NextResponse.json({
            success: true,
            stats: {
                registeredUsers: registeredUsers.length,
                guestSessions: guestCount,
                totalTests,
                guestLastSeen
            },
            users: registeredUsers
        })
    } catch (error) {
        console.error("Admin stats error:", error)
        return NextResponse.json(
            { success: false, error: "Failed to fetch stats" },
            { status: 500 }
        )
    }
}
