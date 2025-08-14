// Centralized config - only environment variables, no fallbacks
export const config = {
  mongodbUri: process.env.MONGODB_URI,
  openaiApiKey: process.env.OPENAI_API_KEY, // No fallback - must be in .env.local
}

// Debug function to check environment loading
export function debugEnvironment() {
  console.log("🔍 Environment Debug:")
  console.log("  NODE_ENV:", process.env.NODE_ENV)
  console.log("  MONGODB_URI:", process.env.MONGODB_URI ? "✅ SET" : "❌ MISSING")
  console.log("  OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "✅ SET" : "❌ MISSING")

  if (!process.env.OPENAI_API_KEY) {
    console.log("  ⚠️  Add OPENAI_API_KEY to your .env.local file!")
  }
}
