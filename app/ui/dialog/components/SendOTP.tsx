'use client';

import { useEffect, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { toast } from 'sonner';
import clsx from 'clsx';

import { getOtpCode } from '@libs/request';

export default function SendOTP(props: { email: string }) {
  const { email } = props;
  const t = useTranslations('common');
  const [isPending, startTransition] = useTransition();

  const [canSend, setCanSend] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const clearTimer = () => {
    if (timer) {
      clearInterval(timer);

      setTimer(null);
    }
  };

  useEffect(() => {
    if (!canSend) {
      const newTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearTimer();
            setCanSend(true);

            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setTimer(newTimer);
    }

    return () => {
      clearTimer();
    };
  }, [canSend]);

  const handleOTP = () => {
    if (isPending || !canSend) {
      return;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error(t('error_email_required'));
      return;
    }

    startTransition(async () => {
      try {
        clearTimer();
        setCanSend(false);
        setCountdown(60);

        const res = await getOtpCode({
          email,
        });

        if (res.code !== 200) {
          toast.error(t('send_otp_failed'));
          clearTimer();
          setCanSend(true);
          setCountdown(0);

          return;
        }

        toast.success(
          t.rich('send_otp_success', {
            email: (chunks) => <strong className="text-primary">{email}</strong>,
          })
        );
      } catch (error) {
        console.error(error);
        toast.error(t('send_otp_failed'));
        clearTimer();
        setCanSend(true);
        setCountdown(0);
      }
    });
  };

  if (!canSend) {
    return (
      <span className="text-muted-foreground ml-auto text-sm capitalize">{`${countdown}s`}</span>
    );
  }

  if (isPending && canSend) {
    return (
      <span className="text-muted-foreground ml-auto text-sm capitalize">
        {t('sending_otp_code')}
      </span>
    );
  }

  return (
    <span
      className={clsx(
        'ml-auto cursor-pointer text-sm capitalize underline-offset-4 transition-colors',
        isPending ? 'text-muted-foreground' : 'hover:text-primary hover:underline'
      )}
      onClick={() => handleOTP()}
    >
      {t('btn_send_otp')}
    </span>
  );
}
