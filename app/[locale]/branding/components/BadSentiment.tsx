'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Card, CardContent } from '@shadcn-ui/card';

import { BadSentiment as BadSentimentIcon } from '@assets/svg';
import { useBrandingBadSentiment } from '@hooks/branding';
import CompTimeTabs, { TabType } from './TimeTabs';
import CompSentimentTreemap from './SentimentTreemap';

export default function BadSentiment() {
  const t = useTranslations('common');

  const [activeTab, setActiveTab] = useState<TabType>(TabType.NOW);

  const onTabChangeAction = (tabIndex: TabType) => {
    setActiveTab(tabIndex);
  };

  const { data, isLoading } = useBrandingBadSentiment(1, 10, Number(activeTab));

  return (
    <Card className="rounded-3xl border-4 border-[rgba(239,31,31,0.15)] p-0">
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-x-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[rgba(239,31,31,0.15)]">
              <BadSentimentIcon className="size-4" />
            </div>
            <h3 className="text-base font-medium capitalize">{t('bad_sentiment')}</h3>
          </div>
          <CompTimeTabs onTabChangeAction={onTabChangeAction} />
        </div>
        <div className="h-96 w-full">
          {!!data && <CompSentimentTreemap data={data.data} type="bad"></CompSentimentTreemap>}
        </div>
      </CardContent>
    </Card>
  );
}
