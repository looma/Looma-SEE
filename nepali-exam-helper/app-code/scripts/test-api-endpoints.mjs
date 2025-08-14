// Test what the API endpoints actually return
async function testAPIEndpoints() {
  console.log("🧪 TESTING API ENDPOINTS...")
  console.log("=" .repeat(50))
  
  try {
    // Test /api/tests
    console.log("\n📋 Testing /api/tests:")
    const testsResponse = await fetch("http://localhost:3000/api/tests", {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      }
    })
    
    if (testsResponse.ok) {
      const testsData = await testsResponse.json()
      console.log(`Status: ${testsResponse.status}`)
      console.log(`Tests returned: ${testsData.tests?.length || 0}`)
      if (testsData.tests?.length > 0) {
        console.log("🚨 API IS RETURNING DATA FROM SOMEWHERE!")
        testsData.tests.forEach(test => {
          console.log(`  - ${test.id}: ${test.title}`)
        })
      } else {
        console.log("✅ API correctly returns empty array")
      }
    } else {
      console.log(`❌ API failed: ${testsResponse.status}`)
      console.log(await testsResponse.text())
    }
    
    // Test /api/questions/see_2080_science
    console.log("\n❓ Testing /api/questions/see_2080_science:")
    const questionsResponse = await fetch("http://localhost:3000/api/questions/see_2080_science", {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      }
    })
    
    if (questionsResponse.ok) {
      const questionsData = await questionsResponse.json()
      const totalQuestions = 
        (questionsData.questions?.groupA?.length || 0) +
        (questionsData.questions?.groupB?.length || 0) +
        (questionsData.questions?.groupC?.length || 0) +
        (questionsData.questions?.groupD?.length || 0)
      
      console.log(`Status: ${questionsResponse.status}`)
      console.log(`Questions returned: ${totalQuestions}`)
      
      if (totalQuestions > 0) {
        console.log("🚨 API IS RETURNING QUESTIONS FROM SOMEWHERE!")
      } else {
        console.log("✅ API correctly returns empty questions")
      }
    } else {
      console.log(`❌ API failed: ${questionsResponse.status}`)
    }
    
  } catch (error) {
    console.error("❌ Error testing APIs:", error.message)
    console.log("💡 Make sure your dev server is running: npm run dev")
  }
}

testAPIEndpoints()
