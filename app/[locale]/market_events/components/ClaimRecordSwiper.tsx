import React, { useState, useEffect, useRef, memo, useMemo, useCallback } from 'react';
import defaultAvatar from '@assets/image/avatar.png';
import { Link } from '@libs/i18n/navigation';
import { getActivityWithdrawRecord, IGetActivityWithdrawRecordData } from '@libs/request';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getExplorerUrl, getTokenConfig } from '@constants/config';
import TokenIcon from 'app/components/TokenIcon';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { MoneyBag } from '@assets/svg';
import { cn } from '@shadcn/lib/utils';

const ClaimRecordSwiper = memo(
  function ClaimRecordSwiper({className}: {className?: string}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const [itemHeight, setItemHeight] = useState(32); // 默认高度 32px (h-8)
    const containerRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const { eventId: activeId } = useParams() as { eventId: string };
    const t = useTranslations('common');

    // 使用 useQuery 进行轮询
    const {
      data: response,
      isLoading,
      error,
      isFetching,
    } = useQuery({
      queryKey: ['activityWithdrawRecord', activeId],
      queryFn: () => getActivityWithdrawRecord({ active_id: activeId || '' }),
      refetchInterval: 10000, // 每10秒轮询一次
      refetchIntervalInBackground: true, // 在后台也继续轮询
      staleTime: 5000, // 5秒内数据被认为是新鲜的
      retry: 3, // 失败时重试3次
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 指数退避重试
      // enabled: !!activeId, // 只有当 activeId 存在时才启用查询
    });

    // 提取实际的记录数据 - 使用 useMemo 缓存
    const records = useMemo(() => {
      return Array.isArray(response) ? response : response?.data || [];
    }, [response]);

    // 动态测量每行高度的函数
    const measureItemHeight = useCallback(() => {
      if (containerRef.current) {
        const firstItem = containerRef.current.querySelector('[data-item="0"]') as HTMLElement;
        if (firstItem) {
          const height = firstItem.offsetHeight;
          setItemHeight(height);
        }
      }
    }, []);

    // 当数据更新时，重置到第一条记录并测量高度
    useEffect(() => {
      if (records && records.length > 0) {
        setCurrentIndex(0);
        // 延迟测量，确保DOM已更新
        setTimeout(measureItemHeight, 100);
      }
    }, [records, measureItemHeight]);

    // 监听窗口大小变化，重新测量高度
    useEffect(() => {
      const handleResize = () => {
        measureItemHeight();
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, [measureItemHeight]);

    // 为了实现无缝循环，我们需要复制记录列表
    const extendedRecords = useMemo(() => {
      if (records.length <= 1) return records;
      // 复制记录列表，在末尾添加第一条记录，实现无缝循环
      return [...records, records[0]];
    }, [records]);

    // 自动轮播效果 - 一行一行轮播，无缝循环
    useEffect(() => {
      if (records.length <= 1 || isPaused) return;

      // 清除之前的定时器
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          // 如果到达扩展列表的最后一条（即原始列表的第一条），无缝回到第一条
          if (nextIndex >= extendedRecords.length) {
            // 先禁用过渡效果
            setIsTransitioning(false);
            // 立即重置到第一条（无过渡效果）
            setTimeout(() => {
              setCurrentIndex(0);
              // 重新启用过渡效果
              setTimeout(() => {
                setIsTransitioning(true);
              }, 100);
            }, 100);
            return nextIndex;
          }
          return nextIndex;
        });
      }, 3000); // 每3秒切换一次

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }, [records.length, extendedRecords.length, isPaused, itemHeight]);

    // 鼠标悬停事件处理
    const handleMouseEnter = useCallback(() => {
      setIsPaused(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
      setIsPaused(false);
    }, []);

    // 缓存记录列表的渲染
    const recordsList = useMemo(() => {
      return extendedRecords.map((record, index) => (
        <div
          key={`${record.id}-${index}`}
          data-item={index}
          className="flex min-h-8 flex-shrink-0 items-center justify-end pr-1"
        >
          <div className="sm:text-md flex-warp flex w-full flex-col items-end gap-x-1 text-sm sm:w-auto sm:flex-row sm:items-center">
            <div className="flex items-center gap-x-1">
              <div className="bg-muted-foreground/10 h-4 w-4 flex-shrink-0 rounded-full sm:h-6 sm:w-6">
                <img
                  src={record.avatar || defaultAvatar.src}
                  alt={record.scree_name || record.name}
                  className="h-full w-full rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = defaultAvatar.src;
                  }}
                />
              </div>
              <span className="truncate font-medium">@{record.scree_name || record.name}</span>
            </div>
            <div className="flex items-center gap-x-1">
              <span className="text-muted-foreground">claimed</span>
              <span className="text-primary font-semibold">{record.receive_amount}</span>
              <TokenIcon
                type={getTokenConfig(record.chain_type, record.token_type).symbol}
                className="size-5"
              />
              <span className="text-muted-foreground hidden sm:block">
                {getTokenConfig(record.chain_type, record.token_type).symbol}
              </span>
            </div>
            <div className="flex items-center gap-x-1">
              <span className="text-muted-foreground text-xs">txs:</span>
              <span className="">
                <Link
                  href={getExplorerUrl(record.receive_tx_hash, record.chain_type)}
                  target="_blank"
                  className="text-primary text-xs hover:underline"
                >
                  {record.receive_tx_hash.slice(0, 4)}...{record.receive_tx_hash.slice(-4)}
                </Link>
              </span>
            </div>
          </div>
        </div>
      ));
    }, [extendedRecords]);

    // 错误状态
    if (error) {
      return null;
    }

    // 加载状态
    if (isLoading && records.length === 0) {
      return (
        <div className="flex items-center justify-center gap-1 px-2 sm:px-4">
          <div className="bg-muted-foreground/10 h-4 w-4 animate-pulse rounded-full sm:h-6 sm:w-6"></div>
          <div className="flex animate-pulse gap-1">
            <div className="bg-muted-foreground/20 h-4 w-16 rounded"></div>
            <div className="bg-muted-foreground/20 h-4 w-12 rounded"></div>
            <div className="bg-muted-foreground/20 h-4 w-8 rounded"></div>
          </div>
        </div>
      );
    }

    // 空数据状态
    if (records.length === 0) {
      return (
        <div className="flex items-center justify-center gap-1 px-2 sm:px-4">
          <div className="bg-muted-foreground/10 flex h-4 w-4 items-center justify-center rounded-full sm:h-6 sm:w-6">
            <X className="text-muted-foreground size-3 sm:size-4" />
          </div>
          <div className="text-muted-foreground flex gap-1">
            <span>{t('no_withdraw_record')}</span>
          </div>
        </div>
      );
    }

    return (
      <div
        className={cn('relative overflow-hidden px-2 sm:px-4', className)}
        style={{ height: `${itemHeight}px` }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* 数据更新指示器 */}
        {isFetching && !isLoading && (
          <div className="absolute top-0 right-0 z-10">
            <div className="bg-primary h-2 w-2 animate-pulse rounded-full"></div>
          </div>
        )}
        <div
          ref={containerRef}
          className={`flex flex-col ${isTransitioning ? 'transition-transform duration-700 ease-in-out' : ''}`}
          style={{
            transform: `translateY(-${currentIndex * itemHeight}px)`, // 使用动态高度
          }}
        >
          {recordsList}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // 由于组件没有 props，总是返回 true 来避免不必要的重新渲染
    // 组件内部的状态变化（如轮播、数据更新）仍然会触发重新渲染
    return true;
  }
);

export default ClaimRecordSwiper;
