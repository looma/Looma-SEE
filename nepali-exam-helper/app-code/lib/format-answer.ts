/**
 * Format answers for display, converting structured data into readable text.
 * This avoids showing raw JSON in the UI.
 */
export function formatAnswerForDisplay(answer: any): string {
    if (typeof answer === 'string') return answer
    if (answer === null || answer === undefined) return ''

    // Handle matching question arrays: [{ A: "i", B: "c" }, ...] or word formation arrays
    if (Array.isArray(answer)) {
        // Check if this is a simple string array (like note_taking points)
        const isSimpleStringArray = answer.every(item => typeof item === 'string' || item === null || item === undefined)

        if (isSimpleStringArray) {
            // For simple arrays, show as numbered list with empty indicators
            const nonEmptyItems = answer.filter(item => typeof item === 'string' && item.trim().length > 0)
            if (nonEmptyItems.length === 0) {
                return '' // All empty
            }
            return nonEmptyItems.map((item, idx) => `${idx + 1}. ${item}`).join('\n')
        }

        return answer.map((item, idx) => {
            if (item && typeof item === 'object') {
                // Matching format: { A: "i", B: "c" }
                if (item.A && item.B) return `(${item.A}) → (${item.B})`
                // Word formation format: { type: "Prefix", items: [...] }
                if (item.type && item.items !== undefined) {
                    const itemsText = formatAnswerForDisplay(item.items)
                    return `${item.type}: ${itemsText}`
                }
                // Word/formation pair: { word: "...", formation: "..." }
                if (item.word && item.formation) {
                    return `${item.word} = ${item.formation}`
                }
                // Word/pos pair: { word: "...", pos: "..." }
                if (item.word && item.pos) {
                    return `${item.word} → ${item.pos}`
                }
                // Phrase/compound: { phrase: "...", compound: "..." }
                if (item.phrase && item.compound) {
                    return `${item.phrase} → ${item.compound}`
                }
                // Split/word: { split: "...", word: "..." }
                if (item.split && item.word) {
                    return `${item.word} = ${item.split}`
                }
                // General object format - recursively format values
                return Object.entries(item).map(([k, v]) => {
                    const formattedV = formatAnswerForDisplay(v)
                    return `${k}: ${formattedV}`
                }).join(', ')
            }
            // Skip empty strings in complex arrays
            if (typeof item === 'string' && item.trim().length === 0) return null
            return String(item)
        }).filter(Boolean).join('; ')
    }

    // Handle objects
    if (typeof answer === 'object') {
        // Handle special nested structures for Nepali word formation
        // e.g., { "उपसर्ग": [{word, formation}], "प्रत्यय": [{word, formation}] }
        const entries = Object.entries(answer).filter(([k]) => !k.startsWith('selected'))

        // Check if this is a word/formation pair itself
        if (answer.word && answer.formation) {
            return `${answer.word} = ${answer.formation}`
        }
        // Word/pos pair
        if (answer.word && answer.pos) {
            return `${answer.word} → ${answer.pos}`
        }
        // Phrase/compound pair
        if (answer.phrase && answer.compound) {
            return `${answer.phrase} → ${answer.compound}`
        }
        // Split structure: { split: "...", word: "..." }
        if (answer.split && answer.word) {
            return `${answer.word} = ${answer.split}`
        }
        // Type/items structure
        if (answer.type && answer.items !== undefined) {
            return `${answer.type}: ${formatAnswerForDisplay(answer.items)}`
        }

        return entries.map(([k, v]) => {
            const formattedV = formatAnswerForDisplay(v)
            return `${k}: ${formattedV}`
        }).join('\n')
    }

    return String(answer)
}
