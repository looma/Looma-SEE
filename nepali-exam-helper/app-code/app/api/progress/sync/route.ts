import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, progress } = body

        if (!email || !progress) {
            return NextResponse.json(
                { error: "Email and progress are required" },
                { status: 400 }
            )
        }

        const normalizedEmail = email.toLowerCase().trim()

        const { db } = await connectToDatabase()
        const progressCollection = db.collection("user_progress")

        // Create compound index on email + testId for efficient lookups
        await progressCollection.createIndex(
            { email: 1, testId: 1 },
            { unique: true }
        )

        const testId = progress.testId

        if (!testId) {
            return NextResponse.json(
                { error: "Progress must include testId" },
                { status: 400 }
            )
        }

        // Upsert the progress for this email + testId combination
        await progressCollection.updateOne(
            { email: normalizedEmail, testId },
            {
                $set: {
                    email: normalizedEmail,
                    testId,
                    answers: progress.answers || {},
                    currentTab: progress.currentTab || "groupA",
                    attempts: progress.attempts || [],
                    lastUpdated: new Date(),
                },
                $setOnInsert: {
                    createdAt: new Date(),
                },
            },
            { upsert: true }
        )

        console.log(`✅ Progress synced for ${normalizedEmail} on test ${testId}`)

        return NextResponse.json({
            success: true,
            message: "Progress synced successfully",
        })
    } catch (error) {
        console.error("❌ Progress sync error:", error)
        return NextResponse.json(
            { error: "Failed to sync progress" },
            { status: 500 }
        )
    }
}
