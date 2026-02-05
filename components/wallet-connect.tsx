'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut } from 'lucide-react';

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-neutral-100 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
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
    );
  }

  return (
    <Button onClick={() => connect({ connector: injected({ target: 'metaMask' }) })} size="lg">
      <Wallet className="w-4 h-4 mr-2" />
      Connect MetaMask
    </Button>
  );
}
