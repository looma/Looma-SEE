import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

const MAX_ATTEMPTS = 5 // Max failed attempts before code is invalidated

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

        // Find the code
        const storedCode = await authCodesCollection.findOne({
            email: normalizedEmail,
        })

        if (!storedCode) {
            return NextResponse.json(
                { error: "No code found. Please request a new one." },
                { status: 400 }
            )
        }

        // Check if code is expired
        if (storedCode.expiresAt < new Date()) {
            await authCodesCollection.deleteOne({ email: normalizedEmail })
            return NextResponse.json(
                { error: "Code expired. Please request a new one." },
                { status: 400 }
            )
        }

        // Check attempts
        if (storedCode.attempts >= MAX_ATTEMPTS) {
            await authCodesCollection.deleteOne({ email: normalizedEmail })
            return NextResponse.json(
                { error: "Too many failed attempts. Please request a new code." },
                { status: 400 }
            )
        }

        // Verify code
        if (storedCode.code !== normalizedCode) {
            // Increment attempts
            await authCodesCollection.updateOne(
                { email: normalizedEmail },
                { $inc: { attempts: 1 } }
            )
            const remainingAttempts = MAX_ATTEMPTS - storedCode.attempts - 1
            return NextResponse.json(
                {
                    error: `Invalid code. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`
                },
                { status: 400 }
            )
        }

        // Code is valid - delete it (one-time use)
        await authCodesCollection.deleteOne({ email: normalizedEmail })

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
