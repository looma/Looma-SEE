// Check what's on both ports to understand what happened
import { MongoClient } from "mongodb"

async function checkPort(port) {
  const uri = `mongodb://127.0.0.1:${port}/see_exam_system`
  const client = new MongoClient(uri)
  
  try {
    console.log(`\n🔍 Checking port ${port}...`)
    await client.connect()
    
    const db = client.db("see_exam_system")
    const practiceTests = await db.collection("practice_tests").find({}).toArray()
    const questions = await db.collection("questions").find({}).toArray()
    
    console.log(`📋 Practice Tests on port ${port} (${practiceTests.length} found):`)
    practiceTests.forEach(test => {
      console.log(`  - ${test._id}: ${test.title}`)
    })
    
    console.log(`❓ Question Sets on port ${port} (${questions.length} found):`)
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
    console.log(`❌ Port ${port} not accessible: ${error.message}`)
  } finally {
    await client.close()
  }
}

async function checkBothPorts() {
  console.log("🔍 Checking both MongoDB ports to see where your data went...")
  await checkPort(27017)  // Default port
  await checkPort(47017)  // Your actual port
  
  console.log("\n💡 If you see the SEE 2081 test on port 27017 but not 47017,")
  console.log("   that explains why it disappeared when we switched ports.")
}

checkBothPorts()
