'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { PublicKey } from '@solana/web3.js'

interface AddLiquidityModalProps {
  isOpen: boolean
  onClose: () => void
  poolAddress?: PublicKey
  tokenX?: {
    symbol: string
    decimals: number
    balance: number
    price: number
  }
  tokenY?: {
    symbol: string
    decimals: number
    balance: number
    price: number
  }
  activeBinId?: number
  currentPrice?: number
}

export function AddLiquidityModal({
  isOpen,
  onClose,
  poolAddress,
  tokenX = { symbol: 'SOL', decimals: 9, balance: 10.5, price: 152.45 },
  tokenY = { symbol: 'USDC', decimals: 6, balance: 1500.0, price: 1.0 },
  activeBinId = 0,
  currentPrice = 152.45
}: AddLiquidityModalProps) {
  const [tokenXAmount, setTokenXAmount] = useState('')
  const [tokenYAmount, setTokenYAmount] = useState('')

  const handleSubmit = () => {
    // Simplified submit logic
    console.log('Adding liquidity:', { tokenXAmount, tokenYAmount })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Liquidity to {tokenX.symbol}/{tokenY.symbol}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium">
                  {tokenX.symbol} Amount
                </label>
                <input
                  type="number"
                  value={tokenXAmount}
                  onChange={(e) => setTokenXAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Balance: {tokenX.balance} {tokenX.symbol}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">
                  {tokenY.symbol} Amount
                </label>
                <input
                  type="number"
                  value={tokenYAmount}
                  onChange={(e) => setTokenYAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Balance: {tokenY.balance} {tokenY.symbol}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={!tokenXAmount || !tokenYAmount}
            >
              Add Liquidity
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}