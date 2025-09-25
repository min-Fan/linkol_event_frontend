'use client';
import { useTonWallet, useTonConnectUI, CHAIN } from '@tonconnect/ui-react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { updateIsLoginTon } from '@store/reducers/userSlice';
import { useCallback, useEffect, memo } from 'react';
import { Button } from '@shadcn/components/ui/button';
import { cn } from '@shadcn/lib/utils';
import useLogoutTon from './useLoginTon';
import { useTranslations } from 'next-intl';

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

  useEffect(() => {
    if (!wallet) {
      disConnectTon();
    }
  }, [wallet]);

  useEffect(() => {
    // 钱包连接后自动登录
    if (wallet && !isLoginTon) {
      handleSignMessage();
    }
  }, [wallet, isLoginTon]);

  // 签名登录
  const handleSignMessage = useCallback(async () => {
    if (!wallet) {
      console.log('TON Wallet not connected');
      return;
    }

    try {
      console.log('TON Wallet connected:', wallet.account.address);

      // 构建需要签名的消息
      const timestamp = Math.floor(Date.now() / 1000);
      const messageToSign = `Login to Linkol Event Platform\nTimestamp: ${timestamp}\nAddress: ${wallet.account.address}`;

      console.log('messageToSign:', messageToSign);

      const result = await tonConnectUI.signData({
        network: CHAIN.MAINNET,
        from: wallet.account.address,
        type: 'text',
        text: messageToSign,
      });
      console.log('TON result:', result);
      dispatchApp(updateIsLoginTon(true));
      onSuccess?.();
    } catch (error) {
      console.log('TON Wallet login error:', error);
      // 如果登录失败，仍然允许登录（可选）
      dispatchApp(updateIsLoginTon(true));
      onSuccess?.();
    }
  }, [wallet, dispatchApp, onSuccess, tonConnectUI]);

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
        <Button className={cn(className)} onClick={handleSignMessage}>
          {t('Sign message')}
        </Button>
      ) : (
        <div className="flex flex-col items-center space-y-2">
          <div className="text-sm text-gray-600">
            {t('connected')}: {wallet.account.address.slice(0, 6)}...
            {wallet.account.address.slice(-4)}
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
