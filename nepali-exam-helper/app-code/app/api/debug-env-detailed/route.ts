import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  console.log("🔍 DETAILED Environment Debug:")

  // Check if .env.local exists and read it
  const envPath = path.join(process.cwd(), ".env.local")
  let envFileExists = false
  let envFileContent = ""

  try {
    envFileContent = fs.readFileSync(envPath, "utf8")
    envFileExists = true
    console.log("✅ .env.local file exists")
    console.log("📄 File content preview:", envFileContent.slice(0, 200))
  } catch (error) {
    console.log("❌ .env.local file not found or unreadable")
    console.log("📁 Current working directory:", process.cwd())
    console.log("🔍 Looking for file at:", envPath)
  }

  // Check various ways the key might be set
  const checks = {
    processEnv: process.env.OPENAI_API_KEY,
    nodeEnv: process.env.NODE_ENV,
    totalEnvVars: Object.keys(process.env).length,
    envFileExists,
    envFileSize: envFileExists ? envFileContent.length : 0,
    workingDir: process.cwd(),
    envFilePath: envPath,
  }

  console.log("🔍 Environment checks:", checks)

  return NextResponse.json({
    ...checks,
    envFilePreview: envFileExists ? envFileContent.slice(0, 300) : "FILE_NOT_FOUND",
    allEnvKeys: Object.keys(process.env).filter((k) => k.includes("OPENAI") || k.includes("API")),
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    keyLength: process.env.OPENAI_API_KEY?.length || 0,
  })
}
