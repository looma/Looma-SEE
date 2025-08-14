import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        status: "❌ MISSING",
        message: "OPENAI_API_KEY environment variable is not set",
        note: "This should be available in v0 environment",
      })
    }

    console.log("🔑 Found API key in environment, testing...")

    // Test the API key by making a simple request
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ API key test failed:", response.status, errorText)

      return NextResponse.json({
        status: "❌ INVALID",
        message: `API key test failed (${response.status})`,
        error: errorText,
        keyPreview: `${apiKey.slice(0, 7)}...${apiKey.slice(-4)}`,
      })
    }

    const data = await response.json()
    console.log("✅ API key test successful!")

    return NextResponse.json({
      status: "✅ WORKING",
      message: "OpenAI API key is valid and working!",
      keyPreview: `${apiKey.slice(0, 7)}...${apiKey.slice(-4)}`,
      modelsAvailable: data.data?.length || 0,
      gpt4Available: data.data?.some((model: any) => model.id.includes("gpt-4")) || false,
    })
  } catch (error) {
    console.error("❌ API key test error:", error)
    return NextResponse.json({
      status: "❌ ERROR",
      message: "Failed to test OpenAI API",
      error: error.message,
    })
  }
}
