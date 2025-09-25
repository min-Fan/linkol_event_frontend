'use client';

import { useEffect } from 'react';
import { useGetConst } from '@hooks/useGetConst';
import { usePayTokenInfo } from '@hooks/usePayTokenInfo';

export default function GlobalInitializer() {
  const { getConst } = useGetConst();
  // 这些 hook 会自动在 useEffect 中获取 token 信息，不需要手动调用
  usePayTokenInfo('base', 'usdc');
  usePayTokenInfo('solana', 'usd1');
  usePayTokenInfo('ton', 'usdt');

  useEffect(() => {
    // getConst();
    // token 信息获取已经由 usePayTokenInfo hook 的 useEffect 自动处理
  }, []);

  return null;
}
