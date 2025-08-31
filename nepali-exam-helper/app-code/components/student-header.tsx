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
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-lg border border-white/20 mb-4 sm:mb-6 mx-3 sm:mx-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Key className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
            <div>
              <p className="font-semibold text-slate-800 text-sm sm:text-base">Student ID: {studentId}</p>
              <p className="text-xs sm:text-sm text-slate-600">विद्यार्थी ID: {studentId}</p>
            </div>
          </div>

          {currentTestTitle && (
            <div className="border-l border-slate-300 pl-3 sm:pl-4 flex-1 min-w-0">
              <p className="font-semibold text-slate-800 text-sm sm:text-base">Current Test:</p>
              <p className="text-xs sm:text-sm text-slate-600 truncate pr-2 sm:pr-4">{currentTestTitle}</p>
            </div>
          )}
        </div>

        <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
          {onChangeTest && (
            <Button
              onClick={onChangeTest}
              variant="outline"
              size="sm"
              className="text-amber-700 hover:text-amber-800 bg-amber-50 border-amber-300 hover:bg-amber-100 transition-all duration-200 shadow-sm hover:shadow-md font-medium text-xs sm:text-sm min-h-[40px] flex-1 sm:flex-none"
            >
              <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Change Test</span>
              <span className="sm:hidden">Change</span>
            </Button>
          )}

          <Button
            onClick={onLogout}
            variant="outline"
            size="sm"
            className="text-amber-700 hover:text-amber-800 bg-amber-50 border-amber-300 hover:bg-amber-100 transition-all duration-200 shadow-sm hover:shadow-md font-medium text-xs sm:text-sm min-h-[40px] flex-1 sm:flex-none"
          >
            <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Switch Student</span>
            <span className="sm:hidden">Switch</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
