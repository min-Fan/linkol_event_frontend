'use client';

import { ReactNode, useEffect } from 'react';

import PagesRoute from '@constants/routes';
import { useRouter, usePathname } from '@libs/i18n/navigation';
import useUserInfo from '@hooks/useUserInfo';
import UILoading from '@ui/loading';

export default function CheckLoginStatus(props: { children: ReactNode }) {
  const { children } = props;
  const router = useRouter();
  const pathname = usePathname();
  const { isLogin } = useUserInfo();

  useEffect(() => {
    if (isLogin) {
      return;
    }

    router.replace(`${PagesRoute.AUTH}?redirect=${encodeURIComponent(pathname + location.search)}`);
  }, [isLogin]);

  if (!isLogin) {
    return <UILoading />;
  }

  return <>{children}</>;
}
