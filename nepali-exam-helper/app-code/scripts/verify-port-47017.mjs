// Verify connection to your actual MongoDB port
import { MongoClient } from "mongodb"

const uri = "mongodb://127.0.0.1:47017/see_exam_system"

async function verifyConnection() {
  console.log("🔍 Connecting to your actual MongoDB port: 47017")
  console.log("URI:", uri)
  
  const client = new MongoClient(uri)
  try {
    await client.connect()
    console.log("✅ Connected successfully to port 47017!")
    
    const db = client.db("see_exam_system")
    
    // Check practice_tests
    const practiceTests = await db.collection("practice_tests").find({}).toArray()
    console.log(`\n📋 Practice Tests (${practiceTests.length} found):`)
    practiceTests.forEach(test => {
      console.log(`  - ${test._id}: ${test.title}`)
    })
    
    // Check questions
    const questions = await db.collection("questions").find({}).toArray()
    console.log(`\n❓ Question Sets (${questions.length} found):`)
    questions.forEach(set => {
      const counts = {
        A: set.questions?.groupA?.length || 0,
        B: set.questions?.groupB?.length || 0,
        C: set.questions?.groupC?.length || 0,
        D: set.questions?.groupD?.length || 0
      }
      console.log(`  - ${set.testId}: A:${counts.A}, B:${counts.B}, C:${counts.C}, D:${counts.D}`)
    })
    
  } catch (error) {
    console.error("❌ Connection failed:", error.message)
  } finally {
    await client.close()
  }
}

verifyConnection()
