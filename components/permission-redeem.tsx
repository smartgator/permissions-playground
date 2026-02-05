'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { redeemPermission, formatPermissionType, USDC_SEPOLIA } from '@/lib/smart-accounts';
import { Loader2, Send, ExternalLink } from 'lucide-react';
import type { createSessionAccount } from '@/lib/smart-accounts';
import type { PermissionRequest } from '@/lib/smart-accounts';
import type { Hex, Address } from 'viem';

interface PermissionRedeemProps {
  sessionAccount: Awaited<ReturnType<typeof createSessionAccount>> | null;
  grantedPermission: {
    context: Hex;
    signerMeta: { delegationManager: Address } | { delegationManager?: Address; userOpBuilder?: Address };
    params: PermissionRequest;
  } | null;
}

export function PermissionRedeem({ sessionAccount, grantedPermission }: PermissionRedeemProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRedeem = async () => {
    if (!sessionAccount || !grantedPermission) {
      setError('Session account and permission required');
      return;
    }
    if (!recipient || !recipient.startsWith('0x') || recipient.length !== 42) {
      setError('Please enter a valid recipient address (0x + 40 hex characters)');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const isNative = grantedPermission.params.type.includes('native');
      
      const userOpHash = await redeemPermission(
        sessionAccount,
        grantedPermission,
        {
          to: recipient as Address,
          amount,
          tokenAddress: isNative ? undefined : (grantedPermission.params.tokenAddress || USDC_SEPOLIA),
        }
      );
      
      setTxHash(userOpHash);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to redeem permission');
    } finally {
      setIsLoading(false);
    }
  };

  if (!grantedPermission) {
    return (
      <Card className="opacity-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Redeem Permission
          </CardTitle>
          <CardDescription>
            Execute a transfer using your granted permission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-500 text-center py-8">
            Grant a permission first to enable redemption
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Redeem Permission
        </CardTitle>
        <CardDescription>
          Execute a transfer using your {formatPermissionType(grantedPermission.params.type)} permission
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-blue-50 rounded border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Permission:</strong> {formatPermissionType(grantedPermission.params.type)}
          </p>
          <p className="text-sm text-blue-800">
            <strong>Max Amount:</strong> {grantedPermission.params.amount} {' '}
            {grantedPermission.params.type.includes('native') ? 'ETH' : 'tokens'}
            {grantedPermission.params.periodDuration && ' per period'}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="recipient">Recipient Address</Label>
          <Input
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sendAmount">
            Amount to Send ({grantedPermission.params.type.includes('native') ? 'ETH' : 'tokens'})
          </Label>
          <Input
            id="sendAmount"
            type="number"
            step="0.001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.001"
          />
          <p className="text-sm text-neutral-500">
            Must be within your granted permission limits
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded">
            {error}
          </div>
        )}

        {txHash && (
          <div className="p-3 bg-green-50 text-green-700 text-sm rounded">
            <p className="font-medium mb-1">Transaction submitted!</p>
            <p className="font-mono text-xs break-all">{txHash}</p>
            <a 
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-green-600 hover:text-green-800"
            >
              View on Etherscan <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        <Button 
          onClick={handleRedeem} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting Transaction...
            </>
          ) : (
            'Execute Transfer'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
