// 链类型定义
export type ChainType = 'base' | 'base-sepolia' | 'solana' | 'ton' | 'bsc';

// Token类型定义
export type TokenType = 'usdc' | 'usdt' | 'usd1' | 'bnb' | '币安人生' | string;

// Token配置接口
export interface TokenConfig {
  symbol: string;
  decimals: number;
  iconType: string;
  contractAddress?: string; // EVM链使用
  mintAddress?: string; // Solana链使用
  imageUrl?: string;
}

// 链配置接口
export interface ChainConfig {
  chainId: string;
  name: string;
  KOLServiceAddress?: string;
  ActivityServiceAddress?: string;
  AgentBetAddress?: string;
  FaucetAddress?: string;
  iconUrl?: string;
  blockExplorerUrl: string;
  tokens: Record<TokenType, TokenConfig>;
  defaultToken: TokenType;
}

// 检测是否为开发环境
const isDevelopment = process.env.NEXT_PUBLIC_NODE_ENV === 'development';

// 开发环境配置
const DEVELOPMENT_CONFIG: Record<ChainType, ChainConfig> = {
  base: {
    chainId: '8453', // Base 主网
    name: 'Base',
    KOLServiceAddress: '0xD562135D926763d4132a3E7d55a536850E03bcA9',
    ActivityServiceAddress: '0xf3E45cF29c86b92cc7CC8Ef68773162B53CB5C78',
    AgentBetAddress: '',
    FaucetAddress: '',
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
        imageUrl: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
      },
      usdt: {
        symbol: 'USDT',
        decimals: 6,
        iconType: 'usdt',
        contractAddress: '0x50c5725949A6F0c72E6C4a641F24749F6b268E73',
        imageUrl: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
      },
      ping: {
        symbol: 'PING',
        decimals: 18,
        iconType: 'ping',
        contractAddress: '0xd85c31854c2B0Fb40aaA9E2Fc4Da23C21f829d46',
        imageUrl: '/assets/image/token/ping-logo.jpg',
      },
    },
  },
  'base-sepolia': {
    chainId: '84532', // Base Sepolia 测试网
    name: 'Base Sepolia',
    KOLServiceAddress: '0xD562135D926763d4132a3E7d55a536850E03bcA9',
    ActivityServiceAddress: '0xf3E45cF29c86b92cc7CC8Ef68773162B53CB5C78',
    AgentBetAddress: '0xb5BdD04247C066A5125F991aC776AeF3408C1BCd',
    FaucetAddress: '0x6019e9085564109b5594aA30479d6dD52FC8cb46',
    defaultToken: 'usdc',
    blockExplorerUrl: 'https://sepolia.basescan.org',
    iconUrl:
      'https://cdn.brandfetch.io/id6XsSOVVS/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1757929784005',
    tokens: {
      usdc: {
        symbol: 'USDC',
        decimals: 6,
        iconType: 'usdc',
        contractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        imageUrl: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
      },
      usdt: {
        symbol: 'USDT',
        decimals: 6,
        iconType: 'usdt',
        contractAddress: '0x50c5725949A6F0c72E6C4a641F24749F6b268E73',
        imageUrl: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
      },
      ping: {
        symbol: 'PING',
        decimals: 18,
        iconType: 'ping',
        contractAddress: '0xd85c31854c2B0Fb40aaA9E2Fc4Da23C21f829d46',
        imageUrl: '/assets/image/token/ping-logo.jpg',
      },
    },
  },
  bsc: {
    chainId: '56',
    name: 'BNB Smart Chain',
    KOLServiceAddress: '',
    ActivityServiceAddress: '0xf3E45cF29c86b92cc7CC8Ef68773162B53CB5C78',
    AgentBetAddress: '',
    defaultToken: 'bnb',
    blockExplorerUrl: 'https://bscscan.com',
    iconUrl: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=040',
    tokens: {
      bnb: {
        symbol: 'BNB',
        decimals: 18,
        iconType: 'bnb',
        contractAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // BNB
      },
      币安人生: {
        symbol: '币安人生',
        decimals: 18,
        iconType: '币安人生',
        contractAddress: '0x924fa68a0FC644485b8df8AbfA0A41C2e7744444',
      },
    },
  },
  solana: {
    chainId: 'solana',
    name: 'Solana',
    AgentBetAddress: '',
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
  ton: {
    chainId: 'Ton',
    name: 'Ton',
    AgentBetAddress: '',
    defaultToken: 'usdt',
    blockExplorerUrl: 'https://tonviewer.com',
    iconUrl: 'https://cryptologos.cc/logos/toncoin-ton-logo.png?v=040',
    tokens: {
      usdt: {
        symbol: 'USDT',
        decimals: 6,
        iconType: 'usdt',
        mintAddress: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
        imageUrl: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
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
    FaucetAddress: '',
    AgentBetAddress: '',
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
        imageUrl: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
      },
      usdt: {
        symbol: 'USDT',
        decimals: 6,
        iconType: 'usdt',
        contractAddress: '0x50c5725949A6F0c72E6C4a641F24749F6b268E73',
        imageUrl: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
      },
      ping: {
        symbol: 'PING',
        decimals: 18,
        iconType: 'ping',
        contractAddress: '0xd85c31854c2B0Fb40aaA9E2Fc4Da23C21f829d46',
        imageUrl: '/assets/image/token/ping-logo.jpg',
      },
    },
  },
  'base-sepolia': {
    chainId: '84532', // Base Sepolia 测试网
    name: 'Base Sepolia',
    KOLServiceAddress: '0xD562135D926763d4132a3E7d55a536850E03bcA9',
    ActivityServiceAddress: '0xf3E45cF29c86b92cc7CC8Ef68773162B53CB5C78',
    AgentBetAddress: '0xb5BdD04247C066A5125F991aC776AeF3408C1BCd',
    FaucetAddress: '0x6019e9085564109b5594aA30479d6dD52FC8cb46',
    defaultToken: 'usdc',
    blockExplorerUrl: 'https://sepolia.basescan.org',
    iconUrl:
      'https://cdn.brandfetch.io/id6XsSOVVS/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1757929784005',
    tokens: {
      usdc: {
        symbol: 'USDC',
        decimals: 6,
        iconType: 'usdc',
        contractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        imageUrl: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
      },
      usdt: {
        symbol: 'USDT',
        decimals: 6,
        iconType: 'usdt',
        contractAddress: '0x50c5725949A6F0c72E6C4a641F24749F6b268E73',
        imageUrl: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
      },
      ping: {
        symbol: 'PING',
        decimals: 18,
        iconType: 'ping',
        contractAddress: '0xd85c31854c2B0Fb40aaA9E2Fc4Da23C21f829d46',
        imageUrl: '/assets/image/token/ping-logo.jpg',
      },
    },
  },
  bsc: {
    chainId: '56',
    name: 'BNB Smart Chain',
    KOLServiceAddress: '', // 测试网地址
    ActivityServiceAddress: '0xf3E45cF29c86b92cc7CC8Ef68773162B53CB5C78', // 测试网地址
    AgentBetAddress: '',
    defaultToken: 'bnb',
    blockExplorerUrl: 'https://bscscan.com',
    iconUrl: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=040',
    tokens: {
      bnb: {
        symbol: 'BNB',
        decimals: 18,
        iconType: 'bnb',
        contractAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // BNB
      },
      币安人生: {
        symbol: '币安人生',
        decimals: 18,
        iconType: '币安人生',
        contractAddress: '0x924fa68a0FC644485b8df8AbfA0A41C2e7744444',
      },
    },
  },
  solana: {
    chainId: 'solana',
    name: 'Solana',
    AgentBetAddress: '',
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
        imageUrl: '/assets/image/token/usd1.png',
      },
    },
  },
  ton: {
    chainId: 'Ton',
    name: 'Ton',
    AgentBetAddress: '',
    defaultToken: 'usdt',
    blockExplorerUrl: 'https://tonviewer.com',
    iconUrl: 'https://cryptologos.cc/logos/toncoin-ton-logo.png?v=040',
    tokens: {
      usdt: {
        symbol: 'USDT',
        decimals: 6,
        iconType: 'usdt',
        mintAddress: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
        imageUrl: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
      },
    },
  },
};

// 根据环境返回配置
export const CHAIN_CONFIG: Record<ChainType, ChainConfig> = isDevelopment
  ? DEVELOPMENT_CONFIG
  : PRODUCTION_CONFIG;

// 根据 chainId 获取链类型
export const getChainTypeFromChainId = (chainId: number | string): ChainType => {
  const id = typeof chainId === 'string' ? parseInt(chainId) : chainId;
  if (id === 8453) return 'base'; // Base 主网
  if (id === 84532) return 'base-sepolia'; // Base Sepolia 测试网
  if (id === 56 || id === 97) return 'bsc'; // BSC 主网或测试网
  return 'base-sepolia'; // 默认返回 base Sepolia
};

// 根据链类型获取配置
export const getChainConfig = (chainType: ChainType | string) => {
  const normalizedType = chainType.toLowerCase();
  // 如果传入的是 chainId，先转换为 chainType
  if (!isNaN(Number(normalizedType))) {
    return CHAIN_CONFIG[getChainTypeFromChainId(Number(normalizedType))];
  }
  return CHAIN_CONFIG[normalizedType as ChainType] || CHAIN_CONFIG.base;
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

    // 如果指定了token类型但不存在，记录警告并返回默认token配置
    if (normalizedTokenType && !chainConfig.tokens[normalizedTokenType]) {
      console.warn(
        `Token type '${normalizedTokenType}' not found for chain '${normalizedChainType}', falling back to default token '${chainConfig.defaultToken}'`
      );
    }

    // 返回默认token配置
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
export const getContractAddress = (chainType?: string) => {
  const normalizedChainType = (chainType?.toLowerCase() as ChainType) || 'base';

  const chainConfig = CHAIN_CONFIG[normalizedChainType];
  if (!chainConfig) {
    return null;
  }

  return {
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
  const explorerUrl = getChainConfig(normalizedChainType as ChainType).blockExplorerUrl;
  const txType = normalizedChainType === 'ton' ? 'transaction' : 'tx';
  return `${explorerUrl}/${txType}/${txHash}`;
};

// Uniswap 链名映射
const UNISWAP_CHAIN_MAP: Record<ChainType, string> = {
  bsc: 'bnb',
  base: 'base',
  'base-sepolia': 'base-sepolia',
  solana: 'solana',
  ton: 'ton',
};

// 获取 Uniswap 链名
export const getUniswapChainName = (chainType: ChainType | string): string => {
  const normalizedChainType = chainType?.toLowerCase() as ChainType;
  return UNISWAP_CHAIN_MAP[normalizedChainType] || normalizedChainType;
};

// 生成 Uniswap 交换链接
export const getUniswapUrl = (chainType: string, tokenAddress: string): string => {
  if (!chainType || !tokenAddress) {
    return '';
  }
  const uniswapChain = getUniswapChainName(chainType);
  return `https://app.uniswap.org/swap?chain=${uniswapChain}&inputCurrency=NATIVE&outputCurrency=${tokenAddress}`;
};
