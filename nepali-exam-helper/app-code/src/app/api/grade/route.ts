import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { question, answer, marks } = await req.json()

    if (!question || !answer || marks === undefined) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "Missing OpenAI credentials. Set the OPENAI_API_KEY environment variable and restart the server.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }

    const gradingPrompt = `
You are an expert examiner for the Nepali SEE Science subject.
Evaluate the student's answer. Score must be an integer from 0 to ${marks}.
Return only JSON with { "score": number, "feedback": string }.
Question: "${question}"
Answer: "${answer}"
`

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: z.object({
        score: z.number().min(0).max(marks),
        feedback: z.string(),
      }),
      prompt: gradingPrompt,
    })

    return new Response(JSON.stringify(object), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("AI grading error:", error)
    return new Response(JSON.stringify({ error: "Failed to grade answer." }), { status: 500 })
  }
}
