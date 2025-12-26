"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import {
  MessageSquareQuote,
  Trophy,
  Star,
  RefreshCw,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  History,
  Lightbulb,
  RotateCcw,
  Edit3,
  BookOpen,
} from "lucide-react"
import { useQuestions } from "@/lib/use-questions"
import { loadStudentProgress } from "@/lib/storage"
import { MathText } from "./math-text"
import type { GroupAQuestion } from "@/lib/use-questions"

interface GradedFeedback {
  id: string
  score: number
  feedback: string
  question: string
  studentAnswer: string
}

export interface Result {
  scoreA: number
  feedbackB: GradedFeedback[]
  feedbackC: GradedFeedback[]
  feedbackD: GradedFeedback[]
  answersA: Record<string, string>
  englishFeedback?: GradedFeedback[]
  socialStudiesFeedback?: any[]
  nepaliFeedback?: any[]
  mathFeedback?: GradedFeedback[]
}

interface ResultsCardProps {
  results: Result
  onRetake: () => void
  onEditAnswers: () => void
  onBackToTestSelection: () => void
  studentId: string
  testId: string
}

export function ResultsCard({
  results,
  onRetake,
  onEditAnswers,
  onBackToTestSelection,
  studentId,
  testId,
}: ResultsCardProps) {
  const { questions } = useQuestions(testId)
  const progress = loadStudentProgress(`${studentId}_${testId}`)
  const answers = progress?.answers || {}

  // Strip English text in parentheses from Nepali strings
  // e.g., "यो हावाभन्दा गह्रौं हुन्छ (It is heavier than air)" -> "यो हावाभन्दा गह्रौं हुन्छ"
  const cleanNepaliText = (text: string) => {
    if (!text) return text
    return text.replace(/\s*\([0-9A-Za-z][^)]*\)\s*$/g, '').trim()
  }

  if (!questions) return <div>Loading...</div>

  // Check if this is an English test
  const isEnglishTest = questions.englishQuestions && questions.englishQuestions.length > 0

  // Check if this is a Social Studies test
  const isSocialStudiesTest = questions.socialStudiesGroups && questions.socialStudiesGroups.length > 0

  // Check if this is a Nepali test
  const isNepaliTest = questions.nepaliQuestions && questions.nepaliQuestions.length > 0

  // Check if this is a Math test
  const isMathTest = questions.mathQuestions && questions.mathQuestions.length > 0

  let scoreB, scoreC, scoreD, totalScore, maxScoreA, maxScoreB, maxScoreC, maxScoreD, maxTotalScore

  if (isNepaliTest) {
    // Nepali test format
    scoreB = 0
    scoreC = 0
    scoreD = 0
    totalScore = results.nepaliFeedback?.reduce((sum: number, f: any) => sum + (f.score || 0), 0) || results.scoreA || 0

    maxScoreA = results.nepaliFeedback?.reduce((sum: number, f: any) => sum + (f.maxScore || 0), 0) ||
      questions.nepaliQuestions.reduce((acc: number, q: any) => acc + (q.marks || 5), 0)
    maxScoreB = 0
    maxScoreC = 0
    maxScoreD = 0
    maxTotalScore = maxScoreA
  } else if (isSocialStudiesTest) {
    // Social Studies test format
    scoreB = 0
    scoreC = 0
    scoreD = 0
    totalScore = results.scoreA || 0

    maxScoreA = questions.socialStudiesGroups.reduce((acc: number, group: any) => {
      return acc + (group.questions?.reduce((qAcc: number, q: any) => qAcc + q.marks, 0) || 0)
    }, 0)
    maxScoreB = 0
    maxScoreC = 0
    maxScoreD = 0
    maxTotalScore = maxScoreA
  } else if (isEnglishTest) {
    // English test format - use same structure as Science tests
    scoreB = 0
    scoreC = 0
    scoreD = 0

    // Use AI grading results from feedbackA (same as Science tests)
    totalScore = results.scoreA || 0

    maxScoreA = questions.englishQuestions.reduce((acc, q) => acc + q.marks, 0)
    maxScoreB = 0
    maxScoreC = 0
    maxScoreD = 0
    maxTotalScore = maxScoreA
  } else if (isMathTest) {
    // Math test format
    scoreB = 0
    scoreC = 0
    scoreD = 0
    totalScore = results.mathFeedback?.reduce((sum: number, f: any) => sum + (f.score || 0), 0) || results.scoreA || 0

    // Calculate max score from all sub-questions
    maxScoreA = questions.mathQuestions.reduce((acc: number, q: any) =>
      acc + q.sub_questions.reduce((subAcc: number, sq: any) => subAcc + 5, 0), 0) // Assume 5 marks per sub-question
    maxScoreB = 0
    maxScoreC = 0
    maxScoreD = 0
    maxTotalScore = maxScoreA
  } else {
    // Science test format
    scoreB = results.feedbackB.reduce((acc, r) => acc + r.score, 0)
    scoreC = results.feedbackC.reduce((acc, r) => acc + r.score, 0)
    scoreD = results.feedbackD.reduce((acc, r) => acc + r.score, 0)
    totalScore = results.scoreA + scoreB + scoreC + scoreD

    maxScoreA = questions.groupA.reduce((acc, q) => acc + q.marks, 0)
    maxScoreB = questions.groupB.reduce((acc, q) => acc + q.marks, 0)
    maxScoreC = questions.groupC.reduce((acc, q) => acc + q.marks, 0)
    maxScoreD = questions.groupD.reduce((acc, q) => acc + q.marks, 0)
    maxTotalScore = maxScoreA + maxScoreB + maxScoreC + maxScoreD
  }

  const percentage = Math.round((totalScore / maxTotalScore) * 100)
  const getGrade = (p: number) =>
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
  const grade = getGrade(percentage)

  const attempts = progress?.attempts || []

  const renderMultipleChoiceSection = () => {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 mb-4">
          <h3 className="text-xl font-semibold text-slate-700">Group 'A' - Multiple Choice Review</h3>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-800">
              {results.scoreA}/{maxScoreA}
            </p>
            <p className="text-sm text-slate-600">समूह 'क' - बहुविकल्पीय</p>
          </div>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {questions.groupA.map((question: GroupAQuestion, index: number) => {
            const userAnswer = results.answersA[question.id]
            const isCorrect = userAnswer === question.correctAnswer
            const correctOption = question.options.find((o) => o.id === question.correctAnswer)
            const userOption = question.options.find((o) => o.id === userAnswer)

            return (
              <AccordionItem
                value={`mcq-${index}`}
                key={question.id}
                className="border border-slate-200 rounded-lg mb-2 overflow-hidden"
              >
                <AccordionTrigger className="hover:bg-slate-50 px-4 py-3 text-left">
                  <div className="flex justify-between w-full items-center min-h-[48px]">
                    <span className="text-left font-medium pr-4 flex-1 leading-tight">
                      {index + 1}.{" "}
                      {question.english.length > 80 ? `${question.english.substring(0, 80)}...` : question.english}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <Badge
                        variant={isCorrect ? "default" : "destructive"}
                        className={isCorrect ? "bg-green-500 text-white hover:bg-green-600" : ""}
                      >
                        {isCorrect ? "1/1" : "0/1"}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    {/* Question in Nepali with proper spacing */}
                    <div className="text-slate-600 mb-3 leading-relaxed"><MathText text={cleanNepaliText(question.nepali)} /></div>

                    {/* User's Answer Section with better formatting */}
                    <div
                      className={`p-3 rounded-lg ${userAnswer
                        ? isCorrect
                          ? "bg-green-50 border-l-4 border-green-500"
                          : "bg-red-50 border-l-4 border-red-500"
                        : "bg-slate-50 border-l-4 border-slate-400"
                        }`}
                    >
                      <p className="font-semibold text-slate-800 mb-2">Your Answer / तपाईंको उत्तर:</p>
                      {userAnswer ? (
                        <div className="space-y-1">
                          <p className="text-slate-700 font-medium">
                            ({userAnswer}) <MathText text={userOption?.english || ""} />
                          </p>
                          {userOption?.nepali && userOption.nepali !== userOption.english && (
                            <p className="text-slate-700">
                              <MathText text={cleanNepaliText(userOption.nepali)} />
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-slate-500 italic">No answer provided / कुनै उत्तर प्रदान गरिएको छैन</p>
                      )}
                    </div>

                    {/* Correct Answer Section - only show if incorrect */}
                    {!isCorrect && (
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg">
                        <p className="font-semibold text-blue-800 mb-2">Correct Answer / सही उत्तर:</p>
                        <div className="space-y-1">
                          <p className="text-blue-700 font-medium">
                            ({question.correctAnswer}) <MathText text={correctOption?.english || ""} />
                          </p>
                          {correctOption?.nepali && correctOption.nepali !== correctOption.english && (
                            <p className="text-blue-700">
                              <MathText text={cleanNepaliText(correctOption.nepali)} />
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Explanation Section with better formatting */}
                    {question.explanation && (
                      <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg">
                        <div className="flex items-start gap-3">
                          <Lightbulb className="h-5 w-5 text-amber-600 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-semibold text-amber-800 mb-2">Explanation / व्याख्या:</p>
                            <div className="text-amber-700 leading-relaxed whitespace-pre-line"><MathText text={question.explanation || ""} /></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>
    )
  }

  const renderAttemptHistory = () => {
    if ((attempts || []).length <= 1) return null

    // Filter out corrupted attempts (invalid data)
    const validAttempts = attempts.filter(attempt =>
      attempt.maxScore > 0 && typeof attempt.totalScore === 'number' && typeof attempt.percentage === 'number'
    )

    // Don't show the section if no valid attempts
    if (validAttempts.length <= 1) return null

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 mb-4">
          <h3 className="text-xl font-semibold text-slate-700 flex items-center gap-2">
            <History className="h-5 w-5" /> Previous Attempts / अघिल्लो प्रयासहरू
          </h3>
          <Badge variant="secondary">{validAttempts.length} attempts</Badge>
        </div>
        <div className="grid gap-3">
          {[...validAttempts]
            .slice(-5)
            .reverse()
            .map((attempt, idx) => (
              <div
                key={attempt.id}
                className="bg-white p-4 rounded-lg border border-slate-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <Badge variant={idx === 0 ? "default" : "secondary"} className={idx === 0 ? "bg-green-100 text-green-800 border-green-200" : ""}>
                    {idx === 0 ? "Latest" : `Attempt ${validAttempts.length - idx}`}
                  </Badge>
                  <div className="text-sm text-slate-600">
                    {new Date(attempt.timestamp).toLocaleDateString()} at{" "}
                    {new Date(attempt.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold">
                      {attempt.totalScore}/{attempt.maxScore}
                    </div>
                    <div className="text-sm text-slate-600">{attempt.percentage}%</div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      attempt.grade === "A+" ? "bg-green-100 text-green-800 border-green-200" :
                        attempt.grade === "A" ? "bg-green-100 text-green-800 border-green-200" :
                          attempt.grade === "B+" ? "bg-blue-100 text-blue-800 border-blue-200" :
                            attempt.grade === "B" ? "bg-blue-100 text-blue-800 border-blue-200" :
                              attempt.grade === "C+" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                                attempt.grade === "C" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                                  attempt.grade === "D" ? "bg-orange-100 text-orange-800 border-orange-200" :
                                    "bg-red-100 text-red-800 border-red-200"
                    }
                  >
                    {attempt.grade}
                  </Badge>
                </div>
              </div>
            ))}
        </div>
      </div>
    )
  }

  const section = (
    title: string,
    titleNp: string,
    feedbacks: GradedFeedback[],
    maxScore: number,
    color: string,
    groupQuestions: any[],
  ) => {
    const score = feedbacks.reduce((acc, r) => acc + r.score, 0)
    if (!feedbacks.length) return null

    // Create a map of feedback by question ID for quick lookup
    const feedbackMap = new Map(feedbacks.map((fb) => [fb.id, fb]))

    return (
      <div>
        <div className={`flex items-center justify-between p-4 rounded-lg ${color} mb-4`}>
          <h3 className="text-xl font-semibold text-slate-700">{title}</h3>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-800">
              {score}/{maxScore}
            </p>
            <p className="text-sm text-slate-600">{titleNp}</p>
          </div>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {groupQuestions.map((question, index) => {
            const fb = feedbackMap.get(question.id)
            if (!fb) return null // Skip if no feedback for this question

            return (
              <AccordionItem
                value={`item-${question.id}`}
                key={question.id}
                className="border border-slate-200 rounded-lg mb-2 overflow-hidden"
              >
                <AccordionTrigger className="hover:bg-slate-50 px-4 py-3 text-left">
                  <div className="flex justify-between w-full items-center min-h-[48px]">
                    <span className="text-left font-medium pr-4 flex-1 leading-tight">
                      {index + 1}.{" "}
                      {question.english.length > 80 ? `${question.english.substring(0, 80)}...` : question.english}
                    </span>
                    <Badge
                      className={`ml-4 flex-shrink-0 ${fb.score === question.marks
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : fb.score > 0
                          ? "bg-yellow-500 text-white hover:bg-yellow-600"
                          : "bg-red-500 text-white hover:bg-red-600"
                        }`}
                    >
                      {fb.score}/{question.marks}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    <div className="text-slate-600 mb-3"><MathText text={cleanNepaliText(question.nepali)} /></div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-slate-600">
                        <span className="font-semibold text-slate-800">Your Answer / तपाईंको उत्तर:</span>
                      </p>
                      <p className="mt-1 text-slate-700 whitespace-pre-wrap break-words">
                        {typeof fb.studentAnswer === "object"
                          ? Object.entries(fb.studentAnswer as Record<string, string>)
                            .filter(([key]) => !key.startsWith("selected"))
                            .map(([key, value]) => `${key} → ${value}`)
                            .join("\n") || "No answer provided"
                          : fb.studentAnswer || "No answer provided"}
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                      <div className="flex items-start gap-3">
                        <MessageSquareQuote className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-blue-800">Feedback / प्रतिक्रिया:</p>
                          <div className="text-blue-700 mt-1 leading-relaxed whitespace-pre-wrap break-words"><MathText text={fb.feedback} /></div>
                        </div>
                      </div>
                    </div>
                    {/* Show Sample Answer for Groups B, C, D questions */}
                    {question.sampleAnswer && (
                      <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
                        <div className="flex items-start gap-3">
                          <Lightbulb className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-indigo-800">Sample Answer / नमूना उत्तर:</p>
                            <div className="text-indigo-700 mt-1 text-sm leading-relaxed whitespace-pre-wrap break-words">
                              <MathText text={question.sampleAnswer} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50" suppressHydrationWarning>
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="w-full bg-white/95 backdrop-blur-sm shadow-2xl border border-white/20 overflow-hidden">
            <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-4 left-4">
                  <Star className="h-8 w-8 animate-pulse" />
                </div>
                <div className="absolute top-4 right-4">
                  <Trophy className="h-8 w-8 animate-bounce" />
                </div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <TrendingUp className="h-6 w-6 animate-pulse" />
                </div>
              </div>

              <div className="relative z-10">
                <CardTitle className="text-4xl font-bold mb-2">Your Results / तपाईंको परिणाम</CardTitle>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <CardDescription className="text-6xl font-bold text-white">
                    {totalScore} / {maxTotalScore}
                  </CardDescription>
                  <div className="px-4 py-2 rounded-full bg-white text-slate-800 font-bold text-2xl">{grade}</div>
                </div>
                <p className="text-xl text-blue-100 mb-2">{percentage}% Score</p>
                <p className="text-lg text-blue-100">Great effort! Here's your detailed breakdown.</p>
                <p className="text-blue-200">राम्रो प्रयास! यहाँ तपाईंको विस्तृत विवरण छ।</p>
              </div>
            </CardHeader>

            <CardContent className="p-8">
              {/* Change Test Button */}
              <div className="mb-6 flex justify-center">
                <Button
                  onClick={onBackToTestSelection}
                  size="lg"
                  variant="outline"
                  className="text-amber-700 hover:text-amber-800 bg-amber-50 border-amber-300 hover:bg-amber-100 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Change Test / परीक्षा परिवर्तन गर्नुहोस्
                </Button>
              </div>

              {renderAttemptHistory()}

              {isSocialStudiesTest ? (
                // Social Studies test format
                <div className="mb-8">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-amber-50 mb-4">
                    <h3 className="text-xl font-semibold text-amber-700 flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      सामाजिक अध्ययन प्रश्नहरू / Social Studies Questions
                    </h3>
                    <Badge variant="secondary">{results.socialStudiesFeedback?.length || 0} प्रश्नहरू</Badge>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-amber-200 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-lg font-semibold text-amber-800">
                        कुल अंक: {totalScore}/{maxTotalScore}
                      </div>
                      <div className="text-2xl font-bold text-amber-600">{percentage}%</div>
                    </div>
                    <div className="text-sm text-amber-600">
                      सबै प्रश्नहरू AI द्वारा ग्रेड गरिएको छ। नक्सा प्रश्नहरूलाई म्यानुअल ग्रेडिङ आवश्यक छ।
                    </div>
                  </div>

                  {/* Group-based feedback display */}
                  {questions.socialStudiesGroups.map((group: any, groupIndex: number) => {
                    const groupFeedback = (results.socialStudiesFeedback || []).filter(
                      (fb: any) => fb.group === groupIndex
                    )
                    if (groupFeedback.length === 0) return null

                    const groupScore = groupFeedback.reduce((sum: number, fb: any) => sum + fb.score, 0)
                    const groupMaxScore = group.questions?.reduce((sum: number, q: any) => sum + q.marks, 0) || 0
                    const groupColors = ["bg-blue-50 border-blue-200", "bg-green-50 border-green-200", "bg-purple-50 border-purple-200"]
                    const groupBgColor = groupColors[groupIndex % groupColors.length]

                    return (
                      <div key={groupIndex} className="mb-6">
                        <div className={`flex items-center justify-between p-4 rounded-lg ${groupBgColor} mb-4`}>
                          <h3 className="text-xl font-semibold text-slate-700">{group.groupName}</h3>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-slate-800">{groupScore}/{groupMaxScore}</p>
                          </div>
                        </div>
                        <Accordion type="single" collapsible className="w-full">
                          {groupFeedback.map((fb: any, idx: number) => {
                            // Find question by questionNumber (e.g., "१") or by matching index
                            const question = group.questions?.find((q: any) =>
                              q.questionNumber === fb.questionNumber ||
                              q.id === fb.id ||
                              group.questions?.indexOf(q) === idx
                            )
                            const isFullScore = fb.score === fb.marks
                            const isPartialScore = fb.score > 0 && fb.score < fb.marks

                            return (
                              <AccordionItem
                                value={`social-${groupIndex}-${idx}`}
                                key={fb.id}
                                className="border border-slate-200 rounded-lg mb-2 overflow-hidden"
                              >
                                <AccordionTrigger className="hover:bg-slate-50 px-4 py-3 text-left">
                                  <div className="flex justify-between w-full items-center min-h-[48px]">
                                    <span className="text-left font-medium pr-4 flex-1 leading-tight">
                                      {idx + 1}. {fb.question?.substring(0, 80) || "प्रश्न"}...
                                    </span>
                                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                      {isFullScore ? (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                      ) : isPartialScore ? (
                                        <div className="h-5 w-5 rounded-full border-2 border-yellow-500 bg-yellow-100 flex items-center justify-center">
                                          <span className="text-xs font-bold text-yellow-700">!</span>
                                        </div>
                                      ) : (
                                        <XCircle className="h-5 w-5 text-red-500" />
                                      )}
                                      <Badge
                                        className={`${isFullScore
                                          ? "bg-green-500 text-white"
                                          : isPartialScore
                                            ? "bg-yellow-500 text-white"
                                            : "bg-red-500 text-white"
                                          }`}
                                      >
                                        {fb.score}/{fb.marks}
                                      </Badge>
                                    </div>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-4">
                                  <div className="space-y-4">
                                    {/* Full question */}
                                    <div className="text-slate-700 mb-3">
                                      {typeof fb.question === "object"
                                        ? Object.entries(fb.question as Record<string, string>)
                                          .map(([key, value]) => `${key}: ${value}`)
                                          .join("\n")
                                        : fb.question || "प्रश्न"}
                                    </div>

                                    {/* Your Answer */}
                                    <div
                                      className={`p-3 rounded-lg ${isFullScore
                                        ? "bg-green-50 border-l-4 border-green-500"
                                        : isPartialScore
                                          ? "bg-yellow-50 border-l-4 border-yellow-500"
                                          : "bg-red-50 border-l-4 border-red-500"
                                        }`}
                                    >
                                      <p className="font-semibold text-slate-800 mb-1">तपाईंको उत्तर:</p>
                                      <p className="text-slate-700 whitespace-pre-wrap">
                                        {typeof fb.studentAnswer === "object"
                                          ? Object.entries(fb.studentAnswer as Record<string, string>)
                                            .filter(([key]) => !key.startsWith("selected"))
                                            .map(([key, value]) => `${key} → ${value}`)
                                            .join("\n") || "कुनै उत्तर प्रदान गरिएको छैन"
                                          : fb.studentAnswer || "कुनै उत्तर प्रदान गरिएको छैन"}
                                      </p>
                                    </div>

                                    {/* Feedback */}
                                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                                      <div className="flex items-start gap-3">
                                        <Lightbulb className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                                        <div className="flex-1">
                                          <p className="font-semibold text-blue-800 mb-1">प्रतिक्रिया:</p>
                                          <p className="text-blue-700 leading-relaxed whitespace-pre-wrap break-words">{fb.feedback}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Sample answer if available */}
                                    {question?.answerNepali && (
                                      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                                        <p className="font-semibold text-amber-800 mb-1">नमुना उत्तर / Sample Answer:</p>
                                        <p className="text-amber-700 leading-relaxed whitespace-pre-wrap">{question.answerNepali}</p>
                                      </div>
                                    )}

                                    {/* Explanation if available */}
                                    {question?.explanationNepali && (
                                      <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
                                        <div className="flex items-start gap-3">
                                          <Lightbulb className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                                          <div className="flex-1">
                                            <p className="font-semibold text-indigo-800 mb-1">व्याख्या / Explanation:</p>
                                            <p className="text-indigo-700 leading-relaxed text-sm whitespace-pre-wrap">{question.explanationNepali}</p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            )
                          })}
                        </Accordion>
                      </div>
                    )
                  })}
                </div>
              ) : isNepaliTest ? (
                // Nepali test format
                <div className="mb-8">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-orange-50 mb-4">
                    <h3 className="text-xl font-semibold text-orange-700 flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      नेपाली परीक्षा नतिजा / Nepali Test Results
                    </h3>
                    <Badge variant="secondary">{questions.nepaliQuestions.length} प्रश्नहरू</Badge>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-orange-200 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-lg font-semibold text-orange-800">
                        कुल अंक: {totalScore}/{maxTotalScore}
                      </div>
                      <div className="text-2xl font-bold text-orange-600">{percentage}%</div>
                    </div>
                    <div className="text-sm text-orange-600">
                      सबै प्रश्नहरू AI द्वारा ग्रेड गरिएको छ। केही प्रश्नहरू स्वत: ग्रेड गरिएको छ।
                    </div>
                  </div>

                  {/* Nepali question feedback */}
                  <Accordion type="single" collapsible className="w-full">
                    {(results.nepaliFeedback || []).map((fb: any, idx: number) => {
                      const isFullScore = fb.score >= fb.maxScore
                      const isPartialScore = fb.score > 0 && fb.score < fb.maxScore

                      // Find the original question for context
                      const originalQuestion = questions.nepaliQuestions.find(
                        (q: any) => `q${q.questionNumber || idx + 1}` === fb.id
                      )

                      // Get question type display name
                      const getTypeDisplayName = (type: string) => {
                        const typeNames: Record<string, string> = {
                          matching: "मिलान",
                          fill_in_the_blanks: "खाली ठाउँ भर्नुहोस्",
                          fill_in_the_blanks_choices: "खाली ठाउँ भर्नुहोस्",
                          short_answer: "छोटो उत्तर",
                          spelling_correction: "हिज्जे सुधार",
                          parts_of_speech: "शब्द भेद",
                          parts_of_speech_choices: "शब्द भेद",
                          word_formation: "शब्द निर्माण",
                          tense_change: "काल परिवर्तन",
                          grammar_choice: "व्याकरण विकल्प",
                          grammar_choices: "व्याकरण",
                          sentence_transformation: "वाक्य रूपान्तरण",
                          reading_comprehension: "पढाइ बुझाइ",
                          reading_comprehension_grammar: "व्याकरण पढाइ बुझाइ",
                          reading_comprehension_short: "छोटो पढाइ बुझाइ",
                          reading_comprehension_long: "लामो पढाइ बुझाइ",
                          unseen_passage: "अपठित गद्यांश",
                          free_writing: "स्वतन्त्र लेखन",
                          free_writing_choice: "स्वतन्त्र लेखन विकल्प",
                          functional_writing: "कार्यात्मक लेखन",
                          functional_writing_choice: "कार्यात्मक लेखन विकल्प",
                          note_taking: "टिप्पणी लेखन",
                          summarization: "सारांश",
                          literature_short_answer: "साहित्य छोटो उत्तर",
                          literature_argumentative: "साहित्य तर्कपूर्ण",
                          literature_explanation: "साहित्य व्याख्या",
                          literature_critical_analysis_choice: "समीक्षात्मक विश्लेषण",
                          literature_question: "साहित्य",
                          poem_question: "कविता",
                          essay: "निबन्ध",
                        }
                        return typeNames[type] || type
                      }

                      return (
                        <AccordionItem
                          value={`nepali-${idx}`}
                          key={fb.id}
                          className="border border-slate-200 rounded-lg mb-2 overflow-hidden"
                        >
                          <AccordionTrigger className="hover:bg-slate-50 px-4 py-3 text-left">
                            <div className="flex justify-between w-full items-center min-h-[48px]">
                              <span className="text-left font-medium pr-4 flex-1 leading-tight">
                                {idx + 1}. {fb.question?.substring(0, 80) || "प्रश्न"}...
                                <Badge variant="outline" className="ml-2 text-xs">{getTypeDisplayName(fb.type)}</Badge>
                              </span>
                              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                {isFullScore ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : isPartialScore ? (
                                  <div className="h-5 w-5 rounded-full border-2 border-yellow-500 bg-yellow-100 flex items-center justify-center">
                                    <span className="text-xs font-bold text-yellow-700">!</span>
                                  </div>
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-500" />
                                )}
                                <Badge
                                  variant={isFullScore ? "default" : isPartialScore ? "secondary" : "destructive"}
                                  className={`min-w-[60px] text-center ${isFullScore
                                    ? "bg-green-500 hover:bg-green-600"
                                    : isPartialScore
                                      ? "bg-yellow-500 text-yellow-900 hover:bg-yellow-600"
                                      : ""
                                    }`}
                                >
                                  {fb.score}/{fb.maxScore}
                                </Badge>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="space-y-4">
                              {/* Question */}
                              <div className="bg-slate-50 p-4 rounded-lg">
                                <p className="font-semibold text-slate-700 mb-2">प्रश्न:</p>
                                <p className="text-slate-700 whitespace-pre-wrap">
                                  {typeof fb.question === "object"
                                    ? Object.entries(fb.question as Record<string, string>)
                                      .map(([key, value]) => `${key}: ${value}`)
                                      .join("\n")
                                    : fb.question || "प्रश्न"}
                                </p>
                              </div>

                              {/* Student Answer */}
                              <div className="bg-slate-50 p-4 rounded-lg">
                                <p className="font-semibold text-slate-700 mb-2">तपाईंको उत्तर:</p>
                                <p className="text-slate-700 whitespace-pre-wrap">
                                  {typeof fb.studentAnswer === "object"
                                    ? Object.entries(fb.studentAnswer as Record<string, string>)
                                      .filter(([key]) => !key.startsWith("selected"))
                                      .map(([key, value]) => `${key} → ${value}`)
                                      .join("\n") || "कुनै उत्तर प्रदान गरिएको छैन"
                                    : fb.studentAnswer || "कुनै उत्तर प्रदान गरिएको छैन"}
                                </p>
                              </div>

                              {/* Feedback */}
                              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                                <div className="flex items-start gap-3">
                                  <Lightbulb className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                                  <div className="flex-1">
                                    <p className="font-semibold text-blue-800 mb-1">प्रतिक्रिया:</p>
                                    <p className="text-blue-700 leading-relaxed whitespace-pre-wrap break-words">{fb.feedback}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Sample answer if available */}
                              {(fb.sampleAnswer || originalQuestion?.sampleAnswer || originalQuestion?.correctAnswer) && (
                                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                                  <p className="font-semibold text-amber-800 mb-1">नमुना उत्तर / Sample Answer:</p>
                                  <p className="text-amber-700 leading-relaxed whitespace-pre-wrap">
                                    {typeof (fb.sampleAnswer || originalQuestion?.sampleAnswer || originalQuestion?.correctAnswer) === 'object'
                                      ? JSON.stringify(fb.sampleAnswer || originalQuestion?.sampleAnswer || originalQuestion?.correctAnswer, null, 2)
                                      : (fb.sampleAnswer || originalQuestion?.sampleAnswer || originalQuestion?.correctAnswer)}
                                  </p>
                                </div>
                              )}

                              {/* Explanation if available */}
                              {(fb.explanation || originalQuestion?.explanation) && (
                                <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
                                  <div className="flex items-start gap-3">
                                    <Lightbulb className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                                    <div className="flex-1">
                                      <p className="font-semibold text-indigo-800 mb-1">व्याख्या / Explanation:</p>
                                      <p className="text-indigo-700 leading-relaxed text-sm whitespace-pre-wrap">
                                        {fb.explanation || originalQuestion?.explanation}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )
                    })}
                  </Accordion>
                </div>
              ) : isMathTest ? (
                // Math test format
                <div className="mb-8">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 mb-4">
                    <h3 className="text-xl font-semibold text-blue-700 flex items-center gap-2">
                      📐 Math / गणित
                    </h3>
                    <Badge variant="secondary">{results.mathFeedback?.length || 0} sub-questions</Badge>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-lg font-semibold text-blue-800">
                        Total Score: {totalScore}/{maxTotalScore}
                      </div>
                      <div className="text-2xl font-bold text-blue-600">{percentage}%</div>
                    </div>
                    <div className="text-sm text-blue-600">
                      All sub-questions graded by AI. Review explanations for detailed solutions.
                    </div>
                  </div>

                  {/* Math question feedback */}
                  <Accordion type="single" collapsible className="w-full">
                    {(results.mathFeedback || []).map((fb: any, idx: number) => {
                      const isAIUnavailable = fb.score === null || fb.aiUnavailable
                      const isFullScore = !isAIUnavailable && fb.score >= fb.maxScore
                      const isPartialScore = !isAIUnavailable && fb.score > 0 && fb.score < fb.maxScore

                      return (
                        <AccordionItem key={fb.id || idx} value={fb.id || `math-${idx}`} className="border rounded-lg mb-2 overflow-hidden">
                          <AccordionTrigger className="px-4 py-3 hover:bg-blue-50">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-blue-600">
                                  Q{fb.questionNumber} ({fb.subLabel})
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {isAIUnavailable ? (
                                  <AlertCircle className="h-5 w-5 text-amber-500" />
                                ) : isFullScore ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : isPartialScore ? (
                                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-500" />
                                )}
                                <span className={`font-semibold ${isAIUnavailable ? "text-amber-600" : isFullScore ? "text-green-600" : isPartialScore ? "text-yellow-600" : "text-red-600"}`}>
                                  {isAIUnavailable ? "Pending Review" : `${fb.score}/${fb.maxScore}`}
                                </span>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="space-y-3">
                              {/* Question with MathText */}
                              <div className="text-slate-700 mb-3">
                                <MathText text={fb.question || "Question"} />
                              </div>

                              {/* Your Answer */}
                              <div
                                className={`p-3 rounded-lg ${isAIUnavailable
                                  ? "bg-amber-50 border-l-4 border-amber-500"
                                  : isFullScore
                                    ? "bg-green-50 border-l-4 border-green-500"
                                    : isPartialScore
                                      ? "bg-yellow-50 border-l-4 border-yellow-500"
                                      : "bg-red-50 border-l-4 border-red-500"
                                  }`}
                              >
                                <p className="font-semibold text-slate-800 mb-1">Your Answer:</p>
                                <p className="text-slate-700 whitespace-pre-wrap">
                                  <MathText text={fb.studentAnswer || "No answer provided"} />
                                </p>
                              </div>

                              {/* Feedback - only show if there's actual feedback */}
                              {fb.feedback && (
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                                  <div className="flex items-start gap-3">
                                    <Lightbulb className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                                    <div className="flex-1">
                                      <p className="font-semibold text-blue-800 mb-1">Feedback:</p>
                                      <p className="text-blue-700 leading-relaxed whitespace-pre-wrap break-words">{fb.feedback}</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Expected answer with MathText */}
                              {fb.expectedAnswer && (
                                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                                  <p className="font-semibold text-amber-800 mb-1">Expected Answer:</p>
                                  <p className="text-amber-700 leading-relaxed">
                                    <MathText text={fb.expectedAnswer} />
                                  </p>
                                </div>
                              )}

                              {/* Explanation with MathText */}
                              {fb.explanation && (
                                <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
                                  <div className="flex items-start gap-3">
                                    <Lightbulb className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                                    <div className="flex-1">
                                      <p className="font-semibold text-indigo-800 mb-1">Explanation:</p>
                                      <div className="text-indigo-700 leading-relaxed text-sm">
                                        <MathText text={fb.explanation} />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )
                    })}
                  </Accordion>
                </div>
              ) : isEnglishTest ? (
                // English test format
                <div className="mb-8">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-purple-50 mb-4">
                    <h3 className="text-xl font-semibold text-purple-700 flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      English Questions / अंग्रेजी प्रश्नहरू
                    </h3>
                    <Badge variant="secondary">{questions.englishQuestions.length} questions</Badge>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-purple-200 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-lg font-semibold text-purple-800">
                        Total Score: {totalScore}/{maxTotalScore}
                      </div>
                      <div className="text-2xl font-bold text-purple-600">{percentage}%</div>
                    </div>
                    <div className="text-sm text-purple-600">
                      All English questions are graded together as one section.
                    </div>
                  </div>

                  {/* Show individual English questions with science test styling */}
                  <Accordion type="single" collapsible className="w-full">
                    {questions.englishQuestions.map((question, index) => {
                      const userAnswer = progress?.answers?.[question.id]
                      const storedAnswer = answers[question.id]
                      const questionFeedbacks = (results.englishFeedback || []).filter((f: any) => f.questionId === question.id)

                      // Calculate score for this question using AI feedback if available
                      const questionScore = questionFeedbacks.reduce((sum, f) => sum + (f.score || 0), 0)
                      const hasAIFeedback = questionFeedbacks.length > 0

                      // Determine whether the student attempted the question
                      const hasAnswer = (() => {
                        const answer = storedAnswer || userAnswer
                        if (!answer) return false
                        if (question.type === 'free_writing') {
                          return !!(answer.content && typeof answer.content === 'string' && answer.content.trim().length > 0)
                        }
                        if (typeof answer === 'string') {
                          return answer.trim().length > 0
                        }
                        if (typeof answer === 'object' && !Array.isArray(answer)) {
                          return Object.values(answer).some((val) => {
                            if (typeof val === 'string') {
                              return val.trim().length > 0
                            }
                            if (typeof val === 'object' && val !== null) {
                              return Object.values(val).some(
                                (nestedVal) => typeof nestedVal === 'string' && nestedVal.trim().length > 0,
                              )
                            }
                            return val !== undefined && val !== null && val !== ""
                          })
                        }
                        return answer !== undefined && answer !== null && answer !== ""
                      })()

                      const fallbackFeedback = !hasAIFeedback
                        ? hasAnswer
                          ? "AI grading not available"
                          : "No answer provided"
                        : ""

                      const isFullyCorrect = questionScore === question.marks
                      const isPartiallyCorrect = questionScore > 0 && questionScore < question.marks
                      const isIncorrect = questionScore === 0

                      return (
                        <AccordionItem
                          value={`english-${index}`}
                          key={question.id}
                          className="border border-slate-200 rounded-lg mb-2 overflow-hidden"
                        >
                          <AccordionTrigger className="hover:bg-slate-50 px-4 py-3 text-left">
                            <div className="flex justify-between w-full items-center min-h-[48px]">
                              <span className="text-left font-medium pr-4 flex-1 leading-tight">
                                {index + 1}. {question.title}
                              </span>
                              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                {isFullyCorrect ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : isPartiallyCorrect ? (
                                  <div className="h-5 w-5 rounded-full border-2 border-yellow-500 bg-yellow-100 flex items-center justify-center">
                                    <span className="text-xs font-bold text-yellow-700">!</span>
                                  </div>
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-500" />
                                )}
                                <Badge
                                  variant={isFullyCorrect ? "default" : isPartiallyCorrect ? "secondary" : "destructive"}
                                  className={isFullyCorrect ? "bg-green-500 text-white hover:bg-green-600" : ""}
                                >
                                  {questionScore}/{question.marks}
                                </Badge>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="space-y-6">
                              {/* Reading Comprehension Passage */}
                              {question.type === 'reading_comprehension' && question.passage && (
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                  <h4 className="font-semibold text-slate-800 mb-2">
                                    {question.passage.title || 'Reading Passage'}
                                  </h4>
                                  {question.passage.author && (
                                    <p className="text-sm text-slate-600 mb-2">by {question.passage.author}</p>
                                  )}
                                  <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                                    {question.passage.content}
                                  </p>
                                </div>
                              )}

                              {question.type === 'reading_comprehension' && question.subSections && question.subSections.length > 0 ? (
                                question.subSections.map((section: any) => {
                                  const sectionAnswers = (userAnswer && typeof userAnswer === 'object') ? userAnswer[section.id] || {} : {}

                                  const sectionFeedbacks = questionFeedbacks.filter(
                                    (f: any) => f.sectionId === section.id,
                                  )

                                  return (
                                    <div key={section.id} className="space-y-4">
                                      <h4 className="text-lg font-semibold text-slate-800 border-b border-slate-300 pb-2">
                                        Section {section.id}: {section.title}
                                      </h4>

                                      {/* Handle matching type sections */}
                                      {section.type === 'matching' && section.columns ? (
                                        <div className="space-y-4">
                                          {/* Display the matching columns */}
                                          <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="bg-slate-50 p-3 rounded-lg">
                                              <h5 className="font-semibold text-slate-700 mb-2">Column A</h5>
                                              <ul className="space-y-1 text-sm">
                                                {section.columns.A?.map((item: any) => (
                                                  <li key={item.id} className="text-slate-600">({item.id}) {item.text}</li>
                                                ))}
                                              </ul>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded-lg">
                                              <h5 className="font-semibold text-slate-700 mb-2">Column B</h5>
                                              <ul className="space-y-1 text-sm">
                                                {section.columns.B?.map((item: any) => (
                                                  <li key={item.id} className="text-slate-600">({item.id}) {item.text}</li>
                                                ))}
                                              </ul>
                                            </div>
                                          </div>

                                          {/* Display matching answers */}
                                          <div className="space-y-2">
                                            <h5 className="font-semibold text-slate-700">Your Matches / तपाईंको मिलान:</h5>
                                            {section.columns.A?.map((itemA: any) => {
                                              const userMatch = sectionAnswers?.[itemA.id]
                                              const correctMatch = section.correctAnswer?.find((ca: any) => ca.A === itemA.id)?.B
                                              const matchedB = section.columns.B?.find((b: any) => b.id === userMatch)
                                              const correctB = section.columns.B?.find((b: any) => b.id === correctMatch)
                                              const isCorrect = userMatch === correctMatch
                                              const matchFeedback = sectionFeedbacks.find((f: any) => f.matchId === itemA.id)
                                              const matchScore = matchFeedback?.score || (isCorrect ? 1 : 0)
                                              const matchMaxScore = section.marks ? Math.round((section.marks / section.columns.A.length) * 10) / 10 : 1

                                              return (
                                                <div key={itemA.id} className={`p-3 rounded-lg ${isCorrect ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'}`}>
                                                  <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                      <p className="font-medium text-slate-800">({itemA.id}) {itemA.text}</p>
                                                      <p className="text-sm mt-1">
                                                        <span className="text-slate-600">Your answer: </span>
                                                        <span className={isCorrect ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                                                          {matchedB ? `(${userMatch}) ${matchedB.text}` : 'No answer'}
                                                        </span>
                                                      </p>
                                                      {!isCorrect && correctB && (
                                                        <p className="text-sm mt-1">
                                                          <span className="text-slate-600">Correct answer: </span>
                                                          <span className="text-blue-700 font-medium">({correctMatch}) {correctB.text}</span>
                                                        </p>
                                                      )}
                                                    </div>
                                                    <Badge className={`ml-2 flex-shrink-0 ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                                      {matchScore}/{matchMaxScore}
                                                    </Badge>
                                                  </div>
                                                  {matchFeedback?.feedback && (
                                                    <p className="text-sm text-blue-700 mt-2 italic">{matchFeedback.feedback}</p>
                                                  )}
                                                </div>
                                              )
                                            })}
                                          </div>

                                          {/* Show explanation if available */}
                                          {(section.explanationEnglish || section.explanationNepali) && (
                                            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg mt-3">
                                              <p className="font-semibold text-blue-800 mb-1">Explanation / व्याख्या:</p>
                                              <p className="text-blue-700 text-sm whitespace-pre-line">{section.explanationEnglish || section.explanationNepali}</p>
                                            </div>
                                          )}
                                        </div>
                                      ) : section.type === 'ordering' && section.sentences ? (
                                        /* Handle ordering type sections */
                                        (() => {
                                          // Convert { itemId: "position" } format to ordered array
                                          const userOrderArray: string[] = []
                                          const sentences = section.sentences || []

                                          sentences.forEach((item: any) => {
                                            const position = sectionAnswers?.[item.id]
                                            if (position) {
                                              const posIndex = parseInt(position) - 1
                                              if (posIndex >= 0) {
                                                userOrderArray[posIndex] = item.id
                                              }
                                            }
                                          })

                                          const userOrder = userOrderArray.filter(Boolean)
                                          const hasUserOrder = userOrder.length > 0

                                          // Check correctness
                                          const correctOrder = section.correctAnswer || []
                                          let correctCount = 0
                                          correctOrder.forEach((correctId: string, index: number) => {
                                            if (userOrder[index] === correctId) {
                                              correctCount++
                                            }
                                          })
                                          const isAllCorrect = correctCount === correctOrder.length && hasUserOrder

                                          return (
                                            <div className="space-y-4">
                                              <div className="bg-slate-50 p-4 rounded-lg">
                                                <h5 className="font-semibold text-slate-700 mb-3">Sentences to Order:</h5>
                                                <ul className="space-y-2 text-sm">
                                                  {sentences?.map((sentence: any) => (
                                                    <li key={sentence.id} className="text-slate-600">
                                                      <span className="font-medium">({sentence.id})</span> {sentence.text}
                                                    </li>
                                                  ))}
                                                </ul>
                                              </div>

                                              {/* Display user's ordering vs correct order */}
                                              <div className="space-y-3">
                                                <div className={`p-4 rounded-lg ${isAllCorrect
                                                  ? 'bg-green-50 border-l-4 border-green-500'
                                                  : 'bg-red-50 border-l-4 border-red-500'
                                                  }`}>
                                                  <p className="font-semibold text-slate-800 mb-2">Your Order / तपाईंको क्रम:</p>
                                                  {hasUserOrder ? (
                                                    <ol className="list-decimal list-inside space-y-1 text-sm">
                                                      {userOrder.map((id: string, idx: number) => {
                                                        const sentence = sentences?.find((s: any) => s.id === id)
                                                        const isPositionCorrect = correctOrder[idx] === id
                                                        return (
                                                          <li key={id} className={isPositionCorrect ? 'text-green-700' : 'text-red-700'}>
                                                            <span className="font-medium">({id})</span> {sentence?.text || 'Unknown'}
                                                            {isPositionCorrect && <span className="ml-2">✓</span>}
                                                          </li>
                                                        )
                                                      })}
                                                    </ol>
                                                  ) : (
                                                    <p className="text-slate-500 italic">No answer provided</p>
                                                  )}
                                                </div>

                                                {/* Show correct order if wrong */}
                                                {!isAllCorrect && correctOrder.length > 0 && (
                                                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                                                    <p className="font-semibold text-amber-800 mb-2">Correct Order / सही क्रम:</p>
                                                    <ol className="list-decimal list-inside space-y-1 text-sm">
                                                      {correctOrder.map((id: string) => {
                                                        const sentence = sentences?.find((s: any) => s.id === id)
                                                        return (
                                                          <li key={id} className="text-amber-700">
                                                            <span className="font-medium">({id})</span> {sentence?.text || 'Unknown'}
                                                          </li>
                                                        )
                                                      })}
                                                    </ol>
                                                  </div>
                                                )}
                                              </div>

                                              {/* Score for ordering - use feedback from grading */}
                                              {sectionFeedbacks.length > 0 ? (
                                                <div className="flex justify-between items-center">
                                                  <div className="text-sm text-slate-600">{sectionFeedbacks[0]?.feedback}</div>
                                                  <Badge className={`${sectionFeedbacks[0]?.score > 0
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-red-500 text-white'
                                                    }`}>
                                                    {sectionFeedbacks[0]?.score || 0}/{section.marks || 5}
                                                  </Badge>
                                                </div>
                                              ) : (
                                                <div className="flex justify-end">
                                                  <Badge className={`${isAllCorrect
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-red-500 text-white'
                                                    }`}>
                                                    {isAllCorrect ? section.marks || 5 : correctCount}/{section.marks || 5}
                                                  </Badge>
                                                </div>
                                              )}

                                              {/* Show explanation if available */}
                                              {(section.explanationEnglish || section.explanationNepali) && (
                                                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg">
                                                  <p className="font-semibold text-blue-800 mb-1">Explanation / व्याख्या:</p>
                                                  <p className="text-blue-700 text-sm">{section.explanationEnglish || section.explanationNepali}</p>
                                                </div>
                                              )}
                                            </div>
                                          )
                                        })()
                                      ) : section.subQuestions?.map((subQ: any) => {
                                        const answer = sectionAnswers[subQ.id]
                                        const feedback = sectionFeedbacks.find((f: any) => f.subQuestionId === subQ.id)
                                        const subQuestionMarks = subQ.marks || (section.marks ? Math.round((section.marks / section.subQuestions.length) * 10) / 10 : 1)
                                        const score = feedback?.score || 0
                                        const isCorrect = score === subQuestionMarks
                                        const isPartiallyCorrect = score > 0 && score < subQuestionMarks

                                        return (
                                          <div key={subQ.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
                                            {/* Question */}
                                            <div className="flex items-start justify-between">
                                              <p className="font-medium text-slate-800 flex-1">
                                                ({subQ.id}) {subQ.questionEnglish}
                                              </p>
                                              <Badge
                                                className={`ml-4 flex-shrink-0 ${isCorrect
                                                  ? "bg-green-500 text-white"
                                                  : isPartiallyCorrect
                                                    ? "bg-yellow-500 text-white"
                                                    : "bg-red-500 text-white"
                                                  }`}
                                              >
                                                {score}/{subQuestionMarks}
                                              </Badge>
                                            </div>

                                            {/* Your Answer */}
                                            <div className={`p-3 rounded-lg ${isCorrect
                                              ? "bg-green-50 border-l-4 border-green-500"
                                              : isPartiallyCorrect
                                                ? "bg-yellow-50 border-l-4 border-yellow-500"
                                                : "bg-red-50 border-l-4 border-red-500"
                                              }`}>
                                              <p className="font-semibold text-slate-800 mb-1">Your Answer / तपाईंको उत्तर:</p>
                                              <p className="text-slate-700 font-medium">{String(answer || 'No answer')}</p>
                                            </div>

                                            {/* Feedback */}
                                            {feedback && (
                                              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg">
                                                <div className="flex items-start gap-2">
                                                  <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                  <div className="flex-1">
                                                    <p className="font-semibold text-blue-800 mb-1">Feedback / प्रतिक्रिया:</p>
                                                    <p className="text-blue-700 whitespace-pre-wrap break-words">{feedback.feedback}</p>
                                                  </div>
                                                </div>
                                              </div>
                                            )}

                                            {/* Correct Answer (for true/false questions) */}
                                            {section.type === 'true_false' && subQ.correctAnswer && !isCorrect && !feedback && (
                                              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg">
                                                <p className="font-semibold text-blue-800 mb-1">Correct Answer / सही उत्तर:</p>
                                                <p className="text-blue-700 font-medium">{subQ.correctAnswer}</p>
                                              </div>
                                            )}

                                            {/* Correct Answer for fill_in_the_blanks and short_answer when incorrect */}
                                            {(section.type === 'fill_in_the_blanks' || section.type === 'short_answer' || section.type === 'true_false_not_given') && subQ.correctAnswer && !isCorrect && (
                                              <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg">
                                                <p className="font-semibold text-amber-800 mb-1">Correct Answer / सही उत्तर:</p>
                                                <p className="text-amber-700 font-medium">{subQ.correctAnswer}</p>
                                              </div>
                                            )}
                                          </div>
                                        )
                                      })}
                                    </div>
                                  )
                                })
                              ) : question.subQuestions ? (
                                // Handle grammar questions with direct sub-questions
                                question.subQuestions.map((subQ: any) => {
                                  const answer = userAnswer?.[subQ.id]
                                  const feedback = questionFeedbacks.find((f: any) => f.subQuestionId === subQ.id)
                                  const subQuestionMarks = subQ.marks || (question.marks ? Math.round((question.marks / question.subQuestions.length) * 10) / 10 : 1)
                                  const score = feedback?.score || 0
                                  const isCorrect = score === subQuestionMarks

                                  return (
                                    <div key={subQ.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
                                      <div className="flex items-start justify-between">
                                        <p className="font-medium text-slate-800 flex-1">
                                          ({subQ.id}) {subQ.questionEnglish}
                                        </p>
                                        <Badge className={`ml-4 ${isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                                          {score}/{subQuestionMarks}
                                        </Badge>
                                      </div>
                                      <div className={`p-3 rounded-lg ${isCorrect ? "bg-green-50 border-l-4 border-green-500" : "bg-red-50 border-l-4 border-red-500"}`}>
                                        <p className="font-semibold text-slate-800 mb-1">Your Answer / तपाईंको उत्तर:</p>
                                        <p className="text-slate-700">{String(answer || 'No answer')}</p>
                                      </div>
                                      {feedback && (
                                        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg">
                                          <p className="font-semibold text-blue-800 mb-1">Feedback / प्रतिक्रिया:</p>
                                          <p className="text-blue-700">{feedback.feedback}</p>
                                        </div>
                                      )}
                                      {/* Show correct answer for grammar questions when wrong */}
                                      {subQ.correctAnswer && !isCorrect && (
                                        <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg">
                                          <p className="font-semibold text-amber-800 mb-1">Correct Answer / सही उत्तर:</p>
                                          <p className="text-amber-700 font-medium">{subQ.correctAnswer}</p>
                                        </div>
                                      )}
                                    </div>
                                  )
                                })
                              ) : question.type === 'free_writing' ? (
                                // Handle free writing questions
                                <div className="space-y-4">
                                  <div className={`p-4 rounded-lg ${isFullyCorrect ? "bg-green-50 border-l-4 border-green-500" : isPartiallyCorrect ? "bg-yellow-50 border-l-4 border-yellow-500" : "bg-red-50 border-l-4 border-red-500"}`}>
                                    <p className="font-semibold text-slate-800 mb-2">Your Answer / तपाईंको उत्तर:</p>
                                    <p className="text-slate-700 whitespace-pre-wrap">{userAnswer?.content || 'No answer provided'}</p>
                                  </div>
                                  {(hasAIFeedback || fallbackFeedback) && (
                                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                                      <div className="flex items-start gap-2">
                                        <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                          <p className="font-semibold text-blue-800 mb-1">Feedback / प्रतिक्रिया:</p>
                                          <p className="text-blue-700 whitespace-pre-wrap break-words">
                                            {hasAIFeedback
                                              ? questionFeedbacks.map((fb) => fb.feedback).join(" ")
                                              : fallbackFeedback}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  {/* Show sample answer for free writing questions if available */}
                                  {question.sampleAnswer && (
                                    <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
                                      <p className="font-semibold text-indigo-800 mb-2">Sample Answer / नमूना उत्तर:</p>
                                      {question.sampleAnswer.title && (
                                        <p className="font-medium text-indigo-700 mb-1">{question.sampleAnswer.title}</p>
                                      )}
                                      <p className="text-indigo-700 text-sm whitespace-pre-wrap">{question.sampleAnswer.content}</p>
                                    </div>
                                  )}
                                </div>
                              ) : question.type === 'cloze_test' && question.gaps ? (
                                // Handle cloze test questions
                                question.gaps.map((gap: any) => {
                                  const answer = userAnswer?.[gap.id]
                                  const feedback = questionFeedbacks.find((f: any) => f.gapId === gap.id)
                                  const gapMarks = question.marks && question.gaps ? Math.round((question.marks / question.gaps.length) * 10) / 10 : 1
                                  const score = feedback?.score || 0
                                  const isCorrect = score === gapMarks

                                  return (
                                    <div key={gap.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
                                      <div className="flex items-start justify-between">
                                        <p className="font-medium text-slate-800">Gap ({gap.id})</p>
                                        <Badge className={`ml-4 ${isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                                          {score}/{gapMarks}
                                        </Badge>
                                      </div>
                                      <div className={`p-3 rounded-lg ${isCorrect ? "bg-green-50 border-l-4 border-green-500" : "bg-red-50 border-l-4 border-red-500"}`}>
                                        <p className="font-semibold text-slate-800 mb-1">Your Answer / तपाईंको उत्तर:</p>
                                        <p className="text-slate-700 font-medium">{String(answer || 'No answer')}</p>
                                      </div>
                                      {feedback && (
                                        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg">
                                          <p className="font-semibold text-blue-800 mb-1">Feedback / प्रतिक्रिया:</p>
                                          <p className="text-blue-700">{feedback.feedback}</p>
                                        </div>
                                      )}
                                      {gap.correctAnswer && !isCorrect && (
                                        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg">
                                          <p className="font-semibold text-blue-800 mb-1">Correct Answer / सही उत्तर:</p>
                                          <p className="text-blue-700 font-medium">{gap.correctAnswer}</p>
                                        </div>
                                      )}
                                    </div>
                                  )
                                })
                              ) : (
                                <div className="space-y-3">
                                  <div className="p-3 rounded-lg bg-slate-50 border-l-4 border-slate-400">
                                    <p className="font-semibold text-slate-800 mb-1">Your Answer / तपाईंको उत्तर:</p>
                                    <p className="text-slate-500 italic">No answer provided / कुनै उत्तर दिइएको छैन</p>
                                  </div>
                                  {!hasAIFeedback && (
                                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg">
                                      <p className="font-semibold text-blue-800 mb-1">Feedback / प्रतिक्रिया:</p>
                                      <p className="text-blue-700">{fallbackFeedback}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )
                    })}
                  </Accordion>
                </div>
              ) : (
                // Science test format
                <>
                  {renderMultipleChoiceSection()}
                  {section(
                    "Group 'B' Feedback",
                    "समूह 'ख' प्रतिक्रिया",
                    results.feedbackB,
                    maxScoreB,
                    "bg-green-50",
                    questions.groupB,
                  )}
                  {section(
                    "Group 'C' Feedback",
                    "समूह 'ग' प्रतिक्रिया",
                    results.feedbackC,
                    maxScoreC,
                    "bg-purple-50",
                    questions.groupC,
                  )}
                  {section(
                    "Group 'D' Feedback",
                    "समूह 'घ' प्रतिक्रिया",
                    results.feedbackD,
                    maxScoreD,
                    "bg-orange-50",
                    questions.groupD,
                  )}
                </>
              )}
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row justify-center gap-3 bg-slate-50 p-6">
              <Button
                onClick={onEditAnswers}
                size="lg"
                className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
              >
                <Edit3 className="mr-2 h-5 w-5" />
                Edit Answers / उत्तर सम्पादन गर्नुहोस्
              </Button>

              <Button
                onClick={onRetake}
                size="lg"
                className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Take Test Again / फेरि परीक्षा दिनुहोस्
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
