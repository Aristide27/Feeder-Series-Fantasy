import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono, Noto_Sans_Arabic, Noto_Sans_JP } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import './globals.css'
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import LayoutFrame from "@/components/layout-frame"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const _notoArabic = Noto_Sans_Arabic({ subsets: ["arabic"], variable: "--font-arabic" })
const _notoJP = Noto_Sans_JP({ subsets: ["latin"], variable: "--font-jp" })

export const metadata: Metadata = {
  title: 'Feeder Series Fantasy',
  description: 'Join the most immersive F2 fantasy game. Build your team, compete with friends, and rise through the rankings.',
  icons: {
    icon: [
      { url: '/logo/favicon.ico', sizes: 'any' },
    ],
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()
  const isRTL = locale === 'ar'

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'}>
      <body className={`bg-background text-foreground ${isRTL ? _notoArabic.className : ''} ${locale === 'ja' ? _notoJP.className : ''}`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <LayoutFrame>
            <Navigation />
            {children}
          </LayoutFrame>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}