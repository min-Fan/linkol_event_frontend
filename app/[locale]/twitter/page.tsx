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

export default function TwitterPage() {
  const params = useSearchParams();

  const [staus, setStatus] = useState<LoginStatus>(LoginStatus.PENDING);

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
    </div>
  );
}
