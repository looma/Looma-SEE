import { config, debugEnvironment } from "@/lib/config"

// Force dynamic rendering
export const dynamic = "force-dynamic"
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { question, answer, marks, sampleAnswer } = await req.json()

    console.log("🤖 AI Grading Request:", {
      question: question?.slice(0, 50) + "...",
      answer: answer?.slice(0, 50) + "...",
      marks,
      answerLength: answer?.length,
    })

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

    // Detect the language of the student's answer
    // Nepali uses Devanagari script (Unicode range: 0900-097F)
    const hasDevanagari = /[\u0900-\u097F]/.test(answer)
    const answerLanguage = hasDevanagari ? 'nepali' : 'english'

    console.log("🌐 Detected answer language:", answerLanguage, "(hasDevanagari:", hasDevanagari, ")")

    // Simplified, more reliable prompt with language-aware feedback
    const languageInstruction = answerLanguage === 'nepali'
      ? 'The student answered in Nepali. Provide your feedback in Nepali (नेपाली भाषामा प्रतिक्रिया दिनुहोस्).'
      : 'The student answered in English. Provide your feedback in English.'

    const systemPrompt = `You are a SEE examiner. Grade the student's answer and provide brief feedback.

${languageInstruction}

IMPORTANT: You must respond with ONLY valid JSON in this exact format:
{"score": <number>, "feedback": "<string>"}

Rules:
- Score must be integer between 0 and ${marks}
- Award partial credit when appropriate
- Keep feedback to 1-2 sentences maximum
- Be constructive and specific
- Respond in the SAME LANGUAGE as the student's answer
- For English questions, focus on content understanding rather than exact wording
- Recognize equivalent answers that convey the same meaning
- Accept both American English (e.g., "gotten", "gotten") and British English (e.g., "got", "got") as correct
- Do NOT penalize answers that are shorter than suggested word counts if they adequately address the question
- If a student's answer fully meets the requirements in fewer words, award full marks
- When grading, prioritize whether the answer demonstrates understanding of the key concepts over strict word-for-word matches`

    const userPrompt = `Grade this answer (${marks} marks total):

Question: ${question}
${sampleAnswer ? `Sample/expected answer: ${sampleAnswer}` : ""}
Student answer: ${answer}

IMPORTANT GRADING GUIDELINES:
- Accept equivalent phrasings that convey the same meaning as the sample answer
- Accept both American and British English variants (e.g., "gotten" and "got" are both acceptable)
- Do NOT penalize for being shorter than suggested word counts if the answer is complete and accurate
- Award full marks if the answer demonstrates complete understanding, even if worded differently
- Award partial marks for partially correct answers that show some understanding
- Focus on whether key concepts are addressed, not exact word matching
- IMPORTANT: Provide feedback in ${answerLanguage === 'nepali' ? 'Nepali (नेपाली)' : 'English'} since the student answered in that language

Respond with JSON only: {"score": <0-${marks}>, "feedback": "<brief feedback in ${answerLanguage === 'nepali' ? 'Nepali' : 'English'}>"}`

    console.log("🤖 Making OpenAI API call with improved settings...")

    // Retry logic for better reliability
    let attempts = 0
    const maxAttempts = 2
    let lastError = null

    while (attempts < maxAttempts) {
      attempts++
      console.log(`🔄 Attempt ${attempts}/${maxAttempts}`)

      try {
        const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.1, // Lower temperature for more consistent responses
            max_tokens: 1000, // Increased token limit
            top_p: 0.9,
            frequency_penalty: 0,
            presence_penalty: 0,
          }),
        })

        if (!openaiResponse.ok) {
          const errorText = await openaiResponse.text()
          console.error(`❌ OpenAI API call failed (attempt ${attempts}):`, openaiResponse.status, errorText)
          lastError = `OpenAI API failed: ${openaiResponse.status} - ${errorText}`

          // If it's a rate limit, wait and retry
          if (openaiResponse.status === 429 && attempts < maxAttempts) {
            console.log("⏳ Rate limited, waiting 2 seconds before retry...")
            await new Promise((resolve) => setTimeout(resolve, 2000))
            continue
          }

          // If it's the last attempt or non-retryable error, throw
          if (attempts === maxAttempts) {
            throw new Error(lastError)
          }
          continue
        }

        const openaiData = await openaiResponse.json()
        console.log("✅ OpenAI API call successful!")

        // Parse the response with better error handling
        const aiResponse = openaiData.choices?.[0]?.message?.content
        console.log("🤖 Raw AI Response:", aiResponse)

        if (!aiResponse) {
          throw new Error("Empty response from OpenAI")
        }

        // Try to parse JSON with multiple strategies
        let parsedResponse

        try {
          // Strategy 1: Direct JSON parse
          parsedResponse = JSON.parse(aiResponse.trim())
          console.log("✅ JSON parsed successfully (direct)")
        } catch (parseError) {
          console.log("⚠️ Direct JSON parse failed, trying extraction...")

          // Strategy 2: Extract JSON from response
          const jsonMatch = aiResponse.match(/\{[^}]*"score"[^}]*"feedback"[^}]*\}/i)
          if (jsonMatch) {
            try {
              parsedResponse = JSON.parse(jsonMatch[0])
              console.log("✅ JSON parsed successfully (extracted)")
            } catch (extractError) {
              console.log("❌ Extracted JSON also failed to parse")
              throw extractError
            }
          } else {
            // Strategy 3: Manual extraction as fallback
            console.log("⚠️ No JSON found, attempting manual extraction...")
            const scoreMatch = aiResponse.match(/(?:score|Score)["\s]*:?\s*(\d+)/i)
            const feedbackMatch = aiResponse.match(/(?:feedback|Feedback)["\s]*:?\s*["']?([^"'\n]+)["']?/i)

            parsedResponse = {
              score: scoreMatch ? Number.parseInt(scoreMatch[1]) : 0,
              feedback: feedbackMatch ? feedbackMatch[1].trim() : "Unable to parse feedback from AI response",
            }
            console.log("⚠️ Used manual extraction:", parsedResponse)
          }
        }

        // Validate and sanitize the response
        if (typeof parsedResponse.score !== "number" || isNaN(parsedResponse.score)) {
          parsedResponse.score = 0
        }
        parsedResponse.score = Math.max(0, Math.min(marks, Math.floor(parsedResponse.score)))

        if (typeof parsedResponse.feedback !== "string" || !parsedResponse.feedback.trim()) {
          parsedResponse.feedback = "AI feedback unavailable"
        }

        // No length limit on feedback - display full AI response

        console.log("✅ Final grading result:", {
          score: parsedResponse.score,
          feedbackLength: parsedResponse.feedback.length,
          attempt: attempts,
        })

        return new Response(JSON.stringify(parsedResponse), {
          headers: { "Content-Type": "application/json" },
        })
      } catch (error) {
        console.error(`❌ Attempt ${attempts} failed:`, error.message)
        lastError = error.message

        if (attempts < maxAttempts) {
          console.log("🔄 Retrying...")
          await new Promise((resolve) => setTimeout(resolve, 1000))
          continue
        }
      }
    }

    // If we get here, all attempts failed
    console.error("❌ All grading attempts failed:", lastError)
    return new Response(
      JSON.stringify({
        error: `AI grading failed after ${maxAttempts} attempts: ${lastError}`,
        code: "AI_ERROR",
        details: lastError,
      }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      },
    )
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
