/**
 * Format answers for display, converting structured data into readable text.
 * This avoids showing raw JSON in the UI.
 */
export function formatAnswerForDisplay(answer: any): string {
    if (typeof answer === 'string') return answer
    if (answer === null || answer === undefined) return ''

    // Handle matching question arrays: [{ A: "i", B: "c" }, ...] or word formation arrays
    if (Array.isArray(answer)) {
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
            return String(item)
        }).join('; ')
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
