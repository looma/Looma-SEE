import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/lib/language-context"
import { VersionIndicator } from "@/components/version-indicator"
import { LanguageSwitch } from "@/components/language-switch"
import "./globals.css"

export const metadata: Metadata = {
  title: "SEE Exam Practice - Nepali Helper",
  description: "Practice tests for SEE examinations in Nepal",
  generator: "v0.app",
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
            {children}
            <VersionIndicator />
            <LanguageSwitch />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
