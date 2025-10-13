'use client';

import { useTranslations } from 'next-intl';
import { useAccount } from 'wagmi';
import clsx from 'clsx';
import { useState, useEffect, useRef, useMemo } from 'react';
import { MoreHorizontal } from 'lucide-react';

import { Link, usePathname } from '@libs/i18n/navigation';
import useUserInfo from '@hooks/useUserInfo';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@shadcn/components/ui/navigation-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn/components/ui/popover';
import { NavigationItem } from '../index';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { updateNavCache } from '@store/reducers/userSlice';
import PagesRoute from '@constants/routes';

interface NavProps {
  className?: string;
  navigationItems: NavigationItem[];
}

export default function Nav(props: NavProps) {
  const { className = '', navigationItems } = props;
  const t = useTranslations('common');
  const pathname = usePathname();
  const { isLogin } = useUserInfo();
  const { isConnected } = useAccount();
  const dispatch = useAppDispatch();
  const navCache = useAppSelector(
    (state) =>
      state.userReducer?.navCache || {
        visibleItemsCount: 7,
        containerWidth: 0,
        itemWidths: [],
        lastCalculatedAt: 0,
      }
  );

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  // 优先使用缓存的值来初始化状态
  const [visibleItemsCount, setVisibleItemsCount] = useState(navCache.visibleItemsCount);
  const [containerWidth, setContainerWidth] = useState(navCache.containerWidth);
  const [itemWidths, setItemWidths] = useState<number[]>(navCache.itemWidths);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 过滤出应该显示的导航项 - 使用useMemo缓存，只在登录状态或连接状态变化时重新计算
  const filteredItems = useMemo(() => {
    return navigationItems.filter((item) => item.shouldShow(isLogin, isConnected, pathname));
  }, [navigationItems, isLogin, isConnected, pathname]);

  // 当过滤项目数量变化时，调整可见项目数量
  useEffect(() => {
    if (visibleItemsCount > filteredItems.length) {
      const newVisibleCount = filteredItems.length;
      setVisibleItemsCount(newVisibleCount);
      dispatch(updateNavCache({ visibleItemsCount: newVisibleCount }));
    }
  }, [filteredItems.length, visibleItemsCount, dispatch]);

  // 检查缓存是否过期，如果过期或没有缓存则重新计算
  useEffect(() => {
    const cacheAge = Date.now() - navCache.lastCalculatedAt;
    const isCacheExpired = cacheAge > 5 * 60 * 1000; // 5分钟过期
    const hasNoCache = navCache.itemWidths.length === 0;

    // 如果缓存过期或没有缓存数据，且导航项数量与缓存不匹配，则清空缓存强制重新计算
    if ((isCacheExpired || hasNoCache) && navCache.itemWidths.length !== filteredItems.length) {
      setItemWidths([]);
      setVisibleItemsCount(filteredItems.length);
    }
  }, [filteredItems.length, navCache.lastCalculatedAt, navCache.itemWidths.length]);

  // 清理popover timeout
  useEffect(() => {
    return () => {
      if (popoverTimeoutRef.current) {
        clearTimeout(popoverTimeoutRef.current);
      }
    };
  }, []);

  // 测量每个导航项的实际宽度
  useEffect(() => {
    if (!measureRef.current) return;

    const measureItems = () => {
      const measureContainer = measureRef.current;
      if (!measureContainer) return;

      const items = measureContainer.querySelectorAll('[data-nav-item]');
      const widths = Array.from(items).map((item) => {
        const rect = item.getBoundingClientRect();
        return rect.width + 12; // 加上 gap-3 的间距
      });

      setItemWidths(widths);
      // 更新缓存
      dispatch(updateNavCache({ itemWidths: widths }));
    };

    // 延迟测量确保DOM已渲染
    const timer = setTimeout(measureItems, 100);
    return () => clearTimeout(timer);
  }, [filteredItems.length, t]); // 只依赖项目数量变化，不依赖pathname

  // 监听容器宽度变化
  useEffect(() => {
    if (!containerRef.current || itemWidths.length === 0) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        setContainerWidth(width);
        // 更新缓存
        dispatch(updateNavCache({ containerWidth: width }));

        const dropdownWidth = 60; // 下拉按钮的宽度
        const padding = 20; // 额外的padding

        // 使用实际测量的宽度来计算可见项数量
        let totalWidth = 0;
        let maxVisibleItems = 0;

        for (let i = 0; i < itemWidths.length; i++) {
          const newTotalWidth = totalWidth + itemWidths[i];

          // 如果还有剩余项目，需要预留下拉按钮的空间
          const needsDropdown = i < itemWidths.length - 1;
          const requiredWidth = newTotalWidth + (needsDropdown ? dropdownWidth : 0) + padding;

          if (requiredWidth <= width) {
            totalWidth = newTotalWidth;
            maxVisibleItems = i + 1;
          } else {
            break;
          }
        }

        // 确保至少显示2个，最多显示所有项目
        maxVisibleItems = Math.max(2, Math.min(maxVisibleItems, filteredItems.length));

        // 如果能显示所有项目，则不需要下拉菜单
        if (maxVisibleItems >= filteredItems.length) {
          maxVisibleItems = filteredItems.length;
        }

        setVisibleItemsCount(maxVisibleItems);
        // 更新缓存
        dispatch(updateNavCache({ visibleItemsCount: maxVisibleItems }));
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [filteredItems.length, itemWidths.length]); // 只依赖长度，避免pathname变化时重新创建Observer

  // 分割可见和隐藏的导航项
  const visibleItems = filteredItems.slice(0, visibleItemsCount);
  const hiddenItems = filteredItems.slice(visibleItemsCount);

  const renderNavigationItem = (item: NavigationItem, key: string, forMeasurement = false) => {
    const isActive = item.isActive(pathname);
    const isComingSoon = item.isComingSoon;

    const content = (
      <div className="relative">
        <span className={clsx(isComingSoon && 'cursor-not-allowed text-gray-400')}>
          {t(item.labelKey)}
        </span>
        {isComingSoon && !forMeasurement && (
          <span className="bg-primary/80 absolute -top-3.5 left-[50%] -translate-x-1/2 scale-75 rounded-full px-1 py-0.5 text-xs text-[10px] leading-none text-white">
            COMING SOON
          </span>
        )}
      </div>
    );

    return (
      <div
        key={key}
        data-nav-item={forMeasurement ? 'true' : undefined}
        className={clsx(
          'relative rounded-lg px-3 py-2 whitespace-nowrap',
          pathname === PagesRoute.HOME && !scrolled && 'text-white',
          pathname === PagesRoute.HOME && scrolled && '!text-black dark:!text-white',
          isActive && !isComingSoon && 'bg-primary/5 text-primary',
          isComingSoon && 'cursor-not-allowed opacity-60'
        )}
      >
        {isComingSoon ? content : <Link href={item.href}>{t(item.labelKey)}</Link>}
      </div>
    );
  };

  return (
    <div className="relative">
      {/* 隐藏的测量区域 */}
      <div
        ref={measureRef}
        className="text-md pointer-events-none invisible fixed -top-[999px] -left-[999px] flex items-center gap-3 font-medium"
        aria-hidden="true"
      >
        {filteredItems.map((item) => renderNavigationItem(item, `measure-${item.href}`, true))}
      </div>

      <div
        ref={containerRef}
        className={clsx('text-md flex items-center gap-3 font-medium', className)}
      >
        <div className="flex items-center gap-2">
          <NavigationMenu viewport={false}>
            <NavigationMenuList className="gap-2">
              {/* 显示可见的导航项 */}
              {visibleItems.map((item) => renderNavigationItem(item, `visible-${item.href}`))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* 如果有隐藏项目，显示Popover菜单 */}
          {hiddenItems.length > 0 && (
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <div
                  className="hover:bg-accent/50 cursor-pointer rounded-lg px-3 py-2 transition-colors"
                  onMouseEnter={() => {
                    if (popoverTimeoutRef.current) {
                      clearTimeout(popoverTimeoutRef.current);
                    }
                    setIsPopoverOpen(true);
                  }}
                  onMouseLeave={() => {
                    popoverTimeoutRef.current = setTimeout(() => {
                      setIsPopoverOpen(false);
                    }, 150);
                  }}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto min-w-[240px] p-2"
                align="end"
                onMouseEnter={() => {
                  if (popoverTimeoutRef.current) {
                    clearTimeout(popoverTimeoutRef.current);
                  }
                  setIsPopoverOpen(true);
                }}
                onMouseLeave={() => {
                  popoverTimeoutRef.current = setTimeout(() => {
                    setIsPopoverOpen(false);
                  }, 150);
                }}
              >
                <div className="grid gap-1">
                  {hiddenItems.map((item) => {
                    const isActive = item.isActive(pathname);
                    const isComingSoon = item.isComingSoon;

                    const content = (
                      <div className="relative flex w-full items-center justify-between">
                        <span className={clsx(isComingSoon && 'cursor-not-allowed text-gray-400')}>
                          {t(item.labelKey)}
                        </span>
                        {isComingSoon && (
                          <span className="bg-primary/80 rounded-full px-1 py-0.5 text-xs !text-[10px] leading-none text-white">
                            COMING SOON
                          </span>
                        )}
                      </div>
                    );

                    return (
                      <div
                        key={`hidden-${item.href}`}
                        className={clsx(
                          'rounded-md px-3 py-2 text-sm transition-colors',
                          !isComingSoon && 'hover:bg-accent hover:text-accent-foreground',
                          isActive && !isComingSoon && 'bg-primary/5 text-primary',
                          isComingSoon && 'cursor-not-allowed opacity-60'
                        )}
                        onClick={() => {
                          if (!isComingSoon) {
                            setIsPopoverOpen(false);
                          }
                        }}
                      >
                        {isComingSoon ? (
                          content
                        ) : (
                          <Link
                            href={item.href}
                            className="block w-full"
                            onClick={() => setIsPopoverOpen(false)}
                          >
                            {t(item.labelKey)}
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </div>
  );
}
