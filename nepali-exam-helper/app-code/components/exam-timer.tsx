"use client"

import { Clock, Pause, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ExamTimerProps {
    elapsedSeconds: number
    allocatedMinutes: number
    isPaused: boolean
    onTogglePause: () => void
    language: 'english' | 'nepali'
}

export function formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function ExamTimer({
    elapsedSeconds,
    allocatedMinutes,
    isPaused,
    onTogglePause,
    language,
}: ExamTimerProps) {
    const allocatedSeconds = allocatedMinutes * 60
    const percentUsed = (elapsedSeconds / allocatedSeconds) * 100

    // Determine color based on time usage
    const getTimerColor = () => {
        if (percentUsed >= 100) return 'text-red-600 bg-red-50 border-red-200'
        if (percentUsed >= 80) return 'text-amber-600 bg-amber-50 border-amber-200'
        return 'text-green-600 bg-green-50 border-green-200'
    }

    const getIconColor = () => {
        if (percentUsed >= 100) return 'text-red-500'
        if (percentUsed >= 80) return 'text-amber-500'
        return 'text-green-500'
    }

    const uiText = {
        timeElapsed: language === 'english' ? 'Time' : 'समय',
        of: language === 'english' ? 'of' : 'मा',
        min: language === 'english' ? 'min' : 'मिनेट',
        paused: language === 'english' ? 'Paused' : 'रोकिएको',
        pauseLabel: language === 'english' ? 'Pause' : 'रोक्नुहोस्',
        resumeLabel: language === 'english' ? 'Resume' : 'जारी राख्नुहोस्',
    }

    return (
        <div className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
            getTimerColor(),
            percentUsed >= 100 && "animate-pulse"
        )}>
            <Clock className={cn("h-4 w-4", getIconColor())} />

            <div className="flex items-center gap-1.5 text-sm font-medium">
                <span className="tabular-nums">{formatTime(elapsedSeconds)}</span>
                <span className="text-slate-400">/</span>
                <span className="text-slate-500">{allocatedMinutes} {uiText.min}</span>
            </div>

            {isPaused && (
                <span className="text-xs font-medium px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded">
                    {uiText.paused}
                </span>
            )}

            <Button
                variant="ghost"
                size="sm"
                onClick={onTogglePause}
                className="h-7 w-7 p-0 ml-1"
                title={isPaused ? uiText.resumeLabel : uiText.pauseLabel}
            >
                {isPaused ? (
                    <Play className="h-3.5 w-3.5" />
                ) : (
                    <Pause className="h-3.5 w-3.5" />
                )}
            </Button>
        </div>
    )
}
