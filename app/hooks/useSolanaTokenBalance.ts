import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useState, useEffect } from 'react';

/**
 * 获取Solana SPL token余额的hook
 */
export const useSolanaTokenBalance = (mintAddress?: string) => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<bigint>(BigInt(0));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTokenBalance = async () => {
    if (!publicKey || !mintAddress || !connection) {
      setBalance(BigInt(0));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 获取用户的token账户
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        mint: new PublicKey(mintAddress),
      });

      if (tokenAccounts.value.length === 0) {
        setBalance(BigInt(0));
        return;
      }

      // 获取第一个token账户的余额
      const tokenAccount = tokenAccounts.value[0];
      const balance = tokenAccount.account.data.parsed.info.tokenAmount.uiAmount;
      setBalance(BigInt(Math.floor(balance * Math.pow(10, 6)))); // 假设精度为6
    } catch (err) {
      console.error('获取Solana token余额失败:', err);
      setError(err instanceof Error ? err.message : '获取余额失败');
      setBalance(BigInt(0));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // fetchTokenBalance();
  }, [publicKey, mintAddress, connection]);

  return {
    balance,
    isLoading,
    error,
    refetch: fetchTokenBalance,
  };
};
