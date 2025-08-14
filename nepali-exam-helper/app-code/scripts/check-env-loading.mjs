// Script to test if .env.local is being loaded (Windows compatible)
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync, readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

console.log("🔍 Environment Loading Test (Windows)")
console.log("=" .repeat(50))

// Check if .env.local exists
const envLocalPath = join(projectRoot, '.env.local')
console.log(`📁 Project root: ${projectRoot}`)
console.log(`📄 .env.local path: ${envLocalPath}`)
console.log(`📄 .env.local exists: ${existsSync(envLocalPath) ? '✅ YES' : '❌ NO'}`)

if (existsSync(envLocalPath)) {
  // Show the actual file content
  try {
    const content = readFileSync(envLocalPath, 'utf8')
    console.log("\n📄 .env.local content:")
    console.log("---")
    console.log(content)
    console.log("---")
    
    // Check for common issues
    const lines = content.split('\n')
    let hasOpenAI = false
    let hasMongoDB = false
    
    lines.forEach((line, index) => {
      const trimmed = line.trim()
      if (trimmed.startsWith('OPENAI_API_KEY=')) {
        hasOpenAI = true
        const hasSpaces = line.includes(' = ') || line.startsWith(' ') || line.endsWith(' ')
        console.log(`Line ${index + 1} (OPENAI): ${hasSpaces ? '⚠️  HAS SPACES' : '✅ LOOKS GOOD'}`)
        console.log(`  Key length: ${trimmed.split('=')[1]?.length || 0} characters`)
      }
      if (trimmed.startsWith('MONGODB_URI=')) {
        hasMongoDB = true
        console.log(`Line ${index + 1} (MONGODB): ✅ FOUND`)
      }
    })
    
    console.log(`\n📊 Summary:`)
    console.log(`  OPENAI_API_KEY found: ${hasOpenAI ? '✅' : '❌'}`)
    console.log(`  MONGODB_URI found: ${hasMongoDB ? '✅' : '❌'}`)
    
  } catch (error) {
    console.log(`❌ Error reading file: ${error.message}`)
  }
} else {
  console.log("❌ .env.local file not found!")
}

console.log("\n🧪 Next steps:")
console.log("1. Run: npm run dev")
console.log("2. Visit: http://localhost:3000/api/env-test")
console.log("3. Visit: http://localhost:3000/debug")
console.log("4. Test AI grading and check console output")
