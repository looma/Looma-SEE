import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
    try {
        const { db } = await connectToDatabase()

        // Get all user progress records (registered users)
        const progressCollection = db.collection("user_progress")
        const allProgress = await progressCollection.find({}).toArray()

        // Group by email to get unique users
        const userMap = new Map<string, {
            email: string
            testsAttempted: string[]
            totalAttempts: number
            lastActive: string
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

            if (existing) {
                if (!existing.testsAttempted.includes(testId)) {
                    existing.testsAttempted.push(testId)
                }
                existing.totalAttempts += (record.attempts?.length || 1)
                if (lastUpdated && lastUpdated > existing.lastActive) {
                    existing.lastActive = lastUpdated
                }
            } else {
                userMap.set(email, {
                    email,
                    testsAttempted: [testId],
                    totalAttempts: record.attempts?.length || 1,
                    lastActive: lastUpdated
                })
            }
        }

        // Convert to array and sort by last active
        const registeredUsers = Array.from(userMap.values())
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
