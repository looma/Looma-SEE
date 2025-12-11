"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Loader2, Trophy, Save } from "lucide-react"
import { GroupA } from "./group-a"
import { FreeResponseGroup } from "./free-response-group"
import { EnglishQuestionRenderer } from "./english-question-renderer"
import { SocialStudiesGroupRenderer } from "./social-studies-question-renderer"
import { NepaliQuestionRenderer } from "./nepali-question-renderer"
import { useQuestions } from "@/lib/use-questions"
import { loadStudentProgress, saveStudentProgress, saveAttemptHistory } from "@/lib/storage"

interface ExamTabsProps {
  studentId: string
  testId: string
  onProgressUpdate: () => void
  onShowResults: (results: any) => void
  onBackToTestSelection: () => void
}

export function ExamTabs({ studentId, testId, onProgressUpdate, onShowResults, onBackToTestSelection }: ExamTabsProps) {
  const { questions, loading, error } = useQuestions(testId)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showSubmitWarning, setShowSubmitWarning] = useState(false)
  const [currentTab, setCurrentTab] = useState("")

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

    const storageKey = `${studentId}_${testId}`
    const progress = loadStudentProgress(storageKey)

    if (progress && progress.answers) {
      setAnswers(progress.answers)
      setLastSaved(new Date(progress.lastUpdated))
    }
  }, [studentId, testId])

  // Set tab when questions load (separate effect to avoid clearing answers)
  useEffect(() => {
    if (!questions) return

    const isEnglishTest = questions.englishQuestions && questions.englishQuestions.length > 0
    const isSocialStudiesTest = questions.socialStudiesGroups && questions.socialStudiesGroups.length > 0
    if (!isEnglishTest && !isSocialStudiesTest && !currentTab) {
      setCurrentTab(getFirstAvailableSection())
    } else if (isSocialStudiesTest && !currentTab) {
      setCurrentTab("socialStudies_0")
    }
  }, [questions, currentTab])


  // Save progress when answers change
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
    }

    saveStudentProgress(studentId, progressData)
    setLastSaved(new Date())
    onProgressUpdate()
  }, [answers, studentId, testId, onProgressUpdate, currentTab])

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
          if (answer && answer.trim().length > 0) {
            answeredQuestions++
          }
        })
      })
    } else if (questions.nepaliQuestions && questions.nepaliQuestions.length > 0) {
      // Nepali test format
      totalQuestions = questions.nepaliQuestions.length
      answeredQuestions = questions.nepaliQuestions.filter((q: any) => {
        const answer = answers.nepali?.[`q${q.questionNumber}`]
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
    } else {
      // Science test format
      totalQuestions =
        questions.groupA.length + questions.groupB.length + questions.groupC.length + questions.groupD.length

      // Count Group A answers
      const groupAAnswered = questions.groupA.filter((q: any) => answers.groupA?.[q.id]).length

      // Count Group B answers
      const groupBAnswered = questions.groupB.filter((q: any) => {
        const answer = answers.groupB?.[q.id]
        return answer && answer.trim().length > 0
      }).length

      // Count Group C answers
      const groupCAnswered = questions.groupC.filter((q: any) => {
        const answer = answers.groupC?.[q.id]
        return answer && answer.trim().length > 0
      }).length

      // Count Group D answers
      const groupDAnswered = questions.groupD.filter((q: any) => {
        const answer = answers.groupD?.[q.id]
        return answer && answer.trim().length > 0
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
      totalQuestions = questions.englishQuestions.length
      incompleteQuestions = questions.englishQuestions.filter((q: any) => {
        const answer = answers[q.id]
        if (!answer) return true

        // Handle different answer structures based on question type
        if (q.type === 'free_writing') {
          // Free writing questions store answer as answers[questionId].content = "text"
          return !answer.content || typeof answer.content !== 'string' || answer.content.trim().length === 0
        } else if (typeof answer === "object" && !Array.isArray(answer)) {
          // Other question types with object answers (like reading comprehension with sub-sections)
          return !Object.values(answer).some((val) => {
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
        return answer === undefined || answer === null || answer === ""
      }).length
    } else if (questions.socialStudiesGroups && questions.socialStudiesGroups.length > 0) {
      // Social Studies test format
      questions.socialStudiesGroups.forEach((group: any) => {
        totalQuestions += group.questions?.length || 0
        group.questions?.forEach((q: any) => {
          const answer = answers.socialStudies?.[q.id]
          if (!answer || answer.trim().length === 0) {
            incompleteQuestions++
          }
        })
      })
    } else if (questions.nepaliQuestions && questions.nepaliQuestions.length > 0) {
      // Nepali test format
      totalQuestions = questions.nepaliQuestions.length
      incompleteQuestions = questions.nepaliQuestions.filter((q: any) => {
        const answer = answers.nepali?.[`q${q.questionNumber}`]
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
    } else {
      // Science test format
      totalQuestions =
        questions.groupA.length + questions.groupB.length + questions.groupC.length + questions.groupD.length

      // Count Group A incomplete answers
      const groupAIncomplete = questions.groupA.filter((q: any) => !answers.groupA?.[q.id]).length

      // Count Group B incomplete answers
      const groupBIncomplete = questions.groupB.filter((q: any) => {
        const answer = answers.groupB?.[q.id]
        return !answer || answer.trim().length === 0
      }).length

      // Count Group C incomplete answers
      const groupCIncomplete = questions.groupC.filter((q: any) => {
        const answer = answers.groupC?.[q.id]
        return !answer || answer.trim().length === 0
      }).length

      // Count Group D incomplete answers
      const groupDIncomplete = questions.groupD.filter((q: any) => {
        const answer = answers.groupD?.[q.id]
        return !answer || answer.trim().length === 0
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
              question.subSections.forEach((section: any) => {
                if (section.type === 'matching' && section.columns && section.correctAnswer) {
                  // Grade matching questions automatically
                  const sectionAnswer = userAnswer[section.id]
                  if (sectionAnswer && typeof sectionAnswer === 'object') {
                    const correctMatches = section.correctAnswer || []
                    const userMatches: Array<{ A: string; B: string }> = []

                    // Convert user answers to match format
                    if (section.columns && section.columns.A) {
                      section.columns.A.forEach((itemA: any) => {
                        const userMatch = sectionAnswer[itemA.id]
                        if (userMatch) {
                          userMatches.push({ A: itemA.id, B: userMatch })
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

                    // Calculate marks per match
                    const marksPerMatch = section.marks && totalMatches > 0
                      ? Math.round((section.marks / totalMatches) * 10) / 10
                      : 1
                    const score = correctCount * marksPerMatch
                    const feedback = correctCount === totalMatches
                      ? `Perfect! All ${totalMatches} matches are correct.`
                      : correctCount > 0
                        ? `Partially correct. ${correctCount} out of ${totalMatches} matches are correct.`
                        : `Incorrect. None of the matches are correct.`

                    console.log(`🎯 Auto-grading matching question: ${correctCount}/${totalMatches} correct`)

                    gradingPromises.push(Promise.resolve({
                      id: `${(question as any).id}_${section.id}`,
                      score: score,
                      feedback: feedback,
                      question: section.title || 'Matching question',
                      studentAnswer: JSON.stringify(userMatches),
                      group: "English",
                      questionId: (question as any).id,
                      sectionId: section.id,
                    }))
                  }
                } else if (section.subQuestions) {
                  section.subQuestions.forEach((subQ: any) => {
                    const sectionAnswer = userAnswer[section.id]
                    if (sectionAnswer && typeof sectionAnswer === 'object') {
                      const userSubAnswer = sectionAnswer[subQ.id]
                      if (userSubAnswer && typeof userSubAnswer === 'string' && userSubAnswer.trim().length > 0) {
                        // Calculate marks for sub-question
                        const subQuestionMarks = subQ.marks || (section.marks ? Math.round((section.marks / section.subQuestions.length) * 10) / 10 : 1)

                        if (section.type === 'true_false' || section.type === 'true_false_not_given') {
                          // Grade true/false and true/false/not given questions automatically
                          console.log(`🎯 Auto-grading ${section.type} question: ${subQ.questionEnglish}`)
                          const isCorrect = userSubAnswer.toUpperCase() === subQ.correctAnswer.toUpperCase()
                          const score = isCorrect ? subQuestionMarks : 0
                          const feedback = isCorrect
                            ? "Correct! Well done."
                            : `Incorrect. The correct answer is ${subQ.correctAnswer}.`

                          console.log(`✅ Auto-graded result: ${isCorrect ? 'CORRECT' : 'INCORRECT'} - ${feedback}`)

                          gradingPromises.push(Promise.resolve({
                            id: `${(question as any).id}_${section.id}_${subQ.id}`,
                            score: score,
                            feedback: feedback,
                            question: subQ.questionEnglish,
                            studentAnswer: userSubAnswer,
                            group: "English",
                            questionId: (question as any).id,
                            sectionId: section.id,
                            subQuestionId: subQ.id,
                          }))
                        } else if (section.type === 'short_answer' || section.type === 'fill_in_the_blanks') {
                          // Grade open-ended questions with AI
                          console.log(`🤖 AI-grading ${section.type} question: ${subQ.questionEnglish}`)
                          gradingPromises.push(
                            fetch("/api/grade", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                question: subQ.questionEnglish,
                                answer: userSubAnswer,
                                marks: subQuestionMarks,
                                sampleAnswer: subQ.correctAnswer,
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
                                id: `${question.id}_${section.id}_${subQ.id}`,
                                score: result.score || 0,
                                feedback: result.feedback || "No feedback available",
                                question: subQ.questionEnglish,
                                studentAnswer: userSubAnswer,
                                group: "English",
                                questionId: question.id,
                                sectionId: section.id,
                                subQuestionId: subQ.id,
                              }))
                              .catch((error) => ({
                                id: `${question.id}_${section.id}_${subQ.id}`,
                                score: 0,
                                feedback: `AI grading failed: ${error.message || 'Unknown error'}`,
                                question: subQ.questionEnglish,
                                studentAnswer: userSubAnswer,
                                group: "English",
                                questionId: question.id,
                                sectionId: section.id,
                                subQuestionId: subQ.id,
                              }))
                          )
                        }
                      }
                    }
                  })
                }
              })
            } else if (question.subQuestions) {
              // Handle questions with direct sub-questions (like grammar questions)
              question.subQuestions.forEach((subQ: any) => {
                const userSubAnswer = userAnswer[subQ.id]
                if (userSubAnswer && typeof userSubAnswer === 'string' && userSubAnswer.trim().length > 0) {
                  // Calculate marks for sub-question
                  const subQuestionMarks = subQ.marks || (question.marks ? Math.round((question.marks / question.subQuestions.length) * 10) / 10 : 1)

                  if (subQ.type === 'reproduce') {
                    // Grade grammar/reproduce questions with AI
                    gradingPromises.push(
                      fetch("/api/grade", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          question: subQ.questionEnglish,
                          answer: userSubAnswer,
                          marks: subQuestionMarks,
                          sampleAnswer: subQ.correctAnswer,
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
                          id: `${question.id}_${subQ.id}`,
                          score: result.score || 0,
                          feedback: result.feedback || "No feedback available",
                          question: subQ.questionEnglish,
                          studentAnswer: userSubAnswer,
                          group: "English",
                          questionId: question.id,
                          subQuestionId: subQ.id,
                        }))
                        .catch((error) => ({
                          id: `${question.id}_${subQ.id}`,
                          score: 0,
                          feedback: `AI grading failed: ${error.message || 'Unknown error'}`,
                          question: subQ.questionEnglish,
                          studentAnswer: userSubAnswer,
                          group: "English",
                          questionId: question.id,
                          subQuestionId: subQ.id,
                        }))
                    )
                  }
                }
              })
            } else if ((question as any).type === 'free_writing') {
              // Handle free writing questions
              const userWritingAnswer = userAnswer
              if (userWritingAnswer && typeof userWritingAnswer === 'string' && userWritingAnswer.trim().length > 0) {
                gradingPromises.push(
                  fetch("/api/grade", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      question: (question as any).title,
                      answer: userWritingAnswer,
                      marks: (question as any).marks,
                      sampleAnswer: (question as any).sampleAnswer?.content,
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
                      feedback: result.feedback || "No feedback available",
                      question: (question as any).title,
                      studentAnswer: userWritingAnswer,
                      group: "English",
                      questionId: (question as any).id,
                    }))
                    .catch((error) => ({
                      id: (question as any).id,
                      score: 0,
                      feedback: `AI grading failed: ${error.message || 'Unknown error'}`,
                      question: (question as any).title,
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
                    const gap = gaps.find((g: any) => g.id === gapId)
                    if (gap) {
                      const gapMarks = (question as any).marks && gaps.length ? Math.round(((question as any).marks / gaps.length) * 10) / 10 : 1
                      const trimmedAnswer = gapAnswer.trim()
                      const correctAnswer = gap.correctAnswer?.trim() || ""

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
                          ? "Correct! (British/American English variant accepted)"
                          : "Correct! Well done."

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
                              question: `Fill in the blank (${gapId}): ${(question as any).passage}`,
                              answer: gapAnswer,
                              marks: gapMarks,
                              sampleAnswer: gap.correctAnswer,
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
                              feedback: result.feedback || "No feedback available",
                              question: `Fill in the blank (${gapId})`,
                              studentAnswer: gapAnswer,
                              group: "English",
                              questionId: (question as any).id,
                              gapId: gapId,
                            }))
                            .catch((error) => ({
                              id: `${(question as any).id}_${gapId}`,
                              score: 0,
                              feedback: `AI grading failed: ${error.message || 'Unknown error'}`,
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
        const percentage = Math.round((totalScore / maxScore) * 100)
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
          group.questions?.forEach((question: any) => {
            const userAnswer = answers.socialStudies?.[question.id] || ""

            // Skip map_drawing questions (require manual grading)
            if (question.type === "map_drawing") {
              socialStudiesFeedback.push({
                id: question.id,
                score: 0,
                feedback: "नक्सा प्रश्नहरू म्यानुअल ग्रेडिङ आवश्यक छ (Map questions require manual grading)",
                question: question.questionNepali,
                studentAnswer: userAnswer || "(कुनै चित्रण प्रदान गरिएको छैन)",
                group: groupIndex,
                marks: question.marks,
              })
              return
            }

            if (userAnswer && userAnswer.trim().length > 0) {
              gradingPromises.push(
                fetch("/api/grade", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    question: question.questionNepali,
                    answer: userAnswer,
                    marks: question.marks,
                    sampleAnswer: question.answerNepali,
                  }),
                })
                  .then((res) => res.json())
                  .then((result) => ({
                    id: question.id,
                    score: result.score || 0,
                    feedback: result.feedback || "प्रतिक्रिया उपलब्ध छैन",
                    question: question.questionNepali,
                    studentAnswer: userAnswer,
                    group: groupIndex,
                    marks: question.marks,
                  }))
                  .catch(() => ({
                    id: question.id,
                    score: 0,
                    feedback: "AI ग्रेडिङ असफल भयो",
                    question: question.questionNepali,
                    studentAnswer: userAnswer,
                    group: groupIndex,
                    marks: question.marks,
                  }))
              )
            } else {
              socialStudiesFeedback.push({
                id: question.id,
                score: 0,
                feedback: "कुनै उत्तर प्रदान गरिएको छैन (No answer provided)",
                question: question.questionNepali,
                studentAnswer: "",
                group: groupIndex,
                marks: question.marks,
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
        const nepaliFeedback: any[] = []
        const gradingPromises: Promise<any>[] = []

        questions.nepaliQuestions.forEach((question: any, qIndex: number) => {
          const questionKey = `q${question.questionNumber || qIndex + 1}`
          const userAnswer = answers.nepali?.[questionKey]
          const questionTitle = question.title || question.questionNepali || question.questionEnglish || `Question ${qIndex + 1}`

          switch (question.type) {
            case "matching": {
              // Auto-grade matching questions
              // UI stores answers as: { "i": "c", "ii": "a", ... } using itemA.id as keys
              let score = 0
              const columns = question.columns?.A || question.columns?.a || []
              const maxScore = question.marks || columns.length || 5
              const pointsPerMatch = columns.length > 0 ? maxScore / columns.length : maxScore

              if (userAnswer && columns.length > 0) {
                // Get correct answers - could be array of {A, B} pairs or on items
                const correctAnswers = question.correctAnswer || []

                columns.forEach((item: any) => {
                  const userChoice = userAnswer[item.id]
                  // Check if correct answer is in correctAnswer array
                  const correctPair = Array.isArray(correctAnswers)
                    ? correctAnswers.find((ca: any) => ca.A === item.id)
                    : null
                  const expectedAnswer = correctPair?.B || item.correctAnswer

                  if (userChoice && expectedAnswer && userChoice === expectedAnswer) {
                    score += pointsPerMatch
                  }
                })
              }

              nepaliFeedback.push({
                id: questionKey,
                type: question.type,
                score: Math.round(score * 10) / 10,
                maxScore: maxScore,
                feedback: score >= maxScore ? "सबै मिल्यो! (All correct!)" :
                  score > 0 ? `${Math.round(score)}/${maxScore} सही (correct)` : "केही मिलेन (None correct)",
                question: questionTitle,
                studentAnswer: userAnswer,
              })
              break
            }

            case "fill_in_the_blanks":
            case "fill_in_the_blanks_choices": {
              // Auto-grade fill in the blanks - UI stores as { "subId": "answer", ... }
              let score = 0
              const subQuestions = question.subQuestions || []
              const maxScore = question.marks || subQuestions.length || 5
              const pointsPerBlank = subQuestions.length > 0 ? maxScore / subQuestions.length : maxScore

              if (userAnswer && subQuestions.length > 0) {
                subQuestions.forEach((sub: any) => {
                  const userVal = userAnswer[sub.id]
                  if (userVal && sub.correctAnswer) {
                    if (userVal.toLowerCase().trim() === sub.correctAnswer.toLowerCase().trim()) {
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
                feedback: score >= maxScore ? "सबै सही! (All correct!)" :
                  score > 0 ? `${Math.round(score)}/${maxScore} सही (correct)` : "केही सही छैन (None correct)",
                question: questionTitle,
                studentAnswer: userAnswer,
              })
              break
            }

            case "grammar_choice":
            case "parts_of_speech": {
              // These are mostly free-response, but if they have subQuestions with correctAnswer, we can auto-grade
              const subQuestions = question.subQuestions || []
              const correctWords = Array.isArray(question.correctAnswer) ? question.correctAnswer : []

              // For parts_of_speech with correctAnswer array like [{word: "जो", pos: "सर्वनाम"}, ...]
              if (question.type === "parts_of_speech" && correctWords.length > 0 && userAnswer) {
                let score = 0
                const maxScore = question.marks || correctWords.length || 5
                const pointsPerWord = correctWords.length > 0 ? maxScore / correctWords.length : maxScore

                correctWords.forEach((pair: any) => {
                  const userVal = userAnswer[pair.word]
                  if (userVal && pair.pos) {
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
                  feedback: score >= maxScore ? "सबै सही! (All correct!)" :
                    score > 0 ? `${Math.round(score)}/${maxScore} सही (correct)` : "केही सही छैन (None correct)",
                  question: questionTitle,
                  studentAnswer: userAnswer,
                })
              } else {
                // Fall back to AI grading for complex grammar questions
                const marks = question.marks || 5
                const sampleAnswer = question.sampleAnswer || ""

                let combinedAnswer = ""
                if (typeof userAnswer === "string") {
                  combinedAnswer = userAnswer
                } else if (typeof userAnswer === "object" && userAnswer) {
                  combinedAnswer = Object.entries(userAnswer)
                    .filter(([key]) => !key.includes("selected"))
                    .map(([key, val]) => typeof val === "string" ? `${key}: ${val}` : "")
                    .filter(val => val.trim())
                    .join("\n")
                }

                if (combinedAnswer.trim()) {
                  gradingPromises.push(
                    fetch("/api/grade", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        question: questionTitle,
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
                        feedback: result.feedback || "प्रतिक्रिया उपलब्ध छैन",
                        question: questionTitle,
                        studentAnswer: combinedAnswer,
                      }))
                      .catch(() => ({
                        id: questionKey,
                        type: question.type,
                        score: 0,
                        maxScore: marks,
                        feedback: "AI ग्रेडिङ असफल भयो",
                        question: questionTitle,
                        studentAnswer: combinedAnswer,
                      }))
                  )
                } else {
                  nepaliFeedback.push({
                    id: questionKey,
                    type: question.type,
                    score: 0,
                    maxScore: marks,
                    feedback: "कुनै उत्तर प्रदान गरिएको छैन",
                    question: questionTitle,
                    studentAnswer: "",
                  })
                }
              }
              break
            }

            default: {
              // AI grade all other question types (free response, essay, etc.)
              const marks = question.marks || 5
              const sampleAnswer = question.sampleAnswer || question.modelAnswer || ""

              // Collect all sub-answers into a single response string for AI grading
              let combinedAnswer = ""
              if (typeof userAnswer === "string") {
                combinedAnswer = userAnswer
              } else if (typeof userAnswer === "object" && userAnswer) {
                // Filter out selection keys and format answer values
                combinedAnswer = Object.entries(userAnswer)
                  .filter(([key]) => !key.includes("selected"))
                  .map(([key, val]) => typeof val === "string" ? val : JSON.stringify(val))
                  .filter(val => val && val.trim())
                  .join("\n")
              }

              if (combinedAnswer.trim()) {
                gradingPromises.push(
                  fetch("/api/grade", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      question: questionTitle,
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
                      feedback: result.feedback || "प्रतिक्रिया उपलब्ध छैन (No feedback available)",
                      question: questionTitle,
                      studentAnswer: combinedAnswer,
                      sampleAnswer: sampleAnswer,
                    }))
                    .catch(() => ({
                      id: questionKey,
                      type: question.type,
                      score: 0,
                      maxScore: marks,
                      feedback: "AI ग्रेडिङ असफल भयो (AI grading failed)",
                      question: questionTitle,
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
                  feedback: "कुनै उत्तर प्रदान गरिएको छैन (No answer provided)",
                  question: questionTitle,
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
          const numA = parseInt(a.id.replace("q", ""))
          const numB = parseInt(b.id.replace("q", ""))
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
          })
        } catch (error) {
          console.error("Error saving attempt history:", error)
        }

        console.log("✅ Nepali grading completed!")
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
          if (userAnswer.trim()) {
            gradingPromises.push(
              fetch("/api/grade", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  question: question.english,
                  answer: userAnswer,
                  marks: question.marks,
                  sampleAnswer: question.sampleAnswer,
                }),
              })
                .then((res) => res.json())
                .then((result) => ({
                  id: question.id,
                  score: result.score || 0,
                  feedback: result.feedback || "No feedback available",
                  question: question.english,
                  studentAnswer: userAnswer,
                  group: "B",
                }))
                .catch(() => ({
                  id: question.id,
                  score: 0,
                  feedback: "AI grading failed",
                  question: question.english,
                  studentAnswer: userAnswer,
                  group: "B",
                }))
            )
          } else {
            results.feedbackB.push({
              id: question.id,
              score: 0,
              feedback: "No answer provided",
              question: question.english,
              studentAnswer: "",
            })
          }
        })
      }

      // Grade Group C
      if (questions.groupC && questions.groupC.length > 0) {
        questions.groupC.forEach((question: any) => {
          const userAnswer = answers.groupC?.[question.id] || ""
          if (userAnswer.trim()) {
            gradingPromises.push(
              fetch("/api/grade", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  question: question.english,
                  answer: userAnswer,
                  marks: question.marks,
                  sampleAnswer: question.sampleAnswer,
                }),
              })
                .then((res) => res.json())
                .then((result) => ({
                  id: question.id,
                  score: result.score || 0,
                  feedback: result.feedback || "No feedback available",
                  question: question.english,
                  studentAnswer: userAnswer,
                  group: "C",
                }))
                .catch(() => ({
                  id: question.id,
                  score: 0,
                  feedback: "AI grading failed",
                  question: question.english,
                  studentAnswer: userAnswer,
                  group: "C",
                }))
            )
          } else {
            results.feedbackC.push({
              id: question.id,
              score: 0,
              feedback: "No answer provided",
              question: question.english,
              studentAnswer: "",
            })
          }
        })
      }

      // Grade Group D
      if (questions.groupD && questions.groupD.length > 0) {
        questions.groupD.forEach((question: any) => {
          const userAnswer = answers.groupD?.[question.id] || ""
          if (userAnswer.trim()) {
            gradingPromises.push(
              fetch("/api/grade", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  question: question.english,
                  answer: userAnswer,
                  marks: question.marks,
                  sampleAnswer: question.sampleAnswer,
                }),
              })
                .then((res) => res.json())
                .then((result) => ({
                  id: question.id,
                  score: result.score || 0,
                  feedback: result.feedback || "No feedback available",
                  question: question.english,
                  studentAnswer: userAnswer,
                  group: "D",
                }))
                .catch(() => ({
                  id: question.id,
                  score: 0,
                  feedback: "AI grading failed",
                  question: question.english,
                  studentAnswer: userAnswer,
                  group: "D",
                }))
            )
          } else {
            results.feedbackD.push({
              id: question.id,
              score: 0,
              feedback: "No answer provided",
              question: question.english,
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

      const percentage = Math.round((totalScore / maxScore) * 100)
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
        })
      } catch (error) {
        console.error("Error saving attempt history:", error)
      }

      // Show results on new page
      onShowResults(results)
    } catch (error) {
      console.error("❌ Submission failed:", error)
      alert(`Failed to submit test: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`)
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
          <p className="text-sm sm:text-base">Loading questions...</p>
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
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Submitting Test</h3>
          <p className="text-slate-600 text-sm">Please wait while we grade your answers...</p>
          <div className="mt-4 text-xs text-slate-500">
            This may take a few moments
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-6 sm:p-8 text-red-600 mx-3 sm:mx-0">
        <p className="text-sm sm:text-base">Error loading questions: {error}</p>
      </div>
    )
  }

  if (!questions) return <div className="text-center p-6">No questions available</div>

  const isEnglishTest = questions.englishQuestions && questions.englishQuestions.length > 0
  const isSocialStudiesTest = questions.socialStudiesGroups && questions.socialStudiesGroups.length > 0
  const isNepaliTest = questions.nepaliQuestions && questions.nepaliQuestions.length > 0
  const isEmpty =
    !isEnglishTest &&
    !isSocialStudiesTest &&
    !isNepaliTest &&
    questions.groupA.length === 0 &&
    questions.groupB.length === 0 &&
    questions.groupC.length === 0 &&
    questions.groupD.length === 0

  if (isEmpty) {
    return (
      <div className="mx-3 sm:mx-0">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-lg border border-white/20 text-center">
          <Trophy className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Test Coming Soon</h3>
          <p className="text-slate-600 text-sm sm:text-base">This practice test is being prepared.</p>
        </div>
      </div>
    )
  }

  // English test interface
  if (isEnglishTest) {
    return (
      <div className="px-3 sm:px-0">
        {/* Progress Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-white/20 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800 text-sm sm:text-base">English Test Progress</h3>
              <span className="text-xs text-slate-600">{calculateOverallProgress()}% Complete</span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              {lastSaved && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Save className="h-3 w-3" />
                  <span>Saved {formatSavedTime(lastSaved)}</span>
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
              of {questions.englishQuestions.length} questions answered
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
                <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <Trophy className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Submit Test ({(() => {
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
                <h3 className="text-xl font-bold text-slate-800 mb-2">Incomplete Test</h3>
                <p className="text-slate-600 mb-4">
                  You have {getIncompleteQuestions().incomplete} unanswered questions out of{" "}
                  {getIncompleteQuestions().total} total questions.
                </p>
                <p className="text-sm text-slate-500 mb-6">
                  Are you sure you want to submit your test now? You can still go back and answer more questions.
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => setShowSubmitWarning(false)} variant="outline" className="flex-1">
                    Go Back
                  </Button>
                  <Button
                    onClick={submitTest}
                    disabled={isSubmitting}
                    className="flex-1 bg-amber-600 hover:bg-amber-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                      </>
                    ) : (
                      "Submit Anyway"
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
      const answer = answers.nepali?.[`q${q.questionNumber}`]
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
              <h3 className="font-semibold text-slate-800 text-sm sm:text-base">नेपाली परीक्षा प्रगति</h3>
              <span className="text-xs text-slate-600">{calculateOverallProgress()}% पूर्ण</span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              {lastSaved && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Save className="h-3 w-3" />
                  <span>सुरक्षित {formatSavedTime(lastSaved)}</span>
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
            <span>{answeredQuestions} / {totalQuestions} प्रश्नहरू उत्तर दिइएको</span>
            <span className="font-medium">{calculateOverallProgress()}%</span>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {questions.nepaliQuestions.map((question: any, index: number) => (
            <NepaliQuestionRenderer
              key={question.questionNumber}
              question={question}
              answer={answers.nepali?.[`q${question.questionNumber}`]}
              onAnswerChange={handleNepaliAnswerChange}
              questionIndex={index}
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
                <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> पेश गर्दै...
              </>
            ) : (
              <>
                <Trophy className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> परीक्षा पेश गर्नुहोस् ({answeredQuestions}/{totalQuestions})
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
                <h3 className="text-xl font-bold text-slate-800 mb-2">अपूर्ण परीक्षा</h3>
                <p className="text-slate-600 mb-4">
                  तपाईंले {getIncompleteQuestions().incomplete} प्रश्नहरू उत्तर दिनुभएको छैन ({getIncompleteQuestions().total} मध्ये)।
                </p>
                <p className="text-sm text-slate-500 mb-6">
                  के तपाईं अहिले आफ्नो परीक्षा पेश गर्न चाहनुहुन्छ?
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => setShowSubmitWarning(false)} variant="outline" className="flex-1">
                    फिर्ता जानुहोस्
                  </Button>
                  <Button
                    onClick={submitTest}
                    disabled={isSubmitting}
                    className="flex-1 bg-amber-600 hover:bg-amber-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> पेश गर्दै...
                      </>
                    ) : (
                      "पेश गर्नुहोस्"
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
              <h3 className="font-semibold text-slate-800 text-sm sm:text-base">सामाजिक अध्ययन परीक्षा</h3>
              <span className="text-xs text-slate-600">{calculateOverallProgress()}% पूरा भयो</span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              {lastSaved && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Save className="h-3 w-3" />
                  <span>सुरक्षित {formatSavedTime(lastSaved)}</span>
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
            <span>{answeredQuestions} मध्ये {totalQuestions} प्रश्नहरूको उत्तर दिइयो</span>
            <span className="font-medium">{calculateOverallProgress()}%</span>
          </div>
        </div>

        {/* Group Tabs */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full mb-4" style={{ gridTemplateColumns: `repeat(${questions.socialStudiesGroups.length}, 1fr)` }}>
            {questions.socialStudiesGroups.map((group: any, index: number) => {
              // Match colors to SocialStudiesGroupRenderer: blue, green, purple
              const tabBgColors = [
                "data-[state=active]:bg-blue-600",
                "data-[state=active]:bg-green-600",
                "data-[state=active]:bg-purple-600",
              ]
              const isActive = currentTab === `socialStudies_${index}`
              return (
                <TabsTrigger
                  key={`socialStudies_${index}`}
                  value={`socialStudies_${index}`}
                  className={`text-xs sm:text-sm ${tabBgColors[index % tabBgColors.length]} font-medium`}
                  style={{ color: isActive ? 'white' : undefined }}
                >
                  {group.groupName}
                </TabsTrigger>
              )
            })}
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
                  अर्को खण्ड →
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
                <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> पठाउँदै छ...
              </>
            ) : (
              <>
                <Trophy className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> परीक्षा पठाउनुहोस् ({answeredQuestions}/{totalQuestions})
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
                <h3 className="text-xl font-bold text-slate-800 mb-2">अपूर्ण परीक्षा</h3>
                <p className="text-slate-600 mb-4">
                  तपाईंले {getIncompleteQuestions().incomplete} प्रश्नहरूको उत्तर दिनुभएको छैन।
                </p>
                <p className="text-sm text-slate-500 mb-6">
                  के तपाईं अहिले आफ्नो परीक्षा पठाउन चाहनुहुन्छ?
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => setShowSubmitWarning(false)} variant="outline" className="flex-1">
                    पछाडि जानुहोस्
                  </Button>
                  <Button
                    onClick={submitTest}
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> पठाउँदै छ...
                      </>
                    ) : (
                      "पठाउनुहोस्"
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
    <div className="px-3 sm:px-0">
      {/* Progress Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-white/20 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-800 text-sm sm:text-base">Overall Progress</h3>
            <span className="text-xs text-slate-600">{calculateOverallProgress()}% Complete</span>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            {lastSaved && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <Save className="h-3 w-3" />
                <span>Saved {formatSavedTime(lastSaved)}</span>
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
              return `${totalAnswered} of ${totalQuestions} questions answered`
            })()}
          </span>
          <span className="font-medium">{calculateOverallProgress()}%</span>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          {questions.groupA.length > 0 && (
            <TabsTrigger value="groupA" className="text-xs sm:text-sm">
              Group A ({questions.groupA.length})
            </TabsTrigger>
          )}
          {questions.groupB.length > 0 && (
            <TabsTrigger value="groupB" className="text-xs sm:text-sm">
              Group B ({questions.groupB.length})
            </TabsTrigger>
          )}
          {questions.groupC.length > 0 && (
            <TabsTrigger value="groupC" className="text-xs sm:text-sm">
              Group C ({questions.groupC.length})
            </TabsTrigger>
          )}
          {questions.groupD.length > 0 && (
            <TabsTrigger value="groupD" className="text-xs sm:text-sm">
              Group D ({questions.groupD.length})
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
              {isLastSection() ? "Submitting..." : "Grading..."}
            </>
          ) : (
            <>
              <Trophy className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              {isLastSection() ? "Submit Test" : "Submit & Grade"} ({(() => {
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
            Next Section →
          </Button>
        )}
      </div>

      {/* Submit Warning Dialog */}
      {showSubmitWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <Trophy className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">Incomplete Test</h3>
              <p className="text-slate-600 mb-4">
                You have {getIncompleteQuestions().incomplete} unanswered questions out of{" "}
                {getIncompleteQuestions().total} total questions.
              </p>
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to submit your test now? You can still go back and answer more questions.
              </p>
              <div className="flex gap-3">
                <Button onClick={() => setShowSubmitWarning(false)} variant="outline" className="flex-1">
                  Go Back
                </Button>
                <Button onClick={submitTest} disabled={isSubmitting} className="flex-1 bg-amber-600 hover:bg-amber-700">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    "Submit Anyway"
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
