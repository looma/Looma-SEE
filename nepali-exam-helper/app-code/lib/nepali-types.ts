// Nepali Test Type Definitions (Bilingual Support)

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

// Matching question column item (bilingual)
export interface MatchingColumn {
    id?: string
    idNepali?: string
    idEnglish?: string
    text?: string
    textNepali?: string
    textEnglish?: string
}

// Matching answer pair
export interface MatchingAnswer {
    A: string
    B: string
}

// Spelling correction choice
export interface SpellingChoice {
    id?: string
    idNepali?: string
    idEnglish?: string
    options?: string[]
    optionsNepali?: string[]
    optionsEnglish?: string[]
    correctAnswer?: string
    correctAnswerNepali?: string
    correctAnswerEnglish?: string
}

// Sub-question types (bilingual)
export interface NepaliSubQuestion {
    id?: string
    idNepali?: string
    idEnglish?: string
    type?: string
    title?: string
    titleNepali?: string
    titleEnglish?: string
    questionNepali?: string
    questionEnglish?: string
    correctAnswer?: string | Record<string, any> | any[]
    correctAnswerNepali?: string | Record<string, any> | any[]
    correctAnswerEnglish?: string | Record<string, any> | any[]
    explanation?: string
    explanationNepali?: string
    explanationEnglish?: string
    marks?: number
    marksNepali?: string
    marksEnglish?: number
    passage?: string
    passageNepali?: string
    passageEnglish?: string
    choices?: SpellingChoice[]
}

// Literature section types (bilingual)
export interface LiteratureSubSection {
    id?: string
    idNepali?: string
    idEnglish?: string
    marks?: number
    marksNepali?: string
    marksEnglish?: number
    passage?: string
    passageNepali?: string
    passageEnglish?: string
    subQuestions?: NepaliSubQuestion[]
}

// Choice option types (bilingual)
export interface WritingOption {
    id?: string
    idNepali?: string
    idEnglish?: string
    title?: string
    titleNepali?: string
    titleEnglish?: string
    clues?: string[]
    cluesNepali?: string[]
    cluesEnglish?: string[]
    passage?: string
    passageNepali?: string
    passageEnglish?: string
    questionNepali?: string
    questionEnglish?: string
}

// Word/POS pair for parts of speech (bilingual)
export interface WordPosPair {
    word: string
    pos: string
}

// Base Nepali Question (bilingual)
export interface NepaliQuestion {
    questionNumber?: number
    questionNumberNepali?: string
    questionNumberEnglish?: number
    type: NepaliQuestionType
    title?: string
    titleNepali?: string
    titleEnglish?: string
    marks?: number
    marksNepali?: string
    marksEnglish?: number
    questionNepali?: string
    questionEnglish?: string
    explanation?: string
    explanationNepali?: string
    explanationEnglish?: string

    // For matching (bilingual headers and columns)
    columns?: {
        A_header?: string
        A_headerNepali?: string
        A_headerEnglish?: string
        B_header?: string
        B_headerNepali?: string
        B_headerEnglish?: string
        A?: MatchingColumn[]
        B?: MatchingColumn[]
    }
    correctAnswer?: MatchingAnswer[] | WordPosPair[] | string | string[] | any
    correctAnswerNepali?: MatchingAnswer[] | WordPosPair[] | string | string[] | any
    correctAnswerEnglish?: MatchingAnswer[] | WordPosPair[] | string | string[] | any

    // For fill_in_the_blanks, reading comprehension, etc. (bilingual)
    passage?: string
    passageNepali?: string
    passageEnglish?: string
    subQuestions?: NepaliSubQuestion[]

    // For short_answer (bilingual)
    sampleAnswer?: any
    sampleAnswerNepali?: any
    sampleAnswerEnglish?: any

    // For literature
    subSections?: LiteratureSubSection[]

    // For choice-based questions
    options?: WritingOption[]

    // For essay (bilingual topics)
    topics?: string[]
    topicsNepali?: string[]
    topicsEnglish?: string[]

    // For literature explanation
    sampleAnswerId?: string
    quote?: string
    quoteNepali?: string
    quoteEnglish?: string
}
