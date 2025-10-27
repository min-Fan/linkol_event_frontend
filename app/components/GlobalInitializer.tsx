'use client';
import { useEffect, useRef } from 'react';
import { useGetConst } from '@hooks/useGetConst';
import { verifyIsNeedLogin } from '@libs/request';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useAppSelector } from '@store/hooks';
import useUserInfo from '@hooks/useUserInfo';

export default function GlobalInitializer() {
  const { getConst } = useGetConst();
  const hasVerified = useRef(false);
  const isLoggedIn = useAppSelector((state) => state.userReducer?.isLoggedIn);
  const t = useTranslations('common');
  const { logout } = useUserInfo();

  const verifyLogin = async () => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const res = await verifyIsNeedLogin();
    if (res.code === 200 && res.data.relogin) {
      toast.error(t('please_login_again'));
      logout();
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      verifyLogin();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    // getConst();
  }, []);

  return null;
}
