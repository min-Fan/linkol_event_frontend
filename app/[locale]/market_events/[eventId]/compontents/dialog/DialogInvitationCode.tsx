import React, { useState, useEffect } from 'react';
import { Button } from '@shadcn/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from '@shadcn/components/ui/dialog';
import { Copy, Share2, Twitter, Loader2, ArrowDownZA, ArrowDown } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { IEventInfoResponseData, getInvitationCode } from '@libs/request';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { setInvitationCodeLoading, updateInvitationCode } from '@store/reducers/userSlice';
import { toast } from 'sonner';
import { CopyBtn, FluentShare, InviteIcon, TwIcon, TwitterBlack } from '@assets/svg';

interface DialogInvitationCodeProps {
  isOpen: boolean;
  onClose: () => void;
  eventInfo: IEventInfoResponseData;
}

export default function DialogInvitationCode({
  isOpen,
  onClose,
  eventInfo,
}: DialogInvitationCodeProps) {
  const t = useTranslations('common');
  const dispatch = useAppDispatch();
  const { eventId } = useParams();
  const [invitationCode, setInvitationCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // 从store中获取邀请码状态
  const invitationCodeState = useAppSelector((state) =>
    eventId ? state.userReducer?.invitationCode[eventId as string] : null
  );

  const currentUrl = window.location.origin + window.location.pathname;
  const shareUrl = `${currentUrl}?invite=${invitationCode}`;

  // 获取邀请码（支持静默模式）
  const fetchInvitationCode = async (silent = false) => {
    if (!eventInfo?.id) return;

    try {
      // 非静默模式才显示加载状态
      if (!silent) {
        setIsLoading(true);
        dispatch(setInvitationCodeLoading({ eventId: eventInfo.id.toString(), isLoading: true }));
      }

      const response: any = await getInvitationCode({ active_id: eventInfo.id.toString() });

      if (response.code === 200) {
        const code = response.data.invite_code;
        const invitedNum = response.data.invited_num;
        const ticketNum = response.data.ticket_num;

        // 非静默模式才更新本地状态
        if (!silent) {
          setInvitationCode(code);
        }

        // 总是更新store
        dispatch(
          updateInvitationCode({
            eventId: eventInfo.id.toString(),
            code,
            invitedNum,
            ticketNum,
          })
        );
      } else {
        // 非静默模式才显示错误提示
        if (!silent) {
          toast.error(response.msg);
        }
      }
    } catch (error) {
      console.error('get invitation code failed:', error);
      // 非静默模式才显示错误提示
      if (!silent) {
        toast.error(t('get_invitation_code_failed'));
      }
    } finally {
      // 非静默模式才重置加载状态
      if (!silent) {
        setIsLoading(false);
        dispatch(setInvitationCodeLoading({ eventId: eventInfo.id.toString(), isLoading: false }));
      }
    }
  };

  // 复制邀请码
  const handleCopyCode = async () => {
    if (!invitationCode) return;

    try {
      await navigator.clipboard.writeText(invitationCode);
      toast.success(t('copy_success'));
    } catch (error) {
      console.error('复制失败:', error);
      toast.error(t('copy_failed'));
    }
  };

  // 分享到Twitter
  const handleShareToTwitter = () => {
    if (!invitationCode) return;

    const text = `Join @linkol_ai and win amazing prizes! Use my invitation code: ${invitationCode} ${shareUrl}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
  };

  // 复制分享链接
  const handleShare = async () => {
    if (!invitationCode) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(t('copy_success'));
    } catch (error) {
      console.error('copy failed:', error);
      toast.error(t('copy_failed'));
    }
  };

  // 监听store中邀请码状态变化，同步到本地状态
  useEffect(() => {
    if (invitationCodeState?.code) {
      setInvitationCode(invitationCodeState.code);
    }
  }, [invitationCodeState?.code]);

  // 组件挂载时获取邀请码
  useEffect(() => {
    if (isOpen && eventInfo?.id) {
      // 如果store中已有邀请码，直接使用并静默更新
      if (invitationCodeState?.code) {
        setInvitationCode(invitationCodeState.code);
        // 静默更新数据，不显示加载状态
        fetchInvitationCode(true);
      } else {
        // 否则获取新的邀请码
        fetchInvitationCode(false);
      }
    }
  }, [isOpen, eventInfo?.id]);

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
            {t('share_linkol_invite')}
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-white">
            {t('invite_kols_earn_tickets')}
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="bg-background h-full space-y-6 overflow-y-auto rounded-b-xl p-4 pt-4 sm:rounded-b-2xl sm:p-6 sm:pt-6">
          {/* 邀请码卡片 */}
          <div className="bg-muted-foreground/5 border-border space-y-6 rounded-xl border p-2">
            <div className="flex items-center gap-2">
              <div className="text-blacks flex items-center justify-center rounded-full">
                <InviteIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">{t('invitation_code')}</h3>
            </div>

            {/* 邀请码显示区域 */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="bg-muted flex h-12 items-center justify-center rounded-lg">
                  <span className="text-muted-foreground/60 ml-2 text-sm">
                    {t('getting_invitation_code')}
                  </span>
                </div>
              ) : (
                <div className="bg-primary flex h-12 items-center justify-between rounded-lg px-4 pr-2 text-white">
                  <span className="max-w-full truncate font-mono text-lg font-bold">
                    {shareUrl}
                  </span>
                  {/* <Button
                    onClick={handleCopyCode}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    disabled={!invitationCode}
                  >
                    <Copy className="h-6 w-6" />
                  </Button> */}
                </div>
              )}

              {/* 分享按钮 */}
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="bg-muted-foreground/10 flex-1 !rounded-xl border-none"
                  disabled={!invitationCode}
                >
                  <CopyBtn className="h-4 w-4" />
                  {t('copy_invite_link')}
                </Button>
                <Button
                  onClick={handleShareToTwitter}
                  variant="outline"
                  className="bg-muted-foreground/10 flex-1 !rounded-xl border-none"
                  disabled={!invitationCode}
                >
                  <TwIcon className="h-4 w-4" />
                  {t('share_to_twitter')}
                </Button>
              </div>
            </div>
          </div>
          {/* 统计信息 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted-foreground/5 flex items-center justify-between gap-1 rounded-2xl p-4 py-2 text-center">
              <div className="text-muted-foreground/80 sm:text-md text-sm">{t('kols_invited')}</div>
              <div className="text-base font-bold">{invitationCodeState?.invitedNum || 0}</div>
            </div>
            <div className="bg-muted-foreground/5 flex items-center justify-between gap-1 rounded-2xl p-4 py-2 text-center">
              <div className="text-muted-foreground/80 sm:text-md text-sm">
                {t('raffle_tickets')}
              </div>
              <div className="text-base font-bold">{invitationCodeState?.ticketNum || 0}</div>
            </div>
          </div>

          {/* 使用说明 */}
          <div className="border-primary bg-primary/5 mt-2 rounded-tr-xl rounded-br-xl border-l-8 py-2 pl-3">
            <h4 className="text-primary text-md mb-4 font-semibold">
              {t('how_linkol_invites_work')}
            </h4>
            <div className="flex flex-col items-center justify-center gap-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground/80 text-md text-center">
                  {t('share_invitation_code_twitter')}
                </span>
              </div>
              <ArrowDown className="text-muted-foreground/80 h-4 w-4" />
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground/80 text-md text-center">
                  {t('they_join_using_code')}
                </span>
              </div>
              <ArrowDown className="text-muted-foreground/80 h-4 w-4" />
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground/80 text-md text-center">
                  {t('earn_raffle_ticket_per_invitation')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
