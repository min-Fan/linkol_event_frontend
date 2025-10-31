'use client';
import { Tabs, TabsList, TabsTrigger } from '@shadcn/components/ui/tabs';
import React, { useState, useEffect, forwardRef, useImperativeHandle, memo } from 'react';
import { cn } from '@shadcn/lib/utils';
import defaultAvatar from '@assets/image/avatar.png';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  getActivityLeaderboard,
  getDonateList,
  getActivityVoicesTop10,
  IGetActivityLeaderboardResponseDataItem,
  IGetDonateListItem,
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
import { copy, formatNumberKMB } from '@libs/utils';
import { Button } from '@shadcn/components/ui/button';
import { NullData, Verified } from '@assets/svg';
import RankFirst from '@assets/image/rank-1.png';
import RankSecond from '@assets/image/rank-2.png';
import RankThird from '@assets/image/rank-3.png';
import { toast } from 'sonner';

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

// Top 10 Brand Value 表格骨架屏组件
function BrandValueTableSkeleton() {
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

// 标题和排行榜tabs组件
function HeaderAndLeaderboardTabs({
  isShowDonation = false,
  activeLeaderboardTab,
  onTabChange,
}: {
  isShowDonation?: boolean;
  activeLeaderboardTab: 'donation' | 'brand_value';
  onTabChange: (value: string) => void;
}) {
  const t = useTranslations('common');

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-0">
      <div className="flex items-center gap-2">
        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#BFFF00] p-1 text-sm font-bold sm:h-7 sm:w-7 sm:text-base">
          X
        </div>
        <span className="text-md font-bold sm:text-base">{t('leaderboard')}</span>
      </div>
      <Tabs value={activeLeaderboardTab} onValueChange={onTabChange}>
        <TabsList className="bg-background shadow-muted-foreground/10 w-fit rounded-full p-1 shadow-lg">
          <TabsTrigger
            value="brand_value"
            className={cn(
              activeLeaderboardTab === 'brand_value' &&
                '!bg-primary/5 !text-primary !border-primary sm:text-md !rounded-full text-sm'
            )}
          >
            {t('top_10_voice')}
          </TabsTrigger>
          {/* {isShowDonation && (
            <TabsTrigger
              value="donation"
              className={cn(
                activeLeaderboardTab === 'donation' &&
                  '!bg-primary/5 !text-primary !border-primary sm:text-md !rounded-full text-sm'
              )}
            >
              {t('top_10_donation')}
            </TabsTrigger>
          )} */}
        </TabsList>
      </Tabs>
    </div>
  );
}

const EventLeaderboard = memo(
  forwardRef<
    { refreshAllData: () => Promise<void>; refreshDonationList: () => Promise<void> },
    { onRefresh?: () => Promise<void>; eventInfo?: any }
  >(function EventLeaderboard({ onRefresh, eventInfo }, ref) {
    const t = useTranslations('common');
    const { eventId } = useParams();
    const [leaderboardData, setLeaderboardData] = useState<
      IGetActivityLeaderboardResponseDataItem[]
    >([]);
    const [voicesTop10Data, setVoicesTop10Data] = useState<IGetDonateListItem[]>([]);
    const [brandValueTop10Data, setBrandValueTop10Data] = useState<
      IGetActivityVoicesTop10ResponseData[]
    >([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isVoicesLoading, setIsVoicesLoading] = useState(false);
    const [isBrandValueLoading, setIsBrandValueLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [voicesError, setVoicesError] = useState<string | null>(null);
    const [brandValueError, setBrandValueError] = useState<string | null>(null);
    // 根据活动认证状态决定是否显示捐赠排行榜
    const isShowDonation = eventInfo?.is_verified === true;
    const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<'donation' | 'brand_value'>(
      'brand_value'
    );

    // 获取排行榜数据
    const fetchLeaderboardData = async () => {
      if (!eventId) return;

      try {
        setIsLoading(true);
        setError(null);

        const response: any = await getActivityLeaderboard({
          active_id: eventId as string,
          hour: 24, // 默认24小时
        });

        if (response.code === 200) {
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

    // 获取捐赠列表数据
    const fetchVoicesTop10Data = async () => {
      if (!eventId) return;

      try {
        setIsVoicesLoading(true);
        setVoicesError(null);

        const response: any = await getDonateList({
          active_id: eventId as string,
        });

        if (response.code === 200) {
          // 获取捐赠列表，取前10条
          setVoicesTop10Data(response.data?.list?.slice(0, 10) || []);
        } else {
          setVoicesError(response.msg);
        }
      } catch (err) {
        console.error('Failed to fetch donate list data:', err);
        setVoicesError(t('fetch_voices_failed'));
        setVoicesTop10Data([]);
      } finally {
        setIsVoicesLoading(false);
      }
    };

    // 获取品牌价值排行榜数据
    const fetchBrandValueTop10Data = async () => {
      if (!eventId) return;

      try {
        setIsBrandValueLoading(true);
        setBrandValueError(null);

        const response: any = await getActivityVoicesTop10({
          active_id: eventId as string,
        });

        if (response.code === 200) {
          // 获取品牌价值排行榜，取前10条
          setBrandValueTop10Data(response.data?.slice(0, 10) || []);
        } else {
          setBrandValueError(response.msg);
        }
      } catch (err) {
        console.error('Failed to fetch brand value top10 data:', err);
        setBrandValueError(t('fetch_leaderboard_failed'));
        setBrandValueTop10Data([]);
      } finally {
        setIsBrandValueLoading(false);
      }
    };

    // 刷新所有数据的函数
    const refreshAllData = async () => {
      await fetchLeaderboardData();
      await fetchVoicesTop10Data();
      await fetchBrandValueTop10Data();
    };

    // 刷新捐赠列表的函数
    const refreshDonationList = async () => {
      await fetchVoicesTop10Data();
    };

    // 使用 useImperativeHandle 暴露刷新函数
    useImperativeHandle(ref, () => ({
      refreshAllData,
      refreshDonationList,
    }));

    // 当活动ID变化时获取所有数据
    useEffect(() => {
      if (eventId) {
        fetchLeaderboardData();
        fetchVoicesTop10Data();
        fetchBrandValueTop10Data();
      }
    }, [eventId]);

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

    // 如果有错误，显示错误信息
    if (error) {
      return (
        <div className="flex h-full w-full flex-col gap-2 p-2 sm:gap-4 sm:p-4">
          <HeaderAndLeaderboardTabs
            isShowDonation={isShowDonation}
            activeLeaderboardTab={activeLeaderboardTab}
            onTabChange={(value) => setActiveLeaderboardTab(value as 'donation' | 'brand_value')}
          />
          <div className="flex h-[300px] w-full items-center justify-center sm:h-[400px]">
            <div className="text-muted-foreground text-center">
              <p className="text-sm">{error}</p>
              <button
                onClick={() => fetchLeaderboardData()}
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
        <HeaderAndLeaderboardTabs
          isShowDonation={isShowDonation}
          activeLeaderboardTab={activeLeaderboardTab}
          onTabChange={(value) => setActiveLeaderboardTab(value as 'donation' | 'brand_value')}
        />

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
            <div className="bg-muted-foreground/5 flex w-full flex-1 items-center justify-center rounded-2xl py-8 sm:min-h-64">
              <div className="text-muted-foreground text-center">
                <NullData className="h-14 w-14" />
                <p className="text-sm">{t('no_data')}</p>
              </div>
            </div>
          )}
        </div>

        {/* 排行榜区域 */}
        <div className="flex flex-col gap-2">
          {/* 品牌价值排行榜 */}
          {activeLeaderboardTab === 'brand_value' && (
            <>
              {isBrandValueLoading ? (
                <BrandValueTableSkeleton />
              ) : brandValueError ? (
                <div className="bg-muted-foreground/5 rounded-2xl py-8 text-center">
                  <div className="text-muted-foreground">
                    <p className="text-sm">{brandValueError}</p>
                    <Button variant="outline" onClick={fetchBrandValueTop10Data}>
                      {t('btn_retry')}
                    </Button>
                  </div>
                </div>
              ) : brandValueTop10Data.length > 0 ? (
                <div className="from-primary/10 via-primary/5 rounded-2xl bg-gradient-to-b to-transparent py-2">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-none">
                        <TableHead className="flex-1 pb-2 pl-6 text-left">
                          <span className="sm:text-md text-sm font-[500]">
                            {t('kol_name_short')}
                          </span>
                        </TableHead>
                        <TableHead className="pb-2 text-center">
                          <span className="sm:text-md text-sm font-[500]">
                            {t('brand_value_short')}
                          </span>
                        </TableHead>
                        <TableHead className="pb-2 text-center">
                          <span className="sm:text-md text-sm font-[500]">{t('followers')}</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {brandValueTop10Data.map((item, index) => (
                        <TableRow className="border-none" key={item.id || index}>
                          <TableCell className="pb-4">
                            <div className="justify-left flex items-center gap-2 pl-2">
                              <div className="flex w-10 items-center justify-center">
                                {index === 0 && (
                                  <img
                                    src={RankFirst.src}
                                    className="size-6 sm:size-8 sm:min-h-8 sm:min-w-8"
                                  />
                                )}
                                {index === 1 && (
                                  <img
                                    src={RankSecond.src}
                                    className="size-6 sm:size-8 sm:min-h-8 sm:min-w-8"
                                  />
                                )}
                                {index === 2 && (
                                  <img
                                    src={RankThird.src}
                                    className="size-6 sm:size-8 sm:min-h-8 sm:min-w-8"
                                  />
                                )}
                                {index > 2 && (
                                  <span className="sm:text-md text-sm">{index + 1}</span>
                                )}
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
                              <div className="flex items-center gap-2">
                                <p
                                  className="sm:text-md max-w-[100px] cursor-pointer truncate text-sm sm:text-base"
                                  onClick={() =>
                                    copy(item.screen_name).then((success) => {
                                      if (success) {
                                        toast(t('copy_success'));
                                      } else {
                                        toast(t('copy_failed'));
                                      }
                                    })
                                  }
                                >
                                  {item.name || t('unknown')}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center">
                              <span className="sm:text-md text-sm sm:text-base">
                                {formatNumberKMB(item.brand_value || 0)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center">
                              <span className="sm:text-md text-sm sm:text-base">
                                {formatNumberKMB(item.followers_count || 0)}
                              </span>
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
            </>
          )}

          {/* 捐赠排行榜 */}
          {activeLeaderboardTab === 'donation' && (
            <>
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
                <div className="from-primary/10 via-primary/5 rounded-2xl bg-gradient-to-b to-transparent py-2">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-none">
                        <TableHead className="flex-1 pb-2 pl-6 text-left">
                          <span className="sm:text-md text-sm font-[500]">
                            {t('kol_name_short')}
                          </span>
                        </TableHead>
                        <TableHead className="pb-2 text-center">
                          <span className="sm:text-md text-sm font-[500]">
                            {t('donation_amount')}
                          </span>
                        </TableHead>
                        <TableHead className="pb-2 text-center">
                          <span className="sm:text-md text-sm font-[500]">{t('token')}</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {voicesTop10Data.map((item, index) => (
                        <TableRow className="border-none" key={item.id || index}>
                          <TableCell className="pb-4">
                            <div className="justify-left flex items-center gap-2 pl-2">
                              <div className="flex w-10 items-center justify-center">
                                {index === 0 && (
                                  <img
                                    src={RankFirst.src}
                                    className="size-6 sm:size-8 sm:min-h-8 sm:min-w-8"
                                  />
                                )}
                                {index === 1 && (
                                  <img
                                    src={RankSecond.src}
                                    className="size-6 sm:size-8 sm:min-h-8 sm:min-w-8"
                                  />
                                )}
                                {index === 2 && (
                                  <img
                                    src={RankThird.src}
                                    className="size-6 sm:size-8 sm:min-h-8 sm:min-w-8"
                                  />
                                )}
                                {index > 2 && (
                                  <span className="sm:text-md text-sm">{index + 1}</span>
                                )}
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
                              <div className="flex items-center gap-2">
                                <p
                                  className="sm:text-md max-w-[100px] cursor-pointer truncate text-sm sm:text-base"
                                  onClick={() =>
                                    copy(item.screen_name || '').then((success) => {
                                      if (success) {
                                        toast(t('copy_success'));
                                      } else {
                                        toast(t('copy_failed'));
                                      }
                                    })
                                  }
                                >
                                  {item.screen_name || t('unknown')}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center">
                              <span className="sm:text-md text-sm sm:text-base">
                                {item.amount || '0'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center">
                              <span className="sm:text-md text-sm sm:text-base">
                                {item.token_name}
                              </span>
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
            </>
          )}
        </div>
      </div>
    );
  })
);

export default EventLeaderboard;
