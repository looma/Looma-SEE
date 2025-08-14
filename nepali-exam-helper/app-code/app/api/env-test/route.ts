// Test endpoint to check environment loading
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV,
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasPublicOpenAI: !!process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    hasMongoDB: !!process.env.MONGODB_URI,
    openAIPreview: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.slice(0, 7)}...` : "MISSING",
    publicOpenAIPreview: process.env.NEXT_PUBLIC_OPENAI_API_KEY
      ? `${process.env.NEXT_PUBLIC_OPENAI_API_KEY.slice(0, 7)}...`
      : "MISSING",
    mongoPreview: process.env.MONGODB_URI ? process.env.MONGODB_URI.split("@")[0] + "@..." : "MISSING",
    allEnvKeys: Object.keys(process.env).filter((k) => k.includes("OPENAI") || k.includes("MONGODB")),
    envFileLocation: "Should be in project root as .env.local",
    currentWorkingDir: process.cwd(),
  })
}
