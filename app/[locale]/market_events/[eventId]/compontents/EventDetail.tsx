'use client';
import {
  HugeiconsFlash,
  Linkol,
  LinkolDark,
  LinkolLight,
  LinkolLogoIconPrimary,
  LinkolPrimary,
  Logo,
  Magic,
  MoneyBag,
  NullData,
  TimerQuarterIcon,
  TwIcon,
  Twitter,
  TwitterX,
} from '@assets/svg';
import { Button } from '@shadcn/components/ui/button';
import { Skeleton } from '@shadcn/components/ui/skeleton';
import React, { useState, useEffect, useCallback } from 'react';
import { CommLineChart } from './CommLineChart';
import { useAppSelector } from '@store/hooks';
import XAuth from '@ui/profile/components/XAuth';
import defaultAvatar from '@assets/image/avatar.png';
import { cn } from '@shadcn/lib/utils';
import {
  getBrandValueLineChart,
  getCampaignJoinList,
  getReceiveRewardButtonStatus,
  IEventInfoResponseData,
  IGetCampaignJoinListItem,
  IGetCampaignJoinListResponseData,
} from '@libs/request';
import { formatNumberKMB } from '@libs/utils';
import { useQuery } from '@tanstack/react-query';
import useUserInfo from '@hooks/useUserInfo';
import DialogInvire from './dialog/DialogInvire';
import DialogPostTweetLink from './dialog/DialogPostTweetLink';
import DialogClaimReward from './dialog/DialogClaimReward';
import DialogGuide from './dialog/DialogGuide';
import { useTranslations } from 'next-intl';
import PagesRoute from '@constants/routes';
import { Link, useRouter } from '@libs/i18n/navigation';
import { BellRing, Dices, Flashlight, Zap } from 'lucide-react';
import RaffleRewardCard from './RaffleRewardCard';
import PlatformRewardCard from './PlatformRewardCard';
import TokenIcon from 'app/components/TokenIcon';
import useUserActivityReward from '@hooks/useUserActivityReward';
import useCountdownToMidnight from '@hooks/useCountdownToMidnight';

// 骨架屏组件
function EventDetailSkeleton() {
  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        {/* 标题和状态骨架屏 */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48 sm:h-10 sm:w-64" />
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>

        {/* 时间信息骨架屏 */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20 sm:h-5 sm:w-24" />
          <div className="border-muted-foreground w-3 border-t sm:w-4"></div>
          <Skeleton className="h-4 w-20 sm:h-5 sm:w-24" />
        </div>

        {/* 标签按钮骨架屏 */}
        <div className="my-2 flex flex-wrap items-center gap-2 sm:my-4">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>

        {/* 描述文本骨架屏 */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full sm:h-5" />
          <Skeleton className="h-4 w-3/4 sm:h-5" />
        </div>

        {/* 参与者和奖励信息骨架屏 */}
        <div className="mt-2 flex w-full flex-wrap items-center gap-3">
          <div className="bg-muted-foreground/5 flex flex-1 items-center justify-between gap-4 rounded-lg p-3 px-4">
            <Skeleton className="h-4 w-16 sm:h-5 sm:w-20" />
            <Skeleton className="h-5 w-20 sm:h-6 sm:w-24" />
          </div>
          <div className="bg-muted-foreground/5 flex flex-1 items-center justify-between gap-4 rounded-lg p-3 px-4">
            <Skeleton className="h-4 w-20 sm:h-5 sm:w-24" />
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-4 rounded-full sm:h-5 sm:w-5" />
              <Skeleton className="h-4 w-4 rounded-full sm:h-5 sm:w-5" />
              <Skeleton className="h-4 w-4 rounded-full sm:h-5 sm:w-5" />
              <Skeleton className="h-5 w-16 sm:h-6 sm:w-20" />
            </div>
          </div>
        </div>
      </div>

      {/* 图表区域骨架屏 */}
      <div className="mt-2 flex h-full min-h-0 flex-1 flex-col gap-2 sm:gap-4">
        <div className="h-36 rounded-md">
          <div className="flex h-full w-full items-center justify-center">
            <Skeleton className="h-32 w-full" />
          </div>
        </div>

        {/* 按钮区域骨架屏 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-40 rounded-xl" />
            <Skeleton className="h-10 w-20 rounded-xl" />
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EventDetail({
  eventInfo,
  isLoading,
  onRefresh,
  leaderboardRef,
  postsRef,
  participantRef,
  userActivityRewardRef,
}: {
  eventInfo: IEventInfoResponseData;
  isLoading: boolean;
  onRefresh?: () => Promise<void>;
  leaderboardRef?: React.RefObject<{ refreshAllData: () => Promise<void> } | null>;
  postsRef?: React.RefObject<{ refreshPosts: () => Promise<void> } | null>;
  participantRef?: React.RefObject<{ refreshParticipants: () => Promise<void> } | null>;
  userActivityRewardRef?: React.RefObject<{
    refreshUserActivityReward: () => Promise<void>;
  } | null>;
}) {
  const t = useTranslations('common');
  const isLoggedIn = useAppSelector((state) => state.userReducer?.isLoggedIn);
  const { isLogin } = useUserInfo();
  const [activeTab, setActiveTab] = useState<'raffle' | 'limited'>(
    eventInfo?.a_type === 'normal' ? 'raffle' : 'limited'
  );
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isPostTweetLinkOpen, setIsPostTweetLinkOpen] = useState(false);
  const [isGuideDialogOpen, setIsGuideDialogOpen] = useState(false);
  const [isClaimRewardDialogOpen, setIsClaimRewardDialogOpen] = useState(false);
  const payTokenInfo = useAppSelector((state) => state.userReducer?.pay_token_info);
  const router = useRouter();
  const { data: joinList, isLoading: isJoinListLoading } = useQuery({
    queryKey: ['joinList', eventInfo?.id],
    queryFn: () => getCampaignJoinList({ active_id: eventInfo?.id, page: 1, size: 10 }),
    enabled: !!eventInfo?.id,
  });

  const {
    data: receiveRewardButtonStatus,
    isLoading: isReceiveRewardButtonStatusLoading,
    refetch: refetchReceiveRewardButtonStatus,
  } = useQuery({
    queryKey: ['receiveRewardButtonStatus', eventInfo?.id, isLoggedIn],
    queryFn: () => getReceiveRewardButtonStatus(eventInfo?.id),
    enabled: !!eventInfo?.id && isLoggedIn,
  });

  // 使用新的 hook 从 store 中获取用户活动奖励数据
  const { todayJoin, todayJoinAt } = useUserActivityReward({
    eventId: eventInfo?.id?.toString() || '',
    enabled: !!eventInfo?.id,
  });

  // 使用倒计时hook计算到UTC 0点的倒计时
  const countdown = useCountdownToMidnight(new Date().toISOString());

  // 创建一个包装的 onRefresh 函数，同时刷新按钮状态、排行榜数据、推文列表和参与者列表
  const handleRefresh = useCallback(async () => {
    await onRefresh?.();
    await refetchReceiveRewardButtonStatus();
    // 刷新排行榜数据
    if (leaderboardRef?.current) {
      await leaderboardRef.current.refreshAllData();
    }
    // 刷新推文列表
    if (postsRef?.current) {
      await postsRef.current.refreshPosts();
    }

    // 刷新用户活动奖励数据
    if (userActivityRewardRef?.current) {
      await userActivityRewardRef.current.refreshUserActivityReward();
    }
    // 刷新参与者列表
    if (participantRef?.current) {
      await participantRef.current.refreshParticipants();
    }
  }, [
    onRefresh,
    refetchReceiveRewardButtonStatus,
    leaderboardRef,
    postsRef,
    participantRef,
    userActivityRewardRef,
  ]);

  // 处理 RaffleRewardCard 数据刷新
  const handleRefreshUserReward = useCallback(
    (result: { is_win: boolean; receive_amount: number }) => {
      // 这个函数会被 RaffleRewardCard 调用来刷新父组件数据
      handleRefresh();
    },
    [handleRefresh]
  );

  // 缓存DialogClaimReward的onClose回调函数
  const handleClaimRewardDialogClose = useCallback(() => {
    setIsClaimRewardDialogOpen(false);
  }, []);

  // 当 eventInfo 更新时，自动刷新按钮状态
  useEffect(() => {
    if (eventInfo?.id && isLoggedIn) {
      refetchReceiveRewardButtonStatus();
    }
  }, [eventInfo?.id, isLoggedIn, refetchReceiveRewardButtonStatus]);

  const { data: brandValueLineChart, isLoading: isBrandValueLineChartLoading } = useQuery({
    queryKey: ['brandValueLineChart', eventInfo?.id, isLoggedIn],
    queryFn: () => getBrandValueLineChart(eventInfo?.id),
    enabled: !!eventInfo?.id && isLoggedIn,
  });

  // 如果正在加载，显示骨架屏
  if (isLoading) {
    return <EventDetailSkeleton />;
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold sm:text-xl">{eventInfo?.title || '-'}</h1>
          {/* {eventInfo?.a_type === 'platform' ? (
            <Button className="!bg-primary/10 !text-primary cursor-default gap-0 !rounded-xl">
              <LinkolLogoIconPrimary className="!h-6 !w-6" />
              <span className="text-md">Linkol</span>
            </Button>
          ) : ( */}
          <>
            {eventInfo?.status === 'wait' && (
              <Button className="cursor-default !rounded-xl !bg-orange-500/10 !text-orange-500">
                {t('not_started')}
              </Button>
            )}
            {eventInfo?.status === 'progress' && (
              <Button className="cursor-default !rounded-xl !bg-green-500/10 !text-green-500">
                {t('in_progress')}
              </Button>
            )}
            {eventInfo?.status === 'ended' && (
              <Button className="!bg-muted-foreground/10 !text-muted-foreground cursor-default !rounded-xl">
                {t('ended')}
              </Button>
            )}
          </>
          {/* )} */}
        </div>
        <div className="flex items-center gap-2">
          <TimerQuarterIcon className="h-6 w-6" />
          <span className="text-sm sm:text-base">{eventInfo?.start || '-'}</span>
          <div className="border-muted-foreground w-3 border-t sm:w-4"></div>
          <span className="text-sm sm:text-base">{eventInfo?.end || '-'}</span>
        </div>
        {isLoggedIn && (
          <div className="my-2 flex flex-wrap items-center gap-2 sm:my-4 sm:gap-4">
            {eventInfo?.a_type === 'normal' && (
              <Button
                variant="outline"
                className={cn(
                  'text-muted-foreground pointer-events-none !h-auto gap-1 !rounded-xl !px-2 sm:!px-4',
                  eventInfo?.a_type === 'normal' &&
                    '!bg-primary/5 !text-primary !border-primary pointer-events-auto'
                )}
              >
                <Dices className="!h-6 !w-6" />
                <span className="sm:text-md text-sm">{t('raffle_rewards')}</span>
              </Button>
            )}
            {eventInfo?.a_type === 'platform' && (
              <Button
                variant="outline"
                className={cn(
                  'text-muted-foreground pointer-events-none !h-auto gap-1 !rounded-xl !px-2 sm:!px-4',
                  eventInfo?.a_type === 'platform' &&
                    '!bg-primary/5 !text-primary !border-primary pointer-events-auto'
                )}
              >
                <Zap className="!h-6 !w-6" />
                <span className="sm:text-md text-sm">{t('limited_rewards')}</span>
              </Button>
            )}
            {/* <Button
              variant="outline"
              className={cn(
                'text-muted-foreground !h-auto !rounded-full !px-4 !py-0',
                activeTab === 'reward' && '!bg-primary/5 !text-primary !border-primary'
              )}
              onClick={() => setActiveTab('reward')}
            >
              <span className="sm:text-md text-sm">{t('reward')}</span>
            </Button> */}
          </div>
        )}
        <div className={cn('line-clamp-2 text-sm sm:text-base', isLoggedIn && 'mb-2 line-clamp-4')}>
          {!eventInfo?.requirement ? (
            '-'
          ) : (
            <>
              <p>{eventInfo?.requirement}</p>
            </>
          )}
        </div>
        <div className="mt-2 flex w-full flex-wrap items-center gap-3">
          <div className="bg-muted-foreground/5 flex w-full flex-wrap items-center justify-between gap-4 rounded-lg p-3 px-4 sm:w-auto sm:flex-1">
            <span className="text-muted-foreground sm:text-md text-sm">{t('reward_pool')}</span>
            <span className="sm:text-md flex items-center gap-1 text-sm font-semibold">
              {eventInfo?.reward_amount?.toLocaleString() || '-'}
              {payTokenInfo?.iconType && (
                <TokenIcon type={payTokenInfo?.iconType as string} className="size-5" />
              )}
              {payTokenInfo?.symbol || ''}
            </span>
          </div>
          <div className="bg-muted-foreground/5 flex w-full flex-wrap items-center justify-between gap-4 rounded-lg p-3 px-4 sm:w-auto sm:flex-1">
            <span className="text-muted-foreground sm:text-md text-sm">{t('participant')}</span>
            <div className="flex items-center gap-1">
              <div className="relative flex items-center">
                {isLoggedIn &&
                  joinList?.data?.list
                    // 根据screen_name去重，确保每个用户只显示一次
                    ?.filter((kol, index, array) => {
                      if (kol.screen_name) {
                        return (
                          array.findIndex((item) => item.screen_name === kol.screen_name) === index
                        );
                      }
                    })
                    ?.map((kol: IGetCampaignJoinListItem, index) => (
                      <div
                        className="border-background -ml-3 size-4 min-w-4 overflow-hidden rounded-full border-[1px] sm:size-6 sm:min-w-6"
                        key={
                          kol.screen_name || kol.id || kol.name || kol.profile_image_url || index
                        }
                      >
                        <img
                          src={kol.profile_image_url || defaultAvatar.src}
                          alt="avatar"
                          className="size-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = defaultAvatar.src;
                          }}
                        />
                      </div>
                    ))}
                <div className="via-background/60 to-background absolute top-0 right-0 h-full w-10 rounded-tr-xl rounded-br-xl bg-gradient-to-r from-transparent"></div>
              </div>
              <span className="text-md font-semibold">
                {formatNumberKMB(eventInfo?.join_count) || '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
      {isLoggedIn ? (
        <div className="mt-2 flex h-full min-h-0 flex-1 flex-col gap-2 sm:gap-4">
          <div className="">
            {/* {brandValueLineChart?.data?.length > 0 ? (
              <CommLineChart data={brandValueLineChart?.data || []} />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center">
                <NullData className="h-14 w-14" />
                <span className="text-muted-foreground/60 sm:text-md text-sm">{t('no_data')}</span>
              </div>
            )} */}
            {eventInfo?.a_type === 'normal' && (
              <RaffleRewardCard
                eventInfo={eventInfo}
                onClaim={() => {
                  setIsClaimRewardDialogOpen(true);
                }}
                onRefreshUserReward={(result) => handleRefreshUserReward(result)}
              />
            )}
            {eventInfo?.a_type === 'platform' && (
              <PlatformRewardCard eventInfo={eventInfo} onRefresh={handleRefresh} />
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-4">
              {/* <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  className="text-muted-foreground !rounded-xl"
                  onClick={() => setIsInviteDialogOpen(true)}
                >
                  {t('invite_other_creators')}
                </Button>
              </div> */}
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  className="text-muted-foreground !h-full !rounded-xl"
                  onClick={() => setIsGuideDialogOpen(true)}
                >
                  {t('guide')}
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {todayJoin === 0 && (
                <Button variant="secondary" className="text-muted-foreground !rounded-xl">
                  {t('no_ticket')}
                </Button>
              )}
              {todayJoin > 0 && (
                <div className="text-primary sm:text-md flex items-center gap-2 text-sm">
                  <span>{t('till_next_post', { time: countdown.formatted })}</span>
                  <BellRing className="!h-4 min-h-4 !w-4 min-w-4 sm:!h-6 sm:!w-6" />
                </div>
              )}
              {eventInfo?.status === 'wait' && (
                <Button variant="secondary" className="text-muted-foreground !rounded-xl">
                  {t('not_started')}
                </Button>
              )}
              {eventInfo?.status === 'ended' && (
                <Button variant="secondary" className="text-muted-foreground !rounded-xl">
                  {t('ended')}
                </Button>
              )}
              {
                eventInfo?.status === 'progress' && (
                  <Button
                    className="h-10 !rounded-2xl !px-4 font-light sm:!h-12"
                    onClick={() => setIsPostTweetLinkOpen(true)}
                  >
                    <TwitterX className="!h-5 !w-5 text-white" />
                    <span className="text-md sm:text-base">{t('post_a_tweet')}</span>
                  </Button>
                )
                // (receiveRewardButtonStatus?.data?.btn_status === 'not_joined' ? (
                //   <Button
                //     className="h-10 !rounded-2xl !px-4 font-light sm:!h-12"
                //     onClick={() => setIsPostTweetLinkOpen(true)}
                //   >
                //     <TwitterX className="!h-5 !w-5 text-white" />
                //     <span className="text-md sm:text-base">{t('post_a_tweet')}</span>
                //   </Button>
                // ) : receiveRewardButtonStatus?.data?.btn_status === 'not_sure' ? (
                //   <Button
                //     variant="secondary"
                //     className="text-muted-foreground cursor-default !rounded-xl"
                //   >
                //     {t('tweet_submitted')}
                //   </Button>
                // ) : receiveRewardButtonStatus?.data?.btn_status === 'selected' ? (
                //   <Button
                //     className="flex items-center gap-2 !rounded-xl text-white"
                //     // onClick={() => setIsClaimRewardDialogOpen(true)}
                //   >
                //     <MoneyBag className="h-4 w-4" />
                //     {t('claim_reward')}
                //   </Button>
                // ) : receiveRewardButtonStatus?.data?.btn_status === 'receiving' ? (
                //   <Button className="text-primary bg-primary/10 flex items-center gap-2 !rounded-xl">
                //     {t('receiving')}
                //   </Button>
                // ) : receiveRewardButtonStatus?.data?.btn_status === 'received' ? (
                //   <Button className="text-primary bg-primary/10 flex items-center gap-2 !rounded-xl">
                //     {t('received')}
                //   </Button>
                // ) : receiveRewardButtonStatus?.data?.btn_status === 'failed' ? (
                //   <Button
                //     variant="destructive"
                //     className="flex items-center gap-2 !rounded-xl bg-red-500/10 text-red-500"
                //   >
                //     {t('claim_failed')}
                //   </Button>
                // ) : (
                //   <Link href={PagesRoute.MARKET_EVENTS}>
                //     <Button className="text-primary bg-primary/10 flex items-center gap-2 !rounded-xl">
                //       {t('join_other_events')}
                //     </Button>
                //   </Link>
                // ))
              }
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-muted-foreground/5 border-border mt-2 flex min-h-0 flex-1 flex-col gap-2 rounded-lg border p-2 sm:p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#BFFF00] text-sm font-bold sm:h-6 sm:w-6 sm:text-base">
              X
            </div>
            <span className="text-sm font-bold sm:text-base">{t('leaderboard')}</span>
          </div>
          <div className="flex h-full flex-col items-center justify-center gap-0 sm:gap-0">
            <div className="flex items-center gap-0 sm:gap-0">
              <span className="text-xs font-bold sm:text-base">{t('this_data_is_for')}</span>
              <div className="flex items-center gap-2">
                {/* <Logo className="h-2 w-2 sm:h-4 sm:w-4" />
                <span className="text-sm font-bold sm:text-base">Linkol</span> */}
                <LinkolLight className="!h-6 sm:!h-8 dark:hidden" />
                <LinkolDark className="hidden !h-6 sm:!h-8 dark:block" />
              </div>
              <span className="text-xs font-bold sm:text-base">{t('only')}</span>
            </div>
            <p className="sm:text-md text-muted-foreground text-center text-xs">
              {t('please_login_to_view')}
            </p>
            {/* <div className="mt-2 pb-4 sm:mt-6 sm:pb-0">
              <XAuth
                className="rounded-none bg-transparent p-0"
                button={
                  <Button className="flex w-auto items-center gap-2 !rounded-xl bg-black sm:w-40">
                    <TwitterX className="!h-4 !w-4 text-white sm:!h-5 sm:!w-5" />
                    {t('link_twitter')}
                  </Button>
                }
              />
            </div> */}
          </div>
        </div>
      )}

      {/* Invite Dialog */}
      <DialogInvire isOpen={isInviteDialogOpen} onClose={() => setIsInviteDialogOpen(false)} />
      <DialogPostTweetLink
        isOpen={isPostTweetLinkOpen}
        eventInfo={eventInfo}
        onClose={() => setIsPostTweetLinkOpen(false)}
        onRefresh={handleRefresh}
      />
      <DialogGuide
        isOpen={isGuideDialogOpen}
        onClose={() => setIsGuideDialogOpen(false)}
        eventInfo={eventInfo}
      />
      <DialogClaimReward
        isOpen={isClaimRewardDialogOpen}
        onClose={handleClaimRewardDialogClose}
        eventInfo={eventInfo}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
