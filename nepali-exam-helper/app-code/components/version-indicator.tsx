"use client"

export function VersionIndicator() {
  return (
    <div className="fixed bottom-4 right-4 z-50 version-indicator-wrapper">
      <div
        className="version-indicator text-xs px-2 py-1 rounded-md font-mono backdrop-blur-sm"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: '#ffffff !important'
        } as React.CSSProperties}
      >
        <span style={{ color: '#ffffff' }}>v1.1.2</span>
      </div>
    </div>
  )
}
