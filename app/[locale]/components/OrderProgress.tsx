'use client';

import { useTranslations } from 'next-intl';
import { Line } from '@assets/svg';
import { ORDER_PROGRESS } from '@constants/app';
import CompOrderProgressItem from './OrderProgressItem';
import { cn } from '@shadcn/lib/utils';
import useOrderProgress from '@hooks/uesOrderProgress';
import { ScrollArea, ScrollBar } from '@shadcn/components/ui/scroll-area';
import { useEffect, useRef } from 'react';

export default function OrderProgress() {
  const t = useTranslations('common');
  const { orderProgress } = useOrderProgress();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        const activeItem = scrollContainer.querySelector(`[data-progress="${orderProgress}"]`);
        if (activeItem) {
          const containerWidth = scrollContainer.clientWidth;
          const itemLeft = (activeItem as HTMLElement).offsetLeft;
          const itemWidth = (activeItem as HTMLElement).offsetWidth;
          const scrollTo = itemLeft - containerWidth / 2 + itemWidth / 2;
          scrollContainer.scrollTo({
            left: scrollTo,
            behavior: 'smooth',
          });
        }
      }
    }
  }, [orderProgress]);

  return (
    <div className="w-full py-0 sm:py-2" ref={scrollRef}>
      <ScrollArea className="w-full">
        <ul className="flex min-w-max items-center justify-center space-x-0 capitalize">
          <li className="sm:flex-3">
            <CompOrderProgressItem title={t('kol_square')} progress={ORDER_PROGRESS.KOL_SQUARE} />
          </li>
          <li className="w-4 sm:flex-1">
            <Line
              className={cn(
                'text-border w-full',
                orderProgress > ORDER_PROGRESS.KOL_SQUARE && 'text-primary'
              )}
            />
          </li>
          <li className="sm:flex-3">
            <CompOrderProgressItem
              title={t('submit_order')}
              progress={ORDER_PROGRESS.SUBMIT_ORDER}
            />
          </li>
          <li className="w-4 sm:flex-1">
            <Line
              className={cn(
                'text-border w-full',
                orderProgress > ORDER_PROGRESS.SUBMIT_ORDER && 'text-primary'
              )}
            />
          </li>
          <li className="sm:flex-3">
            <CompOrderProgressItem
              title={t('kol_promotion')}
              progress={ORDER_PROGRESS.KOL_PROMOTION}
            />
          </li>
          <li className="w-4 sm:flex-1">
            <Line
              className={cn(
                'text-border w-full',
                orderProgress > ORDER_PROGRESS.KOL_PROMOTION && 'text-primary'
              )}
            />
          </li>
          <li className="sm:flex-3">
            <CompOrderProgressItem
              title={t('promotion_data')}
              progress={ORDER_PROGRESS.PROMOTION_DATA}
            />
          </li>
        </ul>
        <ScrollBar orientation="horizontal" className="opacity-0" />
      </ScrollArea>
    </div>
  );
}
