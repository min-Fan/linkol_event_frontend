'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@shadcn/components/ui/avatar';
import { ScrollArea } from '@shadcn/components/ui/scroll-area';
import { cn } from '@shadcn/lib/utils';

interface RewardHistoryItem {
  id: string;
  username: string;
  avatar?: string;
  points: number;
  avatarColor: string;
}

interface RewardsHistoryProps {
  rewards?: RewardHistoryItem[];
}

const defaultRewards: RewardHistoryItem[] = [
  { id: '1', username: 'Xrius', avatarColor: 'bg-orange-400', points: 0.1 },
  { id: '2', username: 'SaraS', avatarColor: 'bg-purple-400', points: 0.1 },
  { id: '3', username: 'TheorCoin', avatarColor: 'bg-red-400', points: 0.1 },
  { id: '4', username: 'CryptoSam', avatarColor: 'bg-green-400', points: 0.1 },
  { id: '5', username: 'GamerGuru', avatarColor: 'bg-blue-400', points: 0.1 },
  { id: '6', username: 'TravelTina', avatarColor: 'bg-pink-400', points: 0.1 },
  { id: '7', username: 'CryptoKing', avatarColor: 'bg-yellow-400', points: 0.1 },
  { id: '8', username: 'BlockchainBetty', avatarColor: 'bg-indigo-400', points: 0.1 },
  { id: '9', username: 'DeFiDave', avatarColor: 'bg-teal-400', points: 0.1 },
  { id: '9', username: 'DeFiDave', avatarColor: 'bg-teal-400', points: 0.1 },
  { id: '9', username: 'DeFiDave', avatarColor: 'bg-teal-400', points: 0.1 },
  { id: '9', username: 'DeFiDave', avatarColor: 'bg-teal-400', points: 0.1 },
  { id: '9', username: 'DeFiDave', avatarColor: 'bg-teal-400', points: 0.1 },
  { id: '9', username: 'DeFiDave', avatarColor: 'bg-teal-400', points: 0.1 },
  { id: '9', username: 'DeFiDave', avatarColor: 'bg-teal-400', points: 0.1 },
];

export default function RewardsHistory({ rewards = defaultRewards }: RewardsHistoryProps) {
  return (
    <Card className="h-full rounded-lg border-1 p-4 shadow-none">
      <CardContent className="flex h-full flex-col gap-4 p-0">
        <h2 className="text-md font-semibold">Rewards History</h2>
        <ScrollArea className="border-primary/10 h-full max-h-[440px] rounded-xl border p-4">
          <div className="flex flex-col gap-2">
            {rewards.map((reward, index) => (
              <div
                key={reward.id}
                className={cn(
                  'border-primary/10 flex items-center gap-2 border-b pb-2',
                  index === rewards.length - 1 ? 'border-b-0' : ''
                )}
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={reward.avatar} alt={reward.username} />
                  <AvatarFallback
                    className={`${reward.avatarColor} text-xs font-medium text-white`}
                  >
                    {reward.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-md flex-1">{reward.username}</span>
                <span className="text-md font-bold">+ {reward.points} points</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
