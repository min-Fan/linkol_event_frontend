'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent } from '@shadcn/components/ui/card';
import { Button } from '@shadcn/components/ui/button';
import { Badge } from '@shadcn/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@shadcn/components/ui/avatar';
import { Checkbox } from '@shadcn/components/ui/checkbox';
import { Users, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import defaultAvatar from '@assets/image/avatar.png';
import { usePayTokenInfo } from '@hooks/usePayTokenInfo';
import { useTranslations } from 'next-intl';
import TokenIcon from 'app/components/TokenIcon';
import { Label } from '@shadcn/components/ui/label';
import { Switch } from '@shadcn/components/ui/switch';
import { Skeleton } from '@shadcn/components/ui/skeleton';
import { cn } from '@shadcn/lib/utils';
import { marketEventsGetActivesLogin, IMarketEventsGetActivesLoginList } from '@libs/request';
import PagesRoute from '@constants/routes';
import { Link } from '@libs/i18n/navigation';

interface Campaign {
  id: string;
  title: string;
  description: string;
  reward: string;
  participants: string;
  brand: string;
  brandAvatar?: string;
  autoPost: boolean;
  backgroundStyle: string;
  iconStyle: string;
  chain_type?: string;
  token_type?: string;
  is_verified?: boolean;
  reward_amount?: string;
}

interface CampaignsSectionProps {
  campaigns?: Campaign[];
  dataType?: 'new' | 'hot' | 'hig' | 'deadline' | '';
  activeTypeId?: number;
}

export default function CampaignsSection({
  campaigns: propCampaigns,
  dataType = '',
  activeTypeId,
}: CampaignsSectionProps) {
  const t = useTranslations('common');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [size, setSize] = useState(2);

  // 数据状态
  const [campaigns, setCampaigns] = useState<IMarketEventsGetActivesLoginList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoadingMoreTriggered, setIsLoadingMoreTriggered] = useState(false);

  // 获取活动数据
  const fetchCampaigns = async (page: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      const response = await marketEventsGetActivesLogin({
        data_type: dataType,
        active_type_id: activeTypeId,
        page,
        size: size,
        is_verify: 1, // 只获取已验证的活动
        is_on: isAutoPlay ? 1 : 0,
      });

      if (response.data?.list) {
        const newCampaigns = response.data.list;
        const total = response.data.total || 0;
        const totalPages = Math.ceil(total / 2); // 使用实际的 size 值

        setTotalPages(totalPages);
        setHasMore(page < totalPages);

        if (append) {
          setCampaigns((prev) => [...prev, ...newCampaigns]);
        } else {
          setCampaigns(newCampaigns);
        }
      } else {
        if (!append) {
          setCampaigns([]);
        }
        setHasMore(false);
      }
    } catch (err) {
      console.error('获取活动数据失败:', err);
      if (!append) {
        setError('获取活动数据失败');
        setCampaigns([]);
      }
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    setIsLoadingMoreTriggered(false);
    fetchCampaigns(1, false);
  }, [dataType, activeTypeId, isAutoPlay]);

  // 使用第一个活动的代币信息
  const { tokenInfo } = usePayTokenInfo(campaigns[0]?.chain_type, campaigns[0]?.token_type);

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);

      // 检查是否需要加载更多数据（当滚动到接近右侧时）
      const scrollPercentage = (scrollLeft + clientWidth) / scrollWidth;

      if (
        scrollPercentage > 0.6 && // 降低阈值，更容易触发
        hasMore &&
        !loadingMore &&
        !isLoadingMoreTriggered &&
        campaigns.length > 0
      ) {
        loadMoreData();
      }
    }
  };

  // 加载更多数据
  const loadMoreData = async () => {
    if (hasMore && !loadingMore && !isLoadingMoreTriggered && currentPage < totalPages) {
      setIsLoadingMoreTriggered(true);
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      await fetchCampaigns(nextPage, true);
      setIsLoadingMoreTriggered(false);
    } else {
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current && canScrollLeft) {
      scrollContainerRef.current.scrollBy({
        left: -300,
        behavior: 'smooth',
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current && canScrollRight) {
      scrollContainerRef.current.scrollBy({
        left: 300,
        behavior: 'smooth',
      });

      // 如果还有更多数据且没有在加载，直接触发加载更多
      if (hasMore && !loadingMore && !isLoadingMoreTriggered) {
        loadMoreData();
      } else {
        // 延迟检查滚动位置，确保滚动动画完成
        setTimeout(() => {
          if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            const scrollPercentage = (scrollLeft + clientWidth) / scrollWidth;

            if (scrollPercentage > 0.7 && hasMore && !loadingMore && !isLoadingMoreTriggered) {
              loadMoreData();
            }
          }
        }, 300);
      }
    }
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      // 初始检查
      checkScrollPosition();

      // 添加滚动事件监听
      scrollContainer.addEventListener('scroll', checkScrollPosition);

      // 添加resize事件监听，以防容器大小变化
      window.addEventListener('resize', checkScrollPosition);

      return () => {
        scrollContainer.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
  }, [campaigns]);

  // 骨架屏组件
  const CampaignSkeleton = () => (
    <div className="bg-background border-primary/10 min-w-[280px] rounded-xl border">
      <div className="p-0">
        {/* 头部图片骨架 */}
        <Skeleton className="h-32 rounded-t-lg" />
        {/* 内容骨架 */}
        <div className="space-y-3 p-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-x-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-7 w-16 rounded-full" />
            </div>
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-8 w-20 rounded-xl" />
          </div>
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  );

  // 加载更多骨架屏
  const LoadingMoreSkeleton = () => (
    <div className="bg-background border-primary/10 min-w-[280px] rounded-xl border">
      <div className="p-0">
        <Skeleton className="h-32 rounded-t-lg" />
        <div className="space-y-3 p-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-x-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-7 w-16 rounded-full" />
            </div>
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-8 w-20 rounded-xl" />
          </div>
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  );

  // 无数据状态组件
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-muted mb-4 rounded-full p-4">
        <Users className="text-muted-foreground h-8 w-8" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">{t('no_data')}</h3>
      <p className="text-muted-foreground">{t('no_campaigns_available')}</p>
    </div>
  );

  // 错误状态组件
  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-destructive/10 mb-4 rounded-full p-4">
        <DollarSign className="text-destructive h-8 w-8" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">{t('error_loading_campaigns')}</h3>
      <p className="text-muted-foreground mb-4">{error}</p>
      <Button onClick={() => fetchCampaigns(1, false)} variant="outline">
        {t('btn_retry')}
      </Button>
    </div>
  );

  const openAutoPostModal = (
    e: React.MouseEvent<HTMLButtonElement>,
    campaign: IMarketEventsGetActivesLoginList
  ) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('自动发布按钮点击', campaign);
  };

  return (
    <Card className="gap-2 rounded-lg border-1 p-4 shadow-none">
      {/* 控制按钮区域 */}
      <div className="flex items-center justify-between">
        {/* 左右滑动按钮 */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollLeft}
            disabled={!canScrollLeft || loading}
            className={cn(
              'h-5 w-5 p-0',
              canScrollLeft && !loading
                ? 'bg-muted-foreground/5 hover:bg-primary/10 text-muted-foreground hover:text-primary'
                : 'bg-muted-foreground/5 text-muted-foreground/50 cursor-not-allowed'
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollRight}
            disabled={!canScrollRight || loading}
            className={cn(
              'h-5 w-5 p-0',
              canScrollRight && !loading
                ? 'bg-muted-foreground/5 hover:bg-primary/10 text-muted-foreground hover:text-primary'
                : 'bg-muted-foreground/5 text-muted-foreground/50 cursor-not-allowed'
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Auto-play All 滑块 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label
              htmlFor="airplane-mode"
              className={cn('text-sm', isAutoPlay ? 'text-primary' : 'text-muted-foreground')}
            >
              {t('auto_play_all')}
            </Label>
            <Switch
              defaultChecked={isAutoPlay}
              id="airplane-mode"
              checked={isAutoPlay}
              onCheckedChange={(checked) => setIsAutoPlay(checked === true)}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      <CardContent
        ref={scrollContainerRef}
        className="scrollbar-hide flex gap-4 overflow-x-auto p-0 pb-1"
      >
        {loading ? (
          // 骨架屏加载状态
          Array.from({ length: 3 }).map((_, index) => <CampaignSkeleton key={index} />)
        ) : error ? (
          // 错误状态
          <div className="w-full">
            <ErrorState />
          </div>
        ) : campaigns.length === 0 ? (
          // 无数据状态
          <div className="w-full">
            <EmptyState />
          </div>
        ) : (
          // 正常数据渲染
          <>
            {campaigns.map((campaign) => (
              <>
                <div className="bg-background border-primary/10 hover:shadow-primary/20 min-w-[280px] rounded-xl border hover:shadow-sm">
                  <div className="p-0">
                    {/* 活动头部图片区域 */}
                    <div className="relative h-32 overflow-hidden rounded-t-lg">
                      <img
                        src={campaign.cover_img}
                        alt={campaign.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-image.png'; // 设置默认图片
                        }}
                      />
                      {/* 参与人数标签 */}
                      <div className="bg-background/80 absolute top-3 right-3 rounded-full px-2 py-1 backdrop-blur-sm">
                        <div className="text-muted-foreground flex items-center gap-1 pl-2 text-xs">
                          {Array.from({ length: Math.min(5, campaign.joins.length) }).map(
                            (_, index) => (
                              <Avatar
                                className="border-background -ml-3 size-3 min-w-3 overflow-hidden rounded-full border-[1px] sm:size-4 sm:min-w-4"
                                key={index}
                              >
                                <AvatarImage
                                  src={campaign.joins[index] || ''}
                                  alt={t('avatar')}
                                  className="size-full"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = defaultAvatar.src;
                                  }}
                                />
                                <AvatarFallback className="bg-muted text-foreground text-xs">
                                  {campaign.project.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            )
                          )}
                          <span>
                            {campaign.participants} {t('participants')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 活动内容 */}
                    <div className="space-y-3 p-3">
                      <div className="flex flex-col gap-2">
                        <dl className="flex items-center justify-between gap-x-3 text-base font-medium">
                          <dt className="truncate">{campaign.title}</dt>
                          <dd className="bg-accent sm:text-md flex h-7 items-center gap-x-1 rounded-full px-2 text-sm">
                            {campaign.is_verified ? `$${campaign.reward_amount}` : t('unverified')}
                            {campaign.token_type && campaign.chain_type && (
                              <TokenIcon
                                chainType={campaign.chain_type}
                                tokenType={campaign.token_type}
                                type={campaign.token_type as string}
                                className="size-4"
                              />
                            )}
                          </dd>
                        </dl>
                        <p className="text-muted-foreground/80 line-clamp-3 text-sm">
                          {campaign.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        {/* 品牌信息 */}
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={campaign.project.logo} alt={campaign.project.name} />
                            <AvatarFallback className="bg-gray-200 text-xs">
                              {campaign.project.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="max-w-[100px] truncate text-sm">
                            {campaign.project.name}
                          </span>
                        </div>

                        {/* 自动发布按钮 */}
                        <Button
                          variant={campaign.is_auto_join ? 'default' : 'outline'}
                          size="sm"
                          className="h-auto w-auto !rounded-xl px-2 py-0.5"
                          onClick={(e) => openAutoPostModal(e, campaign)}
                        >
                          {t('auto_post')} {campaign.is_auto_join ? t('on') : t('off')}
                        </Button>
                      </div>

                      {/* 奖励信息 */}
                      <div className="bg-primary/5 flex items-center justify-center gap-2 rounded-full p-3">
                        <span className="text-md flex items-center gap-1">
                          {campaign.reward_amount}
                          {campaign.token_type && campaign.chain_type && (
                            <TokenIcon
                              chainType={campaign.chain_type}
                              tokenType={campaign.token_type}
                              type={campaign.token_type as string}
                              className="size-4"
                            />
                          )}
                        </span>
                        <span className="text-sm">{t('rewards')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ))}

            {/* 加载更多骨架屏 */}
            {loadingMore && (
              <>
                <LoadingMoreSkeleton />
                <LoadingMoreSkeleton />
              </>
            )}

            {/* 没有更多数据提示 */}
            {!hasMore && campaigns.length > 0 && !loadingMore && (
              <div className="bg-muted/50 flex min-w-[280px] items-center justify-center rounded-xl border border-dashed p-8">
                <div className="text-center">
                  <div className="text-muted-foreground mb-2 text-sm">{t('no_more_campaigns')}</div>
                  <div className="text-muted-foreground/70 text-xs">{t('scroll_to_load_more')}</div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
