// This will search for any hardcoded test data in the codebase
import fs from "node:fs/promises"
import path from "node:path"

async function searchInFile(filePath, searchTerms) {
  try {
    const content = await fs.readFile(filePath, "utf8")
    const findings = []
    
    searchTerms.forEach(term => {
      if (content.toLowerCase().includes(term.toLowerCase())) {
        const lines = content.split('\n')
        lines.forEach((line, index) => {
          if (line.toLowerCase().includes(term.toLowerCase())) {
            findings.push({
              term,
              line: index + 1,
              content: line.trim()
            })
          }
        })
      }
    })
    
    return findings
  } catch (error) {
    return []
  }
}

async function searchDirectory(dir, searchTerms, extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs']) {
  const results = []
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      
      if (entry.isDirectory() && !['node_modules', '.next', '.git'].includes(entry.name)) {
        const subResults = await searchDirectory(fullPath, searchTerms, extensions)
        results.push(...subResults)
      } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
        const findings = await searchInFile(fullPath, searchTerms)
        if (findings.length > 0) {
          results.push({
            file: fullPath,
            findings
          })
        }
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
  
  return results
}

async function findHardcodedData() {
  console.log("🔍 Searching for hardcoded test data...")
  console.log("=" .repeat(60))
  
  const searchTerms = [
    "see_2080_science",
    "see_2079_science", 
    "see_2078_science",
    "see_2080_math",
    "see_2080_english",
    "SEE 2080",
    "कम्प्युटर मेमोरीको सबैभन्दा सानो एकाइ", // First question from 2080 test
    "groupAQuestions",
    "groupBQuestions", 
    "groupCQuestions",
    "groupDQuestions",
    "hardcoded",
    "static.*questions",
    "fallback.*questions"
  ]
  
  const results = await searchDirectory(".", searchTerms)
  
  if (results.length === 0) {
    console.log("✅ No hardcoded data found!")
    return
  }
  
  console.log(`🚨 Found ${results.length} files with potential hardcoded data:\n`)
  
  results.forEach(result => {
    console.log(`📄 ${result.file}:`)
    result.findings.forEach(finding => {
      console.log(`   Line ${finding.line}: ${finding.content}`)
      console.log(`   ↳ Contains: "${finding.term}"`)
    })
    console.log()
  })
  
  console.log("=" .repeat(60))
  console.log("💡 Check these files and remove any hardcoded test data!")
  console.log("   The app should only load data from MongoDB.")
}

findHardcodedData()
