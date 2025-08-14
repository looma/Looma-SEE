// Usage: node scripts/check-database.mjs
// Env: MONGODB_URI (default: mongodb://127.0.0.1:27017/see_exam_system)

import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/see_exam_system"

async function checkDatabase() {
  const client = new MongoClient(uri)
  try {
    console.log("🔍 Connecting to", uri)
    await client.connect()
    
    let dbName = "see_exam_system"
    try {
      const u = new URL(uri)
      dbName = u.pathname.replace("/", "") || "see_exam_system"
    } catch {}
    
    const db = client.db(dbName)
    console.log("📊 Database:", dbName)
    
    // List all collections
    const collections = await db.collections()
    console.log("📁 Collections:", collections.map(c => c.collectionName))
    
    // Check practice_tests
    const practiceTests = db.collection("practice_tests")
    const testCount = await practiceTests.countDocuments()
    console.log(`\n📋 Practice Tests (${testCount} total):`)
    
    const tests = await practiceTests.find({}).toArray()
    tests.forEach(test => {
      console.log(`  - ${test._id}: ${test.title}`)
      console.log(`    Subject: ${test.subject}, Year: ${test.year}, Marks: ${test.totalMarks}`)
    })
    
    // Check questions
    const questions = db.collection("questions")
    const questionCount = await questions.countDocuments()
    console.log(`\n❓ Question Sets (${questionCount} total):`)
    
    const questionSets = await questions.find({}).toArray()
    questionSets.forEach(set => {
      const groupCounts = {
        A: set.questions?.groupA?.length || 0,
        B: set.questions?.groupB?.length || 0,
        C: set.questions?.groupC?.length || 0,
        D: set.questions?.groupD?.length || 0
      }
      console.log(`  - ${set.testId}:`)
      console.log(`    Group A: ${groupCounts.A}, B: ${groupCounts.B}, C: ${groupCounts.C}, D: ${groupCounts.D}`)
    })
    
    console.log("\n✅ Database check complete")
    
  } catch (error) {
    console.error("❌ Database error:", error)
  } finally {
    await client.close()
  }
}

checkDatabase()
