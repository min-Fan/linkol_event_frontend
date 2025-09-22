// 链类型定义
export type ChainType = 'base' | 'solana';

// Token类型定义
export type TokenType = 'usdc' | 'usdt' | 'usd1' | string;

// Token配置接口
export interface TokenConfig {
  symbol: string;
  decimals: number;
  iconType: string;
  contractAddress?: string; // EVM链使用
  mintAddress?: string; // Solana链使用
}

// 链配置接口
export interface ChainConfig {
  chainId: string;
  name: string;
  KOLServiceAddress?: string;
  ActivityServiceAddress?: string;
  iconUrl?: string;
  blockExplorerUrl: string;
  tokens: Record<TokenType, TokenConfig>;
  defaultToken: TokenType;
}

// 检测是否为开发环境
const isDevelopment = process.env.NODE_ENV === 'development';

// 开发环境配置
const DEVELOPMENT_CONFIG: Record<ChainType, ChainConfig> = {
  base: {
    chainId: '84532', // Base Sepolia 测试网
    name: 'Base Sepolia',
    KOLServiceAddress: '0x68Fab9e02bD60a1F9EBDD5bb192eE2C59Fb16970', // 测试网地址
    ActivityServiceAddress: '0xd1CF4991BA007f1743eD5F51CF73c42f18E304Bd', // 测试网地址
    defaultToken: 'usdc',
    blockExplorerUrl: 'https://sepolia.basescan.org',
    iconUrl:
      'https://cdn.brandfetch.io/id6XsSOVVS/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1757929784005',
    tokens: {
      usdc: {
        symbol: 'USDT',
        decimals: 6,
        iconType: 'usdt',
        contractAddress: '0x6909442C7572D06E28A9535AA99548d1279d1e44', // Base Sepolia USDC
      },
      usdt: {
        symbol: 'USDT',
        decimals: 6,
        iconType: 'usdt',
        contractAddress: '0x6909442C7572D06E28A9535AA99548d1279d1e44', // Base Sepolia USDT
      },
    },
  },
  solana: {
    chainId: 'solana',
    name: 'Solana',
    defaultToken: 'usd1',
    blockExplorerUrl: 'https://solscan.io',
    iconUrl:
      'https://cdn.brandfetch.io/ide0NUuTHO/theme/dark/symbol.svg?c=1bxid64Mup7aczewSAYMX&t=1668516395705',
    tokens: {
      usd1: {
        symbol: 'USD1',
        decimals: 6,
        iconType: 'usd1',
        mintAddress: 'USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB',
      },
      usdc: {
        symbol: 'USDC',
        decimals: 6,
        iconType: 'usdc',
        mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      },
    },
  },
};

// 生产环境配置
const PRODUCTION_CONFIG: Record<ChainType, ChainConfig> = {
  base: {
    chainId: '8453', // Base 主网
    name: 'Base',
    KOLServiceAddress: '0xD562135D926763d4132a3E7d55a536850E03bcA9',
    ActivityServiceAddress: '0xf3E45cF29c86b92cc7CC8Ef68773162B53CB5C78',
    defaultToken: 'usdc',
    blockExplorerUrl: 'https://basescan.org',
    iconUrl:
      'https://cdn.brandfetch.io/id6XsSOVVS/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1757929784005',
    tokens: {
      usdc: {
        symbol: 'USDC',
        decimals: 6,
        iconType: 'usdc',
        contractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      },
      usdt: {
        symbol: 'USDT',
        decimals: 6,
        iconType: 'usdt',
        contractAddress: '0x50c5725949A6F0c72E6C4a641F24749F6b268E73',
      },
    },
  },
  solana: {
    chainId: 'solana',
    name: 'Solana',
    defaultToken: 'usd1',
    blockExplorerUrl: 'https://solscan.io',
    iconUrl:
      'https://cdn.brandfetch.io/ide0NUuTHO/theme/dark/symbol.svg?c=1bxid64Mup7aczewSAYMX&t=1668516395705',
    tokens: {
      usd1: {
        symbol: 'USD1',
        decimals: 6,
        iconType: 'usd1',
        mintAddress: 'USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB',
      },
    },
  },
};

// 根据环境返回配置
export const CHAIN_CONFIG: Record<ChainType, ChainConfig> = isDevelopment
  ? DEVELOPMENT_CONFIG
  : PRODUCTION_CONFIG;

// 根据链类型获取配置
export const getChainConfig = (chainType: ChainType) => {
  return CHAIN_CONFIG[chainType.toLowerCase() as ChainType];
};

// 根据链类型和token类型获取token配置
export const getTokenConfig = (chainType: string, tokenType?: string): TokenConfig => {
  const normalizedChainType = chainType?.toLowerCase() as ChainType;
  const normalizedTokenType = tokenType?.toLowerCase() as TokenType;

  if (normalizedChainType && CHAIN_CONFIG[normalizedChainType]) {
    const chainConfig = CHAIN_CONFIG[normalizedChainType];

    // 如果指定了token类型且存在，返回该token配置
    if (normalizedTokenType && chainConfig.tokens[normalizedTokenType]) {
      return chainConfig.tokens[normalizedTokenType];
    }

    // 否则返回默认token配置
    return chainConfig.tokens[chainConfig.defaultToken];
  }

  // 默认返回base链的默认token配置
  return CHAIN_CONFIG.base.tokens[CHAIN_CONFIG.base.defaultToken];
};

// 根据活动链类型获取token信息（向后兼容）
export const getTokenInfoByChainType = (chainType: string) => {
  return getTokenConfig(chainType);
};

// 根据活动信息获取token配置
export const getTokenConfigByEventInfo = ({
  chain_type,
  token_type,
}: {
  chain_type?: string;
  token_type?: string;
}): TokenConfig => {
  if (!chain_type) {
    return CHAIN_CONFIG.base.tokens[CHAIN_CONFIG.base.defaultToken];
  }

  return getTokenConfig(chain_type, token_type);
};

// 根据链类型和token类型获取合约地址
export const getContractAddress = (chainType?: string, tokenType?: string) => {
  const normalizedChainType = (chainType?.toLowerCase() as ChainType) || 'base';
  const normalizedTokenType = tokenType?.toLowerCase() || 'usdc';

  const chainConfig = CHAIN_CONFIG[normalizedChainType];
  if (!chainConfig) {
    return null;
  }

  const tokenConfig = chainConfig.tokens[normalizedTokenType as TokenType];
  if (!tokenConfig) {
    return null;
  }

  return {
    pay_member_token_address: tokenConfig.contractAddress || '',
    KOLServiceAddress: chainConfig.KOLServiceAddress || '',
    ActivityServiceAddress: chainConfig.ActivityServiceAddress || '',
  };
};

// 获取支持的链列表
export const getSupportedChains = () => {
  return Object.values(CHAIN_CONFIG).map((config) => ({
    chainId: parseInt(config.chainId),
    name: config.name,
  }));
};

// 获取默认链
export const getDefaultChain = () => {
  return {
    chainId: parseInt(CHAIN_CONFIG.base.chainId),
    name: CHAIN_CONFIG.base.name,
  };
};

// 根据链类型和交易哈希生成区块链浏览器链接
export const getExplorerUrl = (txHash: string, chainType: string): string => {
  const normalizedChainType = chainType?.toLowerCase();

  // 如果配置中没有找到，使用默认的映射
  let getExplorerUrl = '';
  switch (normalizedChainType) {
    case 'solana':
      getExplorerUrl = getChainConfig(normalizedChainType as ChainType).blockExplorerUrl;
      break;
    case 'base':
      getExplorerUrl = getChainConfig(normalizedChainType as ChainType).blockExplorerUrl;
      break;
    default:
      // 默认使用 Solana 浏览器
      getExplorerUrl = getChainConfig(normalizedChainType as ChainType).blockExplorerUrl;
      break;
  }
  return `${getExplorerUrl}/tx/${txHash}`;
};
