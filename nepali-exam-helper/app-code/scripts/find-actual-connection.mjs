// This will show you exactly where your data is stored
import { MongoClient } from "mongodb"

async function findActualConnection() {
  console.log("🔍 Finding where your data is actually stored...")
  
  // Check the URI your app is using
  const appUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:47017/see_exam_system"
  console.log("📱 App is configured to use:", appUri)
  
  // Test multiple possible locations
  const possibleUris = [
    "mongodb://127.0.0.1:27017/see_exam_system",  // Default MongoDB port
    "mongodb://127.0.0.1:47017/see_exam_system",  // Your custom port
    "mongodb://localhost:27017/see_exam_system",
    "mongodb://localhost:47017/see_exam_system"
  ]
  
  for (const uri of possibleUris) {
    try {
      console.log(`\n🔍 Checking: ${uri}`)
      const client = new MongoClient(uri)
      await client.connect()
      
      const db = client.db("see_exam_system")
      const practiceTests = await db.collection("practice_tests").find({}).toArray()
      const questions = await db.collection("questions").find({}).toArray()
      
      if (practiceTests.length > 0 || questions.length > 0) {
        console.log(`✅ FOUND DATA HERE: ${uri}`)
        console.log(`   Practice Tests: ${practiceTests.length}`)
        console.log(`   Question Sets: ${questions.length}`)
        
        practiceTests.forEach(test => {
          console.log(`   - ${test._id}: ${test.title}`)
        })
      } else {
        console.log(`   ❌ No data found`)
      }
      
      await client.close()
    } catch (error) {
      console.log(`   ❌ Connection failed: ${error.message}`)
    }
  }
  
  console.log("\n" + "=".repeat(60))
  console.log("💡 MongoDB Compass Connection Instructions:")
  console.log("1. Open MongoDB Compass")
  console.log("2. Try these connection strings one by one:")
  possibleUris.forEach(uri => {
    console.log(`   - ${uri.replace('/see_exam_system', '')}`)
  })
  console.log("3. Look for database: see_exam_system")
  console.log("4. Check collections: practice_tests, questions")
}

findActualConnection()
