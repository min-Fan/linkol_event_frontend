'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Clock } from 'lucide-react';

import { Tabs, TabsList, TabsTrigger } from '@shadcn/components/ui/tabs';
import clsx from 'clsx';

export enum TabType {
  NOW = '0',
  SEVEN_DAYS = '1',
  ONE_MONTH = '2',
  THREE_MONTHS = '3',
  YTD = '4',
}

const TimeTab = (props: { activeTab: TabType; tab: TabType; label: string }) => {
  const { activeTab, tab, label } = props;

  return (
    <TabsTrigger
      value={tab}
      className={clsx(
        'h-auto px-2 py-1 text-sm font-medium sm:px-3',
        activeTab === tab &&
          '!bg-primary/5 !text-primary !border-primary !rounded-full px-2 font-bold'
      )}
    >
      {activeTab === tab && <Clock className="size-4" />}
      <span>{label}</span>
    </TabsTrigger>
  );
};

export default function TimeTabs(props: { onTabChangeAction: (tabIndex: TabType) => void }) {
  const { onTabChangeAction } = props;
  const t = useTranslations('common');

  const [activeTab, setActiveTab] = useState<TabType>(TabType.NOW);

  const handleTabChange = (tabIndex: TabType) => {
    setActiveTab(tabIndex);
    onTabChangeAction(tabIndex);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="bg-background shadow-muted-foreground/10 h-auto rounded-full p-1 shadow-md">
        <TimeTab activeTab={activeTab} tab={TabType.NOW} label={t('Now')} />
        <TimeTab activeTab={activeTab} tab={TabType.SEVEN_DAYS} label={t('7D')} />
        <TimeTab activeTab={activeTab} tab={TabType.ONE_MONTH} label={t('1M')} />
        <TimeTab activeTab={activeTab} tab={TabType.THREE_MONTHS} label={t('3M')} />
        <TimeTab activeTab={activeTab} tab={TabType.YTD} label={t('YTD')} />
      </TabsList>
    </Tabs>
  );
}
