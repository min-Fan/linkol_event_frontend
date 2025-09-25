import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useState, useEffect } from 'react';
import { Address, beginCell, Cell } from 'ton';
import { tonClient } from '@libs/ton-client';

/**
 * 获取 TON 链 token 余额的 hook
 * 支持获取 TON 原生代币余额和 Jetton 代币余额
 * @param mintAddress - Jetton 代币合约地址，如果不提供则获取 TON 原生代币余额
 */
export const useTonTokenBalance = (mintAddress?: string) => {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const [balance, setBalance] = useState<bigint>(BigInt(0));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTokenBalance = async () => {
    if (!wallet || !tonConnectUI) {
      setBalance(BigInt(0));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userAddress = Address.parse(wallet.account.address);

      if (!mintAddress) {
        // 如果没有指定 mintAddress，获取 TON 原生代币余额
        const balance = await tonClient.getBalance(userAddress);
        setBalance(balance);
      } else {
        // 获取 Jetton 代币余额
        const jettonMinter = Address.parse(mintAddress);

        // 1. 先通过 jetton minter 获取用户的 Jetton Wallet 地址
        const jettonWalletRes = await tonClient.runMethod(jettonMinter, 'get_wallet_address', [
          { type: 'slice', cell: beginCell().storeAddress(userAddress).endCell() },
        ]);
        const jettonWalletAddress = jettonWalletRes.stack.readAddress();

        // 2. 再调用该 Jetton Wallet 合约的 get_wallet_data
        const walletData = await tonClient.runMethod(jettonWalletAddress, 'get_wallet_data');
        const balance = walletData.stack.readBigNumber(); // 代币余额

        setBalance(balance);
      }
    } catch (err) {
      console.error('Get TON token balance failed:', err);
      setError(err instanceof Error ? err.message : 'Get balance failed');
      setBalance(BigInt(0));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (wallet) {
      fetchTokenBalance();
    }
  }, [wallet, mintAddress]);

  return {
    balance,
    isLoading,
    error,
    refetch: fetchTokenBalance,
  };
};

/**
 * 解析 jetton content cell 获取 metadata 信息
 * @param contentCell - jetton content cell
 * @returns 解析后的 metadata 信息
 */
export const parseJettonContent = (contentCell: Cell) => {
  try {
    console.log('Start parsing jetton content cell:', contentCell.toString());

    // 从 cell 的十六进制表示中提取 URI
    const cellHex = contentCell.toString();
    console.log('Cell hex:', cellHex);

    // 查找可能的 URI 模式 (https://)
    const uriPattern = /68747470733A2F2F[0-9A-Fa-f]+/g;
    const matches = cellHex.match(uriPattern);

    if (matches && matches.length > 0) {
      for (const match of matches) {
        try {
          const uriBytes = Buffer.from(match, 'hex');
          const uri = uriBytes.toString('utf8');
          console.log('Found URI:', uri);

          if (uri && uri.includes('http')) {
            return {
              uri: uri.trim(),
              uriLength: uri.length,
            };
          }
        } catch (hexError) {
          console.log('Hex parsing failed:', hexError);
        }
      }
    }

    console.log('No valid URI found');
    return null;
  } catch (error) {
    console.warn('Parsing jetton content failed:', error);
    return null;
  }
};
