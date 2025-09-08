'use client';

import { useTransition } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@shadcn-ui/button';
import { toast } from 'sonner';

import { getTwitterAuthUrlV2 } from '@libs/request';

export default function KOLTwitterAuthLogin() {
  const t = useTranslations('common');
  const [isPending, startTransition] = useTransition();

  const handleTwitterAuth = () => {
    startTransition(async () => {
      try {
        // 获取当前的url
        const currentUrl = window.location.href;

        const res = await getTwitterAuthUrlV2({
          call_back_url: currentUrl,
        });

        if (!res || res.code !== 200) {
          toast.error(t('kol_twitter_auth_login_failed'));

          return;
        }

        localStorage.setItem('twitter_x_id', res.data.x_id);
        localStorage.setItem('twitter_callback_url', currentUrl);

        if (res.data.url) {
          window.location.href = res.data.url;
        }
      } catch (error) {
        console.log(error);

        toast.error(t('kol_twitter_auth_login_failed'));
      }
    });
  };

  return (
    <Button className="relative" disabled={isPending} onClick={handleTwitterAuth}>
      <span className="opacity-0">{t('btn_verify')}</span>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {isPending ? (
          <LoaderCircle className="animate-spin" />
        ) : (
          <span>{t('btn_log_twitter')}</span>
        )}
      </div>
    </Button>
  );
}
