"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Loader2, Trophy, Save } from "lucide-react"
import { GroupA } from "./group-a"
import { FreeResponseGroup } from "./free-response-group"
import { EnglishQuestionRenderer } from "./english-question-renderer"
import { SocialStudiesGroupRenderer } from "./social-studies-question-renderer"
import { NepaliQuestionRenderer } from "./nepali-question-renderer"
import { MathQuestionRenderer } from "./math-question-renderer"
import { ExamTimer } from "./exam-timer"
import { useQuestions } from "@/lib/use-questions"
import { loadStudentProgress, saveStudentProgress, saveAttemptHistory, syncProgressToServer, loadProgressFromServer } from "@/lib/storage"
import { useLanguage } from "@/lib/language-context"

interface ExamTabsProps {
  studentId: string
  testId: string
  userEmail?: string | null  // For cloud sync
  onProgressUpdate: () => void
  onShowResults: (results: any) => void
  onBackToTestSelection: () => void
}

export function ExamTabs({ studentId, testId, userEmail, onProgressUpdate, onShowResults, onBackToTestSelection }: ExamTabsProps) {
  const { questions, metadata, loading, error } = useQuestions(testId)
  const { language } = useLanguage()
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'failed' | null>(null)
  const [showSubmitWarning, setShowSubmitWarning] = useState(false)
  const [currentTab, setCurrentTab] = useState("")

  // Timer state
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isTimerPaused, setIsTimerPaused] = useState(false)
  const [isManuallyPaused, setIsManuallyPaused] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const timerInitializedRef = useRef(false)

  // Ref for debounced server sync
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Localized error message for grading failures
  const getGradingErrorMessage = () => language === 'english'
    ? 'Could not grade this answer. Please check your internet connection.'
    : 'उत्तर ग्रेड गर्न सकिएन। कृपया आफ्नो इन्टरनेट जडान जाँच गर्नुहोस्।'


  const getFirstAvailableSection = () => {
    if (!questions) return "groupA"

    // Check if this is an English test
    if (questions.englishQuestions && questions.englishQuestions.length > 0) {
      return questions.englishQuestions[0].id
    }

    // Check if this is a Nepali test
    if (questions.nepaliQuestions && questions.nepaliQuestions.length > 0) {
      return "nepali_0"
    }

    // Check if this is a Social Studies test
    if (questions.socialStudiesGroups && questions.socialStudiesGroups.length > 0) {
      return "socialStudies_0"
    }

    // Check if this is a Math test
    if (questions.mathQuestions && questions.mathQuestions.length > 0) {
      return "math"
    }

    // Science test sections
    if (questions.groupA.length > 0) return "groupA"
    if (questions.groupB.length > 0) return "groupB"
    if (questions.groupC.length > 0) return "groupC"
    if (questions.groupD.length > 0) return "groupD"
    return "groupA"
  }

  // Load progress when component mounts
  useEffect(() => {
    if (!studentId || !testId) return

    async function loadProgress() {
      const storageKey = `${studentId}_${testId}`
      let progress = loadStudentProgress(storageKey)

      // If no local progress and user is authenticated, try loading from server
      if (!progress && userEmail) {
        try {
          const serverProgress = await loadProgressFromServer(userEmail, testId)
          if (serverProgress && !Array.isArray(serverProgress)) {
            progress = serverProgress
            // Cache server progress locally
            saveStudentProgress(studentId, serverProgress)
            console.log(`☁️ Loaded test progress from server for ${userEmail}`)
          }
        } catch (error) {
          console.error("Failed to load progress from server:", error)
        }
      }

      if (progress && progress.answers) {
        setAnswers(progress.answers)
        setLastSaved(progress.lastUpdated ? new Date(progress.lastUpdated) : new Date())
        // Restore timer state - always load from storage
        // For retake: elapsedTimeSeconds will be 0
        // For edit answers: elapsedTimeSeconds will be the saved value
        const savedTime = progress.elapsedTimeSeconds ?? 0
        setElapsedSeconds(savedTime)
        timerInitializedRef.current = true
      }

      // Always scroll to top when loading/resuming a test
      window.scrollTo({ top: 0, behavior: 'instant' })
    }

    loadProgress()
  }, [studentId, testId, userEmail])

  // Set tab when questions load (separate effect to avoid clearing answers)
  useEffect(() => {
    if (!questions) return

    const isEnglishTest = questions.englishQuestions && questions.englishQuestions.length > 0
    const isSocialStudiesTest = questions.socialStudiesGroups && questions.socialStudiesGroups.length > 0
    const isNepaliTest = questions.nepaliQuestions && questions.nepaliQuestions.length > 0
    const isMathTest = questions.mathQuestions && questions.mathQuestions.length > 0

    if (!currentTab) {
      if (isEnglishTest) {
        setCurrentTab(questions.englishQuestions[0].id)
      } else if (isSocialStudiesTest) {
        setCurrentTab("socialStudies_0")
      } else if (isNepaliTest) {
        setCurrentTab("nepali_0")
      } else if (isMathTest) {
        setCurrentTab("math")
      } else {
        setCurrentTab(getFirstAvailableSection())
      }
    }
  }, [questions, currentTab])

  // Timer tick logic - runs every second when not paused
  useEffect(() => {
    if (isTimerPaused || isSubmitting) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }

    timerRef.current = setInterval(() => {
      setElapsedSeconds(prev => prev + 1)
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isTimerPaused, isSubmitting])

  // Page Visibility API - pause timer when tab is hidden (unless manually paused)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden - pause timer and save current time
        setIsTimerPaused(true)
        // Save timer state immediately when tab is hidden
        const storageKey = `${studentId}_${testId}`
        const existingProgress = loadStudentProgress(storageKey)
        if (existingProgress) {
          const progressData = {
            ...existingProgress,
            elapsedTimeSeconds: elapsedSeconds,
          }
          saveStudentProgress(studentId, progressData)
        }
      } else {
        // Tab is visible again - only resume if NOT manually paused
        if (!isManuallyPaused) {
          setIsTimerPaused(false)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isManuallyPaused, studentId, testId, elapsedSeconds])

  // Toggle pause function
  const handleTogglePause = useCallback(() => {
    if (isTimerPaused) {
      // Resuming - clear manual pause flag
      setIsManuallyPaused(false)
      setIsTimerPaused(false)
    } else {
      // Pausing - set manual pause flag
      setIsManuallyPaused(true)
      setIsTimerPaused(true)
    }
  }, [isTimerPaused])


  // Save progress when answers change (NOT timer - timer saves separately)
  useEffect(() => {
    if (!studentId || !testId) return

    const storageKey = `${studentId}_${testId}`
    const existingProgress = loadStudentProgress(storageKey)

    const progressData = {
      studentId,
      testId,
      answers,
      currentTab,
      attempts: existingProgress?.attempts || [],
      elapsedTimeSeconds: existingProgress?.elapsedTimeSeconds || 0,  // Preserve existing timer
    }

    saveStudentProgress(studentId, progressData)
    setLastSaved(new Date())
    onProgressUpdate()

    // Debounced sync to server for authenticated users (wait 2s after last change)
    if (userEmail) {
      setSyncStatus('pending')

      // Clear any existing timeout
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }

      // Set a new timeout to sync after 2 seconds of inactivity
      syncTimeoutRef.current = setTimeout(() => {
        syncProgressToServer(userEmail, progressData).then((success) => {
          setSyncStatus(success ? 'synced' : 'failed')
        })
      }, 2000)
    }
  }, [answers, studentId, testId, onProgressUpdate, currentTab, userEmail])

  // Periodic timer save (every 30 seconds) - much more efficient than saving every second
  useEffect(() => {
    if (!studentId || !testId || isTimerPaused) return

    const saveTimer = () => {
      const storageKey = `${studentId}_${testId}`
      const existingProgress = loadStudentProgress(storageKey)
      if (existingProgress) {
        const progressData = {
          ...existingProgress,
          elapsedTimeSeconds: elapsedSeconds,
        }
        saveStudentProgress(studentId, progressData)
      }
    }

    // Save every 30 seconds
    const timerSaveInterval = setInterval(saveTimer, 30000)

    return () => clearInterval(timerSaveInterval)
  }, [studentId, testId, elapsedSeconds, isTimerPaused])

  const handleAnswerChange = (questionId: string, subQuestionId: string, answer: any) => {
    setAnswers((prev: Record<string, any>) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [subQuestionId]: answer,
      },
    }))
  }

  const handleGroupAAnswerChange = (id: string, answer: string) => {
    setAnswers((prev: Record<string, any>) => ({
      ...prev,
      groupA: {
        ...prev.groupA,
        [id]: answer,
      },
    }))
  }

  const handleFreeResponseChange = (group: "B" | "C" | "D", id: string, answer: string) => {
    setAnswers((prev: Record<string, any>) => ({
      ...prev,
      [`group${group}`]: {
        ...prev[`group${group}`],
        [id]: answer,
      },
    }))
  }

  const handleSocialStudiesAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev: Record<string, any>) => ({
      ...prev,
      socialStudies: {
        ...prev.socialStudies,
        [questionId]: answer,
      },
    }))
  }

  const handleNepaliAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev: Record<string, any>) => ({
      ...prev,
      nepali: {
        ...prev.nepali,
        [questionId]: value,
      },
    }))
  }

  const handleMathAnswerChange = (questionNumber: number, subLabel: string, answer: string) => {
    setAnswers((prev: Record<string, any>) => ({
      ...prev,
      math: {
        ...prev.math,
        [questionNumber]: {
          ...prev.math?.[questionNumber],
          [subLabel]: answer,
        },
      },
    }))
  }

  const formatSavedTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
  }

  const calculateOverallProgress = () => {
    if (!questions) return 0

    let totalQuestions = 0
    let answeredQuestions = 0

    if (questions.englishQuestions && questions.englishQuestions.length > 0) {
      totalQuestions = questions.englishQuestions.length
      answeredQuestions = questions.englishQuestions.filter((q: any) => {
        const answer = answers[q.id]
        if (!answer) return false

        // Handle different answer structures based on question type
        if (q.type === 'free_writing') {
          // Free writing questions store answer as answers[questionId].content = "text"
          return answer.content && typeof answer.content === 'string' && answer.content.trim().length > 0
        } else if (typeof answer === "object" && !Array.isArray(answer)) {
          // Other question types with object answers (like reading comprehension with sub-sections)
          return Object.values(answer).some((val) => {
            if (typeof val === 'string') {
              return val.trim().length > 0
            } else if (typeof val === 'object' && val !== null) {
              // Handle nested objects (like sub-sections)
              return Object.values(val).some((nestedVal) =>
                typeof nestedVal === 'string' && nestedVal.trim().length > 0
              )
            }
            return val !== undefined && val !== null && val !== ""
          })
        }
        return answer !== undefined && answer !== null && answer !== ""
      }).length
    } else if (questions.socialStudiesGroups && questions.socialStudiesGroups.length > 0) {
      // Social Studies test format
      questions.socialStudiesGroups.forEach((group: any) => {
        totalQuestions += group.questions?.length || 0
        group.questions?.forEach((q: any) => {
          const answer = answers.socialStudies?.[q.id]
          if (answer && (typeof answer === 'string' ? answer.trim().length > 0 : true)) {
            answeredQuestions++
          }
        })
      })
    } else if (questions.nepaliQuestions && questions.nepaliQuestions.length > 0) {
      // Nepali test format
      totalQuestions = questions.nepaliQuestions.length
      answeredQuestions = questions.nepaliQuestions.filter((q: any) => {
        const answer = answers.nepali?.[`q${q.questionNumberEnglish || q.questionNumber}`]
        if (!answer) return false
        if (typeof answer === 'string') return answer.trim().length > 0
        if (typeof answer === 'object') {
          // Check if any nested value has content
          return Object.values(answer).some((val: any) => {
            if (typeof val === 'string') return val.trim().length > 0
            if (typeof val === 'object' && val !== null) {
              return Object.values(val).some((v: any) => typeof v === 'string' && v.trim().length > 0)
            }
            return val !== undefined && val !== null && val !== ''
          })
        }
        return false
      }).length
    } else if (questions.mathQuestions && questions.mathQuestions.length > 0) {
      // Math test format - count sub-questions
      questions.mathQuestions.forEach((q: any) => {
        totalQuestions += q.sub_questions?.length || 0
        q.sub_questions?.forEach((subQ: any) => {
          // Use same keys as renderer: question_numberEnglish and labelEnglish
          const answer = answers.math?.[q.question_numberEnglish]?.[subQ.labelEnglish]
          if (answer && (typeof answer === 'string' ? answer.trim().length > 0 : true)) {
            answeredQuestions++
          }
        })
      })
    } else {
      // Science test format
      totalQuestions =
        questions.groupA.length + questions.groupB.length + questions.groupC.length + questions.groupD.length

      // Count Group A answers
      const groupAAnswered = questions.groupA.filter((q: any) => answers.groupA?.[q.id]).length

      // Count Group B answers
      const groupBAnswered = questions.groupB.filter((q: any) => {
        const answer = answers.groupB?.[q.id]
        return answer && (typeof answer === 'string' ? answer.trim().length > 0 : true)
      }).length

      // Count Group C answers
      const groupCAnswered = questions.groupC.filter((q: any) => {
        const answer = answers.groupC?.[q.id]
        return answer && (typeof answer === 'string' ? answer.trim().length > 0 : true)
      }).length

      // Count Group D answers
      const groupDAnswered = questions.groupD.filter((q: any) => {
        const answer = answers.groupD?.[q.id]
        return answer && (typeof answer === 'string' ? answer.trim().length > 0 : true)
      }).length

      answeredQuestions = groupAAnswered + groupBAnswered + groupCAnswered + groupDAnswered
    }

    return totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0
  }

  const getIncompleteQuestions = () => {
    if (!questions) return { incomplete: 0, total: 0 }

    let totalQuestions = 0
    let incompleteQuestions = 0

    if (questions.englishQuestions && questions.englishQuestions.length > 0) {
      // English test format - count individual subQuestions like Math
      questions.englishQuestions.forEach((q: any) => {
        if (q.type === 'free_writing') {
          // Free writing is a single question
          totalQuestions++
          const answer = answers[q.id]
          if (!answer?.content || typeof answer.content !== 'string' || answer.content.trim().length === 0) {
            incompleteQuestions++
          }
        } else if (q.type === 'grammar') {
          // Grammar questions have direct subQuestions array
          const subQs = q.subQuestions || []
          totalQuestions += subQs.length
          subQs.forEach((subQ: any) => {
            const subQId = subQ.idEnglish || subQ.idNepali
            const answer = answers[q.questionNumberEnglish]?.[subQId]
            if (!answer || (typeof answer === 'string' && answer.trim().length === 0)) {
              incompleteQuestions++
            }
          })
        } else if (q.subSections) {
          // Reading comprehension, etc. have subSections with subQuestions
          q.subSections.forEach((section: any) => {
            if (section.type === 'matching' || section.type === 'ordering') {
              // Matching/ordering is counted as one question per item
              const items = section.columns?.A?.length || section.sentences?.length || 0
              totalQuestions += items
              const sectionId = section.idEnglish || section.idNepali
              if (section.type === 'matching') {
                // Check each matching answer
                for (let i = 0; i < items; i++) {
                  const itemId = section.columns?.A?.[i]?.idEnglish || section.columns?.A?.[i]?.idNepali || String(i + 1)
                  const answer = answers[q.questionNumberEnglish]?.[sectionId]?.[itemId]
                  if (!answer || (typeof answer === 'string' && answer.trim().length === 0)) {
                    incompleteQuestions++
                  }
                }
              } else {
                // Ordering - check if answer array exists and has content
                const answer = answers[q.questionNumberEnglish]?.[sectionId]
                if (!answer || !Array.isArray(answer) || answer.length === 0) {
                  incompleteQuestions += items
                }
              }
            } else if (section.subQuestions) {
              totalQuestions += section.subQuestions.length
              section.subQuestions.forEach((subQ: any) => {
                const sectionId = section.idEnglish || section.idNepali
                const subQId = subQ.idEnglish || subQ.idNepali
                const answer = answers[q.questionNumberEnglish]?.[sectionId]?.[subQId]
                if (!answer || (typeof answer === 'string' && answer.trim().length === 0)) {
                  incompleteQuestions++
                }
              })
            }
          })
        }
      })
    } else if (questions.socialStudiesGroups && questions.socialStudiesGroups.length > 0) {
      // Social Studies test format
      questions.socialStudiesGroups.forEach((group: any) => {
        totalQuestions += group.questions?.length || 0
        group.questions?.forEach((q: any) => {
          const answer = answers.socialStudies?.[q.id]
          if (!answer || (typeof answer === 'string' && answer.trim().length === 0)) {
            incompleteQuestions++
          }
        })
      })
    } else if (questions.nepaliQuestions && questions.nepaliQuestions.length > 0) {
      // Nepali test format
      totalQuestions = questions.nepaliQuestions.length
      incompleteQuestions = questions.nepaliQuestions.filter((q: any) => {
        const answer = answers.nepali?.[`q${q.questionNumberEnglish || q.questionNumber}`]
        if (!answer) return true
        if (typeof answer === 'string') return answer.trim().length === 0
        if (typeof answer === 'object') {
          // Check if any nested value has content
          return !Object.values(answer).some((val: any) => {
            if (typeof val === 'string') return val.trim().length > 0
            if (typeof val === 'object' && val !== null) {
              return Object.values(val).some((v: any) => typeof v === 'string' && v.trim().length > 0)
            }
            return val !== undefined && val !== null && val !== ''
          })
        }
        return true
      }).length
    } else if (questions.mathQuestions && questions.mathQuestions.length > 0) {
      // Math test format - count incomplete sub-questions
      questions.mathQuestions.forEach((q: any) => {
        totalQuestions += q.sub_questions?.length || 0
        q.sub_questions?.forEach((subQ: any) => {
          // Use same keys as renderer: question_numberEnglish and labelEnglish
          const answer = answers.math?.[q.question_numberEnglish]?.[subQ.labelEnglish]
          if (!answer || (typeof answer === 'string' && answer.trim().length === 0)) {
            incompleteQuestions++
          }
        })
      })
    } else {
      // Science test format
      totalQuestions =
        questions.groupA.length + questions.groupB.length + questions.groupC.length + questions.groupD.length

      // Count Group A incomplete answers
      const groupAIncomplete = questions.groupA.filter((q: any) => !answers.groupA?.[q.id]).length

      // Count Group B incomplete answers
      const groupBIncomplete = questions.groupB.filter((q: any) => {
        const answer = answers.groupB?.[q.id]
        return !answer || (typeof answer === 'string' && answer.trim().length === 0)
      }).length

      // Count Group C incomplete answers
      const groupCIncomplete = questions.groupC.filter((q: any) => {
        const answer = answers.groupC?.[q.id]
        return !answer || (typeof answer === 'string' && answer.trim().length === 0)
      }).length

      // Count Group D incomplete answers
      const groupDIncomplete = questions.groupD.filter((q: any) => {
        const answer = answers.groupD?.[q.id]
        return !answer || (typeof answer === 'string' && answer.trim().length === 0)
      }).length

      incompleteQuestions = groupAIncomplete + groupBIncomplete + groupCIncomplete + groupDIncomplete
    }

    return { incomplete: incompleteQuestions, total: totalQuestions }
  }

  const handleSubmit = () => {
    const { incomplete, total } = getIncompleteQuestions()

    if (incomplete > 0) {
      setShowSubmitWarning(true)
    } else {
      // All questions answered, proceed with submission
      submitTest()
    }
  }

  const submitTest = async () => {
    setIsSubmitting(true)
    setSubmissionError(null)
    try {
      console.log("🚀 Starting test submission with AI grading...")

      if (!questions) {
        throw new Error("No questions available")
      }

      // Check if this is an English test
      const isEnglishTest = questions.englishQuestions && questions.englishQuestions.length > 0

      // Prepare results object
      const results: any = {
        scoreA: 0,
        feedbackB: [],
        feedbackC: [],
        feedbackD: [],
        answersA: answers.groupA || {},
        timeTakenSeconds: elapsedSeconds,
        allocatedMinutes: metadata?.durationEnglish || 180,
      }

      if (isEnglishTest) {
        // English test grading - use same simple approach as Science tests

        // Grade English questions with AI (treat like Group B/C/D)
        const gradingPromises: Promise<any>[] = []

        if (questions.englishQuestions && questions.englishQuestions.length > 0) {
          questions.englishQuestions.forEach((question: any) => {
            const userAnswer = answers[(question as any).id]
            if (!userAnswer) return

            // Handle different English question types
            if ((question as any).type === 'reading_comprehension' && (question as any).subSections) {
              // For reading comprehension, grade each sub-section separately
              question.subSections.forEach((section: any, sectionIndex: number) => {
                // CRITICAL: Use idEnglish or idNepali for consistent storage keys, matching the renderer
                const sectionId = section.idEnglish || section.idNepali || section.id || `section_${sectionIndex}`
                if (section.type === 'matching' && section.columns && section.correctAnswer) {
                  // Grade matching questions automatically
                  const sectionAnswer = userAnswer[sectionId]
                  if (sectionAnswer && typeof sectionAnswer === 'object') {
                    const correctMatches = section.correctAnswer || []
                    const userMatches: Array<{ A: string; B: string }> = []

                    // Convert user answers to match format
                    if (section.columns && section.columns.A) {
                      section.columns.A.forEach((itemA: any) => {
                        // Use same ID pattern as renderer: idEnglish || id
                        const itemAId = itemA.idEnglish || itemA.id
                        const userMatch = sectionAnswer[itemAId]
                        if (userMatch) {
                          userMatches.push({ A: itemAId, B: userMatch })
                        }
                      })
                    }

                    // Count correct matches
                    let correctCount = 0
                    const totalMatches = correctMatches.length

                    correctMatches.forEach((correctMatch: { A: string; B: string }) => {
                      const userMatch = userMatches.find(
                        (um: { A: string; B: string }) => um.A === correctMatch.A && um.B === correctMatch.B
                      )
                      if (userMatch) {
                        correctCount++
                      }
                    })

                    // Calculate marks per match (use bilingual fallback)
                    const matchingSectionMarks = section.marksEnglish || section.marks || 0
                    const marksPerMatch = matchingSectionMarks && totalMatches > 0
                      ? Math.round((matchingSectionMarks / totalMatches) * 10) / 10
                      : 1
                    const score = correctCount * marksPerMatch
                    const feedback = correctCount === totalMatches
                      ? (language === 'english' ? `Perfect! All ${totalMatches} matches are correct.` : `उत्कृष्ट! सबै ${totalMatches} मिलान सही छन्।`)
                      : correctCount > 0
                        ? (language === 'english' ? `Partially correct. ${correctCount} out of ${totalMatches} matches are correct.` : `आंशिक रूपमा सही। ${totalMatches} मध्ये ${correctCount} मिलान सही छन्।`)
                        : (language === 'english' ? `Incorrect. None of the matches are correct.` : `गलत। कुनै पनि मिलान सही छैन।`)

                    console.log(`Auto-grading matching question: ${correctCount}/${totalMatches} correct`)

                    gradingPromises.push(Promise.resolve({
                      id: `${(question as any).id}_${sectionId}`,
                      score: score,
                      feedback: feedback,
                      question: section.title || (language === 'english' ? 'Matching question' : 'मिलान प्रश्न'),
                      studentAnswer: JSON.stringify(userMatches),
                      group: "English",
                      questionId: (question as any).id,
                      sectionId: sectionId,
                    }))
                  }
                } else if (section.type === 'ordering' && section.sentences && section.correctAnswer) {
                  // Grade ordering questions automatically
                  const sectionAnswer = userAnswer[sectionId]
                  if (sectionAnswer && typeof sectionAnswer === 'object') {
                    const correctOrder = section.correctAnswer || [] // Array of item IDs in correct order
                    const sentences = section.sentences || section.items || []

                    // Convert user answers (item.id -> position) to ordered array
                    const userOrderArray: string[] = []
                    sentences.forEach((item: any) => {
                      // Use same ID pattern as renderer: idEnglish || id
                      const itemId = item.idEnglish || item.id
                      const position = sectionAnswer[itemId]
                      if (position) {
                        const posIndex = parseInt(position, 10) - 1 // Convert 1-based to 0-based
                        userOrderArray[posIndex] = itemId
                      }
                    })

                    // Filter out undefined entries and get the user's order
                    const userOrder = userOrderArray.filter(Boolean)

                    // Count correct positions
                    let correctCount = 0
                    const totalItems = correctOrder.length

                    correctOrder.forEach((correctId: string, index: number) => {
                      if (userOrder[index] === correctId) {
                        correctCount++
                      }
                    })

                    // Calculate marks per item (use bilingual fallback)
                    const orderingSectionMarks = section.marksEnglish || section.marks || 0
                    const marksPerItem = orderingSectionMarks && totalItems > 0
                      ? Math.round((orderingSectionMarks / totalItems) * 10) / 10
                      : 1
                    const score = correctCount * marksPerItem
                    const feedback = correctCount === totalItems
                      ? (language === 'english' ? `Perfect! All ${totalItems} items are in the correct order.` : `उत्कृष्ट! सबै ${totalItems} वस्तुहरू सही क्रममा छन्।`)
                      : correctCount > 0
                        ? (language === 'english' ? `Partially correct. ${correctCount} out of ${totalItems} items are in the correct position.` : `आंशिक रूपमा सही। ${totalItems} मध्ये ${correctCount} वस्तुहरू सही स्थानमा छन्।`)
                        : (language === 'english' ? `Incorrect. None of the items are in the correct position.` : `गलत। कुनै पनि वस्तु सही स्थानमा छैन।`)

                    // Format user answer for display
                    const userAnswerDisplay = userOrder.map((id, idx) => {
                      const sentence = sentences.find((s: any) => (s.idEnglish || s.id) === id || s.id === id)
                      return `${idx + 1}. ${sentence?.textEnglish || sentence?.text || id}`
                    }).join('\n')

                    gradingPromises.push(Promise.resolve({
                      id: `${(question as any).id}_${sectionId}`,
                      score: score,
                      feedback: feedback,
                      question: section.title || (language === 'english' ? 'Ordering question' : 'क्रम मिलाउने प्रश्न'),
                      studentAnswer: userAnswerDisplay || (language === 'english' ? 'No answer provided' : 'कुनै उत्तर प्रदान गरिएको छैन'),
                      group: "English",
                      questionId: (question as any).id,
                      sectionId: sectionId,
                    }))
                  }
                } else if (section.subQuestions) {
                  section.subQuestions.forEach((subQ: any) => {
                    const sectionAnswer = userAnswer[sectionId]
                    if (sectionAnswer && typeof sectionAnswer === 'object') {
                      // Use same ID pattern as renderer: idEnglish || id
                      const subQId = subQ.idEnglish || subQ.id
                      const userSubAnswer = sectionAnswer[subQId]
                      if (userSubAnswer && typeof userSubAnswer === 'string' && userSubAnswer.trim().length > 0) {
                        // Calculate marks for sub-question (use bilingual fallback)
                        const sectionMarks = section.marksEnglish || section.marks || 0
                        const subQuestionMarks = subQ.marksEnglish || subQ.marks || (sectionMarks ? Math.round((sectionMarks / section.subQuestions.length) * 10) / 10 : 1)

                        if (section.type === 'true_false' || section.type === 'true_false_not_given') {
                          // Grade true/false and true/false/not given questions automatically
                          console.log(`🎯 Auto-grading ${section.type} question: ${subQ.questionEnglish}`)
                          // Use bilingual fallback for correct answer
                          const correctAnswer = subQ.correctAnswerEnglish || subQ.correctAnswer || subQ.correctAnswerNepali || ''
                          const isCorrect = correctAnswer && typeof correctAnswer === 'string' && userSubAnswer.toUpperCase() === correctAnswer.toUpperCase()
                          const score = isCorrect ? subQuestionMarks : 0
                          const feedback = isCorrect
                            ? (language === 'english' ? "Correct! Well done." : "सही! राम्रो भयो।")
                            : (language === 'english' ? `Incorrect. The correct answer is ${correctAnswer}.` : `गलत। सही उत्तर ${correctAnswer} हो।`)

                          console.log(`✅ Auto-graded result: ${isCorrect ? 'CORRECT' : 'INCORRECT'} - ${feedback}`)

                          gradingPromises.push(Promise.resolve({
                            id: `${(question as any).id}_${sectionId}_${subQ.idEnglish || subQ.id}`,
                            score: score,
                            feedback: feedback,
                            question: subQ.questionEnglish,
                            studentAnswer: userSubAnswer,
                            group: "English",
                            questionId: (question as any).id,
                            sectionId: sectionId,
                            subQuestionId: subQ.idEnglish || subQ.id,
                          }))
                        } else if (section.type === 'multiple_choice') {
                          // Grade multiple choice questions automatically
                          console.log(`🎯 Auto-grading multiple_choice question: ${subQ.questionEnglish}`)
                          // Use bilingual fallback for correct answer
                          const correctAnswer = subQ.correctAnswerEnglish || subQ.correctAnswer || subQ.correctAnswerNepali || ''

                          // Normalize: lowercase, remove hyphens, collapse spaces (same as fill_in_the_blanks)
                          const normalize = (s: string) => s.trim().toLowerCase().replace(/-/g, ' ').replace(/\s+/g, ' ')
                          const normalizedUser = normalize(userSubAnswer)
                          const normalizedCorrect = typeof correctAnswer === 'string' ? normalize(correctAnswer) : ''

                          // Check exact match OR contains-based match (for cases like "non-profit organization" matching "non-profit")
                          const exactMatch = normalizedUser === normalizedCorrect
                          const containsMatch = normalizedCorrect && (
                            normalizedUser.includes(normalizedCorrect) ||
                            normalizedCorrect.includes(normalizedUser)
                          ) && normalizedUser.length >= normalizedCorrect.length * 0.5

                          const isCorrect = correctAnswer && typeof correctAnswer === 'string' && (exactMatch || containsMatch)
                          const score = isCorrect ? subQuestionMarks : 0
                          const feedback = isCorrect
                            ? (language === 'english' ? "Correct! Well done." : "सही! राम्रो भयो।")
                            : (language === 'english' ? `Incorrect. The correct answer is ${correctAnswer}.` : `गलत। सही उत्तर ${correctAnswer} हो।`)

                          console.log(`✅ Auto-graded MCQ result: ${isCorrect ? 'CORRECT' : 'INCORRECT'} - "${userSubAnswer}" vs "${correctAnswer}"${containsMatch && !exactMatch ? ' (contains match)' : ''}`)

                          gradingPromises.push(Promise.resolve({
                            id: `${(question as any).id}_${sectionId}_${subQ.idEnglish || subQ.id}`,
                            score: score,
                            feedback: feedback,
                            question: subQ.questionEnglish,
                            studentAnswer: userSubAnswer,
                            group: "English",
                            questionId: (question as any).id,
                            sectionId: sectionId,
                            subQuestionId: subQ.idEnglish || subQ.id,
                          }))
                        } else if (section.type === 'short_answer' || section.type === 'fill_in_the_blanks') {
                          // Get the correct answer for pre-check
                          const correctAnswer = subQ.correctAnswerEnglish || subQ.correctAnswer || subQ.correctAnswerNepali || ''

                          // PRE-CHECK: If student answer contains the expected answer, auto-grade as correct
                          // Normalize: lowercase, remove hyphens, collapse spaces
                          const normalize = (s: string) => s.trim().toLowerCase().replace(/-/g, ' ').replace(/\s+/g, ' ')
                          const normalizedUser = normalize(userSubAnswer)
                          const normalizedCorrect = typeof correctAnswer === 'string' ? normalize(correctAnswer) : ''

                          const containsAnswer = normalizedCorrect && (
                            normalizedUser.includes(normalizedCorrect) ||
                            normalizedCorrect.includes(normalizedUser)
                          )

                          if (containsAnswer && normalizedUser.length >= normalizedCorrect.length * 0.5) {
                            // Auto-grade as correct
                            console.log(`🎯 Auto-grading: "${userSubAnswer}" contains "${correctAnswer}" → CORRECT`)
                            gradingPromises.push(Promise.resolve({
                              id: `${question.id}_${sectionId}_${subQ.idEnglish || subQ.id}`,
                              score: subQuestionMarks,
                              feedback: language === 'english' ? "Correct! Well done." : "सही! राम्रो भयो।",
                              question: subQ.questionEnglish,
                              studentAnswer: userSubAnswer,
                              group: "English",
                              questionId: question.id,
                              sectionId: sectionId,
                              subQuestionId: subQ.idEnglish || subQ.id,
                            }))
                          } else {
                            // Fall back to AI grading
                            console.log(`🤖 AI-grading ${section.type} question: ${subQ.questionEnglish}`)

                            let aiContext = correctAnswer
                            const passageContent = (question as any).passageEnglish || (question as any).passage || (question as any).passageNepali
                            if (passageContent && typeof aiContext === 'string' && !aiContext.includes(passageContent)) {
                              aiContext = aiContext ? `${aiContext}\n\nReference passage:\n${passageContent}` : `Reference passage:\n${passageContent}`
                            }

                            gradingPromises.push(
                              fetch("/api/grade", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  question: subQ.questionEnglish || subQ.question || subQ.questionNepali,
                                  answer: userSubAnswer,
                                  marks: subQuestionMarks,
                                  sampleAnswer: aiContext,
                                }),
                              })
                                .then(async (res) => {
                                  const result = await res.json()
                                  if (!res.ok) {
                                    throw new Error(result.error || `HTTP ${res.status}`)
                                  }
                                  return result
                                })
                                .then((result) => ({
                                  id: `${question.id}_${sectionId}_${subQ.idEnglish || subQ.id}`,
                                  score: result.score || 0,
                                  feedback: result.feedback || (language === 'english' ? "No feedback available" : "प्रतिक्रिया उपलब्ध छैन"),
                                  question: subQ.questionEnglish,
                                  studentAnswer: userSubAnswer,
                                  group: "English",
                                  questionId: question.id,
                                  sectionId: sectionId,
                                  subQuestionId: subQ.idEnglish || subQ.id,
                                }))
                                .catch((error) => ({
                                  id: `${question.id}_${sectionId}_${subQ.idEnglish || subQ.id}`,
                                  score: 0,
                                  feedback: getGradingErrorMessage(),
                                  question: subQ.questionEnglish,
                                  studentAnswer: userSubAnswer,
                                  group: "English",
                                  questionId: question.id,
                                  sectionId: sectionId,
                                  subQuestionId: subQ.idEnglish || subQ.id,
                                }))
                            )
                          }
                        }
                      }
                    }
                  })
                }
              })
            } else if (question.subQuestions) {
              // Handle questions with direct sub-questions (like grammar questions)
              question.subQuestions.forEach((subQ: any) => {
                // Use same ID pattern as renderer: idEnglish || id
                const subQId = subQ.idEnglish || subQ.id
                const userSubAnswer = userAnswer[subQId]
                if (userSubAnswer && typeof userSubAnswer === 'string' && userSubAnswer.trim().length > 0) {
                  // Calculate marks for sub-question (use bilingual fallback)
                  const questionMarks = question.marksEnglish || question.marks || 0
                  const subQuestionMarks = subQ.marksEnglish || subQ.marks || (questionMarks ? Math.round((questionMarks / question.subQuestions.length) * 10) / 10 : 1)

                  if (subQ.type === 'reproduce') {
                    // Grade grammar/reproduce questions with AI
                    // Build context with correct answer and grammar explanation
                    const correctAnswer = subQ.correctAnswerEnglish || subQ.correctAnswer || subQ.correctAnswerNepali || ''
                    const explanation = subQ.explanationEnglish || subQ.explanation || subQ.explanationNepali || ''
                    const aiContext = explanation ? `${correctAnswer}\n\nGrammar rule: ${explanation}` : correctAnswer

                    gradingPromises.push(
                      fetch("/api/grade", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          question: subQ.questionEnglish || subQ.question || subQ.questionNepali,
                          answer: userSubAnswer,
                          marks: subQuestionMarks,
                          sampleAnswer: aiContext,
                        }),
                      })
                        .then(async (res) => {
                          const result = await res.json()
                          if (!res.ok) {
                            throw new Error(result.error || `HTTP ${res.status}`)
                          }
                          return result
                        })
                        .then((result) => ({
                          id: `${question.id}_${subQ.idEnglish || subQ.id}`,
                          score: result.score || 0,
                          feedback: result.feedback || (language === 'english' ? "No feedback available" : "प्रतिक्रिया उपलब्ध छैन"),
                          question: subQ.questionEnglish,
                          studentAnswer: userSubAnswer,
                          group: "English",
                          questionId: question.id,
                          subQuestionId: subQ.idEnglish || subQ.id,
                        }))
                        .catch((error) => ({
                          id: `${question.id}_${subQ.idEnglish || subQ.id}`,
                          score: 0,
                          feedback: getGradingErrorMessage(),
                          question: subQ.questionEnglish,
                          studentAnswer: userSubAnswer,
                          group: "English",
                          questionId: question.id,
                          subQuestionId: subQ.idEnglish || subQ.id,
                        }))
                    )
                  }
                }
              })
            } else if ((question as any).type === 'free_writing') {
              // Handle free writing questions
              // free_writing answers are stored as { content: "..." } 
              const userWritingAnswer = typeof userAnswer === 'object' && userAnswer?.content
                ? userAnswer.content
                : (typeof userAnswer === 'string' ? userAnswer : null)

              if (userWritingAnswer && typeof userWritingAnswer === 'string' && userWritingAnswer.trim().length > 0) {
                gradingPromises.push(
                  fetch("/api/grade", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      question: (question as any).titleEnglish || (question as any).title || (question as any).titleNepali,
                      answer: userWritingAnswer,
                      marks: (question as any).marksEnglish || (question as any).marks,
                      sampleAnswer: (question as any).sampleAnswerEnglish?.content || (question as any).sampleAnswer?.content || (question as any).sampleAnswerNepali?.content,
                    }),
                  })
                    .then(async (res) => {
                      const result = await res.json()
                      if (!res.ok) {
                        throw new Error(result.error || `HTTP ${res.status}`)
                      }
                      return result
                    })
                    .then((result) => ({
                      id: (question as any).id,
                      score: result.score || 0,
                      feedback: result.feedback || (language === 'english' ? "No feedback available" : "प्रतिक्रिया उपलब्ध छैन"),
                      question: (question as any).titleEnglish || (question as any).title,
                      studentAnswer: userWritingAnswer,
                      group: "English",
                      questionId: (question as any).id,
                    }))
                    .catch((error) => ({
                      id: (question as any).id,
                      score: 0,
                      feedback: getGradingErrorMessage(),
                      question: (question as any).titleEnglish || (question as any).title,
                      studentAnswer: userWritingAnswer,
                      group: "English",
                      questionId: (question as any).id,
                    }))
                )
              }
            } else if ((question as any).type === 'cloze_test') {
              // Handle cloze test questions
              if (userAnswer && typeof userAnswer === 'object') {
                const gaps = (question as any).gaps || []
                Object.entries(userAnswer).forEach(([gapId, gapAnswer]) => {
                  if (gapAnswer && typeof gapAnswer === 'string' && gapAnswer.trim().length > 0) {
                    // Use same ID pattern as renderer: idEnglish || id
                    const gap = gaps.find((g: any) => (g.idEnglish || g.id) === gapId)
                    if (gap) {
                      const gapMarks = (question as any).marks && gaps.length ? Math.round(((question as any).marks / gaps.length) * 10) / 10 : 1
                      const trimmedAnswer = gapAnswer.trim()
                      // Use bilingual fallback for correct answer
                      const correctAnswer = (gap.correctAnswerEnglish || gap.correctAnswer)?.trim() || ""

                      // First try exact matching (case-insensitive)
                      const isExactMatch = trimmedAnswer.toLowerCase() === correctAnswer.toLowerCase()

                      // Also check for British/American English variants (e.g., "gotten" vs "got")
                      let isVariantMatch = false
                      if (!isExactMatch && correctAnswer) {
                        // Check if answer is a variant (British vs American English)
                        const normalizedCorrect = correctAnswer.toLowerCase()
                        const normalizedAnswer = trimmedAnswer.toLowerCase()

                        // Check common British/American variants
                        // Handle "gotten" <-> "got" variants (e.g., "would not have gotten" vs "would not have got")
                        if (normalizedCorrect.includes("gotten") && !normalizedAnswer.includes("gotten")) {
                          // Try replacing "gotten" with "got" in correct answer
                          const correctWithGot = normalizedCorrect.replace(/\bgotten\b/g, "got")
                          if (correctWithGot === normalizedAnswer) {
                            isVariantMatch = true
                          }
                        } else if (normalizedAnswer.includes("gotten") && !normalizedCorrect.includes("gotten")) {
                          // Try replacing "gotten" with "got" in student answer
                          const answerWithGot = normalizedAnswer.replace(/\bgotten\b/g, "got")
                          if (answerWithGot === normalizedCorrect) {
                            isVariantMatch = true
                          }
                        }
                      }

                      if (isExactMatch || isVariantMatch) {
                        // Auto-grade exact matches
                        const score = gapMarks
                        const feedback = isVariantMatch
                          ? (language === 'english' ? "Correct! (British/American English variant accepted)" : "सही! (ब्रिटिश/अमेरिकी अंग्रेजी भिन्नता स्वीकृत)")
                          : (language === 'english' ? "Correct! Well done." : "सही! राम्रो भयो।")

                        console.log(`🎯 Auto-grading cloze test gap ${gapId}: ${isVariantMatch ? 'VARIANT' : 'EXACT'} match`)

                        gradingPromises.push(Promise.resolve({
                          id: `${(question as any).id}_${gapId}`,
                          score: score,
                          feedback: feedback,
                          question: `Fill in the blank (${gapId})`,
                          studentAnswer: gapAnswer,
                          group: "English",
                          questionId: (question as any).id,
                          gapId: gapId,
                        }))
                      } else {
                        // Use AI grading for non-exact matches (handles paraphrasing, etc.)
                        gradingPromises.push(
                          fetch("/api/grade", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              question: `Fill in the blank (${gapId}): ${(question as any).passageEnglish || (question as any).passage || (question as any).passageNepali}`,
                              answer: gapAnswer,
                              marks: gapMarks,
                              sampleAnswer: gap.correctAnswerEnglish || gap.correctAnswer || gap.correctAnswerNepali,
                            }),
                          })
                            .then(async (res) => {
                              const result = await res.json()
                              if (!res.ok) {
                                throw new Error(result.error || `HTTP ${res.status}`)
                              }
                              return result
                            })
                            .then((result) => ({
                              id: `${(question as any).id}_${gapId}`,
                              score: result.score || 0,
                              feedback: result.feedback || (language === 'english' ? "No feedback available" : "प्रतिक्रिया उपलब्ध छैन"),
                              question: `Fill in the blank (${gapId})`,
                              studentAnswer: gapAnswer,
                              group: "English",
                              questionId: (question as any).id,
                              gapId: gapId,
                            }))
                            .catch((error) => ({
                              id: `${(question as any).id}_${gapId}`,
                              score: 0,
                              feedback: getGradingErrorMessage(),
                              question: `Fill in the blank (${gapId})`,
                              studentAnswer: gapAnswer,
                              group: "English",
                              questionId: (question as any).id,
                              gapId: gapId,
                            }))
                        )
                      }
                    }
                  }
                })
              }
            }
          })
        }

        // Wait for all AI grading to complete
        if (gradingPromises.length > 0) {
          const gradingResults = await Promise.all(gradingPromises)

          // Store English grading results in same format as Science tests
          results.feedbackA = gradingResults
          results.englishFeedback = gradingResults
          results.scoreA = gradingResults.reduce((sum: number, result: any) => sum + result.score, 0)
        } else {
          // No answers provided or no AI grading was attempted - set default values
          results.feedbackA = []
          results.englishFeedback = []
          results.scoreA = 0
        }

        // Save attempt to history (same format as Science tests)
        const totalScore = results.scoreA
        const maxScore = questions.englishQuestions.reduce((acc: number, q: any) => acc + q.marks, 0)
        const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
        const grade = percentage >= 90 ? "A+" : percentage >= 80 ? "A" : percentage >= 70 ? "B+" : percentage >= 60 ? "B" : percentage >= 50 ? "C+" : percentage >= 40 ? "C" : percentage >= 32 ? "D" : "E"

        try {
          saveAttemptHistory(studentId, testId, {
            scoreA: results.scoreA,
            scoreB: 0,
            scoreC: 0,
            scoreD: 0,
            totalScore,
            maxScore,
            percentage,
            grade,
            timeTakenSeconds: elapsedSeconds,
          })
        } catch (error) {
          console.error("Error saving attempt history:", error)
        }

        // Show results on new page
        onShowResults(results)
        return
      }

      // Check if this is a Social Studies test
      const isSocialStudiesTest = questions.socialStudiesGroups && questions.socialStudiesGroups.length > 0

      if (isSocialStudiesTest) {
        // Social Studies test grading
        console.log("🏛️ Starting Social Studies test grading...")

        const gradingPromises: Promise<any>[] = []
        const socialStudiesFeedback: any[] = []


        // Grade each group's questions
        questions.socialStudiesGroups.forEach((group: any, groupIndex: number) => {
          console.log(`📋 Processing Group ${groupIndex}: ${group.groupName || 'Unknown'}, ${group.questions?.length || 0} questions`)
          group.questions?.forEach((question: any, qIdx: number) => {
            const userAnswer = answers.socialStudies?.[question.id] || ""
            console.log(`  📝 Q${qIdx + 1} (ID: ${question.id}, Type: ${question.type}): Answer length = ${typeof userAnswer === 'string' ? userAnswer.length : 0}, Has answer = ${typeof userAnswer === 'string' ? userAnswer.trim().length > 0 : !!userAnswer}`)

            // Calculate marks early so we can use it in all cases
            const questionMarks = question.marksEnglish || question.marks || (question.marksNepali ? parseInt(question.marksNepali, 10) : 0) || 4

            if (userAnswer && (typeof userAnswer === 'string' ? userAnswer.trim().length > 0 : true)) {
              // Build comprehensive context with answer and explanation
              const answerText = question.answerNepali || question.answerEnglish || ''
              const explanation = question.explanationNepali || question.explanationEnglish || ''
              const aiContext = explanation ? `${answerText}\n\nContext/Citation: ${explanation}` : answerText

              // questionMarks is calculated earlier
              gradingPromises.push(
                fetch("/api/grade", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    question: question.questionNepali || question.questionEnglish,
                    answer: userAnswer,
                    marks: questionMarks,
                    sampleAnswer: aiContext,
                  }),
                })
                  .then(async (res) => {
                    const result = await res.json()
                    if (!res.ok) {
                      throw new Error(result.error || `HTTP ${res.status}`)
                    }
                    return result
                  })
                  .then((result) => ({
                    id: question.id,
                    score: result.score || 0,
                    feedback: result.feedback || (language === 'english' ? "No feedback available" : "प्रतिक्रिया उपलब्ध छैन"),
                    question: question.questionNepali || question.questionEnglish,
                    questionEnglish: question.questionEnglish || question.questionNepali,
                    questionNepali: question.questionNepali || question.questionEnglish,
                    studentAnswer: userAnswer,
                    group: groupIndex,
                    marks: questionMarks,
                  }))
                  .catch((error) => ({
                    id: question.id,
                    score: 0,
                    feedback: getGradingErrorMessage(),
                    question: question.questionNepali || question.questionEnglish,
                    questionEnglish: question.questionEnglish || question.questionNepali,
                    questionNepali: question.questionNepali || question.questionEnglish,
                    studentAnswer: userAnswer,
                    group: groupIndex,
                    marks: questionMarks,
                  }))
              )
            } else {
              socialStudiesFeedback.push({
                id: question.id,
                score: 0,
                feedback: "",
                question: question.questionNepali || question.questionEnglish,
                questionEnglish: question.questionEnglish || question.questionNepali,
                questionNepali: question.questionNepali || question.questionEnglish,
                studentAnswer: "",
                group: groupIndex,
                marks: questionMarks,
              })
            }
          })
        })

        // Wait for AI grading
        if (gradingPromises.length > 0) {
          console.log(`⏳ Waiting for ${gradingPromises.length} Social Studies AI grading requests...`)
          const gradingResults = await Promise.all(gradingPromises)
          socialStudiesFeedback.push(...gradingResults)
        }

        // Sort feedback by question ID to maintain order
        socialStudiesFeedback.sort((a, b) => a.id.localeCompare(b.id))

        // Calculate scores
        const totalScore = socialStudiesFeedback.reduce((sum: number, f: any) => sum + f.score, 0)
        const maxScore = questions.socialStudiesGroups.reduce((sum: number, group: any) => {
          return sum + (group.questions?.reduce((qSum: number, q: any) => qSum + q.marks, 0) || 0)
        }, 0)
        const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
        const grade = percentage >= 90 ? "A+" : percentage >= 80 ? "A" : percentage >= 70 ? "B+" : percentage >= 60 ? "B" : percentage >= 50 ? "C+" : percentage >= 40 ? "C" : percentage >= 32 ? "D" : "E"

        // Create results object for social studies
        results.socialStudiesFeedback = socialStudiesFeedback
        results.scoreA = totalScore // Use scoreA for total to work with results-card

        // Save attempt history
        try {
          saveAttemptHistory(studentId, testId, {
            scoreA: totalScore,
            scoreB: 0,
            scoreC: 0,
            scoreD: 0,
            totalScore,
            maxScore,
            percentage,
            grade,
            timeTakenSeconds: elapsedSeconds,
          })
        } catch (error) {
          console.error("Error saving attempt history:", error)
        }

        console.log("✅ Social Studies grading completed!")
        onShowResults(results)
        return
      }

      // Nepali test grading
      if (isNepaliTest && questions.nepaliQuestions) {
        console.log("🇳🇵 Grading Nepali test...")
        console.log(`📊 Total Nepali questions: ${questions.nepaliQuestions.length}`)
        const nepaliFeedback: any[] = []
        const gradingPromises: Promise<any>[] = []

        questions.nepaliQuestions.forEach((question: any, qIndex: number) => {
          const questionKey = `q${question.questionNumberEnglish || question.questionNumber || qIndex + 1}`
          const userAnswer = answers.nepali?.[questionKey]
          const questionTitleNepali = question.questionNepali || question.title || question.questionEnglish || `प्रश्न ${qIndex + 1}`
          const questionTitleEnglish = question.questionEnglish || question.title || question.questionNepali || `Question ${qIndex + 1}`
          const questionTitle = questionTitleNepali // Default for backward compat

          console.log(`📝 Q${qIndex + 1} [${questionKey}] Type: ${question.type}`)
          console.log(`   Answer exists: ${!!userAnswer}, Answer type: ${typeof userAnswer}`)
          if (typeof userAnswer === 'object' && userAnswer) {
            console.log(`   Answer keys: [${Object.keys(userAnswer).join(', ')}]`)
            if (userAnswer.selectedOption) console.log(`   Selected option: ${userAnswer.selectedOption}`)
            if (userAnswer.selectedTopic) console.log(`   Selected topic: ${userAnswer.selectedTopic}`)
            if (userAnswer.response) console.log(`   Response length: ${userAnswer.response?.length || 0}`)
          }

          switch (question.type) {
            case "matching": {
              // Auto-grade matching questions
              // UI stores answers as: { "i": "c", "ii": "a", ... } using itemA.id as keys
              let score = 0
              const columns = question.columns?.A || question.columns?.a || []
              const maxScore = question.marksEnglish || question.marks || columns.length || 5
              const pointsPerMatch = columns.length > 0 ? maxScore / columns.length : maxScore

              if (userAnswer && typeof userAnswer === 'object' && columns.length > 0) {
                // Get correct answers - prioritize English since student answers use English IDs (i, ii, etc.)
                const correctAnswers = question.correctAnswerEnglish || question.correctAnswer || question.correctAnswerNepali || []

                columns.forEach((item: any) => {
                  // Use same ID pattern as renderer: idEnglish || idNepali || id
                  const itemId = item.idEnglish || item.idNepali || item.id
                  const userChoice = userAnswer[itemId]
                  // Check if correct answer is in correctAnswer array
                  const correctPair = Array.isArray(correctAnswers)
                    ? correctAnswers.find((ca: any) => ca.A === itemId || ca.A === item.id)
                    : null
                  const expectedAnswer = correctPair?.B || item.correctAnswer || item.correctAnswerNepali || item.correctAnswerEnglish

                  if (userChoice && expectedAnswer && userChoice === expectedAnswer) {
                    score += pointsPerMatch
                  }
                })
              }

              // Count how many are correct (for display purposes)
              const totalItems = columns.length
              const correctCount = Math.round(score / pointsPerMatch)

              nepaliFeedback.push({
                id: questionKey,
                type: question.type,
                score: Math.round(score * 10) / 10,
                maxScore: maxScore,
                feedback: correctCount >= totalItems
                  ? (language === 'english' ? `Perfect! All ${totalItems} matches are correct.` : `उत्कृष्ट! सबै ${totalItems} मिलान सही छन्।`)
                  : correctCount > 0
                    ? (language === 'english' ? `Partially correct. ${correctCount} out of ${totalItems} matches are correct.` : `आंशिक रूपमा सही। ${totalItems} मध्ये ${correctCount} मिलान सही छन्।`)
                    : (language === 'english' ? `Incorrect. None of the matches are correct.` : `गलत। कुनै पनि मिलान सही छैन।`),
                question: questionTitle,
                questionEnglish: questionTitleEnglish,
                questionNepali: questionTitleNepali,
                studentAnswer: userAnswer,
              })
              break
            }

            case "fill_in_the_blanks":
            case "fill_in_the_blanks_choices": {
              // Auto-grade fill in the blanks - UI stores as { "subId": "answer", ... }
              let score = 0
              const subQuestions = question.subQuestions || []
              const maxScore = question.marksEnglish || question.marks || subQuestions.length || 5
              const pointsPerBlank = subQuestions.length > 0 ? maxScore / subQuestions.length : maxScore

              if (userAnswer && typeof userAnswer === 'object' && subQuestions.length > 0) {
                subQuestions.forEach((sub: any) => {
                  // Use same ID pattern as renderer: idEnglish || idNepali || id
                  const subId = sub.idEnglish || sub.idNepali || sub.id
                  const userVal = userAnswer[subId]
                  const correctAnswer = sub.correctAnswerEnglish || sub.correctAnswer || sub.correctAnswerNepali
                  if (userVal && correctAnswer && typeof userVal === 'string' && typeof correctAnswer === 'string') {
                    if (userVal.toLowerCase().trim() === correctAnswer.toLowerCase().trim()) {
                      score += pointsPerBlank
                    }
                  }
                })
              }

              nepaliFeedback.push({
                id: questionKey,
                type: question.type,
                score: Math.round(score * 10) / 10,
                maxScore: maxScore,
                feedback: score >= maxScore
                  ? (language === 'english' ? "All correct!" : "सबै सही!")
                  : score > 0
                    ? (language === 'english' ? `${Math.round(score)}/${maxScore} correct` : `${Math.round(score)}/${maxScore} सही`)
                    : (language === 'english' ? "None correct" : "केही सही छैन"),
                question: questionTitle,
                questionEnglish: questionTitleEnglish,
                questionNepali: questionTitleNepali,
                studentAnswer: userAnswer,
              })
              break
            }

            case "grammar_choice":
            case "spelling_correction":
            case "parts_of_speech": {
              // These are mostly free-response, but if they have subQuestions with correctAnswer, we can auto-grade
              const subQuestions = question.subQuestions || []
              const correctAnswerData = question.correctAnswerEnglish || question.correctAnswer || question.correctAnswerNepali
              const correctWords = Array.isArray(correctAnswerData) ? correctAnswerData : []

              // For parts_of_speech with correctAnswer array like [{word: "जो", pos: "सर्वनाम"}, ...]
              if (question.type === "parts_of_speech" && correctWords.length > 0 && userAnswer && typeof userAnswer === 'object') {
                let score = 0
                const maxScore = question.marksEnglish || question.marks || correctWords.length || 5
                const pointsPerWord = correctWords.length > 0 ? maxScore / correctWords.length : maxScore

                correctWords.forEach((pair: any) => {
                  const userVal = userAnswer[pair.word]
                  if (userVal && pair.pos && typeof userVal === 'string' && typeof pair.pos === 'string') {
                    if (userVal.toLowerCase().trim() === pair.pos.toLowerCase().trim()) {
                      score += pointsPerWord
                    }
                  }
                })

                nepaliFeedback.push({
                  id: questionKey,
                  type: question.type,
                  score: Math.round(score * 10) / 10,
                  maxScore: maxScore,
                  feedback: score >= maxScore
                    ? (language === 'english' ? "All correct!" : "सबै सही!")
                    : score > 0
                      ? (language === 'english' ? `${Math.round(score)}/${maxScore} correct` : `${Math.round(score)}/${maxScore} सही`)
                      : (language === 'english' ? "None correct" : "केही सही छैन"),
                  question: questionTitle,
                  questionEnglish: questionTitleEnglish,
                  questionNepali: questionTitleNepali,
                  studentAnswer: userAnswer,
                })
              } else if (question.type === "spelling_correction" && subQuestions.length > 0 && userAnswer && typeof userAnswer === 'object') {
                // Handle spelling_correction with nested multiple_choice subQuestions
                let totalScore = 0
                const maxScore = question.marksEnglish || question.marks || 3
                let totalItems = 0

                subQuestions.forEach((subQ: any) => {
                  const subQId = subQ.idNepali || subQ.idEnglish || subQ.id
                  const subQType = subQ.type

                  if (subQType === "multiple_choice" && subQ.choices && Array.isArray(subQ.choices)) {
                    // Multiple choice with choices array - each choice has its own correctAnswer
                    subQ.choices.forEach((choice: any) => {
                      const choiceId = choice.idNepali || choice.idEnglish || choice.id
                      const userVal = userAnswer[`${subQId}_${choiceId}`] || userAnswer[choiceId]
                      const correctAnswer = language === 'nepali'
                        ? (choice.correctAnswerNepali || choice.correctAnswer || choice.correctAnswerEnglish)
                        : (choice.correctAnswerEnglish || choice.correctAnswer || choice.correctAnswerNepali)

                      if (correctAnswer && userVal && typeof userVal === 'string' && typeof correctAnswer === 'string') {
                        totalItems++
                        if (userVal.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
                          totalScore++
                        }
                      }
                    })
                  } else if (subQType === "sentence_correction") {
                    // Sentence correction - compare with correctAnswer (AI grading would be better, but for now simple comparison)
                    const correctAnswer = language === 'nepali'
                      ? (subQ.correctAnswerNepali || subQ.correctAnswer || subQ.correctAnswerEnglish)
                      : (subQ.correctAnswerEnglish || subQ.correctAnswer || subQ.correctAnswerNepali)
                    const userVal = userAnswer[subQId]

                    if (correctAnswer && userVal && typeof userVal === 'string' && typeof correctAnswer === 'string') {
                      totalItems++
                      // For sentence correction, be more lenient - check if key words match
                      const normalizedUser = userVal.trim().toLowerCase().replace(/\s+/g, ' ')
                      const normalizedCorrect = correctAnswer.trim().toLowerCase().replace(/\s+/g, ' ')
                      if (normalizedUser === normalizedCorrect) {
                        totalScore++
                      }
                    }
                  }
                })

                const calculatedScore = totalItems > 0 ? Math.round((totalScore / totalItems) * maxScore * 10) / 10 : 0

                nepaliFeedback.push({
                  id: questionKey,
                  type: question.type,
                  score: calculatedScore,
                  maxScore: maxScore,
                  feedback: totalItems === 0
                    ? (language === 'english' ? "None correct" : "केही सही छैन")
                    : totalScore >= totalItems
                      ? (language === 'english' ? "All correct!" : "सबै सही!")
                      : totalScore > 0
                        ? (language === 'english' ? `${totalScore}/${totalItems} correct` : `${totalScore}/${totalItems} सही`)
                        : (language === 'english' ? "None correct" : "केही सही छैन"),
                  question: questionTitle,
                  questionEnglish: questionTitleEnglish,
                  questionNepali: questionTitleNepali,
                  studentAnswer: userAnswer,
                })
              } else {
                // Fall back to AI grading for complex grammar questions
                const marks = question.marksEnglish || question.marks || 5
                const sampleAnswer = question.sampleAnswer || question.sampleAnswerNepali || question.sampleAnswerEnglish || ""

                let combinedAnswer = ""
                if (typeof userAnswer === "string") {
                  combinedAnswer = userAnswer
                } else if (typeof userAnswer === "object" && userAnswer) {
                  combinedAnswer = Object.entries(userAnswer)
                    .filter(([key]) => !key.includes("selected"))
                    .map(([key, val]) => typeof val === "string" ? `${key}: ${val}` : "")
                    .filter(val => typeof val === 'string' && val.trim())
                    .join("\n")
                }

                if (combinedAnswer.trim()) {
                  gradingPromises.push(
                    fetch("/api/grade", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        question: questionTitle,
                        questionEnglish: questionTitleEnglish,
                        questionNepali: questionTitleNepali,
                        answer: combinedAnswer,
                        marks: marks,
                        sampleAnswer: sampleAnswer,
                      }),
                    })
                      .then((res) => res.json())
                      .then((result) => ({
                        id: questionKey,
                        type: question.type,
                        score: result.score || 0,
                        maxScore: marks,
                        feedback: result.feedback || (language === 'english' ? "No feedback available" : "प्रतिक्रिया उपलब्ध छैन"),
                        question: questionTitle,
                        questionEnglish: questionTitleEnglish,
                        questionNepali: questionTitleNepali,
                        studentAnswer: combinedAnswer,
                      }))
                      .catch(() => ({
                        id: questionKey,
                        type: question.type,
                        score: 0,
                        maxScore: marks,
                        feedback: getGradingErrorMessage(),
                        question: questionTitle,
                        questionEnglish: questionTitleEnglish,
                        questionNepali: questionTitleNepali,
                        studentAnswer: combinedAnswer,
                      }))
                  )
                } else {
                  nepaliFeedback.push({
                    id: questionKey,
                    type: question.type,
                    score: 0,
                    maxScore: marks,
                    feedback: language === 'english' ? "No answer provided" : "कुनै उत्तर प्रदान गरिएको छैन",
                    question: questionTitle,
                    questionEnglish: questionTitleEnglish,
                    questionNepali: questionTitleNepali,
                    studentAnswer: "",
                  })
                }
              }
              break
            }

            case "free_writing_choice":
            case "functional_writing_choice":
            case "literature_critical_analysis_choice": {
              // Choice-based questions - need to find the selected option to get proper context
              const marks = question.marksEnglish || question.marks || 4
              let selectedOptionTitle = questionTitle
              let sampleAnswer = ""

              if (typeof userAnswer === "object" && userAnswer?.selectedOption) {
                // Find the selected option in options or subQuestions
                const options = question.options || question.subQuestions || []
                const selectedOption = options.find((opt: any) =>
                  (opt.idEnglish || opt.idNepali || opt.id) === userAnswer.selectedOption
                )
                if (selectedOption) {
                  selectedOptionTitle = selectedOption.titleNepali || selectedOption.titleEnglish ||
                    selectedOption.questionNepali || selectedOption.questionEnglish || questionTitle

                  // Build context from clues (for biography/dialogue questions)
                  const clues = selectedOption.cluesNepali || selectedOption.cluesEnglish || []
                  if (Array.isArray(clues) && clues.length > 0) {
                    sampleAnswer = `Context/Clues to include:\n${clues.join('\n')}`
                  }

                  // Build context from passage (for literature analysis questions)
                  const passage = selectedOption.passageNepali || selectedOption.passageEnglish
                  if (passage) {
                    const passageContext = `Reference passage:\n${passage}`
                    sampleAnswer = sampleAnswer ? `${sampleAnswer}\n\n${passageContext}` : passageContext
                  }

                  // Fallback to explicit sampleAnswer/correctAnswer if no clues or passage
                  if (!sampleAnswer) {
                    sampleAnswer = selectedOption.sampleAnswerNepali || selectedOption.sampleAnswerEnglish ||
                      selectedOption.sampleAnswer || selectedOption.correctAnswerNepali ||
                      selectedOption.correctAnswerEnglish || selectedOption.correctAnswer || ""
                  }
                }
              }

              const response = typeof userAnswer === "object" ? userAnswer.response : userAnswer

              if (response && typeof response === 'string' && response.trim()) {
                gradingPromises.push(
                  fetch("/api/grade", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      question: selectedOptionTitle,
                      answer: response,
                      marks: marks,
                      sampleAnswer: sampleAnswer,
                    }),
                  })
                    .then((res) => res.json())
                    .then((result) => ({
                      id: questionKey,
                      type: question.type,
                      score: result.score || 0,
                      maxScore: marks,
                      feedback: result.feedback || (language === 'english' ? "No feedback available" : "प्रतिक्रिया उपलब्ध छैन"),
                      question: selectedOptionTitle,
                      studentAnswer: response,
                    }))
                    .catch(() => ({
                      id: questionKey,
                      type: question.type,
                      score: 0,
                      maxScore: marks,
                      feedback: getGradingErrorMessage(),
                      question: selectedOptionTitle,
                      studentAnswer: response,
                    }))
                )
              } else {
                nepaliFeedback.push({
                  id: questionKey,
                  type: question.type,
                  score: 0,
                  maxScore: marks,
                  feedback: "",
                  question: questionTitle,
                  questionEnglish: questionTitleEnglish,
                  questionNepali: questionTitleNepali,
                  studentAnswer: "",
                })
              }
              break
            }

            case "essay": {
              // Essay with topic selection
              const marks = question.marksEnglish || question.marks || 8
              let selectedTopic = questionTitle

              if (typeof userAnswer === "object" && userAnswer?.selectedTopic) {
                selectedTopic = userAnswer.selectedTopic
              }

              const response = typeof userAnswer === "object" ? userAnswer.response : userAnswer

              if (response && typeof response === 'string' && response.trim()) {
                gradingPromises.push(
                  fetch("/api/grade", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      question: `${language === 'nepali' ? 'निबन्ध विषय:' : 'Essay topic:'} ${selectedTopic}`,
                      answer: response,
                      marks: marks,
                      sampleAnswer: "",  // Essays don't have sample answers
                    }),
                  })
                    .then((res) => res.json())
                    .then((result) => ({
                      id: questionKey,
                      type: question.type,
                      score: result.score || 0,
                      maxScore: marks,
                      feedback: result.feedback || (language === 'english' ? "No feedback available" : "प्रतिक्रिया उपलब्ध छैन"),
                      question: `${selectedTopic} (${language === 'nepali' ? 'निबन्ध' : 'Essay'})`,
                      studentAnswer: response,
                    }))
                    .catch(() => ({
                      id: questionKey,
                      type: question.type,
                      score: 0,
                      maxScore: marks,
                      feedback: getGradingErrorMessage(),
                      question: `${selectedTopic} (${language === 'nepali' ? 'निबन्ध' : 'Essay'})`,
                      studentAnswer: response,
                    }))
                )
              } else {
                nepaliFeedback.push({
                  id: questionKey,
                  type: question.type,
                  score: 0,
                  maxScore: marks,
                  feedback: "",
                  question: questionTitle,
                  questionEnglish: questionTitleEnglish,
                  questionNepali: questionTitleNepali,
                  studentAnswer: "",
                })
              }
              break
            }

            default: {
              // AI grade all other question types (free response, essay, etc.)
              const marks = question.marksEnglish || question.marks || 5

              // Build comprehensive context for AI grading
              let sampleAnswer = question.sampleAnswer || question.sampleAnswerNepali || question.sampleAnswerEnglish || question.modelAnswer || ""

              // Include passage context for reading comprehension, note taking, etc.
              const passage = question.passageNepali || question.passageEnglish
              if (passage && typeof sampleAnswer === 'string' && !sampleAnswer.includes(passage)) {
                const passageContext = `Reference passage:\n${passage}`
                sampleAnswer = sampleAnswer ? `${sampleAnswer}\n\n${passageContext}` : passageContext
              }

              // Include correctAnswer for subQuestions if available
              if (question.subQuestions && Array.isArray(question.subQuestions)) {
                const correctAnswers = question.subQuestions
                  .filter((sub: any) => sub.correctAnswerNepali || sub.correctAnswerEnglish || sub.correctAnswer)
                  .map((sub: any) => {
                    const subId = sub.idNepali || sub.idEnglish || sub.id || ''
                    const answer = sub.correctAnswerNepali || sub.correctAnswerEnglish || sub.correctAnswer
                    return `${subId}: ${answer}`
                  })
                  .join('\n')
                if (correctAnswers) {
                  sampleAnswer = sampleAnswer ? `${sampleAnswer}\n\nExpected answers:\n${correctAnswers}` : `Expected answers:\n${correctAnswers}`
                }
              }

              // Collect all sub-answers into a single response string for AI grading
              let combinedAnswer = ""
              if (typeof userAnswer === "string") {
                combinedAnswer = userAnswer
              } else if (typeof userAnswer === "object" && userAnswer) {
                // Filter out selection keys and format answer values
                combinedAnswer = Object.entries(userAnswer)
                  .filter(([key]) => !key.includes("selected"))
                  .map(([key, val]) => typeof val === "string" ? val : JSON.stringify(val))
                  .filter(val => typeof val === 'string' && val.trim())
                  .join("\n")
              }

              if (combinedAnswer.trim()) {
                gradingPromises.push(
                  fetch("/api/grade", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      question: questionTitle,
                      questionEnglish: questionTitleEnglish,
                      questionNepali: questionTitleNepali,
                      answer: combinedAnswer,
                      marks: marks,
                      sampleAnswer: sampleAnswer,
                    }),
                  })
                    .then((res) => res.json())
                    .then((result) => ({
                      id: questionKey,
                      type: question.type,
                      score: result.score || 0,
                      maxScore: marks,
                      feedback: result.feedback || (language === 'english' ? "No feedback available" : "प्रतिक्रिया उपलब्ध छैन"),
                      question: questionTitle,
                      questionEnglish: questionTitleEnglish,
                      questionNepali: questionTitleNepali,
                      studentAnswer: combinedAnswer,
                      sampleAnswer: sampleAnswer,
                    }))
                    .catch(() => ({
                      id: questionKey,
                      type: question.type,
                      score: 0,
                      maxScore: marks,
                      feedback: getGradingErrorMessage(),
                      question: questionTitle,
                      questionEnglish: questionTitleEnglish,
                      questionNepali: questionTitleNepali,
                      studentAnswer: combinedAnswer,
                      sampleAnswer: sampleAnswer,
                    }))
                )
              } else {
                nepaliFeedback.push({
                  id: questionKey,
                  type: question.type,
                  score: 0,
                  maxScore: marks,
                  feedback: "",
                  question: questionTitle,
                  questionEnglish: questionTitleEnglish,
                  questionNepali: questionTitleNepali,
                  studentAnswer: "",
                  sampleAnswer: sampleAnswer,
                })
              }
              break
            }
          }
        })

        // Wait for AI grading to complete
        if (gradingPromises.length > 0) {
          console.log(`⏳ Waiting for ${gradingPromises.length} Nepali AI grading requests...`)
          const gradingResults = await Promise.all(gradingPromises)
          nepaliFeedback.push(...gradingResults)
        }

        // Sort feedback by question ID
        nepaliFeedback.sort((a, b) => {
          const numA = parseInt(a.id.replace("q", ""), 10) || 0
          const numB = parseInt(b.id.replace("q", ""), 10) || 0
          return numA - numB
        })

        // Calculate scores
        const totalScore = nepaliFeedback.reduce((sum: number, f: any) => sum + (f.score || 0), 0)
        const maxScore = nepaliFeedback.reduce((sum: number, f: any) => sum + (f.maxScore || 0), 0)
        const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
        const grade = percentage >= 90 ? "A+" : percentage >= 80 ? "A" : percentage >= 70 ? "B+" : percentage >= 60 ? "B" : percentage >= 50 ? "C+" : percentage >= 40 ? "C" : percentage >= 32 ? "D" : "E"

        // Create results object for Nepali tests
        results.nepaliFeedback = nepaliFeedback
        results.scoreA = totalScore

        // Save attempt history
        try {
          saveAttemptHistory(studentId, testId, {
            scoreA: totalScore,
            scoreB: 0,
            scoreC: 0,
            scoreD: 0,
            totalScore,
            maxScore,
            percentage,
            grade,
            timeTakenSeconds: elapsedSeconds,
          })
        } catch (error) {
          console.error("Error saving attempt history:", error)
        }

        console.log("✅ Nepali grading completed!")
        onShowResults(results)
        return
      }

      // Check if this is a Math test
      const isMathTest = questions.mathQuestions && questions.mathQuestions.length > 0

      if (isMathTest) {
        console.log("📐 Math test detected - grading sub-questions...")
        const mathFeedback: any[] = []
        const gradingPromises: Promise<any>[] = []

        // Grade each sub-question in each Math question
        questions.mathQuestions.forEach((question: any) => {
          const qNum = question.question_numberEnglish
          const questionAnswers = answers.math?.[qNum] || {}
          const contextEnglish = question.context.English
          const contextNepali = question.context.Nepali

          question.sub_questions.forEach((subQ: any) => {
            const label = subQ.labelEnglish
            const subQEnglish = subQ.questionEnglish || 'Solve the above problem.'
            const subQNepali = subQ.questionNepali || 'माथिको समस्या समाधान गर्नुहोस्।'
            const answerEnglish = subQ.answerEnglish
            const answerNepali = subQ.answerNepali
            const explanationEnglish = subQ.explanationEnglish
            const explanationNepali = subQ.explanationNepali
            const marks = subQ.marksEnglish

            const userAnswer = questionAnswers[label] || ""
            const questionTextEnglish = `${contextEnglish}\n\nPart (${label}): ${subQEnglish}`
            const questionTextNepali = `${contextNepali}\n\nभाग (${label}): ${subQNepali}`

            if (typeof userAnswer === 'string' && userAnswer.trim()) {
              // Build comprehensive context with answer and explanation
              const sampleAnswerContext = explanationEnglish
                ? `${answerEnglish || answerNepali || ''}\n\nExplanation: ${explanationEnglish || explanationNepali || ''}`
                : (answerEnglish || answerNepali || '')

              gradingPromises.push(
                fetch("/api/grade", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    question: questionTextEnglish,
                    answer: userAnswer,
                    marks: marks,
                    sampleAnswer: sampleAnswerContext,
                  }),
                })
                  .then(async (res) => {
                    const result = await res.json()

                    // Check if AI grading is unavailable
                    if (result.error || result.code === "AI_UNAVAILABLE" || result.code === "AI_ERROR") {
                      console.warn("AI grading unavailable for Math question:", result.error)
                      return {
                        id: `q${qNum}_${label}`,
                        score: null, // null indicates "not graded"
                        maxScore: marks,
                        feedback: "⚠️ AI grading unavailable. Please review your answer manually against the expected answer below.",
                        feedbackNepali: "⚠️ AI ग्रेडिङ उपलब्ध छैन। कृपया तल अपेक्षित उत्तरसँग आफ्नो उत्तर म्यानुअल रूपमा समीक्षा गर्नुहोस्।",
                        question: questionTextEnglish,
                        questionNepali: questionTextNepali,
                        studentAnswer: userAnswer,
                        expectedAnswer: answerEnglish,
                        expectedAnswerNepali: answerNepali,
                        explanation: explanationEnglish,
                        explanationNepali: explanationNepali,
                        questionNumber: qNum,
                        subLabel: label,
                        aiUnavailable: true,
                      }
                    }

                    return {
                      id: `q${qNum}_${label}`,
                      score: result.score ?? 0,
                      maxScore: marks,
                      feedback: result.feedback || "Grading complete",
                      feedbackNepali: result.feedback || "ग्रेडिङ पूर्ण भयो",
                      question: questionTextEnglish,
                      questionNepali: questionTextNepali,
                      studentAnswer: userAnswer,
                      expectedAnswer: answerEnglish,
                      expectedAnswerNepali: answerNepali,
                      explanation: explanationEnglish,
                      explanationNepali: explanationNepali,
                      questionNumber: qNum,
                      subLabel: label,
                    }
                  })
                  .catch((err) => {
                    console.error("Math grading error:", err)
                    return {
                      id: `q${qNum}_${label}`,
                      score: null, // null indicates "not graded"
                      maxScore: marks,
                      feedback: "⚠️ AI grading failed. Please review your answer manually against the expected answer below.",
                      feedbackNepali: "⚠️ AI ग्रेडिङ असफल भयो। कृपया तल अपेक्षित उत्तरसँग आफ्नो उत्तर म्यानुअल रूपमा समीक्षा गर्नुहोस्।",
                      question: questionTextEnglish,
                      questionNepali: questionTextNepali,
                      studentAnswer: userAnswer,
                      expectedAnswer: answerEnglish,
                      expectedAnswerNepali: answerNepali,
                      explanation: explanationEnglish,
                      explanationNepali: explanationNepali,
                      questionNumber: qNum,
                      subLabel: label,
                      aiUnavailable: true,
                    }
                  })
              )
            } else {
              mathFeedback.push({
                id: `q${qNum}_${label}`,
                score: 0,
                maxScore: marks,
                feedback: "", // Empty - it's obvious no answer was provided
                feedbackNepali: "",
                question: questionTextEnglish,
                questionNepali: questionTextNepali,
                studentAnswer: "",
                expectedAnswer: answerEnglish,
                expectedAnswerNepali: answerNepali,
                explanation: explanationEnglish,
                explanationNepali: explanationNepali,
                questionNumber: qNum,
                subLabel: label,
                noAnswer: true,
              })
            }
          })
        })

        // Wait for AI grading to complete
        if (gradingPromises.length > 0) {
          console.log(`⏳ Waiting for ${gradingPromises.length} Math AI grading requests...`)
          const gradingResults = await Promise.all(gradingPromises)
          mathFeedback.push(...gradingResults)
        }

        // Sort feedback by question number and sub-label
        mathFeedback.sort((a, b) => {
          if (a.questionNumber !== b.questionNumber) {
            return a.questionNumber - b.questionNumber
          }
          return a.subLabel.localeCompare(b.subLabel)
        })

        // Calculate scores
        const totalScore = mathFeedback.reduce((sum: number, f: any) => sum + (f.score || 0), 0)
        const maxScore = mathFeedback.reduce((sum: number, f: any) => sum + (f.maxScore || 5), 0)
        const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
        const grade = percentage >= 90 ? "A+" : percentage >= 80 ? "A" : percentage >= 70 ? "B+" : percentage >= 60 ? "B" : percentage >= 50 ? "C+" : percentage >= 40 ? "C" : percentage >= 32 ? "D" : "E"

        // Create results object for Math tests
        results.mathFeedback = mathFeedback
        results.scoreA = totalScore

        // Save attempt history
        try {
          saveAttemptHistory(studentId, testId, {
            scoreA: totalScore,
            scoreB: 0,
            scoreC: 0,
            scoreD: 0,
            totalScore,
            maxScore,
            percentage,
            grade,
            timeTakenSeconds: elapsedSeconds,
          })
        } catch (error) {
          console.error("Error saving attempt history:", error)
        }

        console.log("✅ Math grading completed!")
        onShowResults(results)
        return
      }

      // Science test grading (existing logic)
      // Grade Group A (Multiple Choice) - instant scoring
      if (questions.groupA && questions.groupA.length > 0) {
        results.scoreA = questions.groupA.reduce((score: number, question: any) => {
          const userAnswer = answers.groupA?.[question.id]
          return userAnswer === question.correctAnswer ? score + question.marks : score
        }, 0)
      }

      // Grade Groups B, C, D with AI
      const gradingPromises: Promise<any>[] = []

      // Grade Group B
      if (questions.groupB && questions.groupB.length > 0) {
        questions.groupB.forEach((question: any) => {
          const userAnswer = answers.groupB?.[question.id] || ""
          if (typeof userAnswer === 'string' && userAnswer.trim()) {
            gradingPromises.push(
              fetch("/api/grade", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  question: question.english || question.nepali,
                  answer: userAnswer,
                  marks: question.marks,
                  sampleAnswer: question.sampleAnswerEnglish || question.sampleAnswerNepali || question.sampleAnswer,
                }),
              })
                .then((res) => res.json())
                .then((result) => ({
                  id: question.id,
                  score: result.score || 0,
                  feedback: result.feedback || (language === 'english' ? "No feedback available" : "प्रतिक्रिया उपलब्ध छैन"),
                  question: question.english || question.nepali,
                  studentAnswer: userAnswer,
                  group: "B",
                }))
                .catch(() => ({
                  id: question.id,
                  score: 0,
                  feedback: getGradingErrorMessage(),
                  question: question.english || question.nepali,
                  studentAnswer: userAnswer,
                  group: "B",
                }))
            )
          } else {
            results.feedbackB.push({
              id: question.id,
              score: 0,
              feedback: "",
              question: question.english || question.nepali,
              studentAnswer: "",
            })
          }
        })
      }

      // Grade Group C
      if (questions.groupC && questions.groupC.length > 0) {
        questions.groupC.forEach((question: any) => {
          const userAnswer = answers.groupC?.[question.id] || ""
          if (typeof userAnswer === 'string' && userAnswer.trim()) {
            gradingPromises.push(
              fetch("/api/grade", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  question: question.english || question.nepali,
                  answer: userAnswer,
                  marks: question.marks,
                  sampleAnswer: question.sampleAnswerEnglish || question.sampleAnswerNepali || question.sampleAnswer,
                }),
              })
                .then((res) => res.json())
                .then((result) => ({
                  id: question.id,
                  score: result.score || 0,
                  feedback: result.feedback || (language === 'english' ? "No feedback available" : "प्रतिक्रिया उपलब्ध छैन"),
                  question: question.english || question.nepali,
                  studentAnswer: userAnswer,
                  group: "C",
                }))
                .catch(() => ({
                  id: question.id,
                  score: 0,
                  feedback: getGradingErrorMessage(),
                  question: question.english || question.nepali,
                  studentAnswer: userAnswer,
                  group: "C",
                }))
            )
          } else {
            results.feedbackC.push({
              id: question.id,
              score: 0,
              feedback: "",
              question: question.english || question.nepali,
              studentAnswer: "",
            })
          }
        })
      }

      // Grade Group D
      if (questions.groupD && questions.groupD.length > 0) {
        questions.groupD.forEach((question: any) => {
          const userAnswer = answers.groupD?.[question.id] || ""
          if (typeof userAnswer === 'string' && userAnswer.trim()) {
            gradingPromises.push(
              fetch("/api/grade", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  question: question.english || question.nepali,
                  answer: userAnswer,
                  marks: question.marks,
                  sampleAnswer: question.sampleAnswerEnglish || question.sampleAnswerNepali || question.sampleAnswer,
                }),
              })
                .then((res) => res.json())
                .then((result) => ({
                  id: question.id,
                  score: result.score || 0,
                  feedback: result.feedback || (language === 'english' ? "No feedback available" : "प्रतिक्रिया उपलब्ध छैन"),
                  question: question.english || question.nepali,
                  studentAnswer: userAnswer,
                  group: "D",
                }))
                .catch(() => ({
                  id: question.id,
                  score: 0,
                  feedback: getGradingErrorMessage(),
                  question: question.english || question.nepali,
                  studentAnswer: userAnswer,
                  group: "D",
                }))
            )
          } else {
            results.feedbackD.push({
              id: question.id,
              score: 0,
              feedback: "",
              question: question.english || question.nepali,
              studentAnswer: "",
            })
          }
        })
      }

      // Wait for all AI grading to complete
      if (gradingPromises.length > 0) {
        console.log(`⏳ Waiting for ${gradingPromises.length} AI grading requests...`)
        const gradingResults = await Promise.all(gradingPromises)

        // Sort results by group
        gradingResults.forEach((result) => {
          if (result.group === "B") results.feedbackB.push(result)
          if (result.group === "C") results.feedbackC.push(result)
          if (result.group === "D") results.feedbackD.push(result)
        })
      }

      console.log("✅ All grading completed, showing results...")

      // Save attempt to history
      const totalScore =
        results.scoreA +
        results.feedbackB.reduce((sum: number, f: any) => sum + f.score, 0) +
        results.feedbackC.reduce((sum: number, f: any) => sum + f.score, 0) +
        results.feedbackD.reduce((sum: number, f: any) => sum + f.score, 0)

      const maxScore =
        (questions.groupA?.reduce((sum: number, q: any) => sum + q.marks, 0) || 0) +
        (questions.groupB?.reduce((sum: number, q: any) => sum + q.marks, 0) || 0) +
        (questions.groupC?.reduce((sum: number, q: any) => sum + q.marks, 0) || 0) +
        (questions.groupD?.reduce((sum: number, q: any) => sum + q.marks, 0) || 0)

      const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
      const grade =
        percentage >= 90
          ? "A+"
          : percentage >= 80
            ? "A"
            : percentage >= 70
              ? "B+"
              : percentage >= 60
                ? "B"
                : percentage >= 50
                  ? "C+"
                  : percentage >= 40
                    ? "C"
                    : percentage >= 32
                      ? "D"
                      : "E"

      // Save attempt history
      try {
        saveAttemptHistory(studentId, testId, {
          scoreA: results.scoreA,
          scoreB: results.feedbackB.reduce((sum: number, f: any) => sum + f.score, 0),
          scoreC: results.feedbackC.reduce((sum: number, f: any) => sum + f.score, 0),
          scoreD: results.feedbackD.reduce((sum: number, f: any) => sum + f.score, 0),
          totalScore,
          maxScore,
          percentage,
          grade,
          timeTakenSeconds: elapsedSeconds,
        })
      } catch (error) {
        console.error("Error saving attempt history:", error)
      }

      // Show results on new page
      onShowResults(results)
    } catch (error) {
      console.error("❌ Submission failed:", error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      // Check if it's a network error
      const isNetworkError = errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('Failed to fetch') || !navigator.onLine
      setSubmissionError(isNetworkError
        ? (language === 'english'
          ? 'No internet connection. Please check your connection and try again.'
          : 'इन्टरनेट जडान छैन। कृपया आफ्नो जडान जाँच गर्नुहोस् र पुन: प्रयास गर्नुहोस्।')
        : (language === 'english'
          ? `Submission failed: ${errorMessage}. Please try again.`
          : `पेश गर्न असफल: ${errorMessage}। कृपया पुन: प्रयास गर्नुहोस्।`))
    } finally {
      setIsSubmitting(false)
      setShowSubmitWarning(false)
    }
  }

  const getAvailableSections = () => {
    if (!questions) return []
    const sections = []
    if (questions.groupA.length > 0) sections.push("groupA")
    if (questions.groupB.length > 0) sections.push("groupB")
    if (questions.groupC.length > 0) sections.push("groupC")
    if (questions.groupD.length > 0) sections.push("groupD")
    return sections
  }

  const handleNextSection = () => {
    const sections = getAvailableSections()
    const currentIndex = sections.indexOf(currentTab)

    if (currentIndex < sections.length - 1) {
      const nextSection = sections[currentIndex + 1]
      setCurrentTab(nextSection)

      // Trigger the tab change in the UI
      const tabTrigger = document.querySelector(`[value="${nextSection}"]`) as HTMLElement
      if (tabTrigger) {
        tabTrigger.click()
      }

      // Scroll to top of the page
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const isLastSection = () => {
    const sections = getAvailableSections()
    return currentTab === sections[sections.length - 1]
  }

  if (!testId) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-lg border border-white/20 text-center mx-3 sm:mx-0">
        <Trophy className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">No Test Selected</h3>
        <p className="text-slate-600 text-sm sm:text-base">Please select a practice test from the dropdown above.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 sm:p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-sm sm:text-base">
            {language === "english" ? "Loading questions..." : "प्रश्नहरू लोड गर्दै..."}
          </p>
        </div>
      </div>
    )
  }

  // Show loading overlay when submitting
  if (isSubmitting) {
    return (
      <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-lg border border-slate-200 text-center max-w-md mx-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            {language === "english" ? "Submitting Test" : "परीक्षा पेश गर्दै"}
          </h3>
          <p className="text-slate-600 text-sm">
            {language === "english" ? "Please wait while we grade your answers..." : "तपाईंको उत्तर ग्रेड गर्दै कृपया पर्खनुहोस्..."}
          </p>
          <div className="mt-4 text-xs text-slate-500">
            {language === "english" ? "This may take a few moments" : "यसमा केही क्षण लाग्न सक्छ"}
          </div>
        </div>
      </div>
    )
  }

  // Show submission error screen
  if (submissionError) {
    return (
      <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-lg border border-red-200 text-center max-w-md mx-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            {language === "english" ? "Submission Failed" : "पेश गर्न असफल"}
          </h3>
          <p className="text-slate-600 text-sm mb-6">
            {submissionError}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setSubmissionError(null)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {language === "english" ? "Go Back" : "पछाडि जानुहोस्"}
            </button>
            <button
              onClick={() => {
                setSubmissionError(null)
                submitTest()
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {language === "english" ? "Try Again" : "पुन: प्रयास गर्नुहोस्"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-6 sm:p-8 text-red-600 mx-3 sm:mx-0">
        <p className="text-sm sm:text-base">
          {language === "english" ? "Error loading questions:" : "प्रश्नहरू लोड गर्दा त्रुटि:"} {error}
        </p>
      </div>
    )
  }

  if (!questions) return (
    <div className="text-center p-6">
      {language === "english" ? "No questions available" : "कुनै प्रश्नहरू उपलब्ध छैनन्"}
    </div>
  )

  const isEnglishTest = questions.englishQuestions && questions.englishQuestions.length > 0
  const isSocialStudiesTest = questions.socialStudiesGroups && questions.socialStudiesGroups.length > 0
  const isNepaliTest = questions.nepaliQuestions && questions.nepaliQuestions.length > 0
  const isMathTest = questions.mathQuestions && questions.mathQuestions.length > 0
  const isEmpty =
    !isEnglishTest &&
    !isSocialStudiesTest &&
    !isNepaliTest &&
    !isMathTest &&
    questions.groupA.length === 0 &&
    questions.groupB.length === 0 &&
    questions.groupC.length === 0 &&
    questions.groupD.length === 0

  if (isEmpty) {
    return (
      <div className="mx-3 sm:mx-0">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-lg border border-white/20 text-center">
          <Trophy className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
            {language === "english" ? "Test Coming Soon" : "परीक्षा छिट्टै आउँदैछ"}
          </h3>
          <p className="text-slate-600 text-sm sm:text-base">
            {language === "english" ? "This practice test is being prepared." : "यो अभ्यास परीक्षा तयार भइरहेको छ।"}
          </p>
        </div>
      </div>
    )
  }
  // Math test interface
  if (isMathTest) {
    return (
      <div className="px-3 sm:px-0">
        {/* Progress Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-white/20 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800 text-sm sm:text-base">
                📐 {language === "english" ? "Math Test Progress" : "गणित परीक्षा प्रगति"}
              </h3>
              <span className="text-xs text-slate-600">
                {calculateOverallProgress()}% {language === "english" ? "Complete" : "पूर्ण"}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <ExamTimer
                elapsedSeconds={elapsedSeconds}
                allocatedMinutes={metadata?.durationEnglish || 180}
                isPaused={isTimerPaused}
                onTogglePause={handleTogglePause}
                language={language}
              />
              {lastSaved && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Save className="h-3 w-3" />
                  <span>{language === "english" ? "Saved" : "सुरक्षित"} {formatSavedTime(lastSaved)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out"
              style={{ width: `${calculateOverallProgress()}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2 text-xs text-slate-600">
            <span>
              {Object.values(answers.math || {}).reduce((count: number, q: any) => {
                if (typeof q === 'object') {
                  return count + Object.values(q).filter((a: any) => a && String(a).trim()).length
                }
                return count
              }, 0)} {language === "english" ? "sub-questions answered" : "उप-प्रश्नहरू उत्तर दिइयो"}
            </span>
            <span>{questions.mathQuestions.reduce((total, q) => total + q.sub_questions.length, 0)} {language === "english" ? "total sub-questions" : "जम्मा उप-प्रश्नहरू"}</span>
          </div>
        </div>

        {/* Math Questions */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-white/20 mb-4 sm:mb-6">
          <MathQuestionRenderer
            questions={questions.mathQuestions}
            answers={answers.math || {}}
            onAnswerChange={handleMathAnswerChange}
            showExplanations={true}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-6 mb-8">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 min-h-[56px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {language === "english" ? "Submitting..." : "पेश गर्दै..."}
              </>
            ) : (
              <>
                <Trophy className="mr-2 h-5 w-5" />
                {language === "english" ? "Submit Test" : "परीक्षा पेश गर्नुहोस्"} ({(() => {
                  const answered = Object.values(answers.math || {}).reduce((count: number, q: any) => {
                    if (typeof q === 'object') {
                      return count + Object.values(q).filter((a: any) => a && String(a).trim()).length
                    }
                    return count
                  }, 0)
                  return `${answered}/${questions.mathQuestions.reduce((total, q) => total + q.sub_questions.length, 0)}`
                })()})
              </>
            )}
          </Button>
        </div>

        {/* Submit Warning Dialog */}
        {showSubmitWarning && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
              <div className="text-center">
                <Trophy className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {language === "english" ? "Incomplete Test" : "अपूर्ण परीक्षा"}
                </h3>
                <p className="text-slate-600 mb-4">
                  {language === "english"
                    ? `You have ${getIncompleteQuestions().incomplete} unanswered questions out of ${getIncompleteQuestions().total} total questions.`
                    : `तपाईंले ${getIncompleteQuestions().total} मध्ये ${getIncompleteQuestions().incomplete} प्रश्नहरूको उत्तर दिनुभएको छैन।`}
                </p>
                <p className="text-sm text-slate-500 mb-6">
                  {language === "english"
                    ? "Are you sure you want to submit your test now? You can still go back and answer more questions."
                    : "के तपाईं अहिले परीक्षा पेश गर्न चाहनुहुन्छ? तपाईं अझै फर्केर थप प्रश्नहरूको उत्तर दिन सक्नुहुन्छ।"}
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => setShowSubmitWarning(false)} variant="outline" className="flex-1">
                    {language === "english" ? "Go Back" : "फिर्ता जानुहोस्"}
                  </Button>
                  <Button
                    onClick={submitTest}
                    disabled={isSubmitting}
                    className="flex-1 bg-amber-600 hover:bg-amber-700"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (language === "english" ? "Submit Anyway" : "पेश गर्नुहोस्")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // English test interface
  if (isEnglishTest) {
    return (
      <div className="px-1 sm:px-0">
        {/* Progress Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-white/20 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800 text-sm sm:text-base">{language === "english" ? "English Test Progress" : "अंग्रेजी परीक्षा प्रगति"}</h3>
              <span className="text-xs text-slate-600">{calculateOverallProgress()}% {language === "english" ? "Complete" : "पूर्ण"}</span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <ExamTimer
                elapsedSeconds={elapsedSeconds}
                allocatedMinutes={metadata?.durationEnglish || 180}
                isPaused={isTimerPaused}
                onTogglePause={handleTogglePause}
                language={language}
              />
              {lastSaved && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Save className="h-3 w-3" />
                  <span>{language === "english" ? "Saved" : "सुरक्षित"} {formatSavedTime(lastSaved)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 transition-all duration-500 ease-out"
              style={{ width: `${calculateOverallProgress()}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2 text-xs text-slate-600">
            <span>
              {
                questions.englishQuestions.filter((q: any) => {
                  const answer = answers[q.id]
                  if (!answer) return false

                  // Handle different answer structures based on question type
                  if (q.type === 'free_writing') {
                    // Free writing questions store answer as answers[questionId].content = "text"
                    return answer.content && typeof answer.content === 'string' && answer.content.trim().length > 0
                  } else if (typeof answer === "object" && !Array.isArray(answer)) {
                    // Other question types with object answers (like reading comprehension with sub-sections)
                    return Object.values(answer).some((val) => {
                      if (typeof val === 'string') {
                        return val.trim().length > 0
                      } else if (typeof val === 'object' && val !== null) {
                        // Handle nested objects (like sub-sections)
                        return Object.values(val).some((nestedVal) =>
                          typeof nestedVal === 'string' && nestedVal.trim().length > 0
                        )
                      }
                      return val !== undefined && val !== null && val !== ""
                    })
                  }
                  return answer !== undefined && answer !== null && answer !== ""
                }).length
              }{" "}
              {language === "english" ? `of ${questions.englishQuestions.length} questions answered` : `मध्ये ${questions.englishQuestions.length} प्रश्नहरूको उत्तर दिइयो`}
            </span>
            <span className="font-medium">{calculateOverallProgress()}%</span>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {questions.englishQuestions.map((question: any) => (
            <EnglishQuestionRenderer
              key={question.id}
              question={question}
              answers={answers}
              onAnswerChange={handleAnswerChange}
              language={language}
            />
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-6 sm:mt-8 flex justify-center px-3 sm:px-0">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="lg"
            className="bg-slate-800 hover:bg-slate-900 !text-white px-6 sm:px-8 py-4 sm:py-3 rounded-xl disabled:opacity-50 w-full sm:w-auto min-h-[56px] text-sm sm:text-base"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> {language === "english" ? "Submitting..." : "पेश गर्दै..."}
              </>
            ) : (
              <>
                <Trophy className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> {language === "english" ? "Submit Test" : "परीक्षा पेश गर्नुहोस्"} ({(() => {
                  const answered = questions.englishQuestions.filter((q: any) => {
                    const answer = answers[q.id]
                    if (!answer) return false

                    // Handle different answer structures based on question type
                    if (q.type === 'free_writing') {
                      // Free writing questions store answer as answers[questionId].content = "text"
                      return answer.content && typeof answer.content === 'string' && answer.content.trim().length > 0
                    } else if (typeof answer === "object" && !Array.isArray(answer)) {
                      // Other question types with object answers (like reading comprehension with sub-sections)
                      return Object.values(answer).some((val) => {
                        if (typeof val === 'string') {
                          return val.trim().length > 0
                        } else if (typeof val === 'object' && val !== null) {
                          // Handle nested objects (like sub-sections)
                          return Object.values(val).some((nestedVal) =>
                            typeof nestedVal === 'string' && nestedVal.trim().length > 0
                          )
                        }
                        return val !== undefined && val !== null && val !== ""
                      })
                    }
                    return answer !== undefined && answer !== null && answer !== ""
                  }).length
                  return `${answered}/${questions.englishQuestions.length}`
                })()})
              </>
            )}
          </Button>
        </div>

        {/* Submit Warning Dialog */}
        {showSubmitWarning && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
              <div className="text-center">
                <Trophy className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">{language === "english" ? "Incomplete Test" : "अपूर्ण परीक्षा"}</h3>
                <p className="text-slate-600 mb-4">
                  {language === "english"
                    ? `You have ${getIncompleteQuestions().incomplete} unanswered questions out of ${getIncompleteQuestions().total} total questions.`
                    : `तपाईंले ${getIncompleteQuestions().total} मध्ये ${getIncompleteQuestions().incomplete} प्रश्नहरूको उत्तर दिनुभएको छैन।`}
                </p>
                <p className="text-sm text-slate-500 mb-6">
                  {language === "english"
                    ? "Are you sure you want to submit your test now? You can still go back and answer more questions."
                    : "के तपाईं अहिले परीक्षा पेश गर्न चाहनुहुन्छ? तपाईं अझै फर्केर थप प्रश्नहरूको उत्तर दिन सक्नुहुन्छ।"}
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => setShowSubmitWarning(false)} variant="outline" className="flex-1">
                    {language === "english" ? "Go Back" : "पछाडि जानुहोस्"}
                  </Button>
                  <Button
                    onClick={submitTest}
                    disabled={isSubmitting}
                    className="flex-1 bg-amber-600 hover:bg-amber-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {language === "english" ? "Submitting..." : "पेश गर्दै..."}
                      </>
                    ) : (
                      language === "english" ? "Submit Anyway" : "जे होस् पेश गर्नुहोस्"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Nepali test interface
  if (isNepaliTest) {
    const totalQuestions = questions.nepaliQuestions.length
    const answeredQuestions = questions.nepaliQuestions.filter((q: any) => {
      const answer = answers.nepali?.[`q${q.questionNumberEnglish || q.questionNumber}`]
      if (!answer) return false
      if (typeof answer === 'string') return answer.trim().length > 0
      if (typeof answer === 'object') {
        return Object.values(answer).some((val: any) => {
          if (typeof val === 'string') return val.trim().length > 0
          if (typeof val === 'object' && val !== null) {
            return Object.values(val).some((v: any) => typeof v === 'string' && v.trim().length > 0)
          }
          return val !== undefined && val !== null && val !== ''
        })
      }
      return false
    }).length

    return (
      <div className="px-3 sm:px-0">
        {/* Progress Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-white/20 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800 text-sm sm:text-base">{language === "english" ? "Nepali Test Progress" : "नेपाली परीक्षा प्रगति"}</h3>
              <span className="text-xs text-slate-600">{calculateOverallProgress()}% {language === "english" ? "Complete" : "पूर्ण"}</span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <ExamTimer
                elapsedSeconds={elapsedSeconds}
                allocatedMinutes={metadata?.durationEnglish || 180}
                isPaused={isTimerPaused}
                onTogglePause={handleTogglePause}
                language={language}
              />
              {lastSaved && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Save className="h-3 w-3" />
                  <span>{language === "english" ? "Saved" : "सुरक्षित"} {formatSavedTime(lastSaved)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-500 ease-out"
              style={{ width: `${calculateOverallProgress()}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2 text-xs text-slate-600">
            <span>{language === "english" ? `${answeredQuestions} of ${totalQuestions} questions answered` : `${answeredQuestions} / ${totalQuestions} प्रश्नहरू उत्तर दिइएको`}</span>
            <span className="font-medium">{calculateOverallProgress()}%</span>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {questions.nepaliQuestions?.filter((q: any) => q != null).map((question: any, index: number) => (
            <NepaliQuestionRenderer
              key={question?.questionNumberEnglish || question?.questionNumber || `nepali-q-${index}`}
              question={question}
              answer={answers.nepali?.[`q${question?.questionNumberEnglish || question?.questionNumber}`]}
              onAnswerChange={handleNepaliAnswerChange}
              questionIndex={index}
              language={language}
            />
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-6 sm:mt-8 flex justify-center px-3 sm:px-0">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="lg"
            className="bg-slate-800 hover:bg-slate-900 !text-white px-6 sm:px-8 py-4 sm:py-3 rounded-xl disabled:opacity-50 w-full sm:w-auto min-h-[56px] text-sm sm:text-base"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> {language === "english" ? "Submitting..." : "पेश गर्दै..."}
              </>
            ) : (
              <>
                <Trophy className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> {language === "english" ? "Submit Test" : "परीक्षा पेश गर्नुहोस्"} ({answeredQuestions}/{totalQuestions})
              </>
            )}
          </Button>
        </div>

        {/* Submit Warning Dialog */}
        {showSubmitWarning && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
              <div className="text-center">
                <Trophy className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">{language === "english" ? "Incomplete Test" : "अपूर्ण परीक्षा"}</h3>
                <p className="text-slate-600 mb-4">
                  {language === "english"
                    ? `You have ${getIncompleteQuestions().incomplete} unanswered questions out of ${getIncompleteQuestions().total}.`
                    : `तपाईंले ${getIncompleteQuestions().incomplete} प्रश्नहरू उत्तर दिनुभएको छैन (${getIncompleteQuestions().total} मध्ये)।`}
                </p>
                <p className="text-sm text-slate-500 mb-6">
                  {language === "english"
                    ? "Are you sure you want to submit now?"
                    : "के तपाईं अहिले आफ्नो परीक्षा पेश गर्न चाहनुहुन्छ?"}
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => setShowSubmitWarning(false)} variant="outline" className="flex-1">
                    {language === "english" ? "Go Back" : "फिर्ता जानुहोस्"}
                  </Button>
                  <Button
                    onClick={submitTest}
                    disabled={isSubmitting}
                    className="flex-1 bg-amber-600 hover:bg-amber-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {language === "english" ? "Submitting..." : "पेश गर्दै..."}
                      </>
                    ) : (
                      language === "english" ? "Submit Anyway" : "पेश गर्नुहोस्"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Social Studies test interface
  if (isSocialStudiesTest) {
    const totalQuestions = questions.socialStudiesGroups.reduce(
      (sum: number, g: any) => sum + (g.questions?.length || 0), 0
    )
    const answeredQuestions = questions.socialStudiesGroups.reduce((sum: number, g: any) => {
      return sum + (g.questions?.filter((q: any) => {
        const answer = answers.socialStudies?.[q.id]
        return answer && answer.trim().length > 0
      }).length || 0)
    }, 0)

    return (
      <div className="px-3 sm:px-0">
        {/* Progress Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-white/20 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800 text-sm sm:text-base">{language === "english" ? "Samajik Test" : "सामाजिक परीक्षा"}</h3>
              <span className="text-xs text-slate-600">{calculateOverallProgress()}% {language === "english" ? "Complete" : "पूरा भयो"}</span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <ExamTimer
                elapsedSeconds={elapsedSeconds}
                allocatedMinutes={metadata?.durationEnglish || 180}
                isPaused={isTimerPaused}
                onTogglePause={handleTogglePause}
                language={language}
              />
              {lastSaved && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Save className="h-3 w-3" />
                  <span>{language === "english" ? "Saved" : "सुरक्षित"} {formatSavedTime(lastSaved)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
              style={{ width: `${calculateOverallProgress()}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2 text-xs text-slate-600">
            <span>{language === "english" ? `${answeredQuestions} of ${totalQuestions} questions answered` : `${answeredQuestions} मध्ये ${totalQuestions} प्रश्नहरूको उत्तर दिइयो`}</span>
            <span className="font-medium">{calculateOverallProgress()}%</span>
          </div>
        </div>

        {/* Group Tabs */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            {questions.socialStudiesGroups.map((group: any, index: number) => (
              <TabsTrigger key={`socialStudies_${index}`} value={`socialStudies_${index}`} className="text-xs sm:text-sm">
                {language === "english"
                  ? `Group ${index === 0 ? 'A' : index === 1 ? 'B' : 'C'}`
                  : `समूह ${index === 0 ? 'क' : index === 1 ? 'ख' : 'ग'}`} ({group.questions?.length || 0})
              </TabsTrigger>
            ))}
          </TabsList>

          {questions.socialStudiesGroups.map((group: any, index: number) => (
            <TabsContent key={`socialStudies_${index}`} value={`socialStudies_${index}`}>
              <SocialStudiesGroupRenderer
                group={group}
                groupIndex={index}
                answers={answers.socialStudies || {}}
                onAnswerChange={handleSocialStudiesAnswerChange}
              />
            </TabsContent>
          ))}
        </Tabs>

        {/* Navigation Buttons */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3 px-3 sm:px-0">
          {/* Next Section Button - only show if not on last section */}
          {(() => {
            const currentIndex = parseInt(currentTab.replace("socialStudies_", ""))
            const isLastSection = currentIndex >= questions.socialStudiesGroups.length - 1
            if (!isLastSection) {
              return (
                <Button
                  onClick={() => {
                    const nextTab = `socialStudies_${currentIndex + 1}`
                    setCurrentTab(nextTab)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  size="lg"
                  variant="outline"
                  className="px-6 sm:px-8 py-4 sm:py-3 rounded-xl w-full sm:w-auto min-h-[56px] text-sm sm:text-base"
                >
                  {language === "english" ? "Next Section →" : "अर्को खण्ड →"}
                </Button>
              )
            }
            return null
          })()}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="lg"
            className="bg-slate-800 hover:bg-slate-900 !text-white px-6 sm:px-8 py-4 sm:py-3 rounded-xl disabled:opacity-50 w-full sm:w-auto min-h-[56px] text-sm sm:text-base"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> {language === "english" ? "Submitting..." : "पठाउँदै छ..."}
              </>
            ) : (
              <>
                <Trophy className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> {language === "english" ? "Submit Test" : "परीक्षा पठाउनुहोस्"} ({answeredQuestions}/{totalQuestions})
              </>
            )}
          </Button>
        </div>

        {/* Submit Warning Dialog */}
        {showSubmitWarning && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
              <div className="text-center">
                <Trophy className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">{language === "english" ? "Incomplete Test" : "अपूर्ण परीक्षा"}</h3>
                <p className="text-slate-600 mb-4">
                  {language === "english" ? `You have ${getIncompleteQuestions().incomplete} unanswered questions.` : `तपाईंले ${getIncompleteQuestions().incomplete} प्रश्नहरूको उत्तर दिनुभएको छैन।`}
                </p>
                <p className="text-sm text-slate-500 mb-6">
                  {language === "english" ? "Are you sure you want to submit now?" : "के तपाईं अहिले आफ्नो परीक्षा पठाउन चाहनुहुन्छ?"}
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => setShowSubmitWarning(false)} variant="outline" className="flex-1">
                    {language === "english" ? "Go Back" : "पछाडि जानुहोस्"}
                  </Button>
                  <Button
                    onClick={submitTest}
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {language === "english" ? "Submitting..." : "पठाउँदै छ..."}
                      </>
                    ) : (
                      language === "english" ? "Submit Anyway" : "पठाउनुहोस्"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Traditional science test interface with tabs
  return (
    <div className="px-1 sm:px-0">
      {/* Progress Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-white/20 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-800 text-sm sm:text-base">
              {language === "english" ? "Overall Progress" : "समग्र प्रगति"}
            </h3>
            <span className="text-xs text-slate-600">
              {calculateOverallProgress()}% {language === "english" ? "Complete" : "पूरा"}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <ExamTimer
              elapsedSeconds={elapsedSeconds}
              allocatedMinutes={metadata?.durationEnglish || 180}
              isPaused={isTimerPaused}
              onTogglePause={handleTogglePause}
              language={language}
            />
            {lastSaved && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <Save className="h-3 w-3" />
                <span>{language === "english" ? "Saved" : "सुरक्षित"} {formatSavedTime(lastSaved)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 transition-all duration-500 ease-out"
            style={{ width: `${calculateOverallProgress()}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-2 text-xs text-slate-600">
          <span>
            {(() => {
              const groupAAnswered = questions.groupA.filter((q: any) => answers.groupA?.[q.id]).length
              const groupBAnswered = questions.groupB.filter((q: any) => answers.groupB?.[q.id]?.trim()).length
              const groupCAnswered = questions.groupC.filter((q: any) => answers.groupC?.[q.id]?.trim()).length
              const groupDAnswered = questions.groupD.filter((q: any) => answers.groupD?.[q.id]?.trim()).length
              const totalAnswered = groupAAnswered + groupBAnswered + groupCAnswered + groupDAnswered
              const totalQuestions =
                questions.groupA.length + questions.groupB.length + questions.groupC.length + questions.groupD.length
              return language === "english"
                ? `${totalAnswered} of ${totalQuestions} questions answered`
                : `${totalQuestions} मध्ये ${totalAnswered} प्रश्नहरूको उत्तर दिइयो`
            })()}
          </span>
          <span className="font-medium">{calculateOverallProgress()}%</span>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          {questions.groupA.length > 0 && (
            <TabsTrigger value="groupA" className="text-xs sm:text-sm">
              {language === "english" ? "Group A" : "समूह क"} ({questions.groupA.length})
            </TabsTrigger>
          )}
          {questions.groupB.length > 0 && (
            <TabsTrigger value="groupB" className="text-xs sm:text-sm">
              {language === "english" ? "Group B" : "समूह ख"} ({questions.groupB.length})
            </TabsTrigger>
          )}
          {questions.groupC.length > 0 && (
            <TabsTrigger value="groupC" className="text-xs sm:text-sm">
              {language === "english" ? "Group C" : "समूह ग"} ({questions.groupC.length})
            </TabsTrigger>
          )}
          {questions.groupD.length > 0 && (
            <TabsTrigger value="groupD" className="text-xs sm:text-sm">
              {language === "english" ? "Group D" : "समूह घ"} ({questions.groupD.length})
            </TabsTrigger>
          )}
        </TabsList>

        {questions.groupA.length > 0 && (
          <TabsContent value="groupA">
            <GroupA
              questions={questions.groupA}
              answers={answers.groupA || {}}
              onAnswerChange={handleGroupAAnswerChange}
              progress={0}
            />
          </TabsContent>
        )}

        {questions.groupB.length > 0 && (
          <TabsContent value="groupB">
            <FreeResponseGroup
              group="B"
              questions={questions.groupB}
              answers={answers.groupB || {}}
              onAnswerChange={handleFreeResponseChange}
              progress={0}
            />
          </TabsContent>
        )}

        {questions.groupC.length > 0 && (
          <TabsContent value="groupC">
            <FreeResponseGroup
              group="C"
              questions={questions.groupC}
              answers={answers.groupC || {}}
              onAnswerChange={handleFreeResponseChange}
              progress={0}
            />
          </TabsContent>
        )}

        {questions.groupD.length > 0 && (
          <TabsContent value="groupD">
            <FreeResponseGroup
              group="D"
              questions={questions.groupD}
              answers={answers.groupD || {}}
              onAnswerChange={handleFreeResponseChange}
              progress={0}
            />
          </TabsContent>
        )}
      </Tabs>

      {/* Sync Status Indicator - only show for authenticated users */}
      {userEmail && syncStatus && (
        <div className="mt-4 flex justify-center">
          <div className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 ${syncStatus === 'synced' ? 'bg-green-100 text-green-700' :
            syncStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
            {syncStatus === 'synced' && (
              <>
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {language === 'english' ? 'Synced to cloud' : 'क्लाउडमा सिंक भयो'}
              </>
            )}
            {syncStatus === 'pending' && (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                {language === 'english' ? 'Syncing...' : 'सिंक हुँदैछ...'}
              </>
            )}
            {syncStatus === 'failed' && (
              <>
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                {language === 'english' ? 'Sync failed - saved locally' : 'सिंक असफल - स्थानीय रूपमा सुरक्षित'}
              </>
            )}
          </div>
        </div>
      )}

      {/* Submit/Next Section Button */}
      <div className="mt-6 sm:mt-8 flex justify-center gap-3 px-3 sm:px-0">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          size="lg"
          className="bg-slate-800 hover:bg-slate-900 !text-white px-6 sm:px-8 py-4 sm:py-3 rounded-xl disabled:opacity-50 w-full sm:w-auto min-h-[56px] text-sm sm:text-base"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              {isLastSection()
                ? (language === "english" ? "Submitting..." : "पेश गर्दै...")
                : (language === "english" ? "Grading..." : "मूल्याङ्कन गर्दै...")}
            </>
          ) : (
            <>
              <Trophy className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              {isLastSection()
                ? (language === "english" ? "Submit Test" : "परीक्षा पेश गर्नुहोस्")
                : (language === "english" ? "Submit & Grade" : "पेश गर्नुहोस् र मूल्याङ्कन")} ({(() => {
                  const groupAAnswered = questions.groupA.filter((q: any) => answers.groupA?.[q.id]).length
                  const groupBAnswered = questions.groupB.filter((q: any) => answers.groupB?.[q.id]?.trim()).length
                  const groupCAnswered = questions.groupC.filter((q: any) => answers.groupC?.[q.id]?.trim()).length
                  const groupDAnswered = questions.groupD.filter((q: any) => answers.groupD?.[q.id]?.trim()).length
                  const totalAnswered = groupAAnswered + groupBAnswered + groupCAnswered + groupDAnswered
                  const totalQuestions =
                    questions.groupA.length + questions.groupB.length + questions.groupC.length + questions.groupD.length
                  return `${totalAnswered}/${totalQuestions}`
                })()})
            </>
          )}
        </Button>

        {!isLastSection() && (
          <Button
            onClick={handleNextSection}
            size="lg"
            variant="outline"
            className="bg-blue-600 hover:bg-blue-700 !text-white border-blue-600 hover:border-blue-700 px-6 sm:px-8 py-4 sm:py-3 rounded-xl w-full sm:w-auto min-h-[56px] text-sm sm:text-base"
          >
            {language === "english" ? "Next Section →" : "अर्को खण्ड →"}
          </Button>
        )}
      </div>

      {/* Submit Warning Dialog */}
      {showSubmitWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <Trophy className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {language === "english" ? "Incomplete Test" : "अपूर्ण परीक्षा"}
              </h3>
              <p className="text-slate-600 mb-4">
                {language === "english"
                  ? `You have ${getIncompleteQuestions().incomplete} unanswered questions out of ${getIncompleteQuestions().total} total questions.`
                  : `${getIncompleteQuestions().total} कुल प्रश्नहरू मध्ये ${getIncompleteQuestions().incomplete} प्रश्नहरूको उत्तर दिइएको छैन।`}
              </p>
              <p className="text-sm text-slate-500 mb-6">
                {language === "english"
                  ? "Are you sure you want to submit your test now? You can still go back and answer more questions."
                  : "के तपाईं अहिले आफ्नो परीक्षा पेश गर्न चाहनुहुन्छ? तपाईं अझै पछाडि फर्किएर थप प्रश्नहरूको उत्तर दिन सक्नुहुन्छ।"}
              </p>
              <div className="flex gap-3">
                <Button onClick={() => setShowSubmitWarning(false)} variant="outline" className="flex-1">
                  {language === "english" ? "Go Back" : "पछाडि जानुहोस्"}
                </Button>
                <Button onClick={submitTest} disabled={isSubmitting} className="flex-1 bg-amber-600 hover:bg-amber-700">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {language === "english" ? "Submitting..." : "पेश गर्दै..."}
                    </>
                  ) : (
                    language === "english" ? "Submit Anyway" : "जे होस् पेश गर्नुहोस्"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

