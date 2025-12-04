'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Skeleton } from '@shadcn/components/ui/skeleton';
import { Like, Message, ReTwet, Verified } from '@assets/svg';
import { Badge } from '@shadcn/components/ui/badge';
import { cn } from '@shadcn/lib/utils';
import { useLocale, useTranslations } from 'next-intl';
import { formatMonthShortDay } from '../../../m/components/Tweet';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import defaultAvatar from '@assets/image/avatar.png';

// 推文数据类型定义
interface PostItem {
  id: string;
  name: string;
  screen_name: string;
  profile_image_url?: string;
  is_verified?: boolean;
  tweet_text: string;
  tweet_created_at: string;
  like_count: number;
  retweet_count: number;
  reply_count: number;
  is_real_user?: boolean;
  join_type?: string;
}

// 推文卡片骨架屏组件
const PostItemSkeleton = () => {
  return (
    <div className="bg-background border-primary/10 shadow-primary/5 flex h-full w-full flex-col gap-2 rounded-2xl border-2 p-2 shadow-sm sm:gap-4 sm:rounded-3xl sm:p-4">
      <div className="flex w-full items-start justify-between">
        <div className="flex w-full flex-1 items-center gap-2">
          <Skeleton className="size-10 min-w-10 rounded-full sm:size-12 sm:min-w-12" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex w-full flex-1 items-center justify-between gap-2">
              <div className="flex w-full items-center gap-2">
                <Skeleton className="h-4 w-24 sm:h-5 sm:w-32" />
                <Skeleton className="h-4 w-4" />
                <div className="ml-auto">
                  <Skeleton className="h-3 w-16 sm:h-4 sm:w-20" />
                </div>
              </div>
            </div>
            <Skeleton className="h-3 w-20 sm:h-4 sm:w-24" />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>
      <div className="border-border mt-auto w-full border-t"></div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1">
            <Skeleton className="h-3 w-3" />
            <Skeleton className="h-3 w-6" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-3 w-3" />
            <Skeleton className="h-3 w-6" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-3 w-3" />
            <Skeleton className="h-3 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

// 单个推文卡片组件
const PostItem = ({ post }: { post: PostItem }) => {
  const t = useTranslations('common');
  const locale = useLocale();
  return (
    <div className="border-primary/10 shadow-primary/5 hover:border-primary/20 flex h-full w-full flex-col gap-2 rounded-2xl border-2 p-2 shadow-sm hover:shadow-md sm:gap-4 sm:rounded-3xl sm:p-4">
      <div className="flex w-full items-start justify-between">
        <div className="flex w-full flex-1 items-center gap-2">
          <div className="bg-muted-foreground/10 size-10 min-w-10 overflow-hidden rounded-full sm:size-12 sm:min-w-12">
            <img
              src={post.profile_image_url || defaultAvatar.src}
              alt={post.name || 'Profile'}
              className="h-full w-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = defaultAvatar.src;
              }}
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-0 sm:gap-0">
            <div className="flex w-full flex-1 items-center justify-between gap-2 text-sm sm:text-base">
              <div className="flex w-full items-center">
                <div className="flex w-full flex-1 items-center gap-2">
                  <span className="text-md line-clamp-1 truncate sm:text-base">
                    {post.name || t('unknown_user')}
                  </span>
                  {post.is_verified && <Verified className="size-4 min-w-4" />}
                  <span className="ml-auto text-xs whitespace-nowrap sm:text-base">
                    {formatMonthShortDay(post.tweet_created_at, locale)}
                  </span>
                </div>
              </div>
            </div>
            <span className="text-muted-foreground sm:text-md line-clamp-1 truncate text-sm">
              @{post.screen_name || 'unknown'}
            </span>
          </div>
        </div>
      </div>
      <p className="sm:text-md text-muted-foreground/90 line-clamp-4 text-sm">{post.tweet_text}</p>
      <div className="border-border mt-auto w-full border-t"></div>
      <div className="flex items-center justify-between">
        <div className="sm:text-md flex items-center gap-2 text-sm sm:gap-4">
          <div className="text-muted-foreground/90 flex items-center gap-0.5 sm:gap-1">
            <Like className="size-3" />
            <span>{post.like_count || 0}</span>
          </div>
          <div className="text-muted-foreground/90 flex items-center gap-0.5 sm:gap-1">
            <ReTwet className="size-3" />
            <span>{post.retweet_count || 0}</span>
          </div>
          <div className="text-muted-foreground/90 flex items-center gap-0.5 sm:gap-1">
            <Message className="size-3" />
            <span>{post.reply_count || 0}</span>
          </div>
        </div>
        <div className="sm:text-md flex items-center gap-0.5 text-sm sm:gap-1">
          {post.is_real_user && (
            <Badge
              variant="outline"
              className="sm:text-md flex items-center gap-0.5 rounded-xl border-none text-sm sm:gap-1"
            >
              {t('real_user')}
            </Badge>
          )}
          {post.join_type === 'agent' && (
            <Badge
              variant="outline"
              className="sm:text-md flex items-center gap-0.5 rounded-xl border-none !border-green-500 !bg-green-500/10 text-sm !text-green-500 sm:gap-1"
            >
              {t('link_agent')}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

// 空状态组件
const EmptyState = () => {
  const t = useTranslations('common');
  return (
    <div className="flex h-80 w-full flex-col items-center justify-center px-4 py-16 text-center">
      <h3 className="text-muted-foreground/60 mb-2 text-xl font-semibold">
        {t('no_tweets_found')}
      </h3>
      <p className="text-md text-muted-foreground/60 mb-2 max-w-md">{t('no_tweets_description')}</p>
    </div>
  );
};

// 分页组件
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
const mockPosts: PostItem[] = [
  {
    id: '1',
    name: 'Crypto Analyst',
    screen_name: 'crypto_analyst',
    profile_image_url: defaultAvatar.src,
    is_verified: true,
    tweet_text:
      "As global macroeconomic uncertainty grows, more investors are turning to safe-haven assets. Bitcoin's status as 'digital gold' continues to solidify.",
    tweet_created_at: '2024-10-22',
    like_count: 634,
    retweet_count: 1700,
    reply_count: 523,
    is_real_user: true,
  },
  {
    id: '2',
    name: 'Crypto Analyst',
    screen_name: 'crypto_analyst',
    profile_image_url: defaultAvatar.src,
    is_verified: true,
    tweet_text:
      "As global macroeconomic uncertainty grows, more investors are turning to safe-haven assets. Bitcoin's status as 'digital gold' continues to solidify.",
    tweet_created_at: '2024-10-22',
    like_count: 634,
    retweet_count: 1700,
    reply_count: 523,
    is_real_user: true,
  },
  {
    id: '3',
    name: 'Crypto Analyst',
    screen_name: 'crypto_analyst',
    profile_image_url: defaultAvatar.src,
    is_verified: true,
    tweet_text:
      "As global macroeconomic uncertainty grows, more investors are turning to safe-haven assets. Bitcoin's status as 'digital gold' continues to solidify.",
    tweet_created_at: '2024-10-22',
    like_count: 634,
    retweet_count: 1700,
    reply_count: 523,
    is_real_user: true,
  },
  {
    id: '4',
    name: 'Crypto Analyst',
    screen_name: 'crypto_analyst',
    profile_image_url: defaultAvatar.src,
    is_verified: true,
    tweet_text:
      "As global macroeconomic uncertainty grows, more investors are turning to safe-haven assets. Bitcoin's status as 'digital gold' continues to solidify.",
    tweet_created_at: '2024-10-22',
    like_count: 634,
    retweet_count: 1700,
    reply_count: 523,
    is_real_user: true,
  },
];

interface PostToEarnProps {
  posts?: PostItem[];
  onFetchPosts?: (
    page: number
  ) => Promise<{ list: PostItem[]; total: number; current_page: number }>;
}

export default function PostToEarn({ posts: propPosts, onFetchPosts }: PostToEarnProps) {
  const [posts, setPosts] = useState<PostItem[]>(propPosts || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 4; // 每页显示4个推文

  // 获取推文数据
  const fetchPosts = useCallback(
    async (page: number = 1) => {
      try {
        setLoading(true);
        setError(null);

        if (onFetchPosts) {
          // 如果有传入的获取函数，使用它
          const response = await onFetchPosts(page);
          setPosts(response.list || []);
          setCurrentPage(response.current_page || 1);
          setTotalPages(Math.ceil((response.total || 0) / itemsPerPage));
        } else {
          // 否则使用模拟数据
          // 模拟分页：从 mockPosts 中取对应页的数据
          const startIndex = (page - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const pagePosts = mockPosts.slice(startIndex, endIndex);
          setPosts(pagePosts);
          setCurrentPage(page);
          // 假设总共有足够的数据，这里用 mockPosts 的长度模拟
          setTotalPages(Math.ceil(mockPosts.length / itemsPerPage));
        }
      } catch (err) {
        console.error('Failed to fetch posts:', err);
        setError('Failed to fetch posts');
        setPosts([]);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    },
    [onFetchPosts]
  );

  useEffect(() => {
    fetchPosts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (page: number) => {
    if (page !== currentPage) {
      fetchPosts(page);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-2 sm:p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: itemsPerPage }).map((_, index) => (
            <PostItemSkeleton key={index} />
          ))}
        </div>
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
    <div className="flex min-h-auto flex-col gap-4 p-0">
      {posts.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* 推文列表 - 2x2 网格布局 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {posts.map((post) => (
              <PostItem key={post.id} post={post} />
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
