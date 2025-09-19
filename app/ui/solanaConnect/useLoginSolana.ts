import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useAppDispatch } from '@store/hooks';
import { AppEventType } from '@store/reducer';
import { updateAccount, updateIsLoginSolana } from '@store/reducers/userSlice';
import { useDispatch } from 'react-redux';

const useLogoutSolana = () => {
  const { disconnect } = useWallet();
  const dispatch = useDispatch();
  const dispatchApp = useAppDispatch();
  const disConnectSolana = () => {
    disconnect();
    dispatchApp(updateAccount(null));
    dispatchApp(updateIsLoginSolana(false));
    localStorage.removeItem('SOLANA_ACCOUNT');
  };
  return { disConnectSolana };
};

export default useLogoutSolana;
