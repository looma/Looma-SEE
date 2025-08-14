"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Key, RefreshCw, Zap } from "lucide-react"

export function ApiKeyChecker() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testGrading = async () => {
    setLoading(true)
    try {
      // Test the actual grading endpoint with a simple question
      const response = await fetch("/api/grade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: "What is 2 + 2?",
          answer: "4",
          marks: 1,
        }),
      })

      const data = await response.json()

      if (response.ok && data.score !== undefined) {
        setStatus({
          status: "✅ WORKING",
          message: "AI grading is working perfectly!",
          testResult: `Test question graded: ${data.score}/1 marks`,
          feedback: data.feedback,
        })
      } else {
        setStatus({
          status: "❌ ERROR",
          message: "AI grading failed",
          error: data.error || "Unknown error",
          code: data.code,
        })
      }
    } catch (error) {
      setStatus({
        status: "❌ ERROR",
        message: "Failed to test AI grading",
        error: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    if (status?.includes("✅")) return "bg-green-50 border-green-200 text-green-800"
    if (status?.includes("❌")) return "bg-red-50 border-red-200 text-red-800"
    return "bg-yellow-50 border-yellow-200 text-yellow-800"
  }

  const getStatusIcon = (status: string) => {
    if (status?.includes("✅")) return <CheckCircle className="h-5 w-5 text-green-600" />
    if (status?.includes("❌")) return <AlertCircle className="h-5 w-5 text-red-600" />
    return <Key className="h-5 w-5 text-yellow-600" />
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          AI Grading System Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testGrading} disabled={loading} className="flex items-center gap-2">
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {loading ? "Testing..." : "Test AI Grading"}
          </Button>
        </div>

        {status && (
          <div className={`p-4 rounded-lg border ${getStatusColor(status.status)}`}>
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon(status.status)}
              <Badge variant="outline">{status.status}</Badge>
            </div>
            <p className="font-medium mb-2">{status.message}</p>

            {status.testResult && (
              <div className="mt-2 p-2 bg-green-100 rounded text-sm">
                <strong>Test Result:</strong> {status.testResult}
              </div>
            )}

            {status.feedback && (
              <div className="mt-2 p-2 bg-blue-100 rounded text-sm">
                <strong>AI Feedback:</strong> {status.feedback}
              </div>
            )}

            {status.error && (
              <div className="mt-2 p-2 bg-red-100 rounded text-sm">
                <strong>Error:</strong> {status.error}
                {status.code && <div className="text-xs mt-1">Code: {status.code}</div>}
              </div>
            )}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">How this works:</h4>
          <p className="text-sm text-blue-700 mb-2">
            This tests the actual AI grading endpoint that your exam app uses.
          </p>
          <p className="text-sm text-blue-700">If this works, then AI grading will work in your exam submissions.</p>
        </div>
      </CardContent>
    </Card>
  )
}
