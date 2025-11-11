'use client';
import { useQuery } from '@tanstack/react-query';
import { getActivityFollowers } from '@libs/request';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { getTwitterAuthByUsernameOrLink } from '@libs/request';
import { updateTwitterFullProfile } from '@store/reducers/userSlice';
import { updateIsLoggedIn } from '@store/reducers/userSlice';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { useTelegram } from 'app/context/TgProvider';
import { CACHE_KEY } from '@constants/app';
import HotOpinions from './components/HotOpinions';

export default function MarketEventsPage() {
  const dispatch = useAppDispatch();
  const t = useTranslations('common');
  const { webApp, isTelegram } = useTelegram();
  const isLoggedIn = useAppSelector((state) => state.userReducer?.isLoggedIn);

  const handleTgStartApp = async (screen_name: string) => {
    try {
      if (isLoggedIn) return;
      const twitterInfo: any = await getTwitterAuthByUsernameOrLink({
        screen_name,
      });
      if (twitterInfo && twitterInfo.code === 200) {
        const { token } = twitterInfo.data;
        document.cookie = `${CACHE_KEY.KOL_TOKEN}=${token}; path=/;`;
        localStorage.setItem(CACHE_KEY.KOL_TOKEN, token);
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

  const handled = useRef(false);
  useEffect(() => {
    if (!isTelegram || !webApp) return;
    if (handled.current) return;
    handled.current = true;
    if (webApp) {
      const screen_name = webApp?.initDataUnsafe.start_param;
      if (screen_name) {
        handleTgStartApp(screen_name);
      }
    }
  }, [webApp, isTelegram]);
  return (
    <div className="relative z-10 mx-auto box-border w-full max-w-[1100px] space-y-5 p-0">
      <HotOpinions />
    </div>
  );
}
