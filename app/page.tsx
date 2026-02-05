"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { WalletConnect } from "@/components/wallet-connect";
import { SessionAccountManager } from "@/components/session-account";
import { PermissionRequestManager } from "@/components/permission-request";
import { PermissionRedeem } from "@/components/permission-redeem";
import { createSessionAccount, PermissionRequest } from "@/lib/smart-accounts";
import type { Hex, Address } from "viem";

interface GrantedPermission {
  context: Hex;
  signerMeta: { delegationManager: Address };
  params: PermissionRequest;
}

export default function Home() {
  const { isConnected } = useAccount();
  const [sessionAccount, setSessionAccount] = useState<Awaited<ReturnType<typeof createSessionAccount>> | null>(null);
  const [grantedPermission, setGrantedPermission] = useState<GrantedPermission | null>(null);

  const handleSessionAccountCreated = (account: Awaited<ReturnType<typeof createSessionAccount>>) => {
    setSessionAccount(account);
  };

  const handlePermissionGranted = (permission: GrantedPermission) => {
    setGrantedPermission(permission);
  };

  const handleClearPermission = () => {
    setGrantedPermission(null);
    setSessionAccount(null);
  };

  const getStepStatus = () => {
    if (!isConnected) return 1;
    if (!sessionAccount) return 2;
    if (!grantedPermission) return 3;
    return 4;
  };

  const stepStatus = getStepStatus();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Permissions Playground
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore MetaMask Smart Accounts with ERC-7715 permissions. 
            Request and redeem permissions for ERC-20 and native token transfers on Sepolia.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              stepStatus > 1 ? "bg-green-500 text-white" : stepStatus === 1 ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
            }`}>
              1
            </div>
            <div className={`w-12 h-0.5 ${stepStatus > 1 ? "bg-green-500" : "bg-gray-300"}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              stepStatus > 2 ? "bg-green-500 text-white" : stepStatus === 2 ? "bg-blue-600 text-white" : stepStatus > 2 ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
            }`}>
              2
            </div>
            <div className={`w-12 h-0.5 ${stepStatus > 2 ? "bg-green-500" : "bg-gray-300"}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              stepStatus > 3 ? "bg-green-500 text-white" : stepStatus === 3 ? "bg-blue-600 text-white" : stepStatus === 4 ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
            }`}>
              3
            </div>
            <div className={`w-12 h-0.5 ${stepStatus > 3 ? "bg-green-500" : "bg-gray-300"}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              stepStatus === 4 ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
            }`}>
              4
            </div>
          </div>
        </div>

        <div className="text-center mb-8 text-sm text-gray-500">
          <span className={stepStatus === 1 ? "font-medium text-blue-600" : stepStatus > 1 ? "text-green-600" : ""}>Connect Wallet</span>
          <span className="mx-4">→</span>
          <span className={stepStatus === 2 ? "font-medium text-blue-600" : stepStatus > 2 ? "text-green-600" : ""}>Create Session</span>
          <span className="mx-4">→</span>
          <span className={stepStatus === 3 ? "font-medium text-blue-600" : stepStatus > 3 ? "text-green-600" : ""}>Request Permission</span>
          <span className="mx-4">→</span>
          <span className={stepStatus === 4 ? "font-medium text-green-600" : ""}>Redeem</span>
        </div>

        {/* Main Content Cards */}
        <div className="grid gap-8">
          {/* Step 1: Connect Wallet */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold mb-2">Step 1: Connect Wallet</h2>
                <p className="text-gray-600">Connect your MetaMask wallet to get started</p>
              </div>
              <WalletConnect />
            </div>
          </section>

          {/* Step 2: Create Session Account */}
          {isConnected && (
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <SessionAccountManager 
                onSessionAccountCreated={handleSessionAccountCreated}
                sessionAccount={sessionAccount}
              />
            </section>
          )}

          {/* Step 3: Request Permission */}
          {isConnected && sessionAccount && (
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <PermissionRequestManager 
                sessionAccount={sessionAccount}
                onPermissionGranted={handlePermissionGranted}
                grantedPermission={grantedPermission}
              />
            </section>
          )}

          {/* Step 4: Redeem Permission */}
          {isConnected && sessionAccount && (
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <PermissionRedeem 
                sessionAccount={sessionAccount}
                grantedPermission={grantedPermission}
              />
              {grantedPermission && (
                <div className="mt-4 text-center">
                  <button 
                    onClick={handleClearPermission}
                    className="text-sm text-red-500 hover:text-red-700 underline"
                  >
                    Start Over (Clear All)
                  </button>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Info Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p className="mb-2">
            Built with Next.js 15, Wagmi v2, and MetaMask Smart Accounts Kit v0.3.0
          </p>
          <p>
            Test on Sepolia. USDC Contract: 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
          </p>
        </footer>
      </div>
    </main>
  );
}
