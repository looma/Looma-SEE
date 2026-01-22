import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/lib/language-context"
import { VersionIndicator } from "@/components/version-indicator"
import { LanguageSwitch } from "@/components/language-switch"
import { OfflineBanner } from "@/components/offline-banner"
import Image from "next/image"
import "./globals.css"

export const metadata: Metadata = {
  title: "SEE Exam Practice - Nepali Helper",
  description: "Practice tests for SEE examinations in Nepal",
  generator: "v0.app",
  icons: {
    icon: "/Looma Logo Square.png",
    apple: "/Looma Logo Square.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={GeistSans.className} style={{ fontFamily: 'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <LanguageProvider>
            {/* Offline Warning Banner */}
            <OfflineBanner />
            {/* Looma Logo - Fixed top left */}
            <a
              href="https://looma.website"
              target="_blank"
              rel="noopener noreferrer"
              className="fixed top-3 left-3 z-50 opacity-80 hover:opacity-100 transition-opacity hidden md:block"
            >
              <Image
                src="/looma-logo.png"
                alt="Looma"
                width={80}
                height={80}
                className="rounded-lg shadow-sm"
              />
            </a>
            {children}
            <VersionIndicator />
            <LanguageSwitch />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
