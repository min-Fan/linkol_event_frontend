'use client';
import React from 'react';
import defaultAvatar from '@assets/image/avatar.png';
import { Skeleton } from '@shadcn/components/ui/skeleton';
import { useTranslations } from 'next-intl';

interface UserItem {
  id: string;
  name: string;
  avatar?: string;
  shares: number;
  brandVoice: number;
}

interface TopVoiceProps {
  yesHolders?: UserItem[];
  noHolders?: UserItem[];
  isLoading?: boolean;
}

export default function TopVoice({
  yesHolders = [],
  noHolders = [],
  isLoading = false,
}: TopVoiceProps) {
  const t = useTranslations('common');
  const formatShares = (shares: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(shares);
  };

  const formatBrandVoice = (brandVoice: number) => {
    return new Intl.NumberFormat('en-US').format(brandVoice);
  };

  const UserRow = ({ user, isYes }: { user: UserItem; isYes: boolean }) => {
    const isZero = user.shares === 0;
    const textColor = isZero
      ? 'text-muted-foreground/60'
      : isYes
        ? 'text-green-500'
        : 'text-red-500';
    const bgColor = isZero ? 'bg-muted-foreground/5' : isYes ? 'bg-green-500/10' : 'bg-red-500/10';

    return (
      <div className={`flex items-center gap-3 rounded-lg p-3 ${bgColor}`}>
        <div className="h-8 w-8 min-w-8 overflow-hidden rounded-full">
          <img
            src={user.avatar || defaultAvatar.src}
            alt={user.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = defaultAvatar.src;
            }}
          />
        </div>
        <div className="flex-1 truncate text-sm font-medium">{user.name}</div>
        <div className={`text-sm font-medium ${textColor}`}>
          {user.shares} / {formatBrandVoice(user.brandVoice)}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex gap-4">
        <div className="border-border flex-1 space-y-3 rounded-2xl border p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg p-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
        <div className="border-border flex-1 space-y-3 rounded-2xl border p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg p-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex gap-4">
        {/* YES Holder 列 */}
        <div className="border-border flex-1 space-y-3 rounded-2xl border p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base text-green-500">{t('yes_holder')}</h3>
            <p className="text-muted-foreground/60 text-sm">{t('shares_brand_voice')}</p>
          </div>
          <div className="space-y-2">
            {yesHolders.length > 0 ? (
              yesHolders.map((user) => <UserRow key={user.id} user={user} isYes={true} />)
            ) : (
              <div className="text-center text-muted-foreground py-8 text-sm">{t('no_data_available')}</div>
            )}
          </div>
        </div>

        {/* No Holder 列 */}
        <div className="border-border flex-1 space-y-3 rounded-2xl border p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base text-red-500">{t('no_holder')}</h3>
            <p className="text-muted-foreground/60 text-sm">{t('shares_brand_voice')}</p>
          </div>
          <div className="space-y-2">
            {noHolders.length > 0 ? (
              noHolders.map((user) => <UserRow key={user.id} user={user} isYes={false} />)
            ) : (
              <div className="text-center text-muted-foreground py-8 text-sm">{t('no_data_available')}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
