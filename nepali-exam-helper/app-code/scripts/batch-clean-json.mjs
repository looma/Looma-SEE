// Clean all JSON files in the data directory
// Usage: node scripts/batch-clean-json.mjs

import fs from "node:fs/promises"
import path from "node:path"

async function cleanAllJSONFiles() {
  console.log("🧹 Batch cleaning all JSON files in data/ directory")
  console.log("=" .repeat(60))
  
  try {
    const files = await fs.readdir("data")
    const jsonFiles = files.filter(f => f.endsWith('.json') && !f.includes('_backup') && !f.includes('_fixed'))
    
    if (jsonFiles.length === 0) {
      console.log("No JSON files found in data/ directory")
      return
    }
    
    console.log(`Found ${jsonFiles.length} JSON files to clean:`)
    jsonFiles.forEach(f => console.log(`  - ${f}`))
    console.log()
    
    let successCount = 0
    let errorCount = 0
    
    for (const file of jsonFiles) {
      const filePath = path.join("data", file)
      
      try {
        console.log(`\n🔧 Processing: ${file}`)
        
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
        
        if (jsonEndIndex !== -1 && jsonEndIndex < cleanContent.length - 1) {
          const extraContent = cleanContent.slice(jsonEndIndex + 1).trim()
          if (extraContent) {
            console.log(`   🗑️  Removing ${extraContent.length} extra characters`)
            cleanContent = cleanContent.slice(0, jsonEndIndex + 1)
          }
        }
        
        // Parse and reformat
        const parsed = JSON.parse(cleanContent)
        const formatted = JSON.stringify(parsed, null, 2)
        
        // Create backup
        const backupPath = filePath.replace('.json', '_backup.json')
        await fs.copyFile(filePath, backupPath)
        
        // Write cleaned version
        await fs.writeFile(filePath, formatted)
        
        console.log(`   ✅ Cleaned successfully`)
        successCount++
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`)
        errorCount++
      }
    }
    
    console.log("\n" + "=" .repeat(60))
    console.log(`📊 Results: ${successCount} cleaned, ${errorCount} errors`)
    
    if (successCount > 0) {
      console.log("\n✅ Cleaned files are ready for import:")
      console.log("   node scripts/import-all-tests.mjs")
    }
    
    if (errorCount > 0) {
      console.log("\n⚠️  Some files had errors and may need manual review")
    }
    
  } catch (error) {
    console.error(`❌ Error accessing data directory: ${error.message}`)
  }
}

cleanAllJSONFiles()
