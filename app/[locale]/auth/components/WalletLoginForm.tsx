import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { toast } from 'sonner';

import PagesRoute from '@constants/routes';
import { useRouter } from '@libs/i18n/navigation';
import UIWallet from '@ui/wallet';
import useUserInfo from '@hooks/useUserInfo';
import { useSearchParams } from 'next/navigation';

export default function WalletLoginForm() {
  const t = useTranslations('common');
  const router = useRouter();
  const { isLogin } = useUserInfo();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  useEffect(() => {
    if (!isLogin) {
      return;
    }

    toast.success(t('login_success'));

    if (redirect) {
      router.replace(redirect);
    } else {
      router.replace(PagesRoute.HOME);
    }
  }, [isLogin]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">{t('login_wallet_title')}</h1>
        <p className="text-muted-foreground text-sm text-balance">
          {t('login_wallet_description')}
        </p>
      </div>
      <div className="grid gap-6">
        <UIWallet />
      </div>
    </div>
  );
}
