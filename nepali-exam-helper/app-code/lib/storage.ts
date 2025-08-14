export interface StudentProgress {
  studentId: string
  testId: string
  answersA: Record<string, string>
  answersB: Record<string, string>
  answersC: Record<string, string>
  answersD: Record<string, string>
  currentTab: string
  lastUpdated: string
  attempts: AttemptHistory[]
}

export interface AttemptHistory {
  id: string
  timestamp: string
  testId: string
  scoreA: number
  scoreB: number
  scoreC: number
  scoreD: number
  totalScore: number
  maxScore: number
  percentage: number
  grade: string
}

const STORAGE_KEY_PREFIX = "see_practice_"

// Helper to check if we're on the client side
function isClientSide(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined"
}

export function saveStudentProgress(studentId: string, progress: Omit<StudentProgress, "lastUpdated">): void {
  if (!isClientSide()) {
    console.warn("⚠️  Attempted to save progress on server side - skipping")
    return
  }

  try {
    const progressWithTimestamp = { ...progress, lastUpdated: new Date().toISOString() }
    const storageKey = `${STORAGE_KEY_PREFIX}${studentId}_${progress.testId}`

    console.log(`💾 Saving to localStorage key: ${storageKey}`)
    localStorage.setItem(storageKey, JSON.stringify(progressWithTimestamp))
    console.log(`✅ Successfully saved progress for ${studentId}_${progress.testId}`)
  } catch (error) {
    console.error("❌ Failed to save progress:", error)
  }
}

export function loadStudentProgress(studentIdWithTest: string): StudentProgress | null {
  if (!isClientSide()) {
    console.warn("⚠️  Attempted to load progress on server side - returning null")
    return null
  }

  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${studentIdWithTest}`
    console.log(`📖 Loading from localStorage key: ${storageKey}`)

    const stored = localStorage.getItem(storageKey)
    if (stored) {
      const parsed = JSON.parse(stored)
      console.log(`✅ Successfully loaded progress for ${studentIdWithTest}`)
      return parsed
    } else {
      console.log(`ℹ️  No stored progress found for ${studentIdWithTest}`)
      return null
    }
  } catch (error) {
    console.error("❌ Failed to load progress:", error)
    return null
  }
}

export function saveAttemptHistory(
  studentId: string,
  testId: string,
  attempt: Omit<AttemptHistory, "id" | "timestamp" | "testId">,
): void {
  if (!isClientSide()) {
    console.warn("⚠️  Attempted to save attempt history on server side - skipping")
    return
  }

  try {
    const storageKey = `${studentId}_${testId}`
    const progress = loadStudentProgress(storageKey)
    if (progress) {
      const newAttempt: AttemptHistory = {
        ...attempt,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        testId,
      }
      progress.attempts = progress.attempts || []
      progress.attempts.push(newAttempt)
      if (progress.attempts.length > 10) progress.attempts = progress.attempts.slice(-10)
      saveStudentProgress(studentId, progress)
    }
  } catch (error) {
    console.error("❌ Failed to save attempt history:", error)
  }
}
