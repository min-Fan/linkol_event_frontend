'use client';

import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';

import {
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@shadcn-ui/dropdown-menu';

export default function Theme() {
  const t = useTranslations('common');
  const { setTheme } = useTheme();

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="capitalize">{t('theme')}</DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent className="border-border capitalize">
          <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme('light')}>
            {t('light')}
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme('dark')}>
            {t('dark')}
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme('system')}>
            {t('system')}
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
