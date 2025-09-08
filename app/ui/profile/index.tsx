'use client';
import useUserInfo from '@hooks/useUserInfo';

import ComLogInMenu from './components/LogInMenu';
import ComLogOutMenu, { MenuSize } from './components/LogOutMenu';
import { usePathname } from '@libs/i18n/navigation';
import { useAppSelector } from '@store/hooks';
import CompXAuth from './components/XAuth';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';

export { MenuSize };

export default function UIProfile(props: { size?: MenuSize }) {
  const { size } = props;
  const { isLogin, logoutWallet } = useUserInfo();
  const { isConnected } = useAccount();
  const pathname = usePathname();
  const isLoggedIn = useAppSelector((state) => state.userReducer?.isLoggedIn);

  useEffect(() => {
    console.log('UIProfile size', size);
  }, [size]);

  useEffect(() => {
    if (!isConnected) {
      logoutWallet();
      return;
    }
  }, [isConnected]);

  // if ((pathname.includes('kol') || pathname.includes('market_events')) && !isLoggedIn) {
  //   return <CompXAuth />;
  // }

  // if ((pathname.includes('kol') || pathname.includes('market_events')) && isLoggedIn) {
  //   return <ComLogOutMenu size={size} />;
  // }

  if (isLoggedIn) {
    return <ComLogOutMenu size={size} />;
  }

  return <CompXAuth />;
}
