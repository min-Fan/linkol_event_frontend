'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { toast } from 'sonner';

import { CACHE_KEY } from '@constants/app';
import {
  getTwitterAuthCallbackV2,
  getTwitterAuthCompleteCallbackV2,
  getTwitterAuthUserInfoV2,
} from '@libs/request';
import { useAppDispatch } from '@store/hooks';
import { updateIsLoggedIn, updateTwitterFullProfile } from '@store/reducers/userSlice';
import { ChannelEventType, postEvent } from '@libs/utils/broadcast';

export default function useTwitterAuth(completeFunction?: () => void) {
  const t = useTranslations('common');
  const params = useSearchParams();
  const dispatch = useAppDispatch();
  const mycode = params.get('code');
  const [isTwitterAuthLoading, setIsTwitterAuthLoading] = useState(false);

  const clearUrlParams = () => {
    const url = new URL(window.location.href);
    url.search = ''; // 清空查询参数
    window.history.replaceState({}, document.title, url.toString());
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

  const handleTwitterAuthCallback = async () => {
    try {
      if (isTwitterAuthLoading) {
        return;
      }

      const code = params.get('code');

      if (!code) {
        return;
      }

      const x_id = localStorage.getItem('twitter_x_id');

      if (!x_id) {
        return;
      }
      setIsTwitterAuthLoading(true);

      const twitterAuth = await getTwitterAuth(code, x_id);
      const userInfo = await getUserInfoByTwitter(x_id, twitterAuth);
      const loginInfo = await getLoginInfo(userInfo, twitterAuth);

      const { token } = loginInfo;

      document.cookie = `${CACHE_KEY.KOL_TOKEN}=${token}; path=/;`;
      localStorage.setItem(CACHE_KEY.KOL_TOKEN, token);

      dispatch(updateIsLoggedIn(true));

      completeFunction?.(); // 完成授权后回调
      //发送一个事件
      // const channel = new BroadcastChannel('twitterChannel');
      // channel.postMessage({event: 'twitterLogin', status: 'success'});
      toast.success(t('twitter_auth_success'));
      // postEvent(ChannelEventType.LOGIN_STATUS, {
      //   status: true,
      //   userInfo: {
      //     ...userInfo,
      //     ...loginInfo
      //   },
      //   method: 'TwitterAuth',
      // });
    } catch (error) {
      console.log(error);
      clearUrlParams();
      // postEvent(ChannelEventType.LOGIN_STATUS, {
      //   status: false,
      //   userInfo: null,
      //   method: 'TwitterAuth',
      // });
    } finally {
      setIsTwitterAuthLoading(false);
    }
  };
  const handled = useRef(false);
  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    handleTwitterAuthCallback();
  }, [mycode]);

  return {
    isTwitterAuthLoading,
  };
}
