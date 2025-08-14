// Check what the APIs are actually returning vs what's in database
async function checkAPIResponses() {
  console.log("🔍 Checking API responses vs database...")
  
  // First check database
  console.log("\n📊 Database content:")
  try {
    const { MongoClient } = await import("mongodb")
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/see_exam_system"
    const client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db("see_exam_system")
    const tests = await db.collection("practice_tests").find({}).toArray()
    const questions = await db.collection("questions").find({}).toArray()
    
    console.log(`   Practice tests in DB: ${tests.length}`)
    tests.forEach(test => console.log(`   - ${test._id}: ${test.title}`))
    
    console.log(`   Question sets in DB: ${questions.length}`)
    questions.forEach(q => console.log(`   - ${q.testId}`))
    
    await client.close()
  } catch (error) {
    console.log(`   ❌ Database error: ${error.message}`)
  }
  
  // Then check API
  console.log("\n🌐 API responses:")
  try {
    const testsResponse = await fetch("http://localhost:3000/api/tests")
    if (testsResponse.ok) {
      const testsData = await testsResponse.json()
      console.log(`   /api/tests returned: ${testsData.tests?.length || 0} tests`)
      testsData.tests?.forEach(test => {
        console.log(`   - ${test.id}: ${test.title}`)
      })
    } else {
      console.log(`   ❌ /api/tests failed: ${testsResponse.status}`)
    }
    
    // Check specific test
    const questionsResponse = await fetch("http://localhost:3000/api/questions/see_2080_science")
    if (questionsResponse.ok) {
      const questionsData = await questionsResponse.json()
      const totalQuestions = 
        (questionsData.questions?.groupA?.length || 0) +
        (questionsData.questions?.groupB?.length || 0) +
        (questionsData.questions?.groupC?.length || 0) +
        (questionsData.questions?.groupD?.length || 0)
      console.log(`   /api/questions/see_2080_science returned: ${totalQuestions} questions`)
    } else {
      console.log(`   ❌ /api/questions/see_2080_science failed: ${questionsResponse.status}`)
    }
    
  } catch (error) {
    console.log(`   ❌ API error: ${error.message}`)
    console.log("   💡 Make sure dev server is running: npm run dev")
  }
}

checkAPIResponses()
