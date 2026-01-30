"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, Eye, EyeOff, Lightbulb, PenLine } from "lucide-react"
import type { SocialStudiesGroup, SocialStudiesQuestion } from "@/lib/social-studies-types"
import { useLanguage } from "@/lib/language-context"
import { CitationText } from "./citation-text"

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
        creative_writing_letter: { np: "पत्र", en: "Letter" },
        creative_writing_news_report: { np: "समाचार", en: "News Report" },
        creative_writing_article: { np: "लेख", en: "Article" },
    }
    const rows = {
        very_short_answer: 2,
        short_answer: 4,
        long_answer: 8,
        creative_writing_editorial: 10,
        creative_writing_dialogue: 8,
        creative_writing_speech: 10,
        creative_writing_letter: 8,
        creative_writing_news_report: 8,
        creative_writing_article: 8,
    }
    const info = labels[type as keyof typeof labels] || { np: "उत्तर", en: "Answer" }
    return {
        label: lang === 'np' ? info.np : info.en,
        rows: rows[type as keyof typeof rows] || 4,
        icon: PenLine
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
    mark: { np: "अंक", en: "mark" },
    characters: { np: "अक्षर", en: "characters" },
    writeAnswerHere: { np: "यहाँ आफ्नो उत्तर लेख्नुहोस्...", en: "Write your answer here..." },
    veryShortHint: { np: "छोटो र सटीक उत्तर दिनुहोस्", en: "Give a short and precise answer" },
    shortHint: { np: "स्पष्ट र संक्षिप्त उत्तर दिनुहोस्", en: "Give a clear and concise answer" },
    longHint: { np: "विस्तृत उत्तर दिनुहोस्", en: "Give a detailed answer" },
    creativeHint: { np: "रचनात्मक र मौलिक लेखन गर्नुहोस्", en: "Be creative and original in your writing" },
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
        (q) => answers[q.id] && typeof answers[q.id] === 'string' && answers[q.id].trim().length > 0
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
                                <CitationText text={explanation} subject="social" pageLanguage={lang === 'np' ? 'np' : 'en'} className="text-amber-700 whitespace-pre-line leading-relaxed" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // Get group info with hardcoded English/Nepali labels like Science
    const getGroupInfo = () => {
        if (language === 'english') {
            switch (groupIndex) {
                case 0: return { title: "Group A - Very Short Answer Questions", description: "Answer in a few words or one sentence" }
                case 1: return { title: "Group B - Short Answer Questions", description: "Provide brief, clear answers" }
                case 2: return { title: "Group C - Long Answer Questions", description: "Write detailed explanations" }
                default: return { title: `Group ${groupIndex + 1}`, description: "Answer the questions" }
            }
        } else {
            switch (groupIndex) {
                case 0: return { title: "समूह क - अति छोटो उत्तर प्रश्नहरू", description: "केही शब्द वा एक वाक्यमा उत्तर दिनुहोस्" }
                case 1: return { title: "समूह ख - छोटो उत्तर प्रश्नहरू", description: "संक्षिप्त र स्पष्ट उत्तर दिनुहोस्" }
                case 2: return { title: "समूह ग - लामो उत्तर प्रश्नहरू", description: "विस्तृत व्याख्या लेख्नुहोस्" }
                default: return { title: group.groupName || `समूह ${groupIndex + 1}`, description: group.groupInstruction || "" }
            }
        }
    }

    const groupInfo = getGroupInfo()

    // Convert Nepali numerals to English numerals
    const nepaliToEnglishNumerals = (text: string) => {
        const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९']
        let result = text
        nepaliDigits.forEach((nepali, index) => {
            result = result.replace(new RegExp(nepali, 'g'), index.toString())
        })
        return result
    }




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
                            <CardTitle className="text-xl font-bold">{groupInfo.title}</CardTitle>
                            <p className="text-white/90 mt-1">{groupInfo.description}</p>

                        </div>
                        <div className="flex items-center gap-3">
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
                                    <Badge variant="outline" className="ml-3 whitespace-nowrap flex-shrink-0">
                                        {marksValue} {marksValue === 1 ? uiText.mark[lang] : uiText.marks[lang]}
                                    </Badge>
                                </div>
                                {marksValue === 1 && (
                                    <p className="text-xs text-slate-500 italic mt-2 ml-8">
                                        {lang === 'en' ? 'Answer in full sentences' : 'पूर्ण वाक्यमा उत्तर दिनुहोस्'}
                                    </p>
                                )}
                            </CardHeader>

                            <CardContent className="pt-0">

                                <Textarea
                                    value={currentAnswer}
                                    onChange={(e) => onAnswerChange(question.id, e.target.value)}
                                    placeholder={uiText.writeAnswerHere[lang]}
                                    className="min-h-[80px] resize-none mt-3 text-lg"
                                    rows={typeInfo.rows}
                                />



                                {renderExplanation(question)}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
