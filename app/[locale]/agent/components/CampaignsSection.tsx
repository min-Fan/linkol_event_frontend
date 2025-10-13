'use client';

import React from 'react';
import { Card, CardContent } from '@shadcn/components/ui/card';
import { Button } from '@shadcn/components/ui/button';
import { Badge } from '@shadcn/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@shadcn/components/ui/avatar';
import { Users, DollarSign } from 'lucide-react';
import defaultAvatar from '@assets/image/avatar.png';
import { usePayTokenInfo } from '@hooks/usePayTokenInfo';
import { useTranslations } from 'next-intl';
import TokenIcon from 'app/components/TokenIcon';

interface Campaign {
  id: string;
  title: string;
  description: string;
  reward: string;
  participants: string;
  brand: string;
  brandAvatar?: string;
  autoPost: boolean;
  backgroundStyle: string;
  iconStyle: string;
  chain_type?: string;
  token_type?: string;
  is_verified?: boolean;
  reward_amount?: string;
}

interface CampaignsSectionProps {
  campaigns?: Campaign[];
}

const defaultCampaigns: Campaign[] = [
  {
    id: '1',
    title: 'BTC Campaign',
    description:
      'As global macroeconomic uncertainty grows, more investors are turning to safe-haven assets...',
    reward: '0.07 USDC',
    participants: '15.57k',
    brand: 'Crypto Brand',
    autoPost: true,
    backgroundStyle: 'bg-gradient-to-br from-orange-400 to-orange-600',
    iconStyle: 'text-white text-6xl font-bold',
    chain_type: 'base',
    token_type: 'usdc',
    is_verified: true,
    reward_amount: '0.07',
  },
  {
    id: '2',
    title: 'BTC Campaign',
    description:
      'As global macroeconomic uncertainty grows, more investors are turning to safe-haven assets...',
    reward: '0.07 USDC',
    participants: '15.57k',
    brand: 'Crypto Brand',
    autoPost: false,
    backgroundStyle: 'bg-gradient-to-br from-lime-400 to-lime-600',
    iconStyle: 'text-black text-6xl font-bold',
    chain_type: 'base',
    token_type: 'usdc',
    is_verified: true,
    reward_amount: '0.07',
  },
  {
    id: '3',
    title: 'BTC Campaign',
    description:
      'As global macroeconomic uncertainty grows, more investors are turning to safe-haven assets...',
    reward: '0.07 USDC',
    participants: '15.57k',
    brand: 'Crypto Brand',
    autoPost: true,
    backgroundStyle: 'bg-gradient-to-br from-gray-800 to-gray-900',
    iconStyle: 'text-yellow-400 text-6xl font-bold',
    chain_type: 'base',
    token_type: 'usdc',
    is_verified: true,
    reward_amount: '0.07',
  },
  {
    id: '4',
    title: 'BTC Campaign',
    description:
      'As global macroeconomic uncertainty grows, more investors are turning to safe-haven assets...',
    reward: '0.07 USDC',
    participants: '15.57k',
    brand: 'Crypto Brand',
    autoPost: false,
    backgroundStyle: 'bg-gradient-to-br from-lime-400 to-lime-600',
    iconStyle: 'text-black text-6xl font-bold',
    chain_type: 'base',
    token_type: 'usdc',
    is_verified: true,
    reward_amount: '0.07',
  },
];

export default function CampaignsSection({ campaigns = defaultCampaigns }: CampaignsSectionProps) {
  const { tokenInfo } = usePayTokenInfo(campaigns[0]?.chain_type, campaigns[0]?.token_type);
  const t = useTranslations('common');

  return (
    <Card className="rounded-lg border-1 p-4 shadow-none">
      <CardContent className="scrollbar-hide flex gap-4 overflow-x-auto p-0 pb-1">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="bg-background border-primary/10 hover:shadow-primary/20 min-w-[280px] rounded-xl border hover:shadow-sm"
          >
            <div className="p-0">
              {/* 活动头部图片区域 */}
              <div
                className={`${campaign.backgroundStyle} relative h-32 overflow-hidden rounded-t-lg`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={campaign.iconStyle}>B</div>
                </div>
                {/* 参与人数标签 */}
                <div className="bg-background/80 absolute top-3 right-3 rounded-full px-2 py-1 backdrop-blur-sm">
                  <div className="text-muted-foreground flex items-center gap-1 pl-2 text-xs">
                    {Array.from({ length: 5 }).map((item: any, index) => (
                      <Avatar
                        className="border-background -ml-3 size-3 min-w-3 overflow-hidden rounded-full border-[1px] sm:size-4 sm:min-w-4"
                        key={index}
                      >
                        <AvatarImage
                          src={''}
                          alt="avatar"
                          className="size-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = defaultAvatar.src;
                          }}
                        />
                        <AvatarFallback className="bg-muted text-foreground text-xs">
                          {campaign.brand.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    <span>{campaign.participants}</span>
                  </div>
                </div>
              </div>

              {/* 活动内容 */}
              <div className="space-y-3 p-3">
                <div className="flex flex-col gap-2">
                  <dl className="flex items-center justify-between gap-x-3 text-base font-medium">
                    <dt className="truncate">{campaign.title}</dt>
                    <dd className="bg-accent sm:text-md flex h-7 items-center gap-x-1 rounded-full px-2 text-sm">
                      {campaign?.is_verified ? `$${campaign?.reward_amount}` : t('unverified')}
                      {campaign?.is_verified && tokenInfo?.iconType && (
                        <TokenIcon
                          chainType={campaign?.chain_type}
                          tokenType={campaign?.token_type}
                          type={tokenInfo?.iconType as string}
                          className="size-4"
                        />
                      )}
                    </dd>
                  </dl>
                  <p className="text-muted-foreground/80 line-clamp-3 text-sm">
                    {campaign.description}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2">
                  {/* 品牌信息 */}
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={campaign.brandAvatar} alt={campaign.brand} />
                      <AvatarFallback className="bg-gray-200 text-xs text-gray-600">
                        {campaign.brand.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600">{campaign.brand}</span>
                  </div>

                  {/* 自动发布按钮 */}
                  <Button
                    variant={campaign.autoPost ? 'default' : 'outline'}
                    size="sm"
                    className="h-auto w-auto !rounded-xl px-2 py-0.5"
                  >
                    Auto-post {campaign.autoPost ? 'ON' : 'OFF'}
                  </Button>
                </div>

                {/* 奖励信息 */}
                <div className="bg-primary/5 flex items-center justify-center gap-4 rounded-full p-3">
                  <span className="text-md font-medium">{campaign.reward}</span>
                  <span className="text-sm">Rewards</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
