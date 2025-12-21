import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

// Force dynamic rendering - this route uses request params
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const email = searchParams.get("email")
        const testId = searchParams.get("testId")

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            )
        }

        const normalizedEmail = email.toLowerCase().trim()

        const { db } = await connectToDatabase()
        const progressCollection = db.collection("user_progress")

        // If testId is provided, get specific progress
        // Otherwise, get all progress for this user
        let progress
        if (testId) {
            progress = await progressCollection.findOne(
                { email: normalizedEmail, testId },
                { projection: { _id: 0 } }
            )
        } else {
            progress = await progressCollection
                .find(
                    { email: normalizedEmail },
                    { projection: { _id: 0 } }
                )
                .toArray()
        }

        if (!progress || (Array.isArray(progress) && progress.length === 0)) {
            return NextResponse.json({
                success: true,
                progress: testId ? null : [],
                message: "No progress found",
            })
        }

        console.log(`✅ Progress loaded for ${normalizedEmail}${testId ? ` on test ${testId}` : ""}`)

        return NextResponse.json({
            success: true,
            progress,
        })
    } catch (error) {
        console.error("❌ Load progress error:", error)
        return NextResponse.json(
            { error: "Failed to load progress" },
            { status: 500 }
        )
    }
}
