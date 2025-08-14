import { NextResponse } from "next/server"

export async function GET() {
  console.log("🔍 Full Environment Debug:")
  console.log("NODE_ENV:", process.env.NODE_ENV)
  console.log("All env keys:", Object.keys(process.env).length)
  console.log(
    "OPENAI keys:",
    Object.keys(process.env).filter((k) => k.includes("OPENAI")),
  )
  console.log(
    "API keys:",
    Object.keys(process.env).filter((k) => k.includes("API")),
  )

  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV,
    totalEnvVars: Object.keys(process.env).length,
    openaiKeys: Object.keys(process.env).filter((k) => k.includes("OPENAI")),
    apiKeys: Object.keys(process.env).filter((k) => k.includes("API")),
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    keyLength: process.env.OPENAI_API_KEY?.length || 0,
    keyPreview: process.env.OPENAI_API_KEY
      ? `${process.env.OPENAI_API_KEY.slice(0, 7)}...${process.env.OPENAI_API_KEY.slice(-4)}`
      : "NOT_FOUND",
  })
}
