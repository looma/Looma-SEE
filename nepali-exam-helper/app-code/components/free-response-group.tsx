"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, Eye, EyeOff, Lightbulb } from "lucide-react"
import { MathText } from "./math-text"
import type { FreeResponseQuestion } from "@/lib/use-questions"

interface FreeResponseGroupProps {
  group: "B" | "C" | "D"
  questions: FreeResponseQuestion[]
  answers: Record<string, string>
  onAnswerChange: (group: "B" | "C" | "D", id: string, answer: string) => void
  progress: number
  language?: "english" | "nepali"
}

export function FreeResponseGroup({
  group,
  questions,
  answers,
  onAnswerChange,
  progress,
  language = "english",
}: FreeResponseGroupProps) {
  const [showExplanations, setShowExplanations] = useState(false)

  const renderExplanation = (question: FreeResponseQuestion) => {
    if (!showExplanations) return null

    const hasExplanation = question.explanation && question.explanation.trim()
    const hasSampleAnswer = question.sampleAnswer && question.sampleAnswer.trim()

    // If we have an explanation, show that and ignore sample answer
    if (hasExplanation) {
      // Clean up the explanation text by removing "English:" prefix if it exists
      let cleanExplanation = question.explanation.trim()
      if (cleanExplanation.startsWith("English:")) {
        cleanExplanation = cleanExplanation.replace(/^English:\s*/, "")
      }
      if (cleanExplanation.startsWith("Explanation (English):")) {
        cleanExplanation = cleanExplanation.replace(/^Explanation \$English\$:\s*/, "")
      }

      return (
        <div className="mt-3">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm">
              <div className="flex items-start gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="font-medium text-blue-800">Explanation / व्याख्या:</span>
              </div>
              <div className="ml-6">
                <MathText text={cleanExplanation} className="text-blue-700 whitespace-pre-line leading-relaxed" />
              </div>
            </div>
          </div>
        </div>
      )
    }

    // If no explanation but has sample answer, show sample answer with same blue styling
    if (hasSampleAnswer) {
      return (
        <div className="mt-3">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm">
              <div className="flex items-start gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="font-medium text-blue-800">Sample Answer / नमूना उत्तर:</span>
              </div>
              <div className="ml-6">
                <MathText text={question.sampleAnswer || ""} className="text-blue-700 whitespace-pre-line leading-relaxed" />
              </div>
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  const getGroupInfo = (group: string) => {
    switch (group) {
      case "B":
        return {
          title: "Group B - Short Answer Questions",
          description: "Provide brief, clear answers",
          color: "from-green-500 to-green-600",
        }
      case "C":
        return {
          title: "Group C - Long Answer Questions",
          description: "Write detailed explanations",
          color: "from-purple-500 to-purple-600",
        }
      case "D":
        return {
          title: "Group D - Applied Questions",
          description: "Apply concepts to solve problems",
          color: "from-orange-500 to-orange-600",
        }
      default:
        return {
          title: "Free Response Questions",
          description: "Write your answers clearly",
          color: "from-slate-500 to-slate-600",
        }
    }
  }

  const answeredCount = Object.values(answers).filter((answer) => answer && answer.trim().length > 0).length
  const progressPercentage = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0
  const groupInfo = getGroupInfo(group)

  if (questions.length === 0) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-white/20">
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-slate-600">No Group {group} questions available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className={`bg-gradient-to-r ${groupInfo.color} text-white shadow-lg border border-white/20`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">{groupInfo.title}</CardTitle>
              <p className="text-white/90 mt-1">{groupInfo.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowExplanations(!showExplanations)}
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                {showExplanations ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="ml-1 hidden sm:inline">{showExplanations ? "Hide" : "Show"} Help</span>
              </Button>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {answeredCount}/{questions.length}
              </Badge>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={progressPercentage} className="h-2 bg-white/30" />
            <p className="text-xs text-white/90 mt-1">{Math.round(progressPercentage)}% complete</p>
          </div>
        </CardHeader>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((question, index) => {
          const currentAnswer = answers[question.id] || ""
          const isAnswered = currentAnswer.trim().length > 0

          return (
            <Card key={question.id} className="bg-white/90 backdrop-blur-sm shadow-lg border border-white/20">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {isAnswered ? (
                        <CheckCircle2 className="h-5 w-5 text-slate-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base font-semibold text-slate-800">Question {index + 1}</CardTitle>
                      <div className="text-slate-700 mt-2 leading-relaxed">
                        <MathText text={question.english} />
                      </div>
                      <div className="text-slate-700 mt-1 leading-relaxed">
                        <MathText text={question.nepali} />
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-3">
                    {question.marks} mark{question.marks !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <Textarea
                  value={currentAnswer}
                  onChange={(e) => onAnswerChange(group, question.id, e.target.value)}
                  placeholder={`Write your answer here... ${group === "B" ? "(Brief answer)" : group === "C" ? "(Detailed explanation)" : "(Apply concepts)"}`}
                  className="min-h-[120px] resize-none"
                  rows={group === "B" ? 4 : group === "C" ? 6 : 5}
                />

                <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                  <span>
                    {group === "B" && "Keep it concise but complete"}
                    {group === "C" && "Provide detailed explanations with examples"}
                    {group === "D" && "Show your working and reasoning"}
                  </span>
                  <span className={currentAnswer.length > 20 ? "text-green-600" : "text-slate-400"}>
                    {currentAnswer.length} characters
                  </span>
                </div>

                {renderExplanation(question)}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
