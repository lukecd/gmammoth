import { Chain } from 'viem'

export const astriaFlame = {
  id: 16604737732183,
  name: 'dawn-1',
  nativeCurrency: {
    decimals: 18,
    name: 'TIA',
    symbol: 'TIA',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.flame.dawn-1.astria.org'],
      webSocket: ['wss://rpc.flame.dawn-1.astria.org/ws'],
    },
    public: {
      http: ['https://rpc.flame.dawn-1.astria.org'],
      webSocket: ['wss://rpc.flame.dawn-1.astria.org/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Explorer',
      url: 'https://explorer.flame.dawn-1.astria.org',
    },
  },
} as const satisfies Chain 