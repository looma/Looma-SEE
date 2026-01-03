"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Trophy, ArrowRight, Loader2, AlertTriangle, GraduationCap, LogOut, Mail, UserX } from "lucide-react"
import { loadStudentProgress, loadProgressFromServer, saveStudentProgress, type StudentProgress } from "@/lib/storage"
import { useLanguage } from "@/lib/language-context"

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
  isAuthenticated?: boolean
  userEmail?: string
}

export function TestSelectionScreen({ studentId, onTestSelect, onSwitchUser, isAuthenticated, userEmail }: TestSelectionScreenProps) {
  const { language } = useLanguage()
  const [tests, setTests] = useState<TestMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [serverProgress, setServerProgress] = useState<Record<string, StudentProgress>>({})
  const [loadingServerProgress, setLoadingServerProgress] = useState(false)

  const getTestProgress = (testId: string) => {
    // First try localStorage, then check server progress cache
    let progress = loadStudentProgress(`${studentId}_${testId}`)

    // If no local progress but we have server progress, use that
    if (!progress && serverProgress[testId]) {
      progress = serverProgress[testId]
      // Also cache it locally for future use
      saveStudentProgress(studentId, progress)
    }

    if (!progress) return { completed: false, hasProgress: false, percentage: 0, lastAttempt: null as any }

    // Check if they have completed attempts (submitted the test)
    const hasAttempts = (progress.attempts || []).length > 0
    const lastAttempt = hasAttempts ? progress.attempts[progress.attempts.length - 1] : null

    // Count actual answered questions from their progress
    let totalAnswered = 0
    const estimatedTotal = 25 // Default estimate

    // Count Group A answers (multiple choice) - Science format
    const groupAAnswers = Object.keys(progress.answers?.groupA || {}).filter(
      (key) => progress.answers?.groupA?.[key] && progress.answers.groupA[key].trim(),
    ).length

    // Count Group B answers (free response)
    const groupBAnswers = Object.keys(progress.answers?.groupB || {}).filter(
      (key) => progress.answers?.groupB?.[key] && progress.answers.groupB[key].trim(),
    ).length

    // Count Group C answers (free response)
    const groupCAnswers = Object.keys(progress.answers?.groupC || {}).filter(
      (key) => progress.answers?.groupC?.[key] && progress.answers.groupC[key].trim(),
    ).length

    // Count Group D answers (free response)
    const groupDAnswers = Object.keys(progress.answers?.groupD || {}).filter(
      (key) => progress.answers?.groupD?.[key] && progress.answers.groupD[key].trim(),
    ).length

    // Count Math answers (stored as answers.math.questionNumber.label)
    let mathAnswers = 0
    if (progress.answers?.math) {
      Object.values(progress.answers.math).forEach((questionAnswers: any) => {
        if (typeof questionAnswers === 'object' && questionAnswers !== null) {
          mathAnswers += Object.values(questionAnswers).filter(
            (val: any) => typeof val === 'string' && val.trim().length > 0
          ).length
        }
      })
    }

    // Count Nepali answers (stored as answers.nepali.q1, q2, etc.)
    let nepaliAnswers = 0
    if (progress.answers?.nepali) {
      Object.values(progress.answers.nepali).forEach((answer: any) => {
        if (typeof answer === 'string' && answer.trim().length > 0) {
          nepaliAnswers++
        } else if (typeof answer === 'object' && answer !== null) {
          // Handle structured answers (matching, fill_in_blanks, etc.)
          const hasContent = Object.values(answer).some((val: any) => {
            if (typeof val === 'string') return val.trim().length > 0
            return val !== undefined && val !== null && val !== ''
          })
          if (hasContent) nepaliAnswers++
        }
      })
    }

    // Count Social Studies answers (stored as answers.socialStudies)
    let socialStudiesAnswers = 0
    if (progress.answers?.socialStudies) {
      Object.values(progress.answers.socialStudies).forEach((answer: any) => {
        if (typeof answer === 'string' && answer.trim().length > 0) {
          socialStudiesAnswers++
        }
      })
    }

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

    // Use the maximum of all subject counts
    const scienceFormatCount = groupAAnswers + groupBAnswers + groupCAnswers + groupDAnswers
    totalAnswered = Math.max(
      scienceFormatCount,
      mathAnswers,
      nepaliAnswers,
      socialStudiesAnswers,
      englishAnswers
    )

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
        return "from-cyan-500 to-blue-600"
      case "english":
        return "from-purple-500 to-violet-600"
      case "nepali":
        return "from-orange-500 to-red-600"
      case "social":
      case "social_studies":
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
        return "ने"
      case "social":
      case "social_studies":
        return "🌍"
      default:
        return "📖"
    }
  }

  const getSubjectDisplayName = (subject: string) => {
    switch (subject?.toLowerCase()) {
      case "science":
        return language === "english" ? "Science and Technology" : "विज्ञान र प्रविधि"
      case "mathematics":
        return language === "english" ? "Mathematics" : "गणित"
      case "english":
        return language === "english" ? "English" : "अंग्रेजी"
      case "nepali":
        return language === "english" ? "Nepali" : "नेपाली"
      case "social":
      case "social_studies":
        return language === "english" ? "Social Studies" : "सामाजिक अध्ययन"
      default:
        return subject?.charAt(0).toUpperCase() + subject?.slice(1).replace(/_/g, ' ') || (language === "english" ? "General" : "सामान्य")
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

  // Load server progress for authenticated users
  useEffect(() => {
    async function fetchServerProgress() {
      if (!isAuthenticated || !userEmail) return

      setLoadingServerProgress(true)
      try {
        const result = await loadProgressFromServer(userEmail)
        if (result && Array.isArray(result)) {
          // Convert array to map by testId
          const progressMap: Record<string, StudentProgress> = {}
          result.forEach((p: StudentProgress) => {
            if (p.testId) {
              progressMap[p.testId] = p
            }
          })
          setServerProgress(progressMap)
          console.log(`☁️ Loaded ${result.length} test progress from server for ${userEmail}`)
        }
      } catch (error) {
        console.error("Failed to load server progress:", error)
      } finally {
        setLoadingServerProgress(false)
      }
    }
    fetchServerProgress()
  }, [isAuthenticated, userEmail])

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
          <p className="text-lg sm:text-xl text-slate-700">
            {language === "english" ? "Loading practice tests..." : "अभ्यास परीक्षाहरू लोड गर्दै..."}
          </p>
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
            <CardTitle className="text-xl sm:text-2xl">
              {language === "english" ? "No Tests Available" : "कुनै परीक्षा उपलब्ध छैन"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center p-4 sm:p-8">
            <p className="text-slate-700 mb-4 text-sm sm:text-base">
              {error
                ? (language === "english" ? `Error: ${error}` : `त्रुटि: ${error}`)
                : (language === "english" ? "No practice tests found in the database." : "डाटाबेसमा कुनै अभ्यास परीक्षा फेला परेन।")}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 bg-slate-100 p-3 rounded-lg">
              {language === "english" ? "Add test data using:" : "परीक्षा डाटा थप्नुहोस्:"}{" "}
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
                  {language === "english" ? "Switch Student" : "विद्यार्थी परिवर्तन गर्नुहोस्"}
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
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                  {language === "english" ? "Choose Your Practice Test" : "आफ्नो अभ्यास परीक्षा छान्नुहोस्"}
                </h1>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-4">
              <div className="text-left sm:text-right flex items-center gap-2">
                {isAuthenticated ? (
                  <Mail className="h-4 w-4 text-amber-600" />
                ) : (
                  <UserX className="h-4 w-4 text-slate-500" />
                )}
                <div>
                  {isAuthenticated && userEmail ? (
                    <>
                      <p className="font-semibold text-slate-800 text-sm sm:text-base">{userEmail}</p>
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        {language === "english" ? "Signed in" : "साइन इन भयो"}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-slate-800 text-sm sm:text-base">
                        {language === "english" ? "Guest Mode" : "अतिथि मोड"}
                      </p>
                      <p className="text-xs text-amber-600">
                        {language === "english" ? "Progress saved locally only" : "प्रगति स्थानीय रूपमा मात्र सुरक्षित"}
                      </p>
                    </>
                  )}
                </div>
              </div>
              {onSwitchUser && (
                <Button
                  onClick={onSwitchUser}
                  variant="outline"
                  size="sm"
                  className="text-amber-700 hover:text-amber-800 bg-amber-50 border-amber-300 hover:bg-amber-100 transition-all duration-200 shadow-sm hover:shadow-md font-medium text-xs sm:text-sm min-h-[40px]"
                >
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">
                    {isAuthenticated
                      ? (language === "english" ? "Sign Out" : "साइन आउट")
                      : (language === "english" ? "Exit Guest" : "अतिथि बाहिर")}
                  </span>
                  <span className="sm:hidden">
                    {isAuthenticated
                      ? (language === "english" ? "Out" : "बाहिर")
                      : (language === "english" ? "Exit" : "बाहिर")}
                  </span>
                </Button>
              )}
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <p className="text-slate-600 text-sm sm:text-base">
              {language === "english"
                ? "Select a practice test below to start your preparation. Your progress will be automatically saved and you can continue where you left off."
                : "तलबाट अभ्यास परीक्षा छानेर आफ्नो तयारी सुरु गर्नुहोस्। तपाईंको प्रगति स्वचालित रूपमा सुरक्षित हुनेछ।"}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 relative z-10">
        {Object.entries(testsBySubject)
          .sort(([a], [b]) => {
            // Define a preferred order for subjects
            const subjectOrder: Record<string, number> = {
              english: 1,
              nepali: 2,
              mathematics: 3,
              science: 4,
              social: 5,
              social_studies: 5,
              general: 99,
            }
            return (subjectOrder[a] || 50) - (subjectOrder[b] || 50)
          })
          .map(([subject, subjectTests]) => (
            <div key={subject} className="mb-8 sm:mb-12">
              {/* Subject Header */}
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="text-2xl sm:text-3xl">{getSubjectIcon(subject)}</div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800 capitalize flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" />
                    {getSubjectDisplayName(subject)} {language === "english" ? "Tests" : "परीक्षाहरू"}
                  </h2>
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
                          <div className="text-4xl sm:text-6xl transform rotate-12 translate-x-4 sm:translate-x-6 translate-y-6 sm:translate-y-8">
                            {getSubjectIcon(test.subject || "")}
                          </div>
                        </div>
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 pr-2">
                              <CardTitle className="text-lg sm:text-xl font-bold leading-tight">
                                {language === "english" ? test.title : (test.titleNepali || test.title)}
                              </CardTitle>
                            </div>
                            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 opacity-75 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                          </div>
                          {test.year && (
                            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                              {language === "english" ? "Year" : "वर्ष"} {test.year}
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
                              {test.totalMarks || 0} {language === "english" ? "marks" : "अंक"}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {test.duration || 180} {language === "english" ? "min" : "मिनेट"}
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
                                  <p className="text-sm font-semibold text-emerald-800">
                                    ✅ {language === "english" ? "Completed" : "पूरा भयो"}
                                  </p>
                                  <p className="text-xs text-emerald-600">
                                    {language === "english" ? "Score" : "अंक"}: {progress.lastAttempt.totalScore}/{progress.lastAttempt.maxScore}
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
                                    {language === "english" ? "Grade" : "ग्रेड"} {progress.lastAttempt.grade}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          )}
                          {progress.hasProgress && !progress.completed && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 h-full flex items-center">
                              <div className="flex items-center justify-between w-full">
                                <div>
                                  <p className="text-sm font-semibold text-blue-800">
                                    📝 {language === "english" ? "In Progress" : "प्रगतिमा छ"}
                                  </p>
                                  <p className="text-xs text-blue-600">
                                    {progress.answeredCount} {language === "english" ? "questions answered" : "प्रश्नहरू उत्तर दिइयो"}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="text-xl sm:text-2xl font-bold text-blue-800">
                                    {progress.percentage}%
                                  </div>
                                  <p className="text-xs text-blue-600">
                                    {language === "english" ? "estimated" : "अनुमानित"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          {!progress.hasProgress && !progress.completed && (
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4 h-full flex items-center justify-center">
                              <div className="text-center">
                                <p className="text-sm font-semibold text-slate-600">
                                  🚀 {language === "english" ? "Ready to Start" : "सुरु गर्न तयार"}
                                </p>
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
                            ? (language === "english" ? "🔄 Retake Test" : "🔄 फेरि परीक्षा दिनुहोस्")
                            : progress.hasProgress
                              ? (language === "english" ? "▶️ Continue Test" : "▶️ जारी राख्नुहोस्")
                              : (language === "english" ? "🚀 Start Test" : "🚀 परीक्षा सुरु गर्नुहोस्")}
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
      </div>
    </div >
  )
}
