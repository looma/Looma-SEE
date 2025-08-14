// Quick script to clean a specific JSON file
// Usage: node scripts/clean-json-file.mjs --file ./data/problematic-file.json

import fs from "node:fs/promises"
import path from "node:path"

async function cleanJSONFile(filePath) {
  console.log(`🧹 Cleaning: ${path.basename(filePath)}`)
  
  try {
    const content = await fs.readFile(filePath, "utf8")
    
    // Find the end of the JSON array
    let cleanContent = content.trim()
    let bracketCount = 0
    let inString = false
    let escaped = false
    let jsonEndIndex = -1
    
    for (let i = 0; i < cleanContent.length; i++) {
      const char = cleanContent[i]
      
      if (escaped) {
        escaped = false
        continue
      }
      
      if (char === '\\') {
        escaped = true
        continue
      }
      
      if (char === '"' && !escaped) {
        inString = !inString
        continue
      }
      
      if (!inString) {
        if (char === '[') {
          bracketCount++
        } else if (char === ']') {
          bracketCount--
          if (bracketCount === 0) {
            jsonEndIndex = i
            break
          }
        }
      }
    }
    
    if (jsonEndIndex !== -1) {
      cleanContent = cleanContent.slice(0, jsonEndIndex + 1)
    }
    
    // Try to parse and reformat
    const parsed = JSON.parse(cleanContent)
    const formatted = JSON.stringify(parsed, null, 2)
    
    // Create backup
    const backupPath = filePath.replace('.json', '_backup.json')
    await fs.copyFile(filePath, backupPath)
    console.log(`💾 Created backup: ${path.basename(backupPath)}`)
    
    // Write cleaned version
    await fs.writeFile(filePath, formatted)
    console.log(`✅ Cleaned and formatted: ${path.basename(filePath)}`)
    
    // Validate structure
    if (!Array.isArray(parsed)) {
      console.log(`⚠️  Warning: Root is not an array`)
      return
    }
    
    const practiceDoc = parsed.find(d => d.title && d.subject && d._id)
    const questionsDoc = parsed.find(d => d.testId && d.questions)
    
    if (!practiceDoc) {
      console.log(`⚠️  Warning: No practice test document found`)
    } else {
      console.log(`✅ Found practice test: ${practiceDoc._id}`)
    }
    
    if (!questionsDoc) {
      console.log(`⚠️  Warning: No questions document found`)
    } else {
      const counts = {
        A: questionsDoc.questions?.groupA?.length || 0,
        B: questionsDoc.questions?.groupB?.length || 0,
        C: questionsDoc.questions?.groupC?.length || 0,
        D: questionsDoc.questions?.groupD?.length || 0
      }
      console.log(`✅ Found questions: A:${counts.A}, B:${counts.B}, C:${counts.C}, D:${counts.D}`)
    }
    
    console.log(`🎉 File is now ready for import!`)
    
  } catch (error) {
    console.error(`❌ Error cleaning file: ${error.message}`)
    
    if (error.message.includes('Unexpected')) {
      console.log(`\n💡 The file appears to have extra content after the JSON.`)
      console.log(`   Try opening the file in a text editor and removing any`)
      console.log(`   content after the final ']' bracket.`)
    }
  }
}

async function main() {
  const args = process.argv.slice(2)
  const fileIndex = args.indexOf('--file')
  
  if (fileIndex === -1 || !args[fileIndex + 1]) {
    console.log("Usage: node scripts/clean-json-file.mjs --file ./data/your-file.json")
    return
  }
  
  const filePath = args[fileIndex + 1]
  await cleanJSONFile(filePath)
}

main().catch(console.error)
