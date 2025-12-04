'use client';

import { useLocale } from 'next-intl';
import { Languages } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shadcn-ui/dropdown-menu';
import { Button } from '@shadcn-ui/button';

import { LOCALES } from '@constants/app';
import { Link, usePathname } from '@libs/i18n/navigation';
import { useEffect, useState } from 'react';
import PagesRoute from '@constants/routes';
import { useSearchParams } from 'next/navigation';

const LanguageItem = (props: {
  lng: string;
  pathname: string;
  search: string;
  children: React.ReactNode;
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

export default function UILanguage() {
  let pathname = usePathname();
  const search = useSearchParams();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  for (const lng of LOCALES) {
    const key = `/${lng}`;

    if (pathname.includes(key)) {
      pathname = pathname.replace(key, '');
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={`size-6 text-white md:size-8`} variant="ghost" size="icon">
          <Languages className="size-4" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="border-border" align="end">
        <DropdownMenuItem className="cursor-pointer capitalize" onClick={() => {}}>
          <LanguageItem lng={LOCALES[0]} pathname={pathname} search={search.toString()}>
            English
          </LanguageItem>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer capitalize" onClick={() => {}}>
          <LanguageItem lng={LOCALES[1]} pathname={pathname} search={search.toString()}>
            简体中文
          </LanguageItem>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
