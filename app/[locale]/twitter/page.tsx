'use client';

import { ChannelEventType, LoginStatus, postEvent } from '@libs/utils/broadcast';
import Loader from '@ui/loading/loader';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  getTwitterAuthCallbackV2,
  getTwitterAuthCompleteCallbackV2,
  getTwitterAuthUserInfoV2,
} from '@libs/request';
import { CACHE_KEY } from '@constants/app';
import { useRouter } from '@libs/i18n/navigation';
import PagesRoute from '@constants/routes';
import { Fail, Success } from '@assets/svg';
import { Button } from '@shadcn/components/ui/button';
import { useTranslations } from 'next-intl';
import { useAppDispatch } from '@store/hooks';
import { updateIsLoggedIn, updateTwitterFullProfile } from '@store/reducers/userSlice';

export default function TwitterPage() {
  const params = useSearchParams();
  const router = useRouter();
  const t = useTranslations('common');
  const dispatch = useAppDispatch();

  const [staus, setStatus] = useState<LoginStatus>(LoginStatus.SUCCESS);

  // 返回根目录的处理函数
  const handleGoHome = () => {
    router.push(PagesRoute.HOME);
  };

  const handleTwitterAuthCallback = async () => {
    try {
      const error = params.get('error');
      if (error == 'access_denied') {
        //推特授权失败
        postEvent(ChannelEventType.LOGIN_STATUS, {
          status: LoginStatus.ERROR,
          userInfo: null,
          method: 'TwitterAuth',
        });
        return;
      }

      const code = params.get('code');
      if (!code) {
        //推特授权失败
        postEvent(ChannelEventType.LOGIN_STATUS, {
          status: LoginStatus.ERROR,
          userInfo: null,
          method: 'TwitterAuth',
        });
        return;
      }

      const x_id = localStorage.getItem('twitter_x_id');
      if (!x_id) {
        //推特授权失败
        postEvent(ChannelEventType.LOGIN_STATUS, {
          status: LoginStatus.ERROR,
          userInfo: null,
          method: 'TwitterAuth',
        });
        return;
      }
      setStatus(LoginStatus.WAITING);
      postEvent(ChannelEventType.LOGIN_STATUS, {
        status: LoginStatus.WAITING,
        userInfo: null,
        method: 'TwitterAuth',
      });

      const twitterAuth = await getTwitterAuth(code, x_id);
      const userInfo = await getUserInfoByTwitter(x_id, twitterAuth);
      const loginInfo = await getLoginInfo(userInfo, twitterAuth);

      const { token } = loginInfo;
      document.cookie = `${CACHE_KEY.KOL_TOKEN}=${token}; path=/;`;
      localStorage.setItem(CACHE_KEY.KOL_TOKEN, token);
      dispatch(updateIsLoggedIn(true));
      dispatch(updateTwitterFullProfile({ ...userInfo, ...loginInfo }));
      setStatus(LoginStatus.SUCCESS);
      postEvent(ChannelEventType.LOGIN_STATUS, {
        status: LoginStatus.SUCCESS,
        userInfo: {
          ...userInfo,
          ...loginInfo,
        },
        method: 'TwitterAuth',
      });
    } catch (error) {
      console.log(error);
      setStatus(LoginStatus.ERROR);
      postEvent(ChannelEventType.LOGIN_STATUS, {
        status: LoginStatus.WAITING,
        userInfo: null,
        method: 'TwitterAuth',
      });
    }
  };

  const getTwitterAuth = async (code: string, x_id: string): Promise<any> => {
    try {
      const res: any = await getTwitterAuthCallbackV2({
        code,
        x_id,
        call_back_url: localStorage.getItem('twitter_callback_url') || '',
      });

      if (res && res.code === 200) {
        return res.data;
      } else {
        throw res.msg;
      }
    } catch (error) {
      console.log('getTwitterAuth error', error);

      throw error;
    }
  };

  const getUserInfoByTwitter = async (x_id: string, data: any) => {
    try {
      const res: any = await getTwitterAuthUserInfoV2({
        access_token: data.access_token,
        x_id,
      });

      if (res && res.code === 200) {
        return res.data;
      } else {
        throw res.msg;
      }
    } catch (error) {
      console.log('getUserInfoByTwitter error', error);

      throw error;
    }
  };

  const getLoginInfo = async (full_profile: any, data: any) => {
    try {
      const res: any = await getTwitterAuthCompleteCallbackV2({
        x_id: localStorage.getItem('twitter_x_id') || '',
        access_token: data.access_token,
        expires_in: data.expires_in,
        refresh_token: data.refresh_token,
        description: full_profile.description,
        profile_image_url_https: full_profile.profile_image_url,
        screen_name: full_profile.username,
        user_id: full_profile.id,
        name: data.name,
      });

      if (res && res.code === 200) {
        return res.data;
      } else {
        throw res.msg;
      }
    } catch (error) {
      console.log('getLoginInfo error', error);

      throw error;
    }
  };

  const handled = useRef(false);
  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    handleTwitterAuthCallback();
  }, [params]);
  return (
    <div className="h-[100dvh] w-full">
      {staus == LoginStatus.WAITING && (
        <div className="h-full w-full">
          <Loader></Loader>
        </div>
      )}

      {staus == LoginStatus.SUCCESS && (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-8">
          <div className="w-full max-w-md space-y-6 text-center">
            {/* 成功图标 */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Success className="h-full w-full" />
            </div>

            {/* 成功标题 */}
            <h1 className="text-2xl font-bold text-gray-900">{t('twitter_auth_success_title')}</h1>

            {/* 成功描述 */}
            <p className="text-gray-600">{t('twitter_auth_success_description')}</p>

            {/* 返回首页按钮 */}
            <Button onClick={handleGoHome}>{t('btn_back_home')}</Button>
          </div>
        </div>
      )}

      {staus == LoginStatus.ERROR && (
        <div className="flex h-full w-full flex-col items-center justify-center p-8">
          <div className="w-full max-w-md space-y-6 text-center">
            {/* 错误图标 */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <Fail className="h-full w-full" />
            </div>

            {/* 错误标题 */}
            <h1 className="text-2xl font-bold text-gray-900">{t('twitter_auth_failed_title')}</h1>

            {/* 错误描述 */}
            <p className="text-gray-600">{t('twitter_auth_failed_description')}</p>

            {/* 返回首页按钮 */}
            <Button onClick={handleGoHome} variant="secondary">
              {t('btn_back_home')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
