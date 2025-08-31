"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Trophy, ArrowRight, Loader2, AlertTriangle, GraduationCap, LogOut } from "lucide-react"
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

interface TestSelectionScreenProps {
  studentId: string
  onTestSelect: (testId: string) => void
  onSwitchUser?: () => void
}

export function TestSelectionScreen({ studentId, onTestSelect, onSwitchUser }: TestSelectionScreenProps) {
  const [tests, setTests] = useState<TestMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getTestProgress = (testId: string) => {
    const progress = loadStudentProgress(`${studentId}_${testId}`)
    if (!progress) return { completed: false, hasProgress: false, percentage: 0, lastAttempt: null as any }

    // Check if they have completed attempts (submitted the test)
    const hasAttempts = (progress.attempts || []).length > 0
    const lastAttempt = hasAttempts ? progress.attempts[progress.attempts.length - 1] : null

    // Count actual answered questions from their progress
    let totalAnswered = 0
    const estimatedTotal = 25 // Default estimate

    // Count Group A answers (multiple choice)
    const groupAAnswers = Object.keys(progress.answersA || {}).filter(
      (key) => progress.answersA[key] && progress.answersA[key].trim(),
    ).length

    // Count Group B answers (free response)
    const groupBAnswers = Object.keys(progress.answersB || {}).filter(
      (key) => progress.answersB[key] && progress.answersB[key].trim(),
    ).length

    // Count Group C answers (free response)
    const groupCAnswers = Object.keys(progress.answersC || {}).filter(
      (key) => progress.answersC[key] && progress.answersC[key].trim(),
    ).length

    // Count Group D answers (free response)
    const groupDAnswers = Object.keys(progress.answersD || {}).filter(
      (key) => progress.answersD[key] && progress.answersD[key].trim(),
    ).length

    // Check for English test answers (stored differently)
    let englishAnswers = 0
    if (progress.answers) {
      // Count English question answers
      englishAnswers = Object.keys(progress.answers).filter((key) => {
        const answer = progress.answers[key]
        if (!answer) return false
        if (typeof answer === "object" && !Array.isArray(answer)) {
          return Object.values(answer).some((val) => val !== undefined && val !== null && val !== "")
        }
        return answer !== undefined && answer !== null && answer !== ""
      }).length
    }

    // Use the higher count (either science format or English format)
    totalAnswered = Math.max(groupAAnswers + groupBAnswers + groupCAnswers + groupDAnswers, englishAnswers)

    const hasProgress = totalAnswered > 0
    const percentage = Math.round((totalAnswered / estimatedTotal) * 100)

    return {
      completed: hasAttempts,
      hasProgress,
      percentage: Math.min(percentage, 100), // Cap at 100%
      lastAttempt,
      answeredCount: totalAnswered,
    }
  }

  const getSubjectColor = (subject: string) => {
    switch (subject?.toLowerCase()) {
      case "science":
        return "from-emerald-500 to-teal-600"
      case "mathematics":
        return "from-blue-500 to-indigo-600"
      case "english":
        return "from-purple-500 to-violet-600"
      case "nepali":
        return "from-orange-500 to-red-600"
      case "social":
        return "from-amber-500 to-yellow-600"
      default:
        return "from-slate-500 to-gray-600"
    }
  }

  const getSubjectIcon = (subject: string) => {
    switch (subject?.toLowerCase()) {
      case "science":
        return "🧪"
      case "mathematics":
        return "📐"
      case "english":
        return "📚"
      case "nepali":
        return "🇳🇵"
      case "social":
        return "🌍"
      default:
        return "📖"
    }
  }

  const getSubjectDisplayName = (subject: string) => {
    switch (subject?.toLowerCase()) {
      case "science":
        return "Science and Technology"
      case "mathematics":
        return "Mathematics"
      case "english":
        return "English"
      case "nepali":
        return "Nepali"
      case "social":
        return "Social Studies"
      default:
        return subject?.charAt(0).toUpperCase() + subject?.slice(1) || "General"
    }
  }

  useEffect(() => {
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
        setTests(data.tests || [])
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load tests")
      } finally {
        setLoading(false)
      }
    }
    fetchTests()
  }, [])

  // Group tests by subject
  const testsBySubject = tests.reduce(
    (acc, test) => {
      const subject = test.subject || "general"
      if (!acc[subject]) acc[subject] = []
      acc[subject].push(test)
      return acc
    },
    {} as Record<string, TestMeta[]>,
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 flex items-center justify-center p-4">
        {/* Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-60 h-60 sm:w-80 sm:h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-60 h-60 sm:w-80 sm:h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-60 h-60 sm:w-80 sm:h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="text-center relative z-10">
          <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-yellow-600 mx-auto mb-4" />
          <p className="text-lg sm:text-xl text-slate-700">Loading practice tests...</p>
          <p className="text-sm sm:text-base text-slate-600">अभ्यास परीक्षाहरू लोड गर्दै...</p>
        </div>
      </div>
    )
  }

  if (error || tests.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 flex items-center justify-center p-4">
        {/* Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-60 h-60 sm:w-80 sm:h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-60 h-60 sm:w-80 sm:h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-60 h-60 sm:w-80 sm:h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <Card className="w-full max-w-sm sm:max-w-md shadow-xl relative z-10">
          <CardHeader className="text-center bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 sm:p-6">
            <AlertTriangle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4" />
            <CardTitle className="text-xl sm:text-2xl">No Tests Available</CardTitle>
            <p className="text-red-100 text-sm sm:text-base">कुनै परीक्षा उपलब्ध छैन</p>
          </CardHeader>
          <CardContent className="text-center p-4 sm:p-8">
            <p className="text-slate-700 mb-4 text-sm sm:text-base">
              {error ? `Error: ${error}` : "No practice tests found in the database."}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 bg-slate-100 p-3 rounded-lg">
              Add test data using:{" "}
              <code className="bg-slate-200 px-2 py-1 rounded text-xs">node scripts/import-all-tests.mjs</code>
            </p>
            {onSwitchUser && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <Button
                  onClick={onSwitchUser}
                  variant="outline"
                  size="sm"
                  className="text-amber-700 hover:text-amber-800 bg-amber-50 border-amber-300 hover:bg-amber-100 transition-all duration-200 shadow-sm hover:shadow-md font-medium w-full sm:w-auto min-h-[44px]"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Switch Student
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-60 h-60 sm:w-80 sm:h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-60 h-60 sm:w-80 sm:h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-60 h-60 sm:w-80 sm:h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm shadow-sm border-b relative z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <img src="/looma-logo.png" alt="Looma" className="h-8 sm:h-12 w-auto" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Choose Your Practice Test</h1>
                <p className="text-base sm:text-lg text-slate-600">आफ्नो अभ्यास परीक्षा छान्नुहोस्</p>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-4">
              <div className="text-left sm:text-right">
                <p className="text-xs sm:text-sm text-slate-500">Student ID</p>
                <p className="font-semibold text-slate-800 text-sm sm:text-base">{studentId}</p>
              </div>
              {onSwitchUser && (
                <Button
                  onClick={onSwitchUser}
                  variant="outline"
                  size="sm"
                  className="text-amber-700 hover:text-amber-800 bg-amber-50 border-amber-300 hover:bg-amber-100 transition-all duration-200 shadow-sm hover:shadow-md font-medium text-xs sm:text-sm min-h-[40px]"
                >
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Switch Student</span>
                  <span className="sm:hidden">Switch</span>
                </Button>
              )}
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <p className="text-slate-600 text-sm sm:text-base">
              Select a practice test below to start your preparation. Your progress will be automatically saved and you
              can continue where you left off.
            </p>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              तलबाट अभ्यास परीक्षा छानेर आफ्नो तयारी सुरु गर्नुहोस्। तपाईंको प्रगति स्वचालित रूपमा सुरक्षित हुनेछ।
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 relative z-10">
        {Object.entries(testsBySubject).map(([subject, subjectTests]) => (
          <div key={subject} className="mb-8 sm:mb-12">
            {/* Subject Header */}
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="text-2xl sm:text-3xl">{getSubjectIcon(subject)}</div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 capitalize flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" />
                  {getSubjectDisplayName(subject)} Tests
                </h2>
                <p className="text-slate-600 text-sm sm:text-base">
                  {subject === "science" && "विज्ञान र प्रविधि परीक्षाहरू"}
                  {subject === "mathematics" && "गणित परीक्षाहरू"}
                  {subject === "english" && "अंग्रेजी परीक्षाहरू"}
                  {subject === "nepali" && "नेपाली परीक्षाहरू"}
                  {subject === "social" && "सामाजिक परीक्षाहरू"}
                  {subject === "general" && "सामान्य परीक्षाहरू"}
                </p>
              </div>
              <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-slate-300 to-transparent ml-4"></div>
            </div>

            {/* Tests Grid */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {subjectTests.map((test) => {
                const progress = getTestProgress(test.id)
                return (
                  <Card
                    key={test.id}
                    className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border-0 shadow-lg overflow-hidden bg-white/90 backdrop-blur-sm"
                    onClick={() => onTestSelect(test.id)}
                  >
                    <CardHeader
                      className={`bg-gradient-to-r ${getSubjectColor(test.subject || "")} text-white relative overflow-hidden p-4 sm:p-6`}
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 opacity-10">
                        <div className="text-4xl sm:text-6xl transform rotate-12 translate-x-6 sm:translate-x-8 -translate-y-2 sm:-translate-y-4">
                          {getSubjectIcon(test.subject || "")}
                        </div>
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 pr-2">
                            <CardTitle className="text-lg sm:text-xl font-bold leading-tight">{test.title}</CardTitle>
                            {test.titleNepali && <p className="text-white/90 mt-2 text-sm">{test.titleNepali}</p>}
                          </div>
                          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 opacity-75 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                        </div>
                        {test.year && (
                          <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                            Year {test.year}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 sm:p-6 bg-white">
                      {/* Test Info */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                          <Badge variant="outline" className="text-xs">
                            <Trophy className="h-3 w-3 mr-1" />
                            {test.totalMarks || 0} marks
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {test.duration || 180} min
                          </Badge>
                        </div>
                      </div>

                      {/* Progress Status - Fixed Height */}
                      <div className="h-20 mb-4">
                        {" "}
                        {/* Fixed height container */}
                        {progress.completed && progress.lastAttempt && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 sm:p-4 h-full flex items-center">
                            <div className="flex items-center justify-between w-full">
                              <div>
                                <p className="text-sm font-semibold text-emerald-800">✅ Completed</p>
                                <p className="text-xs text-emerald-600">
                                  पूरा भयो • Score: {progress.lastAttempt.totalScore}/{progress.lastAttempt.maxScore}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-xl sm:text-2xl font-bold text-emerald-800">
                                  {progress.lastAttempt.percentage}%
                                </div>
                                <Badge
                                  variant={progress.lastAttempt.grade === "E" ? "destructive" : "default"}
                                  className="text-xs"
                                >
                                  Grade {progress.lastAttempt.grade}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        )}
                        {progress.hasProgress && !progress.completed && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 h-full flex items-center">
                            <div className="flex items-center justify-between w-full">
                              <div>
                                <p className="text-sm font-semibold text-blue-800">📝 In Progress</p>
                                <p className="text-xs text-blue-600">
                                  प्रगतिमा छ • {progress.answeredCount} questions answered
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-xl sm:text-2xl font-bold text-blue-800">
                                  {progress.percentage}%
                                </div>
                                <p className="text-xs text-blue-600">estimated</p>
                              </div>
                            </div>
                          </div>
                        )}
                        {!progress.hasProgress && !progress.completed && (
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4 h-full flex items-center justify-center">
                            <div className="text-center">
                              <p className="text-sm font-semibold text-slate-600">🚀 Ready to Start</p>
                              <p className="text-xs text-slate-500">सुरु गर्न तयार</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <Button
                        className={`w-full bg-gradient-to-r ${getSubjectColor(test.subject || "")} hover:shadow-lg text-white font-semibold py-3 sm:py-3 min-h-[48px] text-sm sm:text-base`}
                        onClick={(e) => {
                          e.stopPropagation()
                          onTestSelect(test.id)
                        }}
                      >
                        {progress.completed
                          ? "🔄 Retake Test"
                          : progress.hasProgress
                            ? "▶️ Continue Test"
                            : "🚀 Start Test"}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
