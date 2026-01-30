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

    const systemPrompt = `You are a SEE examiner. Grade the student's answer and provide detailed, constructive feedback.

${languageInstruction}

IMPORTANT: You must respond with ONLY valid JSON in this exact format:
{"score": <number>, "feedback": "<string>"}

Rules:
- Score must be integer between 0 and ${marks}
- Award partial credit when appropriate
- **If NOT awarding full marks, you MUST explain specifically what was missing, incorrect, or could be improved**
- Be constructive and specific in your feedback
- Respond in the SAME LANGUAGE as the student's answer
- For English questions, focus on content understanding rather than exact wording
- Recognize equivalent answers that convey the same meaning
- Accept both American and British English spellings as correct

**CRITICAL - FEEDBACK/SCORE CONSISTENCY:**
- If your feedback says "full marks", "correct", or "well done", the score MUST equal ${marks}
- If the score is less than ${marks}, your feedback MUST explain exactly what was wrong or missing
- NEVER say an answer is correct but give partial marks
- NEVER say an answer deserves full marks but give 0 or partial marks
- The score and feedback must ALWAYS be logically consistent

**FORMAT REQUIREMENTS (IMPORTANT):**
- If the question specifies a word count (e.g., "Write 150 words"), check if the answer meets it. Deduct marks proportionally if significantly short (e.g., 50% of required words = lose up to 50% of marks)
- If the question specifies paragraph count or specific structure, verify compliance

**GRAMMAR & WRITING QUALITY (For English answers):**
- Check for ALL grammar issues: capitalization, verb tenses, subject-verb agreement, punctuation, spelling
- For EVERY grammar error found, you MUST:
  1. Identify the specific error
  2. Explain what is wrong
  3. Show how to fix it (e.g., "'i went' should be 'I went' - capitalize 'I'")
- Deduct marks appropriately for grammar errors (0.5-1 mark depending on severity/frequency)
- Students need to learn proper writing - always give specific corrections

**CREATIVE WRITING REQUIREMENTS (Essays, Stories, Travelogues, Dialogues):**
- A TITLE is REQUIRED for full marks on essays, stories, travelogues, and similar creative writing
- If no title is provided, deduct 0.5-1 mark and mention "Missing title" in feedback
- For travelogues specifically: must have a title, first-person narrative, description of places visited

**ANSWER LENGTH REQUIREMENTS:**
- Check if the answer meets the expected length for the question type
- Very short answer questions: 1-2 sentences expected
- Short answer questions: 3-5 sentences expected  
- Long answer questions: Full paragraphs expected
- If answer is significantly shorter than expected, deduct marks and explain: "Answer too short - expected X sentences/paragraphs"

**SCIENCE & MATH REQUIREMENTS:**
- For numerical answers, CHECK FOR UNITS - if units are expected and missing, deduct 0.5 mark
- Always mention: "Missing units - answer should include [appropriate unit]"
- For calculations, show working is often expected - mention if missing

- When grading, prioritize whether the answer demonstrates understanding of the key concepts`

    const userPrompt = `Grade this answer (${marks} marks total):

Question: ${question}
${sampleAnswer ? `Sample/expected answer: ${sampleAnswer}` : ""}
Student answer: ${answer}

GRADING GUIDELINES:
1. **CONTAINS = CORRECT**: If student answer CONTAINS the expected answer (even with extra words), award FULL marks
   - "non-profit organizations" contains "non-profit" → FULL MARKS
   - "drawing pictures" contains "drawing" → FULL MARKS
2. **DON'T penalize elaboration**: Students who add more detail should NOT lose points
3. Accept equivalent phrasings and synonyms
4. Accept American and British English
5. If the answer captures the key concept, give full marks
6. Provide feedback in ${answerLanguage === 'nepali' ? 'Nepali' : 'English'}

**FORMAT ENFORCEMENT:**
- If question asks for specific word count and answer is significantly short, deduct marks proportionally
- If question asks for paragraphs/structure and answer doesn't comply, note this and deduct appropriately

**GRAMMAR CHECK (English only):**
- Check for and note ALL grammar errors (capitalization, punctuation, verb tenses, spelling)
- For EACH error, explain: what is wrong, why it's wrong, and how to fix it
- Example: "'the boy go to school' → 'The boy goes to school' (capitalize first word, use 'goes' for third person singular)"
- Deduct marks for grammar errors and ALWAYS explain each deduction

**CREATIVE WRITING CHECK:**
- If this is an essay, story, travelogue, or dialogue, check for a TITLE
- If no title is present, deduct 0.5-1 mark and note "Missing title (शीर्षक छैन)" in feedback
- Travelogues must have: title, first-person perspective, vivid description of places

**ANSWER LENGTH CHECK:**
- Evaluate if the answer length matches the question requirements
- If too short, deduct marks and specify: "Answer is too short. Expected [X sentences/paragraphs] but received [Y]."
- For word count requirements, calculate approximate word count and compare

**FEEDBACK REQUIREMENT (CRITICAL):**
- NEVER deduct points without explaining exactly WHY in the feedback
- For every mark deducted, provide: what was wrong, why it's wrong, how to improve
- Be specific: "Missing X", "Incorrect Y", "Grammar error: Z should be W", "Too short: expected X, got Y"
- Students should be able to learn from every piece of feedback

**SCIENCE & MATH REQUIREMENTS:**
- For numerical answers, REQUIRE appropriate units (meters, kg, °C, etc.)
- If units are missing, deduct 0.5 mark and note: "Missing units - should include [unit]"
- Accept ALL equivalent notation formats: x^2 = x² = x**2, sqrt(x) = √x = root(x)
- Accept spaces or no spaces: 2x = 2*x = 2 * x, a+b = a + b
- Accept fraction formats: 1/2 = 0.5 = ½, 3/4 = 0.75
- Accept equivalent expressions: 2(x+1) = 2x+2, x^2-1 = (x+1)(x-1)
- If the MATHEMATICAL RESULT is correct, give FULL marks regardless of notation style

Respond with JSON only: {"score": <0-${marks}>, "feedback": "<detailed feedback explaining score>"}`

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
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`❌ Attempt ${attempts} failed:`, errorMessage)
        lastError = errorMessage

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
    const err = error instanceof Error ? error : new Error('Unknown error')
    console.error("❌ AI grading error details:", {
      message: err.message,
      name: err.name,
      stack: err.stack?.slice(0, 500),
    })

    return new Response(
      JSON.stringify({
        error: `AI grading failed: ${err.message}`,
        code: "AI_ERROR",
        details: err.message,
      }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
