"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, Eye, EyeOff, Lightbulb } from "lucide-react"
import { MathText } from "./math-text"
import type { GroupAQuestion } from "@/lib/use-questions"

interface GroupAProps {
  questions: GroupAQuestion[]
  answers: Record<string, string>
  onAnswerChange: (id: string, answer: string) => void
  progress: number
  language?: "english" | "nepali"
}

export function GroupA({ questions, answers, onAnswerChange, progress, language = "english" }: GroupAProps) {
  const [showExplanations, setShowExplanations] = useState(false)

  const parseExplanation = (explanation?: string) => {
    if (!explanation) return { english: "", nepali: "" }

    const parts = explanation.split("\nब्याख्या (Nepali Explanation): ")
    const english = parts[0]?.replace("Explanation (English): ", "") || ""
    const nepali = parts[1] || ""

    return { english, nepali }
  }

  const renderExplanation = (explanation?: string) => {
    if (!explanation || !showExplanations) return null

    // Clean up the explanation text by removing "English:" prefix if it exists
    let cleanExplanation = explanation.trim()
    if (cleanExplanation.startsWith("English:")) {
      cleanExplanation = cleanExplanation.replace(/^English:\s*/, "")
    }
    if (cleanExplanation.startsWith("Explanation (English):")) {
      cleanExplanation = cleanExplanation.replace(/^Explanation \$English\$:\s*/, "")
    }

    return (
      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
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
    )
  }

  const answeredCount = Object.keys(answers).length
  const progressPercentage = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0

  if (questions.length === 0) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-white/20">
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-slate-600">No Group A questions available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg border border-white/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Group A - Multiple Choice</CardTitle>
              <p className="text-blue-100 mt-1">Choose the best answer for each question</p>
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
            <Progress value={progressPercentage} className="h-2 bg-blue-400/30" />
            <p className="text-xs text-blue-100 mt-1">{Math.round(progressPercentage)}% complete</p>
          </div>
        </CardHeader>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((question, index) => {
          const isAnswered = answers[question.id] !== undefined
          const selectedAnswer = answers[question.id]

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
                      {question.nepali && question.nepali !== question.english && (
                        <div className="text-slate-700 mt-1 leading-relaxed">
                          <MathText text={question.nepali} />
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-3">
                    {question.marks} mark{question.marks !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <RadioGroup
                  value={selectedAnswer || ""}
                  onValueChange={(value) => onAnswerChange(question.id, value)}
                  className="space-y-3"
                >
                  {question.options.map((option) => (
                    <div
                      key={option.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${selectedAnswer === option.id
                        ? "bg-blue-50 border-blue-200"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                        }`}
                      onClick={() => onAnswerChange(question.id, option.id)}
                    >
                      <RadioGroupItem value={option.id} id={`${question.id}-${option.id}`} />
                      <Label htmlFor={`${question.id}-${option.id}`} className="flex-1 text-sm leading-relaxed">
                        <div>
                          <span className="font-medium mr-2">({option.id})</span>
                          <MathText text={option.english} />
                        </div>
                        {option.nepali && option.nepali !== option.english && (
                          <div className="mt-0.5">
                            <MathText text={option.nepali} />
                          </div>
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {renderExplanation(question.explanation)}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
