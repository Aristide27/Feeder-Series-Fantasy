import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
// import "../styles/globals.css";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import LayoutFrame from "@/components/layout-frame";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Feeder Series Fantasy',
  description: 'Join the most immersive F2 fantasy game. Build your team, compete with friends, and rise through the rankings.',
  icons: {
    icon: [
      { url: '/logo/favicon.ico', sizes: 'any' },
      // { url: '/logo/icon-192.png', sizes: '192x192', type: 'image/png' },
      // { url: '/logo/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    // apple: '/logo/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-background text-foreground">
        <LayoutFrame>
          <Navigation />
          {children}
        </LayoutFrame>
      </body>
    </html>
  );
}