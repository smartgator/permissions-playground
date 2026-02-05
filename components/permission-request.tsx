'use client';

import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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
  const [initialAmount, setInitialAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [startTime, setStartTime] = useState('');
  const [justification, setJustification] = useState('');
  const [isAdjustmentAllowed, setIsAdjustmentAllowed] = useState(true);
  const [expiryDate, setExpiryDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsTokenAddress = permissionType.includes('erc20');
  const needsPeriodDuration = permissionType.includes('periodic');
  const isStreaming = permissionType.includes('streaming');

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
      // Convert local datetime to Unix timestamp (seconds)
      const expiryTimestamp = Math.floor(new Date(expiryDate).getTime() / 1000);
      
      // Convert startTime to timestamp if provided
      const startTimeTimestamp = startTime ? Math.floor(new Date(startTime).getTime() / 1000) : undefined;

      const request: PermissionRequest = {
        type: permissionType,
        tokenAddress: needsTokenAddress ? (tokenAddress as `0x${string}`) : undefined,
        amount,
        periodDuration: needsPeriodDuration ? parseInt(periodDuration) : undefined,
        initialAmount: isStreaming && initialAmount ? initialAmount : undefined,
        maxAmount: isStreaming && maxAmount ? maxAmount : undefined,
        startTime: isStreaming && startTimeTimestamp ? startTimeTimestamp : undefined,
        justification,
      };

      const params = createPermissionParams(
        request, 
        sessionAccount.address, 
        expiryTimestamp,
        isAdjustmentAllowed
      );
      
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
              <SelectItem value="erc20-token-streaming">ERC-20 Streaming (linear rate per second)</SelectItem>
              <SelectItem value="native-token-periodic">Native Token Periodic (e.g., 0.01 ETH/day)</SelectItem>
              <SelectItem value="native-token-streaming">Native Token Streaming (linear rate per second)</SelectItem>
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
            {permissionType.includes('streaming') 
              ? (permissionType.includes('native') ? 'Amount Per Second (ETH)' : 'Amount Per Second')
              : (permissionType.includes('native') ? 'Amount (ETH)' : 'Amount')
            }
          </Label>
          <Input
            id="amount"
            type="number"
            step="0.000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={permissionType.includes('streaming') ? "0.0001" : (permissionType.includes('native') ? "0.01" : "10")}
          />
        </div>

        {needsPeriodDuration && (
          <div className="space-y-2">
            <Label htmlFor="periodDuration">Period Duration</Label>
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

        {isStreaming && (
          <>
            <div className="space-y-2">
              <Label htmlFor="initialAmount">
                Initial Amount (Optional) {permissionType.includes('native') ? '(ETH)' : ''}
              </Label>
              <Input
                id="initialAmount"
                type="number"
                step="0.001"
                value={initialAmount}
                onChange={(e) => setInitialAmount(e.target.value)}
                placeholder="0"
              />
              <p className="text-sm text-neutral-500">
                Amount available immediately at start time (default: 0)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAmount">
                Max Amount (Optional) {permissionType.includes('native') ? '(ETH)' : ''}
              </Label>
              <Input
                id="maxAmount"
                type="number"
                step="0.001"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="No limit"
              />
              <p className="text-sm text-neutral-500">
                Maximum total amount that can be unlocked (default: no limit)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time (Optional)</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
              <p className="text-sm text-neutral-500">
                When streaming begins (default: current time)
              </p>
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="expiryDate">Expiry</Label>
          <Input
            id="expiryDate"
            type="datetime-local"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
          <p className="text-sm text-neutral-500">
            When the permission expires (default: 1 day from now)
          </p>
        </div>

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

        <div className="flex items-center gap-2 p-3 bg-neutral-50 rounded">
          <Checkbox
            id="isAdjustmentAllowed"
            checked={isAdjustmentAllowed}
            onCheckedChange={(checked) => setIsAdjustmentAllowed(checked as boolean)}
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="isAdjustmentAllowed" className="text-sm font-medium cursor-pointer">
              Allow user to adjust permission limits
            </Label>
            <p className="text-xs text-neutral-500">
              Users can modify the requested amounts in MetaMask
            </p>
          </div>
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
