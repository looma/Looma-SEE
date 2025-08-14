import { MongoClient, type Db } from "mongodb"
import { config } from "./config"

// Use config-based URI with fallback to environment
const MONGODB_URI = process.env.MONGODB_URI || config.mongodbUri

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  try {
    console.log("🔗 Connecting to MongoDB:", MONGODB_URI)

    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    console.log("✅ Connected to MongoDB")

    const db = client.db("see_exam_system")
    console.log("📊 Using database: see_exam_system")

    cachedClient = client
    cachedDb = db

    return { client, db }
  } catch (error) {
    console.error("❌ MongoDB connection error:", error)
    throw error
  }
}
