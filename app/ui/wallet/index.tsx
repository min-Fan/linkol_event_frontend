'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { LoaderCircle } from 'lucide-react';

import { Button } from '@shadcn-ui/button';
import { toast } from 'sonner';

import useUserInfo from '@hooks/useUserInfo';
import clsx from 'clsx';

export default function UIWallet(props: { className?: string; onSuccess?: () => void }) {
  const { className = '', onSuccess } = props;
  const t = useTranslations('common');
  const { isPending, isConnected, isLogin, connect, login, logout } = useUserInfo();

  const handleConnect = () => {
    connect();
    // 连接钱包后调用回调函数
    onSuccess?.();
  };

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      toast.error(t('login_failed'));
    }
  };

  useEffect(() => {
    if (!isLogin) {
      return;
    }
  }, [isLogin]);

  if (isConnected) {
    return (
      <Button
        className={clsx('relative', className)}
        variant="default"
        disabled={isPending}
        onClick={handleLogin}
      >
        <span className="opacity-0">{t('btn_log_sign')}</span>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {isPending ? <LoaderCircle className="animate-spin" /> : <span>{t('btn_log_sign')}</span>}
        </div>
      </Button>
    );
  }

  return (
    <Button
      className={clsx('relative', className)}
      variant="default"
      disabled={isPending}
      onClick={handleConnect}
    >
      <span className="opacity-0">{t('btn_connect_wallet')}</span>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {isPending ? (
          <LoaderCircle className="animate-spin" />
        ) : (
          <span>{t('btn_connect_wallet')}</span>
        )}
      </div>
    </Button>
  );
}
