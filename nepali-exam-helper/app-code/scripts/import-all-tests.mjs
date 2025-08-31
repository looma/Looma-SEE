// Universal script to sync ALL test JSON files from data/ folder with database
// Usage: node scripts/import-all-tests.mjs
// This script will: ADD new tests, UPDATE existing tests, REMOVE tests not in data folder
// Env: MONGODB_URI (default: mongodb://127.0.0.1:47017/see_exam_system)

import { MongoClient } from "mongodb"
import fs from "node:fs/promises"
import path from "node:path"

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:47017/see_exam_system"

function normalizeExtendedJSON(value) {
  if (Array.isArray(value)) return value.map(normalizeExtendedJSON)
  if (value && typeof value === "object") {
    if (Object.keys(value).length === 1 && "$date" in value) {
      const d = value["$date"]
      return new Date(d)
    }
    if (Object.keys(value).length === 1 && "$oid" in value) {
      return String(value["$oid"])
    }
    const obj = {}
    for (const [k, v] of Object.entries(value)) obj[k] = normalizeExtendedJSON(v)
    return obj
  }
  return value
}

async function processTestFile(filePath) {
  try {
    console.log(`📄 Processing: ${path.basename(filePath)}`)
    
    const raw = await fs.readFile(filePath, "utf8")
    
    // Try to parse JSON with better error reporting
    let input
    try {
      input = JSON.parse(raw)
    } catch (parseError) {
      console.error(`   ❌ JSON Parse Error in ${path.basename(filePath)}:`)
      console.error(`   📍 ${parseError.message}`)
      
      // Try to give more helpful context
      const lines = raw.split('\n')
      const errorMatch = parseError.message.match(/position (\d+)/)
      if (errorMatch) {
        const position = parseInt(errorMatch[1])
        let currentPos = 0
        let lineNum = 1
        
        for (const line of lines) {
          if (currentPos + line.length >= position) {
            const colNum = position - currentPos + 1
            console.error(`   📍 Around line ${lineNum}, column ${colNum}:`)
            console.error(`   📝 "${line.trim()}"`)
            break
          }
          currentPos += line.length + 1 // +1 for newline
          lineNum++
        }
      }
      
      console.error(`   💡 Common fixes:`)
      console.error(`      - Check for missing commas between array elements`)
      console.error(`      - Check for missing commas between object properties`)
      console.error(`      - Check for trailing commas before closing brackets`)
      console.error(`      - Validate JSON syntax at jsonlint.com`)
      return null
    }
    
    if (!Array.isArray(input)) {
      console.warn(`   ⚠️  Skipping ${path.basename(filePath)} - not an array`)
      return null
    }

    const docs = input.map(normalizeExtendedJSON)
    const practiceDoc = docs.find((d) => d.title && d.subject && typeof d._id === "string")
    const questionsDoc = docs.find((d) => (d.testId && d.questions) || (d.testId && Array.isArray(d.questions)))

    if (!practiceDoc) {
      console.warn(`   ⚠️  Skipping ${path.basename(filePath)} - missing practice_tests document with string _id`)
      return null
    }

    const testId = practiceDoc._id

    if (!questionsDoc) {
      console.warn(`   ⚠️  Skipping ${path.basename(filePath)} - missing questions document`)
      return null
    }

    if (questionsDoc.testId !== testId) {
      console.warn(`   🔧 Normalizing testId: ${questionsDoc.testId} → ${testId}`)
      questionsDoc.testId = testId
    }

    // Clean up questionsDoc
    if ("_id" in questionsDoc && typeof questionsDoc._id !== "string") {
      delete questionsDoc._id
    }

    // Handle both English and Science test formats
    let questionCount = 0
    let testType = "unknown"
    
    if (questionsDoc.questions) {
      if (Array.isArray(questionsDoc.questions)) {
        // English format - array of questions
        questionCount = questionsDoc.questions.length
        testType = "english"
        
        // Transform to our expected format
        questionsDoc.questions = { 
          englishQuestions: questionsDoc.questions 
        }
        
        console.log(`   📚 English test detected with ${questionCount} questions`)
      } else if (questionsDoc.questions.groupA || questionsDoc.questions.groupB || questionsDoc.questions.groupC || questionsDoc.questions.groupD) {
        // Science format - grouped questions
        testType = "science"
        questionCount = 
          (questionsDoc.questions.groupA?.length || 0) +
          (questionsDoc.questions.groupB?.length || 0) +
          (questionsDoc.questions.groupC?.length || 0) +
          (questionsDoc.questions.groupD?.length || 0)
        
        console.log(`   🧪 Science test detected with ${questionCount} questions`)
      } else if (questionsDoc.questions.englishQuestions) {
        // Already in correct English format
        testType = "english"
        questionCount = questionsDoc.questions.englishQuestions.length
        
        console.log(`   📚 English test (pre-formatted) with ${questionCount} questions`)
      } else {
        console.warn(`   ⚠️  Unknown question format in ${path.basename(filePath)}`)
        console.warn(`   🔍 Available keys:`, Object.keys(questionsDoc.questions))
      }
    }

    console.log(`   📊 Found ${questionCount} questions (${testType} test, subject: ${practiceDoc.subject})`)

    return { practiceDoc, questionsDoc, testId, fileName: path.basename(filePath), testType }
  } catch (error) {
    console.error(`   ❌ Error processing ${path.basename(filePath)}:`, error.message)
    if (error.stack) {
      console.error(`   🔍 Stack trace:`, error.stack.split('\n')[1]?.trim())
    }
    return null
  }
}

async function importAllTests() {
  console.log("🚀 Syncing database with data/ folder")
  console.log("   • Adding new tests")
  console.log("   • Updating existing tests") 
  console.log("   • Removing tests not in data folder")
  console.log("=" .repeat(50))
  
  // Check if data folder exists
  try {
    await fs.access("data")
  } catch {
    console.log("📁 Creating data/ folder...")
    await fs.mkdir("data", { recursive: true })
    console.log("   ℹ️  No JSON files found. Add your test files to data/ folder.")
    console.log("   💡 You can add multiple files like:")
    console.log("      - see-2081-english-test1.json")
    console.log("      - see-2081-english-test2.json") 
    console.log("      - see-2080-science-test1.json")
    console.log("      - etc...")
    return
  }

  // Get all JSON files from data folder
  const files = await fs.readdir("data")
  const jsonFiles = files.filter(f => f.endsWith('.json'))
  
  if (jsonFiles.length === 0) {
    console.log("   ℹ️  No JSON files found in data/ folder.")
    console.log("   💡 Add your test JSON files to the data/ folder and run this script again.")
    return
  }

  console.log(`📋 Found ${jsonFiles.length} JSON files:`)
  jsonFiles.forEach(f => console.log(`   - ${f}`))
  console.log()

  // Process all files
  const processedTests = []
  const failedFiles = []
  
  for (const file of jsonFiles) {
    const filePath = path.join("data", file)
    const result = await processTestFile(filePath)
    if (result) {
      processedTests.push(result)
    } else {
      failedFiles.push(file)
    }
  }

  if (failedFiles.length > 0) {
    console.log(`\n⚠️  Failed to process ${failedFiles.length} files:`)
    failedFiles.forEach(f => console.log(`   - ${f}`))
    console.log(`\n💡 Please fix the JSON syntax errors in these files and try again.`)
  }

  if (processedTests.length === 0) {
    console.log("❌ No valid test files found to import.")
    return
  }

  console.log(`\n💾 Syncing ${processedTests.length} tests to database...`)
  console.log("Connecting to:", uri)

  const client = new MongoClient(uri)
  try {
    await client.connect()
    
    let dbName = "see_exam_system"
    try {
      const u = new URL(uri)
      dbName = u.pathname.replace("/", "") || "see_exam_system"
    } catch {}
    
    const db = client.db(dbName)
    const practiceTests = db.collection("practice_tests")
    const questions = db.collection("questions")

    // Get all existing tests from database
    const existingTests = await practiceTests.find({}).toArray()
    const existingTestIds = new Set(existingTests.map(t => t._id))
    
    // Get test IDs from data folder
    const dataFolderTestIds = new Set(processedTests.map(t => t.testId))
    
    // Find tests to remove (in database but not in data folder)
    const testsToRemove = existingTests.filter(t => !dataFolderTestIds.has(t._id))
    
    console.log(`\n📊 Database Analysis:`)
    console.log(`   Existing tests in database: ${existingTests.length}`)
    console.log(`   Tests in data folder: ${processedTests.length}`)
    console.log(`   Tests to remove: ${testsToRemove.length}`)
    
    if (testsToRemove.length > 0) {
      console.log(`\n🗑️  Removing ${testsToRemove.length} tests no longer in data folder:`)
      for (const test of testsToRemove) {
        console.log(`   - ${test._id} (${test.subject}: ${test.title})`)
      }
    }

    let importedCount = 0
    let updatedCount = 0
    let removedCount = 0

    // Remove tests not in data folder
    if (testsToRemove.length > 0) {
      const testIdsToRemove = testsToRemove.map(t => t._id)
      
      // Remove from practice_tests collection
      const practiceDeleteResult = await practiceTests.deleteMany({ 
        _id: { $in: testIdsToRemove } 
      })
      
      // Remove from questions collection
      const questionsDeleteResult = await questions.deleteMany({ 
        testId: { $in: testIdsToRemove } 
      })
      
      removedCount = practiceDeleteResult.deletedCount
      console.log(`   ✅ Removed ${removedCount} practice tests`)
      console.log(`   ✅ Removed ${questionsDeleteResult.deletedCount} question sets`)
    }

    // Import/update tests from data folder
    console.log(`\n📥 Processing tests from data folder:`)
    for (const { practiceDoc, questionsDoc, testId, fileName, testType } of processedTests) {
      try {
        // Check if test already exists (after removals)
        const existingTest = await practiceTests.findOne({ _id: testId })
        const isUpdate = !!existingTest

        // Upsert practice test
        const { _id: practiceId, createdAt, updatedAt, ...practiceRest } = practiceDoc
        await practiceTests.updateOne(
          { _id: practiceId },
          {
            $set: { ...practiceRest, updatedAt: new Date() },
            $setOnInsert: { createdAt: createdAt instanceof Date ? createdAt : new Date() },
          },
          { upsert: true }
        )

        // Upsert questions
        await questions.updateOne(
          { testId },
          { $set: { testId, questions: questionsDoc.questions } },
          { upsert: true }
        )

        if (isUpdate) {
          console.log(`   🔄 Updated: ${testId} (${testType} test from ${fileName})`)
          updatedCount++
        } else {
          console.log(`   ✅ Imported: ${testId} (${testType} test from ${fileName})`)
          importedCount++
        }
      } catch (error) {
        console.error(`   ❌ Failed to import ${testId}:`, error.message)
      }
    }

    console.log("\n" + "=".repeat(50))
    console.log("📊 Sync Summary:")
    console.log(`   New tests imported: ${importedCount}`)
    console.log(`   Existing tests updated: ${updatedCount}`)
    console.log(`   Tests removed: ${removedCount}`)
    console.log(`   Total processed: ${importedCount + updatedCount}`)
    console.log(`   Failed files: ${failedFiles.length}`)

    // Show final database state by subject
    const finalTests = await practiceTests.find({}).toArray()
    const testsBySubject = finalTests.reduce((acc, test) => {
      acc[test.subject] = (acc[test.subject] || 0) + 1
      return acc
    }, {})

    console.log(`\n📈 Final Database Status:`)
    console.log(`   Total practice tests: ${finalTests.length}`)
    Object.entries(testsBySubject).forEach(([subject, count]) => {
      console.log(`   - ${subject}: ${count} tests`)
    })

    const totalQuestions = await questions.countDocuments()
    console.log(`   Total question sets: ${totalQuestions}`)

    console.log("\n🎉 Database sync completed!")
    console.log("💡 Next steps:")
    console.log("   - Run 'npm run dev' to test in the app")
    console.log("   - Visit http://localhost:3000/api/tests to see all tests")
    
    if (failedFiles.length > 0) {
      console.log("   - Fix JSON syntax errors in failed files and re-run sync")
    } else {
      console.log("   - Add more JSON files to data/ and run this script again")
    }

    if (removedCount > 0) {
      console.log(`\n⚠️  Note: ${removedCount} tests were removed from the database`)
      console.log("   If you need them back, add their JSON files to the data/ folder")
    }

  } catch (error) {
    console.error("❌ Database error:", error)
  } finally {
    await client.close()
  }
}

importAllTests().catch((e) => {
  console.error("❌ Sync failed:", e)
  process.exit(1)
})
