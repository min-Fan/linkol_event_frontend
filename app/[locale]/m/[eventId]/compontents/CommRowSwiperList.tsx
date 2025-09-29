'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@shadcn/lib/utils';

interface CommRowSwiperListProps {
  data: React.ReactNode[];
  rows?: number;
  className?: string;
  itemClassName?: string;
  scrollAmount?: number;
  showScrollButton?: boolean;
  title?: React.ReactNode;
}

export default function CommRowSwiperList({
  data = [],
  rows = 2,
  className,
  showScrollButton = false,
  itemClassName,
  scrollAmount = 300, // 默认滚动距离
  title,
}: CommRowSwiperListProps) {
  const [actualRows, setActualRows] = useState(rows);
  const containerRef = useRef<HTMLDivElement>(null);

  // 计算实际需要的行数
  const calculateOptimalRows = useCallback(() => {
    if (!containerRef.current || data.length === 0) return rows;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;

    // 尝试从已渲染的第一个项目获取宽度
    const firstRow = rowRefs.current[0];
    if (firstRow) {
      const firstItem = firstRow.querySelector('.flex-shrink-0') as HTMLElement;
      if (firstItem) {
        const itemWidth = firstItem.offsetWidth;
        const computedStyle = window.getComputedStyle(firstRow);
        const gap = parseFloat(computedStyle.gap) || 16;
        const itemWithGap = itemWidth + gap;

        // 计算一行能显示多少个项目
        const itemsPerRow = Math.floor(containerWidth / itemWithGap);

        // 如果所有数据能在一行显示，就用一行
        if (data.length <= itemsPerRow) {
          return 1;
        }
      }
    }

    // 否则使用指定的行数
    return rows;
  }, [data.length, rows]);

  // 监听容器尺寸变化和数据变化
  useEffect(() => {
    const updateRows = () => {
      const optimalRows = calculateOptimalRows();
      setActualRows(optimalRows);
    };

    // 延迟执行，确保组件已经渲染
    const timer = setTimeout(updateRows, 100);

    const resizeObserver = new ResizeObserver(() => {
      // 窗口大小变化时也需要重新计算
      setTimeout(updateRows, 50);
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
    };
  }, [calculateOptimalRows, data.length, rows]);

  // 将数据分割成多行
  const rowData = React.useMemo(() => {
    const itemsPerRow = Math.ceil(data.length / actualRows);
    const result: React.ReactNode[][] = [];

    for (let i = 0; i < actualRows; i++) {
      const startIndex = i * itemsPerRow;
      const endIndex = Math.min(startIndex + itemsPerRow, data.length);
      const rowItems = data.slice(startIndex, endIndex);
      if (rowItems.length > 0) {
        result.push(rowItems);
      }
    }

    return result;
  }, [data, actualRows]);

  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const leftMaskRef = useRef<HTMLDivElement>(null);
  const rightMaskRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // 检查滚动状态
  const checkScrollability = useCallback(() => {
    const allRows = rowRefs.current.filter(Boolean);
    const leftMask = leftMaskRef.current;
    const rightMask = rightMaskRef.current;

    if (allRows.length > 0) {
      const scrollLeft = Math.max(...allRows.map((row) => row!.scrollLeft));
      const scrollWidth = Math.max(...allRows.map((row) => row!.scrollWidth));
      const clientWidth = Math.min(...allRows.map((row) => row!.clientWidth));

      const canLeft = scrollLeft > 0;
      const canRight = scrollLeft < scrollWidth - clientWidth - 1;

      setCanScrollLeft(canLeft);
      setCanScrollRight(canRight);

      // 动态显示/隐藏渐变遮罩
      if (leftMask) {
        leftMask.style.opacity = canLeft ? '1' : '0';
      }
      if (rightMask) {
        rightMask.style.opacity = canRight ? '1' : '0';
      }
    }
  }, []);

  // 计算动态滚动距离
  const calculateScrollDistance = useCallback(() => {
    const firstRow = rowRefs.current[0];
    if (firstRow) {
      const containerWidth = firstRow.clientWidth;

      // 动态获取第一个项目的实际宽度
      const firstItem = firstRow.querySelector('.flex-shrink-0') as HTMLElement;

      if (firstItem) {
        const itemWidth = firstItem.offsetWidth;
        const computedStyle = window.getComputedStyle(firstRow);
        const gap = parseFloat(computedStyle.gap) || 16;
        const itemWithGap = itemWidth + gap;

        // 计算能显示多少个完整项目
        const visibleItems = Math.floor(containerWidth / itemWithGap);
        // 滚动距离 = 可见项目数 * 单个项目宽度，至少滚动2个项目
        const scrollDistance = Math.max(visibleItems, 2) * itemWithGap;
        return scrollDistance;
      }

      // 后备方案：使用容器宽度的 75%
      return containerWidth * 0.75;
    }
    return scrollAmount || 400;
  }, [scrollAmount]);

  // 平滑滚动函数
  const smoothScrollTo = useCallback(
    (targetScrollLeft: number) => {
      const allRows = rowRefs.current.filter(Boolean);
      if (allRows.length === 0) return;

      const startScrollLeft = allRows[0]!.scrollLeft;
      const distance = targetScrollLeft - startScrollLeft;
      const duration = 300; // 动画持续时间
      const startTime = performance.now();

      const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // 使用 easeOutQuart 缓动函数
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        const currentScrollLeft = startScrollLeft + distance * easeProgress;

        // 同步所有行的滚动
        allRows.forEach((row) => {
          row!.scrollLeft = currentScrollLeft;
        });

        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        } else {
          checkScrollability();
        }
      };

      requestAnimationFrame(animateScroll);
    },
    [checkScrollability]
  );

  // 向左滚动
  const handleScrollLeft = useCallback(() => {
    const allRows = rowRefs.current.filter(Boolean);
    if (allRows.length > 0) {
      const distance = calculateScrollDistance();
      const currentScrollLeft = allRows[0]!.scrollLeft;
      const newScrollLeft = Math.max(0, currentScrollLeft - distance);

      smoothScrollTo(newScrollLeft);
    }
  }, [calculateScrollDistance, smoothScrollTo]);

  // 向右滚动
  const handleScrollRight = useCallback(() => {
    const allRows = rowRefs.current.filter(Boolean);
    if (allRows.length > 0) {
      const distance = calculateScrollDistance();
      const firstRow = allRows[0]!;
      const currentScrollLeft = firstRow.scrollLeft;
      const maxScrollLeft = firstRow.scrollWidth - firstRow.clientWidth;
      const newScrollLeft = Math.min(maxScrollLeft, currentScrollLeft + distance);

      smoothScrollTo(newScrollLeft);
    }
  }, [calculateScrollDistance, smoothScrollTo]);

  // 处理滚动事件
  const handleScroll = useCallback(() => {
    checkScrollability();
  }, [checkScrollability]);

  // 初始化滚动状态
  React.useEffect(() => {
    checkScrollability();
    const allRows = rowRefs.current.filter(Boolean);

    allRows.forEach((row) => {
      row!.addEventListener('scroll', handleScroll);
    });

    return () => {
      allRows.forEach((row) => {
        row!.removeEventListener('scroll', handleScroll);
      });
    };
  }, [handleScroll, data, actualRows]);

  // 同步所有行的滚动
  const handleRowScroll = useCallback(
    (scrollingRowIndex: number) => (e: React.UIEvent<HTMLDivElement>) => {
      const scrollLeft = e.currentTarget.scrollLeft;

      // 同步其他行的滚动位置
      rowRefs.current.forEach((row, index) => {
        if (row && index !== scrollingRowIndex) {
          row.scrollLeft = scrollLeft;
        }
      });

      handleScroll();
    },
    [handleScroll]
  );

  return (
    <div ref={containerRef} className={cn('flex w-full flex-col gap-2 sm:gap-4', className)}>
      <div className="flex items-center justify-between">
        {title && <div className="w-full">{title}</div>}
        {/* 控制按钮 */}
        {showScrollButton && (
          <div className="ml-auto flex justify-end gap-2 pr-4">
            <button
              onClick={handleScrollLeft}
              disabled={!canScrollLeft}
              className={cn(
                'bg-muted-foreground/5 hover:bg-muted-foreground/10 text-muted-foreground/50 flex h-5 w-5 items-center justify-center rounded-sm backdrop-blur-sm transition-all',
                canScrollLeft ? 'text-muted-foreground' : 'cursor-not-allowed'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleScrollRight}
              disabled={!canScrollRight}
              className={cn(
                'bg-muted-foreground/5 hover:bg-muted-foreground/10 text-muted-foreground/50 flex h-5 w-5 items-center justify-center rounded-sm backdrop-blur-sm transition-all',
                canScrollRight ? 'text-muted-foreground' : 'cursor-not-allowed'
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="relative flex flex-col gap-2 overflow-hidden sm:gap-4">
        {/* 右侧渐变遮罩 - 从透明到灰色，移动端较窄 */}
        <div
          ref={rightMaskRef}
          className="dark:from-background/50 dark:via-background/50 pointer-events-none absolute top-0 right-0 z-10 h-full w-8 bg-gradient-to-l from-gray-500/20 via-gray-400/10 to-transparent sm:w-12"
        ></div>
        {/* 左侧渐变遮罩（动态显示）- 从灰色到透明，移动端较窄 */}
        <div
          ref={leftMaskRef}
          className="dark:from-background/50 dark:via-background/50 pointer-events-none absolute top-0 left-0 z-10 h-full w-8 bg-gradient-to-r from-gray-500/20 via-gray-400/10 to-transparent opacity-0 transition-opacity duration-300 sm:w-12"
        ></div>
        {/* 动态生成多行 */}
        {rowData.map((rowItems, rowIndex) => (
          <div key={`row-${rowIndex}`}>
            <div
              ref={(el) => {
                rowRefs.current[rowIndex] = el;
              }}
              onScroll={handleRowScroll(rowIndex)}
              className="scrollbar-hide flex gap-2 overflow-x-auto sm:gap-4"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch', // 改善移动端滚动体验
              }}
            >
              {rowItems.map((item, itemIndex) => (
                <div
                  key={`row-${rowIndex}-item-${itemIndex}`}
                  className={cn(
                    'flex-shrink-0',
                    itemIndex === 0 && 'ml-2 sm:ml-4',
                    itemIndex === rowItems.length - 1 && 'mr-2 sm:mr-4',
                    itemClassName
                  )}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
