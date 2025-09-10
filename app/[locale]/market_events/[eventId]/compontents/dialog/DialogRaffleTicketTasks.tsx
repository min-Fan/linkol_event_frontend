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
import { cn } from '@shadcn/lib/utils';
import { ExternalLink } from 'lucide-react';
import LoaderCircle from '@ui/loading/loader-circle';

interface DialogRaffleTicketTasksProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DialogRaffleTicketTasks({ isOpen, onClose }: DialogRaffleTicketTasksProps) {
  const t = useTranslations('common');

  // 任务完成状态
  const [twitterFollowed, setTwitterFollowed] = useState(false);
  const [telegramJoined, setTelegramJoined] = useState(false);

  // 验证相关状态
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<'success' | 'failed' | null>(null);

  const handleClose = useCallback(() => {
    // 重置所有状态
    setTwitterFollowed(false);
    setTelegramJoined(false);
    setIsVerifying(false);
    setVerifyResult(null);
    onClose();
  }, [onClose]);

  const handleFollowTwitter = useCallback(() => {
    // 打开 Twitter 关注页面
    window.open('https://twitter.com/linkol_ai', '_blank');
    setTwitterFollowed(true);
  }, []);

  const handleJoinTelegram = useCallback(() => {
    // 打开 Telegram 群组
    window.open('https://t.me/linkol_tg', '_blank');
    setTelegramJoined(true);
  }, []);

  const handleVerifyTasks = useCallback(async () => {
    if (!twitterFollowed || !telegramJoined) {
      return;
    }

    try {
      setIsVerifying(true);

      // 模拟 API 请求
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 模拟随机成功/失败结果
      const isSuccess = Math.random() > 0.3; // 70% 成功率

      if (isSuccess) {
        setVerifyResult('success');
      } else {
        setVerifyResult('failed');
      }
    } catch (error) {
      console.error('任务验证失败:', error);
      setVerifyResult('failed');
    } finally {
      setIsVerifying(false);
    }
  }, [twitterFollowed, telegramJoined]);

  const handleLater = useCallback(() => {
    handleClose();
  }, [handleClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogClose asChild></DialogClose>
      <DialogContent
        className="border-border flex max-h-[90vh] w-96 max-w-full flex-col gap-0 overflow-hidden bg-transparent p-2 shadow-none sm:w-[450px] sm:max-w-full sm:p-0"
        nonClosable
      >
        {/* Header */}
        <DialogHeader className="bg-primary gap-0 rounded-t-xl p-2 text-center text-white sm:rounded-t-2xl sm:p-4">
          <DialogTitle className="text-center text-base text-white">
            {isVerifying ? t('verifying') : t('raffle_ticket_tasks')}
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className={cn('bg-background space-y-4 rounded-b-xl p-6 sm:rounded-b-2xl')}>
          {isVerifying ? (
            // 验证中状态
            <div className="flex flex-col items-center justify-center py-10">
              <LoaderCircle text={`${t('verifying')}...`} />
            </div>
          ) : verifyResult === 'success' ? (
            // 验证成功状态
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full">
                <Success className="w-16" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">{t('raffle_tasks_completed')}</p>
                <p className="text-muted-foreground text-sm">{t('raffle_tickets_received')}</p>
              </div>
              <Button
                onClick={handleClose}
                variant="secondary"
                className="!h-auto w-40 !rounded-lg px-8"
              >
                {t('done')}
              </Button>
            </div>
          ) : verifyResult === 'failed' ? (
            // 验证失败状态
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full">
                <Fail className="w-16" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">{t('raffle_tasks_verification_failed')}</p>
                <p className="text-muted-foreground text-sm">
                  {t('raffle_tasks_verification_failed_desc')}
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
                    handleVerifyTasks();
                  }}
                  className="!h-auto flex-1 !rounded-lg"
                >
                  {t('try_again')}
                </Button>
              </div>
            </div>
          ) : (
            // 默认任务列表状态
            <div className="space-y-6">
              {/* Description */}
              <div className="mx-auto max-w-full text-center sm:max-w-[60%]">
                <p className="text-md font-medium">{t('raffle_tasks_description')}</p>
              </div>

              {/* Tasks */}
              <div className="space-y-4">
                {/* Twitter Task */}
                <div className="flex items-center gap-1">
                  <div className="">
                    <p className="text-md font-medium">{t('raffle_task_follow_twitter')}</p>
                  </div>
                  <Button
                    onClick={handleFollowTwitter}
                    variant={twitterFollowed ? 'secondary' : 'default'}
                    size="sm"
                    className={cn(
                      'bg-primary/5 border-primary/20 text-primary/50 !shadow-primary/10 hover:bg-primary/10 hover:text-primary !h-auto !rounded-full border px-2 !py-0.5 !shadow-xl',
                      twitterFollowed && 'bg-green-100 text-green-700 hover:bg-green-200'
                    )}
                  >
                    {twitterFollowed ? t('completed') : t('follow_twitter')}
                  </Button>
                </div>

                {/* Telegram Task */}
                <div className="flex items-center gap-1">
                  <div className="">
                    <p className="text-md font-medium">{t('raffle_task_join_telegram')}</p>
                  </div>
                  <Button
                    onClick={handleJoinTelegram}
                    variant={telegramJoined ? 'secondary' : 'default'}
                    size="sm"
                    className={cn(
                      'bg-primary/5 border-primary/20 text-primary/50 !shadow-primary/10 hover:bg-primary/10 hover:text-primary !h-auto !rounded-full border px-2 !py-0.5 !shadow-xl',
                      telegramJoined && 'bg-green-100 text-green-700 hover:bg-green-200'
                    )}
                  >
                    {telegramJoined ? t('completed') : t('join_telegram')}
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex w-full gap-2">
                <Button
                  onClick={handleLater}
                  variant="secondary"
                  className="!h-auto flex-1 !rounded-lg"
                >
                  {t('later')}
                </Button>
                <Button
                  onClick={handleVerifyTasks}
                  disabled={!twitterFollowed || !telegramJoined}
                  className={cn(
                    '!h-auto flex-1 !rounded-lg',
                    (!twitterFollowed || !telegramJoined) && 'cursor-not-allowed opacity-50'
                  )}
                >
                  {t('verify')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
