'use client';

import React, { useRef, useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '@store/hooks';

import Banner from './components/Banner';
import OrderList from './components/OrderList';
import ProjectTotalData from './components/ProjectTotalData';
import TipsMsg from './components/TipsMsg';
import TwitterMsgCard from './components/TwitterMsgCard';
import { useRouter } from '@libs/i18n/navigation';
import { verifyIsNeedLogin } from '@libs/request';
import { updateIsLoggedIn } from '@store/reducers/userSlice';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export default function KOLPage() {
  const t = useTranslations('common');
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((state) => state.userReducer?.isLoggedIn);
  const hasVerified = useRef(false);

  const verifyLogin = async () => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const res = await verifyIsNeedLogin();
    if (res.code === 200 && res.data.relogin) {
      toast.error(t('please_login_again'));
      dispatch(updateIsLoggedIn(false));
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      verifyLogin();
    }
  }, [isLoggedIn]);

  return (
    <div className="mx-auto box-border flex h-full w-full max-w-[1600px] flex-1 flex-col space-y-4 p-4">
      {isLoggedIn ? (
        <TwitterMsgCard />
      ) : (
        <div className="flex gap-x-4">
          <div className="hidden md:block">
            <ProjectTotalData />
          </div>
          <Banner />
        </div>
      )}
      {/* <TipsMsg /> */}
      <OrderList />
    </div>
  );
}
