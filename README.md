# Permissions Playground

A Next.js application for exploring MetaMask Smart Accounts with ERC-7715 permissions. Request and redeem permissions for ERC-20 and native token transfers on the Sepolia testnet.

## Features

- **Wallet Connection**: Connect your MetaMask wallet to the Sepolia testnet
- **Session Accounts**: Create session accounts that receive permissions from your main wallet
- **Permission Requests**: Request 4 types of MetaMask-supported ERC-7715 permissions:
  - `erc20-token-periodic`: Periodic allowance for ERC-20 tokens (e.g., 10 USDC/day)
  - `erc20-token-streaming`: Linear streaming rate for ERC-20 tokens (tokens accrue per second)
  - `native-token-periodic`: Periodic allowance for native tokens (e.g., 0.01 ETH/day)
  - `native-token-streaming`: Linear streaming rate for native tokens (ETH accrues per second)
- **Permission Redemption**: Execute transfers using granted permissions

## Tech Stack

- [Next.js 15](https://nextjs.org/)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Wagmi v2](https://wagmi.sh/) - React Hooks for Ethereum
- [Viem](https://viem.sh/) - TypeScript Interface for Ethereum
- [MetaMask Smart Accounts Kit v0.3.0](https://github.com/MetaMask/smart-accounts-kit) - ERC-7715 implementation
- [Radix UI](https://www.radix-ui.com/) - Headless UI components

## Prerequisites

- [Node.js](https://nodejs.org/) 18.17 or later
- [MetaMask](https://metamask.io/) browser extension
- Sepolia testnet ETH (get from [Sepolia Faucet](https://sepoliafaucet.com/))

## Setup Instructions

### 1. Clone and Navigate to Project

```bash
cd /path/to/permissions-playground/my-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root:

```bash
# Optional: Alchemy or Infura RPC for better reliability
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

If not provided, the app will use public Sepolia RPC endpoints.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
npm run build
```

## Usage Guide

### Step 1: Connect Your Wallet

1. Click "Connect MetaMask"
2. Switch to the Sepolia testnet in MetaMask
3. Ensure you have some Sepolia ETH for gas fees

### Step 2: Create a Session Account

1. Click "Generate" to create a random private key for the session account
2. Click "Create Session Account"
3. This burner account will hold the permissions but no funds

### Step 3: Request Permission

1. Select a permission type:
   - **ERC-20 Periodic**: For recurring transfers (e.g., subscription payments)
   - **ERC-20 Streaming**: For continuous streaming transfers (tokens accrue linearly)
   - **Native Token Periodic**: For recurring ETH transfers
   - **Native Token Streaming**: For continuous ETH streaming (ETH accrues linearly)
2. Enter the token amount
3. Select period duration (for periodic permissions)
4. Provide a justification for the permission
5. Click "Request Permission"
6. Approve the permission in MetaMask

### Step 4: Redeem Permission

1. Enter a recipient address
2. Enter the amount to transfer
3. Click "Execute Transfer"
4. The session account will execute the transfer using the granted permission

## Smart Contract Addresses (Sepolia)

- **USDC**: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`

## Architecture

```
app/
├── page.tsx              # Main page with 4-step flow
├── layout.tsx            # Root layout with Providers
├── providers.tsx         # Wagmi and React Query setup
├── globals.css           # Tailwind styles
components/
├── wallet-connect.tsx    # MetaMask connection button
├── session-account.tsx   # Session account creation
├── permission-request.tsx # Permission request form
├── permission-redeem.tsx # Permission redemption
└── ui/                   # Reusable UI components
lib/
└── smart-accounts.ts     # ERC-7715 utilities
```

## Key Concepts

### ERC-7715 Permissions

ERC-7715 is a standard for permissioned execution in Ethereum. It allows users to grant specific permissions to session accounts with:
- Time-bound validity
- Spending limits
- Periodic or one-time allowances
- Built-in justification display

### Session Accounts

Session accounts are smart contract accounts that:
- Hold delegated permissions from the main account
- Can execute transactions within granted permission boundaries
- Don't hold funds themselves
- Can be revoked at any time by the main account

### Delegation Flow

1. User creates a session account (burner key)
2. User requests permission from MetaMask via `wallet_requestExecutionPermissions`
3. MetaMask grants permission with a delegation context
4. Session account uses the delegation to execute transfers via ERC-4337 user operations

## Troubleshooting

### MetaMask Not Detected
- Ensure MetaMask extension is installed and unlocked
- Refresh the page after unlocking MetaMask

### Wrong Network
- The app requires Sepolia testnet
- MetaMask will prompt you to switch networks automatically

### Permission Request Fails
- Ensure you have Sepolia ETH for gas
- Check that you're on the Sepolia network
- Verify the token contract address is valid

### Transaction Reverts
- Check that the amount is within your granted permission limits
- Verify the recipient address is valid
- Ensure you have sufficient token/ETH balance

## Resources

- [ERC-7715 Specification](https://eips.ethereum.org/EIPS/eip-7715)
- [MetaMask Smart Accounts Documentation](https://docs.metamask.io/)
- [Wagmi Documentation](https://wagmi.sh/react/getting-started)
- [Sepolia Testnet Explorer](https://sepolia.etherscan.io/)

## License

MIT
