// Script to validate and fix JSON files before importing
// Usage: node scripts/validate-and-fix-json.mjs --file ./data/your-file.json

import fs from "node:fs/promises"
import path from "node:path"

function parseArgs() {
  const argv = process.argv.slice(2)
  const args = {}
  
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--file" && argv[i + 1]) {
      args.file = argv[i + 1]
      i++
    } else if (argv[i] === "--dir" && argv[i + 1]) {
      args.dir = argv[i + 1]
      i++
    } else if (argv[i] === "--fix") {
      args.fix = true
    }
  }
  
  return args
}

async function validateAndFixJSON(filePath, shouldFix = false) {
  console.log(`\n🔍 Checking: ${path.basename(filePath)}`)
  
  try {
    const content = await fs.readFile(filePath, "utf8")
    
    // Check for common issues
    const issues = []
    
    // Check for extra content after JSON
    const trimmedContent = content.trim()
    let jsonEndIndex = -1
    let bracketCount = 0
    let inString = false
    let escaped = false
    
    for (let i = 0; i < trimmedContent.length; i++) {
      const char = trimmedContent[i]
      
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
    
    if (jsonEndIndex !== -1 && jsonEndIndex < trimmedContent.length - 1) {
      const extraContent = trimmedContent.slice(jsonEndIndex + 1).trim()
      if (extraContent) {
        issues.push(`Extra content after JSON: "${extraContent.slice(0, 100)}${extraContent.length > 100 ? '...' : ''}"`)
      }
    }
    
    // Try to parse the JSON
    let validJSON = trimmedContent
    if (jsonEndIndex !== -1 && jsonEndIndex < trimmedContent.length - 1) {
      validJSON = trimmedContent.slice(0, jsonEndIndex + 1)
    }
    
    let parsed
    try {
      parsed = JSON.parse(validJSON)
      console.log(`✅ Valid JSON structure found`)
    } catch (parseError) {
      issues.push(`JSON parse error: ${parseError.message}`)
      
      // Try to find and fix common issues
      let fixedJSON = validJSON
      
      // Fix trailing commas
      fixedJSON = fixedJSON.replace(/,(\s*[}\]])/g, '$1')
      
      // Fix unescaped quotes in strings (basic attempt)
      // This is tricky and might need manual review
      
      try {
        parsed = JSON.parse(fixedJSON)
        console.log(`✅ Fixed JSON parsing issues`)
        validJSON = fixedJSON
      } catch (stillError) {
        console.log(`❌ Could not auto-fix JSON: ${stillError.message}`)
        return { valid: false, issues, content: validJSON }
      }
    }
    
    // Validate structure
    if (!Array.isArray(parsed)) {
      issues.push("Root should be an array")
    } else {
      const practiceDoc = parsed.find(d => d.title && d.subject && d._id)
      const questionsDoc = parsed.find(d => d.testId && d.questions)
      
      if (!practiceDoc) {
        issues.push("Missing practice test document")
      }
      if (!questionsDoc) {
        issues.push("Missing questions document")
      }
      
      if (practiceDoc && questionsDoc) {
        const testId = practiceDoc._id
        if (questionsDoc.testId !== testId) {
          issues.push(`testId mismatch: practice._id="${testId}" vs questions.testId="${questionsDoc.testId}"`)
        }
        
        // Count questions
        const counts = {
          A: questionsDoc.questions?.groupA?.length || 0,
          B: questionsDoc.questions?.groupB?.length || 0,
          C: questionsDoc.questions?.groupC?.length || 0,
          D: questionsDoc.questions?.groupD?.length || 0
        }
        console.log(`📊 Questions: A:${counts.A}, B:${counts.B}, C:${counts.C}, D:${counts.D}`)
      }
    }
    
    if (issues.length === 0) {
      console.log(`✅ File is valid and ready for import`)
      return { valid: true, issues: [], content: validJSON, parsed }
    } else {
      console.log(`⚠️  Found ${issues.length} issues:`)
      issues.forEach(issue => console.log(`   - ${issue}`))
      
      if (shouldFix) {
        const fixedPath = filePath.replace('.json', '_fixed.json')
        await fs.writeFile(fixedPath, JSON.stringify(parsed, null, 2))
        console.log(`🔧 Created fixed version: ${path.basename(fixedPath)}`)
      }
      
      return { valid: false, issues, content: validJSON, parsed }
    }
    
  } catch (error) {
    console.log(`❌ Error reading file: ${error.message}`)
    return { valid: false, issues: [error.message], content: null }
  }
}

async function main() {
  const args = parseArgs()
  
  if (!args.file && !args.dir) {
    console.log("Usage:")
    console.log("  node scripts/validate-and-fix-json.mjs --file ./data/your-file.json")
    console.log("  node scripts/validate-and-fix-json.mjs --dir ./data --fix")
    console.log("")
    console.log("Options:")
    console.log("  --fix    Create fixed versions of invalid files")
    return
  }
  
  const filesToCheck = []
  
  if (args.file) {
    filesToCheck.push(args.file)
  } else if (args.dir) {
    try {
      const files = await fs.readdir(args.dir)
      const jsonFiles = files.filter(f => f.endsWith('.json') && !f.endsWith('_fixed.json'))
      filesToCheck.push(...jsonFiles.map(f => path.join(args.dir, f)))
    } catch (error) {
      console.error(`❌ Error reading directory: ${error.message}`)
      return
    }
  }
  
  console.log(`🔍 Checking ${filesToCheck.length} JSON files...`)
  console.log("=" .repeat(60))
  
  let validCount = 0
  let invalidCount = 0
  
  for (const file of filesToCheck) {
    const result = await validateAndFixJSON(file, args.fix)
    if (result.valid) {
      validCount++
    } else {
      invalidCount++
    }
  }
  
  console.log("\n" + "=" .repeat(60))
  console.log(`📊 Summary: ${validCount} valid, ${invalidCount} invalid`)
  
  if (invalidCount > 0) {
    console.log("\n💡 To fix issues automatically, run with --fix flag")
    console.log("   Then review the _fixed.json files before importing")
  }
  
  if (validCount > 0) {
    console.log("\n✅ Valid files can be imported with:")
    console.log("   node scripts/import-all-tests.mjs")
  }
}

main().catch(console.error)
