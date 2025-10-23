'use client';

import { useEffect, useState } from 'react';
import { useAccount, useSignMessage, useChainId, useSwitchChain } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

import { CACHE_KEY } from '@constants/app';
import { bindWallet, getNonce } from '@libs/request';
import { useApp } from '@store/AppProvider';
import { AppEventType } from '@store/reducer';
import { useAppDispatch } from '@store/hooks';
import {
  clearQuickOrder,
  updateIsLoggedIn,
  updateTwitterFullProfile,
  updateIsLoginSolana,
  updateIsLoginTon,
} from '@store/reducers/userSlice';
import { DEFAULT_CHAIN } from '@constants/chains';
import useLogoutSolana from '@ui/solanaConnect/useLoginSolana';
import useLogoutTon from '@ui/tonConnect/useLoginTon';

export default function useUserInfo() {
  const { address, isConnected } = useAccount();
  const { data, status, signMessage } = useSignMessage();
  const { openConnectModal } = useConnectModal();
  const { state, dispatch } = useApp();
  const { isLogin, userId, username, email } = state;
  const { chainId } = useAccount();
  // const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [isPending, setIsPending] = useState<boolean>(false);
  const [nonce, setNonce] = useState<string>('');
  const dispatchApp = useAppDispatch();
  const { disConnectSolana } = useLogoutSolana();
  const { disConnectTon } = useLogoutTon();
  const connect = () => {
    if (isConnected) {
      return;
    }

    openConnectModal?.();
  };

  const login = async (chain_id?: number) => {
    if (isPending) {
      return;
    }

    try {
      setIsPending(true);

      // 检查是否在默认链上
      const isOnDefaultChain = chain_id ? chainId === chain_id : chainId === DEFAULT_CHAIN.id;
      // 如果不在默认链上，先切换到默认链
      if (!isOnDefaultChain) {
        // 获取默认链ID
        const targetChainId = chain_id ? chain_id : DEFAULT_CHAIN.id;

        // 尝试切换链
        try {
          await switchChain({ chainId: targetChainId });
        } catch (switchError) {
          setIsPending(false);
          throw new Error(`无法切换到默认链: ${switchError}`);
        }
      }

      const res = await getNonce({
        wallet: address as `0x${string}`,
      });
      const { code, data } = res;

      if (code !== 200) {
        throw new Error(res.message);
      }

      const { nonce } = data;

      setNonce(nonce);

      signMessage({
        message: nonce,
      });
    } catch (error) {
      setIsPending(false);

      throw new Error(error);
    }
  };

  const handleBindWallet = async (nonce: string, signature: string) => {
    try {
      const res = await bindWallet({
        wallet: address as `0x${string}`,
        nonce,
        signature,
      });

      const { code, data } = res;

      if (code !== 200) {
        throw new Error(res.message);
      }

      const { id, username, email, token } = data;

      document.cookie = `${CACHE_KEY.TOKEN}=${token}; path=/;`;
      localStorage.setItem(CACHE_KEY.TOKEN, token);

      dispatch({
        type: AppEventType.UPDATE_USER_INFO,
        payload: { isLogin: true, userId: '' + id, username, email: email || '' },
      });
    } catch (error) {
      setIsPending(false);

      throw new Error(error);
    }
  };

  const logout = () => {
    dispatch({
      type: AppEventType.UPDATE_USER_INFO,
      payload: { isLogin: false, userId: '', username: '', email: '' },
    });
    dispatchApp(clearQuickOrder());
    dispatchApp(updateTwitterFullProfile(null));
    dispatchApp(updateIsLoggedIn(false));
    dispatchApp(updateIsLoginSolana(false));
    dispatchApp(updateIsLoginTon(false));
    disConnectSolana();
    disConnectTon();

    document.cookie = `${CACHE_KEY.TOKEN}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    localStorage.removeItem(CACHE_KEY.TOKEN);
    document.cookie = `${CACHE_KEY.KOL_TOKEN}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    localStorage.removeItem(CACHE_KEY.KOL_TOKEN);
  };

  const logoutWallet = () => {
    dispatch({
      type: AppEventType.UPDATE_USER_INFO,
      payload: { isLogin: false, userId: '', username: '', email: '' },
    });
    dispatchApp(updateIsLoginSolana(false));
    dispatchApp(updateIsLoginTon(false));

    document.cookie = `${CACHE_KEY.TOKEN}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    localStorage.removeItem(CACHE_KEY.TOKEN);
  };
  const logoutSolana = () => {
    disConnectSolana();
  };

  const logoutTon = () => {
    disConnectTon();
  };

  const updateEmail = (email: string) => {
    dispatch({ type: AppEventType.UPDATE_USER_INFO, payload: { email } });
    dispatchApp(updateTwitterFullProfile({ email }));
  };

  useEffect(() => {
    if (status === 'error') {
      setIsPending(false);
    }

    if (status === 'success' && data) {
      handleBindWallet(nonce, data);
    }
  }, [data, status, nonce]);

  return {
    isConnected,
    isLogin,
    isPending,
    userId,
    username,
    email,
    connect,
    login,
    logout,
    updateEmail,
    logoutWallet,
    logoutSolana,
    logoutTon,
  };
}
