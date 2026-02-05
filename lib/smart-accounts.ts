import { createPublicClient, http, parseUnits, parseEther, encodeFunctionData, erc20Abi } from 'viem';
import { sepolia } from 'wagmi/chains';
import { 
  toMetaMaskSmartAccount, 
  Implementation,
  createDelegation,
} from '@metamask/smart-accounts-kit';
import { 
  erc7715ProviderActions,
  erc7710BundlerActions 
} from '@metamask/smart-accounts-kit/actions';
import { createBundlerClient } from 'viem/account-abstraction';
import { privateKeyToAccount } from 'viem/accounts';
import type { Address, Hex } from 'viem';
import type { WalletClient, PublicClient } from 'viem';

// Sepolia USDC contract address
export const USDC_SEPOLIA = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as const;

// Create public client
export function createSepoliaClient(): PublicClient {
  return createPublicClient({
    chain: sepolia,
    transport: http(),
  }) as PublicClient;
}

// Create session account
export async function createSessionAccount(signerAccount: ReturnType<typeof privateKeyToAccount>) {
  const client = createSepoliaClient();
  
  const sessionAccount = await toMetaMaskSmartAccount({
    client,
    implementation: Implementation.Hybrid,
    deployParams: [signerAccount.address, [], [], []],
    deploySalt: '0x',
    signer: { account: signerAccount },
  });
  
  return sessionAccount;
}

// Permission types supported by MetaMask
export type PermissionType = 
  | 'erc20-token-periodic'
  | 'erc20-token-streaming'
  | 'native-token-periodic'
  | 'native-token-streaming';

// Permission request parameters
export interface PermissionRequest {
  type: PermissionType;
  tokenAddress?: Address;
  amount: string;
  periodDuration?: number; // in seconds
  initialAmount?: string;
  maxAmount?: string;
  startTime?: number;
  justification: string;
}

// Create permission request params
export function createPermissionParams(
  request: PermissionRequest,
  sessionAccountAddress: Address,
  expiry: number,
  isAdjustmentAllowed: boolean = true
): any {
  const baseParams = {
    chainId: sepolia.id,
    expiry,
    signer: {
      type: 'account' as const,
      data: { address: sessionAccountAddress },
    },
    isAdjustmentAllowed,
  };

  switch (request.type) {
    case 'erc20-token-periodic':
      return {
        ...baseParams,
        permission: {
          type: 'erc20-token-periodic' as const,
          data: {
            tokenAddress: request.tokenAddress || USDC_SEPOLIA,
            periodAmount: parseUnits(request.amount, 6),
            periodDuration: request.periodDuration || 86400,
            justification: request.justification,
          },
        },
      };

    case 'erc20-token-streaming':
      const erc20StreamingData: any = {
        tokenAddress: request.tokenAddress || USDC_SEPOLIA,
        amountPerSecond: parseUnits(request.amount, 6),
        justification: request.justification,
      };
      if (request.initialAmount) {
        erc20StreamingData.initialAmount = parseUnits(request.initialAmount, 6);
      }
      if (request.maxAmount) {
        erc20StreamingData.maxAmount = parseUnits(request.maxAmount, 6);
      }
      if (request.startTime) {
        erc20StreamingData.startTime = request.startTime;
      }
      return {
        ...baseParams,
        permission: {
          type: 'erc20-token-streaming' as const,
          data: erc20StreamingData,
        },
      };

    case 'native-token-periodic':
      return {
        ...baseParams,
        permission: {
          type: 'native-token-periodic' as const,
          data: {
            periodAmount: parseEther(request.amount),
            periodDuration: request.periodDuration || 86400,
            justification: request.justification,
          },
        },
      };

    case 'native-token-streaming':
      const nativeStreamingData: any = {
        amountPerSecond: parseEther(request.amount),
        justification: request.justification,
      };
      if (request.initialAmount) {
        nativeStreamingData.initialAmount = parseEther(request.initialAmount);
      }
      if (request.maxAmount) {
        nativeStreamingData.maxAmount = parseEther(request.maxAmount);
      }
      if (request.startTime) {
        nativeStreamingData.startTime = request.startTime;
      }
      return {
        ...baseParams,
        permission: {
          type: 'native-token-streaming' as const,
          data: nativeStreamingData,
        },
      };

    default:
      throw new Error(`Unsupported permission type: ${request.type}`);
  }
}

// Request permissions via MetaMask
export async function requestPermissions(
  walletClient: WalletClient,
  permissionParams: ReturnType<typeof createPermissionParams>
) {
  const client = walletClient.extend(erc7715ProviderActions());
  
  const grantedPermissions = await client.requestExecutionPermissions([permissionParams]);
  
  return grantedPermissions;
}

// Get bundler RPC URL from environment
function getBundlerUrl(): string {
  const bundlerUrl = process.env.NEXT_PUBLIC_BUNDLER_RPC_URL;
  if (!bundlerUrl) {
    throw new Error(
      'NEXT_PUBLIC_BUNDLER_RPC_URL environment variable is required. ' +
      'Please set it to your bundler RPC URL (e.g., https://api.pimlico.io/v2/sepolia/rpc). ' +
      'See https://docs.pimlico.io/ for more information.'
    );
  }
  return bundlerUrl;
}

// Redeem permission - execute transfer
export async function redeemPermission(
  sessionAccount: Awaited<ReturnType<typeof createSessionAccount>>,
  grantedPermission: {
    context: Hex;
    signerMeta: { delegationManager: Address } | { delegationManager?: Address; userOpBuilder?: Address };
  },
  transferParams: {
    to: Address;
    amount: string;
    tokenAddress?: Address;
  }
) {
  const publicClient = createSepoliaClient();
  
  // Create bundler client with permission actions
  const bundlerClient = createBundlerClient({
    client: publicClient,
    transport: http(getBundlerUrl()),
    paymaster: true,
  }).extend(erc7710BundlerActions());

  // Encode transfer calldata
  const isNativeToken = !transferParams.tokenAddress;
  
  let calldata: Hex;
  if (isNativeToken) {
    // Native token transfer
    calldata = '0x' as Hex;
  } else {
    // ERC-20 transfer
    calldata = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'transfer',
      args: [transferParams.to, parseUnits(transferParams.amount, 6)],
    });
  }

  // Extract delegationManager from signerMeta
  const delegationManager = 'delegationManager' in grantedPermission.signerMeta 
    ? grantedPermission.signerMeta.delegationManager 
    : undefined;

  if (!delegationManager) {
    throw new Error('delegationManager not found in granted permission');
  }

  // Send user operation with delegation
  const userOpHash = await bundlerClient.sendUserOperationWithDelegation({
    publicClient: publicClient as any,
    account: sessionAccount,
    calls: [
      {
        to: transferParams.tokenAddress || transferParams.to,
        data: calldata,
        permissionsContext: grantedPermission.context,
        delegationManager,
        value: isNativeToken ? parseEther(transferParams.amount) : 0n,
      },
    ],
  });

  return userOpHash;
}

// Format permission type for display
export function formatPermissionType(type: PermissionType): string {
  const labels: Record<PermissionType, string> = {
    'erc20-token-periodic': 'ERC-20 Periodic',
    'erc20-token-streaming': 'ERC-20 Streaming',
    'native-token-periodic': 'Native Token Periodic',
    'native-token-streaming': 'Native Token Streaming',
  };
  return labels[type];
}
