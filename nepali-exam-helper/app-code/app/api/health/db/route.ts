import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const collections = await db.collections()
    const names = collections.map((c) => c.collectionName)
    return NextResponse.json({
      ok: true,
      db: db.databaseName,
      collections: names,
      uriDetected: !!process.env.MONGODB_URI,
    })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Unknown DB error", uriDetected: !!process.env.MONGODB_URI },
      { status: 500 },
    )
  }
}
