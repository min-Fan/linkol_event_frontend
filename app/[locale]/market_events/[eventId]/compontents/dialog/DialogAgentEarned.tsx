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
import { Check, DollarSign } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@shadcn/lib/utils';
import { IEventInfoResponseData } from '@libs/request';
import { useEventTokenInfo } from '@hooks/useEventTokenInfo';
import TokenIcon from 'app/components/TokenIcon';
import { Success } from '@assets/svg';

interface DialogAgentEarnedProps {
  isOpen: boolean;
  onClose: () => void;
  earnedAmount?: number;
  eventInfo?: IEventInfoResponseData;
}

export default function DialogAgentEarned({
  isOpen,
  onClose,
  earnedAmount = 1,
  eventInfo,
}: DialogAgentEarnedProps) {
  const t = useTranslations('common');
  const { symbol, iconType } = useEventTokenInfo({
    chain_type: eventInfo?.chain_type,
    token_type: eventInfo?.token_type,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogClose asChild></DialogClose>
      <DialogContent
        className="border-border flex max-h-[90vh] w-96 max-w-full flex-col gap-0 overflow-hidden bg-transparent p-4 shadow-none sm:w-96 sm:max-w-full sm:p-0"
        nonClosable
      >
        {/* Header */}
        <DialogHeader className="gap-0 rounded-t-xl bg-blue-600 p-4 text-center text-white sm:rounded-t-2xl">
          <DialogTitle className="text-center text-lg font-bold text-white">
            {t('congratulations')}
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className={cn('bg-background space-y-6 rounded-b-xl p-6 sm:rounded-b-2xl')}>
          <div className="flex flex-col items-center justify-center space-y-4">
            {/* 图标区域 */}
            <div className="relative z-10 flex items-center justify-center pt-4">
              <div className="relative z-10">
                <Success className="w-16" />
                <div className="absolute top-0 left-[-50%] z-[-1] h-[110%] w-[110%] rounded-full bg-[#D4F5D0] blur-xl" />
              </div>
              <div className="relative z-0 -ml-4 h-12 w-12">
                <TokenIcon
                  chainType={eventInfo?.chain_type}
                  tokenType={eventInfo?.token_type}
                  type={iconType || ''}
                  className="h-full w-full"
                />
                <div className="absolute top-0 left-[50%] z-[-1] h-[110%] w-[110%] rounded-full bg-[#BFFF00] blur-xl" />
              </div>
            </div>

            {/* 主要消息 */}
            <div className="text-center">
              <p className="text-sm font-bold sm:text-base">
                {t('your_agent_earned_for_you', {
                  amount: earnedAmount,
                  symbol: symbol,
                })}
              </p>
            </div>

            {/* 次要消息 */}
            <div className="text-center">
              <p className="text-sm sm:text-base">{t('find_more_details_in_event_interface')}</p>
            </div>

            {/* 按钮 */}
            <div className="flex w-full justify-center">
              <Button onClick={onClose} className="!h-auto w-40 !rounded-lg">
                {t('got_it')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
