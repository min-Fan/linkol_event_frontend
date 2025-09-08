'use client';

import { useTranslations } from 'next-intl';

import UIWallet from '@ui/wallet';
import UITheme from '@ui/theme';
import UILanguage from '@ui/language';

export default function LogInMenu() {
  const t = useTranslations('common');

  return <UIWallet />;
}
