import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WalletContextProvider } from '@/lib/wallet-context-provider'
import { PWAProvider } from '@/components/pwa/pwa-provider'
import { Toaster } from '@/components/ui/toaster'
import { CriticalErrorBoundary } from '@/components/error-boundary'
import { SkipLinks } from '@/components/accessibility/accessible-components'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://saros-dlmm-position-manager.vercel.app'),
  title: 'Saros DLMM Position Manager',
  description: 'A comprehensive DLMM position management and analytics dashboard for Solana DeFi',
  keywords: ['Solana', 'DeFi', 'DLMM', 'Liquidity', 'Saros', 'Analytics', 'PWA'],
  authors: [{ name: 'RECTOR' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Saros DLMM',
    startupImage: [
      {
        url: '/icons/icon-512x512.png',
        media: '(device-width: 768px) and (device-height: 1024px)'
      }
    ]
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Saros DLMM Position Manager',
    title: 'Saros DLMM Position Manager',
    description: 'Advanced DLMM position management and analytics for Solana',
    images: [
      {
        url: '/icons/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'Saros DLMM Logo'
      }
    ]
  },
  twitter: {
    card: 'summary',
    title: 'Saros DLMM Position Manager',
    description: 'Advanced DLMM position management and analytics for Solana',
    images: ['/icons/icon-512x512.png']
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#6366f1' },
    { media: '(prefers-color-scheme: dark)', color: '#4338ca' }
  ]
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
      </head>
      <body className={inter.className}>
        <SkipLinks
          links={[
            { href: '#main-content', label: 'Skip to main content' },
            { href: '#navigation', label: 'Skip to navigation' },
            { href: '#footer', label: 'Skip to footer' }
          ]}
        />

        <CriticalErrorBoundary>
          <WalletContextProvider>
            <PWAProvider
              enableInstallPrompt={true}
              enableUpdatePrompt={true}
              enableOfflineIndicator={true}
              installPromptDelay={5000}
            >
              <div className="min-h-screen bg-background">
                <div className="relative flex min-h-screen flex-col">
                  <div className="flex-1">
                    <main id="main-content" className="focus:outline-none" tabIndex={-1}>
                      {children}
                    </main>
                  </div>
                </div>
              </div>
              <Toaster position="top-right" />
            </PWAProvider>
          </WalletContextProvider>
        </CriticalErrorBoundary>
      </body>
    </html>
  )
}