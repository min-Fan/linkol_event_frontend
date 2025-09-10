'use client';

import EventInfo from './compontents/EventInfo';
import EventDetail from './compontents/EventDetail';
import { useAppSelector } from '@store/hooks';
import EventLeaderboard from './compontents/EventLeaderboard';
import EventQuery from './compontents/EventQuery';
import EventPosts from './compontents/EventPosts';
import EventParticipant from './compontents/EventParticipant';
import {
  getActivityDetail,
  getActivityDetailFromDashboard,
  getActivityDetailLogin,
} from '@libs/request';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import useUserInfo from '@hooks/useUserInfo';
import UIWallet from '@ui/wallet';
import { useTranslations } from 'next-intl';
import { MoneyBag } from '@assets/svg';
import { useRef } from 'react';

export default function MarketEventsPage() {
  const isLoggedIn = useAppSelector((state) => state.userReducer?.isLoggedIn);
  const { isLogin } = useUserInfo();
  const { eventId } = useParams();
  const t = useTranslations('common');

  // 添加 ref 来引用 EventLeaderboard 组件
  const leaderboardRef = useRef<{ refreshAllData: () => Promise<void> }>(null);

  // 添加 ref 来引用 EventPosts 组件
  const postsRef = useRef<{ refreshPosts: () => Promise<void> }>(null);

  // 添加 ref 来引用 EventParticipant 组件
  const participantRef = useRef<{ refreshParticipants: () => Promise<void> }>(null);

  const getEventInfo = async () => {
    if (isLoggedIn) {
      const res: any = await getActivityDetailLogin(eventId as string);
      if (res.code === 200) {
        return res.data;
      }
    } else {
      const res: any = await getActivityDetail(eventId as string);
      if (res.code === 200) {
        return res.data;
      }
    }
  };

  const getEventInfoCreator = async () => {
    if (isLogin) {
      const res: any = await getActivityDetailFromDashboard(eventId as string);
      if (res.code === 200) {
        return res.data;
      }
    }
  };
  const {
    data: eventInfo,
    isLoading: isEventInfoLoading,
    refetch: refetchEventInfo,
  } = useQuery({
    queryKey: ['eventInfo', eventId, isLoggedIn, isLogin],
    queryFn: getEventInfo,
    // enabled: !!eventId && isLogin && isLoggedIn,
  });

  // const {
  //   data: eventInfoCreator,
  //   isLoading: isEventInfoLoadingCreator,
  //   refetch: refetchEventInfoCreator,
  // } = useQuery({
  //   queryKey: ['eventInfoCreator', eventId, isLoggedIn, isLogin],
  //   queryFn: getEventInfoCreator,
  //   enabled: !!eventId && isLogin && isLoggedIn,
  // });

  // 提供更新活动信息的方法
  const handleRefreshEventInfo = async () => {
    try {
      await refetchEventInfo();
      // await refetchEventInfoCreator();
    } catch (error) {
      console.error('Failed to refresh event info:', error);
    }
  };

  return (
    <div className="h-full w-full max-w-7xl p-0 sm:px-10 sm:py-6">
      {/* 网格布局容器 */}
      {isLoggedIn ? (
        // 纵向布局模式 - 移动端一列，桌面端两列，使用响应式比例
        <div className="grid w-full grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-[3fr_5fr] xl:grid-cols-[3fr_5fr]">
          {/* 左列 - 移动端全宽，桌面端40% (3fr) */}
          <div className="flex h-full flex-col gap-4 sm:min-w-3/8">
            {/* 第一行第一个元素 */}
            <div className="border-border bg-background rounded-xl border">
              <EventInfo
                eventInfo={eventInfo}
                isLoading={isEventInfoLoading}
                onRefresh={handleRefreshEventInfo}
              />
            </div>

            {/* 第二行第一个元素 */}
            <div className="border-border bg-background rounded-xl border">
              <EventLeaderboard ref={leaderboardRef} />
            </div>
          </div>

          {/* 右列 - 移动端全宽，桌面端60% (5fr) */}
          <div className="flex h-full w-full min-w-0 flex-col gap-4 sm:min-w-5/8">
            {/* 第一行第二个元素 */}
            <div className="border-border bg-background rounded-xl border">
              <EventDetail
                eventInfo={eventInfo}
                isLoading={isEventInfoLoading}
                onRefresh={handleRefreshEventInfo}
                leaderboardRef={leaderboardRef}
                postsRef={postsRef}
                participantRef={participantRef}
              />
            </div>

            {/* 第二行第二个元素 */}
            <div className="border-border bg-background rounded-xl border">
              <EventPosts
                eventInfo={eventInfo}
                isLoading={isEventInfoLoading}
                onRefresh={handleRefreshEventInfo}
                ref={postsRef}
              />
            </div>
          </div>
        </div>
      ) : (
        // 横向布局模式 - 移动端一列，桌面端两列，使用响应式比例
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_3fr] xl:grid-cols-[3fr_5fr]">
          {/* 第一行第一个元素 - 移动端全宽，桌面端40% (3fr) */}
          <div className="border-border bg-background rounded-xl border">
            <EventInfo
              eventInfo={eventInfo}
              isLoading={isEventInfoLoading}
              onRefresh={handleRefreshEventInfo}
            />
          </div>

          {/* 第一行第二个元素 - 移动端全宽，桌面端60% (5fr) */}
          <div className="border-border bg-background rounded-xl border">
            <EventDetail
              eventInfo={eventInfo}
              isLoading={isEventInfoLoading}
              onRefresh={handleRefreshEventInfo}
            />
          </div>

          {/* 第二行第二个元素 - 移动端全宽，桌面端占满整行 */}
          <div className="border-border bg-background mt-4 rounded-xl border sm:col-span-2">
            <EventPosts
              eventInfo={eventInfo}
              isLoading={isEventInfoLoading}
              onRefresh={handleRefreshEventInfo}
              col={3}
            />
          </div>
        </div>
      )}

      {/* 钱包连接区域 - 未登录时显示 */}
      {/* {!isLogin ? (
        <div className="border-border bg-background mt-6 mb-6 rounded-xl border p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-primary/10 flex h-20 w-20 items-center justify-center rounded-full">
              <MoneyBag className="text-primary h-10 w-10" />
            </div>
            <div className="text-center">
              <p className="text-md">{t('connect_wallet_to_view_full_content')}</p>
              <p className="text-muted-foreground text-sm">{t('connect_wallet_description')}</p>
            </div>
            <div className="flex w-40">
              <UIWallet className="!h-auto flex-1 !rounded-lg" />
            </div>
          </div>
        </div>
      ) : (
        <>
          {eventInfoCreator && (
            <>
              <div className="border-border bg-background mt-6 rounded-xl border">
                <EventParticipant
                  eventInfo={eventInfoCreator}
                  isLoading={isEventInfoLoadingCreator}
                  onRefresh={handleRefreshEventInfo}
                  ref={participantRef}
                />
              </div>
              <div className="border-border bg-background mt-6 rounded-xl border">
                {eventInfoCreator?.ai_analysis && (
                  <EventQuery eventInfo={eventInfoCreator} isLoading={isEventInfoLoadingCreator} />
                )}
              </div>
            </>
          )}
        </>
      )} */}
    </div>
  );
}
