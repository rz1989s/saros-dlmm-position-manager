'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useWallet } from '@solana/wallet-adapter-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wallet, CheckCircle2, Copy, ExternalLink, Trash2 } from 'lucide-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useToast } from '@/hooks/use-toast'

export function WalletSettings() {
  const { publicKey, wallet, connected, disconnect } = useWallet()
  const { setVisible } = useWalletModal()
  const { toast } = useToast()
  const [recentTransactions, setRecentTransactions] = useState<string[]>([])

  // Load recent transactions from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('recent-transactions')
      if (stored) {
        try {
          setRecentTransactions(JSON.parse(stored))
        } catch (error) {
          console.error('Failed to load recent transactions:', error)
        }
      }
    }
  }, [])

  const handleCopyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString())
      toast({
        title: 'Address Copied',
        description: 'Wallet address copied to clipboard',
      })
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
      toast({
        title: 'Wallet Disconnected',
        description: 'Your wallet has been disconnected',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to disconnect wallet',
        variant: 'destructive',
      })
    }
  }

  const handleClearHistory = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('recent-transactions')
      setRecentTransactions([])
      toast({
        title: 'History Cleared',
        description: 'Transaction history has been cleared',
      })
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  return (
    <div className="space-y-6">
      {/* Connected Wallet */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connected Wallet
          </CardTitle>
          <CardDescription>Manage your connected Solana wallet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {connected && publicKey ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {wallet?.adapter?.icon && (
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={wallet.adapter.icon}
                        alt={wallet.adapter.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                        unoptimized
                      />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{wallet?.adapter?.name || 'Unknown Wallet'}</p>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 font-mono">
                      {formatAddress(publicKey.toString())}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleCopyAddress}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDisconnect}>
                    Disconnect
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Set as default wallet</span>
                <Badge variant="secondary">Current Default</Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No wallet connected</p>
              <Button onClick={() => setVisible(true)}>Connect Wallet</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>View your recent transaction history</CardDescription>
            </div>
            {recentTransactions.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearHistory}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear History
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {recentTransactions.length > 0 ? (
            <div className="space-y-2">
              {recentTransactions.slice(0, 10).map((signature) => (
                <div
                  key={signature}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-gray-600">
                      {formatAddress(signature)}
                    </span>
                  </div>
                  <a
                    href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No recent transactions</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wallet Security */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet Security</CardTitle>
          <CardDescription>Security recommendations for your wallet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Always verify transaction details</p>
              <p className="text-sm text-blue-700">
                Double-check amounts and addresses before approving transactions
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Keep your seed phrase secure</p>
              <p className="text-sm text-blue-700">
                Never share your seed phrase with anyone, including support
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Use hardware wallets for large amounts</p>
              <p className="text-sm text-blue-700">
                Consider using a hardware wallet for better security
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
