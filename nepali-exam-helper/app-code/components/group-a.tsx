"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export interface GroupAQuestion {
  id: string
  nepali: string
  english: string
  options: { id: string; nepali: string; english: string }[]
  correctAnswer: string
  marks: number
}

interface GroupAProps {
  questions: GroupAQuestion[]
  answers: Record<string, string>
  onAnswerChange: (questionId: string, answer: string) => void
  progress: number
}

export function GroupA({ questions, answers, onAnswerChange, progress }: GroupAProps) {
  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/20 overflow-hidden rounded-t-none border-t-0">
      <CardHeader className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Group 'A' - Multiple Choice Questions (10 Marks)</CardTitle>
            <p className="text-yellow-100 mt-1">समूह 'क' - बहुविकल्पीय प्रश्नहरू (१० अंक)</p>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            {Object.keys(answers).length}/{questions.length}
          </Badge>
        </div>
        <Progress value={progress} className="mt-3 bg-yellow-400" />
      </CardHeader>
      <CardContent className="space-y-8 p-6">
        {questions.map((q, index) => (
          <div
            key={q.id}
            className="group hover:bg-yellow-50/50 rounded-lg p-4 transition-all duration-300 border border-transparent hover:border-yellow-200"
          >
            <div className="mb-4">
              <p className="font-semibold mb-2 text-slate-800 leading-relaxed">
                {index + 1}. {q.nepali}
              </p>
              <p className="text-sm text-slate-600 italic leading-relaxed">{q.english}</p>
            </div>
            <RadioGroup value={answers[q.id]} onValueChange={(value) => onAnswerChange(q.id, value)}>
              {q.options.map((opt) => (
                <div key={opt.id} className="flex items-start space-x-3 mb-3 p-2 rounded-md hover:bg-white/80">
                  <RadioGroupItem value={opt.id} id={`${q.id}-${opt.id}`} className="mt-1" />
                  <Label htmlFor={`${q.id}-${opt.id}`} className="cursor-pointer flex-1">
                    <div className="font-medium text-slate-800">
                      ({opt.id}) {opt.nepali}
                    </div>
                    <div className="text-sm text-slate-600 italic mt-1">{opt.english}</div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
