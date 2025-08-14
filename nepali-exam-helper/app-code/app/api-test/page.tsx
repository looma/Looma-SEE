import { ApiKeyChecker } from "@/components/api-key-checker"

export default function ApiTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">AI Grading System Test</h1>
          <p className="text-slate-600">Test if AI grading is working for your exam app</p>
        </div>

        <ApiKeyChecker />

        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Main App
          </a>
        </div>
      </div>
    </div>
  )
}
