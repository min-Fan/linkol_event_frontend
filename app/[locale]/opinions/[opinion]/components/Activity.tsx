'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Skeleton } from '@shadcn/components/ui/skeleton';
import { cn } from '@shadcn/lib/utils';
import { ChevronLeft, ChevronRight, ExternalLink, ScreenShare } from 'lucide-react';
import defaultAvatar from '@assets/image/avatar.png';
import { formatTimeAgoShort } from '@libs/utils';
import { ScreenShareIcon } from '@assets/svg';

// 活动数据类型定义
interface ActivityItem {
  id: string;
  user_name: string;
  profile_image_url?: string;
  action: 'bought' | 'sold';
  quantity: number;
  position_type: 'yes' | 'no';
  condition: string; // 如 "No change", "50+ bps decrease"
  price: number;
  total_value: number;
  created_at: string;
  link_url?: string;
}

// 格式化货币
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// 格式化价格
const formatPrice = (price: number): string => {
  return `$${price.toFixed(1)}`;
};

// 活动项骨架屏组件
const ActivityItemSkeleton = () => {
  return (
    <div className="flex w-full items-center gap-3 py-3">
      <Skeleton className="size-10 min-w-10 rounded-full" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-4" />
      </div>
    </div>
  );
};

// 单个活动项组件
const ActivityItem = ({ activity }: { activity: ActivityItem }) => {
  const quantityFormatted = new Intl.NumberFormat('en-US').format(activity.quantity);
  const positionText = activity.position_type.toUpperCase();
  const positionColor = activity.position_type === 'yes' ? 'text-green-500' : 'text-red-500';

  return (
    <div className="bg-muted-foreground/5 flex w-full items-center gap-3 rounded-lg p-2 hover:bg-muted-foreground/10">
      {/* 用户头像 */}
      <div className="bg-muted-foreground/10 size-6 min-w-6 overflow-hidden rounded-full sm:size-8 sm:min-w-8">
        <img
          src={activity.profile_image_url || defaultAvatar.src}
          alt={activity.user_name || 'User'}
          className="h-full w-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = defaultAvatar.src;
          }}
        />
      </div>

      {/* 活动描述 */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-sm">
          <span className="font-medium">{activity.user_name}</span> {activity.action}{' '}
          <span className="font-medium">{quantityFormatted}</span>{' '}
          <span className={cn('font-bold', positionColor)}>{positionText}</span> for{' '}
          {activity.condition} at {formatPrice(activity.price)}
          <span className="text-muted-foreground/60">({formatCurrency(activity.total_value)})</span>
        </p>
      </div>

      {/* 时间戳和链接图标 */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground/60 text-xs whitespace-nowrap sm:text-sm">
          {formatTimeAgoShort(activity.created_at)}
        </span>
        {activity.link_url && (
          <a
            href={activity.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 flex items-center justify-center"
          >
            <ScreenShareIcon className="text-primary size-4" />
          </a>
        )}
      </div>
    </div>
  );
};

// 空状态组件
const EmptyState = () => {
  return (
    <div className="flex h-80 w-full flex-col items-center justify-center px-4 py-16 text-center">
      <h3 className="text-muted-foreground/60 mb-2 text-xl font-semibold">No activities found</h3>
      <p className="text-md text-muted-foreground/60 mb-2 max-w-md">
        Activities will appear here when users make trades.
      </p>
    </div>
  );
};

// 分页组件（复用 PostToEarn 的逻辑）
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}) => {
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <button
        onClick={() => !disabled && canPrev && onPageChange(currentPage - 1)}
        disabled={disabled || !canPrev}
        className={cn(
          'bg-muted-foreground/5 hover:bg-muted-foreground/10 text-muted-foreground/50 flex h-8 w-8 items-center justify-center rounded-sm backdrop-blur-sm transition-all',
          canPrev && !disabled ? 'text-muted-foreground' : 'cursor-not-allowed'
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {visiblePages.map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="text-muted-foreground flex h-8 w-8 items-center justify-center text-sm">
              ...
            </span>
          ) : (
            <button
              onClick={() => !disabled && onPageChange(page as number)}
              disabled={disabled}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-sm text-sm transition-all',
                page === currentPage
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted-foreground/5 hover:bg-muted-foreground/10 text-muted-foreground/50 hover:text-muted-foreground',
                disabled && 'cursor-not-allowed'
              )}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}

      <button
        onClick={() => !disabled && canNext && onPageChange(currentPage + 1)}
        disabled={disabled || !canNext}
        className={cn(
          'bg-muted-foreground/5 hover:bg-muted-foreground/10 text-muted-foreground/50 flex h-8 w-8 items-center justify-center rounded-sm backdrop-blur-sm transition-all',
          canNext && !disabled ? 'text-muted-foreground' : 'cursor-not-allowed'
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

// 模拟数据 - 实际使用时应该从 API 获取
const mockActivities: ActivityItem[] = [
  {
    id: '1',
    user_name: 'Violet-Stepaunt',
    profile_image_url: defaultAvatar.src,
    action: 'bought',
    quantity: 2000,
    position_type: 'no',
    condition: 'No change',
    price: 68,
    total_value: 1360,
    created_at: new Date(Date.now() - 22 * 1000).toISOString(), // 22 seconds ago
    link_url: '#',
  },
  {
    id: '2',
    user_name: 'classified',
    profile_image_url: defaultAvatar.src,
    action: 'bought',
    quantity: 58,
    position_type: 'no',
    condition: '50+ bps decrease',
    price: 97.8,
    total_value: 157,
    created_at: new Date(Date.now() - 30 * 1000).toISOString(), // 30 seconds ago
    link_url: '#',
  },
  {
    id: '3',
    user_name: 'Violet-Stepaunt',
    profile_image_url: defaultAvatar.src,
    action: 'bought',
    quantity: 30,
    position_type: 'yes',
    condition: 'No change',
    price: 68,
    total_value: 1360,
    created_at: new Date(Date.now() - 22 * 1000).toISOString(), // 22 seconds ago
    link_url: '#',
  },
  {
    id: '4',
    user_name: 'classified',
    profile_image_url: defaultAvatar.src,
    action: 'bought',
    quantity: 100,
    position_type: 'yes',
    condition: 'No change',
    price: 68,
    total_value: 6800,
    created_at: new Date(Date.now() - 1 * 60 * 1000).toISOString(), // 1 minute ago
    link_url: '#',
  },
  {
    id: '5',
    user_name: 'Violet-Stepaunt',
    profile_image_url: defaultAvatar.src,
    action: 'bought',
    quantity: 500,
    position_type: 'no',
    condition: '50+ bps decrease',
    price: 97.8,
    total_value: 48900,
    created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
    link_url: '#',
  },
  {
    id: '6',
    user_name: 'classified',
    profile_image_url: defaultAvatar.src,
    action: 'bought',
    quantity: 75,
    position_type: 'yes',
    condition: 'No change',
    price: 68,
    total_value: 5100,
    created_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(), // 3 minutes ago
    link_url: '#',
  },
  {
    id: '7',
    user_name: 'Violet-Stepaunt',
    profile_image_url: defaultAvatar.src,
    action: 'bought',
    quantity: 150,
    position_type: 'no',
    condition: 'No change',
    price: 68,
    total_value: 10200,
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    link_url: '#',
  },
  {
    id: '8',
    user_name: 'classified',
    profile_image_url: defaultAvatar.src,
    action: 'bought',
    quantity: 200,
    position_type: 'yes',
    condition: '50+ bps decrease',
    price: 97.8,
    total_value: 19560,
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
    link_url: '#',
  },
];

interface ActivityProps {
  activities?: ActivityItem[];
  onFetchActivities?: (
    page: number
  ) => Promise<{ list: ActivityItem[]; total: number; current_page: number }>;
}

export default function Activity({ activities: propActivities, onFetchActivities }: ActivityProps) {
  const [activities, setActivities] = useState<ActivityItem[]>(propActivities || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10; // 每页显示10个活动

  // 获取活动数据
  const fetchActivities = useCallback(
    async (page: number = 1) => {
      try {
        setLoading(true);
        setError(null);

        if (onFetchActivities) {
          // 如果有传入的获取函数，使用它
          const response = await onFetchActivities(page);
          setActivities(response.list || []);
          setCurrentPage(response.current_page || 1);
          setTotalPages(Math.ceil((response.total || 0) / itemsPerPage));
        } else {
          // 否则使用模拟数据
          // 模拟分页：从 mockActivities 中取对应页的数据
          const startIndex = (page - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const pageActivities = mockActivities.slice(startIndex, endIndex);
          setActivities(pageActivities);
          setCurrentPage(page);
          // 假设总共有足够的数据，这里用 mockActivities 的长度模拟
          setTotalPages(Math.ceil(mockActivities.length / itemsPerPage));
        }
      } catch (err) {
        console.error('Failed to fetch activities:', err);
        setError('Failed to fetch activities');
        setActivities([]);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    },
    [onFetchActivities]
  );

  useEffect(() => {
    fetchActivities(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (page: number) => {
    if (page !== currentPage) {
      fetchActivities(page);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: itemsPerPage }).map((_, index) => (
          <ActivityItemSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-80 items-center justify-center py-16">
        <div className="text-center">
          <div className="text-muted-foreground mb-4">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-auto flex-col gap-4">
      {activities.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* 活动列表 */}
          <div className="flex flex-col gap-2">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>

          {/* 分页组件 */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              disabled={loading}
            />
          )}
        </>
      )}
    </div>
  );
}
