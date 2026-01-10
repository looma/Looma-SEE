"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, Eye, EyeOff, Lightbulb } from "lucide-react"
import { MathText } from "./math-text"
import { useLanguage } from "@/lib/language-context"
import type { FreeResponseQuestion } from "@/lib/use-questions"

interface FreeResponseGroupProps {
  group: "B" | "C" | "D"
  questions: FreeResponseQuestion[]
  answers: Record<string, string>
  onAnswerChange: (group: "B" | "C" | "D", id: string, answer: string) => void
  progress: number
}

export function FreeResponseGroup({
  group,
  questions,
  answers,
  onAnswerChange,
  progress,
}: FreeResponseGroupProps) {
  const { language } = useLanguage()
  const [showExplanations, setShowExplanations] = useState(false)

  const renderExplanation = (question: FreeResponseQuestion) => {
    if (!showExplanations) return null

    const explanation = language === "english"
      ? ((question as any).explanationEnglish || (question as any).explanation)
      : ((question as any).explanationNepali || (question as any).explanation)
    const sampleAnswer = language === "english"
      ? ((question as any).sampleAnswerEnglish || question.sampleAnswer)
      : ((question as any).sampleAnswerNepali || question.sampleAnswer)

    const hasExplanation = explanation && explanation.trim()
    const hasSampleAnswer = sampleAnswer && sampleAnswer.trim()

    // Don't render if neither exists
    if (!hasExplanation && !hasSampleAnswer) return null

    // Show both sample answer and explanation together (like Math tests)
    return (
      <div className="mt-3">
        <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg">
          <div className="text-sm space-y-3">
            {hasSampleAnswer && (
              <div>
                <div className="flex items-start gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span className="font-medium text-amber-800">
                    {language === "english" ? "Sample Answer" : "नमूना उत्तर"}:
                  </span>
                </div>
                <div className="ml-6">
                  <MathText text={sampleAnswer || ""} className="text-amber-700 whitespace-pre-line leading-relaxed" />
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
                  <MathText text={explanation} className="text-amber-700 whitespace-pre-line leading-relaxed" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const getGroupInfo = (group: string) => {
    if (language === "english") {
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
    } else {
      // Nepali
      switch (group) {
        case "B":
          return {
            title: "समूह ख - छोटो उत्तर प्रश्नहरू",
            description: "संक्षिप्त र स्पष्ट उत्तर दिनुहोस्",
            color: "from-green-500 to-green-600",
          }
        case "C":
          return {
            title: "समूह ग - लामो उत्तर प्रश्नहरू",
            description: "विस्तृत व्याख्या लेख्नुहोस्",
            color: "from-purple-500 to-purple-600",
          }
        case "D":
          return {
            title: "समूह घ - प्रयोगात्मक प्रश्नहरू",
            description: "अवधारणाहरू लागू गरी समस्या समाधान गर्नुहोस्",
            color: "from-orange-500 to-orange-600",
          }
        default:
          return {
            title: "खुला उत्तर प्रश्नहरू",
            description: "आफ्नो उत्तर स्पष्ट रूपमा लेख्नुहोस्",
            color: "from-slate-500 to-slate-600",
          }
      }
    }
  }

  const answeredCount = Object.values(answers).filter((answer) => answer && typeof answer === 'string' && answer.trim().length > 0).length
  const progressPercentage = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0
  const groupInfo = getGroupInfo(group)

  if (questions.length === 0) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-white/20">
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-slate-600">
            {language === "english"
              ? `No Group ${group} questions available`
              : `समूह ${group === "B" ? "ख" : group === "C" ? "ग" : "घ"} प्रश्नहरू उपलब्ध छैनन्`}
          </p>
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
            <Progress value={progressPercentage} className="h-2 bg-white/30" />
            <p className="text-xs text-white/90 mt-1">
              {Math.round(progressPercentage)}% {language === "english" ? "complete" : "पूर्ण"}
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((question, index) => {
          const currentAnswer = answers[question.id] || ""
          const isAnswered = currentAnswer.trim().length > 0
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
                <Textarea
                  value={currentAnswer}
                  onChange={(e) => onAnswerChange(group, question.id, e.target.value)}
                  placeholder={language === "english"
                    ? `Write your answer here... ${group === "B" ? "(Brief answer)" : group === "C" ? "(Detailed explanation)" : "(Apply concepts)"}`
                    : `यहाँ आफ्नो उत्तर लेख्नुहोस्... ${group === "B" ? "(संक्षिप्त उत्तर)" : group === "C" ? "(विस्तृत व्याख्या)" : "(अवधारणा प्रयोग)"}`}
                  className="min-h-[120px] resize-none"
                  rows={group === "B" ? 4 : group === "C" ? 6 : 5}
                />

                <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                  <span>
                    {language === "english" ? (
                      <>
                        {group === "B" && "Keep it concise but complete"}
                        {group === "C" && "Provide detailed explanations with examples"}
                        {group === "D" && "Show your working and reasoning"}
                      </>
                    ) : (
                      <>
                        {group === "B" && "संक्षिप्त तर पूर्ण राख्नुहोस्"}
                        {group === "C" && "उदाहरणसहित विस्तृत व्याख्या दिनुहोस्"}
                        {group === "D" && "आफ्नो कार्यविधि र तर्क देखाउनुहोस्"}
                      </>
                    )}
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
