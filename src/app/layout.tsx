import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WalletContextProvider } from '@/lib/wallet-context-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Saros DLMM Position Manager',
  description: 'A comprehensive DLMM position management and analytics dashboard for Solana DeFi',
  keywords: ['Solana', 'DeFi', 'DLMM', 'Liquidity', 'Saros', 'Analytics'],
  authors: [{ name: 'RECTOR' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#6366f1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <WalletContextProvider>
          <div className="min-h-screen bg-background">
            <div className="relative flex min-h-screen flex-col">
              <div className="flex-1">
                {children}
              </div>
            </div>
          </div>
        </WalletContextProvider>
      </body>
    </html>
  )
}