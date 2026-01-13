/**
 * Citation utilities for converting text citations to clickable looma.website links
 */

// Nepali numeral to Arabic numeral mapping
const nepaliToArabic: Record<string, string> = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
}

/**
 * Convert Nepali numerals to Arabic numerals
 */
function convertNepaliNumerals(text: string): string {
    return text.replace(/[०-९]/g, (char) => nepaliToArabic[char] || char)
}

/**
 * Parse a citation string to extract chapter and lesson numbers
 * Handles both English ("Chapter 8") and Nepali ("अध्याय ८" / "पाठ ८") formats
 */
export function parseCitation(text: string): { chapter?: number; lesson?: number } | null {
    if (!text) return null

    // Convert Nepali numerals first
    const normalizedText = convertNepaliNumerals(text)

    // Pattern for Social Studies: "Chapter X, Lesson Y" or "अध्याय X, पाठ Y"
    const socialPattern = /(?:Chapter|अध्याय)\s*(\d+)\s*[,;]\s*(?:Lesson|पाठ)\s*(\d+)/i
    const socialMatch = normalizedText.match(socialPattern)
    if (socialMatch) {
        return {
            chapter: parseInt(socialMatch[1], 10),
            lesson: parseInt(socialMatch[2], 10)
        }
    }

    // Pattern for single chapter: "Chapter X" or "अध्याय X" or "पाठ X"
    const chapterPattern = /(?:Chapter|अध्याय|पाठ)\s*(\d+)/i
    const chapterMatch = normalizedText.match(chapterPattern)
    if (chapterMatch) {
        return {
            chapter: parseInt(chapterMatch[1], 10)
        }
    }

    return null
}

/**
 * Build a looma.website URL for a given chapter
 * 
 * @param subject - The test subject: 'english', 'math', 'science', 'social', 'nepali'
 * @param chapter - Chapter number
 * @param lesson - Lesson number (required for Social Studies)
 * @param pageLanguage - Current page language: 'en' or 'np'
 */
export function buildChapterUrl(
    subject: 'english' | 'math' | 'science' | 'social' | 'nepali',
    chapter: number,
    lesson: number | undefined,
    pageLanguage: 'en' | 'np'
): string | { error: string } {
    // Pad chapter/lesson to 2 digits
    const chapterStr = chapter.toString().padStart(2, '0')
    const lessonStr = lesson?.toString().padStart(2, '0')

    let chapterID: string
    let urlSubject: string
    let lang: 'en' | 'np'

    // Nepali language PDFs have "-nepali" suffix in the filename
    switch (subject) {
        case 'english':
            chapterID = `10EN${chapterStr}`
            urlSubject = 'English'
            lang = 'en'
            break

        case 'math':
            lang = pageLanguage
            // Math PDFs: 10M01.pdf (English) or 10M01-nepali.pdf (Nepali)
            chapterID = lang === 'np' ? `10M${chapterStr}-nepali` : `10M${chapterStr}`
            urlSubject = 'Math'
            break

        case 'science':
            lang = pageLanguage
            // Science PDFs: 10S01.pdf (English) or 10S01-nepali.pdf (Nepali)
            chapterID = lang === 'np' ? `10S${chapterStr}-nepali` : `10S${chapterStr}`
            urlSubject = 'Science'
            break

        case 'social':
            // Default to lesson 1 if lesson number not specified
            const actualLesson = lesson || 1
            const actualLessonStr = actualLesson.toString().padStart(2, '0')
            chapterID = `10SS${chapterStr}.${actualLessonStr}-nepali`
            urlSubject = 'SocialStudies'
            lang = 'np'
            break

        case 'nepali':
            chapterID = `10N${chapterStr}-nepali`
            urlSubject = 'Nepali'
            lang = 'np'
            break

        default:
            return { error: `Unknown subject: ${subject}` }
    }

    return `https://looma.website/pdf?fn=${chapterID}.pdf&fp=../content/chapters/Class10/${urlSubject}/${lang}/&lang=${lang}&zoom=2.1&len=100&page=1`
}

/**
 * Detect subject from test type or test name
 */
export function detectSubjectFromTest(testType: string): 'english' | 'math' | 'science' | 'social' | 'nepali' | null {
    const lower = testType.toLowerCase()
    if (lower.includes('english')) return 'english'
    if (lower.includes('math')) return 'math'
    if (lower.includes('science')) return 'science'
    if (lower.includes('social')) return 'social'
    if (lower.includes('nepali')) return 'nepali'
    return null
}

/**
 * Extract and parse citation from explanation text
 * Returns the text split into parts: before citation, citation info, and whether it's valid
 */
export function extractCitation(text: string): {
    textBeforeCitation: string
    citationText: string
    parsed: { chapter?: number; lesson?: number } | null
} | null {
    if (!text) return null

    // Find "Citation:" or "उद्धरण:" pattern
    const citationMarkerPattern = /(Citation:|उद्धरण:)\s*(.+?)$/i
    const match = text.match(citationMarkerPattern)

    if (!match) return null

    const citationStart = text.indexOf(match[0])
    const textBeforeCitation = text.substring(0, citationStart).trim()
    const citationText = match[0]
    const parsed = parseCitation(match[2])

    return {
        textBeforeCitation,
        citationText,
        parsed
    }
}
