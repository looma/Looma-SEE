"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { PenTool } from "lucide-react"

export interface FreeResponseQuestion {
  id: string
  nepali: string
  english: string
  marks: number
}

interface FreeResponseGroupProps {
  group: "B" | "C" | "D"
  questions: FreeResponseQuestion[]
  answers: Record<string, string>
  onAnswerChange: (group: "B" | "C" | "D", questionId: string, answer: string) => void
  progress: number
}

const groupDetails = {
  B: {
    title: "Group 'B' - Very Short Answers",
    titleNepali: "समूह 'ख' - अति छोटो उत्तर",
    totalMarks: 9,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50/50",
    borderColor: "border-green-200",
  },
  C: {
    title: "Group 'C' - Short Answers",
    titleNepali: "समूह 'ग' - छोटो उत्तर",
    totalMarks: 28,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50/50",
    borderColor: "border-purple-200",
  },
  D: {
    title: "Group 'D' - Long Answers",
    titleNepali: "समूह 'घ' - लामो उत्तर",
    totalMarks: 28,
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50/50",
    borderColor: "border-orange-200",
  },
}

export function FreeResponseGroup({ group, questions, answers, onAnswerChange, progress }: FreeResponseGroupProps) {
  const details = groupDetails[group]
  const answeredCount = Object.keys(answers).filter((key) => answers[key]?.trim()).length

  return (
    <Card
      className={`bg-white/90 backdrop-blur-sm shadow-xl border border-white/20 overflow-hidden rounded-t-none border-t-0`}
    >
      <CardHeader className={`bg-gradient-to-r ${details.color} text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">
              {details.title} ({details.totalMarks} Marks)
            </CardTitle>
            <p className="text-white/90 mt-1">
              {details.titleNepali} ({details.totalMarks} अंक)
            </p>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            {answeredCount}/{questions.length}
          </Badge>
        </div>
        <Progress value={progress} className="mt-3 bg-white/20" />
      </CardHeader>
      <CardContent className="space-y-8 p-6">
        {questions.map((q) => (
          <div
            key={q.id}
            className={`group hover:${details.bgColor} rounded-lg p-4 transition-all duration-300 border border-transparent hover:${details.borderColor}`}
          >
            <div className="flex items-start gap-3 mb-3">
              <PenTool className="h-5 w-5 text-slate-400 mt-1" />
              <div className="flex-1">
                <Label htmlFor={q.id} className="font-semibold text-slate-800 block mb-2 leading-relaxed">
                  {q.id}. {q.nepali}
                </Label>
                <p className="text-sm text-slate-600 italic mb-3 leading-relaxed">{q.english}</p>
              </div>
            </div>
            <div className="ml-8">
              <Textarea
                id={q.id}
                placeholder="Type your answer here... / यहाँ आफ्नो उत्तर लेख्नुहोस्..."
                value={answers[q.id] || ""}
                onChange={(e) => onAnswerChange(group, q.id, e.target.value)}
                className="mt-1 border-2 focus:border-blue-400 transition-colors duration-200 resize-none"
                rows={group === "D" ? 6 : 3}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-slate-500">
                  Marks: {q.marks} / अंक: {q.marks}
                </p>
                <p className="text-xs text-slate-400">{answers[q.id]?.length || 0} characters</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
