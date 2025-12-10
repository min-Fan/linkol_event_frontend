'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { useBetDetail } from '@hooks/useBetDetail';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@shadcn/components/ui/skeleton';
import { PredictionSide } from '../types';
import defaultAvatar from '@assets/image/avatar.png';
import { formatAddress, formatTimeAgoShort } from '@libs/utils';
import AddressAvatar from '../../../../components/address-avatar';

// 活动项骨架屏组件
const ActivityItemSkeleton = () => {
  return (
    <div className="border-border bg-card flex items-center justify-between rounded-xl border p-4 py-2">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-32" />
          </div>
          {/* <Skeleton className="h-3 w-48" /> */}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-4" />
      </div>
    </div>
  );
};

export default function OpinionActivityList() {
  const params = useParams();
  const opinionId = params?.opinion as string;
  const { fetchActivity, yesPercentage, noPercentage } = useBetDetail(opinionId);
  const t = useTranslations('common');

  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 获取活动数据
  useEffect(() => {
    if (fetchActivity) {
      setLoading(true);
      fetchActivity(1, 100)
        .then((result) => {
          // 转换数据格式
          const transformed = result.list.map((item: any) => ({
            id: item.id,
            user: {
              id: item.id,
              name: item.user_name,
              handle: '',
              avatar: item.profile_image_url || null, // 如果没有头像，设为 null
              verified: false,
            },
            side: item.position_type === 'yes' ? PredictionSide.YES : PredictionSide.NO,
            shares: item.quantity,
            amount: item.total_value,
            timestamp: item.created_at || '',
            link_url: item.link_url,
          }));
          setActivities(transformed);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [fetchActivity]);

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {[...Array(5)].map((_, index) => (
          <ActivityItemSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return <div className="text-muted-foreground p-8 text-center">{t('no_recent_activity')}</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      {activities.map((activity) => {
        const isYes = activity.side === PredictionSide.YES;
        const price = isYes ? yesPercentage / 100 : noPercentage / 100;

        return (
          <div
            key={activity.id}
            className="group border-border bg-card hover:border-primary/20 flex items-center justify-between rounded-xl border p-4 py-2 transition-colors"
          >
            <div className="flex items-center gap-3">
              {activity.user.avatar ? (
                <img
                  src={activity.user.avatar}
                  alt={activity.user.name}
                  className="border-border h-10 w-10 rounded-full border"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = defaultAvatar.src;
                  }}
                />
              ) : (
                <div className="border-border flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border">
                  <AddressAvatar address={activity.user.address || activity.user.name} />
                </div>
              )}
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-foreground font-semibold">
                    {formatAddress(activity.user.name || '')}
                  </span>
                  <span className="text-muted-foreground">{t('bought')}</span>
                  <span className="text-foreground font-bold">
                    {activity.shares.toLocaleString()}
                  </span>
                  <span className={`font-bold ${isYes ? 'text-green-500' : 'text-red-500'}`}>
                    {activity.side}
                  </span>
                </div>
                {/* <div className="text-muted-foreground text-xs">
                  {t('for')}{' '}
                  {activity.side === PredictionSide.YES ? t('no_change') : t('bps_decrease')} at{' '}
                  <span className="text-foreground">${(price * 100).toFixed(1)}</span>
                  <span className="text-muted-foreground ml-1">
                    (${activity.amount.toLocaleString()})
                  </span>
                </div> */}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-muted-foreground text-xs font-medium">
                {formatTimeAgoShort(activity.timestamp)}
              </span>
              <ExternalLink
                className="text-muted-foreground hover:text-primary h-4 w-4 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => window.open(activity.link_url, '_blank')}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
