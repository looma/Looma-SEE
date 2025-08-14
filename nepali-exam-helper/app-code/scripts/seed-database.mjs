import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:47017/see_exam_system"

async function seed() {
  const client = new MongoClient(MONGODB_URI)
  try {
    console.log("Connecting to", MONGODB_URI)
    await client.connect()
    const dbName = (() => {
      try {
        return new URL(MONGODB_URI).pathname.replace("/", "") || "see_exam_system"
      } catch {
        return "see_exam_system"
      }
    })()
    const db = client.db(dbName)

    const practiceTests = db.collection("practice_tests")
    const questions = db.collection("questions")

    await practiceTests.deleteMany({})
    await questions.deleteMany({})

    console.log("✅ Database cleared - ready for fresh data")
    console.log("💡 Use 'node scripts/import-test-json.mjs --file ./data/your-test.json' to add tests")
  } catch (e) {
    console.error("❌ Error:", e)
    process.exitCode = 1
  } finally {
    await client.close()
  }
}

seed()
