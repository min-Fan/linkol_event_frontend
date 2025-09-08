'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import MarketEventsTab, { MarketEventsTabType } from './MarketEventsTab';
import { useBrandingMarketEvents } from '@hooks/branding';
import UILoading from '@ui/loading';
import CompMarketEventsList from './MarketEventsList';

export function MarketEvents() {
  const t = useTranslations('common');

  const [activeTab, setActiveTab] = useState<MarketEventsTabType>(MarketEventsTabType.PROJECT);

  const onTabChangeAction = (tabIndex: MarketEventsTabType) => {
    setActiveTab(tabIndex);
  };

  const { data, isLoading, isValidating } = useBrandingMarketEvents(1, 10, Number(activeTab));

  return (
    <div className="space-y-4">
      <MarketEventsTab onTabChangeAction={onTabChangeAction} />
      <h3 className="text-xl font-bold capitalize">{t('market_events')}</h3>
      {(isLoading || isValidating || !data) && (
        <div className="flex h-72 items-center justify-center">
          <UILoading />
        </div>
      )}
      {!!data && <CompMarketEventsList data={data} />}
    </div>
  );
}
