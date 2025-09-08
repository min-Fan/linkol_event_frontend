'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Card, CardContent } from '@shadcn-ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shadcn-ui/table';

import { useBrandValueRanking } from '@hooks/branding';
import UILoading from '@ui/loading';
import CompTimeTabs, { TabType } from './TimeTabs';
import CompBrandValueRankingList from './BrandValueRankingList';

export default function BrandValueRanking() {
  const t = useTranslations('common');

  const [activeTab, setActiveTab] = useState<TabType>(TabType.NOW);

  const time = useMemo(() => {
    switch (activeTab) {
      case TabType.NOW:
        return t('24h');
      case TabType.SEVEN_DAYS:
        return t('7D');
      case TabType.ONE_MONTH:
        return t('1M');
      case TabType.THREE_MONTHS:
        return t('3M');
      case TabType.YTD:
        return t('YTD');
    }
  }, [activeTab]);

  const onTabChangeAction = (tabIndex: TabType) => {
    setActiveTab(tabIndex);
  };

  const { data, isLoading } = useBrandValueRanking(1, 10, Number(activeTab));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xl font-bold capitalize">{t('brand_value_ranking')}</h3>
        <CompTimeTabs onTabChangeAction={onTabChangeAction} />
      </div>

      <Card className="shadow-muted-foreground/10 overflow-hidden p-0 shadow-md">
        <CardContent className="p-0">
          <Table className="text-foreground text-sm capitalize">
            <TableHeader>
              <TableRow className="border-border border-b">
                <TableHead className="text-foreground px-0 py-4">
                  <div className="border-border border-r px-2 text-center">{t('project_name')}</div>
                </TableHead>
                <TableHead className="text-foreground px-0 py-4">
                  <div className="border-border border-r px-2 text-center">{t('brand_value')}</div>
                </TableHead>
                <TableHead className="text-foreground px-0 py-4">
                  <div className="border-border border-r px-2 text-center">{time}</div>
                </TableHead>
                <TableHead className="text-foreground px-0 py-4">
                  <div className="border-border border-r px-2 text-center">{t('Sentiment')}</div>
                </TableHead>
                <TableHead className="text-foreground px-0 py-4">
                  <div className="border-border border-r px-2 text-center">{t('market_cap')}</div>
                </TableHead>
                <TableHead className="text-foreground px-0 py-4">
                  <div className="border-border border-r px-2 text-center">{t('price')}</div>
                </TableHead>
                <TableHead className="text-foreground px-0 py-4">
                  <div className="px-2 text-center">{t('last_7_days')}</div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading || !data ? (
                <TableRow className="border-none">
                  <TableCell colSpan={7}>
                    <div className="flex h-80 items-center justify-center">
                      <UILoading />
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data && <CompBrandValueRankingList data={data} />
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
