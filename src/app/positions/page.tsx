'use client'

import { useCallback } from 'react'
import { PublicKey } from '@solana/web3.js'
import { toast } from 'sonner'
import { DashboardHeader } from '@/components/dashboard-header'
import PositionsList from '@/components/positions-list'
import { useWalletIntegration } from '@/hooks/use-wallet-integration'
import { dlmmClient } from '@/lib/dlmm/client'
import { DLMMPosition } from '@/lib/types'
import { logSDKCall, updateSDKCall } from '@/components/sdk/sdk-call-logger'

export default function PositionsPage() {
  const { publicKey, connection, sendTransaction } = useWalletIntegration()

  const handleCollectFees = useCallback(async (position: DLMMPosition) => {
    if (!publicKey || !connection || !sendTransaction) {
      toast.error('Please connect your wallet first')
      return
    }

    const callId = logSDKCall({
      method: 'collectFees',
      endpoint: 'DLMM.createClaimFeesTransaction',
      status: 'pending',
      params: {
        position: position.id,
        tokenX: position.feesEarned.tokenX,
        tokenY: position.feesEarned.tokenY
      }
    })

    try {
      toast.loading('Collecting fees...', { id: 'collect-fees' })

      // Create the fee collection transaction using our DLMM client
      const transaction = await dlmmClient.createClaimFeesTransaction(
        position.poolAddress,
        publicKey,
        new PublicKey(position.id) // Position mint
      )

      console.log('🏗️ Fee collection transaction created')

      // Send the transaction
      const result = await sendTransaction(transaction)
      console.log('📨 Transaction sent:', result)

      if (!result.success) {
        throw new Error(result.error || 'Transaction failed')
      }

      console.log('✅ Transaction confirmed:', result.signature)

      updateSDKCall(callId.id, {
        status: 'success',
        duration: 3000,
        response: { signature: result.signature, feesCollected: position.feesEarned }
      })

      toast.success('Fees collected successfully!', { id: 'collect-fees' })

      // Show fees collected details
      const feeX = parseFloat(position.feesEarned.tokenX)
      const feeY = parseFloat(position.feesEarned.tokenY)
      if (feeX > 0 || feeY > 0) {
        toast.success(
          `Collected: ${feeX.toFixed(4)} ${position.tokenX.symbol} + ${feeY.toFixed(4)} ${position.tokenY.symbol}`,
          { duration: 5000 }
        )
      }

    } catch (error) {
      console.error('❌ Fee collection failed:', error)

      updateSDKCall(callId.id, {
        status: 'error',
        duration: 2000,
        error: error instanceof Error ? error.message : 'Fee collection failed'
      })

      toast.error(
        error instanceof Error ? error.message : 'Failed to collect fees',
        { id: 'collect-fees' }
      )
    }
  }, [publicKey, connection, sendTransaction])

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">
      <DashboardHeader />
      <PositionsList onCollectFees={handleCollectFees} />
    </div>
  )
}