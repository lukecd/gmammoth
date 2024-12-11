# gMammoth Smart Contracts 🦣

The smart contract for gMammoth, built using Foundry.

## Contract Overview

The gMammoth contract manages user registration and message events on the blockchain. It maintains:

- A registry of user addresses that can receive gMammoth messages
- Event emission for sent messages
- Registration/de-registration functionality

## Key Features

- **Registration Management**: Users can register/de-register to receive messages
- **Event Emission**: Emits events when messages are sent between users
- **Access Control**: Only registered users can send messages
- **Gas Efficient**: Optimized for minimal gas usage

## Installation

```bash
# Clone the repository
git clone https://github.com/your-username/gmammoth.git
cd gmammoth/foundry-contracts

# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install dependencies
forge install

# Build the contracts
forge build

# Run tests
forge test
```

## Development

This project uses [Foundry](https://getfoundry.sh/) for development and testing.

### Setup

1. Install Foundry:

```bash
# Start local node
anvil

# Deploy contract (in a new terminal)
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
```

## Deployment to Astria Flame

To deploy to Astria Flame testnet:

1. Set up your environment variables:
```bash
export PRIVATE_KEY=your_private_key
export ASTRIA_RPC_URL=https://rpc.flame.dawn-1.astria.org
```

2. Set up MetaMask for Astria Flame:
Open MetaMask and click "Add A Custom Network" 

| Property        | Value                                   |
|-----------------|------------------------------------------|
| Network Name    | Flame Testnet                            |
| New RPC URL     | https://rpc.flame.dawn-1.astria.org      |
| Chain ID        | 16604737732183                           |
| Currency symbol | TIA                                      |
| Block Explorer  | https://explorer.flame.dawn-1.astria.org |

3. Get test tokens:
- Visit the [Astria Faucet] https://faucet.flame.dawn-1.astria.org/)
- Connect your wallet and request test TIA tokens
- You can also bridge tokens from Celestia's Mocha testnet using the [Astria Bridge](https://astria-bridge-web-app-dawn.vercel.app/)

4. Deploy the contract:
```bash
forge script script/GMammoth.s.sol \
    --rpc-url $ASTRIA_RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast
```

Save the contract address and store it in the `nextjs-ui/app/config/contracts.ts` file.

5. Verify your contract (optional):
```bash
forge verify-contract \
    <DEPLOYED_CONTRACT_ADDRESS> \
    src/GMammoth.sol:GMammoth \
    --chain-id 16604737732183 \
    --verifier blockscout \
    --verifier-url https://explorer.flame.dawn-1.astria.org/api \
    --constructor-args $(cast abi-encode "constructor()")
```

## Testing

Run the test suite:

```bash
# Run all tests
forge test

# Run tests with verbosity
forge test -vv

# Run specific test
forge test --match-test testFunctionName
```



