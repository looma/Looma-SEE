"use client"

import { useState, useEffect } from "react"
import { WifiOff } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export function OfflineBanner() {
    const [isOffline, setIsOffline] = useState(false)
    const { language } = useLanguage()

    useEffect(() => {
        // Check initial state
        setIsOffline(!navigator.onLine)

        const handleOnline = () => setIsOffline(false)
        const handleOffline = () => setIsOffline(true)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    if (!isOffline) return null

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2 shadow-md">
            <WifiOff className="h-4 w-4" />
            <span>
                {language === "english"
                    ? "You appear to be offline — your progress is being saved locally only"
                    : "तपाईं अफलाइन हुनुहुन्छ — तपाईंको प्रगति स्थानीय रूपमा मात्र सुरक्षित हुँदैछ"}
            </span>
        </div>
    )
}
