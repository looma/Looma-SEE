import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    console.log("🔍 /api/tests called - ONLY checking database on port 47017")

    const { db } = await connectToDatabase()
    const practiceTests = await db.collection("practice_tests").find({}).sort({ _id: 1 }).toArray()

    console.log(`📊 Database query returned ${practiceTests.length} documents`)

    if (practiceTests.length === 0) {
      console.log("⚠️  Database is empty - returning empty array")
      return NextResponse.json({ ok: true, tests: [] })
    }

    practiceTests.forEach((test) => {
      console.log(`  - ${test._id}: ${test.title}`)
    })

    // Transform the data
    const tests = practiceTests.map((t: any) => ({
      id: t._id,
      title: t.title,
      titleNepali: t.titleNepali,
      subject: t.subject,
      year: t.year,
      totalMarks: t.totalMarks,
      duration: t.duration,
      sections: t.sections,
      isActive: t.isActive !== false,
    }))

    console.log(`✅ Returning ${tests.length} tests from DATABASE ONLY`)
    return NextResponse.json({ ok: true, tests })
  } catch (error) {
    console.error("❌ Database error:", error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Database connection failed",
        tests: [],
      },
      { status: 500 },
    )
  }
}
