import {
  getContractAddress,
  getChainConfig,
  getTokenConfig,
  ChainType,
  TokenType,
} from '@constants/config';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { updatePayTokenInfo } from '@store/reducers/userSlice';
import { erc20Abi } from 'viem';
import { useReadContract, useAccount } from 'wagmi';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { useSolanaTokenBalance } from './useSolanaTokenBalance';
import { Address } from 'ton';
import { getCachedRunMethod } from '@libs/ton-client-optimized';
import { useTonTokenBalance, parseJettonContent } from './useTonTokenBalance';

export const usePayTokenInfo = (chainType?: string, tokenType?: string) => {
  const dispatch = useAppDispatch();
  const { address } = useAccount();
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  // 获取当前链的token信息
  const currentChainType = (chainType?.toLowerCase() as ChainType) || 'base';
  const currentTokenType = tokenType?.toLowerCase();
  const chainConfig = getChainConfig(currentChainType);
  const tokenConfig = getTokenConfig(currentChainType, currentTokenType);

  // 构建store key - 使用实际获取到的token类型，而不是请求的token类型
  // 这样可以避免当请求不存在的token类型时，storeKey与实际token配置不匹配的问题
  const actualTokenType = chainConfig.tokens[currentTokenType as TokenType]
    ? currentTokenType
    : chainConfig.defaultToken;
  const storeKey = actualTokenType ? `${currentChainType}_${actualTokenType}` : currentChainType;
  const tokenInfo = useAppSelector(
    (state) => (state as any).userReducer?.pay_token_info?.[storeKey]
  );

  // EVM链的合约调用
  const { refetch: refetchDecimals } = useReadContract({
    address: tokenConfig.contractAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: 'decimals',
    query: {
      enabled: currentChainType === 'base' && !!tokenConfig.contractAddress,
    },
  });
  const { refetch: refetchSymbol } = useReadContract({
    address: tokenConfig.contractAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: 'symbol',
    query: {
      enabled: currentChainType === 'base' && !!tokenConfig.contractAddress,
    },
  });
  const { refetch: refetchBalance } = useReadContract({
    address: tokenConfig.contractAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: currentChainType === 'base' && !!tokenConfig.contractAddress && !!address,
    },
  });

  // Solana链的token余额获取
  const { balance: solanaBalance, refetch: refetchSolanaBalance } = useSolanaTokenBalance(
    currentChainType === 'solana' ? tokenConfig.mintAddress : undefined
  );

  // TON链的token余额获取
  const { balance: tonBalance, refetch: refetchTonBalance } = useTonTokenBalance(
    currentChainType === 'ton' ? tokenConfig.mintAddress : undefined
  );

  // 获取EVM链token信息
  const getEvmTokenInfo = async () => {
    if (currentChainType !== 'base' || !tokenConfig.contractAddress) return;

    try {
      const [decimals, symbol, balance] = await Promise.all([
        refetchDecimals(),
        refetchSymbol(),
        refetchBalance(),
      ]);

      dispatch(
        updatePayTokenInfo({
          chainType: storeKey,
          symbol: symbol.data as string,
          decimals: decimals.data as number,
          balance: balance.data as bigint,
          iconType: symbol.data?.toLowerCase() as string,
        })
      );
    } catch (error) {
      console.error('获取EVM token信息失败:', error);
    }
  };

  // 获取Solana链token信息
  const getSolanaTokenInfo = async () => {
    if (currentChainType !== 'solana') return;

    try {
      // 刷新Solana余额
      await refetchSolanaBalance();

      dispatch(
        updatePayTokenInfo({
          chainType: storeKey,
          symbol: tokenConfig.symbol,
          decimals: tokenConfig.decimals,
          balance: solanaBalance,
          iconType: tokenConfig.iconType,
        })
      );
    } catch (error) {
      console.error('获取Solana token信息失败:', error);
    }
  };

  // 获取TON链token信息
  const getTonTokenInfo = async () => {
    if (currentChainType !== 'ton') return;

    try {
      let symbol = tokenConfig.symbol;
      let decimals = tokenConfig.decimals;
      let iconType = tokenConfig.iconType;

      // 如果提供了 mintAddress，尝试从链上获取 token 信息
      if (tokenConfig.mintAddress) {
        try {
          const jettonAddress = Address.parse(tokenConfig.mintAddress);
          const result = await getCachedRunMethod(jettonAddress, 'get_jetton_data');

          // 解析 jetton 数据
          const stack = result.stack;
          const totalSupply = stack.readBigNumber();
          const mintable = stack.readBoolean();
          const adminAddress = stack.readAddress();
          const jettonContent = stack.readCell();

          console.log('Jetton data:', {
            totalSupply: totalSupply.toString(),
            mintable,
            adminAddress: adminAddress.toString(),
            jettonContent: jettonContent.toString(),
          });

          // 尝试解析 jetton content 中的 metadata
          try {
            const metadata = parseJettonContent(jettonContent);
            console.log('Jetton metadata parsing result:', metadata);
            if (metadata && metadata.uri) {
              // 从 URI 获取完整的 metadata（通过代理API避免跨域问题）
              try {
                const response = await fetch(
                  `/api/ton-metadata?uri=${encodeURIComponent(metadata.uri)}`
                );
                const metadataData = await response.json();
                console.log('Jetton metadata:', metadataData);

                // 更新 token 信息
                if (metadataData.symbol) symbol = metadataData.symbol;
                if (metadataData.decimals) decimals = metadataData.decimals;
                if (metadataData.name) iconType = metadataData.name.toLowerCase();
              } catch (fetchError) {
                console.warn('Failed to get metadata from URI:', fetchError);
              }
            }
          } catch (contentError) {
            console.warn('Failed to parse jetton content:', contentError);
          }
        } catch (jettonError) {
          console.warn('jetton error:', jettonError);
        }
      }

      // 刷新TON余额（这里会使用 useTonTokenBalance 中的 TonClient）
      await refetchTonBalance();

      dispatch(
        updatePayTokenInfo({
          chainType: storeKey,
          symbol,
          decimals,
          balance: tonBalance,
          iconType,
        })
      );
    } catch (error) {
      console.error('Get TON token info failed:', error);
    }
  };

  // 统一的获取token信息方法
  const getPayTokenInfo = async () => {
    if (currentChainType === 'base') {
      await getEvmTokenInfo();
    } else if (currentChainType === 'solana') {
      await getSolanaTokenInfo();
    } else if (currentChainType === 'ton') {
      await getTonTokenInfo();
    } else {
      // 如果链类型不支持，使用默认配置
      dispatch(
        updatePayTokenInfo({
          chainType: storeKey,
          symbol: tokenConfig.symbol,
          decimals: tokenConfig.decimals,
          balance: BigInt(0),
          iconType: tokenConfig.iconType,
        })
      );
    }
  };

  // 当链类型或token类型改变时，自动获取token信息
  useEffect(() => {
    if (chainType) {
      getPayTokenInfo();
    }
  }, [chainType, tokenType]);

  return {
    getPayTokenInfo,
    tokenInfo,
    chainType: currentChainType,
    tokenType: currentTokenType,
    chainConfig,
    tokenConfig,
  };
};
