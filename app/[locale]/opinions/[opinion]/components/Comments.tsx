'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Skeleton } from '@shadcn/components/ui/skeleton';
import { Like, Message, ReTwet, Verified } from '@assets/svg';
import { Badge } from '@shadcn/components/ui/badge';
import { cn } from '@shadcn/lib/utils';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import defaultAvatar from '@assets/image/avatar.png';
import { formatTimeAgoShort } from '@libs/utils';

// 评论数据类型定义
interface CommentItem {
  id: string;
  name: string;
  screen_name?: string;
  profile_image_url?: string;
  is_verified?: boolean;
  comment_text: string;
  created_at?: string;
  like_count: number;
  retweet_count: number;
  reply_count: number;
  position?: number; // 持仓数量，如 200 或 420
  position_type?: 'yes' | 'no'; // 持仓类型：yes 或 no
  link?: string; // 评论链接
}

// 评论卡片骨架屏组件
const CommentItemSkeleton = () => {
  return (
    <div className="bg-background border-border flex w-full flex-col gap-3 rounded-2xl border p-4">
      <div className="flex w-full items-start justify-between">
        <div className="flex w-full flex-1 items-center gap-2">
          <Skeleton className="size-10 min-w-10 rounded-full sm:size-12 sm:min-w-12" />
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Skeleton className="h-4 w-24 sm:h-5 sm:w-32" />
            <Skeleton className="h-4 w-4" />
          </div>
        </div>
        <Skeleton className="h-3 w-16 sm:h-4 sm:w-20" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="border-border mt-2 w-full border-t"></div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
};

// 单个评论卡片组件
const CommentItem = ({ comment }: { comment: CommentItem }) => {
  const t = useTranslations('common');
  const badgeText = comment.position ? `${comment.position} No change` : '';

  return (
    <div className="bg-background border-border flex w-full flex-col gap-3 rounded-2xl border p-4 cursor-pointer hover:border-primary/20" onClick={() => window.open(comment.link, '_blank')}>
      <div className="flex w-full items-start justify-between">
        <div className="flex w-full flex-1 items-center gap-2">
          <div className="bg-muted-foreground/10 size-9 min-w-9 overflow-hidden rounded-full sm:size-12 sm:min-w-12">
            <img
              src={comment.profile_image_url || defaultAvatar.src}
              alt={comment.name || 'Profile'}
              className="h-full w-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = defaultAvatar.src;
              }}
            />
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="sm:text-md line-clamp-1 truncate text-sm font-medium">
              {comment.name || 'Unknown User'}
            </span>
            {comment.is_verified && <Verified className="size-4 min-w-4" />}
            {comment.screen_name && (
              <span className="text-muted-foreground/60 text-xs">@{comment.screen_name}</span>
            )}
          </div>
        </div>
        {comment.created_at && (
          <span className="text-xs whitespace-nowrap sm:text-sm">
            {formatTimeAgoShort(comment.created_at)}
          </span>
        )}
      </div>
      <p className="sm:text-md text-muted-foreground/60 line-clamp-2 text-sm">
        {comment.comment_text}
      </p>
      <div className="border-border/60 mt-2 w-full border-t"></div>
      <div className="sm:text-md flex items-center justify-end gap-2 text-sm sm:gap-4">
        <div className="text-muted-foreground/60 flex items-center gap-0.5 sm:gap-1">
          <Like className="size-3" />
          <span>{comment.like_count || 0}</span>
        </div>
        <div className="text-muted-foreground/60 flex items-center gap-0.5 sm:gap-1">
          <ReTwet className="size-3" />
          <span>
            {comment.retweet_count >= 1000
              ? `${(comment.retweet_count / 1000).toFixed(1)}k`
              : comment.retweet_count || 0}
          </span>
        </div>
        <div className="text-muted-foreground/60 flex items-center gap-0.5 sm:gap-1">
          <Message className="size-3" />
          <span>{comment.reply_count || 0}</span>
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
      <h3 className="text-muted-foreground/60 mb-2 text-xl font-semibold">{t('no_comments_found')}</h3>
      <p className="text-md text-muted-foreground/60 mb-2 max-w-md">{t('be_first_to_comment')}</p>
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
const mockComments: CommentItem[] = [
  {
    id: '1',
    name: 'Crypto Analyst',
    screen_name: 'crypto_analyst',
    profile_image_url: defaultAvatar.src,
    is_verified: true,
    comment_text:
      "As global macroeconomic uncertainty grows, more investors are turning to safe-haven assets. Bitcoin's status as 'digital gold' continues to solidify.",
    created_at: new Date(Date.now() - 22 * 60 * 1000).toISOString(), // 22 minutes ago
    like_count: 634,
    retweet_count: 1700,
    reply_count: 523,
    position: 200,
    position_type: 'no',
  },
  {
    id: '2',
    name: 'Crypto Analyst',
    screen_name: 'crypto_analyst',
    profile_image_url: defaultAvatar.src,
    is_verified: true,
    comment_text:
      "As global macroeconomic uncertainty grows, more investors are turning to safe-haven assets. Bitcoin's status as 'digital gold' continues to solidify.",
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    like_count: 634,
    retweet_count: 1700,
    reply_count: 523,
    position: 420,
    position_type: 'no',
  },
  {
    id: '3',
    name: 'Crypto Analyst',
    screen_name: 'crypto_analyst',
    profile_image_url: defaultAvatar.src,
    is_verified: true,
    comment_text:
      "As global macroeconomic uncertainty grows, more investors are turning to safe-haven assets. Bitcoin's status as 'digital gold' continues to solidify.",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    like_count: 634,
    retweet_count: 1700,
    reply_count: 523,
    position: 200,
    position_type: 'no',
  },
  {
    id: '4',
    name: 'Crypto Analyst',
    screen_name: 'crypto_analyst',
    profile_image_url: defaultAvatar.src,
    is_verified: true,
    comment_text:
      "As global macroeconomic uncertainty grows, more investors are turning to safe-haven assets. Bitcoin's status as 'digital gold' continues to solidify.",
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    like_count: 634,
    retweet_count: 1700,
    reply_count: 523,
    position: 200,
    position_type: 'yes',
  },
  {
    id: '5',
    name: 'Crypto Analyst',
    screen_name: 'crypto_analyst',
    profile_image_url: defaultAvatar.src,
    is_verified: true,
    comment_text:
      "As global macroeconomic uncertainty grows, more investors are turning to safe-haven assets. Bitcoin's status as 'digital gold' continues to solidify.",
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    like_count: 634,
    retweet_count: 1700,
    reply_count: 523,
    position: 420,
    position_type: 'yes',
  },
  {
    id: '6',
    name: 'Crypto Analyst',
    screen_name: 'crypto_analyst',
    profile_image_url: defaultAvatar.src,
    is_verified: true,
    comment_text:
      "As global macroeconomic uncertainty grows, more investors are turning to safe-haven assets. Bitcoin's status as 'digital gold' continues to solidify.",
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    like_count: 634,
    retweet_count: 1700,
    reply_count: 523,
    position: 200,
    position_type: 'no',
  },
];

interface CommentsProps {
  comments?: CommentItem[];
  onFetchComments?: (
    page: number,
    pageSize?: number
  ) => Promise<{ list: CommentItem[]; total: number; current_page: number; total_pages: number }>;
  betId?: string;
  pageSize?: number; // 每页数量，默认20
}

export default function Comments({ 
  comments: propComments, 
  onFetchComments, 
  betId,
  pageSize = 20 
}: CommentsProps) {
  const t = useTranslations('common');
  const [comments, setComments] = useState<CommentItem[]>(propComments || []);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 获取评论数据
  const fetchCommentsData = useCallback(
    async (page: number = 1, append: boolean = false) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        setError(null);

        if (onFetchComments) {
          // 如果有传入的获取函数，使用它
          const response = await onFetchComments(page, pageSize);
          const newComments = response.list || [];
          
          if (append) {
            // 追加新数据
            setComments((prev) => [...prev, ...newComments]);
          } else {
            // 替换数据（首次加载或刷新）
            setComments(newComments);
          }
          
          const newCurrentPage = response.current_page || page;
          const newTotalPages = response.total_pages || Math.ceil((response.total || 0) / pageSize);
          
          setCurrentPage(newCurrentPage);
          setTotalPages(newTotalPages);
          setTotal(response.total || 0);
          
          // 判断是否还有更多数据：当前页小于总页数
          setHasMore(newCurrentPage < newTotalPages);
        } else {
          // 否则使用模拟数据
          // 模拟分页：从 mockComments 中取对应页的数据
          const startIndex = (page - 1) * pageSize;
          const endIndex = startIndex + pageSize;
          const pageComments = mockComments.slice(startIndex, endIndex);
          
          if (append) {
            setComments((prev) => [...prev, ...pageComments]);
          } else {
            setComments(pageComments);
          }
          
          setCurrentPage(page);
          setTotalPages(Math.ceil(mockComments.length / pageSize));
          setTotal(mockComments.length);
          setHasMore(endIndex < mockComments.length);
        }
      } catch (err) {
        console.error('Failed to fetch comments:', err);
        setError('Failed to fetch comments');
        if (!append) {
          setComments([]);
          setTotalPages(0);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [onFetchComments, pageSize, comments.length]
  );

  // 首次加载
  useEffect(() => {
    fetchCommentsData(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 使用 Intersection Observer 实现滚动加载
  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;

    if (!loadMoreElement || !hasMore) {
      // 如果没有更多数据，断开观察
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      return;
    }

    // 断开旧的 observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // 创建新的 observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
          const nextPage = currentPage + 1;
          if (nextPage <= totalPages) {
            fetchCommentsData(nextPage, true);
          }
        }
      },
      {
        threshold: 0.1, // 当元素10%可见时触发
        rootMargin: '100px', // 提前100px触发
      }
    );

    observerRef.current.observe(loadMoreElement);

    // 清理函数
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [hasMore, loadingMore, loading, currentPage, totalPages, fetchCommentsData]);

  if (loading && comments.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: pageSize }).map((_, index) => (
          <CommentItemSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error && comments.length === 0) {
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
      {comments.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* 评论列表 */}
          <div className="flex flex-col gap-4">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>

          {/* 滚动加载触发器 */}
          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-4">
              {loadingMore && (
                <div className="flex flex-col gap-2 items-center">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <CommentItemSkeleton key={`loading-${index}`} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 没有更多数据提示 */}
          {!hasMore && comments.length > 0 && (
            <div className="text-center text-muted-foreground/60 py-4 text-sm">
              {t('all_comments_loaded')} ({total})
            </div>
          )}

          {/* 错误提示（加载更多时出错） */}
          {error && comments.length > 0 && (
            <div className="text-center text-destructive py-4 text-sm">
              {error}
            </div>
          )}
        </>
      )}
    </div>
  );
}
