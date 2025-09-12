'use client'

import { useCallback, useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { 
  Transaction, 
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
  PublicKey,
} from '@solana/web3.js'
import { DEFAULT_PRIORITY_FEE } from '@/lib/constants'

export interface TransactionResult {
  signature: string
  success: boolean
  error?: string
}

export function useWalletIntegration() {
  const { publicKey, signTransaction, signAllTransactions, connected, connecting, wallet } = useWallet()
  const { connection } = useConnection()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const sendTransaction = useCallback(async (
    transaction: Transaction,
    options?: {
      skipPreflight?: boolean
      preflightCommitment?: 'processed' | 'confirmed' | 'finalized'
      maxRetries?: number
    }
  ): Promise<TransactionResult> => {
    if (!publicKey || !signTransaction) {
      throw new Error('Wallet not connected')
    }

    setIsSubmitting(true)
    try {
      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      // Add priority fee for faster processing
      const priorityFeeInstruction = {
        programId: new PublicKey('11111111111111111111111111111112'),
        keys: [],
        data: Buffer.from([2, 0, 0, 0, Math.floor(DEFAULT_PRIORITY_FEE * 1_000_000_000)]),
      }
      transaction.instructions.unshift(priorityFeeInstruction as TransactionInstruction)

      // Sign the transaction
      const signedTransaction = await signTransaction(transaction)

      // Send the transaction
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          skipPreflight: options?.skipPreflight ?? false,
          preflightCommitment: options?.preflightCommitment ?? 'confirmed',
          maxRetries: options?.maxRetries ?? 3,
        }
      )

      // Confirm the transaction
      const confirmation = await connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        'confirmed'
      )

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`)
      }

      return {
        signature,
        success: true,
      }
    } catch (error) {
      console.error('Transaction failed:', error)
      return {
        signature: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [publicKey, signTransaction, connection])

  const sendMultipleTransactions = useCallback(async (
    transactions: Transaction[]
  ): Promise<TransactionResult[]> => {
    if (!publicKey || !signAllTransactions) {
      throw new Error('Wallet not connected or does not support batch signing')
    }

    setIsSubmitting(true)
    try {
      const { blockhash } = await connection.getLatestBlockhash()
      
      // Prepare all transactions
      const preparedTransactions = transactions.map(tx => {
        tx.recentBlockhash = blockhash
        tx.feePayer = publicKey
        return tx
      })

      // Sign all transactions
      const signedTransactions = await signAllTransactions(preparedTransactions)

      // Send all transactions
      const results = await Promise.allSettled(
        signedTransactions.map(signedTx =>
          connection.sendRawTransaction(signedTx.serialize())
        )
      )

      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return {
            signature: result.value,
            success: true,
          }
        } else {
          return {
            signature: '',
            success: false,
            error: result.reason?.message || 'Transaction failed',
          }
        }
      })
    } catch (error) {
      console.error('Batch transaction failed:', error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }, [publicKey, signAllTransactions, connection])

  const getBalance = useCallback(async (): Promise<number> => {
    if (!publicKey) return 0
    
    try {
      const balance = await connection.getBalance(publicKey)
      return balance / 1_000_000_000 // Convert lamports to SOL
    } catch (error) {
      console.error('Failed to get balance:', error)
      return 0
    }
  }, [publicKey, connection])

  const getTokenBalance = useCallback(async (tokenMint: PublicKey): Promise<number> => {
    if (!publicKey) return 0

    try {
      const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, {
        mint: tokenMint,
      })

      if (tokenAccounts.value.length === 0) return 0

      const accountInfo = await connection.getTokenAccountBalance(
        tokenAccounts.value[0].pubkey
      )
      
      return parseFloat(accountInfo.value.amount) / Math.pow(10, accountInfo.value.decimals)
    } catch (error) {
      console.error('Failed to get token balance:', error)
      return 0
    }
  }, [publicKey, connection])

  const estimateTransactionFee = useCallback(async (
    transaction: Transaction
  ): Promise<number> => {
    try {
      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey || new PublicKey('11111111111111111111111111111111')

      const fee = await connection.getFeeForMessage(
        transaction.compileMessage(),
        'confirmed'
      )
      
      return (fee?.value || 0) / 1_000_000_000 // Convert lamports to SOL
    } catch (error) {
      console.error('Failed to estimate transaction fee:', error)
      return DEFAULT_PRIORITY_FEE
    }
  }, [connection, publicKey])

  const getNetworkInfo = useCallback(async () => {
    try {
      const [slot, blockHeight, version] = await Promise.all([
        connection.getSlot(),
        connection.getBlockHeight(),
        connection.getVersion(),
      ])

      return {
        slot,
        blockHeight,
        version: version['solana-core'],
        rpcEndpoint: connection.rpcEndpoint,
      }
    } catch (error) {
      console.error('Failed to get network info:', error)
      return null
    }
  }, [connection])

  return {
    // Wallet state
    publicKey,
    connected,
    connecting,
    wallet,
    connection,
    isSubmitting,

    // Transaction methods
    sendTransaction,
    sendMultipleTransactions,
    estimateTransactionFee,

    // Balance methods
    getBalance,
    getTokenBalance,

    // Network methods
    getNetworkInfo,
  }
}

export function useWalletState() {
  const { publicKey, connected, connecting, wallet } = useWallet()
  
  const walletName = wallet?.adapter?.name || 'Unknown'
  const walletIcon = wallet?.adapter?.icon || ''
  const shortAddress = publicKey?.toString().slice(0, 4) + '...' + publicKey?.toString().slice(-4)

  return {
    isConnected: connected,
    isConnecting: connecting,
    address: publicKey?.toString(),
    shortAddress,
    walletName,
    walletIcon,
  }
}