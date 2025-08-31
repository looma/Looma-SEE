// Enhanced adapter to handle both science and English questions
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
  wordCount?: number
  clues?: string[]
  sampleAnswer?: any
  gaps?: any[]
}

export interface GroupAQuestion {
  id: string
  nepali: string
  english: string
  options: { id: string; nepali: string; english: string }[]
  correctAnswer: string
  marks: number
}

export interface FreeResponseQuestion {
  id: string
  nepali: string
  english: string
  marks: number
}

export interface EnglishQuestion {
  id: string
  questionNumber: number
  type: string
  title: string
  marks: number
  passage?: any
  subQuestions?: any[]
  subSections?: any[]
  wordCount?: number
  clues?: string[]
  sampleAnswer?: any
  gaps?: any[]
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
    }))
  }

  // Handle traditional science-style questions
  Object.entries(dbQuestions).forEach(([groupKey, questions]) => {
    if (groupKey === "englishQuestions") return // Skip, already handled above

    questions.forEach((q) => {
      if (groupKey === "A") {
        adapted.groupA.push({
          id: q.questionNumber?.toString() || q.questionId || q._id || Math.random().toString(),
          nepali: q.question?.nepali || q.questionEnglish || "",
          english: q.question?.english || q.questionEnglish || "",
          options: q.options || [],
          correctAnswer: q.correctAnswer || "",
          marks: q.marks,
        })
      } else {
        // Groups B, C, D are free response
        const freeResponseQuestion: FreeResponseQuestion = {
          id: q.questionNumber?.toString() || q.questionId || q._id || Math.random().toString(),
          nepali: q.question?.nepali || q.questionEnglish || "",
          english: q.question?.english || q.questionEnglish || "",
          marks: q.marks,
        }

        if (groupKey === "B") adapted.groupB.push(freeResponseQuestion)
        if (groupKey === "C") adapted.groupC.push(freeResponseQuestion)
        if (groupKey === "D") adapted.groupD.push(freeResponseQuestion)
      }
    })
  })

  return adapted
}
