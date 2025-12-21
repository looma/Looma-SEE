import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { sendOTPEmail } from "@/lib/email"

// Force dynamic rendering
export const dynamic = "force-dynamic"

// Rate limit: max 3 code requests per email per hour (to prevent spam)
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MAX_REQUESTS_PER_WINDOW = 3

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

        // Check if user already has a code (permanent - no expiry check)
        const existingCode = await authCodesCollection.findOne({
            email: normalizedEmail,
        })

        if (existingCode) {
            // User already has a code - tell them to use it
            return NextResponse.json(
                {
                    error: "You already have a code. Please use the 'Log in with my code' option.",
                    hasExistingCode: true
                },
                { status: 409 } // Conflict
            )
        }

        // Check rate limit (for new code requests only)
        const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS)
        const recentRequests = await db.collection("auth_rate_limits").countDocuments({
            email: normalizedEmail,
            requestedAt: { $gte: windowStart },
        })

        if (recentRequests >= MAX_REQUESTS_PER_WINDOW) {
            return NextResponse.json(
                { error: "Too many code requests. Please try again later." },
                { status: 429 }
            )
        }

        // Log this request for rate limiting
        await db.collection("auth_rate_limits").insertOne({
            email: normalizedEmail,
            requestedAt: new Date(),
        })

        // Generate new permanent code
        const code = generateCode()
        const now = new Date()

        // Store the permanent code (no expiry!)
        await authCodesCollection.insertOne({
            email: normalizedEmail,
            code,
            createdAt: now,
            // No expiresAt - this code is permanent!
        })

        // Create index on email for fast lookups
        await authCodesCollection.createIndex({ email: 1 }, { unique: true })

        // Clean up old rate limit entries (older than 1 hour)
        await db.collection("auth_rate_limits").deleteMany({
            requestedAt: { $lt: windowStart }
        })

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

        console.log(`✅ Permanent code created and sent to ${normalizedEmail}`)

        return NextResponse.json({
            success: true,
            message: "Code sent successfully. Save this code - it's your permanent login!",
        })
    } catch (error) {
        console.error("❌ Send code error:", error)
        return NextResponse.json(
            { error: "Failed to send code" },
            { status: 500 }
        )
    }
}
