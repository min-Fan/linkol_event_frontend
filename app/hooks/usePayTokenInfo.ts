import { getContractAddress, getChainConfig, getTokenConfig, ChainType } from '@constants/config';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { updatePayTokenInfo } from '@store/reducers/userSlice';
import { erc20Abi } from 'viem';
import { useReadContract, useAccount } from 'wagmi';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { useSolanaTokenBalance } from './useSolanaTokenBalance';

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

  // 构建store key
  const storeKey = currentTokenType ? `${currentChainType}_${currentTokenType}` : currentChainType;
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

  // 统一的获取token信息方法
  const getPayTokenInfo = async () => {
    if (currentChainType === 'base') {
      await getEvmTokenInfo();
    } else if (currentChainType === 'solana') {
      await getSolanaTokenInfo();
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
