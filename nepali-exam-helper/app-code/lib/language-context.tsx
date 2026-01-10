"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type AppLanguage = "english" | "nepali"

interface LanguageContextType {
    language: AppLanguage
    setLanguage: (lang: AppLanguage) => void
    isLanguageSwitchEnabled: boolean
    setLanguageSwitchEnabled: (enabled: boolean) => void
    disabledReason: string | null
    setDisabledReason: (reason: string | null) => void
    currentTestId: string | null
    setCurrentTestId: (testId: string | null) => void
}

const LanguageContext = createContext<LanguageContextType>({
    language: "english",
    setLanguage: () => { },
    isLanguageSwitchEnabled: true,
    setLanguageSwitchEnabled: () => { },
    disabledReason: null,
    setDisabledReason: () => { },
    currentTestId: null,
    setCurrentTestId: () => { },
})

const LANGUAGE_STORAGE_KEY = "see_app_language"

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<AppLanguage>("english")
    const [isLanguageSwitchEnabled, setLanguageSwitchEnabled] = useState(true)
    const [disabledReason, setDisabledReason] = useState<string | null>(null)
    const [currentTestId, setCurrentTestId] = useState<string | null>(null)
    const [isHydrated, setIsHydrated] = useState(false)

    // Load saved language preference on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY)
            if (saved === "english" || saved === "nepali") {
                setLanguageState(saved)
            }
        } catch (error) {
            console.error("Error loading language preference:", error)
        }
        setIsHydrated(true)
    }, [])

    // Save language preference when changed
    const setLanguage = (lang: AppLanguage) => {
        setLanguageState(lang)
        try {
            localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
        } catch (error) {
            console.error("Error saving language preference:", error)
        }
    }

    // Prevent hydration mismatch by using default until hydrated
    const value: LanguageContextType = {
        language: isHydrated ? language : "english",
        setLanguage,
        isLanguageSwitchEnabled,
        setLanguageSwitchEnabled,
        disabledReason,
        setDisabledReason,
        currentTestId,
        setCurrentTestId,
    }

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider")
    }
    return context
}

/**
 * Language switching is always enabled since all test types now support bilingual content.
 * This function is kept for API compatibility but always returns true.
 */
export function getLanguageSwitchEnabled(_testId: string | null): boolean {
    return true // All test types now support bilingual switching
}

/**
 * Get a reason message for why language switching is disabled
 * Returns null if switching is enabled
 */
export function getDisabledReason(testId: string | null, language: AppLanguage): string | null {
    if (!testId) return null

    // All test types now support bilingual content
    return null
}

/**
 * Get the recommended language for a test based on how the actual SEE exam is administered.
 * - Nepali and Social Studies tests are administered in Nepali
 * - English tests are administered in English
 * - Math and Science have no specific recommendation
 * Returns null if no specific recommendation.
 */
export function getRecommendedLanguage(testId: string | null): AppLanguage | null {
    if (!testId) return null

    const testLower = testId.toLowerCase()

    // Nepali and Social Studies tests should be done in Nepali
    if (testLower.includes("nepali") || testLower.includes("social")) {
        return "nepali"
    }

    // English tests should be done in English
    if (testLower.includes("english")) {
        return "english"
    }

    // No specific recommendation for Math, Science, etc.
    return null
}

/**
 * Get the subject name for display purposes
 */
export function getSubjectFromTestId(testId: string | null): string | null {
    if (!testId) return null

    const testLower = testId.toLowerCase()

    if (testLower.includes("nepali")) return "Nepali"
    if (testLower.includes("social")) return "Social Studies"
    if (testLower.includes("english")) return "English"
    if (testLower.includes("math")) return "Math"
    if (testLower.includes("science")) return "Science"

    return null
}

/**
 * UI translations for common strings
 */
export const translations = {
    // App header
    "SEE Exam Practice": {
        english: "SEE Exam Practice",
        nepali: "SEE परीक्षा अभ्यास",
    },
    // Header/buttons
    "Change Test": {
        english: "Change Test",
        nepali: "परीक्षा परिवर्तन गर्नुहोस्",
    },
    "Log Out": {
        english: "Log Out",
        nepali: "लग आउट",
    },
    "Submit Test": {
        english: "Submit Test",
        nepali: "परीक्षा पेश गर्नुहोस्",
    },
    "Next Section": {
        english: "Next Section",
        nepali: "अर्को खण्ड",
    },
    "Previous Section": {
        english: "Previous Section",
        nepali: "अघिल्लो खण्ड",
    },
    // Results page
    "Your Results": {
        english: "Your Results",
        nepali: "तपाईंको परिणाम",
    },
    "Take Test Again": {
        english: "Take Test Again",
        nepali: "फेरि परीक्षा दिनुहोस्",
    },
    "Edit Answers": {
        english: "Edit Answers",
        nepali: "उत्तरहरू सम्पादन गर्नुहोस्",
    },
    "Your Answer": {
        english: "Your Answer",
        nepali: "तपाईंको उत्तर",
    },
    "Correct Answer": {
        english: "Correct Answer",
        nepali: "सही उत्तर",
    },
    "Explanation": {
        english: "Explanation",
        nepali: "व्याख्या",
    },
    "Feedback": {
        english: "Feedback",
        nepali: "प्रतिक्रिया",
    },
    "Sample Answer": {
        english: "Sample Answer",
        nepali: "नमूना उत्तर",
    },
    "No answer provided": {
        english: "No answer provided",
        nepali: "कुनै उत्तर प्रदान गरिएको छैन",
    },
    "Question": {
        english: "Question",
        nepali: "प्रश्न",
    },
    // Loading states
    "Loading...": {
        english: "Loading...",
        nepali: "लोड हुँदैछ...",
    },
    // Test selection
    "Select a Test": {
        english: "Select a Test",
        nepali: "परीक्षा छान्नुहोस्",
    },
    "Continue": {
        english: "Continue",
        nepali: "जारी राख्नुहोस्",
    },
    "Start Test": {
        english: "Start Test",
        nepali: "परीक्षा सुरु गर्नुहोस्",
    },
    // Groups
    "Group A - Multiple Choice": {
        english: "Group A - Multiple Choice",
        nepali: "समूह 'क' - बहुविकल्पीय",
    },
    "Group B - Short Answer": {
        english: "Group B - Short Answer",
        nepali: "समूह 'ख' - छोटो उत्तर",
    },
    "Group C - Long Answer": {
        english: "Group C - Long Answer",
        nepali: "समूह 'ग' - लामो उत्तर",
    },
    "Group D - Essay": {
        english: "Group D - Essay",
        nepali: "समूह 'घ' - निबन्ध",
    },
    // Previous attempts
    "Previous Attempts": {
        english: "Previous Attempts",
        nepali: "अघिल्लो प्रयासहरू",
    },
    "Latest": {
        english: "Latest",
        nepali: "पछिल्लो",
    },
    "Attempt": {
        english: "Attempt",
        nepali: "प्रयास",
    },
} as const

export type TranslationKey = keyof typeof translations

/**
 * Helper function to get translated string
 */
export function t(key: TranslationKey, language: AppLanguage): string {
    const translation = translations[key]
    if (!translation) return key
    return translation[language] || translation.english || key
}
