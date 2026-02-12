"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, PenLine } from "lucide-react"
import type { NepaliQuestion, NepaliSubQuestion } from "@/lib/nepali-types"
import type { AppLanguage } from "@/lib/language-context"
import { CitationText } from "./citation-text"

// UI text translations for bilingual support
const uiText = {
    selectMatch: { np: "जोडा छान्नुहोस्...", en: "Select match..." },
    writeAnswer: { np: "उत्तर लेख्नुहोस्...", en: "Write your answer..." },
    writeCorrectSentence: { np: "शुद्ध वाक्य लेख्नुहोस्...", en: "Write the correct sentence..." },
    writePOS: { np: "पदवर्ग लेख्नुहोस् (जस्तै: सर्वनाम, क्रियापद)", en: "Write the part of speech (e.g., pronoun, verb)" },
    writeTransformed: { np: "परिवर्तित अनुच्छेद लेख्नुहोस्...", en: "Write the transformed paragraph..." },
    writeTransformedSentence: { np: "रूपान्तरित वाक्य लेख्नुहोस्...", en: "Write the transformed sentence..." },
    writeSummary: { np: "सारांश लेख्नुहोस्...", en: "Write the summary..." },
    writeWithArgument: { np: "तर्कसहित उत्तर लेख्नुहोस्...", en: "Write your answer with reasoning..." },
    writeExplanation: { np: "व्याख्या लेख्नुहोस्...", en: "Write the explanation..." },
    writeCriticalAnalysis: { np: "समीक्षात्मक उत्तर लेख्नुहोस्...", en: "Write your critical analysis..." },
    writeEssay: { np: "निबन्ध लेख्नुहोस् (१५० शब्द नघटाई)...", en: "Write your essay (minimum 150 words)..." },
    point: { np: "बुँदा", en: "Point" },
    marks: { np: "अंक", en: "marks" },
    mark: { np: "अंक", en: "mark" },
    sampleAnswer: { np: "नमूना उत्तर:", en: "Sample Answer:" },
    explanation: { np: "व्याख्या:", en: "Explanation:" },
    hide: { np: "लुकाउनुहोस्", en: "Hide" },
    help: { np: "सहायता", en: "Help" },
    groupA: { np: "समूह 'क'", en: "Group 'A'" },
    groupB: { np: "समूह 'ख'", en: "Group 'B'" },
    writeOnPaper: { np: "✏️ कागजमा उत्तर लेख्नुहोस्", en: "✏️ Write your answer on paper" },
    writeOnPaperHint: { np: "यो प्रश्नको उत्तर कागजमा लेख्नुहोस् र पछि नमूना उत्तरसँग तुलना गर्नुहोस्।", en: "Write your answer for this question on paper, then compare with the sample answer after submitting." },
}

// Reusable "Write on paper" notice for question types that require Nepali typing
function PaperAnswerNotice({ language }: { language?: AppLanguage }) {
    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <PenLine className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
                <p className="font-medium text-blue-800">
                    {getUIText(language, 'writeOnPaper')}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                    {getUIText(language, 'writeOnPaperHint')}
                </p>
            </div>
        </div>
    )
}

// Helper function to format answers for display (avoid raw JSON)
function formatAnswerForDisplay(answer: any): string {
    if (typeof answer === 'string') return answer
    if (answer === null || answer === undefined) return ''

    // Handle matching question arrays: [{ A: "i", B: "c" }, ...]
    if (Array.isArray(answer)) {
        return answer.map((item, idx) => {
            if (item && typeof item === 'object') {
                // Matching format: { A: "i", B: "c" }
                if (item.A && item.B) return `(${item.A}) → (${item.B})`
                // General object format
                return Object.entries(item).map(([k, v]) => `${k}: ${v}`).join(', ')
            }
            return String(item)
        }).join('\n')
    }

    // Handle objects
    if (typeof answer === 'object') {
        // Filter out 'selected' keys and format entries
        const entries = Object.entries(answer).filter(([k]) => !k.startsWith('selected'))
        return entries.map(([k, v]) => {
            if (typeof v === 'object' && v !== null) {
                return `${k}: ${formatAnswerForDisplay(v)}`
            }
            return `${k} → ${v}`
        }).join('\n')
    }

    return String(answer)
}

interface NepaliQuestionRendererProps {
    question: NepaliQuestion
    answer: any
    onAnswerChange: (questionId: string, value: any) => void
    questionIndex: number
    showExplanation?: boolean
    language?: AppLanguage
}

// Helper function for bilingual text selection
function getText(language: AppLanguage | undefined, nepali: string | undefined, english: string | undefined): string {
    if (language === 'english') {
        return english || nepali || ''
    }
    return nepali || english || ''
}

// Helper for UI text
function getUIText(language: AppLanguage | undefined, key: keyof typeof uiText): string {
    const text = uiText[key]
    if (language === 'english') {
        return text.en
    }
    return text.np
}

// Helper component for rendering sub-question explanations and correct answers
function SubQuestionExplanation({ subQuestion, show, language }: { subQuestion: NepaliSubQuestion; show?: boolean; language?: AppLanguage }) {
    // Get bilingual explanation - prioritize language-specific fields
    const sub = subQuestion as any
    const explanation = language === 'english'
        ? (sub.explanationEnglish || sub.explanation || sub.explanationNepali)
        : (sub.explanationNepali || sub.explanation || sub.explanationEnglish)

    // Get bilingual correct answer - prioritize language-specific fields
    const correctAnswer = language === 'english'
        ? (sub.correctAnswerEnglish || sub.correctAnswer || sub.correctAnswerNepali)
        : (sub.correctAnswerNepali || sub.correctAnswer || sub.correctAnswerEnglish)

    // More robust empty check - handle whitespace-only strings
    const isEmptyValue = (val: any): boolean => {
        if (!val) return true
        if (typeof val === 'string') return !val.trim()
        if (Array.isArray(val)) return val.length === 0
        return false
    }

    const hasExplanation = explanation && !isEmptyValue(explanation)
    const hasCorrectAnswer = correctAnswer && !isEmptyValue(correctAnswer)

    if (!show || (!hasExplanation && !hasCorrectAnswer)) return null

    const labels = {
        sampleAnswer: language === 'english' ? 'Sample Answer:' : 'नमूना उत्तर:',
        explanation: language === 'english' ? 'Explanation:' : 'व्याख्या:',
    }

    return (
        <div className="mt-2 bg-amber-50 border-l-4 border-amber-500 p-2 rounded-r-lg">
            <div className="text-sm space-y-2">
                {hasCorrectAnswer && (
                    <div>
                        <span className="font-medium text-amber-800">{labels.sampleAnswer} </span>
                        <span className="text-amber-700 whitespace-pre-line">
                            {formatAnswerForDisplay(correctAnswer)}
                        </span>
                    </div>
                )}
                {hasExplanation && (
                    <div>
                        <span className="font-medium text-amber-800">{labels.explanation} </span>
                        <CitationText text={explanation} subject="nepali" pageLanguage={language === 'english' ? 'en' : 'np'} className="text-amber-700" />
                    </div>
                )}
            </div>
        </div>
    )
}

// Matching Question - dropdowns to match columns
function MatchingQuestion({ question, answer, onAnswerChange, questionIndex, language }: NepaliQuestionRendererProps) {
    const currentAnswer = answer || {}

    const handleMatch = (aId: string, bId: string) => {
        onAnswerChange(`q${question.questionNumberEnglish || question.questionNumber}`, { ...currentAnswer, [aId]: bId })
    }

    // Get bilingual headers
    const headerA = getText(language, question.columns?.A_headerNepali, question.columns?.A_headerEnglish) || getUIText(language, 'groupA')
    const headerB = getText(language, question.columns?.B_headerNepali, question.columns?.B_headerEnglish) || getUIText(language, 'groupB')

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="font-medium text-slate-700">{headerA}</div>
                <div className="font-medium text-slate-700">{headerB}</div>
            </div>
            {question.columns?.A?.map((itemA) => {
                const itemId = getText(language, itemA.idNepali, itemA.idEnglish) || itemA.id || ''
                const itemText = getText(language, itemA.textNepali, itemA.textEnglish) || itemA.text || ''
                return (
                    <div key={itemA.idEnglish || itemA.idNepali || itemA.id} className="grid grid-cols-2 gap-4 items-center">
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <span className="font-medium text-slate-700">({itemId})</span> {itemText}
                        </div>
                        <Select
                            value={currentAnswer[itemA.idEnglish || itemA.idNepali || itemA.id || ''] || ""}
                            onValueChange={(value) => handleMatch(itemA.idEnglish || itemA.idNepali || itemA.id || '', value)}
                        >
                            <SelectTrigger className="border-slate-300">
                                <SelectValue placeholder={getUIText(language, 'selectMatch')} />
                            </SelectTrigger>
                            <SelectContent>
                                {question.columns?.B?.map((itemB) => {
                                    const bId = getText(language, itemB.idNepali, itemB.idEnglish) || itemB.id || ''
                                    const bText = getText(language, itemB.textNepali, itemB.textEnglish) || itemB.text || ''
                                    return (
                                        <SelectItem key={itemB.idEnglish || itemB.idNepali || itemB.id} value={itemB.idEnglish || itemB.idNepali || itemB.id || ''}>
                                            ({bId}) {bText}
                                        </SelectItem>
                                    )
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                )
            })}
        </div>
    )
}

// Fill in the Blanks - paper-based
function FillInTheBlanksQuestion({ question, answer, onAnswerChange, questionIndex, showExplanation, language }: NepaliQuestionRendererProps) {
    const currentAnswer = answer || {}
    const qNum = question.questionNumberEnglish || question.questionNumber || 0
    const passage = getText(language, question.passageNepali, question.passageEnglish) || question.passage || ''

    return (
        <div className="space-y-4">
            {passage && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 leading-relaxed">
                    {passage}
                </div>
            )}
            <div className="space-y-3">
                {question.subQuestions?.map((sub) => {
                    const subId = sub.idEnglish || sub.idNepali || sub.id || ''
                    const subQuestion = getText(language, sub.questionNepali, sub.questionEnglish) || ''
                    return (
                        <div key={subId} className="space-y-1">
                            <div className="flex items-start gap-3">
                                <Badge variant="outline" className="shrink-0 mt-2">({getText(language, sub.idNepali, sub.idEnglish) || sub.id})</Badge>
                                <div className="flex-1">
                                    <Label className="text-slate-700 mb-2 block">{subQuestion}</Label>
                                </div>
                            </div>
                            <SubQuestionExplanation subQuestion={sub} show={showExplanation} language={language} />
                        </div>
                    )
                })}
            </div>
            <PaperAnswerNotice language={language} />
        </div>
    )
}

// Short Answer with passage
function ShortAnswerQuestion({ question, answer, onAnswerChange, questionIndex, language }: NepaliQuestionRendererProps) {
    const qNum = question.questionNumberEnglish || question.questionNumber || 0
    const passage = getText(language, question.passageNepali, question.passageEnglish) || question.passage || ''

    return (
        <div className="space-y-4">
            {passage && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 leading-relaxed whitespace-pre-line">
                    {passage}
                </div>
            )}
            <PaperAnswerNotice language={language} />
        </div>
    )
}

// Multiple Choice Question - radio button options
function MultipleChoiceQuestion({ question, answer, onAnswerChange, questionIndex, language }: NepaliQuestionRendererProps) {
    const currentAnswer = answer || ""
    const qNum = question.questionNumberEnglish || question.questionNumber || 0
    const passage = getText(language, question.passageNepali, question.passageEnglish) || question.passage || ''
    const options = (question as any).options || (question as any).choices || []

    return (
        <div className="space-y-4">
            {passage && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 leading-relaxed">
                    {passage}
                </div>
            )}
            <RadioGroup
                value={currentAnswer}
                onValueChange={(value) => onAnswerChange(`q${qNum}`, value)}
                className="space-y-2"
            >
                {options.map((opt: any, idx: number) => {
                    const optionText = typeof opt === 'string' ? opt :
                        getText(language, opt.textNepali, opt.textEnglish) || opt.text || opt.label || opt
                    const optionValue = typeof opt === 'string' ? opt :
                        opt.idEnglish || opt.idNepali || opt.id || opt.value || opt.text || String(idx)
                    return (
                        <div
                            key={idx}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${currentAnswer === optionValue
                                ? 'bg-amber-50 border-amber-300'
                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                                }`}
                            onClick={() => onAnswerChange(`q${qNum}`, optionValue)}
                        >
                            <div className="flex items-center gap-3">
                                <RadioGroupItem value={optionValue} id={`q${qNum}-opt-${questionIndex}-${idx}`} />
                                <Label htmlFor={`q${qNum}-opt-${questionIndex}-${idx}`} className="cursor-pointer flex-1">
                                    {optionText}
                                </Label>
                            </div>
                        </div>
                    )
                })}
            </RadioGroup>
        </div>
    )
}

// Spelling Correction - mixed multiple choice and text
function SpellingCorrectionQuestion({ question, answer, onAnswerChange, questionIndex, showExplanation, language }: NepaliQuestionRendererProps) {
    const currentAnswer = answer || {}
    const qNum = question.questionNumberEnglish || question.questionNumber || 0

    return (
        <div className="space-y-6">
            {question.subQuestions?.map((sub) => {
                const subId = sub.idEnglish || sub.idNepali || sub.id || ''
                const subTitle = getText(language, sub.titleNepali, sub.titleEnglish) || sub.title || ''
                return (
                    <div key={subId} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="font-medium text-slate-700 mb-3">({getText(language, sub.idNepali, sub.idEnglish) || sub.id}) {subTitle}</div>

                        {sub.type === "multiple_choice" && sub.choices && (
                            <div className="space-y-4">
                                {sub.choices.map((choice) => {
                                    const choiceId = choice.idEnglish || choice.idNepali || choice.id || ''
                                    const options = (language === 'english' ? choice.optionsEnglish : choice.optionsNepali) || choice.options || []
                                    return (
                                        <div key={choiceId} className="ml-4">
                                            <Label className="text-slate-600 mb-2 block">({getText(language, choice.idNepali, choice.idEnglish) || choice.id})</Label>
                                            <RadioGroup
                                                value={currentAnswer[subId]?.[choiceId] || ""}
                                                onValueChange={(value) => {
                                                    const subAnswer = currentAnswer[subId] || {}
                                                    onAnswerChange(`q${qNum}`, {
                                                        ...currentAnswer,
                                                        [subId]: { ...subAnswer, [choiceId]: value }
                                                    })
                                                }}
                                                className="flex flex-wrap gap-3"
                                            >
                                                {options.map((opt: string, optIdx: number) => (
                                                    <div key={optIdx} className="flex items-center space-x-2">
                                                        <RadioGroupItem value={opt} id={`q${qNum}-${subId}-${choiceId}-${optIdx}`} />
                                                        <Label htmlFor={`q${qNum}-${subId}-${choiceId}-${optIdx}`} className="cursor-pointer">{opt}</Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {sub.type === "sentence_correction" && (
                            <div className="space-y-2">
                                <div className="p-3 bg-slate-100 rounded border border-slate-300 text-slate-700">
                                    {getText(language, sub.questionNepali, sub.questionEnglish)}
                                </div>
                                <PaperAnswerNotice language={language} />
                            </div>
                        )}
                        <SubQuestionExplanation subQuestion={sub} show={showExplanation} language={language} />
                    </div>
                )
            })}
        </div>
    )
}

// Parts of Speech - identify word classes
function PartsOfSpeechQuestion({ question, answer, onAnswerChange, questionIndex, language }: NepaliQuestionRendererProps) {
    const currentAnswer = answer || {}
    const qNum = question.questionNumberEnglish || question.questionNumber || 0
    const passage = getText(language, question.passageNepali, question.passageEnglish) || question.passage || ''
    const correctWords = Array.isArray(question.correctAnswerNepali || question.correctAnswer)
        ? ((language === 'english' ? question.correctAnswerEnglish : question.correctAnswerNepali) || question.correctAnswer as any[]).map((p: any) => p.word || p['शब्द'] || '')
        : []

    return (
        <div className="space-y-4">
            {passage && (
                <div
                    className="p-4 bg-slate-50 rounded-lg border border-slate-200 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: passage.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 underline font-bold">$1</strong>') }}
                />
            )}
            <div className="space-y-3">
                <p className="font-medium text-slate-600 text-sm">
                    {language === 'english' ? 'Identify the part of speech for each word:' : 'प्रत्येक शब्दको शब्दभेद पहिचान गर्नुहोस्:'}
                </p>
                <div className="flex flex-wrap gap-2">
                    {correctWords.map((word: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-base px-3 py-1 bg-white border-slate-300">
                            {word}
                        </Badge>
                    ))}
                </div>
            </div>
            <PaperAnswerNotice language={language} />
        </div>
    )
}

// Word Formation - complex sub-questions
function WordFormationQuestion({ question, answer, onAnswerChange, questionIndex, showExplanation, language }: NepaliQuestionRendererProps) {
    const currentAnswer = answer || {}
    const qNum = question.questionNumberEnglish || question.questionNumber || 0

    return (
        <div className="space-y-6">
            {question.subQuestions?.map((sub) => {
                const subId = sub.idEnglish || sub.idNepali || sub.id || ''
                const subTitle = getText(language, sub.titleNepali, sub.titleEnglish) || sub.title || ''
                const subPassage = getText(language, sub.passageNepali, sub.passageEnglish) || sub.passage || ''
                return (
                    <div key={subId} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="font-medium text-slate-700 mb-3">({getText(language, sub.idNepali, sub.idEnglish) || sub.id}) {subTitle}</div>
                        {subPassage && (
                            <div className="p-3 bg-slate-100 rounded border border-slate-200 mb-3 text-sm leading-relaxed text-slate-700">
                                {subPassage}
                            </div>
                        )}
                        <SubQuestionExplanation subQuestion={sub} show={showExplanation} language={language} />
                    </div>
                )
            })}
            <PaperAnswerNotice language={language} />
        </div>
    )
}

// Tense Change - transform passage
function TenseChangeQuestion({ question, answer, onAnswerChange, questionIndex, language }: NepaliQuestionRendererProps) {
    const qNum = question.questionNumberEnglish || question.questionNumber || 0
    const passage = getText(language, question.passageNepali, question.passageEnglish) || question.passage || ''

    return (
        <div className="space-y-4">
            {passage && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 leading-relaxed whitespace-pre-line">
                    {passage}
                </div>
            )}
            <PaperAnswerNotice language={language} />
        </div>
    )
}

// Grammar Choice - choose one question to answer
function GrammarChoiceQuestion({ question, answer, onAnswerChange, questionIndex, showExplanation, language }: NepaliQuestionRendererProps) {
    const rawAnswer = typeof answer === 'object' && answer !== null ? answer : { response: typeof answer === 'string' ? answer : "" }
    const currentAnswer = { selectedOption: rawAnswer.selectedOption || "", response: rawAnswer.response || "" }
    const qNum = question.questionNumberEnglish || question.questionNumber || 0
    const selectedSub = question.subQuestions?.find(sub =>
        (sub.idEnglish || sub.idNepali || sub.id) === currentAnswer.selectedOption
    )

    return (
        <div className="space-y-4">
            <RadioGroup
                value={currentAnswer.selectedOption}
                onValueChange={(value) => onAnswerChange(`q${qNum}`, { ...currentAnswer, selectedOption: value })}
                className="space-y-3"
            >
                {question.subQuestions?.map((sub) => {
                    const subId = sub.idEnglish || sub.idNepali || sub.id || ''
                    const subTitle = getText(language, sub.titleNepali, sub.titleEnglish) || sub.title || ''
                    const subSentence = getText(language, sub.questionNepali, sub.questionEnglish) || ''
                    return (
                        <div key={subId} className={`p-4 rounded-lg border ${currentAnswer.selectedOption === subId ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="flex items-start gap-3">
                                <RadioGroupItem value={subId} id={`q${qNum}-choice-${subId}`} className="mt-1" />
                                <Label htmlFor={`q${qNum}-choice-${subId}`} className="cursor-pointer flex-1">
                                    <span className="font-medium">({getText(language, sub.idNepali, sub.idEnglish) || sub.id})</span> {subTitle}
                                    {/* Show the sentence to transform if it exists */}
                                    {subSentence && (
                                        <div className="mt-2 p-3 bg-white rounded border border-slate-200 text-slate-700">
                                            {subSentence}
                                        </div>
                                    )}
                                </Label>
                            </div>
                        </div>
                    )
                })}
            </RadioGroup>

            {currentAnswer.selectedOption && (
                <>
                    <PaperAnswerNotice language={language} />
                    {selectedSub && <SubQuestionExplanation subQuestion={selectedSub} show={showExplanation} language={language} />}
                </>
            )}
        </div>
    )
}

// Sentence Transformation - multiple sub-questions with hints
function SentenceTransformationQuestion({ question, answer, onAnswerChange, questionIndex, showExplanation, language }: NepaliQuestionRendererProps) {
    const currentAnswer = answer || {}
    const qNum = question.questionNumberEnglish || question.questionNumber || 0

    return (
        <div className="space-y-4">
            {question.subQuestions?.map((sub) => {
                const subId = sub.idEnglish || sub.idNepali || sub.id || ''
                const subQuestion = getText(language, sub.questionNepali, sub.questionEnglish) || ''
                return (
                    <div key={subId} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-start gap-2 mb-3">
                            <Badge variant="outline">({getText(language, sub.idNepali, sub.idEnglish) || sub.id})</Badge>
                            <div className="flex-1 text-slate-700">{subQuestion}</div>
                        </div>
                        <SubQuestionExplanation subQuestion={sub} show={showExplanation} language={language} />
                    </div>
                )
            })}
            <PaperAnswerNotice language={language} />
        </div>
    )
}

// Reading Comprehension - passage with sub-questions
function ReadingComprehensionQuestion({ question, answer, onAnswerChange, questionIndex, showExplanation, language }: NepaliQuestionRendererProps) {
    const currentAnswer = answer || {}
    const qNum = question.questionNumberEnglish || question.questionNumber || 0
    const passage = getText(language, question.passageNepali, question.passageEnglish) || question.passage || ''

    return (
        <div className="space-y-4">
            {passage && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 leading-relaxed whitespace-pre-line">
                    {passage}
                </div>
            )}
            <div className="space-y-4">
                {question.subQuestions?.map((sub) => {
                    const subId = sub.idEnglish || sub.idNepali || sub.id || ''
                    const subQuestion = getText(language, sub.questionNepali, sub.questionEnglish) || ''
                    return (
                        <div key={subId} className="p-4 bg-white rounded-lg border border-slate-200">
                            <div className="flex items-start gap-2 mb-3">
                                <Badge variant="outline">({getText(language, sub.idNepali, sub.idEnglish) || sub.id})</Badge>
                                <div className="flex-1 text-slate-700">{subQuestion}</div>
                            </div>
                            <SubQuestionExplanation subQuestion={sub} show={showExplanation} language={language} />
                        </div>
                    )
                })}
                <PaperAnswerNotice language={language} />
            </div>
        </div>
    )
}

// Free Writing Choice - pick one option to write
function FreeWritingChoiceQuestion({ question, answer, onAnswerChange, questionIndex, language }: NepaliQuestionRendererProps) {
    const rawAnswer = typeof answer === 'object' && answer !== null ? answer : { response: typeof answer === 'string' ? answer : "" }
    const currentAnswer = { selectedOption: rawAnswer.selectedOption || "", response: rawAnswer.response || "" }
    const qNum = question.questionNumberEnglish || question.questionNumber || 0

    return (
        <div className="space-y-4">
            <RadioGroup
                value={currentAnswer.selectedOption}
                onValueChange={(value) => onAnswerChange(`q${qNum}`, { ...currentAnswer, selectedOption: value })}
                className="space-y-3"
            >
                {question.options?.map((opt) => {
                    const optId = opt.idEnglish || opt.idNepali || opt.id || ''
                    const optTitle = getText(language, opt.titleNepali, opt.titleEnglish) || opt.title || ''
                    const clues = (language === 'english' ? opt.cluesEnglish : opt.cluesNepali) || opt.clues || []
                    return (
                        <div key={optId} className={`p-4 rounded-lg border ${currentAnswer.selectedOption === optId ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="flex items-start gap-3">
                                <RadioGroupItem value={optId} id={`q${qNum}-opt-${optId}`} className="mt-1" />
                                <Label htmlFor={`q${qNum}-opt-${optId}`} className="cursor-pointer flex-1">
                                    <span className="font-medium">({getText(language, opt.idNepali, opt.idEnglish) || opt.id})</span> {optTitle}
                                    {clues.length > 0 && (
                                        <ul className="mt-2 text-sm text-slate-600 list-disc list-inside">
                                            {clues.map((clue: string, idx: number) => <li key={idx}>{clue}</li>)}
                                        </ul>
                                    )}
                                </Label>
                            </div>
                        </div>
                    )
                })}
            </RadioGroup>

            {currentAnswer.selectedOption && (
                <PaperAnswerNotice language={language} />
            )}
        </div>
    )
}

// Note Taking - extract main points
function NoteTakingQuestion({ question, answer, onAnswerChange, questionIndex, language }: NepaliQuestionRendererProps) {
    const currentAnswer = answer || { points: ["", "", "", ""] }
    const qNum = question.questionNumberEnglish || question.questionNumber || 0
    const passage = getText(language, question.passageNepali, question.passageEnglish) || question.passage || ''
    const correctAnswer = question.correctAnswerNepali || question.correctAnswer
    const numPoints = Array.isArray(correctAnswer) ? correctAnswer.length : 4

    return (
        <div className="space-y-4">
            {passage && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 leading-relaxed">
                    {passage}
                </div>
            )}

            <PaperAnswerNotice language={language} />
        </div>
    )
}

// Summarization - write summary
function SummarizationQuestion({ question, answer, onAnswerChange, questionIndex, language }: NepaliQuestionRendererProps) {
    const qNum = question.questionNumberEnglish || question.questionNumber || 0
    const passage = getText(language, question.passageNepali, question.passageEnglish) || question.passage || ''

    return (
        <div className="space-y-4">
            {passage && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 leading-relaxed">
                    {passage}
                </div>
            )}
            <PaperAnswerNotice language={language} />
        </div>
    )
}

// Literature Short Answer - passage sections with sub-questions
function LiteratureShortAnswerQuestion({ question, answer, onAnswerChange, questionIndex, showExplanation, language }: NepaliQuestionRendererProps) {
    const currentAnswer = answer || {}
    const qNum = question.questionNumberEnglish || question.questionNumber || 0

    return (
        <div className="space-y-6">
            {question.subSections?.map((section) => {
                const sectionId = section.idEnglish || section.idNepali || section.id || ''
                const sectionMarks = section.marksEnglish || section.marks || 0
                const sectionPassage = getText(language, section.passageNepali, section.passageEnglish) || section.passage || ''
                return (
                    <div key={sectionId} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <Badge variant="outline" className="mb-3">
                            ({getText(language, section.idNepali, section.idEnglish) || section.id}) {sectionMarks} {sectionMarks === 1 ? getUIText(language, 'mark') : getUIText(language, 'marks')}
                        </Badge>
                        {sectionPassage && (
                            <div className="p-3 bg-white rounded border border-slate-200 mb-4 italic leading-relaxed whitespace-pre-line">
                                {sectionPassage}
                            </div>
                        )}
                        <div className="space-y-4">
                            {section.subQuestions?.map((sub) => {
                                const subId = sub.idEnglish || sub.idNepali || sub.id || ''
                                const subQuestion = getText(language, sub.questionNepali, sub.questionEnglish) || ''
                                const answerKey = `${sectionId}_${subId}`
                                return (
                                    <div key={subId}>
                                        <Label className="text-slate-700 mb-2 block">
                                            ({getText(language, sub.idNepali, sub.idEnglish) || sub.id}) {subQuestion}
                                        </Label>
                                        <SubQuestionExplanation subQuestion={sub} show={showExplanation} language={language} />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )
            })}
            <PaperAnswerNotice language={language} />
        </div>
    )
}

// Literature Argumentative - single essay question
function LiteratureArgumentativeQuestion({ question, answer, onAnswerChange, questionIndex, language }: NepaliQuestionRendererProps) {
    const qNum = question.questionNumberEnglish || question.questionNumber || 0
    return (
        <PaperAnswerNotice language={language} />
    )
}

// Literature Explanation - explain quotes
function LiteratureExplanationQuestion({ question, answer, onAnswerChange, questionIndex, language }: NepaliQuestionRendererProps) {
    const rawAnswer = typeof answer === 'object' && answer !== null ? answer : { response: typeof answer === 'string' ? answer : "" }
    const currentAnswer = { selectedOption: rawAnswer.selectedOption || "", response: rawAnswer.response || "" }
    const qNum = question.questionNumberEnglish || question.questionNumber || 0

    return (
        <div className="space-y-4">
            <RadioGroup
                value={currentAnswer.selectedOption}
                onValueChange={(value) => onAnswerChange(`q${qNum}`, { ...currentAnswer, selectedOption: value })}
                className="space-y-3"
            >
                {question.options?.map((opt) => {
                    const optId = opt.idEnglish || opt.idNepali || opt.id || ''
                    const quote = getText(language, (opt as any).quoteNepali, (opt as any).quoteEnglish) || (opt as any).quote || ''
                    return (
                        <div key={optId} className={`p-4 rounded-lg border ${currentAnswer.selectedOption === optId ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="flex items-start gap-3">
                                <RadioGroupItem value={optId} id={`q${qNum}-quote-${optId}`} className="mt-1" />
                                <Label htmlFor={`q${qNum}-quote-${optId}`} className="cursor-pointer flex-1 italic">
                                    <span className="font-medium not-italic">({getText(language, opt.idNepali, opt.idEnglish) || opt.id})</span> "{quote}"
                                </Label>
                            </div>
                        </div>
                    )
                })}
            </RadioGroup>

            {currentAnswer.selectedOption && (
                <PaperAnswerNotice language={language} />
            )}
        </div>
    )
}

// Literature Critical Analysis Choice - passage with analysis
function LiteratureCriticalAnalysisQuestion({ question, answer, onAnswerChange, questionIndex, language }: NepaliQuestionRendererProps) {
    const rawAnswer = typeof answer === 'object' && answer !== null ? answer : { response: typeof answer === 'string' ? answer : "" }
    const currentAnswer = { selectedOption: rawAnswer.selectedOption || "", response: rawAnswer.response || "" }
    const qNum = question.questionNumberEnglish || question.questionNumber || 0

    return (
        <div className="space-y-4">
            <RadioGroup
                value={currentAnswer.selectedOption}
                onValueChange={(value) => onAnswerChange(`q${qNum}`, { ...currentAnswer, selectedOption: value })}
                className="space-y-3"
            >
                {question.options?.map((opt) => {
                    const optId = opt.idEnglish || opt.idNepali || opt.id || ''
                    const optPassage = getText(language, opt.passageNepali, opt.passageEnglish) || opt.passage || ''
                    const optQuestion = getText(language, opt.questionNepali, opt.questionEnglish) || ''
                    return (
                        <div key={optId} className={`p-4 rounded-lg border ${currentAnswer.selectedOption === optId ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="flex items-start gap-3">
                                <RadioGroupItem value={optId} id={`q${qNum}-analysis-${optId}`} className="mt-1" />
                                <Label htmlFor={`q${qNum}-analysis-${optId}`} className="cursor-pointer flex-1">
                                    <span className="font-medium">({getText(language, opt.idNepali, opt.idEnglish) || opt.id})</span>
                                    {optPassage && (
                                        <div className="mt-2 p-3 bg-white rounded border text-sm italic leading-relaxed">
                                            {optPassage}
                                        </div>
                                    )}
                                    <div className="mt-2 text-slate-700">{optQuestion}</div>
                                </Label>
                            </div>
                        </div>
                    )
                })}
            </RadioGroup>

            {currentAnswer.selectedOption && (
                <PaperAnswerNotice language={language} />
            )}
        </div>
    )
}

// Essay - choose topic and write
function EssayQuestion({ question, answer, onAnswerChange, questionIndex, language }: NepaliQuestionRendererProps) {
    const currentAnswer = answer || { selectedTopic: "", response: "" }
    const qNum = question.questionNumberEnglish || question.questionNumber || 0
    const topics = (language === 'english' ? question.topicsEnglish : question.topicsNepali) || question.topics || []

    return (
        <div className="space-y-4">
            <RadioGroup
                value={currentAnswer.selectedTopic}
                onValueChange={(value) => onAnswerChange(`q${qNum}`, { ...currentAnswer, selectedTopic: value })}
                className="space-y-2"
            >
                {topics.map((topic: string, idx: number) => (
                    <div key={idx} className={`p-3 rounded-lg border ${currentAnswer.selectedTopic === topic ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center gap-3">
                            <RadioGroupItem value={topic} id={`q${qNum}-topic-${idx}`} />
                            <Label htmlFor={`q${qNum}-topic-${idx}`} className="cursor-pointer flex-1">{topic}</Label>
                        </div>
                    </div>
                ))}
            </RadioGroup>

            {currentAnswer.selectedTopic && (
                <PaperAnswerNotice language={language} />
            )}
        </div>
    )
}

// Main renderer component
export function NepaliQuestionRenderer(props: NepaliQuestionRendererProps) {
    const { question } = props
    const [showExplanation, setShowExplanation] = useState(false)

    // Guard against null/undefined question data
    if (!question) {
        return null
    }

    // Question type renderer mapping
    const renderers: Record<string, React.ComponentType<NepaliQuestionRendererProps>> = {
        matching: MatchingQuestion,
        fill_in_the_blanks: FillInTheBlanksQuestion,
        fill_in_the_blanks_choices: FillInTheBlanksQuestion,
        short_answer: ShortAnswerQuestion,
        multiple_choice: MultipleChoiceQuestion,
        spelling_correction: SpellingCorrectionQuestion,
        parts_of_speech: PartsOfSpeechQuestion,
        word_formation: WordFormationQuestion,
        tense_change: TenseChangeQuestion,
        grammar_choice: GrammarChoiceQuestion,
        sentence_transformation: SentenceTransformationQuestion,
        reading_comprehension_grammar: ReadingComprehensionQuestion,
        reading_comprehension: ReadingComprehensionQuestion,
        free_writing_choice: FreeWritingChoiceQuestion,
        functional_writing_choice: FreeWritingChoiceQuestion, // Same UI as free_writing
        note_taking: NoteTakingQuestion,
        summarization: SummarizationQuestion,
        literature_short_answer: LiteratureShortAnswerQuestion,
        literature_argumentative: LiteratureArgumentativeQuestion,
        literature_explanation: LiteratureExplanationQuestion,
        literature_critical_analysis_choice: LiteratureCriticalAnalysisQuestion,
        essay: EssayQuestion,
    }

    const Renderer = renderers[question.type] || ShortAnswerQuestion

    // Check for explanation or sample answer (at question level or subquestion level) - check both base and bilingual fields
    const explanationText = (question as any).explanationEnglish || (question as any).explanationNepali || question.explanation
    const hasExplanation = explanationText && (typeof explanationText === 'string' ? explanationText.trim() : explanationText)
    const sampleAnswerText = (question as any).sampleAnswerEnglish || (question as any).sampleAnswerNepali || question.sampleAnswer
    const hasSampleAnswer = sampleAnswerText && (
        typeof sampleAnswerText === 'string'
            ? sampleAnswerText.trim()
            : sampleAnswerText
    )
    const correctAnswerText = (question as any).correctAnswerEnglish || (question as any).correctAnswerNepali || question.correctAnswer
    const hasCorrectAnswer = correctAnswerText && (
        typeof correctAnswerText === 'string'
            ? correctAnswerText.trim()
            : correctAnswerText
    )
    // Check for subQuestion explanations or correctAnswers (direct or in subSections) - check bilingual variants
    const hasSubQuestionHelp = question.subQuestions?.some(sub =>
        ((sub as any).explanationEnglish || (sub as any).explanationNepali || sub.explanation)?.toString().trim() ||
        ((sub as any).correctAnswerEnglish || (sub as any).correctAnswerNepali || sub.correctAnswer)
    )
    const hasSubSectionHelp = question.subSections?.some(section =>
        section.subQuestions?.some(sub =>
            ((sub as any).explanationEnglish || (sub as any).explanationNepali || sub.explanation)?.toString().trim() ||
            ((sub as any).correctAnswerEnglish || (sub as any).correctAnswerNepali || sub.correctAnswer)
        )
    )
    const hasHelp = hasExplanation || hasSampleAnswer || hasCorrectAnswer || hasSubQuestionHelp || hasSubSectionHelp

    return (
        <Card className="mb-6 overflow-hidden shadow-lg border border-white/20">
            <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex-1">
                            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                                <Badge variant="secondary" className="bg-white/20 text-white">
                                    {question.questionNumberEnglish ?? question.questionNumber}
                                </Badge>
                                {getText(props.language, question.titleNepali, question.titleEnglish) || question.title}
                            </CardTitle>
                            {/* Display the actual question text if present */}
                            {(question.questionNepali || question.questionEnglish) && (
                                <p className="mt-2 text-white/90 leading-relaxed">
                                    {getText(props.language, question.questionNepali, question.questionEnglish)}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                        <Badge variant="secondary" className="bg-white/20 text-white">
                            {(question.marksEnglish || question.marks)} {(question.marksEnglish || question.marks) === 1 ? getUIText(props.language, 'mark') : getUIText(props.language, 'marks')}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <Renderer {...props} showExplanation={showExplanation} />

                {/* Show explanation/sample answer when toggled */}
                {showExplanation && hasHelp && (() => {
                    // Get actual displayed text for each field based on current language
                    const displayedSampleAnswer = getText(props.language, question.sampleAnswerNepali, question.sampleAnswerEnglish) || question.sampleAnswer
                    const displayedCorrectAnswer = getText(props.language, question.correctAnswerNepali, question.correctAnswerEnglish) || question.correctAnswer
                    const displayedExplanation = getText(props.language, question.explanationNepali, question.explanationEnglish) || question.explanation

                    // Check if displayed text is non-empty (handles whitespace-only strings)
                    const isNonEmpty = (val: any): boolean => {
                        if (!val) return false
                        if (typeof val === 'string') return val.trim().length > 0
                        if (Array.isArray(val)) return val.length > 0
                        return true
                    }

                    const showSampleAnswer = isNonEmpty(displayedSampleAnswer)
                    const showCorrectAnswer = isNonEmpty(displayedCorrectAnswer) && !showSampleAnswer
                    const showExplanationSection = isNonEmpty(displayedExplanation)

                    // Only render the question-level box if there's actual question-level content
                    // (SubQuestionExplanation handles subquestion hints separately inline)
                    if (!showSampleAnswer && !showCorrectAnswer && !showExplanationSection) {
                        return null
                    }

                    return (
                        <div className="mt-4 bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg">
                            <div className="text-sm space-y-3">
                                {showSampleAnswer && (
                                    <div>
                                        <span className="font-medium text-amber-800">{getUIText(props.language, 'sampleAnswer')}</span>
                                        <div className="text-amber-700 mt-1 whitespace-pre-line">
                                            <CitationText text={String(formatAnswerForDisplay(displayedSampleAnswer) || '')} subject="nepali" pageLanguage={props.language === 'english' ? 'en' : 'np'} />
                                        </div>
                                    </div>
                                )}
                                {showCorrectAnswer && (
                                    <div>
                                        <span className="font-medium text-amber-800">{props.language === 'english' ? 'Correct Answer:' : 'सही उत्तर:'}</span>
                                        <div className="text-amber-700 mt-1 whitespace-pre-line">
                                            <CitationText text={String(formatAnswerForDisplay(displayedCorrectAnswer) || '')} subject="nepali" pageLanguage={props.language === 'english' ? 'en' : 'np'} />
                                        </div>
                                    </div>
                                )}
                                {showExplanationSection && (
                                    <div>
                                        <span className="font-medium text-amber-800">{getUIText(props.language, 'explanation')}</span>
                                        <div className="text-amber-700 mt-1 whitespace-pre-line">
                                            <CitationText text={String(displayedExplanation || '')} subject="nepali" pageLanguage={props.language === 'english' ? 'en' : 'np'} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })()}
            </CardContent>
        </Card>
    )
}

