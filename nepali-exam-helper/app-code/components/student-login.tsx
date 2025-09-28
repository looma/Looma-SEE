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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 flex items-center justify-center p-3 sm:p-4" suppressHydrationWarning>
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-60 h-60 sm:w-80 sm:h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-60 h-60 sm:w-80 sm:h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-60 h-60 sm:w-80 sm:h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <Card className="w-full max-w-sm sm:max-w-md bg-white/90 backdrop-blur-sm shadow-2xl border border-white/20 relative z-10">
        <CardHeader className="text-center bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-t-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-2">
            <img src="/looma-logo.png" alt="Looma" className="h-6 sm:h-8 w-auto" />
            <CardTitle className="text-xl sm:text-2xl font-bold">SEE Exam Practice</CardTitle>
          </div>
          <p className="text-yellow-100 text-sm sm:text-base">SEE परीक्षा अभ्यास</p>
          <p className="text-xs sm:text-sm text-yellow-200 mt-2">Enter your Student ID to start or continue</p>
          <p className="text-xs text-yellow-200">सुरु गर्न वा जारी राख्न विद्यार्थी ID प्रविष्ट गर्नुहोस्</p>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-3">
              <Label htmlFor="studentId" className="flex items-center gap-2 text-base sm:text-lg font-semibold">
                <Key className="h-4 w-4 sm:h-5 sm:w-5" />
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
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="studentId"
                  type="text"
                  placeholder="Enter your unique Student ID"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                  className="border-2 focus:border-yellow-400 flex-1 text-base sm:text-lg py-3 sm:py-3 min-h-[48px]"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStudentId(generateSampleId())}
                  className="px-3 sm:px-4 bg-transparent border-yellow-300 hover:bg-yellow-50 min-h-[48px] text-sm sm:text-base"
                  title="Generate a random ID"
                >
                  Generate
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white py-4 sm:py-4 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-h-[56px]"
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
