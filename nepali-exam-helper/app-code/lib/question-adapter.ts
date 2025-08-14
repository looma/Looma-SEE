// Adapter to convert database format to frontend format
interface DatabaseQuestion {
  _id: string
  questionId: string
  testId: string
  groupId: string
  questionNumber: string
  type: string
  question: {
    nepali: string
    english: string
  }
  options?: Array<{
    id: string
    nepali: string
    english: string
  }>
  correctAnswer?: string
  marks: number
  isActive: boolean
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

export function adaptDatabaseQuestions(dbQuestions: Record<string, DatabaseQuestion[]>) {
  const adapted = {
    groupA: [] as GroupAQuestion[],
    groupB: [] as FreeResponseQuestion[],
    groupC: [] as FreeResponseQuestion[],
    groupD: [] as FreeResponseQuestion[],
  }

  // Convert database format to frontend format
  Object.entries(dbQuestions).forEach(([groupKey, questions]) => {
    questions.forEach((q) => {
      if (groupKey === "A") {
        adapted.groupA.push({
          id: q.questionNumber,
          nepali: q.question.nepali,
          english: q.question.english,
          options: q.options || [],
          correctAnswer: q.correctAnswer || "",
          marks: q.marks,
        })
      } else {
        // Groups B, C, D are free response
        const freeResponseQuestion: FreeResponseQuestion = {
          id: q.questionNumber,
          nepali: q.question.nepali,
          english: q.question.english,
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
