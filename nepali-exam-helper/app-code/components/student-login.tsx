"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle, UserX } from "lucide-react"
import { setAuthState } from "@/lib/storage"
import { useLanguage } from "@/lib/language-context"

type LoginStep = "choice" | "email" | "otp" | "verifying"

interface StudentLoginProps {
  onLogin: (studentId: string, isAuthenticated: boolean, email?: string) => void
}

export function StudentLogin({ onLogin }: StudentLoginProps) {
  const { language } = useLanguage()
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
            <CardTitle className="text-xl sm:text-2xl font-bold">
              {language === "english" ? "SEE Exam Practice" : "SEE परीक्षा अभ्यास"}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {/* Choice Step */}
          {step === "choice" && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  {language === "english" ? "Welcome!" : "स्वागत छ!"}
                </h3>
                <p className="text-sm text-slate-500">
                  {language === "english" ? "Choose how you'd like to continue" : "तपाईं कसरी जारी राख्न चाहनुहुन्छ छनौट गर्नुहोस्"}
                </p>
              </div>

              <Button
                onClick={() => setStep("email")}
                className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white py-6 text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Mail className="mr-2 h-5 w-5" />
                {language === "english" ? "Sign in with Email" : "इमेलमार्फत साइन इन गर्नुहोस्"}
              </Button>
              <p className="text-xs text-center text-slate-500 -mt-1">
                {language === "english" ? "We'll send you a login code" : "हामी तपाईंलाई कोड पठाउनेछौं"}
              </p>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-slate-400">
                    {language === "english" ? "or" : "वा"}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleContinueAsGuest}
                variant="outline"
                className="w-full border-2 border-slate-200 hover:border-amber-300 hover:bg-amber-50 py-6 text-base rounded-xl transition-all duration-300"
              >
                <UserX className="mr-2 h-5 w-5 text-slate-500" />
                {language === "english" ? "Continue without signing in" : "साइन इन नगरी जारी राख्नुहोस्"}
              </Button>
              <p className="text-xs text-center text-slate-400 -mt-1">
                {language === "english" ? "Progress saved only in this browser" : "प्रगति यस ब्राउजरमा मात्र सुरक्षित"}
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
                {language === "english" ? "Back" : "पछाडि"}
              </Button>

              <div className="space-y-3">
                <Label htmlFor="email" className="text-base font-semibold flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {language === "english" ? "Email Address" : "इमेल ठेगाना"}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={language === "english" ? "Enter your email" : "आफ्नो इमेल प्रविष्ट गर्नुहोस्"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-2 focus:border-yellow-400 text-base py-3 min-h-[48px]"
                  disabled={isLoading}
                />
                <p className="text-xs text-slate-500">
                  {language === "english"
                    ? "We'll send you a one-time code to verify (expires in 15 min)"
                    : "हामी तपाईंलाई एकपटक प्रयोग हुने कोड पठाउनेछौं (१५ मिनेटमा समाप्त)"}
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
                    {language === "english" ? "Sending..." : "पठाउँदै..."}
                  </>
                ) : (
                  language === "english" ? "Send Code" : "कोड पठाउनुहोस्"
                )}
              </Button>
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
                {language === "english" ? "Back" : "पछाडि"}
              </Button>

              <div className="text-center mb-2">
                <p className="text-sm text-slate-600">
                  {language === "english" ? "Enter the 6-digit code sent to" : "यो इमेलमा पठाइएको ६ अंकको कोड प्रविष्ट गर्नुहोस्"}
                </p>
                <p className="font-medium text-slate-800">{email}</p>
                <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded-lg">
                  ⚠️ {language === "english"
                    ? "Check your spam/junk folder if you don't see it!"
                    : "तपाईंले देख्नुभएन भने स्प्याम/जंक फोल्डर जाँच गर्नुहोस्!"}
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
                    {language === "english" ? "Verifying..." : "प्रमाणित गर्दै..."}
                  </>
                ) : (
                  language === "english" ? "Verify Code" : "कोड प्रमाणित गर्नुहोस्"
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
                    {language === "english" ? "Resend code" : "कोड पुन: पठाउनुहोस्"}
                  </button>
                ) : (
                  <p className="text-slate-400 text-sm">
                    {language === "english"
                      ? `Resend code in ${resendTimer}s`
                      : `${resendTimer} सेकेन्डमा पुन: पठाउनुहोस्`}
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
