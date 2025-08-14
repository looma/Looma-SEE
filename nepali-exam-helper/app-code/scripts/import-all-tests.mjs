// Universal script to import ALL test JSON files from data/ folder
// Usage: node scripts/import-all-tests.mjs
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
    const input = JSON.parse(raw)
    
    if (!Array.isArray(input)) {
      console.warn(`   ⚠️  Skipping ${path.basename(filePath)} - not an array`)
      return null
    }

    const docs = input.map(normalizeExtendedJSON)
    const practiceDoc = docs.find((d) => d.title && d.subject && typeof d._id === "string")
    const questionsDoc = docs.find((d) => d.testId && d.questions)

    if (!practiceDoc) {
      console.warn(`   ⚠️  Skipping ${path.basename(filePath)} - missing practice_tests document`)
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

    return { practiceDoc, questionsDoc, testId, fileName: path.basename(filePath) }
  } catch (error) {
    console.error(`   ❌ Error processing ${path.basename(filePath)}:`, error.message)
    return null
  }
}

async function importAllTests() {
  console.log("🚀 Importing ALL tests from data/ folder")
  console.log("=" .repeat(50))
  
  // Check if data folder exists
  try {
    await fs.access("data")
  } catch {
    console.log("📁 Creating data/ folder...")
    await fs.mkdir("data", { recursive: true })
    console.log("   ℹ️  No JSON files found. Add your test files to data/ folder.")
    return
  }

  // Get all JSON files from data folder
  const files = await fs.readdir("data")
  const jsonFiles = files.filter(f => f.endsWith('.json'))
  
  if (jsonFiles.length === 0) {
    console.log("   ℹ️  No JSON files found in data/ folder.")
    return
  }

  console.log(`📋 Found ${jsonFiles.length} JSON files:`)
  jsonFiles.forEach(f => console.log(`   - ${f}`))
  console.log()

  // Process all files
  const processedTests = []
  for (const file of jsonFiles) {
    const filePath = path.join("data", file)
    const result = await processTestFile(filePath)
    if (result) {
      processedTests.push(result)
    }
  }

  if (processedTests.length === 0) {
    console.log("❌ No valid test files found to import.")
    return
  }

  console.log(`\n💾 Importing ${processedTests.length} tests to database...`)
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

    let importedCount = 0
    let updatedCount = 0

    for (const { practiceDoc, questionsDoc, testId, fileName } of processedTests) {
      try {
        // Check if test already exists
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
          console.log(`   🔄 Updated: ${testId} (from ${fileName})`)
          updatedCount++
        } else {
          console.log(`   ✅ Imported: ${testId} (from ${fileName})`)
          importedCount++
        }
      } catch (error) {
        console.error(`   ❌ Failed to import ${testId}:`, error.message)
      }
    }

    console.log("\n" + "=".repeat(50))
    console.log("📊 Import Summary:")
    console.log(`   New tests imported: ${importedCount}`)
    console.log(`   Existing tests updated: ${updatedCount}`)
    console.log(`   Total processed: ${importedCount + updatedCount}`)

    // Show final database state
    const totalTests = await practiceTests.countDocuments()
    const totalQuestions = await questions.countDocuments()
    console.log(`\n📈 Database Status:`)
    console.log(`   Total practice tests: ${totalTests}`)
    console.log(`   Total question sets: ${totalQuestions}`)

    console.log("\n🎉 All tests imported successfully!")
    console.log("💡 You can now:")
    console.log("   - Run 'npm run dev' to test in the app")
    console.log("   - Visit http://localhost:3000/api/tests to see all tests")
    console.log("   - Add more JSON files to data/ and run this script again")

  } catch (error) {
    console.error("❌ Database error:", error)
  } finally {
    await client.close()
  }
}

importAllTests().catch((e) => {
  console.error("❌ Import failed:", e)
  process.exit(1)
})
