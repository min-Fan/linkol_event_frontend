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
import { CopyIcon, Share2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { TwIcon, Twitter, Twitter2, TwitterBlack } from '@assets/svg';
import { toast } from 'sonner';

interface DialogShareProjectProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DialogShareProject({ isOpen, onClose }: DialogShareProjectProps) {
  const t = useTranslations('common');
  const { eventId } = useParams();

  // 构建分享链接
  const shareLink = `${window.location.origin}/market_events/${eventId}`;

  // 预编辑的推特文案
  const tweetText = `🚀 发现了一个超棒的项目！\n\n🔗 项目链接：${shareLink}\n\n#Web3 #区块链 #创新项目`;

  // 跳转到推特发帖
  const handleShareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank');
    onClose();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success(t('copied'));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
          {/* Project Link Field */}
          <div className="border-border flex items-center gap-2 rounded-lg border px-3 py-2">
            <span className="text-muted-foreground flex-1 text-sm">{shareLink}</span>
            <CopyIcon
              className="text-muted-foreground h-4 w-4 cursor-pointer"
              onClick={handleCopyLink}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              className="border-border hover:bg-muted-foreground/10 !h-auto flex-1 !rounded-lg"
            >
              {t('done')}
            </Button>
            <Button
              onClick={handleShareOnTwitter}
              className="bg-primary hover:bg-primary/90 !h-auto flex-1 !rounded-lg text-white"
            >
              {t('share_on_x')}
              <span className="text-xl text-white">𝕏</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
