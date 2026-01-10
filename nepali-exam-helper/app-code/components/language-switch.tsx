"use client"

import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage, getRecommendedLanguage, getSubjectFromTestId } from "@/lib/language-context"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function LanguageSwitch() {
    const { language, setLanguage, isLanguageSwitchEnabled, disabledReason, currentTestId } = useLanguage()

    const handleToggle = () => {
        if (!isLanguageSwitchEnabled) return
        setLanguage(language === "english" ? "nepali" : "english")
    }

    // Get recommendation for current test
    const recommendedLang = getRecommendedLanguage(currentTestId)
    const subject = getSubjectFromTestId(currentTestId)
    const showRecommendation = recommendedLang && recommendedLang !== language

    const buttonElement = (
        <Button
            onClick={handleToggle}
            variant="outline"
            size="sm"
            role="switch"
            aria-checked={language === "nepali"}
            aria-label={`Language: ${language === "english" ? "English" : "Nepali"}. Click to switch.`}
            className={`
        flex items-center gap-2
        px-3 py-2
        rounded-full
        shadow-lg
        border-2
        transition-all duration-300
        select-none
        ${isLanguageSwitchEnabled
                    ? "bg-white/95 backdrop-blur-sm hover:bg-slate-50 border-slate-300 hover:border-slate-400 hover:shadow-xl cursor-pointer"
                    : "bg-slate-100 border-slate-200 cursor-not-allowed opacity-60"
                }
      `}
            disabled={!isLanguageSwitchEnabled}
        >
            <Globe className={`h-4 w-4 pointer-events-none ${isLanguageSwitchEnabled ? "text-blue-600" : "text-slate-400"}`} />
            <span className={`text-sm font-medium pointer-events-none ${isLanguageSwitchEnabled ? "text-slate-700" : "text-slate-400"}`}>
                {language === "english" ? (
                    <>
                        <span className="text-blue-600 font-black underline underline-offset-2 pointer-events-none">EN</span>
                        <span className="text-slate-400 mx-1 pointer-events-none">|</span>
                        <span className="text-slate-400 font-normal pointer-events-none">नेपाली</span>
                    </>
                ) : (
                    <>
                        <span className="text-slate-400 font-normal pointer-events-none">EN</span>
                        <span className="text-slate-400 mx-1 pointer-events-none">|</span>
                        <span className="text-blue-600 font-black underline underline-offset-2 pointer-events-none">नेपाली</span>
                    </>
                )}
            </span>
        </Button>
    )

    // Build tooltip content
    const getTooltipContent = () => {
        if (!isLanguageSwitchEnabled) {
            return disabledReason || "Language switching is disabled for this test."
        }
        if (showRecommendation && subject) {
            const langName = recommendedLang === "nepali" ? "Nepali" : "English"
            return `Tip: ${subject} tests are given in ${langName} on the actual SEE exam. Click to switch.`
        }
        return null
    }

    const tooltipContent = getTooltipContent()

    // Show tooltip when disabled OR when there's a recommendation
    if (!isLanguageSwitchEnabled || tooltipContent) {
        return (
            <TooltipProvider>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start gap-1">
                            {showRecommendation && (
                                <div className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full border border-amber-300 shadow-sm">
                                    {recommendedLang === "nepali"
                                        ? "नेपाली — matches actual SEE exam"
                                        : "EN — matches actual SEE exam"}
                                </div>
                            )}
                            {buttonElement}
                        </div>
                    </TooltipTrigger>
                    {tooltipContent && (
                        <TooltipContent side="top" className="max-w-xs">
                            <p className="text-sm">{tooltipContent}</p>
                        </TooltipContent>
                    )}
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
