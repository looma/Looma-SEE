// Type definitions for English test questions
export interface EnglishPassage {
  title?: string
  author?: string
  content: string
}

export interface TrueFalseQuestion {
  id: string
  type: "true_false"
  questionEnglish: string
  correctAnswer: "TRUE" | "FALSE"
  explanation?: string
  marks: number
}

export interface MatchingQuestion {
  id: string
  type: "matching"
  title: string
  marks: number
  columns: {
    A: Array<{ id: string; text: string }>
    B: Array<{ id: string; text: string }>
  }
  correctAnswer: Array<{ A: string; B: string }>
  explanation?: string
}

export interface ShortAnswerQuestion {
  id: string
  type: "short_answer"
  questionEnglish: string
  correctAnswer: string
  explanation?: string
  marks: number
}

export interface FreeWritingQuestion {
  id: string
  questionNumber: number
  type: "free_writing"
  title: string
  marks: number
  wordCount?: number
  clues?: string[]
  sampleAnswer?: {
    title?: string
    content: string
  }
}

export interface GrammarQuestion {
  id: string
  type: "reproduce"
  questionEnglish: string
  correctAnswer: string
  explanation?: string
  marks: number
}

export interface ClozeTestGap {
  id: string
  correctAnswer: string
  explanation?: string
}

export interface ClozeTestQuestion {
  id: string
  questionNumber: number
  type: "cloze_test"
  title: string
  marks: number
  passage: string
  gaps: ClozeTestGap[]
}

export interface ReadingComprehensionQuestion {
  id: string
  questionNumber: number
  type: "reading_comprehension"
  title: string
  marks: number
  passage: EnglishPassage
  subQuestions?: TrueFalseQuestion[]
  subSections?: Array<{
    id: string
    type: "true_false" | "matching" | "short_answer"
    title: string
    marks: number
    subQuestions?: (TrueFalseQuestion | ShortAnswerQuestion)[]
    columns?: {
      A: Array<{ id: string; text: string }>
      B: Array<{ id: string; text: string }>
    }
    correctAnswer?: Array<{ A: string; B: string }> | string
    explanation?: string
  }>
}

export type EnglishQuestion = ReadingComprehensionQuestion | FreeWritingQuestion | GrammarQuestion | ClozeTestQuestion
