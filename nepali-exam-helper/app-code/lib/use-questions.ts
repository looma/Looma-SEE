"use client"

import { useState, useEffect } from "react"

export interface GroupAQuestion {
  id: string
  nepali: string
  english: string
  options: { id: string; nepali: string; english: string }[]
  correctAnswer: string
  marks: number
  explanation?: string
}

export interface FreeResponseQuestion {
  id: string
  nepali: string
  english: string
  marks: number
  sampleAnswer?: string
}

export interface EnglishQuestion {
  id: string
  questionNumber: number
  type: string
  title: string
  marks: number
  passage?: any
  subQuestions?: any[]
  subSections?: any[]
  wordCount?: number
  clues?: string[]
  sampleAnswer?: any
  gaps?: any[]
}

interface QuestionsData {
  groupA: GroupAQuestion[]
  groupB: FreeResponseQuestion[]
  groupC: FreeResponseQuestion[]
  groupD: FreeResponseQuestion[]
  englishQuestions: EnglishQuestion[]
}

export function useQuestions(testId = "see_2080_science") {
  const [questions, setQuestions] = useState<QuestionsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true)
        const response = await fetch(`/api/questions/${testId}`)
        if (!response.ok) {
          const msg = await response.text()
          throw new Error(msg || "Failed to fetch questions")
        }
        const data = await response.json()
        setQuestions(data.questions)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
        console.error("Error fetching questions:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [testId])

  return { questions, loading, error }
}
