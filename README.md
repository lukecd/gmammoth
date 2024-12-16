# gMammoth 🦣

*Ancient giants roam*  
*Through frost-covered valleys wide*  
*gMammoth, they trumpet*

![gMammoth](/assets/gMammoth.png)

## About

gMammoth is a demo project for [redacted]. 

It's a minimalist messaging dApp inspired by the straangly viral app ["Yo"](https://en.wikipedia.org/wiki/Yo_(app)) from 2014. gMammoth is built on top of Celestia's data availability layer and deployed to the Astria Flame testnet.

Just as Mammoths once traversed the tundra greeting each other with their mighty calls, Web3 users can now connect and share simple acknowledgments through the power of modular blockchains.

## Stack

### Celestia
Celestia is a modular blockchain network. It separates the consensus and data availability aspects of blockchain architecture from execution, allowing for more scalable and flexible blockchain deployments. By handling data availability as a specialized service, Celestia enables the creation of sovereign rollups and modular blockchain applications with improved scalability.

### Astria Flame Testnet
Astria Flame is a high-performance testnet that useds Celestia's data availability layer. It implements a unique "shared sequencer" architecture that:
- Provides fast transaction finality
- Ensures fair transaction ordering
- Enables seamless cross-chain communication
- Offers EVM compatibility for easy development

### Event-Based Messaging
Instead of traditional Web2 polling or websockets, gMammoth uses blockchain events for real-time message delivery:
- Messages are emitted as smart contract events on the Astria network
- The frontend listens for these events using event subscriptions
- The frontend receieves all messages and only displays a notification if the message is addressed to the user

## Features

- **Send gMammoth**: Send a "gMammoth" greeting to any registered user
- **Register**: Join the herd by registering your wallet to receive gMammoth messages
- **De-register**: Take a break from the herd by de-registering your wallet
- **Real-time Updates**: Receive gMammoth notifications instantly through smart contract events
- **View Active Users**: See all currently registered wallets in the herd

## Project Structure

This project consists of two main components:

- [`/nextjs-ui`](./nextjs-ui) - Frontend application built with Next.js 13+
- [`/foundry-contracts`](./foundry-contracts) - Smart contracts developed using Foundry

## Getting Started

1. Clone this repository
2. Follow the setup instructions in each component's README
3. Start sending gMammoths! 🦣

## License

MIT 
