'use client';

import React, { useState } from 'react';
import { Button } from '@shadcn/components/ui/button';
import { Input } from '@shadcn/components/ui/input';
import { useTranslations } from 'next-intl';
import { IEventInfoResponseData, getReceiveRewardButtonStatus } from '@libs/request';
import { Zap, Loader2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { updateRedemptionCode, clearRedemptionCode } from '@store/reducers/userSlice';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import DialogPostTweetLink from './dialog/DialogPostTweetLink';
import { MoneyBag } from '@assets/svg';
import DialogClaimReward from './dialog/DialogClaimReward';
import useUserActivityReward from '@hooks/useUserActivityReward';

interface PlatformRewardCardProps {
  eventInfo: IEventInfoResponseData;
  onRefresh?: () => Promise<void> | void;
}

export default function PlatformRewardCard({ eventInfo, onRefresh }: PlatformRewardCardProps) {
  const t = useTranslations('common');
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPostTweetDialogOpen, setIsPostTweetDialogOpen] = useState(false);
  const [isClaimRewardDialogOpen, setIsClaimRewardDialogOpen] = useState(false);
  const payTokenInfo = useAppSelector((state) => state.userReducer?.pay_token_info);
  const isLoggedIn = useAppSelector((state) => state.userReducer?.isLoggedIn);
  const redemptionCode = useAppSelector((state) => state.userReducer?.redemptionCode || '');

  // 使用新的 hook 从 store 中获取用户活动奖励数据
  const {
    data: userActivityReward,
    isLoading: isUserActivityRewardLoading,
    refetch: refetchUserActivityReward,
    availableReward,
    totalReward,
    totalReceiveAmount,
  } = useUserActivityReward({
    eventId: eventInfo.id.toString(),
    enabled: !!eventInfo.id,
  });

  // 获取按钮状态
  const {
    data: receiveRewardButtonStatus,
    isLoading: isReceiveRewardButtonStatusLoading,
    refetch: refetchReceiveRewardButtonStatus,
  } = useQuery({
    queryKey: ['receiveRewardButtonStatus', eventInfo.id, isLoggedIn],
    queryFn: () => getReceiveRewardButtonStatus(eventInfo.id),
    enabled: !!eventInfo.id && isLoggedIn,
  });

  // 数据刷新处理
  const handleRefreshUserReward = async () => {
    await refetchUserActivityReward();
    await refetchReceiveRewardButtonStatus();
    await onRefresh?.();
  };

  // 处理兑换码提交
  const handleSubmit = () => {
    if (!redemptionCode.trim()) {
      toast.error(t('please_enter_redemption_code'));
      return;
    }

    // 打开发推弹窗
    setIsPostTweetDialogOpen(true);
  };

  // 处理发推弹窗关闭
  const handlePostTweetDialogClose = () => {
    setIsPostTweetDialogOpen(false);
  };

  // 处理发推成功后的刷新
  const handlePostTweetSuccess = async () => {
    // 刷新用户活动奖励数据和父组件数据
    refetchUserActivityReward();
    refetchReceiveRewardButtonStatus();
    onRefresh?.();
    // 关闭发推弹窗并清空兑换码
    setIsPostTweetDialogOpen(false);
    dispatch(clearRedemptionCode());
    toast.success(t('task_completed_successfully'));
  };

  // 处理领取奖励
  const handleClaimReward = () => {
    setIsClaimRewardDialogOpen(true);
  };

  return (
    <>
      <div className="bg-primary/5 space-y-6 rounded-xl p-6 sm:rounded-3xl">
        {/* Header with lightning icon */}
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="flex items-center justify-center">
            <Zap className="text-primary !h-8 !w-8 sm:!h-10 sm:!w-10" />
          </div>

          <div className="">
            <h3 className="text-primary text-md font-semibold sm:text-base">
              {t('tweet_now_to_claim_reward')}
            </h3>
            <p className="text-primary/40 sm:text-md text-sm">
              {t('receive_usdt_instantly', { symbol: payTokenInfo?.symbol || '' })}
            </p>
          </div>
        </div>

        {/* 根据状态显示不同内容 */}
        {totalReceiveAmount !== 0 ? (
          <div className="flex justify-center">
            <Button
              onClick={handleClaimReward}
              className="flex items-center gap-2 !rounded-xl text-white"
            >
              <MoneyBag className="h-4 w-4" />
              {t('claim_reward')}
            </Button>
          </div>
        ) : (
          // 其他状态显示兑换码输入
          <div className="space-y-3">
            <div className="bg-background flex items-center justify-center gap-2 rounded-3xl p-2">
              <Input
                placeholder={t('enter_redemption_code')}
                value={redemptionCode}
                onChange={(e) => dispatch(updateRedemptionCode(e.target.value))}
                className="sm:!text-md placeholder:text-muted-foreground/60 !w-auto flex-1 border-none !bg-transparent py-0 text-center !text-sm"
                disabled={isSubmitting}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && redemptionCode.trim()) {
                    handleSubmit();
                  }
                }}
              />
              {/* <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !redemptionCode.trim()}
                className="!py-auto !h-full !rounded-full !px-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 sm:!h-auto sm:!px-4 sm:!py-1 sm:text-base"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t('enter')}
              </Button> */}
            </div>
          </div>
        )}

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground/80 sm:text-md text-sm">
              {t('available_reward')}: {availableReward}/{totalReward}
            </span>
          </div>
        </div>
      </div>

      {/* 发推弹窗 */}
      {isPostTweetDialogOpen && (
        <DialogPostTweetLink
          isOpen={isPostTweetDialogOpen}
          onClose={handlePostTweetDialogClose}
          eventInfo={eventInfo}
          onRefresh={handlePostTweetSuccess}
        />
      )}

      {/* 领取奖励弹窗 */}
      <DialogClaimReward
        isOpen={isClaimRewardDialogOpen}
        onClose={() => setIsClaimRewardDialogOpen(false)}
        eventInfo={eventInfo}
        onRefresh={handleRefreshUserReward}
      />
    </>
  );
}
