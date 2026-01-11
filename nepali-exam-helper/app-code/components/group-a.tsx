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
import { CitationText } from "./citation-text"
import { useLanguage } from "@/lib/language-context"
import type { GroupAQuestion } from "@/lib/use-questions"

interface GroupAProps {
  questions: GroupAQuestion[]
  answers: Record<string, string>
  onAnswerChange: (id: string, answer: string) => void
  progress: number
}

export function GroupA({ questions, answers, onAnswerChange, progress }: GroupAProps) {
  const { language } = useLanguage()
  const [showExplanations, setShowExplanations] = useState(false)

  const renderExplanation = (question: GroupAQuestion) => {
    if (!showExplanations) return null

    const explanation = language === "english"
      ? ((question as any).explanationEnglish || question.explanation)
      : ((question as any).explanationNepali || question.explanation)

    // Get the correct answer option text
    const correctAnswerId = (question as any).correctAnswerEnglish || (question as any).correctAnswer || (question as any).correctAnswerNepali
    const correctOption = question.options.find(opt => opt.id === correctAnswerId)
    const correctAnswerText = correctOption
      ? (language === "english" ? correctOption.english : correctOption.nepali)
      : correctAnswerId

    const hasExplanation = explanation && explanation.trim()
    const hasCorrectAnswer = correctAnswerId && correctAnswerId.trim()

    if (!hasExplanation && !hasCorrectAnswer) return null

    return (
      <div className="mt-3 bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg">
        <div className="text-sm space-y-3">
          {hasCorrectAnswer && (
            <div>
              <div className="flex items-start gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span className="font-medium text-amber-800">
                  {language === "english" ? "Correct Answer" : "सही उत्तर"}:
                </span>
              </div>
              <div className="ml-6">
                <span className="text-amber-700"><strong>({correctAnswerId})</strong> <MathText text={correctAnswerText || ""} /></span>
              </div>
            </div>
          )}
          {hasExplanation && (
            <div>
              <div className="flex items-start gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span className="font-medium text-amber-800">
                  {language === "english" ? "Explanation" : "व्याख्या"}:
                </span>
              </div>
              <div className="ml-6">
                <CitationText text={explanation} subject="science" pageLanguage={language === "nepali" ? "np" : "en"} className="text-amber-700 whitespace-pre-line leading-relaxed" />
              </div>
            </div>
          )}
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
          <p className="text-slate-600">
            {language === "english" ? "No Group A questions available" : "समूह क का प्रश्नहरू उपलब्ध छैनन्"}
          </p>
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
              <CardTitle className="text-xl font-bold">
                {language === "english" ? "Group A - Multiple Choice" : "समूह क - बहुवैकल्पिक"}
              </CardTitle>
              <p className="text-blue-100 mt-1">
                {language === "english"
                  ? "Choose the best answer for each question"
                  : "प्रत्येक प्रश्नको लागि सही उत्तर छान्नुहोस्"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowExplanations(!showExplanations)}
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                {showExplanations ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="ml-1 hidden sm:inline">
                  {showExplanations
                    ? (language === "english" ? "Hide" : "लुकाउनुहोस्")
                    : (language === "english" ? "Show" : "देखाउनुहोस्")} {language === "english" ? "Help" : "सहायता"}
                </span>
              </Button>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {answeredCount}/{questions.length}
              </Badge>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={progressPercentage} className="h-2 bg-blue-400/30" />
            <p className="text-xs text-blue-100 mt-1">
              {Math.round(progressPercentage)}% {language === "english" ? "complete" : "पूर्ण"}
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((question, index) => {
          const isAnswered = answers[question.id] !== undefined
          const selectedAnswer = answers[question.id]
          const questionText = language === "english" ? question.english : question.nepali

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
                      <CardTitle className="text-base font-semibold text-slate-800">
                        {language === "english" ? "Question" : "प्रश्न"} {index + 1}
                      </CardTitle>
                      <div className="text-slate-700 mt-2 leading-relaxed">
                        <MathText text={questionText} />
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-3 whitespace-nowrap flex-shrink-0">
                    {language === "english" ? ((question as any).marksEnglish || question.marks) : ((question as any).marksNepali || question.marks)} {language === "english" ? "mark" : "अंक"}{(language === "english" ? ((question as any).marksEnglish || question.marks) : ((question as any).marksNepali || question.marks)) !== 1 ? (language === "english" ? "s" : "") : ""}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <RadioGroup
                  value={selectedAnswer || ""}
                  onValueChange={(value) => onAnswerChange(question.id, value)}
                  className="space-y-3"
                >
                  {question.options.map((option) => {
                    const optionText = language === "english" ? option.english : option.nepali

                    return (
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
                            <MathText text={optionText} />
                          </div>
                        </Label>
                      </div>
                    )
                  })}
                </RadioGroup>

                {renderExplanation(question)}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
