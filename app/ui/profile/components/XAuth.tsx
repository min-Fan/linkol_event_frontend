'use client';

import { useLocale, useTranslations } from 'next-intl';

import useTwitterAuth from '@hooks/useTwitterAuth';
import UIDialogKOLLogin, { LoginStatusType } from '@ui/dialog/KOLLogin';
import { LoaderCircle } from 'lucide-react';
import { Button } from '@shadcn-ui/button';
import { useEffect, useRef, useState } from 'react';
import { ChannelEventType, LoginStatus, postEvent, subscribeTo } from '@libs/utils/broadcast';
import { getTwitterAuthUrlV2 } from '@libs/request';
import { toast } from 'sonner';
import { openCenteredPopup } from '@libs/utils/twitter-utils';
import { useAppDispatch } from '@store/hooks';
import { updateIsLoggedIn, updateTwitterFullProfile } from '@store/reducers/userSlice';
import UITheme from '@ui/theme';
import UILanguage from '@ui/language';
import { cn } from '@shadcn/lib/utils';
import { TwitterX } from '@assets/svg';
import { useTelegram } from 'app/context/TgProvider';

export default function XAuth({
  button,
  className,
}: {
  button?: React.ReactNode;
  className?: string;
}) {
  const t = useTranslations('common');
  const dispatch = useAppDispatch();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null); //检查授权超时
  const intervalRef = useRef<NodeJS.Timeout | null>(null); //检查窗体是否被关闭
  const win = useRef<any>(null);
  const [open, setOpen] = useState(false);
  const [loginStatusType, setLoginStatusType] = useState(LoginStatusType.WAITING_AUTHORIZED);
  const lang = useLocale();
  const authTimeSec = 60; //超时时间 s
  const { webApp, isTelegram } = useTelegram();
  useEffect(() => {
    const unsubscribe = subscribeTo(ChannelEventType.LOGIN_STATUS, (payload) => {
      if (payload.status == LoginStatus.SUCCESS) {
        colseWin();
        dispatch(updateTwitterFullProfile(payload.userInfo));
        dispatch(updateIsLoggedIn(true));
        toast.success(t('twitter_auth_success'));
      } else if (payload.status == LoginStatus.ERROR) {
        colseWin();
        setLoginStatusType(LoginStatusType.AUTHORIZED_ERROR);
      }
    });
    return () => {
      colseWin();
      unsubscribe();
    };
  }, []);

  const handleTwitterAuth = async () => {
    try {
      // 设置来源类型和时间戳
      const authSource = isTelegram ? 'telegram' : 'web';
      const authTimestamp = Date.now().toString();
      const authId = `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      console.log('Twitter Auth Source:', authSource);
      console.log('Is Telegram:', isTelegram);
      console.log('Auth ID:', authId);

      // 构建回调URL，包含授权信息作为URL参数
      const baseUrl = `${window.location.origin}/${lang}/twitter`;
      const callbackUrl = new URL(baseUrl);
      callbackUrl.searchParams.set('auth_source', authSource);
      callbackUrl.searchParams.set('auth_timestamp', authTimestamp);
      callbackUrl.searchParams.set('auth_id', authId);
      callbackUrl.searchParams.set('auth_version', 'v2');

      const currentUrl = callbackUrl.toString();
      console.log('Callback URL with params:', currentUrl);

      setLoginStatusType(LoginStatusType.WAITING_AUTHORIZED);
      setOpen(true);

      const res = await getTwitterAuthUrlV2({
        call_back_url: currentUrl,
      });

      if (!res || res.code !== 200) {
        toast.error(t('kol_twitter_auth_login_failed'));
        return;
      }

      // 保存授权信息到localStorage（作为备用）
      localStorage.setItem('twitter_x_id', res.data.x_id);
      localStorage.setItem('twitter_callback_url', currentUrl);
      localStorage.setItem('twitter_auth_version', 'v2');
      localStorage.setItem('twitter_auth_url_type', authSource);
      localStorage.setItem('twitter_auth_timestamp', authTimestamp);
      localStorage.setItem('twitter_auth_id', authId);
      localStorage.setItem(
        'twitter_auth_source',
        JSON.stringify({
          type: authSource,
          timestamp: authTimestamp,
          isTelegram: isTelegram,
          userAgent: navigator.userAgent,
          authId: authId,
        })
      );

      if (res.data.url) {
        win.current = openCenteredPopup(res.data.url, isTelegram, webApp, 'Twitter Auth', 600, 600);
        if (isTelegram && webApp) {
          webApp.close();
          return;
        }

        if (win.current === null) {
          location.href = res.data.url;
        } else {
          checkAuthTimeOut();
          checkWinClose();
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(t('kol_twitter_auth_login_failed'));
    }
  };

  //检查授权是否超时
  const checkAuthTimeOut = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    //超时判定授权失败
    timeoutRef.current = setTimeout(() => {
      colseWin();
      setLoginStatusType(LoginStatusType.AUTHORIZED_ERROR);
    }, 1000 * authTimeSec);
  };

  const checkWinClose = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      if (win.current?.closed) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          setLoginStatusType(LoginStatusType.AUTHORIZED_ERROR);
        }
        intervalRef.current = null;
      }
    }, 500);
  };

  const colseWin = () => {
    // if (win.current) {
    //   win.current.close();
    //   win.current = null;
    // }
    // if (timeoutRef.current) {
    //   clearTimeout(timeoutRef.current);
    // }
    // if (intervalRef.current) {
    //   clearInterval(intervalRef.current);
    // }
  };

  const onOpenChange = (flg: boolean) => {
    setOpen(flg);
    if (flg == false) {
      //弹窗关闭，关闭授权窗口
      colseWin();
    }
  };

  return (
    <>
      <Button
        className={cn(
          'flex w-auto items-center gap-2 !rounded-xl bg-black dark:bg-white dark:text-black',
          open && 'pointer-events-none cursor-not-allowed',
          className
        )}
        onClick={handleTwitterAuth}
      >
        {button ? (
          button
        ) : (
          <>
            {open ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <>
                <TwitterX className="!h-4 !w-4 sm:!h-5 sm:!w-5" />
                {t('link_twitter')}
              </>
            )}
          </>
        )}
      </Button>
      <UIDialogKOLLogin
        open={open}
        onOpenChange={onOpenChange}
        loginStatusType={loginStatusType}
        onLoginStatusTypeChange={setLoginStatusType}
      ></UIDialogKOLLogin>
    </>
  );
}
