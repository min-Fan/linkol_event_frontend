import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useAppDispatch } from '@store/hooks';
import { AppEventType } from '@store/reducer';
import { updateAccount } from '@store/reducers/userSlice';
import { useDispatch } from 'react-redux';

const useLogout = () => {
  const { disconnect } = useWallet();
  const dispatch = useDispatch();
  const dispatchApp = useAppDispatch();
  const disConnect = () => {
    disconnect();
    dispatch({
      type: AppEventType.UPDATE_USER_INFO,
      payload: { isLogin: false },
    });
    dispatchApp(updateAccount(null));
    localStorage.removeItem('SOLANA_ACCOUNT');
  };
  return { disConnect };
};

export default useLogout;
