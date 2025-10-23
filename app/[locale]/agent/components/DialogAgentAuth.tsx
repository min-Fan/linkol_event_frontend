import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@shadcn/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@shadcn/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@shadcn/lib/utils';
import { getTwitterAuthUrl, acceptAgent } from '@libs/request';
import { toast } from 'sonner';
import { openCenteredPopup } from '@libs/utils/twitter-utils';
import { useAppDispatch } from '@store/hooks';
import { updateIsLoggedIn, updateTwitterFullProfile } from '@store/reducers/userSlice';
import { ChannelEventType, LoginStatus, subscribeTo } from '@libs/utils/broadcast';
import UIDialogKOLLogin, { LoginStatusType } from '@ui/dialog/KOLLogin';
import { LucideBot, Success, Fail } from '@assets/svg';
import { useLocale } from 'next-intl';
import LoaderCircle from '@ui/loading/loader-circle';
import { useTelegram } from 'app/context/TgProvider';
import { useParams } from 'next/navigation';

interface DialogAgentAuthProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DialogAgentAuth({ isOpen, onClose, onSuccess }: DialogAgentAuthProps) {
  const t = useTranslations('common');
  const dispatch = useAppDispatch();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const win = useRef<any>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isAuthing, setIsAuthing] = useState(false);
  const [isAcceptingAgent, setIsAcceptingAgent] = useState(false);
  const [open, setOpen] = useState(false);
  const [loginStatusType, setLoginStatusType] = useState(LoginStatusType.WAITING_AUTHORIZED);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const locale = useLocale();
  const authTimeSec = 120; // 超时时间 s
  const { webApp, isTelegram } = useTelegram();
  const { eventId } = useParams();

  // 调用接受Agent接口
  const handleAcceptAgent = useCallback(async () => {
    try {
      setIsAcceptingAgent(true);
      const res: any = await acceptAgent({
        active_id: eventId ? parseInt(eventId as string) : 0,
      });

      if (res.code === 200) {
        // 接受成功，显示成功状态
        setIsSuccess(true);
        // 1.5秒后调用回调并关闭
        setTimeout(() => {
          onSuccess?.();
          setOpen(false);
          setIsSuccess(false);
          setIsFailed(false);
          onClose();
        }, 1500);
      } else {
        // 接受失败
        toast.error(res.msg || t('failed_to_create_agent'));
        setIsFailed(true);
      }
    } catch (error) {
      console.error('Accept agent failed:', error);
      toast.error(t('failed_to_create_agent'));
      setIsFailed(true);
    } finally {
      setIsAcceptingAgent(false);
    }
  }, [t, onSuccess, onClose]);

  // 监听授权状态变化
  useEffect(() => {
    const unsubscribe = subscribeTo(ChannelEventType.LOGIN_STATUS, (payload) => {
      if (payload.status == LoginStatus.SUCCESS) {
        colseWin();
        dispatch(updateTwitterFullProfile(payload.userInfo));
        dispatch(updateIsLoggedIn(true));
        toast.success(t('twitter_auth_success'));
        setIsAuthing(false);
        setOpen(false); // 关闭授权弹窗
        // 授权成功后，调用接受Agent接口
        handleAcceptAgent();
      } else if (payload.status == LoginStatus.ERROR) {
        colseWin();
        setLoginStatusType(LoginStatusType.AUTHORIZED_ERROR);
        setIsAuthing(false);
        setOpen(false); // 关闭授权弹窗
        setIsFailed(true); // 显示失败状态
      }
    });
    return () => {
      colseWin();
      unsubscribe();
    };
  }, [dispatch, t, handleAcceptAgent]);

  // 检查授权是否超时
  const checkAuthTimeOut = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      colseWin();
      setLoginStatusType(LoginStatusType.AUTHORIZED_ERROR);
      setIsAuthing(false);
      setIsFailed(true);
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
          setIsAuthing(false);
          setIsFailed(true);
        }
        intervalRef.current = null;
      }
    }, 500);
  };

  const colseWin = () => {
    if (win.current) {
      win.current.close();
      win.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const onOpenChange = (flg: boolean) => {
    setOpen(flg);
    if (flg == false) {
      colseWin();
      setIsAuthing(false); // 重置授权状态
    }
  };

  // Twitter 授权
  const handleTwitterAuth = useCallback(async () => {
    try {
      setIsAuthing(true);
      setLoginStatusType(LoginStatusType.WAITING_AUTHORIZED);
      setOpen(true);

      // 设置来源类型和时间戳
      const authSource = isTelegram ? 'telegram' : 'web';
      const authTimestamp = Date.now().toString();
      const authId = `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      console.log('V1 Twitter Auth Source:', authSource);
      console.log('V1 Is Telegram:', isTelegram);
      console.log('V1 Auth ID:', authId);

      // 构建回调URL，包含授权信息作为URL参数
      const baseUrl = `${window.location.origin}/${locale}/twitter`;
      const callbackUrl = new URL(baseUrl);
      callbackUrl.searchParams.set('auth_source', authSource);
      callbackUrl.searchParams.set('auth_timestamp', authTimestamp);
      callbackUrl.searchParams.set('auth_id', authId);
      callbackUrl.searchParams.set('auth_version', 'v1');

      // 使用 toString() 获取完整 URL，确保只有一个 ? 号
      const currentUrl = callbackUrl.toString();
      console.log('V1 Callback URL with params:', currentUrl);
      console.log(
        'V1 Callback URL params:',
        Object.fromEntries(callbackUrl.searchParams.entries())
      );

      const res = await getTwitterAuthUrl({
        call_back_url: currentUrl,
      });

      if (!res || res.code !== 200) {
        toast.error(t('kol_twitter_auth_login_failed'));
        setIsAuthing(false);
        setOpen(false);
        setIsFailed(true);
        return;
      }

      // 保存授权信息到localStorage（作为备用）
      localStorage.setItem('twitter_x_id', res.data.app_id);
      localStorage.setItem('twitter_callback_url', currentUrl);
      localStorage.setItem('twitter_oauth_token', res.data.oauth_token);
      localStorage.setItem('twitter_oauth_token_secret', res.data.oauth_token_secret);
      localStorage.setItem('twitter_auth_version', 'v1');
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

      if (res.data.authorization_url) {
        win.current = openCenteredPopup(
          res.data.authorization_url,
          isTelegram,
          webApp,
          'Twitter Auth',
          600,
          600
        );
        if (isTelegram && webApp) {
          webApp.close();
          return;
        }
        if (win.current === null) {
          location.href = res.data.authorization_url;
        } else {
          checkAuthTimeOut();
          checkWinClose();
        }
      }
    } catch (error) {
      console.error('Twitter auth failed:', error);
      toast.error(t('kol_twitter_auth_login_failed'));
      setIsAuthing(false);
      setOpen(false);
      setIsFailed(true);
    }
  }, [t, isTelegram, locale, webApp]);

  const handleClose = useCallback(() => {
    setIsLoading(false);
    setIsAuthing(false);
    setIsAcceptingAgent(false);
    setOpen(false);
    setLoginStatusType(LoginStatusType.WAITING_AUTHORIZED);
    setIsSuccess(false);
    setIsFailed(false);
    colseWin();
    onClose();
  }, [onClose]);

  const handleTryAgain = useCallback(() => {
    setIsFailed(false);
    setIsAuthing(false);
    setIsAcceptingAgent(false);
    setOpen(false);
    setLoginStatusType(LoginStatusType.WAITING_AUTHORIZED);
    handleTwitterAuth();
  }, [handleTwitterAuth]);

  const handleStartAuth = useCallback(() => {
    handleTwitterAuth();
  }, [handleTwitterAuth]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogClose asChild></DialogClose>
        <DialogContent
          className="border-border flex max-h-[90vh] w-96 max-w-full flex-col gap-0 overflow-hidden bg-transparent p-4 shadow-none sm:w-[450px] sm:max-w-full sm:p-0"
          nonClosable
        >
          {/* Header */}
          <DialogHeader className="bg-primary gap-0 rounded-t-xl p-2 text-center text-white sm:rounded-t-2xl sm:p-4">
            <DialogTitle className="text-center text-base font-semibold text-white">
              {t('agent_authorization')}
            </DialogTitle>
          </DialogHeader>

          {/* Content */}
          <div className={cn('bg-background space-y-4 rounded-b-xl p-6 sm:rounded-b-2xl')}>
            {isLoading || isAcceptingAgent ? (
              // 加载状态
              <div className="flex flex-col items-center justify-center py-10">
                <LoaderCircle
                  text={isAcceptingAgent ? `${t('creating_agent')}...` : `${t('loading')}...`}
                />
              </div>
            ) : isSuccess ? (
              // 成功状态
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full">
                  <Success className="h-full w-full text-white" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold">{t('authorization_success')}</p>
                  <p className="text-muted-foreground text-sm">{t('twitter_auth_success')}</p>
                </div>
              </div>
            ) : isFailed ? (
              // 失败状态
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full">
                  <Fail className="h-full w-full text-white" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold">{t('authorization_failed')}</p>
                  <p className="text-muted-foreground text-sm">
                    {t('twitter_auth_failed_description')}
                  </p>
                </div>
                <div className="flex w-full gap-2">
                  <Button
                    onClick={handleClose}
                    variant="secondary"
                    className="!h-auto flex-1 !rounded-lg"
                  >
                    {t('cancel')}
                  </Button>
                  <Button onClick={handleTryAgain} className="!h-auto flex-1 !rounded-lg">
                    {t('try_again')}
                  </Button>
                </div>
              </div>
            ) : (
              // 默认状态 - 显示授权提示的UI
              <div className="flex flex-col items-center justify-center space-y-4">
                {/* 图标 */}
                <div className="relative z-10 flex items-center justify-center py-8">
                  <div className="relative z-10">
                    <LucideBot className="w-16" />
                    <div className="bg-primary/50 absolute top-0 left-[-55%] z-[-1] h-[110%] w-[110%] rounded-full blur-xl" />
                    <div className="absolute top-0 left-[55%] z-[-1] h-[110%] w-[110%] rounded-full bg-[#BFFF00] blur-xl" />
                  </div>
                </div>

                {/* 标题和描述 */}
                <div className="mb-6 text-center">
                  <p className="text-sm font-bold sm:text-base">{t('agent_auth_required')}</p>
                  <p className="mt-4 px-2 text-sm sm:text-base">{t('agent_auth_description')}</p>
                </div>

                {/* 按钮 */}
                <div className="flex w-full gap-2">
                  <Button
                    onClick={handleClose}
                    variant="secondary"
                    className="!h-auto flex-1 !rounded-lg"
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    onClick={handleStartAuth}
                    disabled={isAuthing || isAcceptingAgent}
                    className="!h-auto flex-1 !rounded-lg"
                  >
                    {isAuthing || isAcceptingAgent ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {t('authorize_now')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 授权弹窗 */}
      <UIDialogKOLLogin
        open={open}
        onOpenChange={onOpenChange}
        loginStatusType={loginStatusType}
        onLoginStatusTypeChange={setLoginStatusType}
        hideAlternativeMethod={true} // 隐藏其他验证方式
      />
    </>
  );
}
