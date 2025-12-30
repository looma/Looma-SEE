"use client"

import { Button } from "@/components/ui/button"
import { Mail, UserX, LogOut, RotateCcw } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

interface StudentHeaderProps {
  studentId: string
  onLogout: () => void
  onChangeTest?: () => void
  currentTestTitle?: string
  isAuthenticated?: boolean
  userEmail?: string
}

export function StudentHeader({
  studentId,
  onLogout,
  onChangeTest,
  currentTestTitle,
  isAuthenticated,
  userEmail,
}: StudentHeaderProps) {
  const { language } = useLanguage()
  const isGuest = studentId.startsWith("guest_")

  // Translations
  const t = {
    guestMode: language === "english" ? "Guest Mode" : "अतिथि मोड",
    progressLocal: language === "english" ? "Progress saved locally only" : "प्रगति स्थानीय रूपमा मात्र सुरक्षित",
    signedIn: language === "english" ? "Signed in · Progress synced" : "साइन इन · प्रगति सिंक भएको",
    currentTest: language === "english" ? "Current Test:" : "हालको परीक्षा:",
    changeTest: language === "english" ? "Change Test" : "परीक्षा बदल्नुहोस्",
    change: language === "english" ? "Change" : "बदल्नुहोस्",
    signOut: language === "english" ? "Sign Out" : "साइन आउट",
    exitGuest: language === "english" ? "Exit Guest" : "अतिथि बाहिर",
    out: language === "english" ? "Out" : "बाहिर",
    exit: language === "english" ? "Exit" : "बाहिर",
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-lg border border-white/20 mb-4 sm:mb-6 mx-3 sm:mx-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-shrink-0">
            {isAuthenticated ? (
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
            ) : (
              <UserX className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500" />
            )}
            <div>
              {isAuthenticated && userEmail ? (
                <>
                  <p className="font-semibold text-slate-800 text-sm sm:text-base">{userEmail}</p>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    {t.signedIn}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-slate-800 text-sm sm:text-base">{t.guestMode}</p>
                  <p className="text-xs text-amber-600">
                    {t.progressLocal}
                  </p>
                </>
              )}
            </div>
          </div>

          {currentTestTitle && (
            <div className="border-l border-slate-300 pl-3 sm:pl-4 flex-1 min-w-0">
              <p className="font-semibold text-slate-800 text-sm sm:text-base">{t.currentTest}</p>
              <p className="text-xs sm:text-sm text-slate-600 truncate pr-2 sm:pr-4">{currentTestTitle}</p>
            </div>
          )}
        </div>

        <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
          {onChangeTest && (
            <Button
              onClick={onChangeTest}
              variant="outline"
              size="sm"
              className="text-amber-700 hover:text-amber-800 bg-amber-50 border-amber-300 hover:bg-amber-100 transition-all duration-200 shadow-sm hover:shadow-md font-medium text-xs sm:text-sm min-h-[40px] flex-1 sm:flex-none"
            >
              <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{t.changeTest}</span>
              <span className="sm:hidden">{t.change}</span>
            </Button>
          )}

          <Button
            onClick={onLogout}
            variant="outline"
            size="sm"
            className="text-amber-700 hover:text-amber-800 bg-amber-50 border-amber-300 hover:bg-amber-100 transition-all duration-200 shadow-sm hover:shadow-md font-medium text-xs sm:text-sm min-h-[40px] flex-1 sm:flex-none"
          >
            <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{isAuthenticated ? t.signOut : t.exitGuest}</span>
            <span className="sm:hidden">{isAuthenticated ? t.out : t.exit}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

