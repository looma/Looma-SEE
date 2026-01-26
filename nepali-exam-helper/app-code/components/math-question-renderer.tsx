"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Lightbulb } from "lucide-react"
import { MathText } from "./math-text"
import { CitationText } from "./citation-text"
import { useLanguage } from "@/lib/language-context"
import type { MathQuestion, MathSubQuestion } from "@/lib/math-types"

interface MathQuestionRendererProps {
    questions: MathQuestion[]
    answers: Record<string, Record<string, string>> // { questionNumber: { subLabel: answer } }
    onAnswerChange: (questionNumber: number, subLabel: string, answer: string) => void
    showExplanations?: boolean
}

export function MathQuestionRenderer({
    questions,
    answers,
    onAnswerChange,
    showExplanations = true,
}: MathQuestionRendererProps) {
    const { language } = useLanguage()
    const [showHelpForQuestion, setShowHelpForQuestion] = useState<Record<number, boolean>>({})

    const toggleQuestionHelp = (qNum: number) => {
        setShowHelpForQuestion((prev) => ({
            ...prev,
            [qNum]: !prev[qNum],
        }))
    }

    return (
        <div className="space-y-6">
            {questions.map((question) => {
                const qNum = question.question_numberEnglish
                const displayQNum = language === "english"
                    ? question.question_numberEnglish
                    : question.question_numberNepali
                const contextText = language === "english"
                    ? question.context.English
                    : question.context.Nepali

                return (
                    <Card key={qNum} className="overflow-hidden">
                        <CardHeader className="bg-blue-600 text-white [&_*]:text-white">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg text-white" style={{ color: 'white' }}>
                                    {language === "english" ? "Question" : "प्रश्न"} {displayQNum}
                                </CardTitle>
                                <div className="flex items-center gap-2">

                                    <Badge variant="secondary" className="bg-white/20 text-white">
                                        {question.sub_questions.length} {language === "english" ? "part" : "भाग"}{question.sub_questions.length > 1 ? (language === "english" ? "s" : "हरू") : ""}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            {/* Context / Problem Statement */}
                            <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-blue-500">
                                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                                    <MathText text={contextText} />
                                </p>
                            </div>

                            {/* Sub-questions */}
                            <div className="space-y-4">
                                {question.sub_questions.map((subQ: MathSubQuestion) => {
                                    const labelKey = subQ.labelEnglish // Always use English for storage keys
                                    const displayLabel = language === "english" ? subQ.labelEnglish : subQ.labelNepali
                                    const subQuestionText = language === "english" ? subQ.questionEnglish : subQ.questionNepali
                                    const marks = subQ.marksEnglish

                                    const questionKey = `${qNum}`
                                    const currentAnswer = answers[questionKey]?.[labelKey] || ""
                                    const isHelpVisible = showHelpForQuestion[qNum]

                                    // Handle questions with empty sub-question text (single-part questions)
                                    const hasSubQuestionText = !!subQuestionText
                                    // Hide label if single sub-question with no text
                                    const showLabel = question.sub_questions.length > 1 || hasSubQuestionText

                                    return (
                                        <div key={labelKey} className="border rounded-lg p-4 bg-white">
                                            {/* Sub-question label, text, and marks */}
                                            <div className={`flex items-start gap-3 ${showLabel ? 'mb-3' : ''}`}>
                                                {showLabel && (
                                                    <Badge
                                                        variant="outline"
                                                        className="font-bold text-blue-600 border-blue-300 min-w-[28px] justify-center"
                                                    >
                                                        {displayLabel}
                                                    </Badge>
                                                )}
                                                <div className="flex-1">
                                                    {hasSubQuestionText && (
                                                        <p className="text-slate-700 whitespace-pre-line">
                                                            <MathText text={subQuestionText} />
                                                        </p>
                                                    )}
                                                </div>
                                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                                    {language === "english" ? marks : (language === "nepali" ? subQ.marksNepali : marks)} {language === "english" ? "mark" : "अंक"}{marks > 1 ? (language === "english" ? "s" : "") : ""}
                                                </Badge>
                                            </div>

                                            {/* Answer textarea */}
                                            <Textarea
                                                placeholder={language === "english"
                                                    ? `Enter your answer for part (${displayLabel})...`
                                                    : `भाग (${displayLabel}) को उत्तर लेख्नुहोस्...`}
                                                value={currentAnswer}
                                                onChange={(e) =>
                                                    onAnswerChange(qNum, labelKey, e.target.value)
                                                }
                                                className="min-h-[80px] mt-2"
                                            />

                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
