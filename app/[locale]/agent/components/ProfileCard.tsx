'use client';

import React from 'react';
import { Card, CardContent } from '@shadcn/components/ui/card';
import { Badge } from '@shadcn/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@shadcn/components/ui/avatar';
import { Button } from '@shadcn/components/ui/button';
import { Skeleton } from '@shadcn/components/ui/skeleton';
import { Twitter } from 'lucide-react';
import { useAppSelector } from '@store/hooks';
import { TwitterX, Verified } from '@assets/svg';
import XAuth from '@ui/profile/components/XAuth';
import { useTranslations } from 'next-intl';
import { useAgentDetails } from '@hooks/useAgentDetails';

export default function ProfileCard() {
  const twitterFullProfile = useAppSelector((state) => state.userReducer?.twitter_full_profile);
  const isLoggedIn = useAppSelector((state) => state.userReducer?.isLoggedIn);
  const t = useTranslations('common');

  // 获取agent详情
  const { agentDetails, isLoading: isAgentDetailsLoading, points, rank } = useAgentDetails();

  // 如果未登录，显示登录按钮
  if (!isLoggedIn) {
    return (
      <Card className="rounded-lg border-1 p-4 shadow-none">
        <CardContent className="p-0">
          <div className="flex min-h-32 flex-col items-center justify-center gap-4">
            <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
              <TwitterX className="text-primary h-6 w-6" />
            </div>
            <div className="text-center">
              <h3 className="text-md font-bold">{t('please_login_to_view')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('just_spend_1_minutes_everyday_earn_usd_immediately')}
              </p>
            </div>
            <XAuth />
          </div>
        </CardContent>
      </Card>
    );
  }

  // 如果正在加载，显示骨架屏
  if (isAgentDetailsLoading) {
    return (
      <Card className="rounded-lg border-1 p-4 shadow-none">
        <CardContent className="p-0">
          <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
            <div className="flex w-full flex-row items-center justify-center gap-4 sm:w-auto sm:flex-col sm:gap-0">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div className="flex w-full flex-col items-start gap-2 sm:w-auto sm:items-center">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <div className="w-full">
              <div className="flex w-full items-center gap-3">
                <div className="bg-primary/5 flex flex-1 flex-col items-center justify-center rounded-2xl px-3 py-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-8" />
                </div>
                <div className="bg-primary/5 flex flex-1 flex-col items-center justify-center rounded-2xl px-3 py-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-8" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-lg border-1 p-4 shadow-none">
      <CardContent className="p-0">
        <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
          <div className="flex w-full flex-row items-center justify-center gap-4 sm:w-auto sm:flex-col sm:gap-0">
            <div className="w-14 min-w-14">
              {/* 头像 */}
              <Avatar className="h-14 w-14">
                <AvatarImage
                  src={twitterFullProfile?.profile_image_url}
                  alt={twitterFullProfile?.name}
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-lg font-semibold text-white">
                  {twitterFullProfile?.name}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex w-full flex-col items-start gap-0 sm:w-auto sm:items-center">
              <div className="flex w-full items-center gap-1 sm:w-auto">
                <h3 className="max-w-40 truncate text-lg font-bold sm:max-w-20">
                  {twitterFullProfile?.name}
                </h3>
                {twitterFullProfile?.verified && <Verified className="h-5 w-5 text-blue-500" />}
              </div>
              {twitterFullProfile?.screen_name && (
                <p className="w-full max-w-40 truncate text-sm sm:w-auto sm:max-w-20">
                  @{twitterFullProfile?.screen_name}
                </p>
              )}
            </div>
          </div>

          {/* 用户信息 */}
          <div className="w-full">
            {/* 积分和排名卡片 */}
            <div className="flex w-full items-center gap-3">
              <div className="bg-primary/5 flex flex-1 flex-col items-center justify-center rounded-2xl px-3 py-4">
                <p className="text-primary text-sm">{t('points_earned')}</p>
                <p className="text-primary text-md font-semibold">{points}</p>
              </div>
              <div className="bg-primary/5 flex flex-1 flex-col items-center justify-center rounded-2xl px-3 py-4">
                <p className="text-primary text-sm">{t('ranking')}</p>
                <p className="text-primary text-md font-semibold">#{rank || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
