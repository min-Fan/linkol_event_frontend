'use client';

import { useEffect } from 'react';
import { useGetConst } from '@hooks/useGetConst';
import { usePayTokenInfo } from '@hooks/usePayTokenInfo';

export default function GlobalInitializer() {
  const { getConst } = useGetConst();
  const { getPayTokenInfo: getBaseUsdcTokenInfo } = usePayTokenInfo('base', 'usdc');
  const { getPayTokenInfo: getBaseUsdtTokenInfo } = usePayTokenInfo('base', 'usdt');
  const { getPayTokenInfo: getSolanaUsd1TokenInfo } = usePayTokenInfo('solana', 'usd1');

  useEffect(() => {
    // getConst();
    // 初始化时获取所有支持的链和token的信息
    getBaseUsdcTokenInfo();
    getBaseUsdtTokenInfo();
    getSolanaUsd1TokenInfo();
  }, []);

  return null;
}
