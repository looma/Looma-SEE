"use client"

import { useEffect, useMemo, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, AlertTriangle, RotateCcw } from "lucide-react"
import { loadStudentProgress } from "@/lib/storage"

type TestMeta = {
  id: string
  title: string
  titleNepali?: string
  subject?: string
  year?: number
  totalMarks?: number
  duration?: number
  sections?: string[]
  isActive?: boolean
}

interface TestSelectorProps {
  currentTestId: string
  onTestChange: (testId: string) => void
  onBackToSelection: () => void
  studentId: string
}

export function TestSelector({ currentTestId, onTestChange, onBackToSelection, studentId }: TestSelectorProps) {
  const [tests, setTests] = useState<TestMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currentTest = useMemo(() => tests.find((t) => t.id === currentTestId), [tests, currentTestId])

  const getTestProgress = (testId: string) => {
    const progress = loadStudentProgress(`${studentId}_${testId}`)
    if (!progress) return { completed: false, hasProgress: false, percentage: 0, lastAttempt: null as any }

    // Count actual answered questions from their progress
    let totalAnswered = 0

    // Count Group A answers (multiple choice)
    const groupAAnswers = Object.keys(progress.answers?.groupA || {}).filter(
      (key) => (progress.answers?.groupA as Record<string, string>)?.[key]?.trim?.(),
    ).length

    // Count Group B answers (free response)
    const groupBAnswers = Object.keys(progress.answers?.groupB || {}).filter(
      (key) => (progress.answers?.groupB as Record<string, string>)?.[key]?.trim?.(),
    ).length

    // Count Group C answers (free response)
    const groupCAnswers = Object.keys(progress.answers?.groupC || {}).filter(
      (key) => (progress.answers?.groupC as Record<string, string>)?.[key]?.trim?.(),
    ).length

    // Count Group D answers (free response)
    const groupDAnswers = Object.keys(progress.answers?.groupD || {}).filter(
      (key) => (progress.answers?.groupD as Record<string, string>)?.[key]?.trim?.(),
    ).length


    // Check for English test answers (stored differently)
    let englishAnswers = 0
    if (progress.answers) {
      // Count English question answers - handle different question types
      englishAnswers = Object.keys(progress.answers).filter((key) => {
        const answer = progress.answers[key]
        if (!answer) return false

        // Handle different answer structures based on question type
        if (typeof answer === 'string') {
          return answer.trim().length > 0
        } else if (typeof answer === 'object' && !Array.isArray(answer)) {
          // Check if it's a free writing question (has content property)
          if (answer.content && typeof answer.content === 'string') {
            return answer.content.trim().length > 0
          }
          // Check other object structures (cloze test, grammar, reading comprehension)
          return Object.values(answer).some((val) => {
            if (typeof val === 'string') {
              return val.trim().length > 0
            } else if (typeof val === 'object' && val !== null) {
              // Handle nested objects (like reading comprehension sub-sections)
              return Object.values(val).some((nestedVal) =>
                typeof nestedVal === 'string' && nestedVal.trim().length > 0
              )
            }
            return val !== undefined && val !== null && val !== ""
          })
        }
        return answer !== undefined && answer !== null && answer !== ""
      }).length
    }

    // Use the higher count (either science format or English format)
    totalAnswered = Math.max(groupAAnswers + groupBAnswers + groupCAnswers + groupDAnswers, englishAnswers)

    const hasAttempts = (progress.attempts || []).length > 0
    const hasProgress = totalAnswered > 0
    // Estimate total questions based on detected answer format
    // Use actual answered count * 1.5 or a minimum of 10 to estimate progress reasonably
    const estimatedTotal = Math.max(10, Math.ceil(totalAnswered * 1.5))
    const percentage = totalAnswered > 0 ? Math.round((totalAnswered / estimatedTotal) * 100) : 0

    return {
      completed: hasAttempts,
      hasProgress,
      percentage: Math.min(percentage, 100), // Cap at 100%
      lastAttempt: hasAttempts ? progress.attempts[progress.attempts.length - 1] : null,
    }
  }

  useEffect(() => {
    let mounted = true
    async function fetchTests() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/tests?_t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        })
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        if (mounted) {
          setTests(data.tests || [])
        }
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : "Failed to load tests")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchTests()
    return () => {
      mounted = false
    }
  }, [])

  if (!loading && tests.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-amber-600" />
          <div>
            <p className="font-semibold text-slate-800">No Practice Tests Available</p>
            <p className="text-sm text-slate-600">कुनै अभ्यास परीक्षा उपलब्ध छैन</p>
          </div>
        </div>
        <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm text-amber-800">
            Add test data to the database using:{" "}
            <code className="bg-amber-100 px-2 py-1 rounded text-amber-900">
              node scripts/import-test-json.mjs --file ./data/your-test.json
            </code>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-amber-600" />
          <div>
            <p className="font-semibold text-slate-800">Current Practice Test</p>
            <p className="text-sm text-slate-600">हालको अभ्यास परीक्षा</p>
          </div>
        </div>

        <Button
          onClick={onBackToSelection}
          variant="outline"
          size="sm"
          className="text-amber-700 hover:text-amber-800 bg-amber-50 border-amber-300 hover:bg-amber-100 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Change Test
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Select value={currentTestId} onValueChange={onTestChange}>
          <SelectTrigger className="flex-1 bg-white border-2 border-amber-200 focus:border-amber-400 min-h-[60px]">
            <SelectValue placeholder={loading ? "Loading tests..." : "Select a practice test"}>
              {currentTest ? (
                <div className="text-left py-1">
                  <div className="font-medium text-slate-800">{currentTest.title}</div>
                  {currentTest.titleNepali && (
                    <div className="text-sm text-slate-600 mt-1">{currentTest.titleNepali}</div>
                  )}
                </div>
              ) : loading ? (
                "Loading tests..."
              ) : tests.length === 0 ? (
                "No tests found"
              ) : (
                currentTestId
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-w-[600px]">
            {tests.map((test) => {
              const p = getTestProgress(test.id)
              return (
                <SelectItem key={test.id} value={test.id} className="p-4 min-h-[80px]">
                  <div className="w-full">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-800 truncate">{test.title}</div>
                        {test.titleNepali && (
                          <div className="text-sm text-slate-600 mt-1 truncate">{test.titleNepali}</div>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge variant="outline" className="text-xs border-amber-300 text-amber-700">
                            {test.subject || "Subject"} • {test.totalMarks ?? 0} marks
                          </Badge>
                          {p.completed && p.lastAttempt && (
                            <Badge
                              variant={p.lastAttempt.grade === "E" ? "destructive" : "secondary"}
                              className="text-xs"
                            >
                              Last: {p.lastAttempt.percentage}% ({p.lastAttempt.grade})
                            </Badge>
                          )}
                          {p.hasProgress && !p.completed && (
                            <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">
                              {p.percentage}% in progress
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      {currentTest && (
        <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-amber-800">{currentTest.title}</p>
              {currentTest.titleNepali && <p className="text-sm text-amber-600">{currentTest.titleNepali}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-100 text-amber-800 capitalize border-amber-300">
                {currentTest.subject || "General"}
              </Badge>
              <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                {currentTest.totalMarks ?? 0} marks
              </Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
