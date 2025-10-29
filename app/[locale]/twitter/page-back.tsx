'use client';

import { ChannelEventType, LoginStatus, postEvent } from '@libs/utils/broadcast';
import Loader from '@ui/loading/loader';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  getTwitterAuthCallbackV2,
  getTwitterAuthCompleteCallbackV2,
  getTwitterAuthUserInfoV2,
  getTwitterAuthCallback,
  getTwitterAuthCompleteCallback,
  getTwitterAuthUserInfo,
} from '@libs/request';
import { CACHE_KEY } from '@constants/app';
import { useRouter } from '@libs/i18n/navigation';
import PagesRoute from '@constants/routes';
import { Fail, Success } from '@assets/svg';
import { Button } from '@shadcn/components/ui/button';
import { useTranslations } from 'next-intl';
import { useAppDispatch } from '@store/hooks';
import { updateIsLoggedIn, updateTwitterFullProfile } from '@store/reducers/userSlice';
import {
  getAuthSourceType,
  isFromTelegram,
  isAuthSourceValid,
  clearAuthSource,
  getAuthSourceTypeHybrid,
  isFromTelegramHybrid,
  getAuthSourceHybrid,
} from '@libs/utils/auth-source-utils';
import { getInviteCodeFromCookie } from '@libs/utils/inviteCode';

export default function TwitterPage() {
  const params = useSearchParams();
  const router = useRouter();
  const t = useTranslations('common');
  const dispatch = useAppDispatch();

  const [staus, setStatus] = useState<LoginStatus>(LoginStatus.SUCCESS);

  // 返回根目录的处理函数
  const handleGoHome = () => {
    // 使用混合函数获取授权来源
    const authSourceType = getAuthSourceTypeHybrid(params);

    console.log('Auth source type for redirect:', authSourceType);
    if (authSourceType === 'telegram') {
      location.href = `${process.env.NEXT_PUBLIC_TG_MINI_APP}?startapp`;
      return;
    }

    // 清除授权源数据
    clearAuthSource();
    router.push(PagesRoute.HOME);
  };

  const handleTwitterAuthCallback = async () => {
    try {
      // 使用混合函数获取授权信息（优先URL参数，回退到localStorage）
      const authSourceData = getAuthSourceHybrid(params);
      const authSourceType = getAuthSourceTypeHybrid(params);
      const isFromTG = isFromTelegramHybrid(params);

      // 获取版本信息
      const urlVersion = params.get('auth_version');
      const localStorageVersion = localStorage.getItem('twitter_auth_version');
      const version = urlVersion || localStorageVersion || 'v2';
      const isV1 = version === 'v1';

      // 验证时间戳
      let isSourceValid = true;
      if (authSourceData?.timestamp) {
        const now = Date.now();
        const authTime = parseInt(authSourceData.timestamp);
        const maxAge = 30 * 60 * 1000; // 30分钟
        isSourceValid = now - authTime <= maxAge;
      }

      console.log('Twitter Callback - Version:', version);
      console.log('Twitter Callback - Auth Source Type:', authSourceType);
      console.log('Twitter Callback - Is From Telegram:', isFromTG);
      console.log('Twitter Callback - Is Source Valid:', isSourceValid);
      console.log('Twitter Callback - Auth Source Data:', authSourceData);

      // 如果授权源无效，记录警告
      if (!isSourceValid) {
        console.warn('Auth source is invalid or expired');
      }

      const error = params.get('error');
      if (error == 'access_denied') {
        //推特授权失败
        postEvent(ChannelEventType.LOGIN_STATUS, {
          status: LoginStatus.ERROR,
          userInfo: null,
          method: 'TwitterAuth',
        });
        setStatus(LoginStatus.ERROR);
        return;
      }

      if (isV1) {
        // V1 版本处理
        const oauth_token = params.get('oauth_token');
        const oauth_verifier = params.get('oauth_verifier');

        if (!oauth_token || !oauth_verifier) {
          postEvent(ChannelEventType.LOGIN_STATUS, {
            status: LoginStatus.ERROR,
            userInfo: null,
            method: 'TwitterAuth',
          });
          setStatus(LoginStatus.ERROR);
          return;
        }

        setStatus(LoginStatus.WAITING);
        postEvent(ChannelEventType.LOGIN_STATUS, {
          status: LoginStatus.WAITING,
          userInfo: null,
          method: 'TwitterAuth',
        });

        const twitterAuth = await getTwitterAuthV1(oauth_token, oauth_verifier);
        const userInfo = await getUserInfoByTwitterV1(twitterAuth);
        const loginInfo = await getLoginInfoV1(userInfo.full_profile, twitterAuth);

        const { token } = loginInfo;
        document.cookie = `${CACHE_KEY.KOL_TOKEN}=${token}; path=/;`;
        localStorage.setItem(CACHE_KEY.KOL_TOKEN, token);

        // V1版本也支持Telegram重定向
        if (authSourceType === 'telegram') {
          location.href = `${process.env.NEXT_PUBLIC_TG_MINI_APP}?startapp`;
          return;
        }

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
      } else {
        // V2 版本处理（原有逻辑）
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
        if (authSourceType === 'telegram') {
          location.href = `${process.env.NEXT_PUBLIC_TG_MINI_APP}?startapp=${loginInfo.screen_name}`;
          return;
        }
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
      }
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

  // V1 版本函数
  const getTwitterAuthV1 = async (oauth_token: string, oauth_verifier: string): Promise<any> => {
    try {
      const res: any = await getTwitterAuthCallback({
        oauth_token,
        oauth_verifier,
        oauth_token_secret: localStorage.getItem('twitter_oauth_token_secret') || '', // V1 版本可能需要从 localStorage 获取
        app_id: localStorage.getItem('twitter_x_id') || '', // V1 版本可能需要从 localStorage 获取
      });

      if (res && res.code === 200) {
        return res.data;
      } else {
        postEvent(ChannelEventType.LOGIN_STATUS, {
          status: LoginStatus.ERROR,
          userInfo: null,
          method: 'TwitterAuth',
        });
        throw res.msg;
      }
    } catch (error) {
      console.log('getTwitterAuthV1 error', error);
      postEvent(ChannelEventType.LOGIN_STATUS, {
        status: LoginStatus.ERROR,
        userInfo: null,
        method: 'TwitterAuth',
      });
      throw error;
    }
  };

  const getUserInfoByTwitterV1 = async (data: any) => {
    try {
      const res: any = await getTwitterAuthUserInfo({
        access_token: data.oauth_token,
        access_token_secret: data.oauth_token_secret,
        app_id: localStorage.getItem('twitter_x_id') || '',
      });

      if (res && res.code === 200) {
        return res.data;
      } else {
        postEvent(ChannelEventType.LOGIN_STATUS, {
          status: LoginStatus.ERROR,
          userInfo: null,
          method: 'TwitterAuth',
        });
        throw res.msg;
      }
    } catch (error) {
      console.log('getUserInfoByTwitterV1 error', error);
      postEvent(ChannelEventType.LOGIN_STATUS, {
        status: LoginStatus.ERROR,
        userInfo: null,
        method: 'TwitterAuth',
      });
      throw error;
    }
  };

  const getLoginInfoV1 = async (full_profile: any, data: any) => {
    try {
      const res: any = await getTwitterAuthCompleteCallback({
        app_id: localStorage.getItem('twitter_x_id') || '',
        description: full_profile.description,
        oauth_token: data.oauth_token,
        oauth_token_secret: data.oauth_token_secret,
        profile_image_url_https: full_profile.profile_image_url_https,
        screen_name: full_profile.screen_name,
        user_id: full_profile.id,
      });

      if (res && res.code === 200) {
        return res.data;
      } else {
        postEvent(ChannelEventType.LOGIN_STATUS, {
          status: LoginStatus.ERROR,
          userInfo: null,
          method: 'TwitterAuth',
        });
        throw res.msg;
      }
    } catch (error) {
      postEvent(ChannelEventType.LOGIN_STATUS, {
        status: LoginStatus.ERROR,
        userInfo: null,
        method: 'TwitterAuth',
      });
      console.log('getLoginInfoV1 error', error);
      throw error;
    }
  };

  // V2 版本函数（原有逻辑）
  const getTwitterAuth = async (code: string, x_id: string): Promise<any> => {
    try {
      // 构建当前页面的回调URL，保持与传入回调地址相同的格式
      const currentUrl = new URL(window.location.href);
      const callbackUrlObj = new URL(currentUrl.origin + currentUrl.pathname);

      // 只保留auth相关的参数，去掉x_id、state、code等Twitter回调参数
      const authParams = ['auth_source', 'auth_timestamp', 'auth_id', 'auth_version'];
      authParams.forEach((param) => {
        if (currentUrl.searchParams.has(param)) {
          let value = currentUrl.searchParams.get(param)!;
          // 清理auth_version参数，确保只包含版本号
          if (param === 'auth_version') {
            // 处理各种可能的格式：v2?x_id=4, v2%3Fx_id%3D4 等
            value = value.split('%3F')[0]; // 处理URL编码的?符号
            value = value.split('?')[0]; // 处理未编码的?符号
            value = value.trim(); // 去除空格
          }
          callbackUrlObj.searchParams.set(param, value);
        }
      });

      const callbackUrl = callbackUrlObj.toString();

      console.log('=== URL Debug Info ===');
      console.log('Current URL:', window.location.href);
      console.log(
        'Current URL search params:',
        Object.fromEntries(currentUrl.searchParams.entries())
      );
      console.log('Auth version raw value:', currentUrl.searchParams.get('auth_version'));
      console.log('Callback URL:', callbackUrl);
      console.log(
        'Callback URL params:',
        Object.fromEntries(new URL(callbackUrl).searchParams.entries())
      );
      console.log('========================');

      const res: any = await getTwitterAuthCallbackV2({
        code,
        x_id,
        call_back_url: callbackUrl,
      });

      if (res && res.code === 200) {
        return res.data;
      } else {
        postEvent(ChannelEventType.LOGIN_STATUS, {
          status: LoginStatus.ERROR,
          userInfo: null,
          method: 'TwitterAuth',
        });
        throw res.msg;
      }
    } catch (error) {
      postEvent(ChannelEventType.LOGIN_STATUS, {
        status: LoginStatus.ERROR,
        userInfo: null,
        method: 'TwitterAuth',
      });
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
        postEvent(ChannelEventType.LOGIN_STATUS, {
          status: LoginStatus.ERROR,
          userInfo: null,
          method: 'TwitterAuth',
        });
        throw res.msg;
      }
    } catch (error) {
      console.log('getUserInfoByTwitter error', error);

      postEvent(ChannelEventType.LOGIN_STATUS, {
        status: LoginStatus.ERROR,
        userInfo: null,
        method: 'TwitterAuth',
      });
      throw error;
    }
  };

  const getLoginInfo = async (full_profile: any, data: any) => {
    try {
      const inviteCode = getInviteCodeFromCookie() || '';
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
        verified: full_profile.verified,
        verified_type: full_profile.verified_type,
        invite_code: inviteCode,
        created_at: full_profile.created_at || '',
      });

      if (res && res.code === 200) {
        return res.data;
      } else {
        postEvent(ChannelEventType.LOGIN_STATUS, {
          status: LoginStatus.ERROR,
          userInfo: null,
          method: 'TwitterAuth',
        });
        throw res.msg;
      }
    } catch (error) {
      console.log('getLoginInfo error', error);
      postEvent(ChannelEventType.LOGIN_STATUS, {
        status: LoginStatus.ERROR,
        userInfo: null,
        method: 'TwitterAuth',
      });
      throw error;
    }
  };

  const handled = useRef(false);
  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    setStatus(LoginStatus.WAITING);
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
