'use client';
import { useTonWallet, useTonConnectUI, CHAIN } from '@tonconnect/ui-react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { updateIsLoginTon } from '@store/reducers/userSlice';
import { useCallback, useEffect, memo, useState, useRef } from 'react';
import { Button } from '@shadcn/components/ui/button';
import { cn } from '@shadcn/lib/utils';
import useLogoutTon from './useLoginTon';
import { useTranslations } from 'next-intl';
import { Address } from 'ton-core';
import { toast } from 'sonner';

interface TonWalletConnectProps {
  className?: string;
  onSuccess?: () => void;
  onWalletModalOpen?: () => void;
}

const TonWalletConnect = memo(function TonWalletConnect({
  className,
  onSuccess,
  onWalletModalOpen,
}: TonWalletConnectProps) {
  const t = useTranslations('common');
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const isLoginTon = useAppSelector((state) => state.userReducer?.isLoginTon);
  const dispatchApp = useAppDispatch();
  const { disConnectTon } = useLogoutTon();

  // 签名状态管理
  const [isSigning, setIsSigning] = useState(false);
  const [hasAttemptedSign, setHasAttemptedSign] = useState(false);
  const signingRef = useRef(false);

  useEffect(() => {
    // 当钱包断开连接时，重置状态
    if (!wallet && isLoginTon) {
      disConnectTon()
      setHasAttemptedSign(false);
      setIsSigning(false);
      signingRef.current = false;
    }
  }, [wallet, isLoginTon, disConnectTon]);

  // useEffect(() => {
  //   if (!tonConnectUI) return;
  //   tonConnectUI.onStatusChange((walletInfo) => {
  //     if (walletInfo) {
  //       console.log("钱包已连接:", walletInfo);
  //     } else {
  //       console.log("钱包已断开连接");
  //       disConnectTon()
  //       setHasAttemptedSign(false);
  //       setIsSigning(false);
  //       signingRef.current = false;
  //     }
  //   });
  // }, [tonConnectUI]);

  // useEffect(() => {
  //   // 钱包连接后自动登录，但只尝试一次
  //   if (wallet && !isLoginTon && !isSigning && !signingRef.current) {
  //     setHasAttemptedSign(true);
  //     handleSignMessage();
  //   }
  // }, [wallet, isLoginTon, isSigning, signingRef.current]);

  // 签名登录
  const handleSignMessage = useCallback(async () => {
    // 防止重复调用
    if (!wallet || isSigning || signingRef.current) {
      console.log(
        'TON Wallet not connected or already signing',
        !wallet,
        isSigning,
        signingRef.current
      );
      return;
    }

    // 设置签名状态
    setIsSigning(true);
    signingRef.current = true;

    try {
      const walletAddress = wallet.account.address;
      console.log('TON Wallet connected:', walletAddress);

      // 构建需要签名的消息
      const timestamp = Math.floor(Date.now() / 1000);
      const messageToSign = `Login to Linkol Event Platform\nTimestamp: ${timestamp}\nAddress: ${Address.parse(wallet.account.address).toString({ bounceable: false })}`;

      console.log('messageToSign:', messageToSign);
      console.log('Wallet address format:', walletAddress);

      // 尝试第一种签名格式
      const result = await tonConnectUI.signData({
        network: CHAIN.MAINNET,
        from: walletAddress,
        type: 'text',
        text: messageToSign,
      });

      console.log('TON signature result:', result);

      // 验证签名结果
      if (result && result.signature) {
        dispatchApp(updateIsLoginTon(true));
        onSuccess?.();
        toast.success(t('login_success') || 'Login successful');
      } else {
        throw new Error('Invalid signature result');
      }
    } catch (error) {
      console.error('TON Wallet login error:', error);
      console.error('Error details:', { message: error.message });

      dispatchApp(updateIsLoginTon(false));
      setIsSigning(false);
      setHasAttemptedSign(false); // 允许重试
      signingRef.current = false;

      toast.error(error.message || t('login_failed'));
    } finally {
      // 重置签名状态
      setIsSigning(false);
      signingRef.current = false;
    }
  }, [wallet, dispatchApp, onSuccess, tonConnectUI, t]);

  const handleConnect = useCallback(() => {
    tonConnectUI.openModal();
    onWalletModalOpen?.();
  }, [tonConnectUI, onWalletModalOpen]);

  return (
    <div className={cn(className)}>
      {!wallet ? (
        <Button className={cn(className)} onClick={handleConnect}>
          {t('connect_wallet_ton')}
        </Button>
      ) : wallet && !isLoginTon ? (
        <Button
          className={cn(className)}
          onClick={handleSignMessage}
          disabled={isSigning || signingRef.current}
        >
          {isSigning ? t('signing') : t('Sign_message')}
        </Button>
      ) : (
        <div className="flex flex-col items-center space-y-2">
          <div className="text-sm text-gray-600">
            {t('connected')}:{' '}
            {Address.parse(wallet.account.address).toString({ bounceable: false }).slice(0, 6)}...
            {Address.parse(wallet.account.address).toString({ bounceable: false }).slice(-4)}
          </div>
          <Button onClick={disConnectTon} variant="outline" size="sm">
            {t('disconnect')}
          </Button>
        </div>
      )}
    </div>
  );
});

export default TonWalletConnect;
