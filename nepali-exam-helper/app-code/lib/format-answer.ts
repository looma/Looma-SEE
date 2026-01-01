/**
 * Format answers for display, converting structured data into readable text.
 * This avoids showing raw JSON in the UI.
 */
export function formatAnswerForDisplay(answer: any): string {
    if (typeof answer === 'string') return answer
    if (answer === null || answer === undefined) return ''

    // Handle matching question arrays: [{ A: "i", B: "c" }, ...]
    if (Array.isArray(answer)) {
        return answer.map((item, idx) => {
            if (item && typeof item === 'object') {
                // Matching format: { A: "i", B: "c" }
                if (item.A && item.B) return `(${item.A}) → (${item.B})`
                // General object format
                return Object.entries(item).map(([k, v]) => `${k}: ${v}`).join(', ')
            }
            return String(item)
        }).join('\n')
    }

    // Handle objects
    if (typeof answer === 'object') {
        // Filter out 'selected' keys and format entries
        const entries = Object.entries(answer).filter(([k]) => !k.startsWith('selected'))
        return entries.map(([k, v]) => {
            if (typeof v === 'object' && v !== null) {
                return `${k}: ${formatAnswerForDisplay(v)}`
            }
            return `${k} → ${v}`
        }).join('\n')
    }

    return String(answer)
}
