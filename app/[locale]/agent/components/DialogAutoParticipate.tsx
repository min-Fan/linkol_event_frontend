import React, { useState, useCallback } from 'react';
import { Button } from '@shadcn/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@shadcn/components/ui/dialog';
import { Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@shadcn/lib/utils';
import { updateActivityAutoParticipate } from '@libs/request';
import { toast } from 'sonner';
import { IMarketEventsGetActivesLoginList } from '@libs/request';
import { LucideBot } from '@assets/svg';
import LoaderCircle from '@ui/loading/loader-circle';

interface DialogAutoParticipateProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  campaign: IMarketEventsGetActivesLoginList | null;
}

export default function DialogAutoParticipate({
  isOpen,
  onClose,
  onSuccess,
  campaign,
}: DialogAutoParticipateProps) {
  const t = useTranslations('common');
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleAutoParticipate = useCallback(async () => {
    if (!campaign) return;

    try {
      setIsLoading(true);

      const newStatus = campaign.is_auto_join ? 'off' : 'on';

      const res: any = await updateActivityAutoParticipate({
        active_id: campaign.id,
        option: newStatus,
      });

      if (res.code === 200) {
        toast.success(
          newStatus === 'on' ? t('auto_participate_enabled') : t('auto_participate_disabled')
        );
        onSuccess?.();
        onClose();
      } else {
        toast.error(res.msg || t('operation_failed'));
      }
    } catch (error) {
      console.error('Failed to update auto participate:', error);
      toast.error(t('operation_failed'));
    } finally {
      setIsLoading(false);
    }
  }, [campaign, t, onSuccess, onClose]);

  const handleClose = useCallback(() => {
    setIsLoading(false);
    onClose();
  }, [onClose]);

  if (!campaign) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogClose asChild></DialogClose>
      <DialogContent
        className="border-border flex max-h-[90vh] w-96 max-w-full flex-col gap-0 overflow-hidden bg-transparent p-4 shadow-none sm:w-[450px] sm:max-w-full sm:p-0"
        nonClosable
      >
        {/* Header */}
        <DialogHeader className="bg-primary gap-0 rounded-t-xl p-2 text-center text-white sm:rounded-t-2xl sm:p-4">
          <DialogTitle className="text-center text-base font-semibold text-white">
            {t('auto_participate_settings')}
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className={cn('bg-background space-y-4 rounded-b-xl p-6 sm:rounded-b-2xl')}>
          {isLoading ? (
            // 加载状态
            <div className="flex flex-col items-center justify-center py-10">
              <LoaderCircle text={`${t('processing')}...`} />
            </div>
          ) : (
            // 确认状态
            <div className="flex flex-col items-center justify-center space-y-4">
              {/* 图标 */}
              <div className="relative z-10 flex items-center justify-center py-4">
                <div className="relative z-10">
                  <LucideBot className="w-16" />
                  <div className="bg-primary/50 absolute top-0 left-[-55%] z-[-1] h-[110%] w-[110%] rounded-full blur-xl" />
                  <div className="absolute top-0 left-[55%] z-[-1] h-[110%] w-[110%] rounded-full bg-[#BFFF00] blur-xl" />
                </div>
              </div>

              {/* 标题和描述 */}
              <div className="mb-6 text-center">
                <p className="text-sm font-bold sm:text-base">
                  {campaign.is_auto_join
                    ? t('disable_auto_participate')
                    : t('enable_auto_participate')}
                </p>
                <p className="text-muted-foreground mt-2 text-sm">
                  {t('auto_participate_description')}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {t('campaign')}: {campaign.title}
                </p>
              </div>

              {/* 按钮 */}
              <div className="flex w-full gap-2">
                <Button
                  onClick={handleClose}
                  variant="secondary"
                  className="!h-auto flex-1 !rounded-lg"
                  disabled={isLoading}
                >
                  {t('cancel')}
                </Button>
                <Button
                  onClick={handleToggleAutoParticipate}
                  disabled={isLoading}
                  className="!h-auto flex-1 !rounded-lg"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {campaign.is_auto_join ? t('disable') : t('enable')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
