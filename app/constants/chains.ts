import { Chain, base, baseSepolia } from 'wagmi/chains';

// 扩展 Chain 类型以包含 iconUrl
interface ExtendedChain extends Chain {
  iconUrl?: string; // 可选属性
  iconBackground?: string;
}

export const chains: { [key: string]: ExtendedChain } = {
  base: base,
  baseSepolia: baseSepolia,
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
  chainId: number,
  data: string,
  type: 'transaction' | 'address' = 'transaction'
) => {
  if (!data || !chainId) return '';
  const currentChain = chain[chainId];
  if (!currentChain?.blockExplorers?.default?.url) {
    return '';
  }

  const baseUrl = currentChain.blockExplorers.default.url;
  const path = type === 'transaction' ? 'tx' : 'address';
  return `${baseUrl}/${path}/${data}`;
};

// 支持的链配置
export const SUPPORTED_CHAINS = [chain[process.env.NEXT_PUBLIC_CHAIN_ID as string]] as const;

// 获取支持的链ID数组
export const SUPPORTED_CHAIN_IDS = SUPPORTED_CHAINS.map((chain) => chain.id);

// 默认链
export const DEFAULT_CHAIN = chain[process.env.NEXT_PUBLIC_CHAIN_ID as string];
