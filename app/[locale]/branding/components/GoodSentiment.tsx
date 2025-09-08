'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Card, CardContent } from '@shadcn-ui/card';

import { GoodSentiment as GoodSentimentIcon } from '@assets/svg';
import { useBrandingGoodSentiment } from '@hooks/branding';
import CompTimeTabs, { TabType } from './TimeTabs';
import CompSentimentTreemap from './SentimentTreemap';

export default function GoodSentiment() {
  const t = useTranslations('common');

  const [activeTab, setActiveTab] = useState<TabType>(TabType.NOW);

  const onTabChangeAction = (tabIndex: TabType) => {
    setActiveTab(tabIndex);
  };

  const { data, isLoading } = useBrandingGoodSentiment(1, 10, Number(activeTab));

  return (
    <Card className="rounded-3xl border-4 border-[rgba(1,208,126,0.15)] p-0">
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-x-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[rgba(1,208,126,0.15)]">
              <GoodSentimentIcon className="size-4" />
            </div>
            <h3 className="text-base font-medium capitalize">{t('good_sentiment')}</h3>
          </div>
          <CompTimeTabs onTabChangeAction={onTabChangeAction} />
        </div>
        <div className="h-96 w-full">
          {!!data && <CompSentimentTreemap data={data.data} type="good"></CompSentimentTreemap>}
        </div>
      </CardContent>
    </Card>
  );
}
