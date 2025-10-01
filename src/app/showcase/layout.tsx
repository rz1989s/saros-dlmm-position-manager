import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Saros DLMM SDK Features - Transparent Implementation Showcase',
  description: 'Honest implementation of Saros DLMM SDK features with code locations, live demonstrations, and judge verification tools. Transparent SDK coverage reporting.',
  keywords: ['Saros DLMM SDK', 'SDK Implementation', 'Judge Verification', 'Code Locations', 'DLMM', 'Solana', 'SDK Coverage'],
  openGraph: {
    title: 'Saros DLMM SDK Features - Transparent Implementation',
    description: 'Honest implementation of Saros DLMM SDK features with judge verification tools',
    type: 'website'
  }
}

export default function ShowcaseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}