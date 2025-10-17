"use client"

export function VersionIndicator() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-red-600 text-white text-sm px-3 py-2 rounded-lg font-mono backdrop-blur-sm shadow-lg border-2 border-white">
        v1.0.4
      </div>
    </div>
  )
}
