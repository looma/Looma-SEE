"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle, UserX } from "lucide-react"
import { setAuthState } from "@/lib/storage"

type LoginStep = "choice" | "email" | "login" | "otp" | "verifying"

interface StudentLoginProps {
  onLogin: (studentId: string, isAuthenticated: boolean, email?: string) => void
}

export function StudentLogin({ onLogin }: StudentLoginProps) {
  const [step, setStep] = useState<LoginStep>("choice")
  const [email, setEmail] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [canResend, setCanResend] = useState(false)
  const [resendTimer, setResendTimer] = useState(60)
  const otpInputRef = useRef<HTMLInputElement>(null)

  // Handle resend timer
  useEffect(() => {
    if (step === "otp" && resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    } else if (resendTimer === 0) {
      setCanResend(true)
    }
  }, [step, resendTimer])

  // Focus OTP input when entering OTP step
  useEffect(() => {
    if (step === "otp" && otpInputRef.current) {
      otpInputRef.current.focus()
    }
  }, [step])

  const handleContinueAsGuest = () => {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    setAuthState({ isAuthenticated: false, email: null })
    onLogin(guestId, false)
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        // If user already has a valid code, redirect to login step
        if (data.hasExistingCode) {
          setSuccess("You already have a code! Enter it below to log in.")
          setStep("login")
          setIsLoading(false)
          return
        }
        setError(data.error || "Failed to send code")
        setIsLoading(false)
        return
      }

      setSuccess("Code sent! Check your email.")
      setStep("otp")
      setResendTimer(60)
      setCanResend(false)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otpCode.length !== 6) return

    setIsLoading(true)
    setError(null)
    setStep("verifying")

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: otpCode }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Invalid code")
        setStep("otp")
        setIsLoading(false)
        return
      }

      // Success! Set auth state and proceed
      setAuthState({ isAuthenticated: true, email: data.email })
      setSuccess("Verified successfully!")

      // Short delay to show success
      setTimeout(() => {
        onLogin(data.email, true, data.email)
      }, 500)
    } catch {
      setError("Network error. Please try again.")
      setStep("otp")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!canResend) return

    setCanResend(false)
    setResendTimer(60)
    setError(null)

    try {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to resend code")
        setCanResend(true)
        return
      }

      setSuccess("New code sent!")
      setOtpCode("")
    } catch {
      setError("Network error. Please try again.")
      setCanResend(true)
    }
  }

  const handleBack = () => {
    setError(null)
    setSuccess(null)
    if (step === "otp") {
      setStep("email")
      setOtpCode("")
    } else if (step === "email") {
      setStep("choice")
      setEmail("")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 flex items-center justify-center p-3 sm:p-4" suppressHydrationWarning>
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-60 h-60 sm:w-80 sm:h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-60 h-60 sm:w-80 sm:h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-60 h-60 sm:w-80 sm:h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <Card className="w-full max-w-sm sm:max-w-md bg-white/90 backdrop-blur-sm shadow-2xl border border-white/20 relative z-10">
        <CardHeader className="text-center bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-t-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-2">
            <CardTitle className="text-xl sm:text-2xl font-bold">SEE Exam Practice</CardTitle>
          </div>
          <p className="text-yellow-100 text-sm sm:text-base">SEE परीक्षा अभ्यास</p>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {/* Choice Step */}
          {step === "choice" && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-slate-700 mb-1">Welcome! / स्वागत छ!</h3>
                <p className="text-sm text-slate-500">Choose how you'd like to continue</p>
              </div>

              {/* Primary: Log in with existing code */}
              <Button
                onClick={() => setStep("login")}
                className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white py-6 text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Mail className="mr-2 h-5 w-5" />
                Log in with my code
              </Button>
              <p className="text-xs text-center text-slate-500 -mt-2">
                Already have a code? / पहिले कोड छ?
              </p>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-slate-400">or / वा</span>
                </div>
              </div>

              {/* Secondary: Get a new code */}
              <Button
                onClick={async () => {
                  setStep("email")
                  // Will automatically be in "email" step where they can request a code
                }}
                variant="outline"
                className="w-full border-2 border-amber-300 text-amber-700 hover:bg-amber-50 py-5 text-base rounded-xl transition-all duration-300"
              >
                <Mail className="mr-2 h-5 w-5" />
                New user? Get a code
              </Button>
              <p className="text-xs text-center text-slate-500 -mt-2">
                First time? We'll email you a code / पहिलो पटक? कोड पठाउनुहोस्
              </p>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-slate-400">or / वा</span>
                </div>
              </div>

              {/* Tertiary: Continue as guest */}
              <Button
                onClick={handleContinueAsGuest}
                variant="ghost"
                className="w-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 py-4 text-sm rounded-xl transition-all duration-300"
              >
                <UserX className="mr-2 h-4 w-4" />
                Continue without signing in
              </Button>
              <p className="text-xs text-center text-slate-400 -mt-2">
                Progress saved only in this browser
              </p>
            </div>
          )}

          {/* Email Step */}
          {step === "email" && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-slate-500 hover:text-slate-700 -ml-2"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Button>

              <div className="space-y-3">
                <Label htmlFor="email" className="text-base font-semibold flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-2 focus:border-yellow-400 text-base py-3 min-h-[48px]"
                  disabled={isLoading}
                />
                <p className="text-xs text-slate-500">
                  We'll send you a one-time code to verify your email
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white py-4 text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={!email.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Code"
                )}
              </Button>

              {/* Option to use existing code */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep("login")
                    setError(null)
                    setSuccess(null)
                  }}
                  className="text-sm text-amber-600 hover:text-amber-700 hover:underline"
                >
                  I already have a code
                </button>
                <p className="text-xs text-slate-400 mt-1">
                  म सँग पहिले नै कोड छ
                </p>
              </div>
            </form>
          )}

          {/* Login Step - For returning users with existing code */}
          {step === "login" && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStep("choice")
                  setEmail("")
                  setOtpCode("")
                  setError(null)
                  setSuccess(null)
                }}
                className="text-slate-500 hover:text-slate-700 -ml-2"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Button>

              <div className="text-center mb-2">
                <h4 className="font-semibold text-slate-700">Welcome back! / स्वागतम्!</h4>
                <p className="text-sm text-slate-500">Enter your email and code</p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="login-email" className="text-base font-semibold flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-2 focus:border-yellow-400 text-base py-3 min-h-[48px]"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="login-code" className="text-base font-semibold">
                  Your Code / तपाईंको कोड
                </Label>
                <Input
                  id="login-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="Enter your 6-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  className="border-2 focus:border-yellow-400 text-base py-3 min-h-[48px] text-center text-xl tracking-widest font-mono"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  {success}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white py-4 text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={!email.trim() || otpCode.length !== 6 || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Log In"
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-slate-500 mb-2">Don't have a code? / कोड छैन?</p>
                <button
                  type="button"
                  onClick={() => {
                    setStep("email")
                    setOtpCode("")
                    setError(null)
                    setSuccess(null)
                  }}
                  className="text-sm text-amber-600 hover:text-amber-700 hover:underline font-medium"
                >
                  Get a new code sent to your email
                </button>
              </div>
            </form>
          )}

          {/* OTP Step */}
          {(step === "otp" || step === "verifying") && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-slate-500 hover:text-slate-700 -ml-2"
                disabled={step === "verifying"}
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Button>

              <div className="text-center mb-2">
                <p className="text-sm text-slate-600">
                  Enter the 6-digit code sent to
                </p>
                <p className="font-medium text-slate-800">{email}</p>
                <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded-lg">
                  ⚠️ Check your spam/junk folder if you don't see it!
                </p>
              </div>

              <div className="space-y-3">
                <Input
                  ref={otpInputRef}
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="border-2 focus:border-yellow-400 text-2xl text-center tracking-[0.5em] py-4 min-h-[56px] font-mono"
                  disabled={step === "verifying"}
                />
              </div>

              {success && !error && (
                <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  {success}
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white py-4 text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={otpCode.length !== 6 || step === "verifying"}
              >
                {step === "verifying" ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Code"
                )}
              </Button>

              <div className="text-center">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                    disabled={step === "verifying"}
                  >
                    Resend code
                  </button>
                ) : (
                  <p className="text-slate-400 text-sm">
                    Resend code in {resendTimer}s
                  </p>
                )}
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
