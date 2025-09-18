'use client';
import { useEffect } from 'react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

/**
 * 修复 Solana 钱包适配器导致的滚动问题
 * 只在钱包模态框打开时应用修复，关闭时移除
 */
export default function WalletScrollFix() {
  const { visible } = useWalletModal();

  useEffect(() => {
    if (visible) {
      // 钱包模态框打开时，确保页面可以滚动
      const originalBodyOverflow = document.body.style.overflow;
      const originalBodyPosition = document.body.style.position;
      const originalHtmlOverflow = document.documentElement.style.overflow;

      // 强制允许滚动
      // document.body.style.overflow = 'auto';
      // document.body.style.position = 'static';
      // document.documentElement.style.overflow = 'auto';

      // 清理函数：模态框关闭时恢复原始状态
      return () => {
        document.body.style.overflow = 'auto';
        document.body.style.position = 'static';
        document.documentElement.style.overflow = 'auto';
        // document.body.style.overflow = originalBodyOverflow;
        // document.body.style.position = originalBodyPosition;
        // document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [visible]);

  return null;
}
