import React, { useState } from 'react';
import { Button } from '@shadcn/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from '@shadcn/components/ui/dialog';
import { Clock, Copy } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Input } from '@shadcn/components/ui/input';
import { useTranslations } from 'next-intl';
import { IEventInfoResponseData } from '@libs/request';

interface DialogGuideProps {
  isOpen: boolean;
  onClose: () => void;
  eventInfo: IEventInfoResponseData;
}

export default function DialogGuide({ isOpen, onClose, eventInfo }: DialogGuideProps) {
  const t = useTranslations('common');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogClose asChild></DialogClose>
      <DialogContent
        className="border-border flex max-h-[90vh] w-full max-w-full flex-col gap-0 overflow-hidden bg-transparent p-4 shadow-none sm:w-[450px] sm:max-w-full sm:p-0"
        nonClosable
      >
        {/* Header */}
        <DialogHeader className="bg-primary gap-0 rounded-t-xl p-2 text-center text-white sm:rounded-t-2xl sm:p-4">
          <DialogTitle className="text-center text-base font-semibold text-white">
            {t('campaign_participation_guide')}
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="bg-background h-full space-y-4 overflow-y-auto rounded-b-xl p-4 pt-4 sm:rounded-b-2xl sm:p-4 sm:pt-8">
          {/* Step 1: Share the Campaign */}
          <div className="flex items-start gap-3">
            <div className="bg-primary/5 text-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium">
              1
            </div>
            <div className="flex-1">
              <h3 className="py-1 text-base font-semibold">{t('step_1_share_campaign')}</h3>
              <p className="text-muted-foreground mt-1 text-base">{t('step_1_description')}</p>
              <div className="border-primary bg-primary/5 mt-2 border-l-5 py-2 pl-3">
                <p className="text-sm italic">
                  {t('step_1_example', {
                    projectName: eventInfo?.project?.name || 'ProjectName',
                    hashtag: eventInfo?.project?.name || 'ProjectName',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Step 2: Wait for Verification */}
          <div className="flex items-start gap-3">
            <div className="bg-primary/5 text-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium">
              2
            </div>
            <div className="flex-1">
              <h3 className="py-1 text-base font-semibold">{t('step_2_wait_verification')}</h3>
              <p className="text-muted-foreground mt-1 text-base">{t('step_2_description')}</p>
              <div className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span className="text-muted-foreground/80">{t('step_2_time')}</span>
              </div>
            </div>
          </div>

          {/* Step 3: Check Your Result */}
          <div className="flex items-start gap-3">
            <div className="bg-primary/5 text-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium">
              3
            </div>
            <div className="flex-1">
              <h3 className="py-1 text-base font-semibold">{t('step_3_check_result')}</h3>
              <p className="text-muted-foreground mt-1 text-base">{t('step_3_description')}</p>
            </div>
          </div>

          {/* Step 4: Claim Your Reward */}
          <div className="flex items-start gap-3">
            <div className="bg-primary/5 text-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium">
              4
            </div>
            <div className="flex-1">
              <h3 className="py-1 text-base font-semibold">{t('step_4_claim_reward')}</h3>
              <p className="text-muted-foreground mt-1 text-base">{t('step_4_description')}</p>
            </div>
          </div>

          {/* Got it! Button */}
          <div className="pt-4">
            <Button
              onClick={onClose}
              className="bg-primary hover:bg-primary/90 !h-auto w-full !rounded-lg py-3 font-medium text-white"
            >
              {t('got_it')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
