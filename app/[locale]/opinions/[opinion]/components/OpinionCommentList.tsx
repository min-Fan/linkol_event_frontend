'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  CheckCircle2,
  Heart,
  MessageCircle,
  Share2,
  ChevronLeft,
  ChevronRight,
  ChartNoAxesColumn,
} from 'lucide-react';
import { useBetDetail } from '@hooks/useBetDetail';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@shadcn/components/ui/skeleton';
import { formatTimeAgoShort } from '@libs/utils';
import { PredictionSide } from '../types';
import defaultAvatar from '@assets/image/avatar.png';
import { ReTwet } from '@assets/svg';
import { IBetCommentItem } from '@libs/request';

type FilterType = 'ALL' | 'YES' | 'NO' | 'OTHERS';

const ITEMS_PER_PAGE = 5;

// 评论项骨架屏组件
const CommentItemSkeleton = () => {
  return (
    <div className="border-border bg-card rounded-xl border p-4">
      <div className="flex gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3.5 w-3.5 rounded-full" />
              <Skeleton className="ml-1 h-3 w-20" />
              <Skeleton className="mx-1 h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="mt-2 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="mt-3 flex items-center gap-6">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function OpinionCommentList() {
  const params = useParams();
  const opinionId = params?.opinion as string;
  const { fetchComments, commentsTotal } = useBetDetail(opinionId);
  const t = useTranslations('common');

  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // 获取评论数据
  useEffect(() => {
    if (fetchComments) {
      setLoading(true);
      fetchComments(1, 100)
        .then((result) => {
          console.log(result.list);
          // 转换数据格式
          // attitude: 0 = YES, 1 = NO, 2 = OTHER
          const transformed = result.list.map((item: any) => ({
            id: item.name,
            user: {
              id: item.name,
              name: item.name,
              handle: item.screen_name ? `@${item.screen_name}` : '',
              avatar: item.icon || item.profile_image_url || defaultAvatar.src,
              verified: item.is_verified || false,
            },
            content: item.content || item.comment_text || '',
            timestamp: item.created_at || item.tweet_update_time || '',
            attitude: item.attitude !== undefined ? item.attitude : 2, // 默认为 OTHER (2)
            side:
              item.attitude === 0
                ? PredictionSide.YES
                : item.attitude === 1
                  ? PredictionSide.NO
                  : undefined, // attitude === 2 或其他值时，side 为 undefined (OTHER)
            likes: item.favorite_count || item.like_count || 0,
            reply_count: item.reply_count || 0,
            retweet: item.retweet_count || 0,
            views: item.views || 0,
          }));
          setComments(transformed);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [fetchComments]);

  // Filter Logic
  // attitude: 0 = YES, 1 = NO, 2 = OTHER
  const filteredComments = useMemo(() => {
    return comments.filter((comment) => {
      if (activeFilter === 'ALL') return true;
      if (activeFilter === 'YES') return comment.attitude === 0;
      if (activeFilter === 'NO') return comment.attitude === 1;
      if (activeFilter === 'OTHERS') return comment.attitude === 2 || comment.attitude === undefined;
      return true;
    });
  }, [comments, activeFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredComments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentComments = filteredComments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Counts for tabs
  // attitude: 0 = YES, 1 = NO, 2 = OTHER
  const allCount = comments.length;
  const yesCount = comments.filter((c) => c.attitude === 0).length;
  const noCount = comments.filter((c) => c.attitude === 1).length;
  const othersCount = comments.filter((c) => c.attitude === 2 || c.attitude === undefined).length;

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Filter Tabs Skeleton */}
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-9 w-20 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-full" />
        </div>

        {/* List Skeleton */}
        <div className="min-h-[300px] space-y-4">
          {[...Array(3)].map((_, index) => (
            <CommentItemSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (comments.length === 0) {
    return <div className="text-muted-foreground p-8 text-center">{t('no_comments_first')}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleFilterChange('ALL')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
            activeFilter === 'ALL'
              ? 'bg-foreground text-background'
              : 'bg-muted/20 text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('all')} {allCount}
        </button>
        <button
          onClick={() => handleFilterChange('YES')}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
            activeFilter === 'YES'
              ? 'bg-green-500/20 text-green-500 ring-1 ring-green-500'
              : 'bg-muted/20 text-muted-foreground hover:text-green-500'
          }`}
        >
          {t('yes')} {yesCount}
        </button>
        <button
          onClick={() => handleFilterChange('NO')}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
            activeFilter === 'NO'
              ? 'bg-red-500/20 text-red-500 ring-1 ring-red-500'
              : 'bg-muted/20 text-muted-foreground hover:text-red-500'
          }`}
        >
          {t('no')} {noCount}
        </button>
        <button
          onClick={() => handleFilterChange('OTHERS')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeFilter === 'OTHERS' 
              ? 'bg-blue-500/20 text-blue-500 ring-1 ring-blue-500' 
              : 'bg-muted/20 text-muted-foreground hover:text-blue-500'
          }`}
        >
          {t('others')} {othersCount}
        </button>
      </div>

      {/* List */}
      <div className="min-h-[300px] space-y-4">
        {currentComments.length > 0 ? (
          currentComments.map((comment) => (
            <div
              key={comment.id}
              className="border-border bg-card animate-in fade-in rounded-xl border p-4 duration-300"
            >
              <div className="flex gap-3">
                <img
                  src={comment.user.avatar}
                  alt={comment.user.name}
                  className="bg-muted border-border h-10 w-10 rounded-full border object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = defaultAvatar.src;
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-foreground text-sm font-bold">{comment.user.name}</span>
                      {comment.user.verified && (
                        <CheckCircle2 className="text-primary h-3.5 w-3.5" />
                      )}
                      <span className="text-muted-foreground ml-1 text-sm">
                        {comment.user.handle}
                      </span>
                      {comment.timestamp && (
                        <>
                          <span className="text-muted-foreground mx-1 text-xs">·</span>
                          <span className="text-muted-foreground text-xs">
                            {formatTimeAgoShort(comment.timestamp)}
                          </span>
                        </>
                      )}
                    </div>
                    {comment.side && (
                      <span
                        className={`rounded border px-2 py-0.5 text-[10px] font-bold ${
                          comment.side === PredictionSide.YES
                            ? 'border-green-500/30 bg-green-500/10 text-green-500'
                            : 'border-red-500/30 bg-red-500/10 text-red-500'
                        }`}
                      >
                        {comment.side}
                      </span>
                    )}
                  </div>

                  <p className="text-foreground/90 mt-2 text-sm leading-relaxed">
                    {comment.content}
                  </p>

                  <div className="text-muted-foreground mt-3 flex items-center gap-6">
                    <button className="hover:text-primary flex items-center gap-1.5 text-xs transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      <span>{t('reply')}</span>
                      <span className="text-muted-foreground text-xs">{comment.reply_count}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-xs transition-colors hover:text-pink-500">
                      <Heart className="h-4 w-4" />
                      <span>{t('likes')}</span>
                      <span>{comment.likes}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-xs transition-colors hover:text-green-500">
                      <ChartNoAxesColumn className="h-4 w-4" />
                      <span>{t('views')}</span>
                      <span>{comment.views}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="border-border text-muted-foreground flex h-40 items-center justify-center rounded-xl border border-dashed">
            {t('no_comments_category')}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="border-border flex items-center justify-center gap-4 border-t pt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="hover:bg-muted text-foreground rounded-lg p-2 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <span className="text-muted-foreground text-sm font-medium">
            {t('page')} <span className="text-foreground">{currentPage}</span> {t('of')}{' '}
            <span className="text-foreground">{totalPages}</span>
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="hover:bg-muted text-foreground rounded-lg p-2 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
