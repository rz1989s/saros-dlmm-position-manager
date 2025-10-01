'use client'

import { useEffect, useState } from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

interface ClientOnlyWalletButtonProps {
  className?: string
}

export function ClientOnlyWalletButton({ className }: ClientOnlyWalletButtonProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    // Render a placeholder that matches the expected button structure
    return (
      <button
        className={className || "!bg-saros-primary hover:!bg-saros-secondary transition-colors !w-full sm:!w-auto !text-sm sm:!text-base"}
        disabled
      >
        <span>Select Wallet</span>
      </button>
    )
  }

  return <WalletMultiButton className={className} />
}