"use client"

import { useState, useEffect, useCallback } from "react"
import { ExamTabs } from "@/components/exam-tabs"
import { StudentLogin } from "@/components/student-login"
import { StudentHeader } from "@/components/student-header"
import { TestSelectionScreen } from "@/components/test-selection-screen"
import { ResultsCard } from "@/components/results-card"
import {
  loadStudentProgress,
  saveStudentProgress,
  getAuthState,
  clearAuthState,
  syncProgressToServer,
  loadProgressFromServer,
  isGuestUser,
  type StudentProgress,
} from "@/lib/storage"

export default function SeePrepPage() {
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null)
  const [currentTestId, setCurrentTestId] = useState<string | null>(null)
  const [currentTestTitle, setCurrentTestTitle] = useState<string | null>(null)
  const [showTestSelection, setShowTestSelection] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

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
      // Check auth state first
      const authState = getAuthState()
      if (authState.isAuthenticated && authState.email) {
        setIsAuthenticated(true)
        setUserEmail(authState.email)
        setCurrentStudentId(authState.email)

        // Load last test from localStorage
        const lastTestId = localStorage.getItem("see_last_test_id")
        if (lastTestId) {
          // Check if we have local progress for this test
          const localProgress = loadStudentProgress(`${authState.email}_${lastTestId}`)
          if (localProgress) {
            setCurrentTestId(lastTestId)
            setShowTestSelection(false)
          } else {
            // Try to load from server
            loadProgressFromServer(authState.email, lastTestId).then((serverProgress) => {
              if (serverProgress && !Array.isArray(serverProgress)) {
                // Cache server progress locally
                saveStudentProgress(authState.email!, serverProgress as Omit<StudentProgress, "lastUpdated">)
                setCurrentTestId(lastTestId)
                setShowTestSelection(false)
              } else {
                setShowTestSelection(true)
              }
            })
          }
        } else {
          setShowTestSelection(true)
        }
        return
      }

      // Check for guest session
      const lastStudentId = localStorage.getItem("see_last_student_id")
      const lastTestId = localStorage.getItem("see_last_test_id")

      if (lastStudentId && lastTestId) {
        const progress = loadStudentProgress(`${lastStudentId}_${lastTestId}`)
        if (progress) {
          setCurrentStudentId(lastStudentId)
          setCurrentTestId(lastTestId)
          setShowTestSelection(false)
        } else if (lastStudentId) {
          setCurrentStudentId(lastStudentId)
          setShowTestSelection(true)
        }
      }
    } catch (error) {
      console.error("Error loading saved state:", error)
    }
  }, [])

  const handleLogin = (studentId: string, authenticated: boolean, email?: string) => {
    setCurrentStudentId(studentId)
    setIsAuthenticated(authenticated)
    setUserEmail(authenticated && email ? email : null)

    try {
      localStorage.setItem("see_last_student_id", studentId)
    } catch (error) {
      console.error("Error saving student ID:", error)
    }
    setShowTestSelection(true)
  }

  const handleTestSelect = async (testId: string) => {
    setCurrentTestId(testId)
    try {
      localStorage.setItem("see_last_test_id", testId)
    } catch (error) {
      console.error("Error saving test ID:", error)
    }
    setShowTestSelection(false)
    setShowResults(false)

    if (currentStudentId) {
      const existingProgress = loadStudentProgress(`${currentStudentId}_${testId}`)

      if (!existingProgress) {
        // Check server for authenticated users
        if (isAuthenticated && userEmail) {
          const serverProgress = await loadProgressFromServer(userEmail, testId)
          if (serverProgress && !Array.isArray(serverProgress)) {
            // Use server progress
            saveStudentProgress(currentStudentId, serverProgress as Omit<StudentProgress, "lastUpdated">)
            return
          }
        }

        // Create new progress
        const newProgress = {
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
        }
        saveStudentProgress(currentStudentId, newProgress)

        // Sync to server for authenticated users
        if (isAuthenticated && userEmail) {
          syncProgressToServer(userEmail, newProgress)
        }
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
    setIsAuthenticated(false)
    setUserEmail(null)

    try {
      localStorage.removeItem("see_last_student_id")
      localStorage.removeItem("see_last_test_id")
      clearAuthState()
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
      const existingProgress = loadStudentProgress(`${currentStudentId}_${currentTestId}`)
      const newProgress = {
        studentId: currentStudentId,
        testId: currentTestId,
        answers: {
          groupA: {},
          groupB: {},
          groupC: {},
          groupD: {},
        },
        currentTab: "groupA",
        attempts: existingProgress?.attempts || [],
      }
      saveStudentProgress(currentStudentId, newProgress)

      // Sync to server for authenticated users
      if (isAuthenticated && userEmail) {
        syncProgressToServer(userEmail, newProgress)
      }
    }
  }

  const handleEditAnswers = () => {
    setShowResults(false)
    setTestResults(null)
    // Keep existing answers and go back to test
  }

  const updateLastSaved = useCallback(() => {
    // Sync to server when progress updates for authenticated users
    if (isAuthenticated && userEmail && currentStudentId && currentTestId) {
      const progress = loadStudentProgress(`${currentStudentId}_${currentTestId}`)
      if (progress) {
        syncProgressToServer(userEmail, progress)
      }
    }
  }, [isAuthenticated, userEmail, currentStudentId, currentTestId])

  // Show login screen (always show initially to avoid hydration mismatch)
  if (!isHydrated || !currentStudentId) {
    return <StudentLogin onLogin={handleLogin} />
  }

  // Show test selection screen
  if (showTestSelection) {
    return (
      <TestSelectionScreen
        studentId={currentStudentId}
        onTestSelect={handleTestSelect}
        onSwitchUser={handleLogout}
        isAuthenticated={isAuthenticated}
        userEmail={userEmail || undefined}
      />
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
          <header className="mb-8 pt-2">
            <div className="text-center py-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                SEE Exam Practice
              </h1>
              <h2 className="text-xl font-medium text-slate-700 mt-1">SEE परीक्षा अभ्यास</h2>
            </div>
          </header>

          <StudentHeader
            studentId={currentStudentId}
            onLogout={handleLogout}
            onChangeTest={handleChangeTest}
            currentTestTitle={currentTestTitle || undefined}
            isAuthenticated={isAuthenticated}
            userEmail={userEmail || undefined}
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
