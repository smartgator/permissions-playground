# Advanced Permissions Playground

A Next.js 15 application demonstrating MetaMask Smart Accounts with ERC-7715 Advanced Permissions.

## Features

- **Connect Wallet** - Connect with MetaMask (requires Flask 13.5.0+)
- **Create Session Account** - Generate a session smart account for receiving permissions
- **Request Permissions** - Request ERC-7715 permissions via MetaMask:
  - ERC-20 Periodic (e.g., 10 USDC/day)
  - ERC-20 Allowance (e.g., 100 USDC total)
  - Native Token Periodic (e.g., 0.01 ETH/day)
  - Native Token Allowance (e.g., 0.1 ETH total)
- **Redeem Permissions** - Execute transfers using granted permissions

## Tech Stack

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- Wagmi v2
- MetaMask Smart Accounts Kit v0.3.0
- Viem v2

## Getting Started

1. Install dependencies:
```bash
cd my-app
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Requirements

- MetaMask Flask 13.5.0+ installed
- User must be upgraded to MetaMask Smart Account
- Sepolia testnet ETH for gas

## Supported Permission Types

| Type | Description |
|------|-------------|
| `erc20-token-periodic` | Periodic ERC-20 transfers up to specified amount per time period |
| `erc20-token-allowance` | Total ERC-20 spending up to specified amount |
| `native-token-periodic` | Periodic native token (ETH) transfers per time period |
| `native-token-allowance` | Total native token (ETH) spending up to specified amount |

## Project Structure

```
my-app/
├── app/
│   ├── page.tsx          # Main page with permission flow
│   ├── layout.tsx        # Root layout
│   └── providers.tsx     # Wagmi provider setup
├── components/
│   ├── wallet-connect.tsx
│   ├── session-account.tsx
│   ├── permission-request.tsx
│   ├── permission-redeem.tsx
│   └── ui/               # UI components (Button, Card, Input, etc.)
├── lib/
│   ├── smart-accounts.ts # Smart accounts utilities
│   └── utils.ts          # Utility functions
└── types/
    └── global.d.ts       # Type declarations
```

## License

MIT
