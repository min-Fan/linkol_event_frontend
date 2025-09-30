'use client';

import { useGetConst } from '@hooks/useGetConst';
import { useEffect, useRef } from 'react';
import MarketEventsLayout from './m/layout';
import MarketEventsPage from './m/page';
import { useTelegram } from 'app/context/TgProvider';
import { getTwitterAuthByUsernameOrLink } from '@libs/request';
import { updateTwitterFullProfile } from '@store/reducers/userSlice';
import { updateIsLoggedIn } from '@store/reducers/userSlice';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useAppDispatch } from '@store/hooks';

export default function ProjectPage() {
  const { getConst } = useGetConst();
  const { webApp } = useTelegram();
  const dispatch = useAppDispatch();
  const t = useTranslations('common');

  const handleTgStartApp = async (screen_name: string) => {
    try {
      const twitterInfo: any = await getTwitterAuthByUsernameOrLink({
        screen_name,
      });
      if (twitterInfo && twitterInfo.code === 200) {
        dispatch(updateTwitterFullProfile(twitterInfo.data));
        dispatch(updateIsLoggedIn(true));
        toast.success(t('twitter_auth_success'));
      } else {
        toast.error(t('kol_twitter_auth_login_failed'));
      }
    } catch (error) {
      webApp?.showAlert(JSON.stringify(error));
      toast.error(t('kol_twitter_auth_login_failed'));
    }
  };

  useEffect(() => {
    getConst();
  }, []);

  const handled = useRef(false);
  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    if (webApp) {
      const screen_name = webApp.initDataUnsafe.start_param;
      if (screen_name) {
        handleTgStartApp(screen_name);
      }
    }
  }, [webApp]);

  return (
    <MarketEventsLayout>
      <MarketEventsPage />
    </MarketEventsLayout>
  );
}
