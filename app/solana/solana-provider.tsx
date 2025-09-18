'use client';
import { AnchorProvider } from '@coral-xyz/anchor';
import { WalletError } from '@solana/wallet-adapter-base';
import {
  AnchorWallet,
  ConnectionProvider,
  useConnection,
  useWallet,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton, useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Connection } from '@solana/web3.js';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useCluster } from '../cluster/cluster-data-access';
import WalletScrollFix from '../components/WalletScrollFix';

import '@solana/wallet-adapter-react-ui/styles.css';
import { Button } from '@shadcn/components/ui/button';

export const WalletButton = ({ onSuccess, onWalletModalOpen }: { onSuccess?: () => void; onWalletModalOpen?: () => void }) => {
  const { setVisible: setModalVisible } = useWalletModal();
  const { connect, connecting, connected } = useWallet();
  
  // 监听钱包连接状态变化
  useEffect(() => {
    if (connected && onSuccess) {
      onSuccess();
    }
  }, [connected, onSuccess]);
  
  const handleClick = () => {
    // 当用户点击钱包按钮时，先关闭领取弹窗
    onWalletModalOpen?.();
    // 然后打开钱包选择弹窗
    setModalVisible(true);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={connecting}
      >
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    </>
  );
};

export function SolanaProvider({ children }: { children: ReactNode }) {
  const { cluster } = useCluster();
  const endpoint = useMemo(() => cluster.endpoint, [cluster]);
  const onError = useCallback((error: WalletError) => {
    console.error(error);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} onError={onError} autoConnect={true}>
        <WalletModalProvider>
          <WalletScrollFix />
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export function useAnchorProvider() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const rpc = process.env.NEXT_PUBLIC_SOLANA_RPC;
  const [conn, setConn] = useState<Connection>(connection);

  useEffect(() => {
    if (rpc) {
      const connLocal = new Connection(rpc, 'confirmed');
      setConn(connLocal);
    } else {
      setConn(connection);
    }
  }, [rpc]);
  return new AnchorProvider(conn, wallet as AnchorWallet, {
    commitment: 'confirmed',
  });
}
