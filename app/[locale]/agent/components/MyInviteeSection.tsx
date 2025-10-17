'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@shadcn/components/ui/card';
import { Users } from 'lucide-react';
import { Button } from '@shadcn/components/ui/button';
import { BarChart } from '@assets/svg';
import { useTranslations } from 'next-intl';
import BouncingAvatars from './BouncingAvatars';
import InviteeSkeleton from './InviteeSkeleton';
import InviteeEmptyState from './InviteeEmptyState';
import RankingDialog from './RankingDialog';
import { getAgentInviteeList, IGetAgentInviteeListItem } from '../../../libs/request';
import { useAgentDetails } from '../../../hooks/useAgentDetails';
import { useAppSelector } from '@store/hooks';

interface Invitee {
  id: string;
  name: string;
  avatar?: string;
  value?: number; // 用于控制头像大小的数值
}

interface MyInviteeSectionProps {
  invitees?: Invitee[];
}

export default function MyInviteeSection({ invitees: propInvitees }: MyInviteeSectionProps) {
  const t = useTranslations('common');
  const { totalReward } = useAgentDetails();
  const [invitees, setInvitees] = useState<Invitee[]>(propInvitees || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRankingDialogOpen, setIsRankingDialogOpen] = useState(false);
  const isLoggedIn = useAppSelector((state) => state.userReducer?.isLoggedIn);

  // 将接口数据转换为组件需要的格式
  const transformInviteeData = (data: IGetAgentInviteeListItem[]): Invitee[] => {
    return data.map((item) => ({
      id: item.id?.toString() || '',
      name: item.from_user?.screen_name || 'Unknown',
      avatar: item.from_user?.profile_image_url,
      value: item.point || 0,
    }));
  };

  // 获取邀请者列表数据
  const fetchInviteeList = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAgentInviteeList();
      if (response.data && response.data.list) {
        const transformedData = transformInviteeData(response.data.list);
        setInvitees(transformedData);
      } else {
        setInvitees([]);
      }
    } catch (error) {
      console.error('获取邀请者列表失败:', error);
      setError(t('load_invitees_failed'));
      setInvitees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 如果没有传入 invitees 属性，则调用接口获取数据
    if (!propInvitees) {
      fetchInviteeList();
    }
  }, [propInvitees]);

  const handleRedeem = () => {
    // 处理兑换奖励逻辑
    console.log('兑换奖励');
  };

  const handleInvite = () => {
    // 处理邀请逻辑
    console.log('邀请朋友');
  };

  const handleRetry = () => {
    fetchInviteeList();
  };

  const handleOpenRankingDialog = () => {
    setIsRankingDialogOpen(true);
  };

  const handleCloseRankingDialog = () => {
    setIsRankingDialogOpen(false);
  };
  return (
    <Card className="h-full rounded-lg border-1 p-4 shadow-none">
      <CardContent className="flex h-full flex-col gap-2 p-0">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="text-md font-semibold">{t('my_invitee')}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="bg-primary/5 hover:bg-primary/10 flex w-auto items-center gap-1 !rounded-xl px-2"
            onClick={handleOpenRankingDialog}
          >
            <BarChart className="text-primary h-5 w-5" />
            <span className="text-primary text-sm">{t('ranking')}</span>
          </Button>
        </div>
        <div className="border-primary/10 h-full max-h-[350px] min-h-[300px] rounded-xl border sm:min-h-auto">
          {loading ? (
            <InviteeSkeleton count={6} />
          ) : error && isLoggedIn ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 rounded-full bg-red-100 p-6">
                <Users className="h-12 w-12 text-red-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">{t('load_failed')}</h3>
              <p className="mb-6 text-sm text-gray-500">{error}</p>
              <Button onClick={handleRetry} variant="outline">
                {t('retry')}
              </Button>
            </div>
          ) : invitees.length === 0 || !isLoggedIn ? (
            <InviteeEmptyState onInvite={handleInvite} />
          ) : (
            <BouncingAvatars avatars={invitees} speed={1} />
          )}
        </div>
        <div className="bg-primary/5 mt-auto flex items-center justify-between rounded-3xl p-4">
          <div className="flex items-center gap-4">
            <div className="text-xl font-semibold">{isLoggedIn ? totalReward : 0} USDC</div>
            <div className="text-md">{t('available_rewards')}</div>
          </div>
          {/* <Button onClick={handleRedeem} className="!rounded-full px-2 py-0.5">
            {t('redeem')}
          </Button> */}
        </div>
      </CardContent>

      {/* 排行榜弹窗 */}
      <RankingDialog isOpen={isRankingDialogOpen} onClose={handleCloseRankingDialog} />
    </Card>
  );
}
