import React from 'react';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';

import { Link, usePathname } from '@libs/i18n/navigation';

import PagesRoute from '@constants/routes';

export default function Nav() {
  const t = useTranslations('common');
  const pathname = usePathname();

  return (
    <div className="text-md flex w-full flex-1 items-center gap-3 font-medium">
      <div
        className={clsx(
          'rounded-lg px-3 py-2',
          (pathname === PagesRoute.HOME || pathname === '/') && 'bg-primary/5 text-primary'
        )}
      >
        <Link href={PagesRoute.HOME}>{t('nav_project_client')}</Link>
      </div>
      <div
        className={clsx(
          'rounded-lg px-3 py-2',
          pathname === PagesRoute.KOL && 'bg-primary/5 text-primary'
        )}
      >
        <Link href={PagesRoute.KOL}>{t('nav_kol_client')}</Link>
      </div>
      <div
        className={clsx(
          'rounded-lg px-3 py-2',
          pathname.includes(PagesRoute.CHAT) && 'bg-primary/5 text-primary'
        )}
      >
        <Link href={PagesRoute.CHAT}>{t('nav_chat')}</Link>
      </div>
    </div>
  );
}
