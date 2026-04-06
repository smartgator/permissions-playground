'use client';

import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { sepolia } from 'wagmi/chains';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, ArrowLeftRight } from 'lucide-react';

export function WalletConnect() {
  const { address, isConnected, chainId } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

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
          {isWrongChain && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => switchChain({ chainId: sepolia.id })}
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              Switch to Sepolia
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => disconnect()}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect
          </Button>
        </div>
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
