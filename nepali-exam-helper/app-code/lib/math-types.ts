// TypeScript interfaces for Math (Compulsory Mathematics) test format

export interface MathSubQuestion {
    label: string                    // "a", "b", "c", "d"
    question_nepali: string          // Nepali version (may be empty for single-part questions)
    question_english: string         // English version (may be empty for single-part questions)
    answer: string                   // Expected answer (with LaTeX)
    explanation: string              // Explanation with LaTeX support
}

export interface MathQuestion {
    question_number: number          // 1, 2, 3, etc.
    context: {
        nepali: string                 // Problem statement in Nepali (with LaTeX)
        english: string                // Problem statement in English (with LaTeX)
    }
    sub_questions: MathSubQuestion[] // Array of sub-questions (a, b, c, d)
}

export interface MathTestMetadata {
    title: string
    subject: string                  // "Compulsory Mathematics (अनिवार्य गणित)"
    duration: number                 // in minutes
    totalMarks: number
}

// For the raw JSON format from the data files
export interface MathTestRawFormat {
    exam_metadata: MathTestMetadata
    questions: MathQuestion[]
}
