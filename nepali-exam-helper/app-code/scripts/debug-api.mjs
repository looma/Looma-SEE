// Debug what the APIs are actually returning
async function debugAPIs() {
  console.log("🔍 Debugging API responses...")
  
  try {
    // Check /api/tests
    console.log("\n📋 Testing /api/tests:")
    const testsResponse = await fetch("http://localhost:3000/api/tests")
    if (testsResponse.ok) {
      const testsData = await testsResponse.json()
      console.log("Response:", JSON.stringify(testsData, null, 2))
    } else {
      console.log("❌ Failed:", testsResponse.status, await testsResponse.text())
    }
    
    // Check /api/questions/see_2080_science
    console.log("\n❓ Testing /api/questions/see_2080_science:")
    const questionsResponse = await fetch("http://localhost:3000/api/questions/see_2080_science")
    if (questionsResponse.ok) {
      const questionsData = await questionsResponse.json()
      console.log("Response:", JSON.stringify(questionsData, null, 2))
    } else {
      console.log("❌ Failed:", questionsResponse.status, await questionsResponse.text())
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message)
    console.log("💡 Make sure your dev server is running: npm run dev")
  }
}

debugAPIs()
