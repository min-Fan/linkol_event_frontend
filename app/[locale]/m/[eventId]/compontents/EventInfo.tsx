'use client';
import { Discord, Share, Telegram, TwIcon, Up } from '@assets/svg';
import { Badge } from '@shadcn/components/ui/badge';
import { Skeleton } from '@shadcn/components/ui/skeleton';
import { Globe, Shrub } from 'lucide-react';
import React, { useState, memo } from 'react';
import { cn } from '@shadcn/lib/utils';
import { IEventInfoResponseData } from '@libs/request';
import avatar from '@assets/image/avatar.png';
import { useTranslations } from 'next-intl';
import DialogShareProject from './dialog/DialogShareProject';
import DialogBrandValue from './dialog/DialogBrandValue';
import { CommBarChart } from './CommBarChart';
import { useAppSelector } from '@store/hooks';
import { Button } from '@shadcn/components/ui/button';
import { track } from '@vercel/analytics';
import { getUniswapUrl } from '@constants/config';

// 骨架屏组件
function EventInfoSkeleton() {
  return (
    <div className="flex w-full flex-col gap-2 p-2 sm:gap-4 sm:p-4">
      {/* 头部信息骨架屏 */}
      <div className="relative flex items-center gap-2 sm:gap-4">
        <Skeleton className="h-10 w-10 min-w-10 rounded-lg sm:h-17 sm:w-17 sm:min-w-17" />
        <div className="flex h-full flex-col justify-between gap-0 sm:gap-2">
          <div className="flex flex-wrap items-end gap-1 sm:gap-2">
            <Skeleton className="h-6 w-32 sm:h-8 sm:w-48" />
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <Skeleton className="h-4 w-12 rounded-full" />
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-4 w-14 rounded-full" />
          </div>
        </div>
      </div>

      {/* 描述骨架屏 */}
      <div>
        <Skeleton className="h-4 w-full sm:h-5" />
        <Skeleton className="mt-1 h-4 w-3/4 sm:h-5" />
      </div>

      {/* Brand Value 卡片骨架屏 */}
      <div className="flex flex-col gap-2 rounded-lg border border-[#BFFF00] bg-[#BFFF00]/15 p-3">
        <div className="flex w-full items-start justify-between">
          <div className="flex items-center gap-1">
            <Skeleton className="h-5 w-5 rounded-full sm:h-6 sm:w-6" />
            <Skeleton className="h-4 w-20 sm:h-5 sm:w-24" />
          </div>
          <div className="flex flex-col items-end justify-end gap-1">
            <Skeleton className="h-4 w-16 sm:h-5 sm:w-20" />
            <Skeleton className="h-3 w-12 sm:h-4 sm:w-16" />
          </div>
        </div>
        <Skeleton className="h-32 w-full" />
      </div>

      {/* 链接信息骨架屏 */}
      <div className="flex flex-col gap-2">
        <div className="bg-muted-foreground/5 flex flex-wrap items-center justify-between gap-2 rounded-xl p-2 sm:gap-1">
          <Skeleton className="h-4 w-16 sm:h-5 sm:w-20" />
          <div className="flex cursor-pointer flex-wrap items-center gap-1">
            <Skeleton className="h-6 w-20 rounded-full sm:h-7 sm:w-24" />
          </div>
        </div>
        <div className="bg-muted-foreground/5 flex flex-wrap items-center justify-between gap-2 rounded-xl p-2 sm:gap-1">
          <Skeleton className="h-4 w-12 sm:h-5 sm:w-16" />
          <div className="flex cursor-pointer flex-wrap items-center gap-1">
            <Skeleton className="h-6 w-16 rounded-full sm:h-7 sm:w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

const EventInfo = memo(function EventInfo({
  eventInfo,
  isLoading,
  onRefresh,
}: {
  eventInfo: IEventInfoResponseData;
  isLoading: boolean;
  onRefresh?: () => Promise<void>;
}) {
  const t = useTranslations('common');
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [openBrandValueDialog, setOpenBrandValueDialog] = useState(false);
  const isLoggedIn = useAppSelector((state) => state.userReducer?.isLoggedIn);

  // 如果正在加载，显示骨架屏
  if (isLoading) {
    return <EventInfoSkeleton />;
  }

  const toUniswap = () => {
    track('To Buy Now ==> Uniswap', {
      event_id: eventInfo?.id,
      path: location.pathname,
      token_address: eventInfo?.token_address,
      event_name: eventInfo?.project?.name,
    });
    const uniswapUrl = getUniswapUrl(eventInfo?.chain_type, eventInfo?.token_address);
    window.open(uniswapUrl, '_blank');
  };

  return (
    <div className="flex w-full flex-col gap-2 p-2 sm:gap-4 sm:p-4">
      <div className="relative flex items-center gap-2 sm:gap-4">
        {isLoggedIn && (
          <Share
            className="text-muted-foreground hover:text-primary absolute top-0 right-0 h-3 w-3 cursor-pointer transition-colors sm:h-4 sm:w-4"
            onClick={() => setOpenShareDialog(true)}
          />
        )}
        <div className="bg-muted-foreground/10 h-10 w-10 min-w-10 overflow-hidden rounded-lg sm:h-17 sm:w-17 sm:min-w-17">
          <img
            src={eventInfo?.project.logo || ''}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = avatar.src;
            }}
          />
        </div>
        <div className="flex h-full flex-col justify-between gap-0 sm:gap-2">
          <div className="flex flex-wrap items-end gap-1 sm:gap-2">
            <span className="text-xl font-bold sm:text-xl">{eventInfo?.project.name || '-'}</span>
            {/* <span className="text-muted-foreground text-md sm:text-xl">@bitcoin</span> */}
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {eventInfo?.project?.category?.map((item) => (
              <Badge
                variant="secondary"
                className="sm:text-md rounded-full py-0 text-sm font-light sm:py-0"
                key={item}
              >
                {item}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      <div>
        <p className="line-clamp-3 text-sm sm:text-base">{eventInfo?.project?.desc || '-'}</p>
      </div>
      <div
        className="flex cursor-pointer flex-col gap-2 rounded-lg border border-[#BFFF00] bg-[#BFFF00]/15 p-3"
        onClick={() => setOpenBrandValueDialog(true)}
      >
        <div className="flex w-full items-start justify-between">
          <div className="flex items-center gap-1">
            <div className="rounded-full bg-[#BFFF00] p-1">
              <Shrub className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
            <span className="text-sm font-semibold sm:text-base">{t('brand_value')}</span>
          </div>
          <div className="flex flex-col items-end justify-end">
            <span className="text-sm font-bold sm:text-base">
              ${eventInfo?.total_brand_value?.toLocaleString() || '0'}
            </span>
            <div
              className={cn(
                'text-md flex items-center gap-1',
                eventInfo?.brand_value_increase >= 0 ? 'text-[#01D07E]' : 'text-[#FF0000]'
              )}
            >
              <Up className={cn('h-2 w-2', eventInfo?.brand_value_increase < 0 && 'rotate-180')} />
              <span className="text-sm sm:text-base">
                {eventInfo?.brand_value_increase || '0'}% ({t('days_7')})
              </span>
            </div>
          </div>
        </div>
        <div className="h-32">
          <CommBarChart eventInfo={eventInfo} isLoading={isLoading} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {eventInfo?.project?.website && (
          <div className="bg-muted-foreground/5 flex h-full w-full flex-col items-center justify-between gap-2 rounded-xl p-2 sm:flex-row sm:gap-1">
            {/* <span className="text-muted-foreground sm:text-md text-sm">{t('website')}</span> */}
            <div className="flex h-full cursor-pointer flex-wrap items-center gap-1">
              {eventInfo?.project?.website && (
                <div
                  className="bg-background flex items-center gap-1 rounded-full px-2 py-0.5"
                  onClick={() => {
                    window.open(eventInfo?.project?.website, '_blank');
                  }}
                >
                  <Globe className="h-3 w-3" />
                  <span className="sm:text-md text-sm font-semibold">{t('website')}</span>
                </div>
              )}
              {eventInfo?.project?.link && (
                <div
                  className="bg-background flex items-center gap-1 rounded-full px-2 py-0.5"
                  onClick={() => {
                    window.open(eventInfo?.project?.link, '_blank');
                  }}
                >
                  <TwIcon className="h-3 w-3" />
                  <span className="sm:text-md text-sm font-semibold">{t('twitter')}</span>
                </div>
              )}
              {eventInfo?.project?.telegram && (
                <div
                  className="bg-background flex items-center gap-1 rounded-full px-2 py-0.5"
                  onClick={() => {
                    window.open(eventInfo?.project?.telegram, '_blank');
                  }}
                >
                  <Telegram className="h-3 w-3" />
                  <span className="sm:text-md text-sm font-semibold">{t('telegram')}</span>
                </div>
              )}
              {eventInfo?.project?.discord && (
                <div
                  className="bg-background flex items-center gap-1 rounded-full px-2 py-0.5"
                  onClick={() => {
                    window.open(eventInfo?.project?.discord, '_blank');
                  }}
                >
                  <Discord className="h-3 w-3" />
                  <span className="sm:text-md text-sm font-semibold">{t('discord')}</span>
                </div>
              )}
            </div>
            <Button
              size="sm"
              className="sm:!text-md ml-auto !h-8 w-full rounded-md bg-gradient-to-r from-[#007AFF] from-0% via-[#D4F5D0] via-30% to-[#007AFF] to-80% bg-[length:200%_100%] bg-[position:100%_50%] !px-2 text-sm transition-[background-position] duration-200 ease-in-out hover:bg-[position:-60%_50%] disabled:cursor-not-allowed disabled:opacity-50 sm:!h-8 sm:w-auto sm:!rounded-full sm:!px-4"
              onClick={toUniswap}
            >
              {t('buy_now')}
            </Button>
          </div>
        )}
        {/* {(eventInfo?.project?.link ||
          eventInfo?.project?.telegram ||
          eventInfo?.project?.discord) && (
          <div className="bg-muted-foreground/5 flex flex-wrap items-center justify-between gap-2 rounded-xl p-2 sm:gap-1">
            <span className="text-muted-foreground sm:text-md text-sm">{t('socials')}</span>
            <div className="flex cursor-pointer flex-wrap items-center gap-1">
              {eventInfo?.project?.link && (
                <div
                  className="bg-background flex items-center gap-1 rounded-full px-2 py-0.5"
                  onClick={() => {
                    window.open(eventInfo?.project?.link, '_blank');
                  }}
                >
                  <TwIcon className="h-3 w-3" />
                  <span className="sm:text-md text-sm font-semibold">{t('twitter')}</span>
                </div>
              )}
              {eventInfo?.project?.telegram && (
                <div
                  className="bg-background flex items-center gap-1 rounded-full px-2 py-0.5"
                  onClick={() => {
                    window.open(eventInfo?.project?.telegram, '_blank');
                  }}
                >
                  <Telegram className="h-3 w-3" />
                  <span className="sm:text-md text-sm font-semibold">{t('telegram')}</span>
                </div>
              )}
              {eventInfo?.project?.discord && (
                <div
                  className="bg-background flex items-center gap-1 rounded-full px-2 py-0.5"
                  onClick={() => {
                    window.open(eventInfo?.project?.discord, '_blank');
                  }}
                >
                  <Discord className="h-3 w-3" />
                  <span className="sm:text-md text-sm font-semibold">{t('discord')}</span>
                </div>
              )}
            </div>
          </div>
        )} */}
      </div>

      {/* Share Project Dialog */}
      <DialogShareProject isOpen={openShareDialog} onClose={() => setOpenShareDialog(false)} />

      {/* Brand Value Dialog */}
      <DialogBrandValue
        isOpen={openBrandValueDialog}
        onClose={() => setOpenBrandValueDialog(false)}
      />
    </div>
  );
});

export default EventInfo;
