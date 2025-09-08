'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Tabs, TabsList, TabsTrigger } from '@shadcn/components/ui/tabs';
import clsx from 'clsx';

export enum MarketEventsTabType {
  PROJECT = '0',
  VOICES = '1',
  SECTORS = '2',
  POOLS = '3',
}

const TimeTab = (props: {
  activeTab: MarketEventsTabType;
  tab: MarketEventsTabType;
  label: string;
}) => {
  const { activeTab, tab, label } = props;

  return (
    <TabsTrigger
      value={tab}
      className={clsx(
        'h-auto px-6 py-1 text-base font-medium capitalize',
        activeTab === tab && '!bg-primary/5 !text-primary !border-primary !rounded-full'
      )}
    >
      <span>{label}</span>
    </TabsTrigger>
  );
};

export default function MarketEventsTab(props: {
  onTabChangeAction: (tabIndex: MarketEventsTabType) => void;
}) {
  const { onTabChangeAction } = props;
  const t = useTranslations('common');

  const [activeTab, setActiveTab] = useState<MarketEventsTabType>(MarketEventsTabType.PROJECT);

  const handleTabChange = (tabIndex: MarketEventsTabType) => {
    setActiveTab(tabIndex);
    onTabChangeAction(tabIndex);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="!h-auto space-x-3 !rounded-none !bg-transparent !p-0">
        <TimeTab activeTab={activeTab} tab={MarketEventsTabType.PROJECT} label={t('project')} />
        <TimeTab activeTab={activeTab} tab={MarketEventsTabType.VOICES} label={t('voices')} />
        <TimeTab activeTab={activeTab} tab={MarketEventsTabType.SECTORS} label={t('sectors')} />
        <TimeTab activeTab={activeTab} tab={MarketEventsTabType.POOLS} label={t('pools')} />
      </TabsList>
    </Tabs>
  );
}
