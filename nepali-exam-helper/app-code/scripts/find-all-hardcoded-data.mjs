// This will find EVERY instance of hardcoded test data
import fs from "node:fs/promises"
import path from "node:path"

async function searchInFile(filePath, searchTerms) {
  try {
    const content = await fs.readFile(filePath, "utf8")
    const findings = []
    
    searchTerms.forEach(term => {
      const regex = new RegExp(term, 'gi')
      const matches = content.match(regex)
      if (matches) {
        const lines = content.split('\n')
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            findings.push({
              term,
              line: index + 1,
              content: line.trim(),
              file: filePath
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
      
      if (entry.isDirectory() && !['node_modules', '.next', '.git', 'data'].includes(entry.name)) {
        const subResults = await searchDirectory(fullPath, searchTerms, extensions)
        results.push(...subResults)
      } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
        const findings = await searchInFile(fullPath, searchTerms)
        results.push(...findings)
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
  
  return results
}

async function findAllHardcodedData() {
  console.log("🔍 HUNTING DOWN ALL HARDCODED TEST DATA...")
  console.log("=" .repeat(60))
  
  const searchTerms = [
    "see_2080_science",
    "see_2079_science", 
    "see_2078_science",
    "see_2080_math",
    "see_2080_english",
    "SEE 2080",
    "SEE २०८०",
    "कम्प्युटर मेमोरीको सबैभन्दा सानो एकाइ",
    "groupAQuestions",
    "groupBQuestions", 
    "groupCQuestions",
    "groupDQuestions",
    "practice.*test.*data",
    "hardcoded",
    "placeholder.*test",
    "fallback.*test",
    "static.*question",
    "default.*question",
    "sample.*question",
    "mock.*test",
    "dummy.*test"
  ]
  
  const results = await searchDirectory(".", searchTerms)
  
  if (results.length === 0) {
    console.log("✅ No hardcoded data found!")
    return
  }
  
  console.log(`🚨 FOUND ${results.length} INSTANCES OF HARDCODED DATA:\n`)
  
  // Group by file
  const byFile = {}
  results.forEach(result => {
    if (!byFile[result.file]) byFile[result.file] = []
    byFile[result.file].push(result)
  })
  
  Object.entries(byFile).forEach(([file, findings]) => {
    console.log(`📄 ${file}:`)
    findings.forEach(finding => {
      console.log(`   Line ${finding.line}: ${finding.content}`)
      console.log(`   ↳ Contains: "${finding.term}"`)
    })
    console.log()
  })
  
  console.log("=" .repeat(60))
  console.log("🔥 DELETE ALL OF THESE HARDCODED REFERENCES!")
}

findAllHardcodedData()
