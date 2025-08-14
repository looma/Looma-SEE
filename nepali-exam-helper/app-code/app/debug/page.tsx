import { ApiDebug } from "@/components/api-debug"

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">API Key Debugging</h1>
          <p className="text-slate-600">Let's figure out what's wrong with your API keys</p>
        </div>

        <ApiDebug />

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
