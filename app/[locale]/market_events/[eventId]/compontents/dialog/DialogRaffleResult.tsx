import React from 'react';
import { Button } from '@shadcn/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from '@shadcn/components/ui/dialog';
import { Success, Fail } from '@assets/svg';
import { useTranslations } from 'next-intl';
import { useAppSelector } from '@store/hooks';
import { cn } from '@shadcn/lib/utils';
import { Gift } from 'lucide-react';
import LoaderCircle from '@ui/loading/loader-circle';
import TokenIcon from 'app/components/TokenIcon';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
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

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogClose asChild>
        <Button variant="outline" className="absolute top-4 right-4">
          {/* <X className="h-5 w-5" /> */}
        </Button>
      </DialogClose>
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
            <div className="relative flex flex-col items-center justify-center space-y-4 overflow-hidden">
              <DotLottieReact
                src="/lottie/celebrations.json"
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
                  <TokenIcon type={payTokenInfo?.iconType as string} className="h-full w-full" />
                  <div className="absolute top-0 left-[50%] z-[-1] h-[110%] w-[110%] rounded-full bg-[#BFFF00] blur-xl" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">
                  {raffleResult?.receive_amount} {payTokenInfo?.symbol || ''}
                </p>
                {/* <p className="text-md font-semibold">{t('congratulations')}</p> */}
                {/* <p className="text-sm">
                  {t('raffle_won_amount', {
                    amount: raffleResult?.receive_amount || 0,
                    symbol: payTokenInfo?.symbol || '',
                  })}
                </p> */}
                <p className="text-muted-foreground mt-2 text-sm">{t('go_to_claim_your_reward')}</p>
              </div>
              <div className="flex w-40">
                <Button
                  onClick={handleClose}
                  variant="secondary"
                  className="!h-auto flex-1 !rounded-lg"
                >
                  {t('done')}
                </Button>
              </div>
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
