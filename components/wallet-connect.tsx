'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { sepolia } from 'wagmi/chains';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut } from 'lucide-react';

export function WalletConnect() {
  const { address, isConnected, chainId } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const isWrongChain = isConnected && chainId !== sepolia.id;

  if (isConnected && address) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-neutral-100 rounded-lg">
            <div className={`w-2 h-2 rounded-full ${isWrongChain ? 'bg-red-500' : 'bg-green-500'}`} />
            <span className="font-mono text-sm">{formatAddress(address)}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => disconnect()}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect
          </Button>
        </div>
        
        {isWrongChain && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-medium">
              ⚠️ Wrong Network
            </p>
            <p className="text-xs text-red-600 mt-1">
              Please switch to Sepolia testnet in MetaMask to use this app
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <Button onClick={() => connect({ connector: injected({ target: 'metaMask' }) })} size="lg">
      <Wallet className="w-4 h-4 mr-2" />
      Connect MetaMask
    </Button>
  );
}
