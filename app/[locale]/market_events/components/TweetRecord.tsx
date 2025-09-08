'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Inbox } from 'lucide-react';

import { ITweet, useTweetRecord } from '@hooks/marketEvents';
import { Skeleton } from '@shadcn/components/ui/skeleton';
import CompTweet from './Tweet';

// 推文卡片骨架屏组件
const TweetSkeleton = () => {
  return (
    <div className="border-primary/15 bg-background flex h-full flex-col justify-between gap-y-3 rounded-2xl border-2 p-6">
      <div className="space-y-3">
        {/* 用户信息骨架 */}
        <div className="flex justify-between gap-x-3">
          <div className="flex flex-1 items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-1 flex-col gap-1 overflow-hidden">
              <div className="flex flex-1 items-center gap-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </div>
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-4 w-16" />
        </div>

        {/* 推文内容骨架 */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>

      {/* 互动数据骨架 */}
      <div className="border-border flex items-center justify-between gap-x-4 border-t pt-3">
        <div className="flex items-center gap-x-4">
          <div className="flex items-center gap-x-1">
            <Skeleton className="size-4" />
            <Skeleton className="h-3 w-6" />
          </div>
          <div className="flex items-center gap-x-1">
            <Skeleton className="size-4" />
            <Skeleton className="h-3 w-6" />
          </div>
          <div className="flex items-center gap-x-1">
            <Skeleton className="size-4" />
            <Skeleton className="h-3 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

// 推文记录骨架屏组件
const TweetRecordSkeleton = () => {
  return (
    <div className="relative min-h-0 flex-1 overflow-hidden">
      {/* 桌面端布局 */}
      <div className="hidden space-y-3 md:block">
        {[...Array(3)].map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-3">
            {[...Array(2)].map((_, colIndex) => (
              <div key={colIndex} className="flex-1">
                <TweetSkeleton />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* 移动端布局 */}
      <div className="space-y-3 md:hidden">
        {[...Array(3)].map((_, index) => (
          <TweetSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

export enum TweetRecordCustomEventType {
  TWEETS_PREV = 'TWEETS_PREV',
  TWEETS_NEXT = 'TWEETS_NEXT',
}

export default function TweetRecord(props: {
  language: string;
  onDataChange?: (hasData: boolean, dataCount: number, shouldAnimate: boolean) => void;
}) {
  const { language, onDataChange } = props;
  const t = useTranslations('common');
  const { data, isLoading } = useTweetRecord(language, 15);

  const [list, setList] = useState<ITweet[]>([]);

  useEffect(() => {
    if (!data) {
      setList([]);
      onDataChange?.(false, 0, false);
      return;
    }

    const newList: ITweet[] = [];

    for (const { list } of data) {
      newList.push(...list);
    }

    setList(newList);
    const shouldAnimate = newList.length >= 2;
    onDataChange?.(newList.length > 0, newList.length, shouldAnimate);
  }, [data, onDataChange]);

  if (isLoading) {
    return <TweetRecordSkeleton />;
  }

  if (!Array.isArray(list) || list.length === 0) {
    return (
      <div className="text-md text-muted-foreground flex aspect-square flex-col items-center justify-center gap-1 opacity-40 md:aspect-video lg:h-full">
        <Inbox className="size-15" />
        <h3 className="font-medium">{t('no_tweets_found')}</h3>
        <p className="max-w-md text-center">{t('no_tweets_description')}</p>
      </div>
    );
  }

  // 按时间排序推特数据
  const sortedList = [...list].sort(
    (a, b) =>
      new Date(b.tweet_created_at || 0).getTime() - new Date(a.tweet_created_at || 0).getTime()
  );

  // 根据数据量决定渲染行数
  // 单行：8条及以下数据时，显示所有数据
  // 多行：9条及以上数据时，每行最多5个，总共15个分三行
  const shouldRenderSingleRow = sortedList.length <= 8;
  const shouldShowAnimation = sortedList.length >= 2; // 只有2条及以上数据时才显示动画

  const distributeToRows = (tweets: ITweet[]) => {
    if (shouldRenderSingleRow) {
      // 8条及以下数据时，只渲染一行
      return [tweets];
    } else {
      // 9条及以上数据时，分配到多行
      // 每行最多5个，总共15个分三行
      const maxPerRow = 5;
      const maxTotalTweets = 15;
      const totalTweets = Math.min(tweets.length, maxTotalTweets);
      const actualTweets = tweets.slice(0, totalTweets);

      // 固定三行
      const rowCount = 3;
      const rows: ITweet[][] = Array.from({ length: rowCount }, () => []);

      // 按顺序分配到各行，每行最多5个
      let currentIndex = 0;
      for (let i = 0; i < rowCount && currentIndex < totalTweets; i++) {
        const tweetsInThisRow = Math.min(maxPerRow, totalTweets - currentIndex);
        rows[i] = actualTweets.slice(currentIndex, currentIndex + tweetsInThisRow);
        currentIndex += tweetsInThisRow;
      }

      return rows;
    }
  };

  const rows = distributeToRows(sortedList);

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden">
      {/* 桌面端布局 - 动态宽度适应数据量 */}
      <div className="hidden space-y-3 md:block">
        {rows.map((rowTweets, rowIndex) => {
          if (rowTweets.length === 0) return null;

          // 根据数据量决定动画方向和布局
          const animationDirection = shouldShowAnimation
            ? shouldRenderSingleRow
              ? 'animate-slide-left'
              : rowIndex === 1
                ? 'animate-slide-right'
                : 'animate-slide-left'
            : ''; // 小于2条数据时不显示动画

          // 固定宽度：PC端两列，移动端一列
          const itemWidth = 'calc(50% - 6px)'; // PC端固定两列

          return (
            <div key={rowIndex} className={`flex ${animationDirection}`} data-row={rowIndex}>
              <div className="flex min-w-full gap-3 pr-3">
                {rowTweets.map((item, index) => (
                  <div key={item.id} className="flex-shrink-0" style={{ width: itemWidth }}>
                    <CompTweet data={item} />
                  </div>
                ))}
              </div>
              {/* 无缝循环的副本 */}
              <div className="flex min-w-full gap-3 pr-3">
                {rowTweets.map((item, index) => (
                  <div
                    key={`${item.id}-copy`}
                    className="flex-shrink-0"
                    style={{ width: itemWidth }}
                  >
                    <CompTweet data={item} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 移动端布局 - 适应数据量的滚动 */}
      <div className="space-y-3 md:hidden">
        {rows.map((rowTweets, rowIndex) => {
          if (rowTweets.length === 0) return null;

          // 移动端动画方向
          const animationDirection = shouldShowAnimation
            ? shouldRenderSingleRow
              ? 'animate-slide-left'
              : rowIndex === 1
                ? 'animate-slide-right'
                : 'animate-slide-left'
            : ''; // 小于2条数据时不显示动画

          return (
            <div key={rowIndex} className={`flex ${animationDirection}`} data-row={rowIndex}>
              <div className="flex min-w-full gap-3 pr-3">
                {rowTweets.map((item, index) => (
                  <div key={item.id} className="w-full flex-shrink-0">
                    <CompTweet data={item} />
                  </div>
                ))}
              </div>
              {/* 无缝循环的副本 */}
              <div className="flex min-w-full gap-3 pr-3">
                {rowTweets.map((item, index) => (
                  <div key={`${item.id}-copy`} className="w-full flex-shrink-0">
                    <CompTweet data={item} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
