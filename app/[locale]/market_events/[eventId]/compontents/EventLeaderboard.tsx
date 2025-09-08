'use client';
import { Tabs, TabsList, TabsTrigger } from '@shadcn/components/ui/tabs';
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { cn } from '@shadcn/lib/utils';
import { Clock } from 'lucide-react';
import defaultAvatar from '@assets/image/avatar.png';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  getActivityLeaderboard,
  getActivityVoicesTop10,
  IGetActivityLeaderboardResponseDataItem,
  IGetActivityVoicesTop10ResponseData,
} from '@libs/request';
import { Skeleton } from '@shadcn/components/ui/skeleton';
import CompSentimentTreemap from '../../../branding/components/SentimentTreemap';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@shadcn/components/ui/table';
import { formatNumberKMB } from '@libs/utils';
import { Button } from '@shadcn/components/ui/button';
import { NullData, RankFirst, RankSecond, RankThird } from '@assets/svg';

// 图表区域骨架屏组件
function ChartSkeleton() {
  return (
    <div className="h-full w-full p-2">
      <div className="grid h-full w-full grid-cols-3 grid-rows-3 gap-2">
        {/* 大矩形 - 占用2x2空间 */}
        <Skeleton className="col-span-2 row-span-2 h-full w-full" />

        {/* 右上角的中等矩形 */}
        <Skeleton className="col-span-1 row-span-1 h-full w-full" />

        {/* 右中的矩形 */}
        <Skeleton className="col-span-1 row-span-1 h-full w-full" />

        {/* 底部的两个矩形 */}
        <Skeleton className="col-span-1 row-span-1 h-full w-full" />
        <Skeleton className="col-span-2 row-span-1 h-full w-full" />
      </div>
    </div>
  );
}

// Top 10 Voice 表格骨架屏组件
function VoicesTableSkeleton() {
  return (
    <div className="bg-muted-foreground/5 rounded-2xl py-2">
      <Table>
        <TableHeader>
          <TableRow className="border-none">
            <TableHead className="flex-1 pb-2 pl-6 text-left">
              <Skeleton className="h-4 w-20" />
            </TableHead>
            <TableHead className="pb-2 text-center">
              <Skeleton className="mx-auto h-4 w-16" />
            </TableHead>
            <TableHead className="pb-2 text-center">
              <Skeleton className="mx-auto h-4 w-16" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, index) => (
            <TableRow className="border-none" key={index}>
              <TableCell className="pb-4">
                <div className="justify-left flex items-center gap-2 pl-2">
                  <div className="flex w-10 items-center justify-center">
                    <Skeleton className="h-6 w-6 rounded-full" />
                  </div>
                  <Skeleton className="size-6 min-w-6 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center">
                  <Skeleton className="h-4 w-12" />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center">
                  <Skeleton className="h-4 w-16" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// 标题和标签组件
function HeaderAndTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: '6h' | '24h' | '7d' | '1m';
  onTabChange: (value: string) => void;
}) {
  const t = useTranslations('common');

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-0">
      <div className="flex items-center gap-2">
        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#BFFF00] text-sm font-bold sm:h-5 sm:w-5 sm:text-base">
          X
        </div>
        <span className="text-md font-bold sm:text-base">{t('leaderboard')}</span>
      </div>
      <Tabs defaultValue="24h" onValueChange={onTabChange}>
        <TabsList className="bg-background shadow-muted-foreground/10 rounded-full p-1 shadow-lg">
          <TabsTrigger
            value="6h"
            className={cn(
              activeTab === '6h' &&
                '!bg-primary/5 !text-primary !border-primary !rounded-full text-sm font-bold sm:text-base'
            )}
          >
            {activeTab === '6h' && <Clock className="h-4 w-4" />}
            6H
          </TabsTrigger>
          <TabsTrigger
            value="24h"
            className={cn(
              activeTab === '24h' &&
                '!bg-primary/5 !text-primary !border-primary !rounded-full text-sm font-bold sm:text-base'
            )}
          >
            {activeTab === '24h' && <Clock className="h-4 w-4" />}
            24H
          </TabsTrigger>
          <TabsTrigger
            value="7d"
            className={cn(
              activeTab === '7d' &&
                '!bg-primary/5 !text-primary !border-primary !rounded-full text-sm font-bold sm:text-base'
            )}
          >
            {activeTab === '7d' && <Clock className="h-4 w-4" />}
            7D
          </TabsTrigger>
          <TabsTrigger
            value="1m"
            className={cn(
              activeTab === '1m' &&
                '!bg-primary/5 !text-primary !border-primary !rounded-full text-sm font-bold sm:text-base'
            )}
          >
            {activeTab === '1m' && <Clock className="h-4 w-4" />}
            1M
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

export default forwardRef<
  { refreshAllData: () => Promise<void> },
  { onRefresh?: () => Promise<void> }
>(function EventLeaderboard({ onRefresh }, ref) {
  const t = useTranslations('common');
  const { eventId } = useParams();
  const [activeTab, setActiveTab] = useState<'6h' | '24h' | '7d' | '1m'>('24h');
  const [leaderboardData, setLeaderboardData] = useState<IGetActivityLeaderboardResponseDataItem[]>(
    []
  );
  const [voicesTop10Data, setVoicesTop10Data] = useState<IGetActivityVoicesTop10ResponseData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVoicesLoading, setIsVoicesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voicesError, setVoicesError] = useState<string | null>(null);

  // 将时间标签转换为小时数
  const getHourFromTab = (tab: string): number => {
    switch (tab) {
      case '6h':
        return 6;
      case '24h':
        return 24;
      case '7d':
        return 7 * 24; // 7天 = 168小时
      case '1m':
        return 30 * 24; // 1个月 = 720小时
      default:
        return 24;
    }
  };

  // 获取排行榜数据
  const fetchLeaderboardData = async (tab: string) => {
    if (!eventId) return;

    try {
      setIsLoading(true);
      setError(null);

      const hour = getHourFromTab(tab);
      const response: any = await getActivityLeaderboard({
        active_id: eventId as string,
        hour,
      });

      if (response.code === 200) {
        // 过滤数据，只显示指定小时范围内的数据
        // const filteredData = response.data.filter((item) => !item.hour || item.hour <= hour);
        setLeaderboardData(response.data || []);
      } else {
        setError(response.msg);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard data:', err);
      setError(t('fetch_leaderboard_failed'));
      setLeaderboardData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取Top 10 Voice数据
  const fetchVoicesTop10Data = async () => {
    if (!eventId) return;

    try {
      setIsVoicesLoading(true);
      setVoicesError(null);

      const response: any = await getActivityVoicesTop10({
        active_id: eventId as string,
      });

      if (response.code === 200) {
        setVoicesTop10Data(response.data || []);
      } else {
        setVoicesError(response.msg);
      }
    } catch (err) {
      console.error('Failed to fetch voices top 10 data:', err);
      setVoicesError(t('fetch_voices_failed'));
      setVoicesTop10Data([]);
    } finally {
      setIsVoicesLoading(false);
    }
  };

  // 刷新所有数据的函数
  const refreshAllData = async () => {
    await fetchLeaderboardData(activeTab);
    await fetchVoicesTop10Data();
  };

  // 使用 useImperativeHandle 暴露刷新函数
  useImperativeHandle(ref, () => ({
    refreshAllData,
  }));

  // 当活动ID变化时获取所有数据
  useEffect(() => {
    if (eventId) {
      fetchLeaderboardData(activeTab);
      fetchVoicesTop10Data();
    }
  }, [eventId]);

  // 当时间标签变化时只刷新图表数据
  useEffect(() => {
    if (eventId) {
      fetchLeaderboardData(activeTab);
    }
  }, [activeTab, eventId]);

  // 监听外部刷新请求
  useEffect(() => {
    if (onRefresh) {
      // 将刷新函数暴露给父组件
      const originalOnRefresh = onRefresh;
      onRefresh = async () => {
        await refreshAllData();
        await originalOnRefresh();
      };
    }
  }, [onRefresh]);

  // 处理时间标签变化
  const handleTabChange = (value: string) => {
    setActiveTab(value as '6h' | '24h' | '7d' | '1m');
  };

  // 如果有错误，显示错误信息
  if (error) {
    return (
      <div className="flex h-full w-full flex-col gap-2 p-2 sm:gap-4 sm:p-4">
        <HeaderAndTabs activeTab={activeTab} onTabChange={handleTabChange} />
        <div className="flex h-[300px] w-full items-center justify-center sm:h-[400px]">
          <div className="text-muted-foreground text-center">
            <p className="text-sm">{error}</p>
            <button
              onClick={() => fetchLeaderboardData(activeTab)}
              className="text-primary mt-2 text-xs hover:underline"
            >
              {t('btn_retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-2 p-2 sm:gap-4 sm:p-4">
      <HeaderAndTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* 图表区域 */}
      <div className="flex h-full min-h-0 flex-1 flex-col gap-2 sm:gap-4">
        {isLoading ? (
          <div className="bg-muted-foreground/5 min-h-[300px] w-full flex-1 rounded-2xl sm:min-h-[400px]">
            <ChartSkeleton />
          </div>
        ) : leaderboardData.length >= 7 ? (
          <div className="h-[300px] w-full sm:h-[400px]">
            <CompSentimentTreemap
              data={leaderboardData
                .filter((item) => item.amount !== 0)
                .map((item) => ({
                  name: item.name || t('unknown'),
                  amount: item.amount || 0,
                  icon: item.icon || defaultAvatar.src,
                }))}
              type="good"
            />
          </div>
        ) : (
          <div className="bg-muted-foreground/5 flex w-full flex-1 items-center justify-center rounded-2xl sm:min-h-64">
            <div className="text-muted-foreground text-center">
              <NullData className="h-14 w-14" />
              <p className="text-sm">{t('no_data')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Top 10 Voice 表格 */}
      <div className="flex flex-col gap-2">
        <h2 className="text-md font-bold sm:text-base">{t('top_10_voice')}</h2>
        {isVoicesLoading ? (
          <VoicesTableSkeleton />
        ) : voicesError ? (
          <div className="bg-muted-foreground/5 rounded-2xl py-8 text-center">
            <div className="text-muted-foreground">
              <p className="text-sm">{voicesError}</p>
              <Button variant="outline" onClick={fetchVoicesTop10Data}>
                {t('btn_retry')}
              </Button>
            </div>
          </div>
        ) : voicesTop10Data.length > 0 ? (
          <div className="bg-muted-foreground/5 rounded-2xl py-2">
            <Table>
              <TableHeader>
                <TableRow className="border-none">
                  <TableHead className="flex-1 pb-2 pl-6 text-left">
                    <span className="sm:text-md text-sm font-[500]">{t('kol_name_short')}</span>
                  </TableHead>
                  <TableHead className="pb-2 text-center">
                    <span className="sm:text-md text-sm font-[500]">{t('followers')}</span>
                  </TableHead>
                  <TableHead className="pb-2 text-center">
                    <span className="sm:text-md text-sm font-[500]">{t('brand_value')}</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {voicesTop10Data.map((item, index) => (
                  <TableRow className="border-none" key={item.id || index}>
                    <TableCell className="pb-4">
                      <div className="justify-left flex items-center gap-2 pl-2">
                        <div className="flex w-10 items-center justify-center">
                          {index === 0 && <RankFirst className="size-8" />}
                          {index === 1 && <RankSecond className="size-8" />}
                          {index === 2 && <RankThird className="size-8" />}
                          {index > 2 && <span className="sm:text-md text-sm">{index + 1}</span>}
                        </div>
                        <div className="size-6 min-w-6 overflow-hidden rounded-full">
                          <img
                            src={item.profile_image_url || defaultAvatar.src}
                            alt="avatar"
                            className="size-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = defaultAvatar.src;
                            }}
                          />
                        </div>
                        <p className="sm:text-md max-w-[100px] truncate text-sm sm:text-base">
                          {item.name || item.screen_name || t('unknown')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <span className="sm:text-md text-sm sm:text-base">
                          {formatNumberKMB(item.followers_count || 0)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <span className="sm:text-md text-sm sm:text-base">{item.brand_value}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="bg-muted-foreground/5 rounded-2xl py-8 text-center">
            <div className="text-muted-foreground flex flex-col items-center justify-center">
              <NullData className="h-14 w-14" />
              <p className="text-sm">{t('no_voices_data')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
