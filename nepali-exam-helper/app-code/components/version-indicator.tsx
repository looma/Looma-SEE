"use client"

import { useLanguage } from "@/lib/language-context"
import { MessageSquare } from "lucide-react"

export function VersionIndicator() {
  const { language } = useLanguage()

  return (
    <div className="fixed bottom-6 right-4 z-50 version-indicator-wrapper flex flex-col items-end gap-2">
      <div
        className="version-indicator text-xs px-2 py-1 rounded-md font-mono backdrop-blur-sm hidden sm:block"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: '#ffffff !important'
        } as React.CSSProperties}
      >
        <span style={{ color: '#ffffff' }}>v1.5.5</span>
      </div>
      <a
        href="https://forms.gle/fCkdAsDsoDCfcptx7"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-full shadow-lg border-2 transition-all duration-300 select-none hover:shadow-xl"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#cbd5e1',
        } as React.CSSProperties}
      >
        <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: '#2563eb' }} />
        <span className="text-xs sm:text-sm font-medium" style={{ color: '#334155' }}>
          {language === 'english' ? 'Feedback' : 'प्रतिक्रिया'}
        </span>
      </a>
    </div>
  )
}
