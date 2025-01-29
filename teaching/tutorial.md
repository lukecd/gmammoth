# Building gMammoth: A Real-Time Messaging dApp on Astria

![](/assets/Mammothon_banner_open.png)

## Overview

gMammoth is a demo project the [Celestia Mammothon hackathon](https://mammothon.celestia.org/). 

It's a minimalist messaging dApp inspired by the strangly viral app ["Yo"](https://en.wikipedia.org/wiki/Yo_(app)) from 2014. gMammoth is built on top of Celestia's data availability layer and deployed to the Astria Flame testnet.

Just as Mammoths once traversed the tundra greeting each other with their mighty calls, Web3 users can now connect and share simple acknowledgments through the power of modular blockchains.

gMammoth demonstrates:
- EVM smart contract deployment on Astria
- Real-time messaging using EVM events
- Frontend integration with custom EVM chains

## Demos

- [Demo Video](/assets/gMammothDemo.mp4)
- [Online demo](gmammoth.vercel.app)

## Video

Before diving into this tutorial, we recommend [watching the video overview](https://youtu.be/vDdlmxxhld8) first.

## Prerequisites
- Node.js v18+
- Foundry
- MetaMask or another crypto wallet
- Familiarity with TypeScript, Next.js, and Tailwind CSS

## Project Structure
```
gmammoth/
├── foundry-contracts/    # Smart contracts and deployment scripts
└── nextjs-ui/            # Frontend application
```

## Smart Contract 

The GMammoth smartcontract implements a simple messaging system using events. 

### Storage Pattern: Mapping + Array

The contract uses two data structures to track registered users:
```solidity
mapping(address => bool) public registeredUsers;
address[] public userList;
```

This dual storage pattern is crucial for gas efficiency and functionality:

1. **The Mapping (`registeredUsers`)**
   - O(1) lookups to check if a user is registered
   - Used in require() statements for quick validation
   - Gas efficient for single-user checks
   - Cannot be iterated or counted

2. **The Array (`userList`)**
   - Enables iteration over all registered users
   - Allows frontend to fetch complete user list
   - Slightly more gas intensive for modifications
   - Required because mappings are not iterable in Solidity

**Why Both?**
- If we only used an array, checking if a user is registered would require O(n) iteration - very gas expensive
- If we only used a mapping, we couldn't get a list of all users for the frontend
- Together, they provide fast lookups AND iterability
- The extra gas cost of maintaining both structures is worth the benefits

For example, the registration check in `sendGMammoth`:
```solidity
require(registeredUsers[msg.sender], "Sender not registered");
```
This uses the mapping for an O(1) lookup instead of having to iterate through an array, saving significant gas.

> [!NOTE]
> In Solidity, gas optimization is crucial because users pay for every operation. While using two data structures requires more storage, the gas savings from O(1) lookups far outweigh the extra storage costs for our use case.

The contract implements three main functions for user management and messaging.  

Let's look at each function:

### User Registration

```solidity
function register() public {
    require(!registeredUsers[msg.sender], "User already registered");
    registeredUsers[msg.sender] = true;
    userList.push(msg.sender);
    emit UserRegistered(msg.sender);
}
```

This function:
- Checks if the user is already registered
- Adds them to the `registeredUsers` mapping
- Adds their address to the `userList` array
- Emits a `UserRegistered` event

### User Deregistration

```solidity
function deregister() public {
    require(registeredUsers[msg.sender], "User not registered");
    
    for (uint i = 0; i < userList.length; i++) {
        if (userList[i] == msg.sender) {
            userList[i] = userList[userList.length - 1];
            userList.pop();
            registeredUsers[msg.sender] = false;
            emit UserDeregistered(msg.sender);
            return;
        }
    }
    
    revert("User not found in list");
}
```

This function deregisters users using the "swap and pop" pattern for efficient array manipulation:
- Moves the last element to the position of the element being removed
- Pops the last element
- Updates the registration status
- Emits a UserDeregistered event

> [!NOTE]
> The "swap and pop" pattern might look strange to TypeScript developers who are used to array methods like `filter()` or `splice()`. However, in Solidity, this pattern is crucial for gas efficiency.
> 
> When you remove an element from the middle of an array in Solidity, one approach would be to shift all subsequent elements left (`O(n)` operation), however:
> - Each shift requires an SSTORE operation (20,000 gas for first write, 5,000 for subsequent writes)
> - Each shifted element also triggers a SLOAD (2,100 gas)
> - Array length updates cost additional gas (5,000 gas)
>
> The swap and pop pattern requires only:
> - One SLOAD to read the last element (2,100 gas)
> - One SSTORE to move the last element (20,000 gas)
> - One SSTORE for the pop operation (5,000 gas)
>
> For an array of 100 elements, removing from the middle could cost over 2M gas using shifts, versus only ~27K gas using swap and pop. While this breaks element ordering, for our use case (maintaining a list of registered users), order doesn't matter.

### Sending Messages

```solidity
function sendGMammoth(address to) public {
    require(registeredUsers[msg.sender], "Sender not registered");
    require(registeredUsers[to], "Recipient not registered");
    
    emit GMammothSent(msg.sender, to, block.timestamp);
}
```

The messaging function:
- Verifies both sender and recipient are registered
- Emits a `GMammothSent` event with sender, recipient, and timestamp

### User Queries

```solidity
function getRegisteredUsers() public view returns (address[] memory) {
    return userList;
}

function isRegistered(address user) public view returns (bool) {
    return registeredUsers[user];
}
```

These helper functions:
- Return the full list of registered users
- Check if a specific address is registered

### Complete Contract

Here's the complete contract code:

```solidity:foundry-contracts/src/GMammoth.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract GMammoth {
    // State variables
    mapping(address => bool) public registeredUsers;
    address[] public userList;

    // Events
    event UserRegistered(address indexed user);
    event UserDeregistered(address indexed user);
    event GMammothSent(
        address indexed from,
        address indexed to,
        uint256 timestamp
    );

    // Registration functions
    function register() public {
        require(!registeredUsers[msg.sender], "User already registered");
        registeredUsers[msg.sender] = true;
        userList.push(msg.sender);
        emit UserRegistered(msg.sender);
    }

    function deregister() public {
        require(registeredUsers[msg.sender], "User not registered");
        
        for (uint i = 0; i < userList.length; i++) {
            if (userList[i] == msg.sender) {
                userList[i] = userList[userList.length - 1];
                userList.pop();
                registeredUsers[msg.sender] = false;
                emit UserDeregistered(msg.sender);
                return;
            }
        }
        
        revert("User not found in list");
    }

    // Messaging function
    function sendGMammoth(address to) public {
        require(registeredUsers[msg.sender], "Sender not registered");
        require(registeredUsers[to], "Recipient not registered");
        
        emit GMammothSent(msg.sender, to, block.timestamp);
    }

    // Query functions
    function getRegisteredUsers() public view returns (address[] memory) {
        return userList;
    }

    function isRegistered(address user) public view returns (bool) {
        return registeredUsers[user];
    }
}
```

## Deployment Configuration

The deployment script is designed to make deploying to Astria Flame straightforward. You can use this script as a template for deploying your own contracts:

```solidity:foundry-contracts/script/GMammoth.s.sol
contract GMammothScript is Script {
    GMammoth public gMammoth;
    
    uint256 public constant CHAIN_ID = 16604737732183;
    string public constant RPC_URL = "https://rpc.flame.dawn-1.astria.org";

    function setUp() public {
        // Verify we're on Astria Flame
        require(block.chainid == CHAIN_ID, "Wrong chain ID");
    }

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        gMammoth = new GMammoth();
        vm.stopBroadcast();
    }
}
```

### Deploying Your Contract

1. Set up your environment:
```bash
# CD into the foundry-contracts directory
cd gmammoth/foundry-contracts

# Install Foundry (if you haven't already)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install dependencies
forge install
```

2. Configure MetaMask for Astria Flame:
- Network Name: Flame Testnet
- RPC URL: https://rpc.flame.dawn-1.astria.org
- Chain ID: 16604737732183
- Currency Symbol: TIA

3. Get testnet tokens:
- Visit the [Astria Faucet](https://faucet.flame.dawn-1.astria.org/)
- Connect your wallet
- Request test TIA tokens

4. Deploy the contract:

```bash
# Set your private key
export PRIVATE_KEY=your_private_key

# Deploy
forge script script/GMammoth.s.sol \
    --rpc-url https://rpc.flame.dawn-1.astria.org \
    --private-key $PRIVATE_KEY \
    --broadcast
```

5. Verify your contract:
```bash
forge verify-contract \
    <DEPLOYED_CONTRACT_ADDRESS> \
    src/GMammoth.sol:GMammoth \
    --chain-id 16604737732183 \
    --verifier blockscout \
    --verifier-url https://explorer.flame.dawn-1.astria.org/api \
    --constructor-args $(cast abi-encode "constructor()")
```

After deployment, add the contract address in `nextjs-ui/app/config/contracts.ts`:

```typescript:nextjs-ui/app/config/contracts.ts
export const mammothContract = {
    address: "YOUR_DEPLOYED_CONTRACT_ADDRESS" as `0x${string}`,
    ...
}
```

## Frontend Implementation

![](../assets/gMammoth.png)


Frontend tech stack:
- [**Next.js (App Router)**](https://nextjs.org/)
- [**TypeScript**](https://www.typescriptlang.org/)
- [**RainbowKit**](https://www.rainbowkit.com/) for wallet connections
- [**viem**](https://viem.sh/) for contract interactions
- [**Tailwind CSS**](https://tailwindcss.com/)


### Project Structure

The frontend code is organized as follows:

```
nextjs-ui/app/
├── components/
│   ├── MainContent.tsx         # Main application layout and user grid
│   ├── RegisterButton.tsx      # Registration UI
│   ├── Spinner.tsx             # Loading indicator
│   ├── ToastMessage.tsx        # Notification component
│   ├── TopNav.tsx              # Navigation bar with wallet connection
│   └── User.tsx                # Individual user card component
├── config/
│   ├── chainConfig.ts          # Astria Flame chain configuration
│   ├── contracts.ts            # Contract address and ABI
│   └── viemConfig.ts           # viem client configuration
├── utils/
│   ├── contractAbi.json        # Generated contract ABI
│   └── contractInteractions.ts # Contract interaction functions
├── hooks/
│   └── useRegistrationStatus.ts # Custom hook for user registration state
├── layout.tsx                   # Root layout with RainbowKit providers
└── page.tsx                     # Main application page
```

Let's examine each component:

### Chain Configuration
```typescript:nextjs-ui/app/config/chainConfig.ts
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
```
This file:
- Defines the Astria Flame chain configuration
- Includes the chain ID, name, native currency, RPC URLs, block explorers, and other network details  


### Contract Interactions

The `contractInteractions.ts` file contains all our blockchain interactions. Let's examine the key functions:

### Reading and Writing with Viem

For interacting with our smart contract, we use [viem](https://viem.sh) to handle both reading state and sending transactions. The key difference is in how these operations work:

1. **Read Operations** (`publicClient`)
   - Query the current state of the blockchain
   - No gas fees or wallet signing required
   - Return values immediately
   - Example:
   ```typescript
   const isRegistered = await publicClient.readContract({
     address: contract.address,
     abi: contract.abi, 
     functionName: 'isRegistered',
     args: [address]
   })
   ```

2. **Write Operations** (`walletClient`) 
   - Submit transactions that modify blockchain state
   - Require gas fees and wallet signature
   - Return transaction hashes that can be tracked
   - Example:
   ```typescript
   const hash = await walletClient.writeContract({
     address: contract.address,
     abi: contract.abi,
     functionName: 'register'
   })
   ```

For our app, we abstract these interactions into helper functions that handle errors and provide consistent behavior. These functions make it easier to interact with the contract while maintaining proper error handling and type safety. 

Let's look at the functions:

#### Reading Contract State

```typescript:nextjs-ui/app/utils/contractInteractions.ts
export const getRegisteredWallets = async (): Promise<string[]> => {
    try {
        const wallets = await publicClient.readContract({
            address: mammothContract.address,
            abi: mammothContract.abi,
            functionName: 'getRegisteredUsers'
        });
        return wallets as string[];
    } catch (error) {
        console.error('Failed to get registered wallets:', error);
        return [];
    }
};

export const isRegistered = async (address: string): Promise<boolean> => {
    try {
        return await publicClient.readContract({
            address: mammothContract.address,
            abi: mammothContract.abi,
            functionName: 'isRegistered',
            args: [address]
        });
    } catch (error) {
        console.error('Failed to check registration:', error);
        return false;
    }
};
```

These functions:
- Return the list of registered users (this is the list of users you can send gMammoth to)
- Checks if a user is registered

> [!NOTE]
> The current implementation of `getRegisteredWallets` does not filter out the current user, allowing you to send a gMammoth to yourself. In a production app, you would probably want to change this, but while testing, it's useful to be able to gMammoth to yourself.

#### Event Listeners
```typescript:nextjs-ui/app/utils/contractInteractions.ts
export const setupGMammothEventListener = (userAddress: string) => {
    try {
        const unwatch = publicClient.watchContractEvent({
            address: mammothContract.address,
            abi: mammothContract.abi,
            eventName: 'GMammothSent',
            onLogs: (logs) => {
                for (const log of logs) {
                    const { from, to } = log.args;
                    if (to?.toLowerCase() === userAddress.toLowerCase()) {
                        toast.success(`gMammoth received from ${formatAddress(from)}`);
                    }
                }
            },
        });
        return unwatch;
    } catch (error) {
        console.error('Error setting up event listener:', error);
        return () => {};
    }
};
```

This function:
- Sets up an event listener for the `GMammothSent` event
- Sets up a callback function that will be called when the event is emitted
- The callback function will display a toast message if the event is emitted for the current user

#### Writing to the Contract
```typescript:nextjs-ui/app/utils/contractInteractions.ts
export const sendGMammoth = async (to: string) => {
    try {
        const hash = await walletClient.writeContract({
            address: mammothContract.address,
            abi: mammothContract.abi,
            functionName: 'sendGMammoth',
            args: [to]
        });
        
        await publicClient.waitForTransactionReceipt({ hash });
        return hash;
    } catch (error) {
        console.error('Failed to send gMammoth:', error);
        throw error;
    }
};
```

This function:
- Connects to the contract and sends a transaction to the `sendGMammoth` function
- Waits for the transaction to be mined

Now let's look at how these are used in our components...

## UI Components

The app is using [RainbowKit](https://www.rainbowkit.com/) for wallet connections and [viem](https://viem.sh/) for contract interactions. Let's look at how these are configured:

### Provider Setup

RainbowKit uses the React Provider pattern to:
- Setup a connection to the blockchain.
- Ensure the connection is available to all components.

```typescript:nextjs-ui/app/providers.tsx
'use client'

import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './config/wagmiConfig'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

### Chain Configuration

To use Astria Flame, we need to define its network parameters. This configuration is used by both RainbowKit and viem:

```typescript:nextjs-ui/app/config/chainConfig.ts
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
```

### Viem Client Configuration
We create a public client using viem to interact with the blockchain. This client handles all our read operations and event subscriptions:

```typescript:nextjs-ui/app/config/viemConfig.ts
import { createPublicClient, http } from 'viem'
import { astriaFlame } from './chainConfig'

export const publicClient = createPublicClient({
    chain: astriaFlame,
    transport: http()
})
```

This setup provides:
1. Wallet connection through RainbowKit
2. Chain configuration for Astria Flame
3. A viem public client for reading from the blockchain and listening to events


### TopNav Component
The navigation bar handles wallet connection and user deregistration:

```typescript:nextjs-ui/app/components/TopNav.tsx
const TopNav = () => {
  const { address, isConnected } = useAccount()
  const { isUserRegistered, refetch } = useRegistrationStatus()
  const [isDeregistering, setIsDeregistering] = useState(false)

  const handleDeregister = async () => {
    if (!address) return
    
    setIsDeregistering(true)
    try {
      await deregister()
    } catch (error) {
      console.error('Failed to deregister:', error)
    } finally {
      setIsDeregistering(false)
    }
  }

  useEffect(() => {
    // Set up event listeners for registration status changes
    const unsubscribeRegistration = setupRegistrationEventListener(() => {
      if (address) isRegistered(address).then(() => refetch());
    });

    const unsubscribeDeregistration = setupDeregistrationEventListener(() => {
      if (address) isRegistered(address).then(() => refetch());
    });

    return () => {
      unsubscribeRegistration();
      unsubscribeDeregistration();
    };
  }, [address]);

  return (
    <nav className="fixed w-full">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Image src="/mammoth.png" alt="Mammoth Logo" />
        
        {/* Actions */}
        <div className="flex gap-4">
          <ConnectButton />
          {isConnected && isUserRegistered && (
            <button onClick={handleDeregister} disabled={isDeregistering}>
              {isDeregistering ? 'Deregistering...' : 'Deregister'}
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
```

Key features:
1. Uses RainbowKit's `ConnectButton` for wallet connection
2. Manages deregistration state and transactions
3. Listens for registration events to update UI
4. Shows deregister button only for registered users

### RegisterButton Component
This component handles the user registration process:

```typescript:nextjs-ui/app/components/RegisterButton.tsx
const RegisterButton = () => {
  const [isRegistering, setIsRegistering] = useState(false)

  const handleRegister = async () => {
    try {
      setIsRegistering(true)
      await register()
    } catch (error) {
      console.error("Failed to register:", error)
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <button
      onClick={handleRegister}
      disabled={isRegistering}
      className="bg-mainAccent shadow-mainGlow shadow-lg text-gray-800 font-semibold 
        rounded-full p-6 transition-all duration-200 ease-in-out
        transform hover:scale-105 active:scale-95
        flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="text-2xl">🦣</span>
      {isRegistering ? (
        <div className="flex items-center gap-2">
          <Spinner className="w-5 h-5" />
          <span className="text-xl">Registering...</span>
        </div>
      ) : (
        <span className="text-xl">Register to gMammoth</span>
      )}
    </button>
  )
}
```

Key features:
1. Simple registration flow 
2. Visual feedback during transaction
3. Error handling with console logging
4. Disabled state to prevent double-clicks

### MainContent Component

This component manages the main application state and renders the user grid:

```typescript:nextjs-ui/app/components/MainContent.tsx
const MainContent = () => {
  const { address, isConnected } = useAccount();
  const [walletAddresses, setWalletAddresses] = useState<string[]>([]);
  const [isUserRegistered, setIsUserRegistered] = useState<boolean>(false);

  // Effect to fetch initial data and setup registration event listeners
  useEffect(() => {
    const fetchData = async () => {
      if (isConnected && address) {
        const [addresses, registered] = await Promise.all([
          getRegisteredWallets(),
          isRegistered(address)
        ]);
        setWalletAddresses(addresses);
        setIsUserRegistered(registered);
      }
    };

    fetchData();

    // Set up event listeners
    const unsubscribeRegistration = setupRegistrationEventListener(() => {
      fetchData();
    });

    const unsubscribeDeregistration = setupDeregistrationEventListener(() => {
      fetchData();
    });

    return () => {
      unsubscribeRegistration();
      unsubscribeDeregistration();
    };
  }, [isConnected, address]);

  // Render states for different scenarios
  if (!isConnected) {
    return (
      <div className="min-h-screen w-full p-5 flex items-center justify-center">
        <div>Connect Wallet To Start</div>
      </div>
    );
  }

  if (!isUserRegistered) {
    return (
      <div className="min-h-screen w-full p-5 flex items-center justify-center">
        <RegisterButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-5">
      <div className="flex flex-wrap gap-4 content-start mt-[80px]">
        {walletAddresses.map((address) => (
          <User key={address} walletAddress={address} />
        ))}
      </div>
    </div>
  );
};
```

Key features:
1. Manages application state (wallet connection, registration)
2. Fetches and maintains list of registered users
3. Sets up event listeners for registration changes
4. Renders appropriate UI based on user state, exactly one of the following:
   - Wallet connection prompt
   - Registration button
   - Grid of registered users

### User Component
This component represents a registered user that can receive gMammoth messages:

> Colors are generated randomly, using predefined values in `taildind.congig.ts`.

```typescript:nextjs-ui/app/components/User.tsx
const User = memo(({ walletAddress }: UserProps) => {
    const [isPressed, setIsPressed] = useState(false);
    const [txActive, setTxActive] = useState(false);
    const [colorClasses, setColorClasses] = useState({
        bg: '',
        border: '',
        shadow: ''
    });

    // Generate random colors on mount
    useEffect(() => {
        const getUniqueRandomColors = () => {
            const colors = ['box1', 'box2', 'box3', 'box4', 'box5'];
            const selected = [];
            
            for (let i = 0; i < 3; i++) {
                const randomIndex = Math.floor(Math.random() * colors.length);
                selected.push(colors[randomIndex]);
                colors.splice(randomIndex, 1);
            }
            
            return selected;
        };

        const [bgColor, borderColor, shadowColor] = getUniqueRandomColors();
        setColorClasses({
            bg: `bg-${bgColor}`,
            border: `border-${borderColor}`,
            shadow: `shadow-${shadowColor}`
        });
    }, []);

    const doSendgMammoth = async () => {
        setTxActive(true);
        try {
            await sendGMammoth(walletAddress);
        } catch (error) {
            console.error('Transaction failed:', error);
        } finally {
            setTxActive(false);
        }
    };

    return (
        <div
            className={clsx(
                'relative w-[150px] h-[150px]',
                'cursor-pointer transition-all duration-300',
                'shadow-lg hover:shadow-xl border-4',
                'overflow-hidden rounded-xl',
                colorClasses.bg,
                colorClasses.border,
                colorClasses.shadow,
                { 'transform scale-95': isPressed }
            )}
            onClick={() => {
                if (!txActive) {
                    setIsPressed(true);
                    doSendgMammoth();
                    setTimeout(() => setIsPressed(false), 200);
                }
            }}
        >
            {txActive ? (
                <Image
                    src="/mammoth.png"
                    alt="Mammoth"
                    fill
                    className={`object-cover ${txActive ? 'animate-pulse' : ''}`}
                    priority
                />
            ) : (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-8">
                    Send gMammoth
                </div>
            )}
            <div className="absolute bottom-[20%] text-center bg-black/70 text-white py-1 px-2">
                {formatAddress(walletAddress)}
            </div>
        </div>
    );
});
```

Key features:
- Visual feedback during message sending
- Random color generation for visual funkiness
- Transaction state management
- Click animation effects

### useRegistrationStatus hook
This hook manages user registration state**:**

```typescript:nextjs-ui/app/hooks/useRegistrationStatus.ts
import { useEffect, useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { isRegistered, setupRegistrationEventListener } from '../utils/contractInteractions';

export const useRegistrationStatus = () => {
  const { address } = useAccount();
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (address) {
      const registered = await isRegistered(address);
      setIsUserRegistered(registered);
    }
  }, [address]);

  useEffect(() => {
    const checkRegistration = async () => {
      if (address) {
        const registered = await isRegistered(address);
        setIsUserRegistered(registered);
      }
      setLoading(false);
    };

    checkRegistration();

    // Set up event listener for registration changes
    let unsubscribeRegistration: (() => void) | undefined;
    if (address) {
      unsubscribeRegistration = setupRegistrationEventListener(() => {
        checkRegistration();
      });
    }

    return () => {
      if (unsubscribeRegistration) {
        unsubscribeRegistration();
      }
    };
  }, [address]);

  return { isUserRegistered, loading, refetch };
};
```

Key features:
- Manages registration state for the connected wallet
- Provides loading state for initial check
- Automatically listens for registration events

This hook is used throughout the application:
- In `TopNav` to show/hide the deregister button
- In `MainContent` to determine which view to render
- In other components that need to check registration status


### ToastMessage Component
This component provides user feedback for transactions and events. It is called by the `setupGMammothEventListener` function's callback.

```typescript:nextjs-ui/app/components/ToastMessage.tsx
import React from 'react';

export const ToastMessage = ({ fromAddress }: { fromAddress: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <div style={{ fontSize: '2em', marginBottom: '4px' }}>
      <span style={{ marginRight: '8px' }}>🦣</span>
      <span style={{ fontWeight: 'bold' }}>gMammoth!</span>
    </div>
    <div style={{ fontSize: '0.8em', opacity: 0.8 }}>
      - <span style={{ wordBreak: 'break-all' }}>{fromAddress}</span>
    </div>
  </div>
); 
```

The toast notifications are used throughout the app to provide feedback for:
- gMammoth received
- Successful message sending
- Transaction errors

This completes our frontend implementation, providing a full user experience from wallet connection through message sending with real-time feedback.

## Conclusion

### Building on gMammoth

You can use gMammoth as a starting point for your own Mammothathon project. Here are some ideas:

1. **Enhanced Messaging**
   - Add message content and media support
   - Implement message history storage
   - Add group messaging capabilities

2. **Social Features**
   - User profiles and avatars
   - Friend lists and following system
   - Message reactions

3. **Different Project Ideas**
   - A voting system using events for real-time results
   - A decentralized auction platform with live bid notifications
   - A gaming leaderboard with instant score updates
   - A notification system for DAO proposals
   - A real-time price feed aggregator

To get started:
1. Fork the [gMammoth repository](TODO)
2. Use the deployment scripts for your own contracts
3. Modify the frontend components as needed
4. Keep the event-based architecture for real-time features

### More Mammothathon Examples

Check out [Moving Mammoths](https://youtu.be/3bYnlqMphXQ), a game built using the Movement network and use it as a starting point for your own crypto-game projects. 

### Getting Support

Need help with your Mammothathon project?
- Join the [Celestia Discord](https://discord.gg/celestiacommunity)
- Check the #developers channel for technical discussions
- Ask questions in #mammothathon for hackathon-specific support

Remember to check the [Celestia docs](https://docs.celestia.org) for detailed guides and references.

