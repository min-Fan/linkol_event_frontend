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
  getPrice,
  getInvitationCode,
  getActivityFollowers,
} from '@libs/request';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import useUserInfo from '@hooks/useUserInfo';
import UIWallet from '@ui/wallet';
import { useTranslations } from 'next-intl';
import { MoneyBag } from '@assets/svg';
import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useAppDispatch } from '@store/hooks';
import {
  setImageCache,
  removeExpiredImageCache,
  setInvitationCodeLoading,
  updateInvitationCode,
} from '@store/reducers/userSlice';
import { imageGenerator } from '@libs/utils/imageCache';
import { LanguageCode, uploadImage } from '@libs/request';
import html2canvas from 'html2canvas';
import DownloadCard from './compontents/canvasToImg/DownloadCard';
import { useEventData } from '@hooks/useEventData';
import { useDebounce } from '@hooks/useDebounce';

export default function MarketEventsPage() {
  const { eventId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('common');
  const dispatch = useAppDispatch();
  const twitterFullProfile = useAppSelector((state) => state.userReducer?.twitter_full_profile);

  // 使用优化的数据获取 hook
  const { eventInfo, isEventInfoLoading, refreshAllData, refetchEventInfo, fetchInvitationCode } =
    useEventData(eventId);

  const isLoggedIn = useAppSelector((state) => state.userReducer?.isLoggedIn);

  // 图片预生成相关状态
  const [priceData, setPriceData] = useState<any>(null);
  const [isPreGenerating, setIsPreGenerating] = useState(false);
  const preGenerateRef = useRef<HTMLDivElement>(null);

  // 添加 ref 来引用 EventLeaderboard 组件
  const leaderboardRef = useRef<{ refreshAllData: () => Promise<void> }>(null);

  // 添加 ref 来引用 EventPosts 组件
  const postsRef = useRef<{ refreshPosts: () => Promise<void> }>(null);

  // 添加 ref 来引用 EventParticipant 组件
  const participantRef = useRef<{ refreshParticipants: () => Promise<void> }>(null);

  // 使用防抖优化刷新函数
  const debouncedRefresh = useDebounce(refreshAllData, 300);

  // 提供更新活动信息的方法 - 使用 useCallback 优化
  const handleRefreshEventInfo = useCallback(async () => {
    try {
      await refetchEventInfo();
    } catch (error) {
      console.error('Failed to refresh event info:', error);
    }
  }, [refetchEventInfo]);

  // 预生成图片并缓存 - 使用 useCallback 优化
  const preGenerateImages = useCallback(async () => {
    if (!eventInfo?.id || !twitterFullProfile?.screen_name || isPreGenerating) {
      return;
    }

    try {
      // 清理过期的缓存
      dispatch(removeExpiredImageCache());

      // 检查是否支持图片模板
      if (eventInfo.title === 'Tweet Value Checker') {
        setIsPreGenerating(true);

        // 获取价格数据
        const res: any = await getPrice({ screen_name: twitterFullProfile.screen_name });
        if (res.code === 200 && res.data) {
          setPriceData(res.data);

          // 等待DOM更新后生成图片
          setTimeout(() => {
            generateAndUploadImage(res.data);
          }, 500);
        }
      }
    } catch (error) {
      console.error('An error occurred during the pre-generation of images.:', error);
      setIsPreGenerating(false);
    }
  }, [eventInfo?.id, eventInfo?.title, twitterFullProfile?.screen_name, isPreGenerating, dispatch]);

  // 生成并上传图片 - 使用 useCallback 优化
  const generateAndUploadImage = useCallback(
    async (data: any) => {
      if (!preGenerateRef.current || !eventId || !twitterFullProfile?.screen_name) {
        setIsPreGenerating(false);
        return;
      }

      try {
        // 等待DOM完全渲染
        await new Promise((resolve) => setTimeout(resolve, 200));

        // 使用html2canvas生成图片
        const canvas = await html2canvas(preGenerateRef.current, {
          backgroundColor: null,
          scale: 1,
          useCORS: true,
          allowTaint: true,
        });

        // 将canvas转换为blob并上传
        const imageUrl = await new Promise<string | null>((resolve) => {
          canvas.toBlob(
            async (blob) => {
              if (!blob) {
                resolve(null);
                return;
              }

              try {
                const file = new File(
                  [blob],
                  `tweet-value-card-${twitterFullProfile.screen_name}.png`,
                  {
                    type: 'image/png',
                  }
                );

                console.log('Preparing to upload image, file size:', file.size / 1024 / 1024, 'MB');

                // 上传图片
                const response: any = await uploadImage({ file });

                if (response.code === 200) {
                  resolve(response.data.url);
                } else {
                  console.error('Image upload failed:', response.msg);
                  resolve(null);
                }
              } catch (error) {
                console.error('An error occurred during the upload of images:', error);
                resolve(null);
              }
            },
            'image/png',
            0.9
          );
        });

        // 如果上传成功，保存到缓存
        if (imageUrl) {
          dispatch(
            setImageCache({
              eventId: eventId as string,
              screenName: twitterFullProfile.screen_name,
              imageUrl,
              templateData: data,
              expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24小时过期
            })
          );
          console.log('Image has been saved to the cache');
        }
      } catch (error) {
        console.error('An error occurred during the generation of images:', error);
      } finally {
        setIsPreGenerating(false);
      }
    },
    [eventId, twitterFullProfile?.screen_name, dispatch]
  );

  // 页面打开时获取自己的邀请码
  useEffect(() => {
    if (eventId) {
      fetchInvitationCode();
    }
  }, [eventId, fetchInvitationCode]);

  // 检测URL参数，URL上的invite是别人的邀请码
  useEffect(() => {
    const inviteParam = searchParams.get('invite');
    if (inviteParam) {
      console.log('URL in the page contains invite code:', inviteParam);
    }
  }, [searchParams]);

  // 当活动信息加载完成且用户已登录时，预生成图片
  useEffect(() => {
    if (eventInfo && twitterFullProfile?.screen_name) {
      // 延迟一点时间确保页面完全加载
      const timer = setTimeout(() => {
        preGenerateImages();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [eventInfo?.id, twitterFullProfile?.screen_name, preGenerateImages]);

  useEffect(() => {
    // 当eventInfo数据加载完成且包含项目信息时，添加project参数到URL
    if (eventInfo?.project?.name) {
      const currentUrl = new URL(window.location.href);
      const currentProject = currentUrl.searchParams.get('p');
      // 将项目名称中的空格替换为下划线
      const projectNameWithUnderscore = eventInfo.project.name.replace(/\s+/g, '_');

      // 只有当project参数不存在或与当前项目名称不同时才更新URL
      if (currentProject !== projectNameWithUnderscore) {
        currentUrl.searchParams.set('p', projectNameWithUnderscore);
        router.replace(currentUrl.pathname + currentUrl.search, { scroll: false });
      }
    }
  }, [eventInfo, router]);

  // 移除重复的 followers 查询，已在 useEventData 中处理

  // 使用 useMemo 优化组件 props，避免不必要的重新渲染
  const eventInfoProps = useMemo(
    () => ({
      eventInfo: eventInfo as any,
      isLoading: isEventInfoLoading,
      onRefresh: handleRefreshEventInfo,
    }),
    [eventInfo, isEventInfoLoading, handleRefreshEventInfo]
  );

  const eventDetailProps = useMemo(
    () => ({
      eventInfo: eventInfo as any,
      isLoading: isEventInfoLoading,
      onRefresh: handleRefreshEventInfo,
      leaderboardRef,
      postsRef,
      participantRef,
    }),
    [
      eventInfo,
      isEventInfoLoading,
      handleRefreshEventInfo,
      leaderboardRef,
      postsRef,
      participantRef,
    ]
  );

  const eventPostsProps = useMemo(
    () => ({
      eventInfo: eventInfo as any,
      isLoading: isEventInfoLoading,
      onRefresh: handleRefreshEventInfo,
    }),
    [eventInfo, isEventInfoLoading, handleRefreshEventInfo]
  );

  return (
    <div className="h-full w-full max-w-7xl p-0 sm:px-10 sm:py-6">
      {/* 网格布局容器 */}
      {isLoggedIn ? (
        // 纵向布局模式 - 移动端一列，桌面端两列，使用响应式比例
        <div className="grid w-full grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-[3fr_5fr] xl:grid-cols-[3fr_5fr]">
          {/* 左列 - 移动端全宽，桌面端40% (3fr) */}
          <div className="flex h-full flex-col gap-4 sm:min-w-3/8">
            {/* 第一行第一个元素 */}
            <div className="border-border bg-background hidden rounded-xl border sm:block">
              <EventInfo {...eventInfoProps} />
            </div>
            <div className="border-border bg-background block rounded-xl border sm:hidden">
              <EventDetail {...eventDetailProps} />
            </div>

            {/* 第二行第一个元素 */}
            <div className="border-border bg-background hidden rounded-xl border sm:block">
              <EventLeaderboard ref={leaderboardRef} />
            </div>
            <div className="border-border bg-background block rounded-xl border sm:hidden">
              <EventInfo {...eventInfoProps} />
            </div>
          </div>

          {/* 右列 - 移动端全宽，桌面端60% (5fr) */}
          <div className="flex h-full w-full min-w-0 flex-col gap-4 sm:min-w-5/8">
            {/* 第一行第二个元素 */}
            <div className="border-border bg-background hidden rounded-xl border sm:block">
              <EventDetail {...eventDetailProps} />
            </div>
            <div className="border-border bg-background block rounded-xl border sm:hidden">
              <EventLeaderboard ref={leaderboardRef} />
            </div>

            {/* 第二行第二个元素 */}
            <div className="border-border bg-background rounded-xl border">
              <EventPosts {...eventPostsProps} ref={postsRef} />
            </div>
          </div>
        </div>
      ) : (
        // 横向布局模式 - 移动端一列，桌面端两列，使用响应式比例
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_3fr] xl:grid-cols-[3fr_5fr]">
          {/* 第一行第一个元素 - 移动端全宽，桌面端40% (3fr) */}
          <div className="border-border bg-background rounded-xl border">
            <EventInfo {...eventInfoProps} />
          </div>

          {/* 第一行第二个元素 - 移动端全宽，桌面端60% (5fr) */}
          <div className="border-border bg-background rounded-xl border">
            <EventDetail {...eventDetailProps} />
          </div>

          {/* 第二行第二个元素 - 移动端全宽，桌面端占满整行 */}
          <div className="border-border bg-background mt-4 rounded-xl border sm:col-span-2">
            <EventPosts {...eventPostsProps} col={3} />
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

      {/* 隐藏的图片预生成组件 */}
      {priceData && (
        <div ref={preGenerateRef} className="pointer-events-none fixed -top-[10000px] left-0">
          <DownloadCard data={priceData} />
        </div>
      )}
    </div>
  );
}
