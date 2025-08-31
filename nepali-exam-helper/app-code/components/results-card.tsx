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
  History,
  Lightbulb,
  RotateCcw,
  Edit3,
} from "lucide-react"
import { useQuestions } from "@/lib/use-questions"
import { loadStudentProgress } from "@/lib/storage"
import type { GroupAQuestion } from "@/components/group-a"

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

  if (!questions) return <div>Loading...</div>

  const scoreB = results.feedbackB.reduce((acc, r) => acc + r.score, 0)
  const scoreC = results.feedbackC.reduce((acc, r) => acc + r.score, 0)
  const scoreD = results.feedbackD.reduce((acc, r) => acc + r.score, 0)
  const totalScore = results.scoreA + scoreB + scoreC + scoreD

  const maxScoreA = questions.groupA.reduce((acc, q) => acc + q.marks, 0)
  const maxScoreB = questions.groupB.reduce((acc, q) => acc + q.marks, 0)
  const maxScoreC = questions.groupC.reduce((acc, q) => acc + q.marks, 0)
  const maxScoreD = questions.groupD.reduce((acc, q) => acc + q.marks, 0)
  const maxTotalScore = maxScoreA + maxScoreB + maxScoreC + maxScoreD

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

  const progress = loadStudentProgress(`${studentId}_${testId}`)
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
                      <Badge variant={isCorrect ? "default" : "destructive"}>{isCorrect ? "1/1" : "0/1"}</Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    {/* Question in Nepali with proper spacing */}
                    <div className="text-sm text-slate-600 italic mb-3 leading-relaxed">{question.nepali}</div>

                    {/* User's Answer Section with better formatting */}
                    <div
                      className={`p-3 rounded-lg ${
                        userAnswer
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
                            ({userAnswer}) {userOption?.english}
                          </p>
                          {userOption?.nepali && userOption.nepali !== userOption.english && (
                            <p className="text-sm text-slate-600 italic">{userOption.nepali}</p>
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
                            ({question.correctAnswer}) {correctOption?.english}
                          </p>
                          {correctOption?.nepali && correctOption.nepali !== correctOption.english && (
                            <p className="text-sm text-blue-600 italic">{correctOption.nepali}</p>
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
                            <p className="text-amber-700 leading-relaxed whitespace-pre-line">{question.explanation}</p>
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
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 mb-4">
          <h3 className="text-xl font-semibold text-slate-700 flex items-center gap-2">
            <History className="h-5 w-5" /> Previous Attempts / अघिल्लो प्रयासहरू
          </h3>
          <Badge variant="secondary">{attempts.length} attempts</Badge>
        </div>
        <div className="grid gap-3">
          {[...attempts]
            .slice(-5)
            .reverse()
            .map((attempt, idx) => (
              <div
                key={attempt.id}
                className="bg-white p-4 rounded-lg border border-slate-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <Badge variant={idx === 0 ? "default" : "secondary"}>
                    {idx === 0 ? "Latest" : `Attempt ${attempts.length - idx}`}
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
                  <Badge>{attempt.grade}</Badge>
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
                    <Badge className="ml-4 flex-shrink-0">
                      {fb.score}/{question.marks}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    <div className="text-sm text-slate-600 italic mb-3">{question.nepali}</div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-slate-600">
                        <span className="font-semibold text-slate-800">Your Answer / तपाईंको उत्तर:</span>
                      </p>
                      <p className="mt-1 text-slate-700">{fb.studentAnswer}</p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                      <div className="flex items-start gap-3">
                        <MessageSquareQuote className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-blue-800">AI Feedback / AI प्रतिक्रिया:</p>
                          <p className="text-blue-700 mt-1 leading-relaxed">{fb.feedback}</p>
                        </div>
                      </div>
                    </div>
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
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
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row justify-center gap-3 bg-slate-50 p-6">
              <Button
                onClick={onEditAnswers}
                size="lg"
                variant="outline"
                className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
              >
                <Edit3 className="mr-2 h-5 w-5" />
                Edit Answers / उत्तर सम्पादन गर्नुहोस्
              </Button>

              <Button
                onClick={onRetake}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
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
