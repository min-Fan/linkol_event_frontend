'use client';

import React from 'react';
import { Card, CardContent } from '@shadcn/components/ui/card';
import { Badge } from '@shadcn/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@shadcn/components/ui/avatar';
import { CheckCircle } from 'lucide-react';
import { useAppSelector } from '@store/hooks';
import { Verified } from '@assets/svg';

interface ProfileCardProps {}

export default function ProfileCard({}: ProfileCardProps) {
  const twitterFullProfile = useAppSelector((state) => state.userReducer?.twitter_full_profile);
  return (
    <Card className="rounded-lg border-1 p-4 shadow-none">
      <CardContent className="p-0">
        <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
          <div className="flex w-full flex-row items-center justify-center gap-4 sm:w-auto sm:flex-col sm:gap-0">
            <div className="w-14 min-w-14">
              {/* 头像 */}
              <Avatar className="h-14 w-14">
                <AvatarImage
                  src={twitterFullProfile?.profile_image_url}
                  alt={twitterFullProfile?.name}
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-lg font-semibold text-white">
                  {twitterFullProfile?.name}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex w-full flex-col items-start gap-0 sm:w-auto sm:items-center">
              <div className="flex w-full items-center gap-1 sm:w-auto">
                <h3 className="max-w-40 truncate text-lg font-bold sm:max-w-20">
                  {twitterFullProfile?.name}
                </h3>
                {!twitterFullProfile?.verified && <Verified className="h-5 w-5 text-blue-500" />}
              </div>
              <p className="w-full max-w-40 truncate text-sm sm:w-auto sm:max-w-20">
                {twitterFullProfile?.screen_name}
              </p>
            </div>
          </div>

          {/* 用户信息 */}
          <div className="w-full">
            {/* 积分和排名卡片 */}
            <div className="flex w-full items-center gap-3">
              <div className="bg-primary/5 flex flex-1 flex-col items-center justify-center rounded-2xl px-3 py-4">
                <p className="text-primary text-sm">Points earned</p>
                <p className="text-primary text-md font-semibold">{100}</p>
              </div>
              <div className="bg-primary/5 flex flex-1 flex-col items-center justify-center rounded-2xl px-3 py-4">
                <p className="text-primary text-sm">Ranking</p>
                <p className="text-primary text-md font-semibold">#{1}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
