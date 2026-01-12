// Type definitions for Social Studies test questions
// Social studies questions now support bilingual (English/Nepali) display

export type SocialStudiesQuestionType =
    | "very_short_answer"
    | "short_answer"
    | "long_answer"
    | "creative_writing_editorial"
    | "creative_writing_dialogue"
    | "creative_writing_speech"
    | "creative_writing_letter"
    | "creative_writing_news_report"
    | "creative_writing_article"

// Note: map_drawing questions were removed as they require manual grading

export interface SocialStudiesQuestion {
    id: string
    // Question number in both formats
    questionNumber?: string // Legacy
    questionNumberNepali?: string
    questionNumberEnglish?: string
    type: SocialStudiesQuestionType
    // Marks in both formats
    marks?: number // Legacy
    marksNepali?: string
    marksEnglish?: number
    // Question text
    questionNepali: string
    questionEnglish?: string
    // Answer/sample answer
    answerNepali?: string
    answerEnglish?: string
    // Explanation
    explanationNepali?: string
    explanationEnglish?: string

}

export interface SocialStudiesGroup {
    // Group name (e.g., "समूह 'क'")
    groupName: string
    groupNameEnglish?: string
    // Group instruction
    groupInstruction: string
    groupInstructionEnglish?: string
    // Marks schema (e.g., "(११×१=११)")
    marksSchema: string
    marksSchemaEnglish?: string
    questions: SocialStudiesQuestion[]
}
