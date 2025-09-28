// Enhanced adapter to handle both science and English questions with bilingual support
import type { EnglishQuestion } from "./english-question-types"
interface DatabaseQuestion {
  _id?: string
  questionId?: string
  testId: string
  groupId?: string
  questionNumber?: string | number
  type: string
  question?: {
    nepali: string
    english: string
  }
  title?: string
  passage?: any
  subQuestions?: any[]
  subSections?: any[]
  options?: Array<{
    id: string
    nepali: string
    english: string
  }>
  correctAnswer?: string
  marks: number
  isActive?: boolean
  // English-specific fields
  questionEnglish?: string
  questionNepali?: string
  wordCount?: number
  clues?: string[]
  sampleAnswer?: any
  gaps?: any[]
  explanation?: string
  explanationNepali?: string
}

export interface GroupAQuestion {
  id: string
  nepali: string
  english: string
  options: { id: string; nepali: string; english: string }[]
  correctAnswer: string
  marks: number
  explanation?: string
  explanationNepali?: string
}

export interface FreeResponseQuestion {
  id: string
  nepali: string
  english: string
  marks: number
  sampleAnswer?: string
  explanation?: string
  explanationNepali?: string
}


export function adaptDatabaseQuestions(dbQuestions: Record<string, DatabaseQuestion[]>) {
  const adapted = {
    groupA: [] as GroupAQuestion[],
    groupB: [] as FreeResponseQuestion[],
    groupC: [] as FreeResponseQuestion[],
    groupD: [] as FreeResponseQuestion[],
    englishQuestions: [] as EnglishQuestion[],
  }

  // Handle English questions if they exist
  if (dbQuestions.englishQuestions) {
    adapted.englishQuestions = dbQuestions.englishQuestions.map((q) => ({
      id: q.questionNumber?.toString() || q._id || Math.random().toString(),
      questionNumber:
        typeof q.questionNumber === "number" ? q.questionNumber : Number.parseInt(q.questionNumber || "0"),
      type: q.type,
      title: q.title || "",
      marks: q.marks,
      passage: q.passage,
      subQuestions: q.subQuestions,
      subSections: q.subSections,
      wordCount: q.wordCount,
      clues: q.clues,
      sampleAnswer: q.sampleAnswer,
      gaps: q.gaps,
      explanation: q.explanation,
      explanationNepali: q.explanationNepali,
    }))
  }

  // Handle traditional science-style questions
  Object.entries(dbQuestions).forEach(([groupKey, questions]) => {
    if (groupKey === "englishQuestions") return // Skip, already handled above

    questions.forEach((q) => {
      if (groupKey === "groupA" || groupKey === "A") {
        adapted.groupA.push({
          id: q.id || q.questionNumber?.toString() || q.questionId || q._id || Math.random().toString(),
          nepali: q.questionNepali || q.question?.nepali || "",
          english: q.questionEnglish || q.question?.english || "",
          options: q.options || [],
          correctAnswer: q.correctAnswer || "",
          marks: q.marks,
          explanation: q.explanation,
          explanationNepali: q.explanationNepali,
        })
      } else {
        // Groups B, C, D are free response
        const freeResponseQuestion: FreeResponseQuestion = {
          id: q.id || q.questionNumber?.toString() || q.questionId || q._id || Math.random().toString(),
          nepali: q.questionNepali || q.question?.nepali || "",
          english: q.questionEnglish || q.question?.english || "",
          marks: q.marks,
          sampleAnswer: q.sampleAnswer,
          explanation: q.explanation,
          explanationNepali: q.explanationNepali,
        }

        if (groupKey === "groupB" || groupKey === "B") adapted.groupB.push(freeResponseQuestion)
        if (groupKey === "groupC" || groupKey === "C") adapted.groupC.push(freeResponseQuestion)
        if (groupKey === "groupD" || groupKey === "D") adapted.groupD.push(freeResponseQuestion)
      }
    })
  })

  return adapted
}
