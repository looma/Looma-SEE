"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen, CheckCircle, AlertCircle } from "lucide-react"
import { GroupA } from "./group-a"
import { FreeResponseGroup } from "./free-response-group"
import { EnglishQuestionRenderer } from "./english-question-renderer"
import { useQuestions, type EnglishQuestion } from "@/lib/use-questions"
import { getStoredAnswers, saveAnswer } from "@/lib/storage"

interface UniversalExamTabsProps {
  testId: string
  language: "english" | "nepali"
  onSubmit: (answers: any) => void
}

export function UniversalExamTabs({ testId, language, onSubmit }: UniversalExamTabsProps) {
  const { questions, loading, error } = useQuestions(testId)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [timeRemaining, setTimeRemaining] = useState(10800) // 3 hours in seconds

  useEffect(() => {
    const stored = getStoredAnswers(testId)
    if (stored) {
      setAnswers(stored)
    }
  }, [testId])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleAnswerChange = (questionId: string, answer: any) => {
    const newAnswers = { ...answers, [questionId]: answer }
    setAnswers(newAnswers)
    saveAnswer(testId, questionId, answer)
  }

  const handleSubmit = () => {
    onSubmit(answers)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getAnsweredCount = (questionsList: any[]) => {
    return questionsList.filter((q) => {
      const answer = answers[q.id]
      return answer !== undefined && answer !== null && answer !== ""
    }).length
  }

  const getEnglishAnsweredCount = (questionsList: EnglishQuestion[]) => {
    return questionsList.filter((q) => {
      const answer = answers[q.id]
      if (!answer) return false

      // For complex questions with sub-questions, check if any sub-answer exists
      if (typeof answer === "object" && !Array.isArray(answer)) {
        return Object.values(answer).some((val) => val !== undefined && val !== null && val !== "")
      }

      return answer !== undefined && answer !== null && answer !== ""
    }).length
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading questions...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-red-600">
            <AlertCircle className="h-8 w-8 mx-auto mb-4" />
            <p>Error loading questions: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!questions) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p>No questions available</p>
        </CardContent>
      </Card>
    )
  }

  // Check if this is an English test
  const isEnglishTest = questions.englishQuestions && questions.englishQuestions.length > 0

  if (isEnglishTest) {
    // Render English test interface
    const totalQuestions = questions.englishQuestions.length
    const answeredQuestions = getEnglishAnsweredCount(questions.englishQuestions)

    return (
      <div className="space-y-6">
        {/* Header with timer and progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  <span>
                    {answeredQuestions}/{totalQuestions} answered
                  </span>
                </div>
              </div>
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                Submit Test
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* English Questions */}
        <div className="space-y-6">
          {questions.englishQuestions.map((question) => (
            <EnglishQuestionRenderer
              key={question.id}
              question={question}
              answer={answers[question.id]}
              onAnswerChange={handleAnswerChange}
              language={language}
            />
          ))}
        </div>

        {/* Submit button at bottom */}
        <Card>
          <CardContent className="flex justify-center py-4">
            <Button onClick={handleSubmit} size="lg" className="bg-green-600 hover:bg-green-700">
              Submit Test ({answeredQuestions}/{totalQuestions} answered)
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render traditional science test interface
  const groupACount = questions.groupA?.length || 0
  const groupBCount = questions.groupB?.length || 0
  const groupCCount = questions.groupC?.length || 0
  const groupDCount = questions.groupD?.length || 0

  const groupAAnswered = getAnsweredCount(questions.groupA || [])
  const groupBAnswered = getAnsweredCount(questions.groupB || [])
  const groupCAnswered = getAnsweredCount(questions.groupC || [])
  const groupDAnswered = getAnsweredCount(questions.groupD || [])

  const totalQuestions = groupACount + groupBCount + groupCCount + groupDCount
  const totalAnswered = groupAAnswered + groupBAnswered + groupCAnswered + groupDAnswered

  return (
    <div className="space-y-6">
      {/* Header with timer and progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                <span>
                  {totalAnswered}/{totalQuestions} answered
                </span>
              </div>
            </div>
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
              Submit Test
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="groupA" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="groupA" className="relative">
            Group A
            <Badge variant={groupAAnswered === groupACount ? "default" : "secondary"} className="ml-2">
              {groupAAnswered}/{groupACount}
            </Badge>
            {groupAAnswered === groupACount && (
              <CheckCircle className="h-4 w-4 text-green-600 absolute -top-1 -right-1" />
            )}
          </TabsTrigger>
          <TabsTrigger value="groupB" className="relative">
            Group B
            <Badge variant={groupBAnswered === groupBCount ? "default" : "secondary"} className="ml-2">
              {groupBAnswered}/{groupBCount}
            </Badge>
            {groupBAnswered === groupBCount && (
              <CheckCircle className="h-4 w-4 text-green-600 absolute -top-1 -right-1" />
            )}
          </TabsTrigger>
          <TabsTrigger value="groupC" className="relative">
            Group C
            <Badge variant={groupCAnswered === groupCCount ? "default" : "secondary"} className="ml-2">
              {groupCAnswered}/{groupCCount}
            </Badge>
            {groupCAnswered === groupCCount && (
              <CheckCircle className="h-4 w-4 text-green-600 absolute -top-1 -right-1" />
            )}
          </TabsTrigger>
          <TabsTrigger value="groupD" className="relative">
            Group D
            <Badge variant={groupDAnswered === groupDCount ? "default" : "secondary"} className="ml-2">
              {groupDAnswered}/{groupDCount}
            </Badge>
            {groupDAnswered === groupDCount && (
              <CheckCircle className="h-4 w-4 text-green-600 absolute -top-1 -right-1" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groupA">
          <GroupA
            questions={questions.groupA || []}
            answers={answers}
            onAnswerChange={handleAnswerChange}
            language={language}
          />
        </TabsContent>

        <TabsContent value="groupB">
          <FreeResponseGroup
            title="Group B - Short Answer Questions"
            questions={questions.groupB || []}
            answers={answers}
            onAnswerChange={handleAnswerChange}
            language={language}
          />
        </TabsContent>

        <TabsContent value="groupC">
          <FreeResponseGroup
            title="Group C - Long Answer Questions"
            questions={questions.groupC || []}
            answers={answers}
            onAnswerChange={handleAnswerChange}
            language={language}
          />
        </TabsContent>

        <TabsContent value="groupD">
          <FreeResponseGroup
            title="Group D - Applied Questions"
            questions={questions.groupD || []}
            answers={answers}
            onAnswerChange={handleAnswerChange}
            language={language}
          />
        </TabsContent>
      </Tabs>

      {/* Submit button at bottom */}
      <Card>
        <CardContent className="flex justify-center py-4">
          <Button onClick={handleSubmit} size="lg" className="bg-green-600 hover:bg-green-700">
            Submit Test ({totalAnswered}/{totalQuestions} answered)
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
