// Nepali Test Type Definitions

export type NepaliQuestionType =
    | "matching"
    | "fill_in_the_blanks"
    | "short_answer"
    | "spelling_correction"
    | "parts_of_speech"
    | "word_formation"
    | "tense_change"
    | "grammar_choice"
    | "sentence_transformation"
    | "reading_comprehension_grammar"
    | "reading_comprehension"
    | "free_writing_choice"
    | "functional_writing_choice"
    | "note_taking"
    | "summarization"
    | "literature_short_answer"
    | "literature_argumentative"
    | "literature_explanation"
    | "literature_critical_analysis_choice"
    | "essay"

// Matching question types
export interface MatchingColumn {
    id: string
    text: string
}

export interface MatchingAnswer {
    A: string
    B: string
}

// Sub-question types
export interface NepaliSubQuestion {
    id: string
    type?: string
    title?: string
    questionNepali?: string
    correctAnswer?: string | Record<string, string>
    explanation?: string
    marks?: number
    passage?: string
    choices?: Array<{
        id: string
        options: string[]
        correctAnswer: string
    }>
}

// Literature section types
export interface LiteratureSubSection {
    id: string
    marks: number
    passage?: string
    subQuestions?: NepaliSubQuestion[]
}

// Choice option types
export interface WritingOption {
    id: string
    title: string
    clues?: string[]
    passage?: string
    questionNepali?: string
}

// Word/POS pair for parts of speech
export interface WordPosPair {
    word: string
    pos: string
}

// Base Nepali Question
export interface NepaliQuestion {
    questionNumber: number
    type: NepaliQuestionType
    title: string
    marks: number
    questionNepali?: string  // The actual question text in Nepali
    questionEnglish?: string // The question text in English (if available)
    explanation?: string

    // For matching
    columns?: {
        A_header?: string
        B_header?: string
        A?: MatchingColumn[]
        B?: MatchingColumn[]
    }
    correctAnswer?: MatchingAnswer[] | WordPosPair[] | string | string[]

    // For fill_in_the_blanks, reading comprehension, etc.
    passage?: string
    subQuestions?: NepaliSubQuestion[]

    // For short_answer
    sampleAnswer?: any

    // For spelling_correction, word_formation, grammar_choice, sentence_transformation
    // Uses subQuestions[]

    // For literature
    subSections?: LiteratureSubSection[]

    // For choice-based questions
    options?: WritingOption[]

    // For essay
    topics?: string[]

    // For literature explanation sample
    sampleAnswerId?: string

    // For literature explanation quote
    quote?: string
}
