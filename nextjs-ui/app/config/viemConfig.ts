import { createPublicClient, createWalletClient, custom, http, fallback } from 'viem'
import { astriaFlame } from './chainConfig'

// Public client for reading from the blockchain
export const publicClient = createPublicClient({
  chain: astriaFlame,
  transport: http(astriaFlame.rpcUrls.default.http[0], {
    timeout: 30000, // Increase timeout to 30 seconds
    retryCount: 3,  // Add retry attempts
    retryDelay: 1000, // Delay between retries in ms
  }),
})

// Wallet client for sending transactions
export const walletClient = createWalletClient({
  chain: astriaFlame,
  transport: window.ethereum ? custom(window.ethereum) : http(astriaFlame.rpcUrls.default.http[0], {
    timeout: 30000,
    retryCount: 3,
    retryDelay: 1000,
  })
}) 