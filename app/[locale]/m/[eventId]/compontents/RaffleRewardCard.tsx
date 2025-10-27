'use client';

import { Button } from '@shadcn/components/ui/button';
import { useTranslations } from 'next-intl';
import { IEventInfoResponseData, raffle } from '@libs/request';
import { Dices, Gift, HandCoins, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import DialogRaffleResult from './dialog/DialogRaffleResult';
import useUserActivityReward from '@hooks/useUserActivityReward';
import { Tooltip, TooltipContent, TooltipTrigger } from '@shadcn/components/ui/tooltip';
import CircularProgress from '../../../../components/CircularProgress';
import { cn } from '@shadcn/lib/utils';
import DialogRaffleTicketTasks from './dialog/DialogRaffleTicketTasks';
import DialogInvitationCode from './dialog/DialogInvitationCode';
import SpaceButton from 'app/components/SpaceButton/SpaceButton';
import { ChainType, getChainConfig } from '@constants/config';
import ChainIcon from 'app/components/ChainIcon';

interface RaffleRewardCardProps {
  eventInfo: IEventInfoResponseData;
  onClaim?: () => void;
  onRefreshUserReward?: (result: { is_win: boolean; receive_amount: number }) => void;
}

export default function RaffleRewardCard({
  eventInfo,
  onClaim,
  onRefreshUserReward,
}: RaffleRewardCardProps) {
  const t = useTranslations('common');
  const [isRaffling, setIsRaffling] = useState(false);
  const [isRaffleResultDialogOpen, setIsRaffleResultDialogOpen] = useState(false);
  const [raffleResult, setRaffleResult] = useState<{
    is_win: boolean;
    receive_amount: number;
  } | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [isCooldown, setIsCooldown] = useState(false);
  const raffleSeconds = 0;
  const [isRaffleTasksDialogOpen, setIsRaffleTasksDialogOpen] = useState(false);
  const [isInvitationCodeDialogOpen, setIsInvitationCodeDialogOpen] = useState(false);

  // 使用新的 hook 从 store 中获取用户活动奖励数据
  const {
    data: userActivityReward,
    isLoading: isUserActivityRewardLoading,
    refetch: refetchUserActivityReward,
    ticketNumber,
    totalReceiveAmount,
    rewardPercent,
    totalReward,
    availableReward,
    usedMustWinTimes,
    failLimit,
    failTimes,
    level,
    mustWinLimit,
    points,
    todayJoin,
    todayJoinAt,
    isVerifiedFollow,
  } = useUserActivityReward({
    eventId: eventInfo.id.toString(),
    enabled: !!eventInfo.id,
  });

  // 冷却倒计时效果
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (cooldownSeconds > 0) {
      timer = setTimeout(() => {
        setCooldownSeconds(cooldownSeconds - 1);
      }, 1000);
    } else if (isCooldown) {
      setIsCooldown(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [cooldownSeconds, isCooldown]);

  const handleRaffle = async () => {
    if (!eventInfo?.id || isRaffling || isCooldown) return;

    try {
      setIsRaffling(true);
      // 立即打开弹窗显示加载状态
      setIsRaffleResultDialogOpen(true);
      setRaffleResult(null); // 清空之前的结果

      const response: any = await raffle({ active_id: eventInfo.id.toString() });

      if (response.code === 200) {
        // 刷新用户活动奖励数据
        await refetchUserActivityReward();

        // 设置抽奖结果
        setRaffleResult(response.data);

        // 调用父组件的回调（如果需要刷新其他数据）
        // onRefreshUserReward?.(response.data);
      } else {
        toast.error(response.msg || t('raffle_failed'));
        // 如果出错，关闭弹窗
        setIsRaffleResultDialogOpen(false);
      }
    } catch (error) {
      console.error('Raffle failed:', error);
      toast.error(t('raffle_failed'));
      // 如果出错，关闭弹窗
      setIsRaffleResultDialogOpen(false);
    } finally {
      setIsRaffling(false);
    }
  };

  // 处理抽奖结果对话框关闭
  const handleRaffleResultDialogClose = () => {
    setIsRaffleResultDialogOpen(false);
    // 启动5秒冷却
    setIsCooldown(true);
    setCooldownSeconds(raffleSeconds);
  };

  const handleRaffleTasks = () => {
    setIsRaffleTasksDialogOpen(true);
  };

  const handleRaffleTasksDialogClose = () => {
    setIsRaffleTasksDialogOpen(false);
  };

  const handleInvitationCodeDialogOpen = () => {
    setIsInvitationCodeDialogOpen(true);
  };

  const handleInvitationCodeDialogClose = () => {
    setIsInvitationCodeDialogOpen(false);
  };

  return (
    <div className="bg-primary/5 relative space-y-6 overflow-hidden rounded-xl p-6 sm:rounded-3xl">
      {/* Header with gift icon */}
      <div className="flex flex-col items-center space-y-2 text-center">
        <div className="flex items-center justify-center">
          <Gift className="text-primary !h-8 !w-8 sm:!h-10 sm:!w-10" />
        </div>

        <div className="">
          <h3 className="text-primary text-md mb-1 sm:text-base">
            {/* {t('each_tweet_counts_raffle_entry')} */}
            {t('one_tweet_one_entry')}
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <p className="sm:text-md text-primary/50 bg-primary/10 flex-1 rounded-full px-8 py-1 text-sm whitespace-nowrap">
              {t('reward_rate')}: <span className="">{rewardPercent * 100}%</span>
            </p>
            <p className="sm:text-md text-primary/50 bg-primary/10 flex-1 rounded-full px-2 py-1 text-sm whitespace-nowrap">
              {t.rich('win_up_to', {
                amount: (chunks) => <span className="text-primary font-bold">${10}</span>,
              })}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-destructive/20 absolute top-0 right-0 flex flex-col items-center justify-center rounded-bl-xl p-4 py-2 sm:rounded-bl-3xl">
        <span className="text-destructive text-3xl font-bold">{level}</span>
        <span className="text-muted-foreground/50 text-sm">{t('my_rank')}</span>
      </div>

      {/* Tickets and Rewards Info */}
      <div className="space-y-2">
        <div className="bg-background flex flex-wrap items-center justify-between gap-2 rounded-xl p-2 pl-2 sm:rounded-3xl sm:pl-4">
          <div className="flex items-center gap-1">
            <span className="sm:text-md text-muted-foreground/80 text-sm">{t('my_tickets')}:</span>
            <span className="sm:text-md text-sm">{ticketNumber}</span>
            {!isVerifiedFollow && (
              <Button
                onClick={handleRaffleTasks}
                size="sm"
                className={cn(
                  'bg-primary/5 border-primary/20 text-primary/50 !shadow-primary/10 hover:bg-primary/10 hover:text-primary ml-2 !h-auto !rounded-full border px-2 !py-0.5 !shadow-xl'
                )}
              >
                {t('want_more')}
              </Button>
            )}
          </div>
          {usedMustWinTimes < mustWinLimit && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="ml-auto flex items-center justify-center">
                  <CircularProgress
                    percentage={Number((rewardPercent * 100).toFixed(1))}
                    size={48}
                    strokeWidth={5}
                    className="text-primary"
                  >
                    <span className="text-muted-foreground/40 text-xs font-medium">
                      {Number((rewardPercent * 100).toFixed(1))}%
                    </span>
                  </CircularProgress>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="max-w-[150px] text-sm sm:max-w-[280px]">
                  {t('reward_percent_tip', { symbol: eventInfo?.token_type || '' })}
                </div>
              </TooltipContent>
            </Tooltip>
          )}
          <Button
            onClick={handleRaffle}
            disabled={!eventInfo?.is_verified || isRaffling || isCooldown || ticketNumber === 0}
            className="h-10 w-full rounded-md bg-gradient-to-r from-[#007AFF] from-0% via-[#D4F5D0] via-30% to-[#007AFF] to-80% bg-[length:200%_100%] bg-[position:100%_50%] !px-2 text-sm transition-[background-position] duration-200 ease-in-out hover:bg-[position:-60%_50%] disabled:cursor-not-allowed disabled:opacity-50 sm:!h-auto sm:w-auto sm:!rounded-full sm:!px-4 sm:!text-base"
          >
            {isRaffling ? (
              <Loader2 className="!h-4 !w-4 animate-spin sm:!h-6 sm:!w-6" />
            ) : (
              <Dices className="!h-4 !w-4 sm:!h-6 sm:!w-6" />
            )}
            {isRaffling
              ? t('raffling')
              : isCooldown
                ? `${t('raffle')} (${cooldownSeconds}s)`
                : t('raffle')}
          </Button>
        </div>

        <div className="bg-background flex flex-wrap items-center justify-between gap-2 rounded-xl p-2 pl-2 sm:rounded-3xl sm:pl-4">
          <div className="flex items-center gap-1">
            <span className="sm:text-md text-muted-foreground/80 text-sm">
              {t('available_rewards')}:
            </span>
            <span className="sm:text-md text-sm">
              {totalReceiveAmount} {eventInfo?.token_type || ''}
            </span>
          </div>
          <div className="ml-auto rounded-full p-2 shadow-sm">
            <ChainIcon
              chainType={eventInfo?.chain_type as ChainType}
              className="size-6 rounded-full sm:size-8"
              width={32}
              height={32}
            />
          </div>
          <Button
            onClick={onClaim}
            disabled={totalReceiveAmount === 0}
            className="h-9 w-full rounded-md bg-gradient-to-r from-[#01CF7F] from-0% via-[#D4F5D0] via-30% to-[#01CF7F] to-80% bg-[length:200%_100%] bg-[position:100%_50%] !px-2 text-sm transition-[background-position] duration-200 ease-in-out hover:bg-[position:-60%_50%] disabled:cursor-not-allowed disabled:opacity-50 sm:!h-auto sm:w-auto sm:!rounded-full sm:!px-4 sm:!text-base"
          >
            <HandCoins className="!h-4 !w-4 sm:!h-6 sm:!w-6" />
            {t('claim')}
          </Button>
        </div>

        <div className="bg-background flex flex-wrap items-center justify-between gap-2 rounded-xl p-2 pl-2 sm:rounded-3xl sm:pl-4">
          <div className="flex h-9 items-center gap-1">
            <span className="sm:text-md text-muted-foreground/80 text-sm">{t('my_points')}:</span>
            <span className="sm:text-md text-sm">{points}</span>
          </div>
          <SpaceButton
            onClick={handleInvitationCodeDialogOpen}
            className="!h-12 w-full min-w-24 px-4 sm:!w-auto"
          >
            <span className="sm:text-md text-sm">{t('invitation')}</span>
          </SpaceButton>
        </div>
      </div>

      {/* 抽奖结果对话框 */}
      <DialogRaffleResult
        isOpen={isRaffleResultDialogOpen}
        isLoading={isRaffling}
        onClose={handleRaffleResultDialogClose}
        raffleResult={raffleResult}
        eventInfo={eventInfo}
      />

      {/* 抽奖任务对话框 */}
      <DialogRaffleTicketTasks
        isOpen={isRaffleTasksDialogOpen}
        onClose={handleRaffleTasksDialogClose}
      />

      {/* 邀请码对话框 */}
      <DialogInvitationCode
        isOpen={isInvitationCodeDialogOpen}
        onClose={handleInvitationCodeDialogClose}
        eventInfo={eventInfo}
      />
    </div>
  );
}
