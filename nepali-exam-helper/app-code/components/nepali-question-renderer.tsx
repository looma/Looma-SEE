"use client"

import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { NepaliQuestion } from "@/lib/nepali-types"

interface NepaliQuestionRendererProps {
    question: NepaliQuestion
    answer: any
    onAnswerChange: (questionId: string, value: any) => void
    questionIndex: number
}

// Matching Question - dropdowns to match columns
function MatchingQuestion({ question, answer, onAnswerChange, questionIndex }: NepaliQuestionRendererProps) {
    const currentAnswer = answer || {}

    const handleMatch = (aId: string, bId: string) => {
        onAnswerChange(`q${question.questionNumber}`, { ...currentAnswer, [aId]: bId })
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="font-medium text-slate-700">{question.columns?.A_header || "समूह 'क'"}</div>
                <div className="font-medium text-slate-700">{question.columns?.B_header || "समूह 'ख'"}</div>
            </div>
            {question.columns?.A?.map((itemA) => (
                <div key={itemA.id} className="grid grid-cols-2 gap-4 items-center">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="font-medium text-slate-700">({itemA.id})</span> {itemA.text}
                    </div>
                    <Select
                        value={currentAnswer[itemA.id] || ""}
                        onValueChange={(value) => handleMatch(itemA.id, value)}
                    >
                        <SelectTrigger className="border-slate-300">
                            <SelectValue placeholder="जोडा छान्नुहोस्..." />
                        </SelectTrigger>
                        <SelectContent>
                            {question.columns?.B?.map((itemB) => (
                                <SelectItem key={itemB.id} value={itemB.id}>
                                    ({itemB.id}) {itemB.text}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            ))}
        </div>
    )
}

// Fill in the Blanks - passage with text inputs
function FillInTheBlanksQuestion({ question, answer, onAnswerChange, questionIndex }: NepaliQuestionRendererProps) {
    const currentAnswer = answer || {}

    return (
        <div className="space-y-4">
            {question.passage && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 leading-relaxed">
                    {question.passage}
                </div>
            )}
            <div className="space-y-3">
                {question.subQuestions?.map((sub) => (
                    <div key={sub.id} className="flex items-start gap-3">
                        <Badge variant="outline" className="shrink-0 mt-2">({sub.id})</Badge>
                        <div className="flex-1">
                            <Label className="text-slate-700 mb-2 block">{sub.questionNepali}</Label>
                            <Input
                                value={currentAnswer[sub.id] || ""}
                                onChange={(e) => onAnswerChange(`q${question.questionNumber}`, { ...currentAnswer, [sub.id]: e.target.value })}
                                placeholder="उत्तर लेख्नुहोस्..."
                                className="border-slate-300"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Short Answer with passage
function ShortAnswerQuestion({ question, answer, onAnswerChange, questionIndex }: NepaliQuestionRendererProps) {
    return (
        <div className="space-y-4">
            {question.passage && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 leading-relaxed whitespace-pre-line">
                    {question.passage}
                </div>
            )}
            <Textarea
                value={answer || ""}
                onChange={(e) => onAnswerChange(`q${question.questionNumber}`, e.target.value)}
                placeholder="उत्तर लेख्नुहोस्..."
                className="min-h-[120px] border-slate-300"
            />
        </div>
    )
}

// Spelling Correction - mixed multiple choice and text
function SpellingCorrectionQuestion({ question, answer, onAnswerChange, questionIndex }: NepaliQuestionRendererProps) {
    const currentAnswer = answer || {}

    return (
        <div className="space-y-6">
            {question.subQuestions?.map((sub) => (
                <div key={sub.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="font-medium text-slate-700 mb-3">({sub.id}) {sub.title}</div>

                    {sub.type === "multiple_choice" && sub.choices && (
                        <div className="space-y-4">
                            {sub.choices.map((choice) => (
                                <div key={choice.id} className="ml-4">
                                    <Label className="text-slate-600 mb-2 block">({choice.id})</Label>
                                    <RadioGroup
                                        value={currentAnswer[sub.id]?.[choice.id] || ""}
                                        onValueChange={(value) => {
                                            const subAnswer = currentAnswer[sub.id] || {}
                                            onAnswerChange(`q${question.questionNumber}`, {
                                                ...currentAnswer,
                                                [sub.id]: { ...subAnswer, [choice.id]: value }
                                            })
                                        }}
                                        className="flex flex-wrap gap-3"
                                    >
                                        {choice.options.map((opt, optIdx) => (
                                            <div key={optIdx} className="flex items-center space-x-2">
                                                <RadioGroupItem value={opt} id={`${sub.id}-${choice.id}-${optIdx}`} />
                                                <Label htmlFor={`${sub.id}-${choice.id}-${optIdx}`} className="cursor-pointer">{opt}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>
                            ))}
                        </div>
                    )}

                    {sub.type === "sentence_correction" && (
                        <div className="space-y-2">
                            <div className="p-3 bg-slate-100 rounded border border-slate-300 text-slate-700">
                                {sub.questionNepali}
                            </div>
                            <Textarea
                                value={currentAnswer[sub.id] || ""}
                                onChange={(e) => onAnswerChange(`q${question.questionNumber}`, { ...currentAnswer, [sub.id]: e.target.value })}
                                placeholder="शुद्ध वाक्य लेख्नुहोस्..."
                                className="min-h-[80px]"
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

// Parts of Speech - identify word classes
function PartsOfSpeechQuestion({ question, answer, onAnswerChange, questionIndex }: NepaliQuestionRendererProps) {
    const currentAnswer = answer || {}
    const correctWords = Array.isArray(question.correctAnswer)
        ? (question.correctAnswer as any[]).map(p => p.word)
        : []

    return (
        <div className="space-y-4">
            {question.passage && (
                <div
                    className="p-4 bg-slate-50 rounded-lg border border-slate-200 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: question.passage.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 underline font-bold">$1</strong>') }}
                />
            )}
            <div className="space-y-3">
                {correctWords.map((word, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                        <div className="w-32 font-medium text-slate-700">'{word}'</div>
                        <Input
                            value={currentAnswer[word] || ""}
                            onChange={(e) => onAnswerChange(`q${question.questionNumber}`, { ...currentAnswer, [word]: e.target.value })}
                            placeholder="पदवर्ग लेख्नुहोस् (जस्तै: सर्वनाम, क्रियापद)"
                            className="flex-1"
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

// Word Formation - complex sub-questions
function WordFormationQuestion({ question, answer, onAnswerChange, questionIndex }: NepaliQuestionRendererProps) {
    const currentAnswer = answer || {}

    return (
        <div className="space-y-6">
            {question.subQuestions?.map((sub) => (
                <div key={sub.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="font-medium text-slate-700 mb-3">({sub.id}) {sub.title}</div>
                    {sub.passage && (
                        <div className="p-3 bg-slate-100 rounded border border-slate-200 mb-3 text-sm leading-relaxed text-slate-700">
                            {sub.passage}
                        </div>
                    )}
                    <Textarea
                        value={currentAnswer[sub.id] || ""}
                        onChange={(e) => onAnswerChange(`q${question.questionNumber}`, { ...currentAnswer, [sub.id]: e.target.value })}
                        placeholder="उत्तर लेख्नुहोस्..."
                        className="min-h-[100px]"
                    />
                </div>
            ))}
        </div>
    )
}

// Tense Change - transform passage
function TenseChangeQuestion({ question, answer, onAnswerChange, questionIndex }: NepaliQuestionRendererProps) {
    return (
        <div className="space-y-4">
            {question.passage && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 leading-relaxed whitespace-pre-line">
                    {question.passage}
                </div>
            )}
            <Textarea
                value={answer || ""}
                onChange={(e) => onAnswerChange(`q${question.questionNumber}`, e.target.value)}
                placeholder="परिवर्तित अनुच्छेद लेख्नुहोस्..."
                className="min-h-[150px]"
            />
        </div>
    )
}

// Grammar Choice - choose one question to answer
function GrammarChoiceQuestion({ question, answer, onAnswerChange, questionIndex }: NepaliQuestionRendererProps) {
    const currentAnswer = answer || { selectedOption: "", response: "" }

    return (
        <div className="space-y-4">
            <RadioGroup
                value={currentAnswer.selectedOption}
                onValueChange={(value) => onAnswerChange(`q${question.questionNumber}`, { ...currentAnswer, selectedOption: value })}
                className="space-y-3"
            >
                {question.subQuestions?.map((sub) => (
                    <div key={sub.id} className={`p-4 rounded-lg border ${currentAnswer.selectedOption === sub.id ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-start gap-3">
                            <RadioGroupItem value={sub.id} id={`choice-${sub.id}`} className="mt-1" />
                            <Label htmlFor={`choice-${sub.id}`} className="cursor-pointer flex-1">
                                <span className="font-medium">({sub.id})</span> {sub.title || sub.questionNepali}
                            </Label>
                        </div>
                    </div>
                ))}
            </RadioGroup>

            {currentAnswer.selectedOption && (
                <Textarea
                    value={currentAnswer.response}
                    onChange={(e) => onAnswerChange(`q${question.questionNumber}`, { ...currentAnswer, response: e.target.value })}
                    placeholder="उत्तर लेख्नुहोस्..."
                    className="min-h-[120px]"
                />
            )}
        </div>
    )
}

// Sentence Transformation - multiple sub-questions with hints
function SentenceTransformationQuestion({ question, answer, onAnswerChange, questionIndex }: NepaliQuestionRendererProps) {
    const currentAnswer = answer || {}

    return (
        <div className="space-y-4">
            {question.subQuestions?.map((sub) => (
                <div key={sub.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-start gap-2 mb-3">
                        <Badge variant="outline">({sub.id})</Badge>
                        <div className="flex-1 text-slate-700">{sub.questionNepali}</div>
                    </div>
                    <Textarea
                        value={currentAnswer[sub.id] || ""}
                        onChange={(e) => onAnswerChange(`q${question.questionNumber}`, { ...currentAnswer, [sub.id]: e.target.value })}
                        placeholder="रूपान्तरित वाक्य लेख्नुहोस्..."
                        className="min-h-[80px]"
                    />
                </div>
            ))}
        </div>
    )
}

// Reading Comprehension - passage with sub-questions
function ReadingComprehensionQuestion({ question, answer, onAnswerChange, questionIndex }: NepaliQuestionRendererProps) {
    const currentAnswer = answer || {}

    return (
        <div className="space-y-4">
            {question.passage && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 leading-relaxed whitespace-pre-line">
                    {question.passage}
                </div>
            )}
            <div className="space-y-4">
                {question.subQuestions?.map((sub) => (
                    <div key={sub.id} className="p-4 bg-white rounded-lg border border-slate-200">
                        <div className="flex items-start gap-2 mb-3">
                            <Badge variant="outline">({sub.id})</Badge>
                            <div className="flex-1 text-slate-700">{sub.questionNepali}</div>
                        </div>
                        <Textarea
                            value={currentAnswer[sub.id] || ""}
                            onChange={(e) => onAnswerChange(`q${question.questionNumber}`, { ...currentAnswer, [sub.id]: e.target.value })}
                            placeholder="उत्तर लेख्नुहोस्..."
                            className="min-h-[80px]"
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

// Free Writing Choice - pick one option to write
function FreeWritingChoiceQuestion({ question, answer, onAnswerChange, questionIndex }: NepaliQuestionRendererProps) {
    const currentAnswer = answer || { selectedOption: "", response: "" }

    return (
        <div className="space-y-4">
            <RadioGroup
                value={currentAnswer.selectedOption}
                onValueChange={(value) => onAnswerChange(`q${question.questionNumber}`, { ...currentAnswer, selectedOption: value })}
                className="space-y-3"
            >
                {question.options?.map((opt) => (
                    <div key={opt.id} className={`p-4 rounded-lg border ${currentAnswer.selectedOption === opt.id ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-start gap-3">
                            <RadioGroupItem value={opt.id} id={`opt-${opt.id}`} className="mt-1" />
                            <Label htmlFor={`opt-${opt.id}`} className="cursor-pointer flex-1">
                                <span className="font-medium">({opt.id})</span> {opt.title}
                                {opt.clues && (
                                    <ul className="mt-2 text-sm text-slate-600 list-disc list-inside">
                                        {opt.clues.map((clue, idx) => <li key={idx}>{clue}</li>)}
                                    </ul>
                                )}
                            </Label>
                        </div>
                    </div>
                ))}
            </RadioGroup>

            {currentAnswer.selectedOption && (
                <Textarea
                    value={currentAnswer.response}
                    onChange={(e) => onAnswerChange(`q${question.questionNumber}`, { ...currentAnswer, response: e.target.value })}
                    placeholder="उत्तर लेख्नुहोस्..."
                    className="min-h-[200px]"
                />
            )}
        </div>
    )
}

// Note Taking - extract main points
function NoteTakingQuestion({ question, answer, onAnswerChange, questionIndex }: NepaliQuestionRendererProps) {
    const currentAnswer = answer || { points: ["", "", "", ""] }
    const numPoints = Array.isArray(question.correctAnswer) ? question.correctAnswer.length : 4

    return (
        <div className="space-y-4">
            {question.passage && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 leading-relaxed">
                    {question.passage}
                </div>
            )}
            <div className="space-y-3">
                {[...Array(numPoints)].map((_, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                        <Badge variant="outline" className="shrink-0">{idx + 1}</Badge>
                        <Input
                            value={currentAnswer.points?.[idx] || ""}
                            onChange={(e) => {
                                const newPoints = [...(currentAnswer.points || [])]
                                newPoints[idx] = e.target.value
                                onAnswerChange(`q${question.questionNumber}`, { points: newPoints })
                            }}
                            placeholder={`बुँदा ${idx + 1}`}
                            className="flex-1"
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

// Summarization - write summary
function SummarizationQuestion({ question, answer, onAnswerChange, questionIndex }: NepaliQuestionRendererProps) {
    return (
        <div className="space-y-4">
            {question.passage && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 leading-relaxed">
                    {question.passage}
                </div>
            )}
            <Textarea
                value={answer || ""}
                onChange={(e) => onAnswerChange(`q${question.questionNumber}`, e.target.value)}
                placeholder="सारांश लेख्नुहोस्..."
                className="min-h-[150px]"
            />
        </div>
    )
}

// Literature Short Answer - passage sections with sub-questions
function LiteratureShortAnswerQuestion({ question, answer, onAnswerChange, questionIndex }: NepaliQuestionRendererProps) {
    const currentAnswer = answer || {}

    return (
        <div className="space-y-6">
            {question.subSections?.map((section) => (
                <div key={section.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <Badge variant="outline" className="mb-3">({section.id}) {section.marks} marks</Badge>
                    {section.passage && (
                        <div className="p-3 bg-white rounded border border-slate-200 mb-4 italic leading-relaxed whitespace-pre-line">
                            {section.passage}
                        </div>
                    )}
                    <div className="space-y-4">
                        {section.subQuestions?.map((sub) => (
                            <div key={sub.id}>
                                <Label className="text-slate-700 mb-2 block">({sub.id}) {sub.questionNepali}</Label>
                                <Textarea
                                    value={currentAnswer[`${section.id}_${sub.id}`] || ""}
                                    onChange={(e) => onAnswerChange(`q${question.questionNumber}`, { ...currentAnswer, [`${section.id}_${sub.id}`]: e.target.value })}
                                    placeholder="उत्तर लेख्नुहोस्..."
                                    className="min-h-[80px]"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

// Literature Argumentative - single essay question
function LiteratureArgumentativeQuestion({ question, answer, onAnswerChange, questionIndex }: NepaliQuestionRendererProps) {
    return (
        <Textarea
            value={answer || ""}
            onChange={(e) => onAnswerChange(`q${question.questionNumber}`, e.target.value)}
            placeholder="तर्कसहित उत्तर लेख्नुहोस्..."
            className="min-h-[200px]"
        />
    )
}

// Literature Explanation - explain quotes
function LiteratureExplanationQuestion({ question, answer, onAnswerChange, questionIndex }: NepaliQuestionRendererProps) {
    const currentAnswer = answer || { selectedOption: "", response: "" }

    return (
        <div className="space-y-4">
            <RadioGroup
                value={currentAnswer.selectedOption}
                onValueChange={(value) => onAnswerChange(`q${question.questionNumber}`, { ...currentAnswer, selectedOption: value })}
                className="space-y-3"
            >
                {question.options?.map((opt) => (
                    <div key={opt.id} className={`p-4 rounded-lg border ${currentAnswer.selectedOption === opt.id ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-start gap-3">
                            <RadioGroupItem value={opt.id} id={`quote-${opt.id}`} className="mt-1" />
                            <Label htmlFor={`quote-${opt.id}`} className="cursor-pointer flex-1 italic">
                                <span className="font-medium not-italic">({opt.id})</span> "{(opt as any).quote}"
                            </Label>
                        </div>
                    </div>
                ))}
            </RadioGroup>

            {currentAnswer.selectedOption && (
                <Textarea
                    value={currentAnswer.response}
                    onChange={(e) => onAnswerChange(`q${question.questionNumber}`, { ...currentAnswer, response: e.target.value })}
                    placeholder="व्याख्या लेख्नुहोस्..."
                    className="min-h-[200px]"
                />
            )}
        </div>
    )
}

// Literature Critical Analysis Choice - passage with analysis
function LiteratureCriticalAnalysisQuestion({ question, answer, onAnswerChange, questionIndex }: NepaliQuestionRendererProps) {
    const currentAnswer = answer || { selectedOption: "", response: "" }

    return (
        <div className="space-y-4">
            <RadioGroup
                value={currentAnswer.selectedOption}
                onValueChange={(value) => onAnswerChange(`q${question.questionNumber}`, { ...currentAnswer, selectedOption: value })}
                className="space-y-3"
            >
                {question.options?.map((opt) => (
                    <div key={opt.id} className={`p-4 rounded-lg border ${currentAnswer.selectedOption === opt.id ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-start gap-3">
                            <RadioGroupItem value={opt.id} id={`analysis-${opt.id}`} className="mt-1" />
                            <Label htmlFor={`analysis-${opt.id}`} className="cursor-pointer flex-1">
                                <span className="font-medium">({opt.id})</span>
                                {opt.passage && (
                                    <div className="mt-2 p-3 bg-white rounded border text-sm italic leading-relaxed">
                                        {opt.passage}
                                    </div>
                                )}
                                <div className="mt-2 text-slate-700">{opt.questionNepali}</div>
                            </Label>
                        </div>
                    </div>
                ))}
            </RadioGroup>

            {currentAnswer.selectedOption && (
                <Textarea
                    value={currentAnswer.response}
                    onChange={(e) => onAnswerChange(`q${question.questionNumber}`, { ...currentAnswer, response: e.target.value })}
                    placeholder="समीक्षात्मक उत्तर लेख्नुहोस्..."
                    className="min-h-[250px]"
                />
            )}
        </div>
    )
}

// Essay - choose topic and write
function EssayQuestion({ question, answer, onAnswerChange, questionIndex }: NepaliQuestionRendererProps) {
    const currentAnswer = answer || { selectedTopic: "", response: "" }

    return (
        <div className="space-y-4">
            <RadioGroup
                value={currentAnswer.selectedTopic}
                onValueChange={(value) => onAnswerChange(`q${question.questionNumber}`, { ...currentAnswer, selectedTopic: value })}
                className="space-y-2"
            >
                {question.topics?.map((topic, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border ${currentAnswer.selectedTopic === topic ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center gap-3">
                            <RadioGroupItem value={topic} id={`topic-${idx}`} />
                            <Label htmlFor={`topic-${idx}`} className="cursor-pointer flex-1">{topic}</Label>
                        </div>
                    </div>
                ))}
            </RadioGroup>

            {currentAnswer.selectedTopic && (
                <Textarea
                    value={currentAnswer.response}
                    onChange={(e) => onAnswerChange(`q${question.questionNumber}`, { ...currentAnswer, response: e.target.value })}
                    placeholder="निबन्ध लेख्नुहोस् (१५० शब्द नघटाई)..."
                    className="min-h-[300px]"
                />
            )}
        </div>
    )
}

// Main renderer component
export function NepaliQuestionRenderer(props: NepaliQuestionRendererProps) {
    const { question } = props

    // Question type renderer mapping
    const renderers: Record<string, React.ComponentType<NepaliQuestionRendererProps>> = {
        matching: MatchingQuestion,
        fill_in_the_blanks: FillInTheBlanksQuestion,
        short_answer: ShortAnswerQuestion,
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

    return (
        <Card className="mb-6 bg-white/90 backdrop-blur-sm shadow-lg border border-white/20">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex-1">
                            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                                <Badge variant="secondary">{question.questionNumber}</Badge>
                                {question.title}
                            </CardTitle>
                            {/* Display the actual question text if present */}
                            {question.questionNepali && (
                                <p className="mt-2 text-slate-700 leading-relaxed">
                                    {question.questionNepali}
                                </p>
                            )}
                        </div>
                    </div>
                    <Badge variant="outline" className="ml-3 shrink-0">
                        {question.marks} mark{question.marks !== 1 ? "s" : ""}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <Renderer {...props} />
            </CardContent>
        </Card>
    )
}
