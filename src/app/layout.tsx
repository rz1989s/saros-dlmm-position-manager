import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WalletContextProvider } from '@/lib/wallet-context-provider'
import { DataSourceProvider } from '@/contexts/data-source-context'
import { JudgeModeProvider } from '@/contexts/judge-mode-context'
import { PWAProvider } from '@/components/pwa/pwa-provider'
import { Toaster } from '@/components/ui/toaster'
import { CriticalErrorBoundary } from '@/components/error-boundary'
import { SkipLinks } from '@/components/accessibility/accessible-components'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Prevent invisible text during font load
  preload: true
})

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
        {/* Performance: Preconnect to critical origins */}
        <link rel="preconnect" href="https://api.mainnet-beta.solana.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://hermes.pyth.network" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.devnet.solana.com" />
        <link rel="dns-prefetch" href="https://saros.finance" />

        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical CSS loaded synchronously */
            :root {
              --saros-primary: #6366f1;
              --saros-secondary: #8b5cf6;
              --saros-accent: #06b6d4;
            }
            .gradient-text {
              background: linear-gradient(to right, var(--saros-primary), var(--saros-secondary), var(--saros-accent));
              background-clip: text;
              -webkit-background-clip: text;
              color: transparent;
              -webkit-text-fill-color: transparent;
            }
            .pulse-dot {
              display: inline-flex;
              height: 0.5rem;
              width: 0.5rem;
              border-radius: 9999px;
              background-color: var(--saros-accent);
              animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            /* Critical layout for immediate rendering */
            .container {
              width: 100%;
              margin-left: auto;
              margin-right: auto;
              max-width: 1200px;
            }
            .space-y-6 > :not([hidden]) ~ :not([hidden]) {
              margin-top: 1.5rem;
            }
            .space-y-8 > :not([hidden]) ~ :not([hidden]) {
              margin-top: 2rem;
            }
            .px-4 { padding-left: 1rem; padding-right: 1rem; }
            .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
            @media (min-width: 640px) {
              .sm\\:px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
              .sm\\:py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
              .sm\\:space-y-8 > :not([hidden]) ~ :not([hidden]) { margin-top: 2rem; }
            }
            @media (min-width: 1024px) {
              .lg\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
              .lg\\:py-8 { padding-top: 2rem; padding-bottom: 2rem; }
            }
          `
        }} />
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
            <DataSourceProvider>
              <JudgeModeProvider>
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
              </JudgeModeProvider>
            </DataSourceProvider>
          </WalletContextProvider>
        </CriticalErrorBoundary>
      </body>
    </html>
  )
}