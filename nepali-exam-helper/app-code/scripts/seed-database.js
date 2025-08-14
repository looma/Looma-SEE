// Run this script to add sample data to your MongoDB on port 47017
const { MongoClient } = require("mongodb")

const MONGODB_URI = "mongodb://127.0.0.1:47017/see_exam_system"
const MONGODB_DB = "see_exam_system"

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB on port 47017")

    const db = client.db(MONGODB_DB)

    // Clear existing data
    const practiceTestsCollection = db.collection("practice_tests")
    const questionsCollection = db.collection("questions")

    await practiceTestsCollection.deleteMany({})
    await questionsCollection.deleteMany({})

    console.log("✅ Database cleared - ready for fresh data")
    console.log("💡 Use 'node scripts/import-test-json.mjs --file ./data/your-test.json' to add tests")

    console.log("🎉 Database cleared successfully on port 47017!")
  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    await client.close()
  }
}

seedDatabase()
