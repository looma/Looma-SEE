// Export data in a format that's easy to import into Compass
import { MongoClient } from "mongodb"
import fs from "node:fs/promises"

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/see_exam_system"

async function exportForCompass() {
  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db("see_exam_system")
    
    // Export practice_tests
    const practiceTests = await db.collection("practice_tests").find({}).toArray()
    await fs.writeFile("practice_tests_export.json", JSON.stringify(practiceTests, null, 2))
    console.log("✅ Exported practice_tests to practice_tests_export.json")
    
    // Export questions
    const questions = await db.collection("questions").find({}).toArray()
    await fs.writeFile("questions_export.json", JSON.stringify(questions, null, 2))
    console.log("✅ Exported questions to questions_export.json")
    
    console.log("\n📋 Summary:")
    console.log(`   Practice Tests: ${practiceTests.length} documents`)
    console.log(`   Question Sets: ${questions.length} documents`)
    
    console.log("\n💡 You can now:")
    console.log("1. Open these JSON files to verify the data")
    console.log("2. Import them directly into MongoDB Compass if needed")
    
  } catch (error) {
    console.error("❌ Export failed:", error)
  } finally {
    await client.close()
  }
}

exportForCompass()
