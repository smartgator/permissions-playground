declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  export const Wallet: FC<SVGProps<SVGSVGElement>>;
  export const LogOut: FC<SVGProps<SVGSVGElement>>;
  export const Loader2: FC<SVGProps<SVGSVGElement>>;
  export const Key: FC<SVGProps<SVGSVGElement>>;
  export const Shield: FC<SVGProps<SVGSVGElement>>;
  export const CheckCircle: FC<SVGProps<SVGSVGElement>>;
  export const Send: FC<SVGProps<SVGSVGElement>>;
  export const ExternalLink: FC<SVGProps<SVGSVGElement>>;
  export const ChevronDown: FC<SVGProps<SVGSVGElement>>;
  export const ChevronUp: FC<SVGProps<SVGSVGElement>>;
  export const Check: FC<SVGProps<SVGSVGElement>>;
}

declare module 'viem' {
  export function createPublicClient(params: any): any;
  export function http(): any;
  export function parseUnits(value: string, decimals: number): bigint;
  export function parseEther(value: string): bigint;
  export function encodeFunctionData(params: any): `0x${string}`;
  export const erc20Abi: any;
  export type Address = `0x${string}`;
  export type Hex = `0x${string}`;
  export interface WalletClient {
    extend: (actions: any) => any;
  }
  export interface PublicClient {
    extend: (actions: any) => any;
  }
}

declare module 'wagmi/chains' {
  export const sepolia: {
    id: number;
    name: string;
    nativeCurrency: { name: string; symbol: string; decimals: number };
    rpcUrls: { default: { http: string[] } };
    blockExplorers: { default: { name: string; url: string } };
  };
}

declare module 'viem/account-abstraction' {
  export function createBundlerClient(params: any): any;
}

declare module 'viem/accounts' {
  export function privateKeyToAccount(privateKey: `0x${string}`): {
    address: `0x${string}`;
    signMessage: (params: any) => Promise<any>;
    signTypedData: (params: any) => Promise<any>;
  };
}

declare module '@metamask/smart-accounts-kit' {
  export function toMetaMaskSmartAccount(params: any): Promise<any>;
  export const Implementation: {
    Hybrid: string;
    MultiSig: string;
    Stateless7702: string;
  };
  export function createDelegation(params: any): any;
  export function getSmartAccountsEnvironment(chainId: number): any;
  export function deploySmartAccountsEnvironment(params: any): Promise<any>;
}

declare module '@metamask/smart-accounts-kit/actions' {
  export function erc7715ProviderActions(): any;
  export function erc7710BundlerActions(): any;
  export function erc7710WalletActions(): any;
}

declare module 'wagmi' {
  import { ReactNode } from 'react';
  export function WagmiProvider(props: { children: ReactNode; config: any }): JSX.Element;
  export function createConfig(params: any): any;
  export function http(): any;
  export function useAccount(): { 
    address: `0x${string}` | undefined; 
    isConnected: boolean;
    chainId?: number;
  };
  export function useConnect(): { 
    connect: (params?: { connector: any }) => void; 
    connectors: any[];
    isPending: boolean;
    error: Error | null;
  };
  export function useDisconnect(): { disconnect: () => void };
  export function useWalletClient(): { 
    data: any;
    isLoading: boolean;
    error: Error | null;
  };
}

declare module 'wagmi/connectors' {
  export function injected(params?: { target?: string }): any;
}

declare module '@tanstack/react-query' {
  import { ReactNode } from 'react';
  export class QueryClient {
    constructor();
  }
  export function QueryClientProvider(props: { 
    children: ReactNode; 
    client: QueryClient 
  }): JSX.Element;
}

// Global type declarations
type SetStateAction<S> = S | ((prevState: S) => S);
