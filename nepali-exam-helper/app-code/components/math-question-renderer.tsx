"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Lightbulb } from "lucide-react"
import { MathText } from "./math-text"
import type { MathQuestion } from "@/lib/math-types"

interface MathQuestionRendererProps {
    questions: MathQuestion[]
    answers: Record<string, Record<string, string>> // { questionNumber: { subLabel: answer } }
    onAnswerChange: (questionNumber: number, subLabel: string, answer: string) => void
    language: "nepali" | "english"
    showExplanations?: boolean
}

export function MathQuestionRenderer({
    questions,
    answers,
    onAnswerChange,
    language,
    showExplanations = false,
}: MathQuestionRendererProps) {
    const [expandedExplanations, setExpandedExplanations] = useState<Record<string, boolean>>({})

    const toggleExplanation = (key: string) => {
        setExpandedExplanations((prev) => ({
            ...prev,
            [key]: !prev[key],
        }))
    }

    return (
        <div className="space-y-6">
            {questions.map((question) => (
                <Card key={question.question_number} className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                                Question {question.question_number}
                            </CardTitle>
                            <Badge variant="secondary" className="bg-white/20 text-white">
                                {question.sub_questions.length} part{question.sub_questions.length > 1 ? "s" : ""}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                        {/* Context / Problem Statement */}
                        <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-blue-500">
                            <p className="text-slate-700 leading-relaxed">
                                <MathText text={question.context.english} />
                            </p>
                            <p className="text-slate-700 leading-relaxed mt-2">
                                <MathText text={question.context.nepali} />
                            </p>
                        </div>

                        {/* Sub-questions */}
                        <div className="space-y-4">
                            {question.sub_questions.map((subQ) => {
                                const questionKey = `${question.question_number}`
                                const currentAnswer = answers[questionKey]?.[subQ.label] || ""
                                const explanationKey = `${question.question_number}-${subQ.label}`
                                const isExplanationExpanded = expandedExplanations[explanationKey]

                                // Handle questions with empty sub-question text (single-part questions)
                                const hasSubQuestionText = subQ.question_nepali || subQ.question_english

                                return (
                                    <div key={subQ.label} className="border rounded-lg p-4 bg-white">
                                        {/* Sub-question label and text */}
                                        <div className="flex items-start gap-3 mb-3">
                                            <Badge
                                                variant="outline"
                                                className="font-bold text-blue-600 border-blue-300 min-w-[28px] justify-center"
                                            >
                                                {subQ.label}
                                            </Badge>
                                            {hasSubQuestionText && (
                                                <div className="flex-1">
                                                    <p className="text-slate-700">
                                                        <MathText text={subQ.question_english} />
                                                    </p>
                                                    <p className="text-slate-700 mt-1">
                                                        <MathText text={subQ.question_nepali} />
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Answer textarea */}
                                        <Textarea
                                            placeholder={`Enter your answer for part (${subQ.label})...`}
                                            value={currentAnswer}
                                            onChange={(e) =>
                                                onAnswerChange(question.question_number, subQ.label, e.target.value)
                                            }
                                            className="min-h-[80px] mt-2"
                                        />

                                        {/* Explanation toggle (for review/study mode) */}
                                        {showExplanations && subQ.explanation && (
                                            <div className="mt-3">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleExplanation(explanationKey)}
                                                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                >
                                                    <Lightbulb className="h-4 w-4 mr-2" />
                                                    {isExplanationExpanded ? "Hide" : "Show"} Explanation
                                                    {isExplanationExpanded ? (
                                                        <ChevronUp className="h-4 w-4 ml-1" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4 ml-1" />
                                                    )}
                                                </Button>

                                                {isExplanationExpanded && (
                                                    <div className="mt-2 bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg">
                                                        <div className="flex items-start gap-2">
                                                            <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                                            <div>
                                                                <p className="font-semibold text-amber-800 mb-1">
                                                                    Answer: <MathText text={subQ.answer} />
                                                                </p>
                                                                <div className="text-amber-700 text-sm leading-relaxed">
                                                                    <MathText text={subQ.explanation} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
