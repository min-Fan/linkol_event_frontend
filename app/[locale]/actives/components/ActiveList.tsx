'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, TextSearch } from 'lucide-react';

import { useActivesInfinite } from '@hooks/marketEvents';
import { Skeleton } from '@shadcn/components/ui/skeleton';
import CompActive from './Active';

// 活动卡片骨架屏组件
const ActiveSkeleton = () => {
  return (
    <div className="border-primary/15 bg-background flex cursor-pointer flex-col overflow-hidden rounded-2xl border-2">
      {/* 封面图片骨架 */}
      <Skeleton className="h-36 w-full" />

      <div className="flex flex-1 flex-col justify-between gap-y-4 p-6">
        <div className="space-y-4">
          {/* 标题和奖励金额骨架 */}
          <div className="flex items-center justify-between gap-x-3">
            <Skeleton className="h-6 flex-1" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>

          {/* 描述文本骨架 */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>

        <div className="space-y-4">
          {/* 时间和参与者头像骨架 */}
          <div className="flex items-center justify-between gap-x-2">
            <Skeleton className="h-4 w-24" />
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, index) => (
                <Skeleton
                  key={index}
                  className="-ml-3 size-4 min-w-4 rounded-full sm:size-7 sm:min-w-7"
                />
              ))}
              <Skeleton className="ml-1 h-4 w-8" />
            </div>
          </div>

          {/* 项目信息和活动类型骨架 */}
          <div className="flex items-center justify-between gap-x-3">
            <div className="flex flex-1 items-center gap-x-2">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ActiveList(props: {
  search: string;
  size: number;
  is_verify: number;
  onTotalChange?: (total: number) => void;
  onLoadMore?: () => void;
}) {
  const { search, size, is_verify, onTotalChange, onLoadMore } = props;
  const t = useTranslations('common');
  const { data, total, hasMore, isLoadingMore, isLoading, loadMore } = useActivesInfinite(
    '',
    search,
    24,
    is_verify
  );
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // 通知父组件总数变化
  useEffect(() => {
    onTotalChange?.(total);
  }, [total, onTotalChange]);

  // 创建 Intersection Observer 来检测滚动到底部
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            loadMore();
            onLoadMore?.();
          }
        },
        {
          // 当元素进入视口 20% 时就触发
          threshold: 0.2,
          // 提前 100px 触发
          rootMargin: '800px',
        }
      );

      if (node) observerRef.current.observe(node);
    },
    [isLoadingMore, hasMore, loadMore, onLoadMore]
  );

  // 清理 observer
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-3">
        {[...Array(24)].map((_, index) => (
          <ActiveSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-md text-muted-foreground flex aspect-square items-center justify-center gap-1 font-medium opacity-40 md:aspect-video lg:aspect-auto lg:h-96">
        <TextSearch className="h-6 w-6" />
        <span>{t('no_data')}</span>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-3">
        {data.map((item) => (
          <CompActive key={item.id} data={item} />
        ))}
      </div>

      {/* 加载更多指示器 */}
      {hasMore && (
        <div ref={lastElementRef} className="flex justify-center py-4">
          {isLoadingMore ? (
            <div className="text-muted-foreground flex items-center gap-1 text-sm">
              <Loader2 className="h-6 w-6 animate-spin" />
              {t('loading')}
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">{t('scroll_to_load_more')}</div>
          )}
        </div>
      )}

      {/* 没有更多数据时的提示 */}
      {!hasMore && data.length > 0 && (
        <div className="text-muted-foreground py-4 text-center text-sm">{t('no_more_data')}</div>
      )}
    </>
  );
}
