import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST() {
    try {
        const { db } = await connectToDatabase()
        const analyticsCollection = db.collection("analytics")

        // Increment guest session counter
        await analyticsCollection.updateOne(
            { _id: "guest_sessions" as unknown as import("mongodb").ObjectId },
            {
                $inc: { count: 1 },
                $set: { lastSeen: new Date().toISOString() }
            },
            { upsert: true }
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Track guest error:", error)
        return NextResponse.json(
            { success: false, error: "Failed to track guest" },
            { status: 500 }
        )
    }
}
