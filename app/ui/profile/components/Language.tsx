'use client';

import { ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import {
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@shadcn-ui/dropdown-menu';

import { LOCALES } from '@constants/app';
import { Link } from '@libs/i18n/navigation';

const LanguageItem = (props: {
  lng: string;
  pathname: string;
  search: string;
  children: ReactNode;
}) => {
  const { lng, pathname, search, children } = props;
  const locale = useLocale();

  return locale === lng ? (
    <span className="text-primary font-semibold">{children}</span>
  ) : (
    <Link className="block w-full" href={`/${pathname}?${search}`} locale={lng}>
      {children}
    </Link>
  );
};

export default function Language() {
  const t = useTranslations('common');
  let pathname = usePathname();
  const search = useSearchParams();

  for (const lng of LOCALES) {
    const key = `/${lng}`;

    if (pathname.includes(key)) {
      pathname = pathname.replace(key, '');
    }
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="capitalize">{t('language')}</DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent className="border-border capitalize">
          <DropdownMenuItem>
            <LanguageItem lng={LOCALES[0]} pathname={pathname} search={search.toString()}>
              English
            </LanguageItem>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <LanguageItem lng={LOCALES[1]} pathname={pathname} search={search.toString()}>
              简体中文
            </LanguageItem>
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
