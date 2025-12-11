"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, Eye, EyeOff, Lightbulb, MapPin, PenLine } from "lucide-react"
import type { SocialStudiesGroup, SocialStudiesQuestion } from "@/lib/social-studies-types"

interface SocialStudiesGroupProps {
    group: SocialStudiesGroup
    groupIndex: number
    answers: Record<string, string>
    onAnswerChange: (questionId: string, answer: string) => void
}

// Get color scheme based on group index
const getGroupColor = (index: number) => {
    const colors = [
        "from-blue-500 to-blue-600",      // Group क (very short)
        "from-green-500 to-green-600",    // Group ख (short)
        "from-purple-500 to-purple-600",  // Group ग (long)
    ]
    return colors[index % colors.length]
}

// Get question type display info
const getQuestionTypeInfo = (type: string) => {
    switch (type) {
        case "very_short_answer":
            return { label: "अति छोटो उत्तर", rows: 2, icon: PenLine }
        case "short_answer":
            return { label: "छोटो उत्तर", rows: 4, icon: PenLine }
        case "long_answer":
            return { label: "लामो उत्तर", rows: 8, icon: PenLine }
        case "creative_writing_editorial":
            return { label: "सम्पादकीय", rows: 10, icon: PenLine }
        case "creative_writing_dialogue":
            return { label: "संवाद", rows: 8, icon: PenLine }
        case "creative_writing_speech":
            return { label: "वक्तृता", rows: 10, icon: PenLine }
        case "map_drawing":
            return { label: "नक्सा", rows: 6, icon: MapPin }
        default:
            return { label: "उत्तर", rows: 4, icon: PenLine }
    }
}

export function SocialStudiesGroupRenderer({
    group,
    groupIndex,
    answers,
    onAnswerChange,
}: SocialStudiesGroupProps) {
    const [showExplanations, setShowExplanations] = useState(false)

    const answeredCount = group.questions.filter(
        (q) => answers[q.id] && answers[q.id].trim().length > 0
    ).length
    const progressPercentage = group.questions.length > 0
        ? (answeredCount / group.questions.length) * 100
        : 0

    const renderExplanation = (question: SocialStudiesQuestion) => {
        if (!showExplanations) return null

        const hasAnswer = question.answerNepali && question.answerNepali.trim()
        const hasExplanation = question.explanationNepali && question.explanationNepali.trim()

        if (!hasAnswer && !hasExplanation) return null

        return (
            <div className="mt-3 space-y-2">
                {hasAnswer && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-sm">
                            <div className="flex items-start gap-2 mb-2">
                                <Lightbulb className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="font-medium text-green-800">नमूना उत्तर:</span>
                            </div>
                            <div className="ml-6">
                                <p className="text-green-700 whitespace-pre-line leading-relaxed">{question.answerNepali}</p>
                            </div>
                        </div>
                    </div>
                )}
                {hasExplanation && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-sm">
                            <div className="flex items-start gap-2 mb-2">
                                <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <span className="font-medium text-blue-800">व्याख्या:</span>
                            </div>
                            <div className="ml-6">
                                <p className="text-blue-700 whitespace-pre-line leading-relaxed">{question.explanationNepali}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    const renderMapAlternatives = (question: SocialStudiesQuestion) => {
        if (question.type !== "map_drawing" || !question.alternatives) return null

        return (
            <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="text-sm">
                    <span className="font-medium text-amber-800">वैकल्पिक प्रश्नहरू:</span>
                    <div className="mt-2 space-y-2">
                        {question.alternatives.map((alt, idx) => (
                            <div key={idx} className="ml-2">
                                <span className="text-amber-700">
                                    {alt.type === "main" && "• मुख्य: "}
                                    {alt.type === "alternative" && "• वैकल्पिक: "}
                                    {alt.type === "for_visually_impaired" && "• दृष्टिविहीनहरूका लागि: "}
                                </span>
                                <span className="text-amber-900">{alt.questionNepali}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (group.questions.length === 0) {
        return (
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-white/20">
                <CardContent className="flex items-center justify-center py-8">
                    <p className="text-slate-600">यस समूहमा प्रश्नहरू उपलब्ध छैनन्</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className={`bg-gradient-to-r ${getGroupColor(groupIndex)} text-white shadow-lg border border-white/20`}>
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold">{group.groupName}</CardTitle>
                            <p className="text-white/90 mt-1">{group.groupInstruction}</p>
                            {group.marksSchema && (
                                <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-white/30">
                                    {group.marksSchema}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setShowExplanations(!showExplanations)}
                                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                            >
                                {showExplanations ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                <span className="ml-1 hidden sm:inline">{showExplanations ? "लुकाउनुहोस्" : "सहायता"}</span>
                            </Button>
                            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                                {answeredCount}/{group.questions.length}
                            </Badge>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Progress value={progressPercentage} className="h-2 bg-white/30" />
                        <p className="text-xs text-white/90 mt-1">{Math.round(progressPercentage)}% पूरा भयो</p>
                    </div>
                </CardHeader>
            </Card>

            {/* Questions */}
            <div className="space-y-4">
                {group.questions.map((question, index) => {
                    const currentAnswer = answers[question.id] || ""
                    const isAnswered = currentAnswer.trim().length > 0
                    const typeInfo = getQuestionTypeInfo(question.type)
                    const TypeIcon = typeInfo.icon

                    return (
                        <Card key={question.id} className="bg-white/90 backdrop-blur-sm shadow-lg border border-white/20">
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {isAnswered ? (
                                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                            ) : (
                                                <Circle className="h-5 w-5 text-slate-400" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <CardTitle className="text-base font-semibold text-slate-800">
                                                    प्रश्न {question.questionNumber}
                                                </CardTitle>
                                                <Badge variant="outline" className="text-xs">
                                                    <TypeIcon className="h-3 w-3 mr-1" />
                                                    {typeInfo.label}
                                                </Badge>
                                            </div>
                                            <p className="text-slate-700 mt-2 leading-relaxed text-lg">
                                                {question.questionNepali}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="ml-3">
                                        {question.marks} अंक
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                                {/* Show alternatives for map_drawing questions */}
                                {renderMapAlternatives(question)}

                                <Textarea
                                    value={currentAnswer}
                                    onChange={(e) => onAnswerChange(question.id, e.target.value)}
                                    placeholder={`यहाँ आफ्नो उत्तर लेख्नुहोस्...`}
                                    className="min-h-[80px] resize-none mt-3 text-lg"
                                    rows={typeInfo.rows}
                                />

                                <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                                    <span>
                                        {question.type === "very_short_answer" && "छोटो र सटीक उत्तर दिनुहोस्"}
                                        {question.type === "short_answer" && "स्पष्ट र संक्षिप्त उत्तर दिनुहोस्"}
                                        {question.type === "long_answer" && "विस्तृत उत्तर दिनुहोस्"}
                                        {question.type.startsWith("creative_writing") && "रचनात्मक र मौलिक लेखन गर्नुहोस्"}
                                        {question.type === "map_drawing" && "नक्सा वर्णन वा विवरण लेख्नुहोस्"}
                                    </span>
                                    <span className={currentAnswer.length > 10 ? "text-green-600" : "text-slate-400"}>
                                        {currentAnswer.length} अक्षर
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
