'use client';
import { useEffect, useRef, useCallback } from 'react';
import { useGetConst } from '@hooks/useGetConst';
import { verifyIsNeedLogin } from '@libs/request';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import useUserInfo from '@hooks/useUserInfo';
import { updatePayTokenInfo } from '@store/reducers/userSlice';
import { getCachedBalance, getCachedRunMethod } from '@libs/ton-client-optimized';
import { Address, beginCell } from 'ton';
import { useTonWallet } from '@tonconnect/ui-react';
import { CHAIN_CONFIG, ChainType } from '@constants/config';

// Token配置接口
interface TokenConfigItem {
  chainType: ChainType;
  tokenType: string;
  symbol: string;
  decimals: number;
  iconType: string;
  mintAddress?: string;
  contractAddress?: string;
}

// 从配置中获取Token配置
const getTokenConfigs = (): TokenConfigItem[] => {
  const configs: TokenConfigItem[] = [];

  // 遍历所有链配置，获取每个链的所有配置了的token
  Object.entries(CHAIN_CONFIG).forEach(([chainType, chainConfig]) => {
    Object.entries(chainConfig.tokens).forEach(([tokenType, tokenConfig]) => {
      configs.push({
        chainType: chainType as ChainType,
        tokenType: tokenType,
        symbol: tokenConfig.symbol,
        decimals: tokenConfig.decimals,
        iconType: tokenConfig.iconType,
        mintAddress: tokenConfig.mintAddress,
        contractAddress: tokenConfig.contractAddress,
      });
    });
  });

  return configs;
};

export default function GlobalInitializerOptimized() {
  const { getConst } = useGetConst();
  const hasVerified = useRef(false);
  const isLoggedIn = useAppSelector((state) => state.userReducer?.isLoggedIn);
  const wallet = useTonWallet();
  const t = useTranslations('common');
  const { logout } = useUserInfo();
  const dispatch = useAppDispatch();

  // 使用 ref 来跟踪初始化状态，避免重复初始化
  const initializedRef = useRef(false);
  const lastInitTimeRef = useRef(0);

  // 统一的token信息获取函数
  const initializeTokenInfo = useCallback(async () => {
    const now = Date.now();

    // 如果已经初始化过且时间间隔小于30秒，则跳过
    if (initializedRef.current && now - lastInitTimeRef.current < 30000) {
      console.log('[GlobalInitializer] Token info already initialized recently, skipping...');
      return;
    }

    console.log('[GlobalInitializer] Initializing token info...');
    initializedRef.current = true;
    lastInitTimeRef.current = now;

    try {
      // 获取所有token配置
      const tokenConfigs = getTokenConfigs();

      // 并行获取所有token信息，但只获取TON相关的
      const tonConfig = tokenConfigs.find((config) => config.chainType === 'ton');

      if (tonConfig && wallet?.account.address) {
        try {
          const userAddress = Address.parse(wallet.account.address);
          let balance = BigInt(0);

          // 如果有mintAddress，获取Jetton代币余额
          if (tonConfig.mintAddress) {
            try {
              const jettonMinter = Address.parse(tonConfig.mintAddress);

              // 1. 先通过 jetton minter 获取用户的 Jetton Wallet 地址
              const jettonWalletRes = await getCachedRunMethod(jettonMinter, 'get_wallet_address', [
                { type: 'slice', cell: beginCell().storeAddress(userAddress).endCell() },
              ]);
              const jettonWalletAddress = jettonWalletRes.stack.readAddress();

              // 2. 再调用该 Jetton Wallet 合约的 get_wallet_data
              const walletData = await getCachedRunMethod(jettonWalletAddress, 'get_wallet_data');
              balance = walletData.stack.readBigNumber(); // 代币余额

              console.log('[GlobalInitializer] TON USDT Jetton balance:', balance.toString());
            } catch (jettonError) {
              console.error(
                '[GlobalInitializer] Failed to get TON USDT Jetton balance:',
                jettonError
              );
              // 如果获取Jetton余额失败，回退到获取TON原生代币余额
              balance = await getCachedBalance(userAddress);
              console.log(
                '[GlobalInitializer] Fallback to TON native balance:',
                balance.toString()
              );
            }
          } else {
            // 如果没有mintAddress，获取TON原生代币余额
            balance = await getCachedBalance(userAddress);
            console.log('[GlobalInitializer] TON native balance:', balance.toString());
          }

          dispatch(
            updatePayTokenInfo({
              chainType: `${tonConfig.chainType}_${tonConfig.tokenType}`,
              symbol: tonConfig.symbol,
              decimals: tonConfig.decimals,
              balance: balance,
              iconType: tonConfig.iconType,
            })
          );

          console.log('[GlobalInitializer] TON token info initialized');
        } catch (error) {
          console.error('[GlobalInitializer] Failed to get TON balance:', error);
        }
      }

      // 对于其他链，使用默认配置
      tokenConfigs.forEach((config) => {
        if (config.chainType !== 'ton') {
          dispatch(
            updatePayTokenInfo({
              chainType: `${config.chainType}_${config.tokenType}`,
              symbol: config.symbol,
              decimals: config.decimals,
              balance: BigInt(0),
              iconType: config.iconType,
            })
          );
        }
      });

      console.log('[GlobalInitializer] All token info initialized');
    } catch (error) {
      console.error('[GlobalInitializer] Failed to initialize token info:', error);
    }
  }, [wallet?.account.address, dispatch]);

  const verifyLogin = useCallback(async () => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    try {
      const res = await verifyIsNeedLogin();
      if (res.code === 200 && res.data.relogin) {
        toast.error(t('please_login_again'));
        logout();
      }
    } catch (error) {
      console.error('[GlobalInitializer] Login verification failed:', error);
    }
  }, [t, logout]);

  // 当登录状态改变时，验证登录
  useEffect(() => {
    if (isLoggedIn) {
      verifyLogin();
    }
  }, [isLoggedIn, verifyLogin]);

  // 初始化token信息
  useEffect(() => {
    initializeTokenInfo();
  }, [initializeTokenInfo]);

  // 当钱包地址改变时，重新初始化token信息
  useEffect(() => {
    if (wallet?.account.address) {
      // 重置初始化状态，允许重新初始化
      initializedRef.current = false;
      initializeTokenInfo();
    }
  }, [wallet?.account.address, initializeTokenInfo]);

  return null;
}
