"use client"

export function VersionIndicator() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-black/80 text-white text-xs px-2 py-1 rounded-md font-mono backdrop-blur-sm">
        v1.0.5
      </div>
    </div>
  )
}
