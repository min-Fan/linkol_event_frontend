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
interface DialogRaffleResultProps {
  isOpen: boolean;
  onClose: () => void;
  raffleResult: {
    is_win: boolean;
    receive_amount: number;
  } | null;
  isLoading: boolean;
}

export default function DialogRaffleResult({
  isOpen,
  onClose,
  raffleResult,
  isLoading = true,
}: DialogRaffleResultProps) {
  const t = useTranslations('common');
  const payTokenInfo = useAppSelector((state) => state.userReducer?.pay_token_info);
  const { eventId } = useParams();

  // 分享相关状态
  const [isShared, setIsShared] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<'success' | 'failed' | null>(null);

  const handleClose = useCallback(() => {
    // 重置所有状态
    setIsShared(false);
    setIsVerifying(false);
    setVerifyResult(null);
    onClose();
  }, [onClose]);

  const handleShareOnX = useCallback(() => {
    const tweetText = `I just won ${raffleResult?.receive_amount} ${payTokenInfo?.symbol || ''} in the raffle! Check it out: ${window.location.origin}/market_events/${eventId}`;
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
    // 分享后设置为已分享状态
    setIsShared(true);
  }, [raffleResult?.receive_amount, payTokenInfo?.symbol, eventId]);

  const handleVerifyShare = useCallback(async () => {
    if (!eventId) return;

    try {
      setIsVerifying(true);
      const response = await getTwitterShareCallback({
        active_id: eventId as string,
      });

      if (response.code === 200) {
        const receivedTickets = response.data?.number;
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
        className="border-border flex max-h-[90vh] w-96 max-w-full flex-col gap-0 overflow-hidden bg-transparent p-2 shadow-none sm:w-96 sm:max-w-full sm:p-0"
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
                      <TokenIcon
                        type={payTokenInfo?.iconType as string}
                        className="h-full w-full"
                      />
                      <div className="absolute top-0 left-[50%] z-[-1] h-[110%] w-[110%] rounded-full bg-[#BFFF00] blur-xl" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">
                      {raffleResult?.receive_amount} {payTokenInfo?.symbol || ''}
                    </p>
                    <p className="text-md font-semibold">{t('congratulations')}</p>
                    <p className="mt-2 text-sm">
                      {t('congratulations_description', { symbol: payTokenInfo?.symbol || '' })}
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
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full">
                <Gift className="text-primary h-10 w-10" />
              </div>
              <div className="text-center">
                <p className="text-md font-semibold">{t('better_luck_next_time')}</p>
                <p className="text-muted-foreground text-sm">{t('no_reward_this_time')}</p>
                <p className="text-muted-foreground mt-2 text-sm">
                  {t('keep_participating_for_more_chances')}
                </p>
              </div>
              <div className="flex w-40">
                <Button
                  onClick={handleClose}
                  variant="secondary"
                  className="!h-auto flex-1 !rounded-lg"
                >
                  {t('got_it')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
