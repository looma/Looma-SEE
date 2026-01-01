"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, Eye, EyeOff, Lightbulb, MapPin, PenLine } from "lucide-react"
import type { SocialStudiesGroup, SocialStudiesQuestion } from "@/lib/social-studies-types"
import { useLanguage } from "@/lib/language-context"

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

// Get question type display info in both languages
const getQuestionTypeInfo = (type: string, lang: 'en' | 'np') => {
    const labels = {
        very_short_answer: { np: "अति छोटो उत्तर", en: "Very Short Answer" },
        short_answer: { np: "छोटो उत्तर", en: "Short Answer" },
        long_answer: { np: "लामो उत्तर", en: "Long Answer" },
        creative_writing_editorial: { np: "सम्पादकीय", en: "Editorial" },
        creative_writing_dialogue: { np: "संवाद", en: "Dialogue" },
        creative_writing_speech: { np: "वक्तृता", en: "Speech" },
        map_drawing: { np: "नक्सा", en: "Map" },
    }
    const rows = {
        very_short_answer: 2,
        short_answer: 4,
        long_answer: 8,
        creative_writing_editorial: 10,
        creative_writing_dialogue: 8,
        creative_writing_speech: 10,
        map_drawing: 6,
    }
    const info = labels[type as keyof typeof labels] || { np: "उत्तर", en: "Answer" }
    return {
        label: lang === 'np' ? info.np : info.en,
        rows: rows[type as keyof typeof rows] || 4,
        icon: type === "map_drawing" ? MapPin : PenLine
    }
}

// UI text translations
const uiText = {
    sampleAnswer: { np: "नमूना उत्तर:", en: "Sample Answer:" },
    explanation: { np: "व्याख्या:", en: "Explanation:" },
    alternativeQuestions: { np: "वैकल्पिक प्रश्नहरू:", en: "Alternative Questions:" },
    main: { np: "मुख्य", en: "Main" },
    alternative: { np: "वैकल्पिक", en: "Alternative" },
    forVisuallyImpaired: { np: "दृष्टिविहीनहरूका लागि", en: "For Visually Impaired" },
    noQuestionsInGroup: { np: "यस समूहमा प्रश्नहरू उपलब्ध छैनन्", en: "No questions available in this group" },
    hide: { np: "लुकाउनुहोस्", en: "Hide" },
    help: { np: "सहायता", en: "Help" },
    completed: { np: "पूरा भयो", en: "completed" },
    question: { np: "प्रश्न", en: "Question" },
    marks: { np: "अंक", en: "marks" },
    characters: { np: "अक्षर", en: "characters" },
    writeAnswerHere: { np: "यहाँ आफ्नो उत्तर लेख्नुहोस्...", en: "Write your answer here..." },
    veryShortHint: { np: "छोटो र सटीक उत्तर दिनुहोस्", en: "Give a short and precise answer" },
    shortHint: { np: "स्पष्ट र संक्षिप्त उत्तर दिनुहोस्", en: "Give a clear and concise answer" },
    longHint: { np: "विस्तृत उत्तर दिनुहोस्", en: "Give a detailed answer" },
    creativeHint: { np: "रचनात्मक र मौलिक लेखन गर्नुहोस्", en: "Be creative and original in your writing" },
    mapHint: { np: "नक्सा वर्णन वा विवरण लेख्नुहोस्", en: "Describe or detail the map" },
}

export function SocialStudiesGroupRenderer({
    group,
    groupIndex,
    answers,
    onAnswerChange,
}: SocialStudiesGroupProps) {
    const [showExplanations, setShowExplanations] = useState(false)
    const { language } = useLanguage()
    const lang = language === 'nepali' ? 'np' : 'en'

    // Helper to get text based on language with Nepali fallback
    const getText = (nepali: string | undefined, english: string | undefined) => {
        if (lang === 'en') {
            return english || nepali || ''
        }
        return nepali || english || ''
    }

    const answeredCount = group.questions.filter(
        (q) => answers[q.id] && answers[q.id].trim().length > 0
    ).length
    const progressPercentage = group.questions.length > 0
        ? (answeredCount / group.questions.length) * 100
        : 0

    const renderExplanation = (question: SocialStudiesQuestion) => {
        if (!showExplanations) return null

        const answer = getText(question.answerNepali, question.answerEnglish)
        const explanation = getText(question.explanationNepali, question.explanationEnglish)
        const hasAnswer = answer?.trim()
        const hasExplanation = explanation?.trim()

        if (!hasAnswer && !hasExplanation) return null

        return (
            <div className="mt-3 bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg">
                <div className="text-sm space-y-3">
                    {hasAnswer && (
                        <div>
                            <div className="flex items-start gap-2 mb-2">
                                <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                <span className="font-medium text-amber-800">{uiText.sampleAnswer[lang]}</span>
                            </div>
                            <div className="ml-6">
                                <p className="text-amber-700 whitespace-pre-line leading-relaxed">{answer}</p>
                            </div>
                        </div>
                    )}
                    {hasExplanation && (
                        <div>
                            <div className="flex items-start gap-2 mb-2">
                                <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                <span className="font-medium text-amber-800">{uiText.explanation[lang]}</span>
                            </div>
                            <div className="ml-6">
                                <p className="text-amber-700 whitespace-pre-line leading-relaxed">{explanation}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const renderMapAlternatives = (question: SocialStudiesQuestion) => {
        if (question.type !== "map_drawing" || !question.alternatives) return null

        return (
            <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="text-sm">
                    <span className="font-medium text-amber-800">{uiText.alternativeQuestions[lang]}</span>
                    <div className="mt-2 space-y-2">
                        {question.alternatives.map((alt, idx) => {
                            const altText = getText(alt.questionNepali, alt.questionEnglish)
                            const altLabel = alt.type === "main"
                                ? uiText.main[lang]
                                : alt.type === "alternative"
                                    ? uiText.alternative[lang]
                                    : uiText.forVisuallyImpaired[lang]
                            return (
                                <div key={idx} className="ml-2">
                                    <span className="text-amber-700">• {altLabel}: </span>
                                    <span className="text-amber-900 whitespace-pre-line">{altText}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }

    // Get group display text
    const groupName = getText(group.groupName, group.groupNameEnglish)
    const groupInstruction = getText(group.groupInstruction, group.groupInstructionEnglish)
    const marksSchema = getText(group.marksSchema, group.marksSchemaEnglish)

    if (group.questions.length === 0) {
        return (
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-white/20">
                <CardContent className="flex items-center justify-center py-8">
                    <p className="text-slate-600">{uiText.noQuestionsInGroup[lang]}</p>
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
                            <CardTitle className="text-xl font-bold">{groupName}</CardTitle>
                            <p className="text-white/90 mt-1">{groupInstruction}</p>
                            {marksSchema && (
                                <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-white/30">
                                    {marksSchema}
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
                                <span className="ml-1 hidden sm:inline">{showExplanations ? uiText.hide[lang] : uiText.help[lang]}</span>
                            </Button>
                            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                                {answeredCount}/{group.questions.length}
                            </Badge>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Progress value={progressPercentage} className="h-2 bg-white/30" />
                        <p className="text-xs text-white/90 mt-1">{Math.round(progressPercentage)}% {uiText.completed[lang]}</p>
                    </div>
                </CardHeader>
            </Card>

            {/* Questions */}
            <div className="space-y-4">
                {group.questions.map((question) => {
                    const currentAnswer = answers[question.id] || ""
                    const isAnswered = currentAnswer.trim().length > 0
                    const typeInfo = getQuestionTypeInfo(question.type, lang)
                    const TypeIcon = typeInfo.icon

                    // Get question text
                    const questionText = getText(question.questionNepali, question.questionEnglish)
                    const questionNumber = lang === 'en'
                        ? (question.questionNumberEnglish || question.questionNumber || '')
                        : (question.questionNumberNepali || question.questionNumber || '')
                    const marksValue = lang === 'en'
                        ? (question.marksEnglish || question.marks || 0)
                        : (question.marksNepali || question.marks || 0)

                    // Get hint text based on question type
                    const getHintText = () => {
                        if (question.type === "very_short_answer") return uiText.veryShortHint[lang]
                        if (question.type === "short_answer") return uiText.shortHint[lang]
                        if (question.type === "long_answer") return uiText.longHint[lang]
                        if (question.type.startsWith("creative_writing")) return uiText.creativeHint[lang]
                        if (question.type === "map_drawing") return uiText.mapHint[lang]
                        return ""
                    }

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
                                                    {uiText.question[lang]} {questionNumber}
                                                </CardTitle>
                                                <Badge variant="outline" className="text-xs">
                                                    <TypeIcon className="h-3 w-3 mr-1" />
                                                    {typeInfo.label}
                                                </Badge>
                                            </div>
                                            <p className="text-slate-700 mt-2 leading-relaxed text-lg whitespace-pre-line">
                                                {questionText}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="ml-3">
                                        {marksValue} {uiText.marks[lang]}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                                {/* Show alternatives for map_drawing questions */}
                                {renderMapAlternatives(question)}

                                <Textarea
                                    value={currentAnswer}
                                    onChange={(e) => onAnswerChange(question.id, e.target.value)}
                                    placeholder={uiText.writeAnswerHere[lang]}
                                    className="min-h-[80px] resize-none mt-3 text-lg"
                                    rows={typeInfo.rows}
                                />

                                <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                                    <span>{getHintText()}</span>
                                    <span className={currentAnswer.length > 10 ? "text-green-600" : "text-slate-400"}>
                                        {currentAnswer.length} {uiText.characters[lang]}
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
