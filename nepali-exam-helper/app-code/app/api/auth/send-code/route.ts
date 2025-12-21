import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { sendOTPEmail } from "@/lib/email"

// Rate limit: max 5 codes per email per hour (to prevent spam)
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MAX_CODES_PER_WINDOW = 5
const CODE_EXPIRY_MS = 15 * 60 * 1000 // 15 minutes

function generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email } = body

        if (!email || typeof email !== "string") {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            )
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            )
        }

        const normalizedEmail = email.toLowerCase().trim()

        const { db } = await connectToDatabase()
        const authCodesCollection = db.collection("auth_codes")

        // Check rate limit
        const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS)
        const recentCodes = await authCodesCollection.countDocuments({
            email: normalizedEmail,
            createdAt: { $gte: windowStart },
        })

        if (recentCodes >= MAX_CODES_PER_WINDOW) {
            return NextResponse.json(
                { error: "Too many code requests. Please try again later." },
                { status: 429 }
            )
        }

        // Generate new code
        const code = generateCode()
        const now = new Date()
        const expiresAt = new Date(now.getTime() + CODE_EXPIRY_MS)

        // Delete any existing codes for this email (new login = new code)
        await authCodesCollection.deleteMany({ email: normalizedEmail })

        // Store the new code
        await authCodesCollection.insertOne({
            email: normalizedEmail,
            code,
            createdAt: now,
            expiresAt,
            attempts: 0,
        })

        // Create TTL index if it doesn't exist (expires documents automatically)
        await authCodesCollection.createIndex(
            { expiresAt: 1 },
            { expireAfterSeconds: 0 }
        )

        // Send the email
        const emailResult = await sendOTPEmail(normalizedEmail, code)

        if (!emailResult.success) {
            // Clean up the code if email failed
            await authCodesCollection.deleteOne({ email: normalizedEmail, code })
            return NextResponse.json(
                { error: emailResult.error || "Failed to send email" },
                { status: 500 }
            )
        }

        console.log(`✅ OTP code sent to ${normalizedEmail}`)

        return NextResponse.json({
            success: true,
            message: "Code sent successfully",
        })
    } catch (error) {
        console.error("❌ Send code error:", error)
        return NextResponse.json(
            { error: "Failed to send code" },
            { status: 500 }
        )
    }
}
