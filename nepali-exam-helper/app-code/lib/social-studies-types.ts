// Type definitions for Social Studies test questions
// Social studies questions are Nepali-only and have unique question types

export type SocialStudiesQuestionType =
    | "very_short_answer"
    | "short_answer"
    | "long_answer"
    | "creative_writing_editorial"
    | "creative_writing_dialogue"
    | "creative_writing_speech"
    | "map_drawing"

export interface MapDrawingAlternative {
    type: "main" | "alternative" | "for_visually_impaired"
    questionNepali: string
}

export interface SocialStudiesQuestion {
    id: string
    questionNumber: string
    type: SocialStudiesQuestionType
    marks: number
    questionNepali: string
    answerNepali?: string
    explanationNepali?: string
    // For map_drawing questions with alternatives
    alternatives?: MapDrawingAlternative[]
}

export interface SocialStudiesGroup {
    groupName: string
    groupInstruction: string
    marksSchema: string
    questions: SocialStudiesQuestion[]
}
