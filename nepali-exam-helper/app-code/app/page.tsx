"use client"

import { useState, useEffect, useCallback } from "react"
import { ExamTabs } from "@/components/exam-tabs"
import { StudentLogin } from "@/components/student-login"
import { StudentHeader } from "@/components/student-header"
import { TestSelectionScreen } from "@/components/test-selection-screen"
import { ResultsCard } from "@/components/results-card"
import { loadStudentProgress, saveStudentProgress } from "@/lib/storage"
export default function SeePrepPage() {
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null)
  const [currentTestId, setCurrentTestId] = useState<string | null>(null)
  const [currentTestTitle, setCurrentTestTitle] = useState<string | null>(null)
  const [showTestSelection, setShowTestSelection] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  const [isHydrated, setIsHydrated] = useState(false)

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

  // Mark as hydrated and load saved state
  useEffect(() => {
    setIsHydrated(true)
    
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
  }, [])

  const handleLogin = (studentId: string) => {
    setCurrentStudentId(studentId)
    try {
      localStorage.setItem("see_last_student_id", studentId)
    } catch (error) {
      console.error("Error saving student ID:", error)
    }
    setShowTestSelection(true) // Always show test selection after login
  }

  const handleTestSelect = (testId: string) => {
    setCurrentTestId(testId)
    try {
      localStorage.setItem("see_last_test_id", testId)
    } catch (error) {
      console.error("Error saving test ID:", error)
    }
    setShowTestSelection(false)
    setShowResults(false) // Hide results when selecting a new test

    if (currentStudentId) {
      const existingProgress = loadStudentProgress(`${currentStudentId}_${testId}`)
      if (!existingProgress) {
        saveStudentProgress(currentStudentId, {
          studentId: currentStudentId,
          testId,
          answers: {
            groupA: {},
            groupB: {},
            groupC: {},
            groupD: {},
          },
          currentTab: "groupA",
          attempts: [],
        })
      }
    }
  }

  const handleChangeTest = () => {
    setShowTestSelection(true)
    setShowResults(false)
    setCurrentTestId(null)
    setCurrentTestTitle(null)
  }

  const handleLogout = () => {
    setCurrentStudentId(null)
    setCurrentTestId(null)
    setCurrentTestTitle(null)
    setShowTestSelection(false)
    setShowResults(false)
    setTestResults(null)
    try {
      localStorage.removeItem("see_last_student_id")
      localStorage.removeItem("see_last_test_id")
    } catch (error) {
      console.error("Error clearing localStorage:", error)
    }
  }

  const handleShowResults = (results: any) => {
    setTestResults(results)
    setShowResults(true)
  }

  const handleRetakeTest = () => {
    setShowResults(false)
    setTestResults(null)
    // Clear answers but keep the same test
    if (currentStudentId && currentTestId) {
      saveStudentProgress(currentStudentId, {
        studentId: currentStudentId,
        testId: currentTestId,
        answers: {
          groupA: {},
          groupB: {},
          groupC: {},
          groupD: {},
        }, // Clear all answers for retake
        currentTab: "groupA", // Reset to first section
        attempts: loadStudentProgress(`${currentStudentId}_${currentTestId}`)?.attempts || [],
      })
    }
  }

  const handleEditAnswers = () => {
    setShowResults(false)
    setTestResults(null)
    // Keep existing answers and go back to test
  }

  const updateLastSaved = useCallback(() => {
    // This callback is called when progress is updated
  }, [])

  // Show login screen (always show initially to avoid hydration mismatch)
  if (!isHydrated || !currentStudentId) {
    return <StudentLogin onLogin={handleLogin} />
  }

  // Show test selection screen
  if (showTestSelection) {
    return (
      <TestSelectionScreen studentId={currentStudentId} onTestSelect={handleTestSelect} onSwitchUser={handleLogout} />
    )
  }

  // Show results screen
  if (showResults && testResults) {
    return (
      <ResultsCard
        results={testResults}
        onRetake={handleRetakeTest}
        onEditAnswers={handleEditAnswers}
        onBackToTestSelection={handleChangeTest}
        studentId={currentStudentId}
        testId={currentTestId || ""}
      />
    )
  }

  // Show main exam interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50" suppressHydrationWarning>
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

          <ExamTabs
            studentId={currentStudentId}
            testId={currentTestId || ""}
            onProgressUpdate={updateLastSaved}
            onShowResults={handleShowResults}
            onBackToTestSelection={handleChangeTest}
          />
        </div>
      </div>
    </div>
  )
}
