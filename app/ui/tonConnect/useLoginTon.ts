'use client';
import { useAppDispatch } from '@store/hooks';
import { updateAccount, updateIsLoginTon } from '@store/reducers/userSlice';
import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';

const useLogoutTon = () => {
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const dispatchApp = useAppDispatch();

  const disConnectTon = async () => {
    try {
      // 检查钱包是否已连接，只有在连接状态下才调用断开连接方法
      if (wallet) {
        // 调用TON Connect UI的断开连接方法
        await tonConnectUI.disconnect();
        console.log('TON Wallet disconnected');
      } else {
        console.log('TON Wallet already disconnected');
      }

      // 更新Redux状态
      dispatchApp(updateIsLoginTon(false));
    } catch (error) {
      console.error('Failed to disconnect TON wallet:', error);
      // 即使断开连接失败，也要更新本地状态
      dispatchApp(updateIsLoginTon(false));
    }
  };

  return { disConnectTon };
};

export default useLogoutTon;
