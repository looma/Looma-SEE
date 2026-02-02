export interface StudentProgress {
  studentId: string
  testId: string
  answers: {
    // Science test format (optional - not all tests use this)
    groupA?: Record<string, string>
    groupB?: Record<string, string>
    groupC?: Record<string, string>
    groupD?: Record<string, string>
    // Math/Nepali/English/Social Studies may use different structures
    // Math: { [questionNumber]: { [subLabel]: answer } }
    // Nepali/Social: { [questionId]: answer }
    // English: { [questionId]: { ... } }
    [questionId: string]: any
  }
  currentTab: string
  lastUpdated?: string  // Optional since it's added by saveStudentProgress
  attempts: AttemptHistory[]
  elapsedTimeSeconds?: number  // Timer state in seconds
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
  timeTakenSeconds?: number  // Time spent on this attempt
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
    // Normalize studentId (email) to ensure consistency with server
    const normalizedStudentId = studentId.toLowerCase().trim()
    const progressWithTimestamp = {
      ...progress,
      lastUpdated: new Date().toISOString(),
    }
    const storageKey = `${STORAGE_KEY_PREFIX}${normalizedStudentId}_${progress.testId}`

    console.log(`💾 Saving to localStorage key: ${storageKey}`)
    localStorage.setItem(storageKey, JSON.stringify(progressWithTimestamp))
    console.log(`✅ Successfully saved progress for ${normalizedStudentId}_${progress.testId}`)
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
    // Normalize the studentId part (email) to ensure consistency with server
    const normalizedKey = studentIdWithTest.toLowerCase().trim()
    const storageKey = `${STORAGE_KEY_PREFIX}${normalizedKey}`
    console.log(`📖 Loading from localStorage key: ${storageKey}`)

    const stored = localStorage.getItem(storageKey)
    if (stored) {
      const parsed = JSON.parse(stored)

      // Handle backward compatibility: convert old format to new format
      if (parsed.answersA || parsed.answersB || parsed.answersC || parsed.answersD) {
        parsed.answers = {
          groupA: parsed.answersA || parsed.answers?.groupA || {},
          groupB: parsed.answersB || parsed.answers?.groupB || {},
          groupC: parsed.answersC || parsed.answers?.groupC || {},
          groupD: parsed.answersD || parsed.answers?.groupD || {},
          // Preserve any existing English answers
          ...(parsed.answers || {})
        }
        // Remove old format fields
        delete parsed.answersA
        delete parsed.answersB
        delete parsed.answersC
        delete parsed.answersD
      }

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

// ============================================================
// Server Sync Functions for Authenticated Users
// ============================================================

const AUTH_KEY = "see_auth_state"

export interface AuthState {
  isAuthenticated: boolean
  email: string | null
}

export function getAuthState(): AuthState {
  if (!isClientSide()) {
    return { isAuthenticated: false, email: null }
  }

  try {
    const stored = localStorage.getItem(AUTH_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error("❌ Failed to get auth state:", error)
  }

  return { isAuthenticated: false, email: null }
}

export function setAuthState(state: AuthState): void {
  if (!isClientSide()) return

  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(state))
    console.log(`✅ Auth state updated: ${state.isAuthenticated ? state.email : "logged out"}`)
  } catch (error) {
    console.error("❌ Failed to save auth state:", error)
  }
}

export function clearAuthState(): void {
  if (!isClientSide()) return

  try {
    localStorage.removeItem(AUTH_KEY)
    console.log("✅ Auth state cleared")
  } catch (error) {
    console.error("❌ Failed to clear auth state:", error)
  }
}

export async function syncProgressToServer(
  email: string,
  progress: Omit<StudentProgress, "lastUpdated">
): Promise<boolean> {
  try {
    const response = await fetch("/api/progress/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, progress }),
    })

    if (!response.ok) {
      console.error("❌ Server sync failed:", response.statusText)
      return false
    }

    console.log(`☁️ Progress synced to server for ${email}`)
    return true
  } catch (error) {
    console.error("❌ Server sync error:", error)
    return false
  }
}

export async function loadProgressFromServer(
  email: string,
  testId?: string
): Promise<StudentProgress | StudentProgress[] | null> {
  try {
    const url = new URL("/api/progress/load", window.location.origin)
    url.searchParams.set("email", email)
    if (testId) {
      url.searchParams.set("testId", testId)
    }

    const response = await fetch(url.toString())

    if (!response.ok) {
      console.error("❌ Failed to load server progress:", response.statusText)
      return null
    }

    const data = await response.json()
    if (data.success && data.progress) {
      console.log(`☁️ Progress loaded from server for ${email}`)
      return data.progress
    }

    return null
  } catch (error) {
    console.error("❌ Load server progress error:", error)
    return null
  }
}

// Helper to check if user is a guest (not authenticated)
export function isGuestUser(studentId: string): boolean {
  return studentId.startsWith("guest_")
}
