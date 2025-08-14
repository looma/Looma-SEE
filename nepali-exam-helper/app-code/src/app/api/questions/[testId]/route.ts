import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/src/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { testId: string } }) {
  try {
    const { testId } = params

    // For real tests, fetch from database
    const { db } = await connectToDatabase()
    const questionsCollection = db.collection("questions")

    const questionsDoc = await questionsCollection.findOne({ testId })

    if (!questionsDoc) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    // Transform the data to match frontend expectations
    const transformedQuestions = {
      groupA: (questionsDoc.questions.groupA || []).map((q: any) => ({
        id: q.id,
        nepali: q.questionNepali,
        english: q.questionEnglish,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        marks: q.marks,
      })),
      groupB: (questionsDoc.questions.groupB || []).map((q: any) => ({
        id: q.id,
        nepali: q.questionNepali,
        english: q.questionEnglish,
        marks: q.marks,
      })),
      groupC: (questionsDoc.questions.groupC || []).map((q: any) => ({
        id: q.id,
        nepali: q.questionNepali,
        english: q.questionEnglish,
        marks: q.marks,
      })),
      groupD: (questionsDoc.questions.groupD || []).map((q: any) => ({
        id: q.id,
        nepali: q.questionNepali,
        english: q.questionEnglish,
        marks: q.marks,
      })),
    }

    return NextResponse.json({
      testId,
      questions: transformedQuestions,
    })
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}
