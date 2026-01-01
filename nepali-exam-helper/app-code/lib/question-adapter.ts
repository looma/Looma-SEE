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
    mathQuestions: [] as any[],
  }

  // Handle Math questions if they exist
  if (dbQuestions.mathQuestions && Array.isArray(dbQuestions.mathQuestions)) {
    adapted.mathQuestions = dbQuestions.mathQuestions
    return adapted // Math tests are self-contained
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
      groupNameEnglish: group.groupNameEnglish || '',
      groupInstruction: group.groupInstruction || '',
      groupInstructionEnglish: group.groupInstructionEnglish || '',
      marksSchema: group.marksSchema || '',
      marksSchemaEnglish: group.marksSchemaEnglish || '',
      questions: (group.questions || []).map((q: any): SocialStudiesQuestion => ({
        id: q.questionNumber?.toString() || q.questionNumberEnglish?.toString() || q._id || Math.random().toString(),
        questionNumber: q.questionNumber || q.questionNumberNepali || '',
        questionNumberNepali: q.questionNumberNepali || q.questionNumber || '',
        questionNumberEnglish: q.questionNumberEnglish || '',
        type: q.type,
        marks: q.marks || q.marksNepali || 0,
        marksNepali: q.marksNepali || q.marks || 0,
        marksEnglish: q.marksEnglish || q.marks || 0,
        questionNepali: q.questionNepali || '',
        questionEnglish: q.questionEnglish || '',
        answerNepali: q.answerNepali || '',
        answerEnglish: q.answerEnglish || '',
        explanationNepali: q.explanationNepali || '',
        explanationEnglish: q.explanationEnglish || '',
        alternatives: q.alternatives,
      }))
    }))
    return adapted // Social studies tests don't have other groups
  }

  // Handle English questions if they exist
  if (dbQuestions.englishQuestions) {
    adapted.englishQuestions = dbQuestions.englishQuestions.map((q: any) => ({
      // Pass through the entire question object to preserve all bilingual fields
      ...q,
      // Ensure standard fields are set
      id: q.questionNumber?.toString() || q.questionNumberEnglish?.toString() || q._id || Math.random().toString(),
      questionNumber: typeof q.questionNumber === "number" ? q.questionNumber :
        (q.questionNumberEnglish || Number.parseInt(q.questionNumber || "0")),
      questionNumberNepali: q.questionNumberNepali || q.questionNumber,
      questionNumberEnglish: q.questionNumberEnglish || q.questionNumber,
      type: q.type,
      title: q.title || q.titleEnglish || "",
      titleNepali: q.titleNepali || q.title || "",
      titleEnglish: q.titleEnglish || q.title || "",
      marks: q.marks || q.marksEnglish || 0,
      marksNepali: q.marksNepali || q.marks,
      marksEnglish: q.marksEnglish || q.marks,
      passage: q.passage,
      subQuestions: q.subQuestions,
      subSections: q.subSections,
      wordCount: q.wordCount,
      clues: q.clues,
      sampleAnswer: q.sampleAnswer,
      gaps: q.gaps,
      explanation: q.explanation || q.explanationEnglish,
      explanationNepali: q.explanationNepali,
      explanationEnglish: q.explanationEnglish || q.explanation,
    }))
  }

  // Handle traditional science-style questions
  Object.entries(dbQuestions).forEach(([groupKey, questions]) => {
    if (groupKey === "englishQuestions" || groupKey === "socialStudiesGroups") return // Skip, already handled above

    if (!Array.isArray(questions)) return

    questions.forEach((q: any) => {
      if (groupKey === "groupA" || groupKey === "A") {
        // Adapt options to use lowercase 'id', 'nepali', 'english' format
        const adaptedOptions = (q.options || []).map((opt: any) => ({
          id: opt.idEnglish || opt.id || '',
          nepali: opt.Nepali || opt.nepali || '',
          english: opt.English || opt.english || '',
        }))

        adapted.groupA.push({
          id: q.idEnglish || q.id || q.questionNumber?.toString() || q.questionId || q._id || Math.random().toString(),
          nepali: q.questionNepali || q.question?.nepali || "",
          english: q.questionEnglish || q.question?.english || "",
          options: adaptedOptions,
          correctAnswer: q.correctAnswerEnglish || q.correctAnswer || "",
          marks: q.marksEnglish || q.marks || 1,
          explanation: q.explanationEnglish || q.explanation,
          explanationNepali: q.explanationNepali,
        })
      } else {
        // Groups B, C, D are free response
        const freeResponseQuestion: FreeResponseQuestion = {
          id: q.idEnglish || q.id || q.questionNumber?.toString() || q.questionId || q._id || Math.random().toString(),
          nepali: q.questionNepali || q.question?.nepali || "",
          english: q.questionEnglish || q.question?.english || "",
          marks: q.marksEnglish || q.marks || 1,
          sampleAnswer: q.sampleAnswerEnglish || q.sampleAnswer,
          explanation: q.explanationEnglish || q.explanation,
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
