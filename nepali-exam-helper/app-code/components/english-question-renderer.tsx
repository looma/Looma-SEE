"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, FileText, BookOpen, PenTool, MessageSquare, Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import type { EnglishQuestion } from "@/lib/english-question-types"

interface EnglishQuestionRendererProps {
  question: EnglishQuestion
  answers: Record<string, any>
  onAnswerChange: (questionId: string, subQuestionId: string, answer: any) => void
  language?: "english" | "nepali"
}

export function EnglishQuestionRenderer({
  question,
  answers,
  onAnswerChange,
  language = "english",
}: EnglishQuestionRendererProps) {
  const [showExplanations, setShowExplanations] = useState(false)

  // Helper function for bilingual text - prioritize selected language, fallback to other
  const getText = (englishText?: string, nepaliText?: string): string => {
    if (language === 'nepali') {
      return nepaliText || englishText || ''
    }
    return englishText || nepaliText || ''
  }

  // UI text translations
  const uiText = {
    explanation: language === 'nepali' ? 'व्याख्या:' : 'Explanation:',
    marks: language === 'nepali' ? 'अंक' : 'marks',
    mark: language === 'nepali' ? 'अंक' : 'mark',
    showHelp: language === 'nepali' ? 'सहायता देखाउनुहोस्' : 'Show Help',
    hideHelp: language === 'nepali' ? 'सहायता लुकाउनुहोस्' : 'Hide Help',
    true: language === 'nepali' ? 'सत्य' : 'TRUE',
    false: language === 'nepali' ? 'गलत' : 'FALSE',
    notGiven: language === 'nepali' ? 'दिइएको छैन' : 'NOT GIVEN',
    writeAnswer: language === 'nepali' ? 'तपाईंको उत्तर यहाँ लेख्नुहोस्...' : 'Write your answer here...',
    fillBlank: language === 'nepali' ? 'तपाईंको उत्तर लेख्नुहोस्...' : 'Type your answer...',
    selectMatch: language === 'nepali' ? 'मिलान छान्नुहोस्' : 'Select match',
    dragOrder: language === 'nepali' ? 'नम्बर छान्नुहोस्' : 'Select order',
    // Free writing labels
    cluesTitle: language === 'nepali' ? 'सहायक संकेतहरू:' : 'Clues to help you:',
    yourAnswer: language === 'nepali' ? 'तपाईंको उत्तर:' : 'Your Answer:',
    writeApprox: language === 'nepali' ? 'लगभग' : 'Write approximately',
    wordsLabel: language === 'nepali' ? 'शब्दहरू' : 'words',
    writeClearly: language === 'nepali' ? 'स्पष्ट रूपमा लेख्नुहोस् र विचारहरू व्यवस्थित गर्नुहोस्' : 'Write clearly and organize your thoughts',
    sampleAnswer: language === 'nepali' ? 'नमूना उत्तर:' : 'Sample Answer:',
    // Grammar labels
    writeCorrected: language === 'nepali' ? 'सही वाक्य यहाँ लेख्नुहोस्...' : 'Write the corrected sentence here...',
    // Reading note
    readingNote: language === 'nepali'
      ? 'नोट: तलका प्रश्नहरूको उत्तर दिँदा तपाईं माथिको परिच्छेद हेर्न सक्नुहुन्छ। ग्रेडिङ्ले शब्दभन्दा साम्ग्रीको बुझाइमा ध्यान दिन्छ।'
      : 'Note: You may refer back to the passage above while answering the questions below. The grading focuses on understanding the content rather than exact wording.',
    chooseMatch: language === 'nepali' ? 'सही मिलान छान्नुहोस्:' : 'Choose the correct match:',
    matchInstruction: language === 'nepali' ? 'तल दिइएको उपयुक्त विकल्प छानेर प्रत्येक वस्तुलाई मिलाउनुहोस्।' : 'Match each item with the correct option by selecting the appropriate choice below.',
    // Ordering labels
    orderInstruction: language === 'nepali' ? 'तलका वस्तुहरूलाई सही क्रममा मिलाउनुहोस् (१, २, ३, आदि)।' : 'Arrange the following items in the correct order by selecting a number (1, 2, 3, etc.) for each item.',
    // Error messages
    dataIncomplete: language === 'nepali' ? '⚠️ प्रश्न डाटा अपूर्ण छ। कृपया परीक्षा डाटा जाँच गर्नुहोस्।' : '⚠️ Question data is incomplete. Please check the test data.',
  }

  // Helper functions to safely access question properties with bilingual support
  const getQuestionId = (q: EnglishQuestion) => (q as any).id || `q${(q as any).questionNumber || (q as any).questionNumberEnglish}`
  const getQuestionTitle = (q: EnglishQuestion) => getText((q as any).titleEnglish || (q as any).title, (q as any).titleNepali)
  const getQuestionMarks = (q: EnglishQuestion) => (q as any).marksEnglish || (q as any).marks || 1

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case "reading_comprehension":
        return <BookOpen className="h-5 w-5" />
      case "free_writing":
        return <PenTool className="h-5 w-5" />
      case "grammar":
        return <MessageSquare className="h-5 w-5" />
      case "cloze_test":
        return <FileText className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getQuestionColor = (type: string) => {
    switch (type) {
      case "reading_comprehension":
        return "from-blue-500 to-blue-600"
      case "free_writing":
        return "from-green-500 to-green-600"
      case "grammar":
        return "from-purple-500 to-purple-600"
      case "cloze_test":
        return "from-orange-500 to-orange-600"
      default:
        return "from-slate-500 to-slate-600"
    }
  }

  const parseExplanation = (explanation?: string) => {
    if (!explanation) return { english: "", nepali: "" }

    const parts = explanation.split("\nব্যাখ্যা (Nepali Explanation): ")
    const english = parts[0]?.replace("Explanation (English): ", "") || ""
    const nepali = parts[1] || ""

    return { english, nepali }
  }

  const renderExplanation = (subQ?: any) => {
    if (!subQ || !showExplanations) return null

    let displayText = ""

    // Handle both old format (string) and new format (object with explanationEnglish/explanationNepali)
    if (typeof subQ === "string") {
      const parsed = parseExplanation(subQ)
      displayText = language === 'nepali' ? (parsed.nepali || parsed.english) : parsed.english
    } else if (typeof subQ === "object") {
      displayText = getText(subQ.explanationEnglish, subQ.explanationNepali)
    }

    // Don't render if empty
    if (!displayText) return null

    return (
      <div className="mt-3 bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg">
        <div className="text-sm">
          <span className="font-medium text-amber-800">{uiText.explanation}</span>
          <p className="text-amber-700 mt-1 whitespace-pre-line">{displayText}</p>
        </div>
      </div>
    )
  }

  const renderTrueFalseQuestions = (subQuestions: any[], parentId?: string, sectionMarks?: number) => {
    return (
      <div className="space-y-4">
        {subQuestions.map((subQ, index) => {
          const questionId = parentId ? `${(question as any).id}_${parentId}_${subQ.id}` : `${(question as any).id}_${subQ.id}`
          const currentAnswer = parentId ? answers[(question as any).id]?.[parentId]?.[subQ.id] : answers[(question as any).id]?.[subQ.id]

          // Calculate marks for sub-question: use subQ.marks if available, otherwise divide section marks by number of sub-questions
          const subQuestionMarks = subQ.marks || (sectionMarks ? Math.round((sectionMarks / subQuestions.length) * 10) / 10 : 1)

          return (
            <Card key={subQ.id} className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {currentAnswer ? (
                      <CheckCircle2 className="h-5 w-5 text-slate-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <p className="font-medium text-slate-800">
                        ({getText(subQ.idEnglish || subQ.id, subQ.idNepali)}) {getText(subQ.questionEnglish, subQ.questionNepali)}
                      </p>
                      <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 whitespace-nowrap">
                        {subQuestionMarks} {subQuestionMarks !== 1 ? uiText.marks : uiText.mark}
                      </Badge>
                    </div>

                    <RadioGroup
                      value={currentAnswer || ""}
                      onValueChange={(value: string) => {
                        if (parentId) {
                          const currentSection = answers[(question as any).id]?.[parentId] || {}
                          onAnswerChange((question as any).id, parentId, {
                            ...currentSection,
                            [subQ.id]: value,
                          })
                        } else {
                          onAnswerChange((question as any).id, subQ.id, value)
                        }
                      }}
                      className="flex gap-6"
                    >
                      <div
                        className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-green-50 transition-colors"
                        onClick={() => {
                          const value = "TRUE"
                          if (parentId) {
                            const currentSection = answers[(question as any).id]?.[parentId] || {}
                            onAnswerChange((question as any).id, parentId, {
                              ...currentSection,
                              [subQ.id]: value,
                            })
                          } else {
                            onAnswerChange((question as any).id, subQ.id, value)
                          }
                        }}
                      >
                        <RadioGroupItem value="TRUE" id={`${questionId}_true`} />
                        <Label htmlFor={`${questionId}_true`} className="font-medium text-green-700 cursor-pointer">
                          {uiText.true}
                        </Label>
                      </div>
                      <div
                        className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-red-50 transition-colors"
                        onClick={() => {
                          const value = "FALSE"
                          if (parentId) {
                            const currentSection = answers[(question as any).id]?.[parentId] || {}
                            onAnswerChange((question as any).id, parentId, {
                              ...currentSection,
                              [subQ.id]: value,
                            })
                          } else {
                            onAnswerChange((question as any).id, subQ.id, value)
                          }
                        }}
                      >
                        <RadioGroupItem value="FALSE" id={`${questionId}_false`} />
                        <Label htmlFor={`${questionId}_false`} className="font-medium text-red-700 cursor-pointer">
                          {uiText.false}
                        </Label>
                      </div>
                    </RadioGroup>

                    {renderExplanation(subQ)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  const renderTrueFalseNotGivenQuestions = (subQuestions: any[], parentId?: string, sectionMarks?: number) => {
    return (
      <div className="space-y-4">
        {subQuestions.map((subQ, index) => {
          const questionId = parentId ? `${(question as any).id}_${parentId}_${subQ.id}` : `${(question as any).id}_${subQ.id}`
          const currentAnswer = parentId ? answers[(question as any).id]?.[parentId]?.[subQ.id] : answers[(question as any).id]?.[subQ.id]

          // Calculate marks for sub-question: use subQ.marks if available, otherwise divide section marks by number of sub-questions
          const subQuestionMarks = subQ.marks || (sectionMarks ? Math.round((sectionMarks / subQuestions.length) * 10) / 10 : 1)

          return (
            <Card key={subQ.id} className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {currentAnswer ? (
                      <CheckCircle2 className="h-5 w-5 text-slate-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <p className="font-medium text-slate-800">
                        ({getText(subQ.idEnglish || subQ.id, subQ.idNepali)}) {getText(subQ.questionEnglish, subQ.questionNepali)}
                      </p>
                      <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 whitespace-nowrap">
                        {subQuestionMarks} {subQuestionMarks !== 1 ? uiText.marks : uiText.mark}
                      </Badge>
                    </div>

                    <RadioGroup
                      value={currentAnswer || ""}
                      onValueChange={(value: string) => {
                        if (parentId) {
                          const currentSection = answers[(question as any).id]?.[parentId] || {}
                          onAnswerChange((question as any).id, parentId, {
                            ...currentSection,
                            [subQ.id]: value,
                          })
                        } else {
                          onAnswerChange((question as any).id, subQ.id, value)
                        }
                      }}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                    >
                      <div
                        className="flex items-center space-x-2 cursor-pointer p-3 rounded-lg border hover:bg-green-50 transition-colors"
                        onClick={() => {
                          const value = "TRUE"
                          if (parentId) {
                            const currentSection = answers[(question as any).id]?.[parentId] || {}
                            onAnswerChange((question as any).id, parentId, {
                              ...currentSection,
                              [subQ.id]: value,
                            })
                          } else {
                            onAnswerChange((question as any).id, subQ.id, value)
                          }
                        }}
                      >
                        <RadioGroupItem value="TRUE" id={`${questionId}_true`} />
                        <Label htmlFor={`${questionId}_true`} className="font-medium text-green-700 cursor-pointer">
                          {uiText.true}
                        </Label>
                      </div>
                      <div
                        className="flex items-center space-x-2 cursor-pointer p-3 rounded-lg border hover:bg-red-50 transition-colors"
                        onClick={() => {
                          const value = "FALSE"
                          if (parentId) {
                            const currentSection = answers[(question as any).id]?.[parentId] || {}
                            onAnswerChange((question as any).id, parentId, {
                              ...currentSection,
                              [subQ.id]: value,
                            })
                          } else {
                            onAnswerChange((question as any).id, subQ.id, value)
                          }
                        }}
                      >
                        <RadioGroupItem value="FALSE" id={`${questionId}_false`} />
                        <Label htmlFor={`${questionId}_false`} className="font-medium text-red-700 cursor-pointer">
                          {uiText.false}
                        </Label>
                      </div>
                      <div
                        className="flex items-center space-x-2 cursor-pointer p-3 rounded-lg border hover:bg-yellow-50 transition-colors"
                        onClick={() => {
                          const value = "NOT GIVEN"
                          if (parentId) {
                            const currentSection = answers[(question as any).id]?.[parentId] || {}
                            onAnswerChange((question as any).id, parentId, {
                              ...currentSection,
                              [subQ.id]: value,
                            })
                          } else {
                            onAnswerChange((question as any).id, subQ.id, value)
                          }
                        }}
                      >
                        <RadioGroupItem value="NOT GIVEN" id={`${questionId}_not_given`} />
                        <Label htmlFor={`${questionId}_not_given`} className="font-medium text-yellow-700 cursor-pointer">
                          {uiText.notGiven}
                        </Label>
                      </div>
                    </RadioGroup>

                    {renderExplanation(subQ)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  const renderShortAnswerQuestions = (subQuestions: any[], parentId?: string, sectionMarks?: number) => {
    return (
      <div className="space-y-4">
        {subQuestions.map((subQ, index) => {
          const currentAnswer = parentId
            ? answers[(question as any).id]?.[parentId]?.[subQ.id] || ""
            : answers[(question as any).id]?.[subQ.id] || ""

          // Calculate marks for sub-question: use subQ.marks if available, otherwise divide section marks by number of sub-questions
          const subQuestionMarks = subQ.marks || (sectionMarks ? Math.round((sectionMarks / subQuestions.length) * 10) / 10 : 1)

          return (
            <Card key={subQ.id} className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {currentAnswer.trim() ? (
                      <CheckCircle2 className="h-5 w-5 text-slate-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <p className="font-medium text-slate-800">
                        ({getText(subQ.idEnglish || subQ.id, subQ.idNepali)}) {getText(subQ.questionEnglish, subQ.questionNepali)}
                      </p>
                      <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 whitespace-nowrap">
                        {subQuestionMarks} {subQuestionMarks !== 1 ? uiText.marks : uiText.mark}
                      </Badge>
                    </div>

                    <Textarea
                      value={currentAnswer}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        if (parentId) {
                          const currentSection = answers[(question as any).id]?.[parentId] || {}
                          onAnswerChange((question as any).id, parentId, {
                            ...currentSection,
                            [subQ.id]: e.target.value,
                          })
                        } else {
                          onAnswerChange((question as any).id, subQ.id, e.target.value)
                        }
                      }}
                      placeholder={uiText.writeAnswer}
                      className="min-h-[80px] resize-none"
                      rows={3}
                    />

                    {renderExplanation(subQ)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  const renderFillInTheBlanksQuestions = (subQuestions: any[], parentId?: string, sectionMarks?: number) => {
    return (
      <div className="space-y-4">
        {subQuestions.map((subQ, index) => {
          const currentAnswer = parentId
            ? answers[(question as any).id]?.[parentId]?.[subQ.id] || ""
            : answers[(question as any).id]?.[subQ.id] || ""

          // Calculate marks for sub-question: use subQ.marks if available, otherwise divide section marks by number of sub-questions
          const subQuestionMarks = subQ.marks || (sectionMarks ? Math.round((sectionMarks / subQuestions.length) * 10) / 10 : 1)

          return (
            <Card key={subQ.id} className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {currentAnswer.trim() ? (
                      <CheckCircle2 className="h-5 w-5 text-slate-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <p className="font-medium text-slate-800">
                        ({getText(subQ.idEnglish || subQ.id, subQ.idNepali)}) {getText(subQ.questionEnglish, subQ.questionNepali)}
                      </p>
                      <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 whitespace-nowrap">
                        {subQuestionMarks} {subQuestionMarks !== 1 ? uiText.marks : uiText.mark}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`fill-${subQ.id}`} className="text-sm font-medium text-slate-700">
                        Fill in the blank:
                      </Label>
                      <input
                        id={`fill-${subQ.id}`}
                        type="text"
                        value={currentAnswer}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          if (parentId) {
                            const currentSection = answers[(question as any).id]?.[parentId] || {}
                            onAnswerChange((question as any).id, parentId, {
                              ...currentSection,
                              [subQ.id]: e.target.value,
                            })
                          } else {
                            onAnswerChange((question as any).id, subQ.id, e.target.value)
                          }
                        }}
                        placeholder={uiText.fillBlank}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {renderExplanation(subQ)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  const renderMatchingQuestion = (section: any) => {
    const currentAnswers = answers[(question as any).id]?.[section.id] || {}

    // Safety check: if columns data is missing, show a message
    if (!section.columns || !section.columns.A || !section.columns.B) {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">{uiText.dataIncomplete}</p>
        </div>
      )
    }


    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm text-slate-600">{getText(section.titleEnglish || section.title, section.titleNepali)}</p>
          <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 whitespace-nowrap">
            {section.marksEnglish || section.marks} {(section.marksEnglish || section.marks) !== 1 ? uiText.marks : uiText.mark}
          </Badge>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 font-medium">
            {uiText.matchInstruction}
          </p>
        </div>

        {/* Matching Interface */}
        <div className="space-y-4">
          {section.columns?.A?.map((item: any) => (
            <Card key={item.id} className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-semibold text-sm">
                      {item.id}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 mb-3">{getText(item.textEnglish || item.text, item.textNepali)}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-slate-600 font-medium">{uiText.chooseMatch}</span>
                    </div>
                    <RadioGroup
                      value={currentAnswers[item.id] || ""}
                      onValueChange={(value: string) => {
                        const newAnswers = { ...currentAnswers, [item.id]: value }
                        onAnswerChange((question as any).id, section.id, newAnswers)
                      }}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
                    >
                      {section.columns?.B?.map((bItem: any) => (
                        <div
                          key={bItem.id}
                          className={`flex items-center space-x-2 cursor-pointer p-3 rounded-lg border transition-colors ${currentAnswers[item.id] === bItem.id
                            ? "bg-blue-50 border-blue-300"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                            }`}
                          onClick={() => {
                            const newAnswers = { ...currentAnswers, [item.id]: bItem.id }
                            onAnswerChange((question as any).id, section.id, newAnswers)
                          }}
                        >
                          <RadioGroupItem value={bItem.id} id={`${item.id}-${bItem.id}`} />
                          <Label htmlFor={`${item.id}-${bItem.id}`} className="cursor-pointer flex-1">
                            <span className="font-medium text-blue-700 mr-2">({bItem.id})</span>
                            <span className="text-slate-700">{getText(bItem.textEnglish || bItem.text, bItem.textNepali)}</span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {renderExplanation(section)}
      </div>
    )
  }

  const renderOrderingQuestion = (section: any) => {
    const currentAnswers = answers[(question as any).id]?.[section.id] || {}
    const items = section.sentences || section.items || []

    // Safety check: if no items to order
    if (items.length === 0) {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">{uiText.dataIncomplete}</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm text-slate-600">{getText(section.titleEnglish || section.title, section.titleNepali)}</p>
          <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-800 whitespace-nowrap">
            {section.marksEnglish || section.marks} {(section.marksEnglish || section.marks) !== 1 ? uiText.marks : uiText.mark}
          </Badge>
        </div>

        {/* Instructions */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-800 font-medium">
            {uiText.orderInstruction}
          </p>
        </div>

        {/* Ordering Interface */}
        <div className="space-y-3">
          {items.map((item: any, idx: number) => (
            <Card key={item.id || idx} className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <select
                      value={currentAnswers[item.id] || ""}
                      onChange={(e) => {
                        const newAnswers = { ...currentAnswers, [item.id]: e.target.value }
                        onAnswerChange((question as any).id, section.id, newAnswers)
                      }}
                      className="w-16 h-10 px-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center font-semibold"
                    >
                      <option value="">--</option>
                      {items.map((_: any, i: number) => (
                        <option key={i + 1} value={String(i + 1)}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-700">{getText(item.textEnglish || item.text || item.sentence, item.textNepali)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {renderExplanation(section)}
      </div>
    )
  }

  const renderReadingComprehension = () => {
    return (
      <div className="space-y-6">
        {/* Passage */}
        {(question as any).passage && (
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-6">
              {((question as any).passage.titleEnglish || (question as any).passage.title) && (
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {getText((question as any).passage.titleEnglish || (question as any).passage.title, (question as any).passage.titleNepali)}
                </h3>
              )}
              {((question as any).passage.authorEnglish || (question as any).passage.author) && (
                <p className="text-sm text-slate-600 mb-4">
                  {language === 'nepali' ? 'लेखक:' : 'by'} {getText((question as any).passage.authorEnglish || (question as any).passage.author, (question as any).passage.authorNepali)}
                </p>
              )}
              <div className="prose prose-slate max-w-none">
                <p className="whitespace-pre-line leading-relaxed">
                  {getText((question as any).passage.contentEnglish || (question as any).passage.content, (question as any).passage.contentNepali)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}


        {/* Instruction about looking back */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            {uiText.readingNote}
          </p>
        </div>

        {/* Sub-questions */}
        {(question as any).subQuestions && renderTrueFalseQuestions((question as any).subQuestions)}

        {/* Sub-sections */}
        {(question as any).subSections?.map((section: any, index: number) => (
          <div key={section.id} className="space-y-4">
            <h4 className="text-lg font-semibold text-slate-800">
              {getText(section.idEnglish || section.id, section.idNepali)}. {getText(section.titleEnglish || section.title, section.titleNepali)}
            </h4>
            {section.type === "true_false" &&
              section.subQuestions &&
              renderTrueFalseQuestions(section.subQuestions, section.id, section.marks)}
            {section.type === "true_false_not_given" &&
              section.subQuestions &&
              renderTrueFalseNotGivenQuestions(section.subQuestions, section.id, section.marks)}
            {section.type === "short_answer" &&
              section.subQuestions &&
              renderShortAnswerQuestions(section.subQuestions, section.id, section.marks)}
            {section.type === "fill_in_the_blanks" &&
              section.subQuestions &&
              renderFillInTheBlanksQuestions(section.subQuestions, section.id, section.marks)}
            {section.type === "matching" && renderMatchingQuestion(section)}
            {section.type === "ordering" && renderOrderingQuestion(section)}
            {/* Fallback: render any unrecognized section type with subQuestions as short answer */}
            {!["true_false", "true_false_not_given", "short_answer", "fill_in_the_blanks", "matching", "ordering"].includes(section.type) &&
              section.subQuestions &&
              renderShortAnswerQuestions(section.subQuestions, section.id, section.marks)}
          </div>
        ))}
      </div>
    )
  }

  const renderFreeWriting = () => {
    const currentAnswer = answers[(question as any).id]?.content || ""

    return (
      <div className="space-y-6">
        {(question as any).clues && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-blue-800 mb-2">{uiText.cluesTitle}</h4>
              <div className="flex flex-wrap gap-2">
                {(question as any).clues.map((clue: any, index: number) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                    {clue}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div>
          <Label htmlFor={`writing-${(question as any).id}`} className="text-base font-medium text-slate-800">
            {uiText.yourAnswer}
          </Label>
          {(question as any).wordCount && (
            <p className="text-sm text-slate-600 mb-2">{uiText.writeApprox} {(question as any).wordCount} {uiText.wordsLabel}.</p>
          )}
          <Textarea
            id={`writing-${(question as any).id}`}
            value={currentAnswer}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onAnswerChange((question as any).id, "content", e.target.value)}
            placeholder={uiText.writeAnswer}
            className="min-h-[200px] resize-none"
            rows={10}
          />
          <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
            <span>{uiText.writeClearly}</span>
            <span className={currentAnswer.trim().split(/\s+/).filter(Boolean).length > 20 ? "text-green-600" : "text-slate-400"}>
              {currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).filter(Boolean).length : 0} {uiText.wordsLabel}
            </span>
          </div>
        </div>

        {(question as any).sampleAnswer && showExplanations && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-green-800 mb-2">{uiText.sampleAnswer}</h4>
              <div className="text-sm whitespace-pre-line text-green-700">
                {typeof (question as any).sampleAnswer === "string" ? (question as any).sampleAnswer : (question as any).sampleAnswer.content}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const renderGrammar = () => {
    return (
      <div className="space-y-4">
        {(question as any).subQuestions?.map((subQ: any, index: number) => {
          const currentAnswer = answers[(question as any).id]?.[subQ.id] || ""

          // Calculate marks for sub-question: use subQ.marks if available, otherwise divide question marks by number of sub-questions
          const subQuestionMarks = subQ.marks || ((question as any).marks && (question as any).subQuestions ? Math.round(((question as any).marks / (question as any).subQuestions.length) * 10) / 10 : 1)

          return (
            <Card key={subQ.id} className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {currentAnswer.trim() ? (
                      <CheckCircle2 className="h-5 w-5 text-slate-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <p className="font-medium text-slate-800">
                        ({getText(subQ.idEnglish || subQ.id, subQ.idNepali)}) {getText(subQ.questionEnglish, subQ.questionNepali)}
                      </p>
                      <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 whitespace-nowrap">
                        {subQuestionMarks} {subQuestionMarks !== 1 ? uiText.marks : uiText.mark}
                      </Badge>
                    </div>
                    <Textarea
                      value={currentAnswer}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onAnswerChange((question as any).id, subQ.id, e.target.value)}
                      placeholder={uiText.writeCorrected}
                      className="min-h-[60px] resize-none"
                      rows={2}
                    />

                    {renderExplanation(subQ)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  const renderClozeTest = () => {
    return (
      <div className="space-y-6">
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-6">
            <div className="prose prose-slate max-w-none">
              <p className="whitespace-pre-line leading-relaxed">{(question as any).passage}</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h4 className="font-semibold text-slate-800">Fill in the blanks:</h4>
          {(question as any).gaps?.map((gap: any, index: number) => {
            const currentAnswer = answers[(question as any).id]?.[gap.id] || ""

            // Calculate marks for each gap: divide question marks by number of gaps
            const gapMarks = (question as any).marks && (question as any).gaps ? Math.round(((question as any).marks / (question as any).gaps.length) * 10) / 10 : 1

            return (
              <Card key={gap.id} className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium text-slate-800">({gap.id})</span>
                    <Textarea
                      value={currentAnswer}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onAnswerChange((question as any).id, gap.id, e.target.value)}
                      placeholder="Your answer..."
                      className="min-h-[40px] resize-none flex-1"
                      rows={1}
                    />
                    <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-800 whitespace-nowrap">
                      {gapMarks} {gapMarks !== 1 ? uiText.marks : uiText.mark}
                    </Badge>
                  </div>

                  {renderExplanation(gap)}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-white/20 mb-6">
      <CardHeader className={`bg-gradient-to-r ${getQuestionColor(question.type)} text-white p-4 sm:p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getQuestionIcon(question.type)}
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold">
                {language === 'nepali' ? 'प्रश्न' : 'Question'} {(question as any).questionNumberEnglish || (question as any).questionNumber}
              </CardTitle>
              <p className="text-white/90 text-sm sm:text-base">{getQuestionTitle(question)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowExplanations(!showExplanations)}
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              {showExplanations ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="ml-1 hidden sm:inline">{showExplanations ? uiText.hideHelp : uiText.showHelp}</span>
            </Button>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 whitespace-nowrap">
              {getQuestionMarks(question)} {uiText.marks}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        {question.type === "reading_comprehension" && renderReadingComprehension()}
        {question.type === "free_writing" && renderFreeWriting()}
        {(question as any).type === "grammar" && renderGrammar()}
        {question.type === "cloze_test" && renderClozeTest()}
      </CardContent>
    </Card>
  )
}
