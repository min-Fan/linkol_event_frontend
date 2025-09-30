import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Address, beginCell, Cell } from 'ton';
import { getCachedBalance, getCachedRunMethod } from '@libs/ton-client-optimized';

/**
 * 优化的获取 TON 链 token 余额的 hook
 * 支持获取 TON 原生代币余额和 Jetton 代币余额
 * 实现了请求去重和缓存机制，避免重复的 RPC 调用
 * @param mintAddress - Jetton 代币合约地址，如果不提供则获取 TON 原生代币余额
 */
export const useTonTokenBalanceOptimized = (mintAddress?: string) => {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const [balance, setBalance] = useState<bigint>(BigInt(0));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 使用 ref 来跟踪当前请求，避免重复请求
  const currentRequestRef = useRef<string | null>(null);
  const lastFetchTimeRef = useRef<number>(0);

  // 防抖延迟（毫秒）
  const DEBOUNCE_DELAY = 300;
  // 最小请求间隔（毫秒）
  const MIN_REQUEST_INTERVAL = 5000;

  const fetchTokenBalance = useCallback(
    async (forceRefresh = false) => {
      if (!wallet || !tonConnectUI) {
        setBalance(BigInt(0));
        return;
      }

      const now = Date.now();
      const requestKey = `${wallet.account.address}_${mintAddress || 'native'}`;

      // 如果不是强制刷新且请求过于频繁，则跳过
      if (!forceRefresh && now - lastFetchTimeRef.current < MIN_REQUEST_INTERVAL) {
        console.log('[TON Balance] Request too frequent, skipping...');
        return;
      }

      // 如果已经有相同的请求在进行中，则等待
      if (currentRequestRef.current === requestKey) {
        console.log('[TON Balance] Same request already in progress, skipping...');
        return;
      }

      // 设置当前请求标识
      currentRequestRef.current = requestKey;
      lastFetchTimeRef.current = now;

      setIsLoading(true);
      setError(null);

      try {
        const userAddress = Address.parse(wallet.account.address);

        if (!mintAddress) {
          // 如果没有指定 mintAddress，获取 TON 原生代币余额
          console.log('[TON Balance] Fetching native TON balance...');
          const balance = await getCachedBalance(userAddress);
          setBalance(balance);
        } else {
          // 获取 Jetton 代币余额
          console.log('[TON Balance] Fetching Jetton balance...');
          const jettonMinter = Address.parse(mintAddress);

          try {
            // 1. 先通过 jetton minter 获取用户的 Jetton Wallet 地址
            const jettonWalletRes = await getCachedRunMethod(jettonMinter, 'get_wallet_address', [
              { type: 'slice', cell: beginCell().storeAddress(userAddress).endCell() },
            ]);

            // 验证返回结果
            if (!jettonWalletRes || !jettonWalletRes.stack) {
              throw new Error('Invalid response from jetton minter');
            }

            // 检查 stack 是否有足够的元素
            if (jettonWalletRes.stack.remaining === 0) {
              throw new Error('Empty stack response from jetton minter');
            }

            const jettonWalletAddress = jettonWalletRes.stack.readAddress();
            console.log('[TON Balance] Jetton wallet address:', jettonWalletAddress.toString());

            // 2. 再调用该 Jetton Wallet 合约的 get_wallet_data
            const walletData = await getCachedRunMethod(jettonWalletAddress, 'get_wallet_data');

            // 验证钱包数据
            if (!walletData || !walletData.stack) {
              throw new Error('Invalid response from jetton wallet');
            }

            if (walletData.stack.remaining === 0) {
              throw new Error('Empty stack response from jetton wallet');
            }

            const balance = walletData.stack.readBigNumber(); // 代币余额
            console.log('[TON Balance] Jetton balance:', balance.toString());

            setBalance(balance);
          } catch (jettonError) {
            // console.error('[TON Balance] Jetton balance fetch failed:', jettonError);

            // 如果是 EOF 错误，可能是合约不存在或方法调用失败
            if (jettonError instanceof Error && jettonError.message.includes('EOF')) {
              console.log('[TON Balance] Contract method failed, setting balance to 0');
              setBalance(BigInt(0));
            } else {
              throw jettonError;
            }
          }
        }
      } catch (err) {
        // console.error('[TON Balance] Get TON token balance failed:', err);
        setError(err instanceof Error ? err.message : 'Get balance failed');
        setBalance(BigInt(0));
      } finally {
        setIsLoading(false);
        // 清除当前请求标识
        currentRequestRef.current = null;
      }
    },
    [wallet, tonConnectUI, mintAddress]
  );

  // 防抖的刷新函数
  const debouncedFetch = useCallback(() => {
    const timeoutId = setTimeout(() => {
      fetchTokenBalance();
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [fetchTokenBalance]);

  // 强制刷新函数
  const forceRefresh = useCallback(() => {
    fetchTokenBalance(true);
  }, [fetchTokenBalance]);

  useEffect(() => {
    if (wallet) {
      // 使用防抖的刷新
      const cleanup = debouncedFetch();
      return cleanup;
    } else {
      setBalance(BigInt(0));
      setError(null);
    }
  }, [wallet, debouncedFetch]);

  // 当 mintAddress 改变时，重新获取余额
  useEffect(() => {
    if (wallet) {
      fetchTokenBalance(true);
    }
  }, [mintAddress, wallet, fetchTokenBalance]);

  return {
    balance,
    isLoading,
    error,
    refetch: forceRefresh,
  };
};

/**
 * 解析 jetton content cell 获取 metadata 信息
 * @param contentCell - jetton content cell
 * @returns 解析后的 metadata 信息
 */
export const parseJettonContent = (contentCell: Cell) => {
  try {
    // 从 cell 的十六进制表示中提取 URI
    const cellHex = contentCell.toString();

    // 查找可能的 URI 模式 (https://)
    const uriPattern = /68747470733A2F2F[0-9A-Fa-f]+/g;
    const matches = cellHex.match(uriPattern);

    if (matches && matches.length > 0) {
      for (const match of matches) {
        try {
          const uriBytes = Buffer.from(match, 'hex');
          const uri = uriBytes.toString('utf8');
          console.log('[TON Balance] Found URI:', uri);

          if (uri && uri.includes('http')) {
            return {
              uri: uri.trim(),
              uriLength: uri.length,
            };
          }
        } catch (hexError) {
          console.log('[TON Balance] Hex parsing failed:', hexError);
        }
      }
    }

    console.log('[TON Balance] No valid URI found');
    return null;
  } catch (error) {
    console.warn('[TON Balance] Parsing jetton content failed:', error);
    return null;
  }
};
