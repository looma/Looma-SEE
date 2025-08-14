"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HelpCircle, Key } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface StudentLoginProps {
  onLogin: (studentId: string) => void
}

export function StudentLogin({ onLogin }: StudentLoginProps) {
  const [studentId, setStudentId] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (studentId.trim()) onLogin(studentId.trim())
  }

  const generateSampleId = () => {
    const year = new Date().getFullYear()
    const rand = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `${year}${rand}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-2xl border border-white/20 relative z-10">
        <CardHeader className="text-center bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-t-lg">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src="/looma-logo.png" alt="Looma" className="h-8 w-auto" />
            <CardTitle className="text-2xl font-bold">SEE Exam Practice</CardTitle>
          </div>
          <p className="text-yellow-100">SEE परीक्षा अभ्यास</p>
          <p className="text-sm text-yellow-200 mt-2">Enter your Student ID to start or continue</p>
          <p className="text-xs text-yellow-200">सुरु गर्न वा जारी राख्न विद्यार्थी ID प्रविष्ट गर्नुहोस्</p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="studentId" className="flex items-center gap-2 text-lg font-semibold">
                <Key className="h-5 w-5" />
                Student ID / विद्यार्थी ID
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-slate-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Student ID:</strong> Any unique identifier you create to save your progress
                        </p>
                        <p>Examples: 2024001, ram2024, student123</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="studentId"
                  type="text"
                  placeholder="Enter your unique Student ID"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                  className="border-2 focus:border-yellow-400 flex-1 text-lg py-3"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStudentId(generateSampleId())}
                  className="px-4 bg-transparent border-yellow-300 hover:bg-yellow-50"
                  title="Generate a random ID"
                >
                  Generate
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              disabled={!studentId.trim()}
            >
              Start Practice / अभ्यास सुरु गर्नुहोस्
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
