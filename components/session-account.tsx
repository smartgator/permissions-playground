'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createSessionAccount } from '@/lib/smart-accounts';
import { privateKeyToAccount } from 'viem/accounts';
import { Loader2, Key } from 'lucide-react';

interface SessionAccountProps {
  onSessionAccountCreated: (account: Awaited<ReturnType<typeof createSessionAccount>>) => void;
  sessionAccount: Awaited<ReturnType<typeof createSessionAccount>> | null;
}

export function SessionAccountManager({ onSessionAccountCreated, sessionAccount }: SessionAccountProps) {
  const [privateKey, setPrivateKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateSession = async () => {
    if (!privateKey.startsWith('0x') || privateKey.length !== 66) {
      setError('Please enter a valid private key (0x + 64 hex characters)');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const signerAccount = privateKeyToAccount(privateKey as `0x${string}`);
      const sessionAcc = await createSessionAccount(signerAccount);
      onSessionAccountCreated(sessionAcc);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session account');
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomKey = () => {
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const hex = '0x' + Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    setPrivateKey(hex);
    setError(null);
  };

  if (sessionAccount) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            Session Account Active
          </CardTitle>
          <CardDescription>
            Your session account is ready to receive permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Session Account Address</Label>
            <code className="block p-3 bg-neutral-100 rounded text-sm font-mono break-all">
              {sessionAccount.address}
            </code>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          Create Session Account
        </CardTitle>
        <CardDescription>
          Create a session account that will receive permissions from your main wallet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="privateKey">Session Account Private Key</Label>
          <div className="flex gap-2">
            <Input
              id="privateKey"
              type="password"
              placeholder="0x..."
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              className="font-mono"
            />
            <Button variant="outline" onClick={generateRandomKey} type="button">
              Generate
            </Button>
          </div>
          <p className="text-sm text-neutral-500">
            This is a burner key for the session account. It won&apos;t hold any funds.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded">
            {error}
          </div>
        )}

        <Button 
          onClick={handleCreateSession} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Session...
            </>
          ) : (
            'Create Session Account'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
