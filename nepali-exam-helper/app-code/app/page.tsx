"use client"

import { useState, useEffect, useCallback } from "react"
import { ExamTabs } from "@/components/exam-tabs"
import { StudentLogin } from "@/components/student-login"
import { StudentHeader } from "@/components/student-header"
import { TestSelectionScreen } from "@/components/test-selection-screen"
import { loadStudentProgress, saveStudentProgress } from "@/lib/storage"

export default function SeePrepPage() {
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null)
  const [currentTestId, setCurrentTestId] = useState<string | null>(null)
  const [currentTestTitle, setCurrentTestTitle] = useState<string | null>(null)
  const [showTestSelection, setShowTestSelection] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on the client side before accessing localStorage
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fetch test title when test ID changes
  useEffect(() => {
    if (currentTestId) {
      fetch(`/api/tests`)
        .then((res) => res.json())
        .then((data) => {
          const test = data.tests?.find((t: any) => t.id === currentTestId)
          setCurrentTestTitle(test?.title || currentTestId)
        })
        .catch(() => setCurrentTestTitle(currentTestId))
    } else {
      setCurrentTestTitle(null)
    }
  }, [currentTestId])

  // Load saved state only on client side
  useEffect(() => {
    if (!isClient) return

    try {
      const lastStudentId = localStorage.getItem("see_last_student_id")
      const lastTestId = localStorage.getItem("see_last_test_id")

      if (lastStudentId && lastTestId) {
        const progress = loadStudentProgress(`${lastStudentId}_${lastTestId}`)
        if (progress) {
          setCurrentStudentId(lastStudentId)
          setCurrentTestId(lastTestId)
          setShowTestSelection(false) // Go directly to exam if they have progress
        } else {
          setCurrentStudentId(lastStudentId)
          setShowTestSelection(true) // Show test selection if no progress
        }
      }
    } catch (error) {
      console.error("Error loading saved state:", error)
    }
  }, [isClient])

  const handleLogin = (studentId: string) => {
    setCurrentStudentId(studentId)
    if (isClient) {
      localStorage.setItem("see_last_student_id", studentId)
    }
    setShowTestSelection(true) // Always show test selection after login
  }

  const handleTestSelect = (testId: string) => {
    setCurrentTestId(testId)
    if (isClient) {
      localStorage.setItem("see_last_test_id", testId)
    }
    setShowTestSelection(false)

    if (currentStudentId) {
      const existingProgress = loadStudentProgress(`${currentStudentId}_${testId}`)
      if (!existingProgress) {
        saveStudentProgress(currentStudentId, {
          studentId: currentStudentId,
          testId,
          answersA: {},
          answersB: {},
          answersC: {},
          answersD: {},
          currentTab: "group-a",
          attempts: [],
        })
      }
    }
  }

  const handleChangeTest = () => {
    setShowTestSelection(true)
    setCurrentTestId(null)
    setCurrentTestTitle(null)
  }

  const handleLogout = () => {
    setCurrentStudentId(null)
    setCurrentTestId(null)
    setCurrentTestTitle(null)
    setShowTestSelection(false)
    if (isClient) {
      localStorage.removeItem("see_last_student_id")
      localStorage.removeItem("see_last_test_id")
    }
  }

  const updateLastSaved = useCallback(() => {
    // This callback is called when progress is updated
  }, [])

  // Show login screen (always show initially to avoid hydration mismatch)
  if (!isClient || !currentStudentId) {
    return <StudentLogin onLogin={handleLogin} />
  }

  // Show test selection screen
  if (showTestSelection) {
    return (
      <TestSelectionScreen studentId={currentStudentId} onTestSelect={handleTestSelect} onSwitchUser={handleLogout} />
    )
  }

  // Show main exam interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <div className="relative flex items-center mb-6">
              <img src="/looma-logo.png" alt="Looma" className="h-16 w-auto" />
              <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                  SEE Exam Practice
                </h1>
                <h2 className="text-xl font-medium text-slate-700 mt-1">SEE परीक्षा अभ्यास</h2>
              </div>
            </div>
          </header>

          <StudentHeader
            studentId={currentStudentId}
            onLogout={handleLogout}
            onChangeTest={handleChangeTest}
            currentTestTitle={currentTestTitle || undefined}
          />

          <ExamTabs studentId={currentStudentId} testId={currentTestId || ""} onProgressUpdate={updateLastSaved} />
        </div>
      </div>
    </div>
  )
}
