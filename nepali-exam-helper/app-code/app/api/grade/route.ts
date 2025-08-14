import { config, debugEnvironment } from "@/lib/config"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { question, answer, marks, sampleAnswer } = await req.json()

    console.log("🤖 AI Grading Request:", { question: question?.slice(0, 50), answer: answer?.slice(0, 50), marks })

    if (!question || typeof answer !== "string" || typeof marks !== "number") {
      console.error("❌ Missing required fields:", { question: !!question, answer: typeof answer, marks: typeof marks })
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Debug environment loading
    debugEnvironment()

    // Only use environment variables - no hardcoded fallbacks
    const apiKey = config.openaiApiKey

    console.log("🔑 API Key Status:")
    console.log("  From environment:", apiKey ? `${apiKey.slice(0, 7)}...${apiKey.slice(-4)}` : "MISSING")

    if (!apiKey) {
      console.error("❌ No API key found in environment variables")
      return new Response(
        JSON.stringify({
          error: "AI is unavailable. Please add OPENAI_API_KEY to your .env.local file.",
          code: "AI_UNAVAILABLE",
        }),
        { status: 503, headers: { "Content-Type": "application/json" } },
      )
    }

    // Enhanced prompt for partial credit grading
    const systemPrompt = `You are an expert SEE Science examiner who awards partial credit fairly. 

Key principles:
- Award partial marks when students show partial understanding
- If a question has multiple parts, award marks for each part they get right
- Don't give all-or-nothing scores unless the answer is completely wrong or completely right
- Be specific about what they got right and what they missed
- Keep feedback to 2-3 sentences maximum
- Focus on constructive guidance

You must respond with valid JSON in this exact format:
{"score": <number>, "feedback": "<string>"}

The score must be an integer between 0 and ${marks}.`

    const userPrompt = sampleAnswer
      ? `Grade the student's answer by comparing it to the sample correct answer. Award PARTIAL CREDIT based on how much of the answer is correct.

Question (${marks} marks): ${question}
Sample correct answer: ${sampleAnswer}
Student's answer: ${answer}

Grading Instructions:
- This question is worth ${marks} marks total
- Award partial credit based on how many key points/concepts the student got correct
- If the sample answer has multiple parts/points, award proportional marks for each part they got right
- For example: If worth 3 marks and has 3 key points, award 1 mark per correct point
- If worth 2 marks and student gets half the concept right, award 1 mark
- Consider both Nepali and English answers
- Be fair but maintain academic standards
- Focus on constructive guidance

Respond with JSON: {"score": <0-${marks}>, "feedback": "<your feedback>"}`
      : `Grade the student's answer for this SEE Science question. Award PARTIAL CREDIT based on correctness.

Question (${marks} marks): ${question}
Student's answer: ${answer}

Grading Instructions:
- This question is worth ${marks} marks total
- Award partial credit - don't just give 0 or full marks
- Consider how much of the expected answer the student provided
- Award proportional marks based on completeness and accuracy
- Consider both Nepali and English answers
- Be fair but maintain academic standards

Respond with JSON: {"score": <0-${marks}>, "feedback": "<your feedback>"}`

    console.log("🤖 Making OpenAI API call...")

    // Direct API call to OpenAI
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    })

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error("❌ OpenAI API call failed:", openaiResponse.status, errorText)
      return new Response(
        JSON.stringify({
          error: `OpenAI API failed: ${openaiResponse.status} - ${errorText}`,
          code: "OPENAI_API_ERROR",
        }),
        { status: openaiResponse.status, headers: { "Content-Type": "application/json" } },
      )
    }

    const openaiData = await openaiResponse.json()
    console.log("✅ OpenAI API call successful!")

    // Parse the response
    const aiResponse = openaiData.choices[0].message.content
    console.log("🤖 AI Response:", aiResponse)

    let parsedResponse
    try {
      parsedResponse = JSON.parse(aiResponse)
    } catch (parseError) {
      console.error("❌ Failed to parse AI response as JSON:", aiResponse)
      // Fallback: try to extract score and feedback manually
      const scoreMatch = aiResponse.match(/score["\s]*:\s*(\d+)/i)
      const feedbackMatch = aiResponse.match(/feedback["\s]*:\s*["']([^"']+)["']/i)

      parsedResponse = {
        score: scoreMatch ? Number.parseInt(scoreMatch[1]) : 0,
        feedback: feedbackMatch ? feedbackMatch[1] : "Unable to parse AI feedback",
      }
    }

    // Validate the response
    if (typeof parsedResponse.score !== "number" || parsedResponse.score < 0 || parsedResponse.score > marks) {
      parsedResponse.score = Math.max(0, Math.min(marks, Math.floor(parsedResponse.score || 0)))
    }

    if (typeof parsedResponse.feedback !== "string") {
      parsedResponse.feedback = "AI feedback unavailable"
    }

    console.log("✅ AI grading successful:", {
      score: parsedResponse.score,
      feedbackLength: parsedResponse.feedback.length,
    })
    return new Response(JSON.stringify(parsedResponse), { headers: { "Content-Type": "application/json" } })
  } catch (error) {
    console.error("❌ AI grading error details:", {
      message: error.message,
      name: error.name,
      stack: error.stack?.slice(0, 500),
    })

    return new Response(
      JSON.stringify({
        error: `AI grading failed: ${error.message}`,
        code: "AI_ERROR",
        details: error.message,
      }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
