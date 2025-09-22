import { Chain, base, baseSepolia } from 'wagmi/chains';
import { getSupportedChains, getDefaultChain } from './config';
import { SolanaProvider } from 'app/solana/solana-provider';

// 扩展 Chain 类型以包含 iconUrl
interface ExtendedChain extends Chain {
  iconUrl?: string; // 可选属性
  iconBackground?: string;
}

export const solana_chain = {
  id: 'solana',
  name: 'Solana',
  iconUrl: 'https://api.linkol.ai/linkol-test/files/QqXU3y2qmNrexSVwU8VGfY_solana.png',
  iconBackground: '#fff',
  nativeCurrency: { name: 'SOL', symbol: 'SOL', decimals: 9 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_SOLANA_RPC || ''] },
  },
  blockExplorers: {
    default: {
      name: 'Solana Explorer',
      url: 'https://solscan.io',
    },
  },
};

export const chain: { [key: string]: ExtendedChain } = {
  '8453': base,
  '84532': baseSepolia,
  '32383': {
    id: 32383,
    name: 'Agent Chain',
    iconUrl: 'https://scan.agtchain.net/static-img/5.png',
    iconBackground: '#fff',
    nativeCurrency: { name: 'AGT', symbol: 'AGT', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://rpc.agtchain.net'] },
    },
    blockExplorers: {
      default: {
        name: 'Agent Chain Explorer',
        url: 'https://scan.agtchain.net',
      },
    },
    contracts: {},
  } as const satisfies ExtendedChain,
};

export const getChain = (chainId: number) => {
  return chain[chainId];
};

// 生成区块浏览器链接
export const getExplorerLink = (
  chainId: number | string,
  data: string,
  type: 'transaction' | 'address' = 'transaction'
) => {
  if (!data || !chainId) return '';
  const currentChain = chainId === 'solana' ? solana_chain : chain[chainId];
  if (!currentChain?.blockExplorers?.default?.url) {
    return '';
  }

  const baseUrl = currentChain.blockExplorers.default.url;
  const path = type === 'transaction' ? 'tx' : 'address';
  return `${baseUrl}/${path}/${data}`;
};

// 获取支持的链配置
export const getSupportedChainsConfig = () => {
  const supportedChains = getSupportedChains();
  return supportedChains.map((chainInfo) => chain[chainInfo.chainId]).filter(Boolean);
};

// 获取默认链配置
export const getDefaultChainConfig = () => {
  const defaultChainInfo = getDefaultChain();
  return chain[defaultChainInfo.chainId];
};

// 支持的链配置
export const SUPPORTED_CHAINS = getSupportedChainsConfig();

// 获取支持的链ID数组
export const SUPPORTED_CHAIN_IDS = SUPPORTED_CHAINS.map((chain) => chain.id);

// 默认链
export const DEFAULT_CHAIN = getDefaultChainConfig();
