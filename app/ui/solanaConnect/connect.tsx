'use client';
import useLogout from './useLogin';
import { WalletButton } from '../../solana/solana-provider';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateAccount, updateIsLoggedIn } from '../../store/reducers/userSlice';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { useCallback, useEffect } from 'react';
import styled from 'styled-components';
import nacl from 'tweetnacl';
import NavWallet from './NavWallet';
import { Button } from '@shadcn/components/ui/button';
import useUserInfo from '@hooks/useUserInfo';
import { useDispatch } from 'react-redux';
import { AppEventType } from '@store/reducer';

const ConnectStyled = styled.div`
  height: 40px;
`;
export default function Connect() {
  const { wallet, publicKey, signIn, signMessage, connected, connecting } = useWallet();
  // const isLogin = useAppSelector((state) => state.userReducer?.isLoggedIn);
  const { isLogin } = useUserInfo();
  const dispatch = useDispatch();
  const dispatchApp = useAppDispatch();
  const { disConnect } = useLogout();

  useEffect(() => {
    const localAccount = localStorage.getItem('SOLANA_ACCOUNT');
    if (!publicKey) return;
    console.log('localAccount ==>', localAccount, publicKey.toString());
    if (localAccount) {
      if (localAccount != publicKey.toString()) {
        disConnect();
      } else {
        dispatchApp(updateAccount(publicKey));
      }
      localStorage.setItem('SOLANA_ACCOUNT', publicKey.toString());
    }
  }, [publicKey]);

  useEffect(() => {
    if (!wallet) {
      disConnect();
    }
  }, [wallet]);

  useEffect(() => {
    // 未登录自动弹出 signIn
    // console.log('isLogin ==>', isLogin, connected);
    // if (connected && !isLogin) {
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
      dispatch({
        type: AppEventType.UPDATE_USER_INFO,
        payload: { isLogin: true },
      });
    } catch (error) {
      console.log('Signing error:', error);
    }
  }, [publicKey, signIn]);

  return (
    <ConnectStyled>
      {!connected ? (
        <>
          <WalletButton />
        </>
      ) : connected && !isLogin ? (
        <Button className="h-[48px]" onClick={handleSignMessage}>
          Sign message
        </Button>
      ) : (
        <NavWallet></NavWallet>
      )}
    </ConnectStyled>
  );
}
