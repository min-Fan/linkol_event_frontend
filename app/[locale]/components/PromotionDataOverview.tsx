'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@shadcn-ui/card';
import { IOrderGainData } from 'app/@types/types';
import { formatNumberKMB } from '@libs/utils';
import { Skeleton } from '@shadcn-ui/skeleton';

export default function PromotionDataOverview({
  isLoading,
  orderGain,
}: {
  isLoading: boolean;
  orderGain: IOrderGainData | undefined;
}) {
  const t = useTranslations('common');

  return (
    <Card className="p-4">
      <CardContent className="p-0">
        <div className="text-muted-foreground grid grid-cols-4 gap-4 text-center capitalize">
          {isLoading ? (
            <>
              <dl className="flex flex-col items-center justify-center gap-2">
                <dd>
                  <Skeleton className="mx-auto h-8 w-20" />
                </dd>
                <dt>
                  <Skeleton className="mx-auto h-4 w-16" />
                </dt>
              </dl>
              <dl className="flex flex-col items-center justify-center gap-2">
                <dd>
                  <Skeleton className="mx-auto h-8 w-20" />
                </dd>
                <dt>
                  <Skeleton className="mx-auto h-4 w-16" />
                </dt>
              </dl>
              <dl className="flex flex-col items-center justify-center gap-2">
                <dd>
                  <Skeleton className="mx-auto h-8 w-20" />
                </dd>
                <dt>
                  <Skeleton className="mx-auto h-4 w-16" />
                </dt>
              </dl>
              <dl className="flex flex-col items-center justify-center gap-2">
                <dd>
                  <Skeleton className="mx-auto h-8 w-20" />
                </dd>
                <dt>
                  <Skeleton className="mx-auto h-4 w-16" />
                </dt>
              </dl>
            </>
          ) : (
            <>
              <dl>
                <dd className="text-2xl font-semibold">
                  {formatNumberKMB(orderGain?.total_views || 0)}
                </dd>
                <dt>{t('total_views')}</dt>
              </dl>
              <dl>
                <dd className="text-2xl font-semibold">
                  {formatNumberKMB(orderGain?.total_replay || 0)}
                </dd>
                <dt>{t('total_replies')}</dt>
              </dl>
              <dl>
                <dd className="text-2xl font-semibold">
                  {formatNumberKMB(orderGain?.total_repost || 0)}
                </dd>
                <dt>{t('total_reposts')}</dt>
              </dl>
              <dl>
                <dd className="text-2xl font-semibold">
                  {formatNumberKMB(orderGain?.total_likes || 0)}
                </dd>
                <dt>{t('total_likes')}</dt>
              </dl>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
