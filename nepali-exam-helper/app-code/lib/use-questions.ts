"use client"

import { useState, useEffect } from "react"
import type { EnglishQuestion } from "./english-question-types"
import type { SocialStudiesGroup } from "./social-studies-types"
import type { NepaliQuestion } from "./nepali-types"
import type { MathQuestion } from "./math-types"

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

export interface TestMetadata {
  durationEnglish: number  // in minutes
  durationNepali: string
  titleEnglish: string
  titleNepali: string
  fullMarksEnglish: number
}

interface QuestionsData {
  groupA: GroupAQuestion[]
  groupB: FreeResponseQuestion[]
  groupC: FreeResponseQuestion[]
  groupD: FreeResponseQuestion[]
  englishQuestions: EnglishQuestion[]
  socialStudiesGroups: SocialStudiesGroup[]
  nepaliQuestions: NepaliQuestion[]
  mathQuestions: MathQuestion[]
}

export function useQuestions(testId = "see_2080_science") {
  const [questions, setQuestions] = useState<QuestionsData | null>(null)
  const [metadata, setMetadata] = useState<TestMetadata | null>(null)
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
        setMetadata(data.metadata || { durationEnglish: 180, durationNepali: '१८०', titleEnglish: testId, titleNepali: testId, fullMarksEnglish: 75 })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
        console.error("Error fetching questions:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [testId])

  return { questions, metadata, loading, error }
}

