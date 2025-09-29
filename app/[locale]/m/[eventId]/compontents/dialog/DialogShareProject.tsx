import React, { useCallback, useState } from 'react';
import { Button } from '@shadcn/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from '@shadcn/components/ui/dialog';
import { CopyIcon, Share2 } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Fail, Success, TwIcon, Twitter, Twitter2, TwitterBlack } from '@assets/svg';
import { toast } from 'sonner';
import { getTwitterShareCallback } from '@libs/request';
import LoaderCircle from '@ui/loading/loader-circle';
import useUserActivityReward from '@hooks/useUserActivityReward';

interface DialogShareProjectProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DialogShareProject({ isOpen, onClose }: DialogShareProjectProps) {
  const t = useTranslations('common');
  const { eventId } = useParams();
  const searchParams = useSearchParams();
  const project = searchParams.get('project');
  // 分享相关状态
  const [isShared, setIsShared] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<'success' | 'failed' | null>(null);
  const [receivedTickets, setReceivedTickets] = useState(0);

  const { refetch: refetchUserActivityReward } = useUserActivityReward({
    eventId: eventId as string,
    enabled: !!eventId,
  });

  // 构建分享链接
  const shareLink = `${window.location.origin}/market_events/${eventId}?project=${project}`;

  // 预编辑的推特文案
  const tweetText = `🚀 发现了一个超棒的项目！\n\n🔗 项目链接：${shareLink}\n\n#Web3 #区块链 #创新项目`;

  const handleClose = useCallback(() => {
    // 重置所有状态
    setIsShared(false);
    setIsVerifying(false);
    setVerifyResult(null);
    onClose();
  }, [onClose]);

  // 跳转到推特发帖
  const handleShareOnTwitter = useCallback(() => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank');
    // 分享后设置为已分享状态
    setIsShared(true);
    handleVerifyShare();
  }, [tweetText, project]);

  const handleVerifyShare = useCallback(async () => {
    if (!eventId) return;

    try {
      setIsVerifying(true);
      const response = await getTwitterShareCallback({
        active_id: eventId as string,
      });

      if (response.code === 200) {
        const tickets = response.data?.number;
        setReceivedTickets(tickets);
        // if (tickets === 1) {
        refetchUserActivityReward();
        setVerifyResult('success');
        toast.success(t('share_success_extra_ticket'));
        // } else {
        //   setVerifyResult('failed');
        // }
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

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(shareLink);
    toast.success(t('copied'));
  }, [shareLink, t]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogClose asChild></DialogClose>
      <DialogContent
        className="border-border flex max-h-[90vh] w-96 max-w-full flex-col gap-0 overflow-hidden bg-transparent p-4 shadow-none sm:w-96 sm:max-w-full sm:p-0"
        nonClosable
      >
        {/* Header */}
        <DialogHeader className="bg-primary gap-0 rounded-t-xl p-2 text-center text-white sm:rounded-t-2xl sm:p-4">
          <DialogTitle className="text-center text-base font-semibold text-white">
            {t('share_project')}
          </DialogTitle>
          <DialogDescription>
            <p className="text-md text-center text-white opacity-90">
              {t('share_project_description')}
            </p>
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="bg-background space-y-4 rounded-b-xl p-6 sm:rounded-b-2xl">
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
                <p className="text-muted-foreground text-sm">
                  {receivedTickets !== 0
                    ? t('extra_ticket_received')
                    : t('raffle_tickets_received')}
                </p>
              </div>
              <Button onClick={handleClose} className="!h-auto w-40 !rounded-lg px-8">
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
            // 默认状态 - 显示原有的分享UI
            <>
              {/* Project Link Field */}
              <div className="border-border flex items-center gap-2 rounded-lg border px-3 py-2">
                <span className="text-muted-foreground flex-1 truncate text-sm">{shareLink}</span>
                <CopyIcon
                  className="text-muted-foreground h-4 w-4 cursor-pointer"
                  onClick={handleCopyLink}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={handleClose}
                  className="border-border hover:bg-muted-foreground/10 !h-auto flex-1 !rounded-lg"
                >
                  {t('done')}
                </Button>
                <Button
                  onClick={isShared ? handleVerifyShare : handleShareOnTwitter}
                  className="bg-primary hover:bg-primary/90 !h-auto flex-1 !rounded-lg text-white"
                >
                  {isShared ? t('already_shared') : t('share_on_x')}
                  <span className="text-xl text-white">𝕏</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
