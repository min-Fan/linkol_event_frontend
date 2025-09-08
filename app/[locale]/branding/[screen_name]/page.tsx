'use client';

import { Card, CardContent } from '@shadcn/components/ui/card';
import Header from '@ui/header';
import avatar from '@assets/image/avatar.png';
import {
  Down,
  Like,
  Link,
  Message,
  ReTwet,
  Share,
  Telegram,
  Tree,
  Tweet,
  Twitter2,
  Up,
  Web,
} from '@assets/svg';
import { Tabs, TabsList, TabsTrigger } from '@shadcn/components/ui/tabs';
import { Button } from '@shadcn/components/ui/button';
import { ChartContainer, ChartConfig } from '@shadcn-ui/chart';
import { CartesianGrid, XAxis } from 'recharts';
import { cn } from '@shadcn/lib/utils';
import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Area, AreaChart } from 'recharts';
import { useRouter } from '@libs/i18n/navigation';
import { useParams } from 'next/navigation';
import { ChartTooltip, ChartTooltipContent } from '@shadcn/components/ui/chart';
import {
  brandinGetCommunityActivity,
  brandinGetProjectInfo,
  brandinGetProjectMetics,
} from '@libs/request';
import { Skeleton } from '@shadcn/components/ui/skeleton';
import CountUp from '@ui/countUp';
import { formatMoney, formatNumberKMB, formatTimeAgo, getDateRangeWithValues } from '@libs/utils';
import UILoading from '@ui/loading';
import { useLocale, useTranslations } from 'next-intl';
import Footer from '@ui/footer';
interface ProjectProfile {
  banding_value: number;
  brief: string;
  calls: number;
  descrition: string;
  icons: string[];
  links: {
    discord?: string;
    twitter?: string;
    telegram?: string;
    website?: string;
  };
  market_cap: number;
  name: string;
  screen_name: string;
  sentiment_ratio: number;
  volume_2d: number;
  volume_24h: number;
}

interface AnalyticsData {
  active_user: number;
  data: number[];
  market_cap: number;
  totol_post: number; // 注意：如果这是拼写错误，应为 total_post
  volume: number;
}

export default function BrandingDetailPage() {
  const t = useTranslations('common');
  const locale = useLocale();
  const { screen_name } = useParams();
  const chartConfig = {
    value: {
      label: 'Price',
      color: 'var(--color-chart-2)',
    },
  } satisfies ChartConfig;
  const [activeTab, setActiveTab] = useState<0 | 1 | 2 | 4>(0);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    lineInfo();
  }, [activeTab]);

  const [metrics, setMetricsInfo] = useState<AnalyticsData>();
  const [line, setLine] = useState(getDateRangeWithValues(0));
  const lineInfo = async () => {
    try {
      const res = await brandinGetProjectMetics({ screen_name: screen_name, type: activeTab });
      if ((res.code = 200)) {
        setMetricsInfo(res.data);
        const x = getDateRangeWithValues(activeTab);
        res.data?.data.forEach((item, index) => {
          x[index].value = item;
        });
        setLine(x);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const [info, setInfo] = useState<ProjectProfile>();
  const [loading, setLoading] = useState(false);

  const init = async () => {
    try {
      if (!screen_name) {
        return;
      }
      setLoading(true);
      const res = await brandinGetProjectInfo({ screen_name: screen_name });
      if (res.code == 200) {
        setInfo(res.data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const [communityActivityButton, setCommunityActivityButton] = useState<0 | 1 | 2>(0);
  useEffect(() => {
    activeInfo();
  }, [communityActivityButton]);

  const [communityActivityList, setCommunityActivityList] = useState<any[]>([]);
  const [communityActivityLoading, setCommunityActivityLoading] = useState(false);
  const activeInfo = async () => {
    try {
      if (!screen_name) return;
      setCommunityActivityLoading(true);
      const res = await brandinGetCommunityActivity({
        page: 1,
        page_size: 9,
        screen_name: screen_name,
        type: communityActivityButton,
      });
      if (res.code == 200) {
        setCommunityActivityList(res.data.data);
      }
    } catch (error) {
    } finally {
      setCommunityActivityLoading(false);
    }
  };

  return (
    <div className="relative flex w-full flex-col">
      <Header />
      <div className="relative mx-auto box-border flex h-full w-full max-w-[1600px] flex-1 flex-col gap-4 space-y-0 p-4 pb-8 lg:flex-row lg:gap-7.5 lg:space-y-10">
        <Card className="h-max w-full rounded-2xl p-4 shadow-none lg:w-100 lg:p-7.5">
          <CardContent className="space-y-4 p-0 lg:space-y-6">
            <div className="flex items-center gap-3 lg:gap-4.5">
              {loading ? (
                <div className="bg-muted-foreground/10 size-12 rounded-xl lg:size-17"></div>
              ) : (
                <img
                  src={info?.icons[0]}
                  alt="avatar"
                  className="size-12 rounded-xl lg:size-17"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = avatar.src;
                  }}
                />
              )}

              <div>
                <p className="text-base font-bold lg:text-3xl">{info?.name}</p>
                <p className="text-muted-foreground/80 text-sm font-medium lg:text-xl">
                  {info?.screen_name}
                </p>
              </div>
            </div>
            <div className="text-sm font-medium lg:text-base">
              {loading ? (
                <div className="flex flex-col items-center justify-end gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <span>{info?.brief}</span>
              )}
            </div>

            <div className="rounded-xl border-1 border-[#BFFF00] bg-[rgba(191,255,0,0.15)] px-4 py-3 lg:px-6 lg:py-4">
              <div className="flex items-center gap-1">
                <div className="flex size-7 items-center justify-center rounded-full bg-[rgba(191,255,0,1)] lg:size-9">
                  <Tree className="size-4 lg:size-6"></Tree>
                </div>
                <span className="text-sm font-medium lg:text-base">{t('brand_value')}</span>
              </div>

              <div className="mt-2 text-right text-base font-bold lg:mt-10 lg:text-3xl">
                $
                <CountUp
                  from={0}
                  to={info?.banding_value || 0}
                  separator=","
                  direction="up"
                  duration={0.3}
                />
              </div>
            </div>

            <Card className="rounded-xl px-4 py-3 shadow-none lg:px-6 lg:py-5">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#01D07E] lg:text-base">
                    {t('Sentiment')}
                  </span>
                  <span className="text-muted-foreground text-sm font-medium lg:text-base">
                    {formatNumberKMB(info?.calls || 0)} {t('calls')}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between lg:mt-6">
                  <div className="flex items-center gap-2">
                    <Up className="h-2 w-2.5 text-[#01D07E]"></Up>
                    <span className="text-sm font-medium text-[#01D07E] lg:text-base">
                      {((info?.sentiment_ratio || 0) * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="bg-background relative h-3 w-16 overflow-hidden rounded-full lg:h-4 lg:w-22">
                    <div
                      className="absolute left-0 h-full bg-[#01D07E]"
                      style={{ width: `${(info?.sentiment_ratio || 0) * 100}%` }}
                    ></div>
                    <div
                      className="absolute right-0 h-full w-[10%] bg-[#EF1F1F]"
                      style={{
                        width: `${loading ? 0 : (1 - (info?.sentiment_ratio || 0)) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#EF1F1F] lg:text-base">
                      {loading ? (
                        '0%'
                      ) : (
                        <span>{((1 - (info?.sentiment_ratio || 0)) * 100).toFixed(2)}%</span>
                      )}
                    </span>
                    <Down className="h-2 w-2.5"></Down>
                  </div>
                </div>

                <div className="mt-2 ml-1 flex items-center justify-center lg:ml-2">
                  {loading ? (
                    <Skeleton className="h-6 w-full" />
                  ) : (
                    info?.icons.map((item, index) => {
                      return (
                        <div
                          className="border-background -ml-1.5 size-6 rounded-full border lg:-ml-2 lg:size-7.5"
                          key={index}
                        >
                          <img
                            src={item}
                            alt="avatar"
                            className="size-full rounded-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = avatar.src;
                            }}
                          ></img>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2 lg:space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-[rgba(245,245,245,1)] px-4 py-3 text-sm font-medium lg:px-6 lg:py-4 lg:text-base dark:bg-[rgba(30,30,30,1)]">
                <span className="dark:text-foreground text-[rgba(0,0,0,0.5)]">
                  {t('market_cap')}
                </span>
                <span>
                  $
                  <CountUp
                    from={0}
                    to={info?.market_cap || 0}
                    separator=","
                    direction="up"
                    duration={0.3}
                  />
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[rgba(245,245,245,1)] px-4 py-3 text-sm font-medium lg:px-6 lg:py-4 lg:text-base dark:bg-[rgba(30,30,30,1)]">
                <span className="dark:text-foreground text-[rgba(0,0,0,0.5)]">
                  {t('Volume')} ({t('24h')})
                </span>
                <span
                  className={cn(info?.volume_24h || 0 >= 0 ? 'text-[#01D07E]' : 'text-[#EF1F1F]')}
                >
                  {info?.volume_24h || 0 >= 0 ? '+' : ''}{' '}
                  {((info?.volume_24h || 0) * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[rgba(245,245,245,1)] px-4 py-3 text-sm font-medium lg:px-6 lg:py-4 lg:text-base dark:bg-[rgba(30,30,30,1)]">
                <span className="dark:text-foreground text-[rgba(0,0,0,0.5)]">
                  {t('Volume')} ({t('7Dc')})
                </span>
                <span
                  className={cn(info?.volume_2d || 0 >= 0 ? 'text-[#01D07E]' : 'text-[#EF1F1F]')}
                >
                  {info?.volume_2d || 0 >= 0 ? '+' : ''} {((info?.volume_2d || 0) * 100).toFixed(2)}
                  %
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Link className="size-3.5 lg:size-4.5"></Link>
                <span className="text-base font-medium lg:text-xl">
                  {t('about')} & {t('links')}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 lg:gap-4.5">
                <a href={info?.links.twitter} target="_bank">
                  <div className="hover:text-primary ring-primary flex cursor-pointer flex-col items-center justify-center rounded-xl bg-[rgba(245,245,245,1)] px-4 py-2.5 hover:ring lg:px-7.5 lg:py-3 dark:bg-[rgba(30,30,30,1)]">
                    <div className="flex size-8 items-center justify-center lg:size-12.5">
                      <Tweet className="h-4 w-5 lg:h-6 lg:w-7.5"></Tweet>
                    </div>
                    <p className="text-sm font-medium lg:text-base">Twitter</p>
                  </div>
                </a>
                <a href={info?.links.telegram} target="_bank">
                  <div className="hover:text-primary ring-primary flex cursor-pointer flex-col items-center justify-center rounded-xl bg-[rgba(245,245,245,1)] px-4 py-2.5 hover:ring lg:px-7.5 lg:py-3 dark:bg-[rgba(30,30,30,1)]">
                    <div className="flex size-8 items-center justify-center lg:size-12.5">
                      <Telegram className="size-5 lg:size-7.5"></Telegram>
                    </div>
                    <p className="text-sm font-medium lg:text-base">Telegram</p>
                  </div>
                </a>

                <a href={info?.links.discord} target="_bank">
                  <div className="hover:text-primary ring-primary flex cursor-pointer flex-col items-center justify-center rounded-xl bg-[rgba(245,245,245,1)] px-4 py-2.5 hover:ring lg:px-7.5 lg:py-3 dark:bg-[rgba(30,30,30,1)]">
                    <div className="flex size-8 items-center justify-center lg:size-12.5">
                      <Twitter2 className="h-4 w-5 lg:h-6 lg:w-8"></Twitter2>
                    </div>
                    <p className="text-sm font-medium lg:text-base">Discord</p>
                  </div>
                </a>
                <a href={info?.links.website} target="_bank">
                  <div className="hover:text-primary ring-primary flex cursor-pointer flex-col items-center justify-center rounded-xl bg-[rgba(245,245,245,1)] px-4 py-2.5 hover:ring lg:px-7.5 lg:py-3 dark:bg-[rgba(30,30,30,1)]">
                    <div className="flex size-8 items-center justify-center lg:size-12.5">
                      <Web className="h-4 w-5 lg:h-6 lg:w-8"></Web>
                    </div>
                    <p className="text-sm font-medium lg:text-base">Website</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="ring-primary rounded-xl bg-[rgba(0,122,255,0.1)] px-4 py-5 ring lg:px-7.5 lg:py-8">
              <div className="text-primary text-center text-base font-bold lg:text-xl">
                AI Tweet
              </div>
              <div className="text-primary lg:text-md mt-2 text-sm font-medium lg:mt-3">
                Your AI assistant for crypto. Delivering richly cited answers to any question you
                have, powered by up-to-date data.
              </div>
              <Button className="mt-4 w-full rounded-md lg:mt-6">
                <span className="text-sm font-medium lg:text-base">Learn More</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex-1 space-y-4 rounded-2xl lg:space-y-6">
          <Card className="w-full rounded-2xl px-4 py-4 shadow-none lg:px-7.5 lg:py-6">
            <CardContent className="space-y-4 p-0 lg:space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-base font-bold lg:text-xl">
                  {loading ? (
                    <Skeleton className="h-4 w-40" />
                  ) : (
                    `${info?.screen_name} ${t('Metrics')}`
                  )}{' '}
                </span>
                <Tabs
                  defaultValue="0"
                  onValueChange={(value) => setActiveTab(Number(value) as any)}
                >
                  <TabsList className="bg-background shadow-muted-foreground/10 h-auto rounded-full p-1 shadow-lg">
                    <TabsTrigger
                      value="0"
                      className={cn(
                        'h-auto !p-1 !px-2 text-xs sm:!p-2 sm:!px-4 sm:!py-2 sm:text-base',
                        activeTab === 0 &&
                          '!bg-primary/5 !text-primary !border-primary !rounded-full !px-1 text-xs font-bold sm:!px-2 sm:text-base'
                      )}
                    >
                      {activeTab === 0 && <Clock className="size-4 sm:size-5" />}
                      {t('7D')}
                    </TabsTrigger>
                    <TabsTrigger
                      value="1"
                      className={cn(
                        'h-auto !p-1 !px-2 text-xs sm:!p-2 sm:!px-4 sm:!py-2 sm:text-base',
                        activeTab === 1 &&
                          '!bg-primary/5 !text-primary !border-primary !rounded-full !px-1 text-xs font-bold sm:!px-2 sm:text-base'
                      )}
                    >
                      {activeTab === 1 && <Clock className="size-4 sm:size-5" />}
                      {t('1M')}
                    </TabsTrigger>
                    <TabsTrigger
                      value="2"
                      className={cn(
                        'h-auto !p-1 !px-2 text-xs sm:!p-2 sm:!px-4 sm:!py-2 sm:text-base',
                        activeTab === 2 &&
                          '!bg-primary/5 !text-primary !border-primary !rounded-full !px-1 text-xs font-bold sm:!px-2 sm:text-base'
                      )}
                    >
                      {activeTab === 2 && <Clock className="size-4 sm:size-5" />}
                      {t('3M')}
                    </TabsTrigger>
                    <TabsTrigger
                      value="4"
                      className={cn(
                        'h-auto !p-1 !px-2 text-xs sm:!p-2 sm:!px-4 sm:!py-2 sm:text-base',
                        activeTab === 4 &&
                          '!bg-primary/5 !text-primary !border-primary !rounded-full !px-1 text-xs font-bold sm:!px-2 sm:text-base'
                      )}
                    >
                      {activeTab === 4 && <Clock className="size-4 sm:size-5" />}
                      {t('YTD')}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-7">
                <div className="space-y-2 rounded-xl bg-[#FBEEFD] px-3 py-3 text-center lg:space-y-3 lg:px-4.5 lg:py-5">
                  <div className="text-sm font-medium text-[#DB5AEA] lg:text-base">
                    {t('market_cap')}
                  </div>
                  <div className="text-base font-bold text-[#DB5AEA] lg:text-xl">
                    ${' '}
                    <CountUp
                      from={0}
                      to={metrics?.market_cap || 0}
                      separator=","
                      direction="up"
                      duration={0.3}
                    />
                  </div>
                </div>
                <div className="space-y-2 rounded-xl bg-[#E6FAF2] px-3 py-3 text-center lg:space-y-3 lg:px-4.5 lg:py-5">
                  <div className="text-sm font-medium text-[#01CF7F] lg:text-base">
                    {t('Volume')} ({t('7Dc')})
                  </div>
                  <div className="text-base font-bold text-[#01CF7F] lg:text-xl">
                    {metrics?.volume || 0 >= 0 ? '+' : ''}
                    {((metrics?.volume || 0) * 100).toFixed(2)}%
                  </div>
                </div>
                <div className="space-y-2 rounded-xl bg-[#FFF4E5] px-3 py-3 text-center lg:space-y-3 lg:px-4.5 lg:py-5">
                  <div className="text-sm font-medium text-[#FF9500] lg:text-base">
                    {t('active_user')}
                  </div>
                  <div className="text-base font-bold text-[#FF9500] lg:text-xl">
                    <CountUp
                      from={0}
                      to={metrics?.active_user || 0}
                      separator=","
                      direction="up"
                      duration={0.3}
                    />
                  </div>
                </div>
                <div className="space-y-2 rounded-xl bg-[#F1F0FD] px-3 py-3 text-center lg:space-y-3 lg:px-4.5 lg:py-5">
                  <div className="text-sm font-medium text-[#6F6DE8] lg:text-base">
                    {t('total_post')}
                  </div>
                  <div className="text-base font-bold text-[#6F6DE8] lg:text-xl">
                    <CountUp
                      from={0}
                      to={metrics?.totol_post || 0}
                      separator=","
                      direction="up"
                      duration={0.3}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 h-36 rounded-md">
                <ChartContainer config={chartConfig} className="mt-4 h-full w-full">
                  <AreaChart
                    className="h-full w-full"
                    accessibilityLayer
                    data={line}
                    margin={{
                      top: 12,
                      left: 20,
                      right: 20,
                    }}
                  >
                    <defs>
                      <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey={locale}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Area
                      dataKey="value"
                      type="natural"
                      fill="url(#fillValue)"
                      stroke="var(--color-primary)"
                      strokeWidth={3}
                      dot={{
                        fill: 'var(--color-primary)',
                        strokeWidth: 2,
                        r: 4,
                      }}
                      activeDot={{
                        r: 6,
                        fill: 'var(--color-primary)',
                      }}
                    />
                  </AreaChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="w-full rounded-2xl px-4 py-4 shadow-none lg:px-7.5 lg:py-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-base font-bold lg:text-xl">{t('my_twitter_brand_value')}</span>

              <div className="relative">
                <Button className="flex items-center rounded-md lg:w-auto lg:rounded-xl" disabled>
                  <Tweet className="h-4 w-5 text-[#fff] lg:h-5 lg:w-6"></Tweet>
                  <span className="text-sm font-medium lg:text-base">{t('connect_twitter')}</span>
                </Button>
                <span className="bg-primary/80 absolute -top-3.5 left-[50%] w-max -translate-x-1/2 scale-75 rounded-full px-1 py-0.5 text-xs text-[10px] leading-none text-white opacity-60">
                  {t('COMING_SOON')}
                </span>
              </div>
            </div>
            <div className="m-auto mt-4 flex max-w-144 flex-col items-center justify-center space-y-3 pb-12 lg:mt-5 lg:space-y-4 lg:pb-20">
              <div>
                <Tweet className="dark:text-foreground h-8 w-10 text-[rgba(0,0,0,0.5)] lg:h-12.5 lg:w-15.5"></Tweet>
              </div>
              <div className="text-lg font-bold lg:text-xl">
                {t('connect_your_twitter_account')}
              </div>
              <div className="text-muted-foreground text-center text-xs font-medium lg:text-base">
                <p>
                  {t(
                    'after_authorization_ai_will_analyze_your_tweets_about_bitcoin_and_calculate_your_personal_brand_value_contribution'
                  )}
                </p>
              </div>
            </div>
          </Card>

          <Card className="w-full rounded-2xl border-none p-0 shadow-none">
            <CardContent className="p-0">
              <Card className="w-full rounded-2xl px-4 py-4 shadow-none lg:px-7.5 lg:py-6">
                <CardContent className="p-0">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-base font-bold lg:text-xl">
                      {t('community_activity')}
                    </span>

                    <div className="flex items-center gap-4 text-xl font-bold">
                      <Button
                        variant="outline"
                        className={cn(
                          'text-muted-foreground !h-auto !rounded-xl border-transparent bg-transparent !p-2 !px-4',
                          communityActivityButton === 0 &&
                            '!bg-primary/5 !text-primary !border-primary'
                        )}
                        onClick={() => setCommunityActivityButton(0)}
                      >
                        <span className="text-md sm:text-xl">{t('Time')}</span>
                      </Button>
                      <Button
                        variant="outline"
                        className={cn(
                          'text-muted-foreground !h-auto !rounded-xl border-transparent bg-transparent !p-2 !px-4',
                          communityActivityButton === 1 &&
                            '!bg-primary/5 !text-primary !border-primary'
                        )}
                        onClick={() => setCommunityActivityButton(1)}
                      >
                        <span className="text-md sm:text-xl">{t('Value')}</span>
                      </Button>

                      <Button
                        variant="outline"
                        className={cn(
                          'text-muted-foreground !h-auto !rounded-xl border-transparent bg-transparent !p-2 !px-4',
                          communityActivityButton === 2 &&
                            '!bg-primary/5 !text-primary !border-primary'
                        )}
                        onClick={() => setCommunityActivityButton(2)}
                      >
                        <span className="text-md sm:text-xl">{t('Trending')}</span>
                      </Button>
                    </div>
                    <div className="relative">
                      <Button className="w-auto rounded-md lg:rounded-xl" disabled>
                        <span className="text-sm font-medium lg:text-base">
                          {t('track_twitter_post')}
                        </span>
                      </Button>
                      <span className="bg-primary/80 absolute -top-3.5 left-[50%] w-max -translate-x-1/2 scale-75 rounded-full px-1 py-0.5 text-xs text-[10px] leading-none text-white opacity-60">
                        {t('COMING_SOON')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {communityActivityLoading ? (
                <div className="flex items-center justify-center py-20">
                  <UILoading />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-1 lg:gap-6 lg:p-6 xl:grid-cols-3">
                  {communityActivityList &&
                    communityActivityList.map((item, index) => {
                      return (
                        <div
                          className="rounded-2xl p-4 ring-2 ring-[rgba(0,122,255,0.15)] lg:p-6"
                          key={index}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3.5">
                              <img
                                src={avatar.src}
                                alt="avatar"
                                className="size-7 rounded-full lg:size-12"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = avatar.src;
                                }}
                              />
                              <div className="max-w-36 truncate">
                                <p className="truncate text-sm font-medium lg:text-base">
                                  {item.title}
                                </p>
                                <p className="text-muted-foreground lg:text-md truncate text-xs font-medium">
                                  @{item.screen_name}
                                </p>
                                <p className="text-muted-foreground lg:text-md text-xs font-medium">
                                  {formatTimeAgo(item.issue_timestamp * 1000 || 0)}
                                </p>
                              </div>
                            </div>

                            <div className="lg:text-md rounded-full bg-[#EBEDF0] px-2 py-1.5 text-sm font-medium lg:px-4 lg:py-2.5 dark:bg-[rgba(30,30,30,1)]">
                              {formatMoney(item.estimate_value || 0)}
                            </div>
                          </div>
                          <div className="lg:text-md mt-2 line-clamp-3 text-sm font-medium lg:mt-3.5">
                            {item.discription}
                          </div>
                          <div className="my-4 h-[1px] w-full bg-[rgba(0,0,0,0.05)] lg:my-5"></div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 lg:gap-4">
                              <div className="text-muted-foreground flex items-center gap-1">
                                <Like className="size-3 lg:size-4" />
                                <span className="lg:text-md text-xs">
                                  {formatNumberKMB(item.like)}
                                </span>
                              </div>
                              <div className="text-muted-foreground flex items-center gap-1">
                                <ReTwet className="size-3 lg:size-4" />
                                <span className="lg:text-md text-xs">
                                  {formatNumberKMB(item.view)}
                                </span>
                              </div>
                              <div className="text-muted-foreground flex items-center gap-1">
                                <Message className="size-3 lg:size-4" />
                                <span className="lg:text-md text-xs">
                                  {formatNumberKMB(item.repost)}
                                </span>
                              </div>
                            </div>
                            <div className="text-muted-foreground flex items-center gap-1">
                              <Share className="size-3 lg:size-4" />
                              <span className="lg:text-md text-xs">{t('Share')}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
