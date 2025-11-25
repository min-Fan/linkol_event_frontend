import React from 'react';
import { useTranslations } from 'next-intl';

export default function HowItWork() {
  const t = useTranslations('common');
  return (
    <div className="border-border bg-muted/20 space-y-3 rounded-3xl border px-4 py-5">
      {/* How it work? */}
      <h3 className="font-semibold">{t('how_it_works')}</h3>
      <ul className="text-muted-foreground space-y-2 text-sm">
        <li className="flex items-start gap-2">
          <span className="flex mt-2 text-primary w-1 h-1 rounded-full bg-primary"></span>
          <span>{t('how_it_works_step_1')}</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="flex mt-2 text-primary w-1 h-1 rounded-full bg-primary"></span>
          <span>{t('how_it_works_step_2')}</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="flex mt-2 text-primary w-1 h-1 rounded-full bg-primary"></span>
          <span>{t('how_it_works_step_3')}</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="flex mt-2 text-primary w-1 h-1 rounded-full bg-primary"></span>
          <span>{t('how_it_works_step_4')}</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="flex mt-2 text-primary w-1 h-1 rounded-full bg-primary"></span>
          <span>{t('how_it_works_step_5')}</span>
        </li>
      </ul>
    </div>
  );
}
