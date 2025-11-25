'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import OpinionDetailHeader from './components/OpinionDetailHeader';
import OpinionContent from './components/OpinionContent';
import OpinionChart from './components/OpinionChart';
import OpinionVotes from './components/OpinionVotes';
import OpinionActions from './components/OpinionActions';
import { TradingPanel } from './components';
import { Link } from '@libs/i18n/navigation';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@shadcn/components/ui/skeleton';
import PagesRoute from '@constants/routes';
import { useBetDetail } from '@hooks/useBetDetail';

export default function OpinionsPage() {
  const params = useParams();
  const opinionId = params?.opinion as string;

  // 使用自定义 hook 获取 bet 详情数据
  const {
    betDetail,
    isLoading,
    isError,
    yesPercentage,
    noPercentage,
    yesPrice,
    noPrice,
    topic,
    attitude,
    commission,
  } = useBetDetail(opinionId);

  if (isLoading) {
    return (
      <div className="mx-auto h-full w-full max-w-7xl px-0 py-4 sm:px-10 sm:py-6">
        <Link
          href={PagesRoute.OPINIONS}
          className="text-muted-foreground hover:text-foreground mb-6 flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Markets
        </Link>
        <div className="bg-background border-border grid grid-cols-1 gap-6 rounded-2xl border p-4 sm:rounded-3xl sm:p-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-4 mb-6">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="ml-auto space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-5/6" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !betDetail) {
    return (
      <div className="mx-auto h-full w-full max-w-7xl px-0 py-4 sm:px-10 sm:py-6">
        <Link
          href={PagesRoute.OPINIONS}
          className="text-muted-foreground hover:text-foreground mb-6 flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Markets
        </Link>
        <div className="flex items-center justify-center py-12">
          <div className="text-destructive">加载失败，请稍后重试</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto h-full w-full max-w-7xl px-0 py-4 sm:px-10 sm:py-6">
      <Link
        href={PagesRoute.OPINIONS}
        className="text-muted-foreground hover:text-foreground mb-6 flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Markets
      </Link>
      <div className=" grid grid-cols-1 gap-6 sm:rounded-3xl lg:grid-cols-3">
        {/* 左侧内容区 - 占据 2/3 宽度 */}
        <div className="space-y-6 lg:col-span-2">
          <div className="space-y-6">
            {/* 头部信息 */}
            {topic && (
              <OpinionDetailHeader
                author={{
                  name: topic.name,
                  handle: `@${topic.screen_name}`,
                  avatar: topic.icon,
                  verified: false,
                }}
                volume={commission}
              />
            )}

            {/* 内容区 */}
            {topic && attitude && (
              <OpinionContent
                question={topic.content}
                reply={{
                  author: {
                    name: attitude.name,
                    handle: `@${attitude.screen_name}`,
                    avatar: attitude.icon,
                    verified: false,
                  },
                  content: attitude.content,
                  tweetUrl: attitude.tweet_url,
                }}
              />
            )}

            {/* 图表 */}
            <OpinionChart />

            {/* 投票结果 */}
            {betDetail && (
              <OpinionVotes
                agreeVotes={betDetail.yes_brand_value}
                disagreeVotes={betDetail.no_brand_value}
                agreePercentage={yesPercentage}
                disagreePercentage={noPercentage}
              />
            )}
          </div>
        </div>

        {/* 右侧交易面板 - 占据 1/3 宽度 */}
        <div className="lg:col-span-1">
          <TradingPanel
            dateRange=""
            yesPrice={yesPrice}
            noPrice={noPrice}
          />
        </div>
      </div>
    </div>
  );
}
