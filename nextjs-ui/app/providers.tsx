'use client'

import * as React from 'react'
import '@rainbow-me/rainbowkit/styles.css'
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http } from 'wagmi'
import type { RainbowKitProvider as RainbowKitProviderType } from '@rainbow-me/rainbowkit'

const astriaFlame = {
  id: 16604737732183,
  name: 'Astria Flame',
  network: 'astria-flame',
  nativeCurrency: {
    decimals: 18,
    name: 'TIA',
    symbol: 'TIA',
  },
  rpcUrls: {
    default: { http: ['https://rpc.flame.dawn-1.astria.org'] },
    public: { http: ['https://rpc.flame.dawn-1.astria.org'] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.flame.dawn-1.astria.org' },
  },
} as const

const config = getDefaultConfig({
  appName: 'gMammoth',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
  chains: [astriaFlame],
  transports: {
    [astriaFlame.id]: http(),
  },
  ssr: true,
})

const queryClient = new QueryClient()

export function Providers({ children }: Parameters<typeof RainbowKitProviderType>[0]) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {mounted ? children : null}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
} 