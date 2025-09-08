'use client';

import { useTranslations } from 'next-intl';
import { CirclePlus } from 'lucide-react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@shadcn-ui/tooltip';
import { buttonVariants } from '@shadcn-ui/button';

import PagesRoute from '@constants/routes';
import { Link } from '@libs/i18n/navigation';

export default function CreateProjectBtn() {
  const t = useTranslations('common');

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Link
            className={buttonVariants({ variant: 'ghost', size: 'icon' })}
            href={PagesRoute.PROJECT}
          >
            <CirclePlus className="size-5" />
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{t('create_project')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
