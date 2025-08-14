// Verify that your database is actually empty
import { MongoClient } from "mongodb"

const uri = "mongodb://127.0.0.1:47017/see_exam_system"

async function verifyDatabaseEmpty() {
  console.log("🔍 Checking if database is actually empty...")
  
  const client = new MongoClient(uri)
  try {
    await client.connect()
    console.log("✅ Connected to MongoDB on port 47017")
    
    const db = client.db("see_exam_system")
    
    // Check practice_tests collection
    const practiceTests = await db.collection("practice_tests").find({}).toArray()
    console.log(`📋 Practice tests in database: ${practiceTests.length}`)
    practiceTests.forEach(test => {
      console.log(`  - ${test._id}: ${test.title}`)
    })
    
    // Check questions collection
    const questions = await db.collection("questions").find({}).toArray()
    console.log(`❓ Question sets in database: ${questions.length}`)
    questions.forEach(q => {
      console.log(`  - ${q.testId}`)
    })
    
    if (practiceTests.length === 0 && questions.length === 0) {
      console.log("✅ Database is confirmed EMPTY")
    } else {
      console.log("❌ Database is NOT empty - this explains why API returns data!")
    }
    
  } catch (error) {
    console.error("❌ Database error:", error.message)
  } finally {
    await client.close()
  }
}

verifyDatabaseEmpty()
