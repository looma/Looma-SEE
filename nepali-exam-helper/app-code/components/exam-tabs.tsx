"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, Clock, Trophy, ArrowRight, AlertCircle, Save } from "lucide-react"
import { GroupA } from "@/components/group-a"
import { FreeResponseGroup } from "@/components/free-response-group"
import { ResultsCard, type Result } from "@/components/results-card"
import { useQuestions } from "@/lib/use-questions"
import { loadStudentProgress, saveStudentProgress, saveAttemptHistory } from "@/lib/storage"

interface ExamTabsProps {
  studentId: string
  testId: string
  onProgressUpdate: () => void
}

export function ExamTabs({ studentId, testId, onProgressUpdate }: ExamTabsProps) {
  const { questions, loading, error } = useQuestions(testId)
  const [answersA, setAnswersA] = useState<Record<string, string>>({})
  const [answersB, setAnswersB] = useState<Record<string, string>>({})
  const [answersC, setAnswersC] = useState<Record<string, string>>({})
  const [answersD, setAnswersD] = useState<Record<string, string>>({})
  const [results, setResults] = useState<Result | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("group-a")
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load progress when component mounts or testId changes (only on client)
  useEffect(() => {
    if (!isClient || !studentId || !testId) {
      console.log("Skipping progress load - not ready yet")
      return
    }

    console.log(`🔄 Loading progress for ${studentId}_${testId}`)
    const storageKey = `${studentId}_${testId}`

    try {
      const progress = loadStudentProgress(storageKey)

      if (progress) {
        console.log("✅ Found existing progress:", {
          answersA: Object.keys(progress.answersA || {}).length,
          answersB: Object.keys(progress.answersB || {}).length,
          answersC: Object.keys(progress.answersC || {}).length,
          answersD: Object.keys(progress.answersD || {}).length,
          currentTab: progress.currentTab,
          lastUpdated: progress.lastUpdated,
        })

        // Set all answers at once to avoid triggering multiple saves
        setAnswersA(progress.answersA || {})
        setAnswersB(progress.answersB || {})
        setAnswersC(progress.answersC || {})
        setAnswersD(progress.answersD || {})
        setActiveTab(progress.currentTab || "group-a")
        setLastSaved(new Date(progress.lastUpdated))

        console.log("✅ Progress loaded successfully")
      } else {
        console.log("ℹ️  No existing progress found, starting fresh")
        // Only reset if we don't already have answers loaded
        if (
          Object.keys(answersA).length === 0 &&
          Object.keys(answersB).length === 0 &&
          Object.keys(answersC).length === 0 &&
          Object.keys(answersD).length === 0
        ) {
          setAnswersA({})
          setAnswersB({})
          setAnswersC({})
          setAnswersD({})
          setActiveTab("group-a")
          setLastSaved(null)
        }
      }
      setResults(null)
    } catch (error) {
      console.error("❌ Error loading progress:", error)
    }
  }, [isClient, studentId, testId]) // Remove answer dependencies

  // Save progress whenever answers change (but not on initial load)
  useEffect(() => {
    if (!isClient || !studentId || !testId) return

    // Don't save if we're still loading initial state
    const hasAnyAnswers =
      Object.keys(answersA).length > 0 ||
      Object.keys(answersB).length > 0 ||
      Object.keys(answersC).length > 0 ||
      Object.keys(answersD).length > 0

    if (!hasAnyAnswers && !lastSaved) {
      console.log("⏭️  Skipping save - no answers yet and no previous save")
      return
    }

    const storageKey = `${studentId}_${testId}`
    const existingProgress = loadStudentProgress(storageKey)

    const progressData = {
      studentId,
      testId,
      answersA,
      answersB,
      answersC,
      answersD,
      currentTab: activeTab,
      attempts: existingProgress?.attempts || [],
    }

    console.log("💾 Saving progress:", {
      key: storageKey,
      answersA: Object.keys(answersA).length,
      answersB: Object.keys(answersB).length,
      answersC: Object.keys(answersC).length,
      answersD: Object.keys(answersD).length,
      currentTab: activeTab,
    })

    saveStudentProgress(studentId, progressData)
    setLastSaved(new Date())
    onProgressUpdate()
  }, [isClient, answersA, answersB, answersC, answersD, activeTab, studentId, testId, onProgressUpdate])

  if (!testId) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/20 text-center">
        <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-slate-800 mb-2">No Test Selected</h3>
        <h4 className="text-xl font-medium text-slate-700 mb-4">कुनै परीक्षा छानिएको छैन</h4>
        <p className="text-slate-600">Please select a practice test from the dropdown above.</p>
      </div>
    )
  }

  const isEmptyTest =
    questions &&
    questions.groupA.length === 0 &&
    questions.groupB.length === 0 &&
    questions.groupC.length === 0 &&
    questions.groupD.length === 0

  const progressA = questions?.groupA.length ? (Object.keys(answersA).length / questions.groupA.length) * 100 : 0
  const progressB = questions?.groupB.length
    ? (Object.keys(answersB).filter((k) => answersB[k]?.trim()).length / questions.groupB.length) * 100
    : 0
  const progressC = questions?.groupC.length
    ? (Object.keys(answersC).filter((k) => answersC[k]?.trim()).length / questions.groupC.length) * 100
    : 0
  const progressD = questions?.groupD.length
    ? (Object.keys(answersD).filter((k) => answersD[k]?.trim()).length / questions.groupD.length) * 100
    : 0

  const totalAnswered =
    Object.keys(answersA).length +
    Object.keys(answersB).filter((k) => answersB[k]?.trim()).length +
    Object.keys(answersC).filter((k) => answersC[k]?.trim()).length +
    Object.keys(answersD).filter((k) => answersD[k]?.trim()).length

  const totalQuestions =
    (questions?.groupA?.length || 0) +
    (questions?.groupB?.length || 0) +
    (questions?.groupC?.length || 0) +
    (questions?.groupD?.length || 0)

  const overallProgress = totalQuestions ? (totalAnswered / totalQuestions) * 100 : 0

  const handleAnswerAChange = (id: string, answer: string) => setAnswersA((prev) => ({ ...prev, [id]: answer }))

  const handleFreeResponseChange = (group: "B" | "C" | "D", id: string, answer: string) => {
    const setter = group === "B" ? setAnswersB : group === "C" ? setAnswersC : setAnswersD
    setter((prev) => ({ ...prev, [id]: answer }))
  }

  const resetAllAnswers = () => {
    setAnswersA({})
    setAnswersB({})
    setAnswersC({})
    setAnswersD({})
    setResults(null)
    setActiveTab("group-a")

    if (isClient) {
      const storageKey = `${studentId}_${testId}`
      const progress = loadStudentProgress(storageKey)
      if (progress) {
        saveStudentProgress(studentId, {
          ...progress,
          testId,
          answersA: {},
          answersB: {},
          answersC: {},
          answersD: {},
          currentTab: "group-a",
        })
        onProgressUpdate()
      }
    }
  }

  const goToNextSection = () => {
    const order = ["group-a", "group-b", "group-c", "group-d"]
    const idx = order.indexOf(activeTab)
    if (idx < order.length - 1) setActiveTab(order[idx + 1])
  }

  const formatSavedTime = (date: Date) => {
    const timeString = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
    return `${timeString}`
  }

  const handleSubmit = async () => {
    if (isEmptyTest) return
    setIsSubmitting(true)
    setResults(null)

    // Grade Group A
    let scoreA = 0
    questions?.groupA?.forEach((q) => {
      if (answersA[q.id] === q.correctAnswer) scoreA += q.marks
    })

    // Prepare free-response grading payloads with sample answers
    const free = [
      ...Object.entries(answersB).map(([id, ans]) => ({
        id,
        ans,
        group: "B" as const,
        q: questions?.groupB.find((x) => x.id === id),
      })),
      ...Object.entries(answersC).map(([id, ans]) => ({
        id,
        ans,
        group: "C" as const,
        q: questions?.groupC.find((x) => x.id === id),
      })),
      ...Object.entries(answersD).map(([id, ans]) => ({
        id,
        ans,
        group: "D" as const,
        q: questions?.groupD.find((x) => x.id === id),
      })),
    ].filter((it) => it.ans.trim() !== "" && it.q)

    const graded = await Promise.all(
      free.map(async ({ id, ans, q }) => {
        try {
          const res = await fetch("/api/grade", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question: q!.english,
              answer: ans,
              marks: q!.marks,
              sampleAnswer: (q as any).sampleAnswer, // Pass the sample answer for comparison
            }),
          })
          if (!res.ok) throw new Error("Grading failed")
          const data = await res.json()
          return { id, ...data, question: q!.english, studentAnswer: ans }
        } catch {
          return { id, score: 0, feedback: "Error grading this answer.", question: q!.english, studentAnswer: ans }
        }
      }),
    )

    const feedbackB = graded.filter((r) => questions?.groupB?.some((q) => q.id === r.id))
    const feedbackC = graded.filter((r) => questions?.groupC?.some((q) => q.id === r.id))
    const feedbackD = graded.filter((r) => questions?.groupD?.some((q) => q.id === r.id))

    const sB = feedbackB.reduce((a, r) => a + r.score, 0)
    const sC = feedbackC.reduce((a, r) => a + r.score, 0)
    const sD = feedbackD.reduce((a, r) => a + r.score, 0)
    const total = scoreA + sB + sC + sD

    const maxA = questions?.groupA?.reduce((a, q) => a + q.marks, 0) || 0
    const maxB = questions?.groupB?.reduce((a, q) => a + q.marks, 0) || 0
    const maxC = questions?.groupC?.reduce((a, q) => a + q.marks, 0) || 0
    const maxD = questions?.groupD?.reduce((a, q) => a + q.marks, 0) || 0
    const maxTotal = maxA + maxB + maxC + maxD
    const pct = maxTotal ? Math.round((total / maxTotal) * 100) : 0
    const grade = (p: number) =>
      p >= 90
        ? "A+"
        : p >= 80
          ? "A"
          : p >= 70
            ? "B+"
            : p >= 60
              ? "B"
              : p >= 50
                ? "C+"
                : p >= 40
                  ? "C"
                  : p >= 32
                    ? "D"
                    : "E"

    saveAttemptHistory(studentId, testId, {
      scoreA,
      scoreB: sB,
      scoreC: sC,
      scoreD: sD,
      totalScore: total,
      maxScore: maxTotal,
      percentage: pct,
      grade: grade(pct),
    })

    setResults({ scoreA, feedbackB, feedbackC, feedbackD, answersA })
    setIsSubmitting(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p>Loading questions... / प्रश्नहरू लोड गर्दै...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-600">
        <p>Error loading questions: {error}</p>
        <p>प्रश्नहरू लोड गर्न समस्या भयो</p>
      </div>
    )
  }

  if (!questions) return <div>No questions available</div>

  if (isEmptyTest) {
    return (
      <div>
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/20 text-center">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Test Coming Soon</h3>
          <h4 className="text-xl font-medium text-slate-700 mb-4">परीक्षा छिट्टै आउँदैछ</h4>
          <p className="text-slate-600">This practice test is being prepared.</p>
        </div>
      </div>
    )
  }

  if (results) {
    return <ResultsCard results={results} onRetake={resetAllAnswers} studentId={studentId} testId={testId} />
  }

  return (
    <div>
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <h3 className="font-semibold text-slate-800">Overall Progress / समग्र प्रगति</h3>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              {totalAnswered}/{totalQuestions} answered
            </Badge>
            {lastSaved && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <Save className="h-3 w-3" />
                <span>Saved {formatSavedTime(lastSaved)}</span>
              </div>
            )}
          </div>
        </div>
        <Progress value={overallProgress} className="h-3 mb-2" />
        <p className="text-sm text-slate-600">{Math.round(overallProgress)}% complete</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 gap-1 bg-transparent rounded-none p-0 mb-0">
          <TabsTrigger
            value="group-a"
            className="relative flex items-center justify-center px-3 py-3 rounded-t-lg leading-none text-sm sm:text-base
             data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:border-b-0
             data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-amber-500
             data-[state=inactive]:bg-white data-[state=inactive]:border data-[state=inactive]:border-gray-200
             data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-50"
          >
            <span className="whitespace-nowrap">Group 'A' / समूह 'क'</span>
            {progressA === 100 && (
              <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-green-500 bg-white rounded-full shadow" />
            )}
          </TabsTrigger>

          <TabsTrigger
            value="group-b"
            className="relative flex items-center justify-center px-3 py-3 rounded-t-lg leading-none text-sm sm:text-base
             data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:border-b-0
             data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600
             data-[state=inactive]:bg-white data-[state=inactive]:border data-[state=inactive]:border-gray-200
             data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-50"
          >
            <span className="whitespace-nowrap">Group 'B' / समूह 'ख'</span>
            {progressB === 100 && (
              <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-green-500 bg-white rounded-full shadow" />
            )}
          </TabsTrigger>

          <TabsTrigger
            value="group-c"
            className="relative flex items-center justify-center px-3 py-3 rounded-t-lg leading-none text-sm sm:text-base
             data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:border-b-0
             data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600
             data-[state=inactive]:bg-white data-[state=inactive]:border data-[state=inactive]:border-gray-200
             data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-50"
          >
            <span className="whitespace-nowrap">Group 'C' / समूह 'ग'</span>
            {progressC === 100 && (
              <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-green-500 bg-white rounded-full shadow" />
            )}
          </TabsTrigger>

          <TabsTrigger
            value="group-d"
            className="relative flex items-center justify-center px-3 py-3 rounded-t-lg leading-none text-sm sm:text-base
             data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:border-b-0
             data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600
             data-[state=inactive]:bg-white data-[state=inactive]:border data-[state=inactive]:border-gray-200
             data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-50"
          >
            <span className="whitespace-nowrap">Group 'D' / समूह 'घ'</span>
            {progressD === 100 && (
              <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-green-500 bg-white rounded-full shadow" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="group-a" className="pt-0 mt-0">
          <div className="rounded-t-none">
            <GroupA
              questions={questions.groupA}
              answers={answersA}
              onAnswerChange={handleAnswerAChange}
              progress={progressA}
            />
            {progressA === 100 && questions.groupB.length > 0 && (
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={goToNextSection}
                  size="lg"
                  className="bg-gradient-to-r from-yellow-600 to-green-600 text-white"
                >
                  Next Section: Group B / अर्को खण्ड: समूह ख <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="group-b" className="pt-0 mt-0">
          <div className="rounded-t-none">
            <FreeResponseGroup
              group="B"
              questions={questions.groupB}
              answers={answersB}
              onAnswerChange={handleFreeResponseChange}
              progress={progressB}
            />
            {progressB === 100 && questions.groupC.length > 0 && (
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={goToNextSection}
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-purple-600 text-white"
                >
                  Next Section: Group C / अर्को खण्ड: समूह ग <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="group-c" className="pt-0 mt-0">
          <div className="rounded-t-none">
            <FreeResponseGroup
              group="C"
              questions={questions.groupC}
              answers={answersC}
              onAnswerChange={handleFreeResponseChange}
              progress={progressC}
            />
            {progressC === 100 && questions.groupD.length > 0 && (
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={goToNextSection}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-orange-600 text-white"
                >
                  Next Section: Group D / अर्को खण्ड: समूह घ <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="group-d" className="pt-0 mt-0">
          <div className="rounded-t-none">
            <FreeResponseGroup
              group="D"
              questions={questions.groupD}
              answers={answersD}
              onAnswerChange={handleFreeResponseChange}
              progress={progressD}
            />
          </div>
        </TabsContent>

        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || totalAnswered === 0}
            size="lg"
            className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white px-8 py-3 rounded-xl disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Grading... / मूल्याङ्कन गर्दै...
              </>
            ) : (
              <>
                <Trophy className="mr-2 h-5 w-5" /> Submit & See Results / पेश गर्नुहोस् र परिणाम हेर्नुहोस्
              </>
            )}
          </Button>
        </div>
      </Tabs>
    </div>
  )
}
