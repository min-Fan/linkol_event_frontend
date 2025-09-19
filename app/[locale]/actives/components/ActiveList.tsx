'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { TextSearch } from 'lucide-react';

import { useActives } from '@hooks/marketEvents';
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
  page: number;
  size: number;
  is_verify: number;
  onTotalChange?: (total: number) => void;
  onTotalPagesChange?: (totalPages: number) => void;
}) {
  const { search, page, size, is_verify, onTotalChange, onTotalPagesChange } = props;
  const t = useTranslations('common');
  const { data, isLoading } = useActives('', page, search, size, is_verify);

  useEffect(() => {
    console.log('ActiveList', data);
    if (data) {
      onTotalChange?.(data.total || 0);
      onTotalPagesChange?.(Math.ceil((data.total || 0) / size));
    }
  }, [data, onTotalChange, onTotalPagesChange, size]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-3">
        {[...Array(size)].map((_, index) => (
          <ActiveSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!Array.isArray(data?.list) || data?.list.length === 0) {
    return (
      <div className="text-md text-muted-foreground flex aspect-square items-center justify-center gap-1 font-medium opacity-40 md:aspect-video lg:aspect-auto lg:h-96">
        <TextSearch className="h-6 w-6" />
        <span>{t('no_data')}</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-3">
      {data.list.map((item) => (
        <CompActive key={item.id} data={item} />
      ))}
    </div>
  );
}
