// This script helps diagnose MongoDB Compass connection issues
import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/see_exam_system"

async function troubleshootCompass() {
  console.log("🔧 MongoDB Compass Troubleshooting")
  console.log("=" .repeat(50))
  
  // Parse the URI to show connection details
  try {
    const url = new URL(uri)
    console.log("📍 Connection Details:")
    console.log(`   Host: ${url.hostname}`)
    console.log(`   Port: ${url.port}`)
    console.log(`   Database: ${url.pathname.replace('/', '') || 'see_exam_system'}`)
    console.log(`   Full URI: ${uri}`)
  } catch (e) {
    console.log(`   URI: ${uri}`)
  }
  
  const client = new MongoClient(uri)
  try {
    await client.connect()
    console.log("\n✅ Connection successful")
    
    const admin = client.db().admin()
    const serverStatus = await admin.serverStatus()
    console.log(`📊 MongoDB Version: ${serverStatus.version}`)
    console.log(`🏠 Host: ${serverStatus.host}`)
    
    // List all databases
    const databases = await admin.listDatabases()
    console.log("\n📚 All Databases:")
    databases.databases.forEach(db => {
      console.log(`   - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`)
    })
    
    // Check our specific database
    const db = client.db("see_exam_system")
    const collections = await db.collections()
    console.log("\n📁 Collections in 'see_exam_system':")
    
    for (const collection of collections) {
      const count = await collection.countDocuments()
      const stats = await db.collection(collection.collectionName).stats()
      console.log(`   - ${collection.collectionName}: ${count} documents (${(stats.size / 1024).toFixed(2)} KB)`)
    }
    
    console.log("\n" + "=".repeat(50))
    console.log("🔍 MongoDB Compass Connection Guide:")
    console.log("1. Open MongoDB Compass")
    console.log("2. Use this connection string:")
    console.log(`   mongodb://127.0.0.1:27017`)
    console.log("3. Or use these individual settings:")
    console.log("   - Hostname: 127.0.0.1 (or localhost)")
    console.log("   - Port: 27017")
    console.log("   - Authentication: None")
    console.log("4. After connecting, look for database: see_exam_system")
    console.log("5. Collections should be: practice_tests, questions")
    
  } catch (error) {
    console.error("❌ Connection failed:", error.message)
  } finally {
    await client.close()
  }
}

troubleshootCompass()
