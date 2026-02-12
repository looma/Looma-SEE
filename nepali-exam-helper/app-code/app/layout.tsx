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
  description: "Practice tests for SEE examinations in Nepal. Free practice exams for Nepali, Math, Science, English, and Social Studies.",
  generator: "v0.app",
  metadataBase: new URL("https://testprep.looma.website"),
  icons: {
    icon: "/Looma Logo Square.png",
    apple: "/Looma Logo Square.png",
  },
  openGraph: {
    title: "SEE Exam Practice - Looma",
    description: "Free practice tests for SEE examinations in Nepal. Practice Nepali, Math, Science, English, and Social Studies.",
    url: "https://testprep.looma.website",
    siteName: "Looma SEE Practice",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Looma - SEE Exam Practice",
        type: "image/png",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEE Exam Practice - Looma",
    description: "Free practice tests for SEE examinations in Nepal.",
    images: ["/og-image.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        {/* Google Fonts for proper Devanagari (Nepali) text rendering */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={GeistSans.className} style={{ fontFamily: 'Geist, "Noto Sans Devanagari", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
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
