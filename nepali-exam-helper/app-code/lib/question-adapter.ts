// Enhanced adapter to handle science, English, social studies, and Nepali questions
import type { EnglishQuestion } from "./english-question-types"
import type { SocialStudiesGroup, SocialStudiesQuestion } from "./social-studies-types"
import type { NepaliQuestion } from "./nepali-types"

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


export function adaptDatabaseQuestions(dbQuestions: Record<string, any>) {
  const adapted = {
    groupA: [] as GroupAQuestion[],
    groupB: [] as FreeResponseQuestion[],
    groupC: [] as FreeResponseQuestion[],
    groupD: [] as FreeResponseQuestion[],
    englishQuestions: [] as EnglishQuestion[],
    socialStudiesGroups: [] as SocialStudiesGroup[],
    nepaliQuestions: [] as NepaliQuestion[],
  }

  // Handle Nepali questions if they exist
  if (dbQuestions.nepaliQuestions && Array.isArray(dbQuestions.nepaliQuestions)) {
    adapted.nepaliQuestions = dbQuestions.nepaliQuestions.map((q: any): NepaliQuestion => ({
      questionNumber: q.questionNumber || 0,
      type: q.type,
      title: q.title || '',
      marks: q.marks,
      explanation: q.explanation,
      columns: q.columns,
      correctAnswer: q.correctAnswer,
      passage: q.passage,
      subQuestions: q.subQuestions,
      sampleAnswer: q.sampleAnswer,
      subSections: q.subSections,
      options: q.options,
      topics: q.topics,
      sampleAnswerId: q.sampleAnswerId,
    }))
    return adapted // Nepali tests are self-contained
  }

  // Handle Social Studies format if it exists
  if (dbQuestions.socialStudiesGroups && Array.isArray(dbQuestions.socialStudiesGroups)) {
    adapted.socialStudiesGroups = dbQuestions.socialStudiesGroups.map((group: any) => ({
      groupName: group.groupName || '',
      groupInstruction: group.groupInstruction || '',
      marksSchema: group.marksSchema || '',
      questions: (group.questions || []).map((q: any): SocialStudiesQuestion => ({
        id: q.questionNumber?.toString() || q._id || Math.random().toString(),
        questionNumber: q.questionNumber || '',
        type: q.type,
        marks: q.marks,
        questionNepali: q.questionNepali || '',
        answerNepali: q.answerNepali,
        explanationNepali: q.explanationNepali,
        alternatives: q.alternatives,
      }))
    }))
    return adapted // Social studies tests don't have other groups
  }

  // Handle English questions if they exist
  if (dbQuestions.englishQuestions) {
    adapted.englishQuestions = dbQuestions.englishQuestions.map((q: any) => ({
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
    if (groupKey === "englishQuestions" || groupKey === "socialStudiesGroups") return // Skip, already handled above

    if (!Array.isArray(questions)) return

    questions.forEach((q: any) => {
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
