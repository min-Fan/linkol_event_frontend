import { useAppDispatch } from '@store/hooks';
import { updateAccount, updateIsLoginTon } from '@store/reducers/userSlice';
import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';

const useLogoutTon = () => {
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const dispatchApp = useAppDispatch();

  const disConnectTon = async () => {
    try {
      // 调用TON Connect UI的断开连接方法
      await tonConnectUI.disconnect();

      // 更新Redux状态
      dispatchApp(updateIsLoginTon(false));

      console.log('TON Wallet disconnected');
    } catch (error) {
      console.error('Failed to disconnect TON wallet:', error);
      // 即使断开连接失败，也要更新本地状态
      dispatchApp(updateIsLoginTon(false));
    }
  };

  return { disConnectTon };
};

export default useLogoutTon;
