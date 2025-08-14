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

    const totalAnswered =
      Object.keys(progress.answersA || {}).length +
      Object.keys(progress.answersB || {}).filter((k) => progress.answersB[k]?.trim()).length +
      Object.keys(progress.answersC || {}).filter((k) => progress.answersC[k]?.trim()).length +
      Object.keys(progress.answersD || {}).filter((k) => progress.answersD[k]?.trim()).length

    const hasAttempts = (progress.attempts || []).length > 0
    const hasProgress = totalAnswered > 0
    const estimatedTotal = 25
    const percentage = Math.round((totalAnswered / estimatedTotal) * 100)

    return {
      completed: hasAttempts,
      hasProgress,
      percentage,
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
