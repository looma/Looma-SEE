import { MongoClient, type Db } from "mongodb"

const MONGODB_URI = "mongodb://localhost:47017" // Using YOUR existing port
const MONGODB_DB = "see_exam_system"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  try {
    console.log("Connecting to MongoDB on port 47017...")
    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    console.log("Connected to MongoDB successfully")

    const db = client.db(MONGODB_DB)
    console.log("Selected database:", MONGODB_DB)

    cachedClient = client
    cachedDb = db

    return { client, db }
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw error
  }
}
