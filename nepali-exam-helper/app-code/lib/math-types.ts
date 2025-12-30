// TypeScript interfaces for Math (Compulsory Mathematics) test format
// New bilingual format with language switching support

export interface MathSubQuestion {
    // Labels in both languages
    labelNepali: string              // "क", "ख", "ग", "घ"
    labelEnglish: string             // "a", "b", "c", "d"

    // Questions in both languages
    questionNepali: string           // Nepali version
    questionEnglish: string          // English version

    // Answers in both languages
    answerNepali: string             // Expected answer in Nepali (with LaTeX)
    answerEnglish: string            // Expected answer in English (with LaTeX)

    // Explanations in both languages
    explanationNepali: string        // Explanation in Nepali with LaTeX support
    explanationEnglish: string       // Explanation in English with LaTeX support

    // Marks in both formats
    marksNepali: string              // "१", "२", etc.
    marksEnglish: number             // 1, 2, etc.
}

export interface MathQuestion {
    // Question number in both languages
    question_numberNepali: string    // "१", "२", etc.
    question_numberEnglish: number   // 1, 2, etc.

    // Context/problem statement (capitalized keys in new format)
    context: {
        Nepali: string               // Problem statement in Nepali
        English: string              // Problem statement in English
    }

    sub_questions: MathSubQuestion[] // Array of sub-questions (a, b, c, d)
}

export interface MathTestMetadata {
    _id: string
    titleNepali: string
    titleEnglish: string
    subjectNepali: string
    subjectEnglish: string
    totalMarksNepali: string         // "७५"
    totalMarksEnglish: number        // 75
    durationNepali: string           // "१८०"
    durationEnglish: number          // 180
}

// Helper function to get context in selected language
export function getContextText(context: MathQuestion['context'], language: 'english' | 'nepali'): string {
    return language === 'english' ? context.English : context.Nepali
}

// Helper function to get sub-question text in selected language
export function getSubQuestionText(subQ: MathSubQuestion, language: 'english' | 'nepali'): string {
    return language === 'english' ? subQ.questionEnglish : subQ.questionNepali
}

// Helper function to get label in selected language
export function getLabel(subQ: MathSubQuestion, language: 'english' | 'nepali'): string {
    return language === 'english' ? subQ.labelEnglish : subQ.labelNepali
}

// Helper function to get answer in selected language
export function getAnswer(subQ: MathSubQuestion, language: 'english' | 'nepali'): string {
    return language === 'english' ? subQ.answerEnglish : subQ.answerNepali
}

// Helper function to get explanation in selected language
export function getExplanation(subQ: MathSubQuestion, language: 'english' | 'nepali'): string {
    return language === 'english' ? subQ.explanationEnglish : subQ.explanationNepali
}

// Helper function to get marks (always use English number for calculations)
export function getMarks(subQ: MathSubQuestion): number {
    return subQ.marksEnglish
}

// Helper function to get question number
export function getQuestionNumber(q: MathQuestion, language: 'english' | 'nepali'): string | number {
    return language === 'english' ? q.question_numberEnglish : q.question_numberNepali
}
