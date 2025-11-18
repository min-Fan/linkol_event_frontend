'use client';
import React from 'react';
import defaultAvatar from '@assets/image/avatar.png';

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
}

// 模拟数据 - 实际使用时应该从 props 传入
const mockYesHolders: UserItem[] = [
  { id: '1', name: 'Violet-Stepaunt', shares: 18692, brandVoice: 13000 },
  { id: '2', name: 'classified', shares: 15716, brandVoice: 2000 },
  { id: '3', name: 'Violet-Stepaunt', shares: 18692, brandVoice: 13000 },
  { id: '4', name: 'classified', shares: 0, brandVoice: 2000 },
  { id: '5', name: 'Violet-Stepaunt', shares: 18692, brandVoice: 13000 },
  { id: '6', name: 'classified', shares: 15716, brandVoice: 2000 },
  { id: '7', name: 'classified', shares: 15716, brandVoice: 2000 },
];

const mockNoHolders: UserItem[] = [
  { id: '1', name: 'Violet-Stepaunt', shares: 18692, brandVoice: 13000 },
  { id: '2', name: 'classified', shares: 15716, brandVoice: 2000 },
  { id: '3', name: 'Violet-Stepaunt', shares: 0, brandVoice: 13000 },
  { id: '4', name: 'classified', shares: 15716, brandVoice: 2000 },
  { id: '5', name: 'Violet-Stepaunt', shares: 18692, brandVoice: 13000 },
  { id: '6', name: 'classified', shares: 15716, brandVoice: 2000 },
  { id: '7', name: 'classified', shares: 15716, brandVoice: 2000 },
];

export default function TopVoice({
  yesHolders = mockYesHolders,
  noHolders = mockNoHolders,
}: TopVoiceProps) {
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
          {formatShares(user.shares)} / {formatBrandVoice(user.brandVoice)}
        </div>
      </div>
    );
  };

  return (
    <div className="">
      <div className="flex gap-4">
        {/* YES Holder 列 */}
        <div className="border-border flex-1 space-y-3 rounded-2xl border p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base text-green-500">YES Holder</h3>
            <p className="text-muted-foreground/60 text-sm">Shares / Brand voice</p>
          </div>
          <div className="space-y-2">
            {yesHolders.map((user) => (
              <UserRow key={user.id} user={user} isYes={true} />
            ))}
          </div>
        </div>

        {/* No Holder 列 */}
        <div className="border-border flex-1 space-y-3 rounded-2xl border p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base text-red-500">No Holder</h3>
            <p className="text-muted-foreground/60 text-sm">Shares / Brand voice</p>
          </div>
          <div className="space-y-2">
            {noHolders.map((user) => (
              <UserRow key={user.id} user={user} isYes={false} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
