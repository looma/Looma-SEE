// Script to fix .env.local encoding issues on Windows
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')
const envPath = join(projectRoot, '.env.local')

console.log("🔧 Fixing .env.local file encoding...")

// Create a clean .env.local file with proper encoding
const envContent = `# MongoDB Configuration
MONGODB_URI=mongodb://127.0.0.1:47017/see_exam_system

# OpenAI API Key - Make sure there are NO SPACES around the = sign
OPENAI_API_KEY=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
`

try {
  // Write with explicit UTF-8 encoding and Unix line endings
  writeFileSync(envPath, envContent, { encoding: 'utf8' })
  console.log("✅ Created clean .env.local file")
  console.log("📄 File location:", envPath)
  console.log("\n📄 Content:")
  console.log("---")
  console.log(envContent)
  console.log("---")
  
  console.log("\n🎉 Fixed! Now run:")
  console.log("1. npm run dev")
  console.log("2. Visit http://localhost:3000/api/env-test")
  
} catch (error) {
  console.error("❌ Error creating file:", error.message)
}
