"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Loader2, Trophy, Save } from "lucide-react"
import { GroupA } from "./group-a"
import { FreeResponseGroup } from "./free-response-group"
import { EnglishQuestionRenderer } from "./english-question-renderer"
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
    if (!isEnglishTest && !currentTab) {
      setCurrentTab(getFirstAvailableSection())
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
        if (typeof answer === "object" && !Array.isArray(answer)) {
          return Object.values(answer).some((val) => val !== undefined && val !== null && val !== "")
        }
        return answer !== undefined && answer !== null && answer !== ""
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
        if (typeof answer === "object" && !Array.isArray(answer)) {
          return !Object.values(answer).some((val) => val !== undefined && val !== null && val !== "")
        }
        return answer === undefined || answer === null || answer === ""
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
                if (section.subQuestions) {
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
                      gradingPromises.push(
                        fetch("/api/grade", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            question: `Fill in the blank (${gapId}): ${(question as any).passage}`,
                            answer: gapAnswer,
                            marks: (question as any).marks && gaps.length ? Math.round(((question as any).marks / gaps.length) * 10) / 10 : 1,
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
  const isEmpty =
    !isEnglishTest &&
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
                  if (typeof answer === "object" && !Array.isArray(answer)) {
                    return Object.values(answer).some((val) => val !== undefined && val !== null && val !== "")
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
            className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white px-6 sm:px-8 py-4 sm:py-3 rounded-xl disabled:opacity-50 w-full sm:w-auto min-h-[56px] text-sm sm:text-base"
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
                    if (typeof answer === "object" && !Array.isArray(answer)) {
                      return Object.values(answer).some((val) => val !== undefined && val !== null && val !== "")
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
          className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white px-6 sm:px-8 py-4 sm:py-3 rounded-xl disabled:opacity-50 w-full sm:w-auto min-h-[56px] text-sm sm:text-base"
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
