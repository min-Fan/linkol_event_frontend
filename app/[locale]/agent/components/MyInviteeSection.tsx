'use client';

import React from 'react';
import { Card, CardContent } from '@shadcn/components/ui/card';
import { Users } from 'lucide-react';
import { Button } from '@shadcn/components/ui/button';
import { BarChart } from '@assets/svg';
import BouncingAvatars from './BouncingAvatars';

interface Invitee {
  id: string;
  name: string;
  avatar?: string;
  value?: number; // 用于控制头像大小的数值
}

interface MyInviteeSectionProps {
  invitees?: Invitee[];
}

const defaultInvitees: Invitee[] = [
  { id: '1', name: 'Alice', value: 80 },
  { id: '2', name: 'Bob', value: 120 },
  { id: '3', name: 'Carol', value: 60 },
  { id: '4', name: 'David', value: 150 },
  { id: '5', name: 'Eve', value: 90 },
  { id: '6', name: 'Frank', value: 100 },
  { id: '7', name: 'Grace', value: 70 },
];

export default function MyInviteeSection({ invitees = defaultInvitees }: MyInviteeSectionProps) {
  const handleRedeem = () => {
    // 处理兑换奖励逻辑
    console.log('兑换奖励');
  };
  return (
    <Card className="h-full rounded-lg border-1 p-4 shadow-none">
      <CardContent className="flex h-full flex-col gap-2 p-0">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="text-md font-semibold">My Invitee</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="bg-primary/5 hover:bg-primary/10 flex w-auto items-center gap-1 !rounded-xl px-2"
          >
            <BarChart className="text-primary h-5 w-5" />
            <span className="text-primary text-sm">Ranking</span>
          </Button>
        </div>
        <div className="border-primary/10 h-full max-h-[350px] min-h-[300px] rounded-xl border sm:min-h-auto">
          <BouncingAvatars avatars={invitees} speed={1} />
        </div>
        <div className="bg-primary/5 mt-auto flex items-center justify-between rounded-3xl p-4">
          <div className="flex items-center gap-4">
            <div className="text-xl font-semibold">200 USDC</div>
            <div className="text-md">Available Rewards</div>
          </div>
          <Button onClick={handleRedeem} className="!rounded-full px-2 py-0.5">
            Redeem
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
