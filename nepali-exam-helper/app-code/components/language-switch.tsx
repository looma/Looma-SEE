"use client"

import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function LanguageSwitch() {
    const { language, setLanguage, isLanguageSwitchEnabled, disabledReason } = useLanguage()

    const handleToggle = () => {
        if (!isLanguageSwitchEnabled) return
        setLanguage(language === "english" ? "nepali" : "english")
    }

    const buttonElement = (
        <Button
            onClick={handleToggle}
            variant="outline"
            size="sm"
            className={`
        flex items-center gap-2
        px-3 py-2
        rounded-full
        shadow-lg
        border-2
        transition-all duration-300
        ${isLanguageSwitchEnabled
                    ? "bg-white/95 backdrop-blur-sm hover:bg-slate-50 border-slate-300 hover:border-slate-400 hover:shadow-xl cursor-pointer"
                    : "bg-slate-100 border-slate-200 cursor-not-allowed opacity-60 pointer-events-none"
                }
      `}
        >
            <Globe className={`h-4 w-4 ${isLanguageSwitchEnabled ? "text-blue-600" : "text-slate-400"}`} />
            <span className={`text-sm font-medium ${isLanguageSwitchEnabled ? "text-slate-700" : "text-slate-400"}`}>
                {language === "english" ? (
                    <>
                        <span className="text-blue-600 font-black text-base underline underline-offset-2">EN</span>
                        <span className="text-slate-400 mx-1">|</span>
                        <span className="text-slate-400 font-normal">नेपाली</span>
                    </>
                ) : (
                    <>
                        <span className="text-slate-400 font-normal">EN</span>
                        <span className="text-slate-400 mx-1">|</span>
                        <span className="text-blue-600 font-black text-base underline underline-offset-2">नेपाली</span>
                    </>
                )}
            </span>
        </Button>
    )

    // Show tooltip when disabled explaining why
    if (!isLanguageSwitchEnabled) {
        return (
            <TooltipProvider>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <div className="fixed bottom-4 left-4 z-50">
                            {buttonElement}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                        <p className="text-sm">
                            {disabledReason || "Language switching is disabled for this test."}
                        </p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    return (
        <div className="fixed bottom-4 left-4 z-50">
            {buttonElement}
        </div>
    )
}

