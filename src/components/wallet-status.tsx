'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Wallet, Copy, ExternalLink, Loader2 } from 'lucide-react'
import { useWalletState, useWalletIntegration } from '@/hooks/use-wallet-integration'
import { formatNumber, formatAddress } from '@/lib/utils/format'
import { copyToClipboard } from '@/lib/utils'

export function WalletStatus() {
  const { isConnected, isConnecting, address, shortAddress, walletName, walletIcon } = useWalletState()
  const { getBalance, getNetworkInfo } = useWalletIntegration()
  
  const [balance, setBalance] = useState<number>(0)
  const [networkInfo, setNetworkInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isConnected && address) {
      setLoading(true)
      Promise.all([
        getBalance(),
        getNetworkInfo(),
      ]).then(([balanceResult, networkResult]) => {
        setBalance(balanceResult)
        setNetworkInfo(networkResult)
      }).finally(() => {
        setLoading(false)
      })
    }
  }, [isConnected, address, getBalance, getNetworkInfo])

  const handleCopyAddress = async () => {
    if (address) {
      const success = await copyToClipboard(address)
      if (success) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  }

  const openInExplorer = () => {
    if (address) {
      const explorerUrl = networkInfo?.rpcEndpoint?.includes('devnet') 
        ? `https://explorer.solana.com/address/${address}?cluster=devnet`
        : `https://explorer.solana.com/address/${address}`
      window.open(explorerUrl, '_blank')
    }
  }

  if (!isConnected && !isConnecting) {
    return null
  }

  if (isConnecting) {
    return (
      <Card className="border-saros-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Connecting to wallet...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-saros-primary/20">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {walletIcon ? (
              <img src={walletIcon} alt={walletName} className="w-8 h-8 rounded" />
            ) : (
              <Wallet className="h-8 w-8 text-saros-primary" />
            )}
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{walletName}</span>
                <Badge className="bg-green-100 text-green-800 text-xs">
                  Connected
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{shortAddress}</span>
                <button
                  onClick={handleCopyAddress}
                  className="hover:text-foreground transition-colors"
                  title="Copy address"
                >
                  <Copy className="h-3 w-3" />
                </button>
                <button
                  onClick={openInExplorer}
                  className="hover:text-foreground transition-colors"
                  title="View in explorer"
                >
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          <div className="text-right">
            {loading ? (
              <div className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-xs text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-lg font-semibold">
                  {formatNumber(balance)} SOL
                </div>
                <div className="text-xs text-muted-foreground">
                  Balance
                </div>
              </div>
            )}
          </div>
        </div>

        {networkInfo && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                <span>Network:</span>{' '}
                <span className="text-foreground">
                  {networkInfo.rpcEndpoint?.includes('devnet') ? 'Devnet' : 'Mainnet'}
                </span>
              </div>
              <div>
                <span>Slot:</span>{' '}
                <span className="text-foreground">
                  {networkInfo.slot?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {copied && (
          <div className="mt-2 text-xs text-green-600">
            Address copied to clipboard!
          </div>
        )}
      </CardContent>
    </Card>
  )
}