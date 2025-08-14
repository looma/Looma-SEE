import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { testId: string } }) {
  try {
    const { testId } = await params
    console.log(`🔍 Looking for questions for testId: ${testId} in database ONLY`)

    const { db } = await connectToDatabase()
    const questionsCollection = db.collection("questions")
    const questionsDoc = await questionsCollection.findOne({ testId })

    if (!questionsDoc) {
      console.log(`❌ No questions found for testId: ${testId} in database`)
      // Return empty structure - NO hardcoded fallbacks
      return NextResponse.json({
        testId,
        questions: {
          groupA: [],
          groupB: [],
          groupC: [],
          groupD: [],
        },
      })
    }

    console.log(`✅ Found questions in database for: ${testId}`)

    // Transform the data to match frontend expectations
    const transformedQuestions = {
      groupA: (questionsDoc.questions.groupA || []).map((q: any) => ({
        id: q.id,
        nepali: q.questionNepali,
        english: q.questionEnglish,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        marks: q.marks,
        explanation: q.explanation, // Include explanation for multiple choice
      })),
      groupB: (questionsDoc.questions.groupB || []).map((q: any) => ({
        id: q.id,
        nepali: q.questionNepali,
        english: q.questionEnglish,
        marks: q.marks,
        sampleAnswer: q.sampleAnswer, // Include sample answer for grading
      })),
      groupC: (questionsDoc.questions.groupC || []).map((q: any) => ({
        id: q.id,
        nepali: q.questionNepali,
        english: q.questionEnglish,
        marks: q.marks,
        sampleAnswer: q.sampleAnswer, // Include sample answer for grading
      })),
      groupD: (questionsDoc.questions.groupD || []).map((q: any) => ({
        id: q.id,
        nepali: q.questionNepali,
        english: q.questionEnglish,
        marks: q.marks,
        sampleAnswer: q.sampleAnswer, // Include sample answer for grading
      })),
    }

    const totalQuestions =
      transformedQuestions.groupA.length +
      transformedQuestions.groupB.length +
      transformedQuestions.groupC.length +
      transformedQuestions.groupD.length

    console.log(`✅ Returning ${totalQuestions} questions from DATABASE ONLY`)

    return NextResponse.json({
      testId,
      questions: transformedQuestions,
    })
  } catch (error) {
    console.error("❌ Error fetching questions:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}
