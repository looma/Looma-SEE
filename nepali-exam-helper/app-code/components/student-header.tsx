"use client"

import { Button } from "@/components/ui/button"
import { Key, LogOut, RotateCcw } from "lucide-react"

interface StudentHeaderProps {
  studentId: string
  onLogout: () => void
  onChangeTest?: () => void
  currentTestTitle?: string
}

export function StudentHeader({ studentId, onLogout, onChangeTest, currentTestTitle }: StudentHeaderProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Key className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-semibold text-slate-800">Student ID: {studentId}</p>
              <p className="text-sm text-slate-600">विद्यार्थी ID: {studentId}</p>
            </div>
          </div>

          {currentTestTitle && (
            <div className="hidden sm:block border-l border-slate-300 pl-4 flex-1 min-w-0">
              <p className="font-semibold text-slate-800">Current Test:</p>
              <p className="text-sm text-slate-600 truncate pr-4">{currentTestTitle}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 flex-shrink-0">
          {onChangeTest && (
            <Button
              onClick={onChangeTest}
              variant="outline"
              size="sm"
              className="text-amber-700 hover:text-amber-800 bg-amber-50 border-amber-300 hover:bg-amber-100 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Change Test
            </Button>
          )}

          <Button
            onClick={onLogout}
            variant="outline"
            size="sm"
            className="text-amber-700 hover:text-amber-800 bg-amber-50 border-amber-300 hover:bg-amber-100 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Switch Student
          </Button>
        </div>
      </div>
    </div>
  )
}
