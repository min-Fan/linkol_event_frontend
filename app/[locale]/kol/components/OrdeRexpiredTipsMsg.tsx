'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@shadcn-ui/dialog';
import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
type OrdeRexpiredTipsMsgProps = {
  children: ReactNode;
  type: number;
};

export default function OrdeRexpiredTipsMsg({ children, type }: OrdeRexpiredTipsMsgProps) {
  const t = useTranslations('common');
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('tip')}</DialogTitle>
        </DialogHeader>
        {type == 1 ? (
          <div className="text-md">{t('orde_rexpired_tips_msg')}</div>
        ) : (
          <div className="text-md">{t('task_end_tips')}</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
