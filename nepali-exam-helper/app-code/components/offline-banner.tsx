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
        <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white px-4 py-3 text-center shadow-lg animate-pulse">
            <div className="flex items-center justify-center gap-2 text-sm sm:text-base font-medium">
                <WifiOff className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span>
                    {language === "english"
                        ? "You are offline — some features may not work. Please check your internet connection."
                        : "तपाईं अफलाइन हुनुहुन्छ — केही सुविधाहरू काम नगर्न सक्छ। कृपया आफ्नो इन्टरनेट जडान जाँच गर्नुहोस्।"}
                </span>
            </div>
        </div>
    )
}
