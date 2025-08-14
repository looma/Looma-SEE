// Quick verification that database is empty and API returns empty
import { MongoClient } from "mongodb"

const uri = "mongodb://127.0.0.1:47017/see_exam_system"

async function verify() {
  console.log("🔍 Verifying no hardcoded data...")
  
  // Check database
  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db("see_exam_system")
    
    const testCount = await db.collection("practice_tests").countDocuments()
    const questionCount = await db.collection("questions").countDocuments()
    
    console.log(`📊 Database: ${testCount} tests, ${questionCount} question sets`)
    
    if (testCount === 0 && questionCount === 0) {
      console.log("✅ Database is empty")
    } else {
      console.log("❌ Database still has data")
    }
    
  } catch (error) {
    console.log("❌ Database error:", error.message)
  } finally {
    await client.close()
  }
  
  // Check API
  try {
    const response = await fetch("http://localhost:3000/api/tests")
    if (response.ok) {
      const data = await response.json()
      console.log(`🌐 API returns: ${data.tests?.length || 0} tests`)
      
      if (data.tests?.length === 0) {
        console.log("✅ API correctly returns empty array")
      } else {
        console.log("❌ API still returning hardcoded data!")
        data.tests.forEach(test => console.log(`  - ${test.id}`))
      }
    }
  } catch (error) {
    console.log("❌ API test failed - make sure dev server is running")
  }
}

verify()
