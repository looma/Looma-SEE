"use client"

import { useState, useEffect, useCallback } from "react"
import { ExamTabs } from "@/components/exam-tabs"
import { StudentLogin } from "@/components/student-login"
import { StudentHeader } from "@/components/student-header"
import { TestSelector } from "@/components/test-selector"
import { loadStudentProgress, saveStudentProgress } from "@/lib/storage"

export default function SeePrepPage() {
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null)
  const [currentTestId, setCurrentTestId] = useState<string>("see_2080_science")
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Restore last session
  useEffect(() => {
    const lastStudentId = localStorage.getItem("see_last_student_id")
    const lastTestId = localStorage.getItem("see_last_test_id") || "see_2080_science"

    if (lastStudentId) {
      const progress = loadStudentProgress(`${lastStudentId}_${lastTestId}`)
      setCurrentStudentId(lastStudentId)
      setCurrentTestId(lastTestId)
      if (progress?.lastUpdated) setLastSaved(new Date(progress.lastUpdated))
    }
  }, [])

  const handleLogin = (studentId: string) => {
    setCurrentStudentId(studentId)
    localStorage.setItem("see_last_student_id", studentId)
    localStorage.setItem("see_last_test_id", currentTestId)

    const key = `${studentId}_${currentTestId}`
    const existing = loadStudentProgress(key)
    if (!existing) {
      saveStudentProgress(studentId, {
        studentId,
        testId: currentTestId,
        answersA: {},
        answersB: {},
        answersC: {},
        answersD: {},
        currentTab: "group-a",
        attempts: [],
      })
    }
    setLastSaved(new Date())
  }

  const handleTestChange = (testId: string) => {
    setCurrentTestId(testId)
    localStorage.setItem("see_last_test_id", testId)

    if (currentStudentId) {
      const key = `${currentStudentId}_${testId}`
      const existing = loadStudentProgress(key)
      if (!existing) {
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
      setLastSaved(new Date())
    }
  }

  const handleLogout = () => {
    setCurrentStudentId(null)
    setLastSaved(null)
    localStorage.removeItem("see_last_student_id")
    localStorage.removeItem("see_last_test_id")
  }

  const updateLastSaved = useCallback(() => setLastSaved(new Date()), [])

  if (!currentStudentId) {
    return <StudentLogin onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8 animate-fade-in">
            <div className="relative flex items-center mb-6">
              <img src="/looma-logo.png" alt="Looma" className="h-16 w-auto" />
              <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                  SEE Exam Practice
                </h1>
                <h2 className="text-xl font-medium text-slate-700 mt-1">SEE परीक्षा अभ्यास</h2>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <p className="text-slate-700 leading-relaxed">
                  Welcome! Choose a practice test from the dropdown. Complete all sections and submit to see your score
                  and get AI-powered feedback. Good luck!
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <p className="text-slate-700 leading-relaxed">
                  स्वागत छ! ड्रपडाउनबाट अभ्यास परीक्षा छनौट गर्नुहोस्। सबै खण्डहरू पूरा गरेर पेश गर्नुहोस् र AI द्वारा प्रदान गरिएको
                  प्रतिक्रिया हेर्नुहोस्। शुभकामना!
                </p>
              </div>
            </div>
          </header>

          <StudentHeader studentId={currentStudentId} onLogout={handleLogout} lastSaved={lastSaved || undefined} />

          <TestSelector currentTestId={currentTestId} onTestChange={handleTestChange} studentId={currentStudentId} />

          <ExamTabs studentId={currentStudentId} testId={currentTestId} onProgressUpdate={updateLastSaved} />
        </div>
      </div>
    </div>
  )
}
