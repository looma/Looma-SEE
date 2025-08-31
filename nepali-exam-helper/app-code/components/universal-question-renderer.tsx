"use client"

import { GroupA } from "./group-a"
import { FreeResponseGroup } from "./free-response-group"
import { EnglishQuestionRenderer } from "./english-question-renderer"
import type { GroupAQuestion, FreeResponseQuestion, EnglishQuestion } from "@/lib/use-questions"

interface UniversalQuestionRendererProps {
  questions: {
    groupA: GroupAQuestion[]
    groupB: FreeResponseQuestion[]
    groupC: FreeResponseQuestion[]
    groupD: FreeResponseQuestion[]
    englishQuestions: EnglishQuestion[]
  }
  answers: Record<string, any>
  onAnswerChange: (questionId: string, subQuestionId: string, answer: any) => void
  onGroupAAnswerChange: (id: string, answer: string) => void
  onFreeResponseChange: (group: "B" | "C" | "D", id: string, answer: string) => void
}

export function UniversalQuestionRenderer({
  questions,
  answers,
  onAnswerChange,
  onGroupAAnswerChange,
  onFreeResponseChange,
}: UniversalQuestionRendererProps) {
  // Check if this is an English test
  const isEnglishTest = questions.englishQuestions && questions.englishQuestions.length > 0

  if (isEnglishTest) {
    return (
      <div className="space-y-6">
        {questions.englishQuestions.map((question) => (
          <EnglishQuestionRenderer
            key={question.id}
            question={question}
            answers={answers}
            onAnswerChange={onAnswerChange}
          />
        ))}
      </div>
    )
  }

  // Traditional science test format
  return (
    <div className="space-y-6">
      {questions.groupA.length > 0 && (
        <GroupA
          questions={questions.groupA}
          answers={answers.groupA || {}}
          onAnswerChange={onGroupAAnswerChange}
          progress={0}
        />
      )}
      {questions.groupB.length > 0 && (
        <FreeResponseGroup
          group="B"
          questions={questions.groupB}
          answers={answers.groupB || {}}
          onAnswerChange={onFreeResponseChange}
          progress={0}
        />
      )}
      {questions.groupC.length > 0 && (
        <FreeResponseGroup
          group="C"
          questions={questions.groupC}
          answers={answers.groupC || {}}
          onAnswerChange={onFreeResponseChange}
          progress={0}
        />
      )}
      {questions.groupD.length > 0 && (
        <FreeResponseGroup
          group="D"
          questions={questions.groupD}
          answers={answers.groupD || {}}
          onAnswerChange={onFreeResponseChange}
          progress={0}
        />
      )}
    </div>
  )
}
