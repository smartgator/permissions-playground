'use client';

import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  PermissionType, 
  PermissionRequest, 
  createPermissionParams, 
  requestPermissions,
  formatPermissionType,
  USDC_SEPOLIA 
} from '@/lib/smart-accounts';
import { Loader2, Shield, CheckCircle } from 'lucide-react';
import type { createSessionAccount } from '@/lib/smart-accounts';

interface PermissionRequestProps {
  sessionAccount: Awaited<ReturnType<typeof createSessionAccount>> | null;
  onPermissionGranted: (permission: {
    context: `0x${string}`;
    signerMeta: { delegationManager: `0x${string}` };
    params: PermissionRequest;
  }) => void;
  grantedPermission: {
    context: `0x${string}`;
    signerMeta: { delegationManager: `0x${string}` };
    params: PermissionRequest;
  } | null;
}

export function PermissionRequestManager({ 
  sessionAccount, 
  onPermissionGranted,
  grantedPermission 
}: PermissionRequestProps) {
  const { isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  const [permissionType, setPermissionType] = useState<PermissionType>('erc20-token-periodic');
  const [tokenAddress, setTokenAddress] = useState<string>(USDC_SEPOLIA);
  const [amount, setAmount] = useState('');
  const [periodDuration, setPeriodDuration] = useState<string>('86400'); // 1 day in seconds
  const [justification, setJustification] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsTokenAddress = permissionType.includes('erc20');
  const needsPeriodDuration = permissionType.includes('periodic');

  const handleRequestPermission = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }
    if (!sessionAccount) {
      setError('Please create a session account first');
      return;
    }
    if (!walletClient) {
      setError('Wallet not available');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!justification.trim()) {
      setError('Please provide a justification for the permission');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const request: PermissionRequest = {
        type: permissionType,
        tokenAddress: needsTokenAddress ? (tokenAddress as `0x${string}`) : undefined,
        amount,
        periodDuration: needsPeriodDuration ? parseInt(periodDuration) : undefined,
        justification,
      };

      const expiry = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 1 week
      const params = createPermissionParams(request, sessionAccount.address, expiry);
      
      const granted = await requestPermissions(walletClient, params);
      
      if (granted && granted.length > 0) {
        onPermissionGranted({
          context: granted[0].context,
          signerMeta: granted[0].signerMeta,
          params: request,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request permission');
    } finally {
      setIsLoading(false);
    }
  };

  if (grantedPermission) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            Permission Granted
          </CardTitle>
          <CardDescription>
            Your session account has been granted {formatPermissionType(grantedPermission.params.type)} permission
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-green-700">Permission Type</Label>
            <div className="p-3 bg-white rounded border border-green-200">
              {formatPermissionType(grantedPermission.params.type)}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-green-700">Amount</Label>
            <div className="p-3 bg-white rounded border border-green-200">
              {grantedPermission.params.amount} {grantedPermission.params.type.includes('native') ? 'ETH' : 'tokens'}
            </div>
          </div>
          {grantedPermission.params.periodDuration && (
            <div className="space-y-2">
              <Label className="text-green-700">Period</Label>
              <div className="p-3 bg-white rounded border border-green-200">
                Every {Math.floor(grantedPermission.params.periodDuration / 3600)} hours
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Step 3: Request Permission
        </CardTitle>
        <CardDescription>
          Request advanced permissions from your MetaMask wallet via ERC-7715
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Permission Type</Label>
          <Select 
            value={permissionType} 
            onValueChange={(v) => setPermissionType(v as PermissionType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="erc20-token-periodic">ERC-20 Periodic (e.g., 10 USDC/day)</SelectItem>
              <SelectItem value="erc20-token-allowance">ERC-20 Allowance (e.g., 100 USDC total)</SelectItem>
              <SelectItem value="native-token-periodic">Native Token Periodic (e.g., 0.01 ETH/day)</SelectItem>
              <SelectItem value="native-token-allowance">Native Token Allowance (e.g., 0.1 ETH total)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {needsTokenAddress && (
          <div className="space-y-2">
            <Label htmlFor="tokenAddress">Token Address</Label>
            <Input
              id="tokenAddress"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              placeholder="0x..."
              className="font-mono"
            />
            <p className="text-sm text-neutral-500">
              Default: Sepolia USDC
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="amount">
            {permissionType.includes('native') ? 'Amount (ETH)' : 'Amount'}
          </Label>
          <Input
            id="amount"
            type="number"
            step="0.001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={permissionType.includes('native') ? "0.01" : "10"}
          />
        </div>

        {needsPeriodDuration && (
          <div className="space-y-2">
            <Label htmlFor="periodDuration">Period Duration (seconds)</Label>
            <Select 
              value={periodDuration} 
              onValueChange={(v: string) => setPeriodDuration(v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3600">1 hour</SelectItem>
                <SelectItem value="86400">1 day</SelectItem>
                <SelectItem value="604800">1 week</SelectItem>
                <SelectItem value="2592000">30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="justification">Justification</Label>
          <Input
            id="justification"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Why do you need this permission?"
          />
          <p className="text-sm text-neutral-500">
            This will be shown to the user in MetaMask&apos;s permission UI
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded">
            {error}
          </div>
        )}

        <Button 
          onClick={handleRequestPermission} 
          disabled={isLoading || !isConnected || !sessionAccount}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Requesting from MetaMask...
            </>
          ) : (
            'Request Permission'
          )}
        </Button>

        {!isConnected && (
          <p className="text-sm text-amber-600 text-center">
            Connect your wallet first to request permissions
          </p>
        )}
        {!sessionAccount && isConnected && (
          <p className="text-sm text-amber-600 text-center">
            Create a session account first
          </p>
        )}
      </CardContent>
    </Card>
  );
}
