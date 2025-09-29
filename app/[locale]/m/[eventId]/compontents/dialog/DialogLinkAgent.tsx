import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@shadcn/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from '@shadcn/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@shadcn/lib/utils';
import { getUserIsAcceptedAgent, acceptAgent, getTwitterAuthUrl } from '@libs/request';
import { toast } from 'sonner';
import { openCenteredPopup } from '@libs/utils/twitter-utils';
import { useAppDispatch } from '@store/hooks';
import { updateIsLoggedIn, updateTwitterFullProfile } from '@store/reducers/userSlice';
import { ChannelEventType, LoginStatus, subscribeTo } from '@libs/utils/broadcast';
import UIDialogKOLLogin, { LoginStatusType } from '@ui/dialog/KOLLogin';
import { LucideBot, Success, Fail } from '@assets/svg';
import { useLocale } from 'next-intl';
import { IEventInfoResponseData } from '@libs/request';
import LoaderCircle from '@ui/loading/loader-circle';

interface DialogLinkAgentProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  eventInfo: IEventInfoResponseData;
}

export default function DialogLinkAgent({
  isOpen,
  onClose,
  onSuccess,
  eventInfo,
}: DialogLinkAgentProps) {
  const t = useTranslations('common');
  const dispatch = useAppDispatch();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const win = useRef<any>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [isAuthing, setIsAuthing] = useState(false);
  const [open, setOpen] = useState(false);
  const [loginStatusType, setLoginStatusType] = useState(LoginStatusType.WAITING_AUTHORIZED);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const locale = useLocale();
  const authTimeSec = 60; // 超时时间 s

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
        setIsSuccess(true); // 显示成功状态
        onSuccess?.();
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
  }, [dispatch, t, onSuccess, onClose]);

  // 检查授权是否超时
  const checkAuthTimeOut = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      colseWin();
      setLoginStatusType(LoginStatusType.AUTHORIZED_ERROR);
      setIsAuthing(false);
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

  // 创建 Agent
  const handleCreateAgent = useCallback(async () => {
    try {
      setIsCreatingAgent(true);

      const res: any = await acceptAgent();

      if (res.code === 200) {
        // toast.success(t('agent_created_successfully'));
        // 创建成功后开始授权流程
        handleTwitterAuth();
      } else {
        toast.error(res.msg || t('failed_to_create_agent'));
      }
    } catch (error) {
      console.error('Failed to create agent:', error);
      toast.error(t('failed_to_create_agent'));
    } finally {
      setIsCreatingAgent(false);
    }
  }, [t]);

  // Twitter 授权
  const handleTwitterAuth = useCallback(async () => {
    try {
      setIsAuthing(true);
      setLoginStatusType(LoginStatusType.WAITING_AUTHORIZED);
      setOpen(true);

      const currentUrl = `${window.location.origin}/${locale}/twitter`;
      const res = await getTwitterAuthUrl({
        call_back_url: currentUrl,
      });

      if (!res || res.code !== 200) {
        toast.error(t('kol_twitter_auth_login_failed'));
        setIsAuthing(false);
        setOpen(false);
        return;
      }

      localStorage.setItem('twitter_x_id', res.data.app_id);
      localStorage.setItem('twitter_callback_url', currentUrl);
      localStorage.setItem('twitter_oauth_token', res.data.oauth_token);
      localStorage.setItem('twitter_oauth_token_secret', res.data.oauth_token_secret);
      localStorage.setItem('twitter_auth_version', 'v1'); // 标记使用v1版本

      if (res.data.authorization_url) {
        win.current = openCenteredPopup(res.data.authorization_url, '', 600, 600);
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
    }
  }, [t]);

  const handleClose = useCallback(() => {
    setIsLoading(false);
    setIsCreatingAgent(false);
    setIsAuthing(false);
    setOpen(false);
    setLoginStatusType(LoginStatusType.WAITING_AUTHORIZED);
    setIsSuccess(false);
    setIsFailed(false);
    colseWin();
    onClose();
  }, [onClose]);

  const handleTryAgain = useCallback(() => {
    setIsFailed(false);
    setIsCreatingAgent(false);
    setIsAuthing(false);
    setOpen(false);
    setLoginStatusType(LoginStatusType.WAITING_AUTHORIZED);
    handleCreateAgent();
  }, []);

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
              {t('link_agent')}
            </DialogTitle>
          </DialogHeader>

          {/* Content */}
          <div className={cn('bg-background space-y-4 rounded-b-xl p-6 sm:rounded-b-2xl')}>
            {isLoading ? (
              // 加载状态
              <div className="flex flex-col items-center justify-center py-10">
                <LoaderCircle text={`${t('loading')}...`} />
              </div>
            ) : isSuccess ? (
              // 成功状态
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full">
                  <Success className="h-full w-full text-white" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold">{t('agent_created_successfully')}</p>
                  <p className="text-muted-foreground text-sm">{t('twitter_auth_success')}</p>
                </div>
                <div className="flex w-40">
                  <Button
                    onClick={handleClose}
                    variant="secondary"
                    className="!h-auto flex-1 !rounded-lg"
                  >
                    {t('done')}
                  </Button>
                </div>
              </div>
            ) : isFailed ? (
              // 失败状态
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full">
                  <Fail className="h-full w-full text-white" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold">{t('agent_creation_failed')}</p>
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
              // 默认状态 - 显示创建Agent的UI
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
                  <p className="text-sm font-bold sm:text-base">{t('fed_up_with_daily_tasks_1')}</p>
                  <p className="text-sm font-bold sm:text-base">{t('fed_up_with_daily_tasks_2')}</p>
                  <p className="mt-4 px-2 text-sm sm:text-base">
                    {t('earn_tickets_or_usdt_with_agent')}
                  </p>
                </div>

                {/* 按钮 */}
                <div className="flex w-full gap-2">
                  <Button
                    onClick={handleClose}
                    variant="secondary"
                    className="!h-auto flex-1 !rounded-lg"
                  >
                    {t('next_time')}
                  </Button>
                  <Button
                    onClick={handleCreateAgent}
                    disabled={isCreatingAgent || isAuthing}
                    className="!h-auto flex-1 !rounded-lg"
                  >
                    {isCreatingAgent || isAuthing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {isCreatingAgent ? t('creating_agent') : t('create_agent')}
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
