'use client';
import useLogoutSolana from './useLoginSolana';
import { WalletButton } from '../../solana/solana-provider';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateAccount, updateIsLoginSolana } from '../../store/reducers/userSlice';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { useCallback, useEffect, memo } from 'react';
import styled from 'styled-components';
import nacl from 'tweetnacl';
import NavWallet from './NavWallet';
import { Button } from '@shadcn/components/ui/button';
import { cn } from '@shadcn/lib/utils';
import { useTranslations } from 'next-intl';

const ConnectStyled = styled.div``;

interface ConnectProps {
  className?: string;
  onSuccess?: () => void;
  onWalletModalOpen?: () => void;
}

const Connect = memo(function Connect({ className, onSuccess, onWalletModalOpen }: ConnectProps) {
  const t = useTranslations('common');
  const { wallet, publicKey, signIn, signMessage, connected, connecting } = useWallet();
  const isLoginSolana = useAppSelector((state) => state.userReducer?.isLoginSolana);
  const dispatchApp = useAppDispatch();
  const { disConnectSolana } = useLogoutSolana();

  useEffect(() => {
    const localAccount = localStorage.getItem('SOLANA_ACCOUNT');
    if (!publicKey) return;
    console.log('localAccount ==>', localAccount, publicKey.toString());
    if (localAccount) {
      if (localAccount != publicKey.toString()) {
        disConnectSolana();
        dispatchApp(updateIsLoginSolana(false));
        dispatchApp(updateAccount(null));
      } else {
        dispatchApp(updateAccount(publicKey));
        dispatchApp(updateIsLoginSolana(true));
      }
      localStorage.setItem('SOLANA_ACCOUNT', publicKey.toString());
    }
  }, [publicKey]);

  useEffect(() => {
    if (!wallet) {
      disConnectSolana();
    }
  }, [wallet]);

  useEffect(() => {
    // 未登录自动弹出 signIn
    // console.log('isLoginSolana ==>', isLoginSolana, connected);
    // if (connected && !isLoginSolana) {
    //   handleSignMessage();
    // }
  }, [connecting, connected]);

  // 签名
  const handleSignMessage = useCallback(async () => {
    if (!publicKey) {
      console.log('Wallet not connected');
      return;
    }

    try {
      // Tips: signIn 签名更稳妥
      // @ts-ignore
      const signature = await signIn();
      // 将签名和公钥发送到服务器进行验证
      console.log(
        'Signature:',
        signature.account.address,
        bs58.encode(signature.account.publicKey as Uint8Array)
      );
      console.log(
        'Signature:',
        JSON.stringify(signature.signature),
        bs58.encode(signature.signature as Uint8Array)
      );
      console.log(
        'Signature:',
        JSON.stringify(signature.signedMessage.subarray()),
        bs58.encode(signature.signedMessage as Uint8Array)
      );

      const userPublicKey = new PublicKey(signature.account.address);

      const isValid = nacl.sign.detached.verify(
        signature.signedMessage,
        signature.signature,
        userPublicKey.toBuffer()
      );
      console.log('isValid ==>', isValid);

      localStorage.setItem('SOLANA_ACCOUNT', publicKey.toString());
      dispatchApp(updateIsLoginSolana(true));
      dispatchApp(updateAccount(publicKey));
    } catch (error) {
      console.log('Signing error:', error);
    }
  }, [publicKey, signIn, dispatchApp]);

  return (
    <ConnectStyled className={cn(className)}>
      {!connected ? (
        <>
          <WalletButton onSuccess={onSuccess} onWalletModalOpen={onWalletModalOpen} />
        </>
      ) : connected && !isLoginSolana ? (
        <Button className={cn(className)} onClick={handleSignMessage}>
          {t('Sign message')}
        </Button>
      ) : (
        <NavWallet></NavWallet>
      )}
    </ConnectStyled>
  );
});

export default Connect;
