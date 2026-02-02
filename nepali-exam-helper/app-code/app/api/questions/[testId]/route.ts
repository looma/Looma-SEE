import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { adaptDatabaseQuestions } from "@/lib/question-adapter"

// Force dynamic rendering - this route uses database and params
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { testId: string } }) {
  try {
    const { testId } = params

    if (!testId) {
      return NextResponse.json({ error: "Test ID is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const questionsCollection = db.collection("questions")

    // Find questions for this test
    const questionsDoc = await questionsCollection.findOne({ testId })

    if (!questionsDoc) {
      return NextResponse.json({ error: "Questions not found" }, { status: 404 })
    }

    // Adapt the questions to the expected format
    const adaptedQuestions = adaptDatabaseQuestions(questionsDoc.questions || {})

    // Extract metadata for timer and display
    const metadata = {
      durationEnglish: questionsDoc.durationEnglish || questionsDoc.duration || 180,
      durationNepali: questionsDoc.durationNepali || '१८०',
      titleEnglish: questionsDoc.titleEnglish || testId,
      titleNepali: questionsDoc.titleNepali || testId,
      fullMarksEnglish: questionsDoc.fullMarksEnglish || 75,
    }

    return NextResponse.json({
      success: true,
      questions: adaptedQuestions,
      metadata,
    })
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}

