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
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection } from '@solana/web3.js';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useCluster } from '../cluster/cluster-data-access';

import '@solana/wallet-adapter-react-ui/styles.css';

export const WalletButton = () => (
  <>
    <WalletMultiButton
      style={{
        boxShadow: '0px -4px 0px 0px rgba(0,0,0,0.16) inset',
      }}
    />
  </>
);

export function SolanaProvider({ children }: { children: ReactNode }) {
  const { cluster } = useCluster();
  const endpoint = useMemo(() => cluster.endpoint, [cluster]);
  const onError = useCallback((error: WalletError) => {
    console.error(error);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} onError={onError} autoConnect={true}>
        <WalletModalProvider>{children}</WalletModalProvider>
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
