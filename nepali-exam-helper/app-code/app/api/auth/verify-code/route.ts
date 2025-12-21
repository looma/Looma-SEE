import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

// Force dynamic rendering
export const dynamic = "force-dynamic"

const MAX_ATTEMPTS_PER_DAY = 10 // Max failed attempts per day before temporary lockout

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, code } = body

        if (!email || !code) {
            return NextResponse.json(
                { error: "Email and code are required" },
                { status: 400 }
            )
        }

        const normalizedEmail = email.toLowerCase().trim()
        const normalizedCode = code.trim()

        const { db } = await connectToDatabase()
        const authCodesCollection = db.collection("auth_codes")

        // Find the permanent code for this email
        const storedCode = await authCodesCollection.findOne({
            email: normalizedEmail,
        })

        if (!storedCode) {
            return NextResponse.json(
                { error: "No code found for this email. Please request a code first." },
                { status: 400 }
            )
        }

        // Check for too many failed attempts (reset daily)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (storedCode.lastFailedAttempt && storedCode.lastFailedAttempt >= today) {
            if (storedCode.failedAttemptsToday >= MAX_ATTEMPTS_PER_DAY) {
                return NextResponse.json(
                    { error: "Too many failed attempts today. Please try again tomorrow." },
                    { status: 429 }
                )
            }
        }

        // Verify code
        if (storedCode.code !== normalizedCode) {
            // Check if this is a new day - reset counter if so
            const isNewDay = !storedCode.lastFailedAttempt || storedCode.lastFailedAttempt < today

            // Increment failed attempts
            await authCodesCollection.updateOne(
                { email: normalizedEmail },
                isNewDay
                    ? { $set: { lastFailedAttempt: new Date(), failedAttemptsToday: 1 } }
                    : { $set: { lastFailedAttempt: new Date() }, $inc: { failedAttemptsToday: 1 } }
            )

            return NextResponse.json(
                { error: "Invalid code. Please check your code and try again." },
                { status: 400 }
            )
        }

        // Code is valid! Reset failed attempts counter
        await authCodesCollection.updateOne(
            { email: normalizedEmail },
            {
                $set: {
                    lastLogin: new Date(),
                    failedAttemptsToday: 0
                }
            }
        )

        // Ensure user exists in users collection
        const usersCollection = db.collection("users")
        await usersCollection.updateOne(
            { email: normalizedEmail },
            {
                $set: { lastLogin: new Date() },
                $setOnInsert: {
                    email: normalizedEmail,
                    createdAt: new Date(),
                },
            },
            { upsert: true }
        )

        console.log(`✅ User ${normalizedEmail} authenticated successfully`)

        return NextResponse.json({
            success: true,
            email: normalizedEmail,
            message: "Authentication successful",
        })
    } catch (error) {
        console.error("❌ Verify code error:", error)
        return NextResponse.json(
            { error: "Verification failed" },
            { status: 500 }
        )
    }
}
