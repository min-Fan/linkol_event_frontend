'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@shadcn/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@shadcn/components/ui/avatar';
import { ScrollArea } from '@shadcn/components/ui/scroll-area';
import { Skeleton } from '@shadcn/components/ui/skeleton';
import { cn } from '@shadcn/lib/utils';
import {
  getAgentDetails,
  getAgentRewardList,
  IGetAgentRewardListData,
  IGetAgentRewardListItem,
} from '@libs/request';
import { useTranslations, useLocale } from 'next-intl';
import { useApp } from '@store/AppProvider';
import { useAppSelector } from '@store/hooks';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';

// 定义响应类型
interface ResponseData<T> {
  code: number;
  data: T;
  message: string;
}

interface RewardsHistoryProps {
  className?: string;
}

// 骨架屏组件
const RewardSkeleton = () => (
  <div className="border-primary/10 flex items-center gap-2 border-b pb-2">
    <Skeleton className="h-6 w-6 rounded-full" />
    <Skeleton className="h-4 flex-1" />
    <Skeleton className="h-4 w-16" />
  </div>
);

// 空状态组件
const EmptyState = ({ t }: { t: any }) => (
  <div className="flex h-full flex-col items-center justify-center py-8 text-center">
    <div className="bg-muted-foreground/10 mb-4 rounded-full p-4">
      <svg
        className="text-muted-foreground h-8 w-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
        />
      </svg>
    </div>
    <h3 className="text-sm font-medium">{t('no_rewards_record')}</h3>
    <p className="text-muted-foreground text-xs">{t('start_inviting_users_for_rewards')}</p>
  </div>
);

export default function RewardsHistory({ className }: RewardsHistoryProps) {
  const t = useTranslations('common');
  const locale = useLocale();
  const isLoggedIn = useAppSelector((state) => state.userReducer?.isLoggedIn);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading: isRewardsLoading,
    error: rewardsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['agentRewardsList'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = (await getAgentRewardList({
        page: pageParam,
        size: 20,
      })) as ResponseData<IGetAgentRewardListData>;
      return response.data;
    },
    getNextPageParam: (lastPage: IGetAgentRewardListData) => {
      // 如果当前页的数据少于20条，说明没有下一页了
      if (!lastPage.list || lastPage.list.length < 20) {
        return undefined;
      }
      // 返回下一页的页码
      return lastPage.current_page + 1;
    },
    initialPageParam: 1,
    enabled: isLoggedIn,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5分钟
  });

  // 合并所有页面的数据
  const rewards = data?.pages?.flatMap((page: any) => page.list || []) || [];
  const loading = isRewardsLoading;
  const error = rewardsError ? t('get_rewards_list_failed') : null;

  // 滚动加载下一页
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100; // 距离底部100px时触发

      if (isNearBottom && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  // 生成头像颜色
  const getAvatarColor = (username: string) => {
    const colors = [
      'bg-orange-400',
      'bg-purple-400',
      'bg-red-400',
      'bg-green-400',
      'bg-blue-400',
      'bg-pink-400',
      'bg-yellow-400',
      'bg-indigo-400',
      'bg-teal-400',
      'bg-cyan-400',
    ];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // 格式化时间
  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 获取奖励类型文案
  const getRewardTypeText = (reason?: string) => {
    if (!reason) return t('invitation_reward');

    switch (reason) {
      case 'invite':
        return t('reward_type_invite');
      case 'invited_post':
        return t('reward_type_invited_post');
      case 'tweet_value':
        return t('reward_type_tweet_value');
      case 'tweet_value_checker':
        return t('reward_type_tweet_value_checker');
      case 'self_tweet_value':
        return t('reward_type_self_tweet_value');
      default:
        return reason;
    }
  };

  return (
    <Card className={cn('h-full rounded-lg border-1 p-4 shadow-none', className)}>
      <CardContent className="flex h-full flex-col gap-4 p-0">
        <h2 className="text-md font-semibold">{t('rewards_history')}</h2>
        <ScrollArea
          ref={scrollAreaRef}
          className="border-primary/10 h-full max-h-[440px] rounded-xl border p-4"
          onScrollCapture={handleScroll}
        >
          <div className="flex h-full flex-col gap-2">
            {loading ? (
              // 加载状态 - 显示骨架屏
              <>
                {Array.from({ length: 15 }).map((_, index) => (
                  <RewardSkeleton key={index} />
                ))}
              </>
            ) : error ? (
              // 错误状态
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-4 rounded-full bg-red-100 p-4">
                  <svg
                    className="h-8 w-8 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-red-900">{t('load_failed')}</h3>
                <p className="text-xs text-red-500">{error}</p>
              </div>
            ) : rewards.length === 0 ? (
              // 空状态
              <EmptyState t={t} />
            ) : (
              // 正常状态 - 显示奖励列表
              <>
                {rewards.map((reward, index) => (
                  <div
                    key={reward.id}
                    className={cn(
                      'border-primary/10 flex items-center gap-2 border-b pb-2',
                      index === rewards.length - 1 && !hasNextPage ? 'border-b-0' : ''
                    )}
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={reward.from_user?.profile_image_url}
                        alt={reward.from_user?.screen_name || 'User'}
                      />
                      <AvatarFallback
                        className={`${getAvatarColor(reward.from_user?.screen_name || 'User')} text-xs font-medium text-white`}
                      >
                        {(reward.from_user?.screen_name || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {reward.from_user?.screen_name || t('unknown_user')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getRewardTypeText(reward.reason)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">
                        + {reward.point || 0} {t('points')}
                      </div>
                      <div className="text-xs text-gray-500">{formatTime(reward.created_at)}</div>
                    </div>
                  </div>
                ))}

                {/* 加载更多指示器 */}
                {isFetchingNextPage && (
                  <div className="flex items-center justify-center py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                      {t('loading')}
                    </div>
                  </div>
                )}

                {/* 没有更多数据提示 */}
                {!hasNextPage && rewards.length > 0 && (
                  <div className="flex items-center justify-center py-4">
                    <div className="text-xs text-gray-400">{t('no_more_data')}</div>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
