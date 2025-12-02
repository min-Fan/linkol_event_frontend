'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@shadcn/components/ui/skeleton';
import { getBetList, IBetListItem } from '@libs/request';
import { Link } from '@libs/i18n/navigation';
import PagesRoute from '@constants/routes';
import { Verified } from '@assets/svg';

interface OpinionCardData {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    verified: boolean;
  };
  question: string;
  reply: {
    author: {
      name: string;
      handle: string;
      avatar: string;
      verified: boolean;
    };
    date: string;
    content: string;
  };
  poll: {
    yes: number;
    no: number;
  };
  volume: string;
}

// 将 API 数据转换为组件数据格式
const transformBetDataToOpinionData = (betItem: IBetListItem, index: number): OpinionCardData => {
  // 格式化日期为 "Jun 22" 格式
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return {
    id: betItem.attitude.bet_id?.toString() || betItem.id?.toString() || `1`,
    author: {
      name: betItem.topic.name,
      handle: betItem.topic.screen_name,
      avatar: betItem.topic.icon,
      verified: false, // API 数据中没有 verified 字段，可以根据需要调整
    },
    question: betItem.topic.content,
    reply: {
      author: {
        name: betItem.attitude.name,
        handle: betItem.attitude.screen_name,
        avatar: betItem.attitude.icon,
        verified: false, // API 数据中没有 verified 字段，可以根据需要调整
      },
      date: formatDate(new Date()),
      content: betItem.attitude.content,
    },
    poll: {
      yes: betItem.yes_brand_value,
      no: betItem.no_brand_value,
    },
    volume: `$${betItem.commission.toLocaleString()}`,
  };
};

function OpinionCard({ data }: { data: OpinionCardData }) {
  const t = useTranslations('common');
  const totalVotes = data.poll.yes + data.poll.no;
  const yesPercentage = totalVotes > 0 ? (data.poll.yes / totalVotes) * 100 : 0;
  const noPercentage = totalVotes > 0 ? (data.poll.no / totalVotes) * 100 : 0;
  const yesPct = Math.round(yesPercentage);
  const noPct = Math.round(noPercentage);

  // 格式化头像显示
  const authorAvatar = data.author.avatar || '';
  const replyAvatar = data.reply.author.avatar || '';

  // 格式化交易量
  const volumeNumber = parseFloat(data.volume.replace(/[$,]/g, '')) || 0;
  const formattedVolume =
    volumeNumber >= 1000000
      ? `$${(volumeNumber / 1000000).toFixed(1)}m`
      : volumeNumber >= 1000
        ? `$${(volumeNumber / 1000).toFixed(1)}k`
        : data.volume;

  return (
    <Link
      href={`${PagesRoute.OPINIONS}/${data.id}`}
      className="group border-border bg-background hover:border-primary/50 hover:shadow-primary/5 dark:hover:shadow-primary/10 relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border p-5 transition-all hover:shadow-xl"
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={data.author.name}
                className="border-border h-10 w-10 rounded-full border object-cover"
              />
            ) : (
              <div className="border-border bg-muted flex h-10 w-10 items-center justify-center rounded-full border">
                <div className="bg-muted-foreground/20 h-6 w-6 rounded-full"></div>
              </div>
            )}
            {data.author.verified && (
              <Verified className="text-primary absolute -right-1 -bottom-1 h-4 w-4" />
            )}
          </div>
          <div>
            <h3 className="text-foreground group-hover:text-primary font-semibold transition-colors">
              {data.author.name}
            </h3>
            <p className="text-muted-foreground text-xs">
              @{data.author.handle} • {data.reply.date}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-5 space-y-3">
        <p className="text-foreground/90 line-clamp-2 text-sm leading-relaxed font-medium">
          {data.question}
        </p>
        <div className="border-border bg-muted/50 text-muted-foreground rounded-xl border p-3 text-sm italic">
          <div className="mb-2 flex items-center gap-2">
            {replyAvatar ? (
              <img
                src={replyAvatar}
                alt={data.reply.author.name}
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-pink-500"></div>
            )}
            <span className="text-foreground/80 text-xs font-medium">
              {data.reply.author.name} @{data.reply.author.handle}
            </span>
          </div>
          "{data.reply.content}"
        </div>
      </div>

      {/* Probability Bar */}
      <div className="mt-auto mb-4">
        <div className="mb-2 flex justify-between text-sm font-semibold">
          <span className="text-primary">Yes {yesPct}%</span>
          <span className="text-destructive">No {noPct}%</span>
        </div>
        <div className="bg-muted dark:bg-muted/50 flex h-3 w-full overflow-hidden rounded-full">
          <div
            style={{ width: `${yesPercentage}%` }}
            className="from-primary bg-gradient-to-r to-indigo-500 transition-all"
          />
          <div
            style={{ width: `${noPercentage}%` }}
            className="bg-muted-foreground/20 dark:bg-muted-foreground/30"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <span className="font-mono font-medium">
          {formattedVolume} {t('vol')}
        </span>
      </div>
    </Link>
  );
}

// 骨架屏组件
function OpinionCardSkeleton() {
  return (
    <div className="group border-border bg-background relative overflow-hidden rounded-2xl border p-5">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-5 space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="border-border bg-muted/50 rounded-xl border p-3">
          <div className="mb-2 flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      </div>

      {/* Probability Bar */}
      <div className="mb-4">
        <div className="mb-2 flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export default function HotOpinions() {
  const t = useTranslations('common');

  // 获取 bet 列表数据
  const {
    data: betListResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['betList'],
    queryFn: async () => {
      const response = await getBetList();
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5分钟内数据被认为是新鲜的
    gcTime: 10 * 60 * 1000, // 10分钟后清除缓存
    retry: 2, // 失败时重试2次
  });

  // 转换数据格式
  const opinions: OpinionCardData[] = React.useMemo(() => {
    if (!betListResponse?.data?.list) {
      return [];
    }
    return betListResponse.data.list.map((betItem, index) =>
      transformBetDataToOpinionData(betItem, index)
    );
  }, [betListResponse]);

  return (
    <div className="bg-background box-border space-y-4 rounded-3xl p-4 backdrop-blur-sm sm:p-6">
      {/* Header */}
      <div className="flex flex-col items-start gap-0 sm:gap-4 sm:flex-row sm:items-center">
        <h2 className="text-xl font-bold">{t('hot_opinions')}</h2>
        <p className="text-primary text-base">{t('share_your_views_to_earn_usdt')}</p>
      </div>

      {/* Loading State - 骨架屏 */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, index) => (
            <OpinionCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex items-center justify-center py-8">
          <div className="text-destructive">{t('load_failed_retry')}</div>
        </div>
      )}

      {/* Grid */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {opinions.length > 0 ? (
            opinions.map((opinion) => <OpinionCard key={opinion.id} data={opinion} />)
          ) : (
            <div className="col-span-2 flex items-center justify-center py-8">
              <div className="text-muted-foreground">{t('no_data_available')}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
