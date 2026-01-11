"use client"

import { extractCitation, buildChapterUrl } from "@/lib/citation-utils"
import { ExternalLink } from "lucide-react"
import { MathText } from "./math-text"

interface CitationTextProps {
    text: string
    subject: 'english' | 'math' | 'science' | 'social' | 'nepali'
    pageLanguage: 'en' | 'np'
    className?: string
}

/**
 * Renders explanation text with clickable citation links to looma.website
 * Citations like "Citation: Chapter 8" become clickable links that open the chapter
 * Supports MathText rendering for LaTeX content
 */
export function CitationText({ text, subject, pageLanguage, className = "" }: CitationTextProps) {
    if (!text) return null

    const extracted = extractCitation(text)

    if (!extracted || !extracted.parsed) {
        // No citation found, render as MathText for LaTeX support
        return <MathText text={text} className={className} />
    }

    const { textBeforeCitation, citationText, parsed } = extracted
    const url = buildChapterUrl(subject, parsed.chapter!, parsed.lesson, pageLanguage)

    // Check if URL building returned an error
    const isError = typeof url === 'object' && 'error' in url

    return (
        <span className={className}>
            <MathText text={textBeforeCitation} />
            {textBeforeCitation && <br />}
            {isError ? (
                // Show error styling for missing lesson number (Social Studies)
                <span className="text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded inline-flex items-center gap-1">
                    ⚠️ {citationText} — {url.error}
                </span>
            ) : (
                // Render clickable citation link
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline decoration-blue-400 hover:decoration-blue-600 font-medium"
                    title={`Open chapter on Looma.website`}
                >
                    <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{citationText}</span>
                </a>
            )}
        </span>
    )
}

/**
 * Helper to get the subject type from test ID
 */
export function getSubjectFromTestId(testId: string): 'english' | 'math' | 'science' | 'social' | 'nepali' | null {
    const lower = testId.toLowerCase()
    if (lower.includes('english')) return 'english'
    if (lower.includes('math')) return 'math'
    if (lower.includes('science')) return 'science'
    if (lower.includes('social')) return 'social'
    if (lower.includes('nepali')) return 'nepali'
    return null
}
