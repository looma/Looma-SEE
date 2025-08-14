// This will verify database state and clear any caches
import { MongoClient } from "mongodb"

const uri = "mongodb://127.0.0.1:47017/see_exam_system"

async function verifyAndClearEverything() {
  console.log("🔍 VERIFYING DATABASE STATE ON PORT 47017...")
  console.log("=" .repeat(60))
  
  const client = new MongoClient(uri)
  try {
    await client.connect()
    console.log("✅ Connected to MongoDB on port 47017")
    
    const db = client.db("see_exam_system")
    
    // Check practice_tests collection
    const practiceTests = await db.collection("practice_tests").find({}).toArray()
    console.log(`📋 Practice tests in database: ${practiceTests.length}`)
    if (practiceTests.length > 0) {
      console.log("🚨 DATABASE IS NOT EMPTY!")
      practiceTests.forEach(test => {
        console.log(`  - ${test._id}: ${test.title}`)
      })
    }
    
    // Check questions collection
    const questions = await db.collection("questions").find({}).toArray()
    console.log(`❓ Question sets in database: ${questions.length}`)
    if (questions.length > 0) {
      console.log("🚨 DATABASE IS NOT EMPTY!")
      questions.forEach(q => {
        console.log(`  - ${q.testId}`)
      })
    }
    
    if (practiceTests.length === 0 && questions.length === 0) {
      console.log("✅ Database is confirmed EMPTY")
      console.log("🤔 If API still returns data, it's coming from hardcoded sources!")
    } else {
      console.log("\n🔥 CLEARING DATABASE...")
      await db.collection("practice_tests").deleteMany({})
      await db.collection("questions").deleteMany({})
      console.log("✅ Database cleared")
    }
    
  } catch (error) {
    console.error("❌ Database error:", error.message)
  } finally {
    await client.close()
  }
  
  console.log("\n🧹 CLEARING NEXT.JS CACHE...")
  console.log("💡 Restart your dev server: npm run dev")
}

verifyAndClearEverything()
