import React, { useState, useCallback } from 'react';
import { Button } from '@shadcn/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from '@shadcn/components/ui/dialog';
import { Success, Fail, TwitterX } from '@assets/svg';
import { useTranslations } from 'next-intl';
import { useAppSelector } from '@store/hooks';
import { cn } from '@shadcn/lib/utils';
import { Gift, Loader2 } from 'lucide-react';
import LoaderCircle from '@ui/loading/loader-circle';
import TokenIcon from 'app/components/TokenIcon';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useParams } from 'next/navigation';
import { getTwitterShareCallback } from '@libs/request';
import { toast } from 'sonner';
import useUserActivityReward from '@hooks/useUserActivityReward';
import DialogRaffleTicketTasks from './DialogRaffleTicketTasks';
import { useEventTokenInfo } from '@hooks/useEventTokenInfo';
import { IEventInfoResponseData } from '@libs/request';
interface DialogRaffleResultProps {
  isOpen: boolean;
  onClose: () => void;
  raffleResult: {
    is_win: boolean;
    receive_amount: number;
  } | null;
  isLoading: boolean;
  eventInfo?: IEventInfoResponseData;
}

export default function DialogRaffleResult({
  isOpen,
  onClose,
  raffleResult,
  isLoading = true,
  eventInfo,
}: DialogRaffleResultProps) {
  const t = useTranslations('common');
  const { symbol, iconType } = useEventTokenInfo(eventInfo);
  const { eventId } = useParams();

  // 分享相关状态
  const [isShared, setIsShared] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<'success' | 'failed' | null>(null);
  // 新的 Raffle Ticket Tasks 弹窗状态
  const [isRaffleTasksOpen, setIsRaffleTasksOpen] = useState(false);
  // 使用新的 hook 从 store 中获取用户活动奖励数据
  const {
    data: userActivityReward,
    isLoading: isUserActivityRewardLoading,
    refetch: refetchUserActivityReward,
    isVerifiedFollow,
  } = useUserActivityReward({
    eventId: eventId as string,
    enabled: !!eventId,
  });

  const handleClose = useCallback(() => {
    // 重置所有状态
    setIsShared(false);
    setIsVerifying(false);
    setVerifyResult(null);
    setIsRaffleTasksOpen(false);
    onClose();
  }, [onClose]);

  const handleOpenRaffleTasks = useCallback(() => {
    handleClose();
    setIsRaffleTasksOpen(true);
  }, [handleClose]);

  const handleCloseRaffleTasks = useCallback(() => {
    setIsRaffleTasksOpen(false);
  }, []);

  const handleShareOnX = useCallback(() => {
    const tweetText = `I just won ${raffleResult?.receive_amount} ${symbol || ''} in the raffle! Check it out: ${window.location.origin}/market_events/${eventId}`;
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
    // 分享后设置为已分享状态
    setIsShared(true);
  }, [raffleResult?.receive_amount, symbol, eventId]);

  const handleVerifyShare = useCallback(async () => {
    if (!eventId) return;

    try {
      setIsVerifying(true);
      const response = await getTwitterShareCallback({
        active_id: eventId as string,
      });

      if (response.code === 200) {
        const receivedTickets = response.data?.number;
        refetchUserActivityReward();
        if (receivedTickets === 1) {
          setVerifyResult('success');
          toast.success(t('share_success_extra_ticket'));
        } else {
          setVerifyResult('failed');
        }
      } else {
        setVerifyResult('failed');
      }
    } catch (error) {
      console.error('分享验证失败:', error);
      setVerifyResult('failed');
    } finally {
      setIsVerifying(false);
    }
  }, [eventId, t]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogClose asChild></DialogClose>
      <DialogContent
        className="border-border flex max-h-[90vh] w-96 max-w-full flex-col gap-0 overflow-hidden bg-transparent p-4 shadow-none sm:w-96 sm:max-w-full sm:p-0"
        nonClosable
      >
        {/* Header */}
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div
          className={cn(
            'bg-background space-y-4 rounded-t-xl rounded-b-xl p-6 sm:rounded-t-2xl sm:rounded-b-2xl'
          )}
        >
          {isLoading ? (
            // 加载状态
            <div className="flex flex-col items-center justify-center py-10">
              <LoaderCircle text={`${t('raffling')}...`} />
            </div>
          ) : raffleResult?.is_win ? (
            // 中奖弹窗
            <div className="flex flex-col items-center justify-center space-y-4">
              {isVerifying ? (
                // 验证中状态 - 完全替换UI
                <div className="flex flex-col items-center justify-center py-10">
                  <LoaderCircle text={`${t('verifying')}...`} />
                </div>
              ) : verifyResult === 'success' ? (
                // 验证成功状态 - 完全替换UI
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full">
                    <Success className="w-16" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold">{t('share_verified_success')}</p>
                    <p className="text-muted-foreground text-sm">{t('extra_ticket_received')}</p>
                  </div>
                  <Button onClick={handleClose} className="!h-auto !rounded-lg px-8">
                    {t('done')}
                  </Button>
                </div>
              ) : verifyResult === 'failed' ? (
                // 验证失败状态 - 完全替换UI
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full">
                    <Fail className="w-16" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold">{t('share_verification_failed')}</p>
                    <p className="text-muted-foreground text-sm">
                      {t('share_verification_failed_desc')}
                    </p>
                  </div>
                  <div className="flex w-full gap-2">
                    <Button
                      onClick={handleClose}
                      variant="secondary"
                      className="!h-auto flex-1 !rounded-lg"
                    >
                      {t('done')}
                    </Button>
                    <Button
                      onClick={() => {
                        setVerifyResult(null);
                        handleVerifyShare();
                      }}
                      className="!h-auto flex-1 !rounded-lg"
                    >
                      {t('try_again')}
                    </Button>
                  </div>
                </div>
              ) : (
                // 默认中奖状态 - 显示完整的中奖UI
                <div className="relative flex flex-col items-center justify-center space-y-4 overflow-hidden">
                  <DotLottieReact
                    src="/lottie/celebrations.lottie"
                    autoplay
                    loop
                    speed={1}
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    style={{ zIndex: 0 }}
                    onLoad={() => console.log('Lottie animation loaded')}
                    onError={(error) => console.error('Lottie animation error:', error)}
                  />
                  <div className="relative z-10 flex items-center justify-center pt-4">
                    <div className="relative z-10">
                      <Success className="w-16" />
                      <div className="absolute top-0 left-[-50%] z-[-1] h-[110%] w-[110%] rounded-full bg-[#D4F5D0] blur-xl" />
                    </div>
                    <div className="relative z-0 -ml-4 h-12 w-12">
                      <TokenIcon type={iconType || ''} className="h-full w-full" />
                      <div className="absolute top-0 left-[50%] z-[-1] h-[110%] w-[110%] rounded-full bg-[#BFFF00] blur-xl" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">
                      {raffleResult?.receive_amount} {symbol || ''}
                    </p>
                    <p className="text-md font-semibold">{t('congratulations')}</p>
                    <p className="mt-2 text-sm">
                      {t('congratulations_description', { symbol: symbol || '' })}
                    </p>
                  </div>
                  <div className="flex w-full gap-2">
                    <Button
                      onClick={handleClose}
                      variant="secondary"
                      className="!h-auto flex-1 !rounded-lg"
                    >
                      {t('done')}
                    </Button>
                    <Button
                      onClick={isShared ? handleVerifyShare : handleShareOnX}
                      className="!h-auto flex-1 !rounded-lg bg-black text-white"
                    >
                      <TwitterX className="h-4 w-4" />
                      {isShared ? t('already_shared') : t('share_on_x')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // 未中奖弹窗
            <div className="flex flex-col items-center justify-center space-y-4 pt-4">
              <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full">
                <Gift className="text-primary h-10 w-10" />
                <div className="bg-primary/20 absolute top-0 left-[-50%] z-[-1] h-[110%] w-[110%] rounded-full blur-xl" />
                <div className="absolute top-0 left-[50%] z-[-1] h-[110%] w-[110%] rounded-full bg-[#BFFF00] blur-xl" />
              </div>
              <div className="text-center">
                {/* <p className="text-md font-semibold">{t('better_luck_next_time')}</p> */}
                <p className="text-xl font-bold">{t('points_number', { number: 100 })}</p>
                <p className="sm:text-md mt-2 text-sm">{t('congratulations_reward_sent')}</p>
              </div>
              <div className="flex w-full gap-2">
                <Button
                  onClick={handleClose}
                  variant="secondary"
                  className={cn('!h-auto flex-1 !rounded-lg')}
                >
                  {t('got_it')}
                </Button>
                {!isVerifiedFollow && (
                  <Button onClick={handleOpenRaffleTasks} className="!h-auto flex-1 !rounded-lg">
                    {t('want_more_raffles?')}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
      {/* Raffle Ticket Tasks Dialog */}
      <DialogRaffleTicketTasks isOpen={isRaffleTasksOpen} onClose={handleCloseRaffleTasks} />
    </Dialog>
  );
}
