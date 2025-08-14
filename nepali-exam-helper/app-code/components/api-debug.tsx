"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Key, RefreshCw, Zap, Eye, EyeOff } from "lucide-react"

export function ApiDebug() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showKeys, setShowKeys] = useState(false)

  const testDirectOpenAI = async () => {
    setLoading(true)
    try {
      // Test the hardcoded key directly
      const hardcodedKey =
        "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"
      const envKey =
        "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"

      const testResults = {
        hardcodedKey: {
          preview: `${hardcodedKey.slice(0, 7)}...${hardcodedKey.slice(-4)}`,
          status: "unknown",
          error: null,
        },
        envKey: {
          preview: `${envKey.slice(0, 7)}...${envKey.slice(-4)}`,
          status: "unknown",
          error: null,
        },
        keysMatch: hardcodedKey === envKey,
      }

      // Test hardcoded key
      try {
        const response1 = await fetch("https://api.openai.com/v1/models", {
          headers: {
            Authorization: `Bearer ${hardcodedKey}`,
            "Content-Type": "application/json",
          },
        })

        if (response1.ok) {
          testResults.hardcodedKey.status = "✅ WORKING"
        } else {
          const errorText = await response1.text()
          testResults.hardcodedKey.status = "❌ FAILED"
          testResults.hardcodedKey.error = `${response1.status}: ${errorText}`
        }
      } catch (error) {
        testResults.hardcodedKey.status = "❌ ERROR"
        testResults.hardcodedKey.error = error.message
      }

      // Test env key
      try {
        const response2 = await fetch("https://api.openai.com/v1/models", {
          headers: {
            Authorization: `Bearer ${envKey}`,
            "Content-Type": "application/json",
          },
        })

        if (response2.ok) {
          testResults.envKey.status = "✅ WORKING"
        } else {
          const errorText = await response2.text()
          testResults.envKey.status = "❌ FAILED"
          testResults.envKey.error = `${response2.status}: ${errorText}`
        }
      } catch (error) {
        testResults.envKey.status = "❌ ERROR"
        testResults.envKey.error = error.message
      }

      setResults(testResults)
    } catch (error) {
      setResults({
        error: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const testGradingEndpoint = async () => {
    setLoading(true)
    try {
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

      setResults({
        gradingTest: {
          status: response.ok ? "✅ WORKING" : "❌ FAILED",
          statusCode: response.status,
          response: data,
          error: response.ok ? null : data.error,
        },
      })
    } catch (error) {
      setResults({
        gradingTest: {
          status: "❌ ERROR",
          error: error.message,
        },
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          API Key Debugging Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={testDirectOpenAI} disabled={loading} className="flex items-center gap-2">
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
            Test Both API Keys Directly
          </Button>

          <Button
            onClick={testGradingEndpoint}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2 bg-transparent"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            Test Grading Endpoint
          </Button>

          <Button onClick={() => setShowKeys(!showKeys)} variant="ghost" size="sm" className="flex items-center gap-2">
            {showKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showKeys ? "Hide" : "Show"} Keys
          </Button>
        </div>

        {results && (
          <div className="space-y-4">
            {results.hardcodedKey && results.envKey && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Hardcoded Key (in grade route)
                  </h3>
                  <div className="space-y-2">
                    <Badge variant={results.hardcodedKey.status.includes("✅") ? "default" : "destructive"}>
                      {results.hardcodedKey.status}
                    </Badge>
                    <p className="text-sm font-mono">
                      {showKeys ? "sk-proj-sLle6aRjW83Smv9K..." : results.hardcodedKey.preview}
                    </p>
                    {results.hardcodedKey.error && (
                      <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{results.hardcodedKey.error}</p>
                    )}
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    .env.local Key
                  </h3>
                  <div className="space-y-2">
                    <Badge variant={results.envKey.status.includes("✅") ? "default" : "destructive"}>
                      {results.envKey.status}
                    </Badge>
                    <p className="text-sm font-mono">
                      {showKeys ? "sk-proj-7J46NIjOGfS_xt7P..." : results.envKey.preview}
                    </p>
                    {results.envKey.error && (
                      <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{results.envKey.error}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {results.keysMatch !== undefined && (
              <div
                className={`p-4 rounded-lg border ${results.keysMatch ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
              >
                <div className="flex items-center gap-2">
                  {results.keysMatch ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-semibold ${results.keysMatch ? "text-green-800" : "text-red-800"}`}>
                    Keys {results.keysMatch ? "MATCH" : "DO NOT MATCH"}
                  </span>
                </div>
                {!results.keysMatch && (
                  <p className="text-sm text-red-700 mt-2">
                    🚨 This is the problem! The hardcoded key is different from your .env.local key.
                  </p>
                )}
              </div>
            )}

            {results.gradingTest && (
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Grading Endpoint Test</h3>
                <Badge variant={results.gradingTest.status.includes("✅") ? "default" : "destructive"}>
                  {results.gradingTest.status}
                </Badge>
                {results.gradingTest.statusCode && (
                  <p className="text-sm mt-2">Status Code: {results.gradingTest.statusCode}</p>
                )}
                {results.gradingTest.response && (
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                    {JSON.stringify(results.gradingTest.response, null, 2)}
                  </pre>
                )}
                {results.gradingTest.error && (
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded mt-2">{results.gradingTest.error}</p>
                )}
              </div>
            )}

            {results.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">Error: {results.error}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
