"use client"

import React from "react"
import "katex/dist/katex.min.css"
import { InlineMath, BlockMath } from "react-katex"

interface MathTextProps {
    text: string
    className?: string
}

/**
 * Component that renders text with embedded LaTeX math.
 * - Inline math: $...$ 
 * - Block math: $$...$$
 * 
 * Falls back to raw text if KaTeX fails to parse.
 */
export function MathText({ text, className }: MathTextProps) {
    if (!text) return null

    // Parse text for math delimiters
    const parts = parseMathText(text)

    return (
        <span className={className}>
            {parts.map((part, index) => {
                if (part.type === "text") {
                    return <span key={index} style={{ whiteSpace: 'pre-line' }}>{part.content}</span>
                } else if (part.type === "inline-math") {
                    return (
                        <span key={index} className="inline-block align-middle">
                            <SafeInlineMath math={part.content} />
                        </span>
                    )
                } else if (part.type === "block-math") {
                    return (
                        <div key={index} className="my-2">
                            <SafeBlockMath math={part.content} />
                        </div>
                    )
                }
                return null
            })}
        </span>
    )
}

interface MathPart {
    type: "text" | "inline-math" | "block-math"
    content: string
}

function parseMathText(text: string): MathPart[] {
    const parts: MathPart[] = []
    let remaining = text

    // Pattern for block math ($$...$$) and inline math ($...$)
    // Process block math first since $$ contains $
    const blockPattern = /\$\$([\s\S]*?)\$\$/
    const inlinePattern = /\$([^$\n]+?)\$/

    while (remaining.length > 0) {
        const blockMatch = remaining.match(blockPattern)
        const inlineMatch = remaining.match(inlinePattern)

        // Find which match comes first
        let nextMatch: { type: "inline-math" | "block-math"; match: RegExpMatchArray } | null = null

        if (blockMatch && inlineMatch) {
            if ((blockMatch.index ?? Infinity) <= (inlineMatch.index ?? Infinity)) {
                nextMatch = { type: "block-math", match: blockMatch }
            } else {
                nextMatch = { type: "inline-math", match: inlineMatch }
            }
        } else if (blockMatch) {
            nextMatch = { type: "block-math", match: blockMatch }
        } else if (inlineMatch) {
            nextMatch = { type: "inline-math", match: inlineMatch }
        }

        if (nextMatch) {
            const { type, match } = nextMatch
            const matchIndex = match.index ?? 0

            // Add text before the match
            if (matchIndex > 0) {
                parts.push({ type: "text", content: remaining.substring(0, matchIndex) })
            }

            // Add the math part
            parts.push({ type, content: match[1] })

            // Continue with remaining text
            remaining = remaining.substring(matchIndex + match[0].length)
        } else {
            // No more math, add remaining text
            parts.push({ type: "text", content: remaining })
            break
        }
    }

    return parts
}

// Safe wrapper for InlineMath that catches errors
function SafeInlineMath({ math }: { math: string }) {
    try {
        return <InlineMath math={math} />
    } catch (error) {
        console.error("KaTeX inline math error:", error)
        return <span className="text-red-500 font-mono text-sm">${math}$</span>
    }
}

// Safe wrapper for BlockMath that catches errors
function SafeBlockMath({ math }: { math: string }) {
    try {
        return <BlockMath math={math} />
    } catch (error) {
        console.error("KaTeX block math error:", error)
        return <div className="text-red-500 font-mono text-sm">$${math}$$</div>
    }
}
