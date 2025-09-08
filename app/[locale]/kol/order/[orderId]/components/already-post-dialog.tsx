import { useTranslations } from 'next-intl';

import { Button } from '@shadcn-ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from '@shadcn/components/ui/dialog';
import { useState } from 'react';
import { Input } from '@shadcn/components/ui/input';
import { extractTweetId } from '@libs/utils/twitter-utils';
import { useOrderPreview } from 'app/context/OrderPreviewContext';
import { toast } from 'sonner';
import { OrderPreviewType } from 'app/@types/types';
import { AnimatePresence, motion } from 'motion/react';
import EvmConnect from 'app/components/evm-connect';
import { useRouter } from '@libs/i18n/navigation';
import { useAccount } from 'wagmi';
import { uploadSelfPostLink } from '@libs/request';
import { LoaderCircle } from 'lucide-react';
interface AlreadyPostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderId: any;
}

export default function AlreadyPostDialog({
  isOpen,
  onClose,
  onConfirm,
  orderId,
}: AlreadyPostDialogProps) {
  const { address } = useAccount();
  const t = useTranslations('common');
  // const [tweetUrl, setTweetUrl] = useState('');
  const { setStatus, setTweetId, tweetId, isVerified, tweetUrl, setTweetUrl } = useOrderPreview();
  const [isPostLink, setIsPostLink] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const handleTweetLinkSubmit = () => {
    const extractedTweetId = extractTweetId(tweetUrl);
    if (!extractedTweetId) {
      toast.error(t('invalid_tweet_URL'));
      return;
    }

    setTweetId(extractedTweetId);
    setTweetUrl(tweetUrl);
    setStatus(OrderPreviewType.POST_VIEW);
    setTimeout(() => {
      onClose();
    }, 0);
  };

  const uploadTweet = async () => {
    try {
      if (!tweetId) {
        toast.error(t('please_enter_a_valid_tweet_URL_first'));
        return;
      }

      if (!isVerified) {
        toast.error(t('please_post_verification'));
        return;
      }

      setIsUploading(true);
      const res: any = await uploadSelfPostLink({
        tweet_url: tweetUrl,
        wallet_address: address,
        order_item_id: orderId,
      });
      setIsUploading(false);

      if (res.code === 200) {
        toast.success(t('tweet_uploaded_successfully'));
        cancel();
        router.back();
      } else {
        toast.error(res.msg || t('failed_to_upload_tweet'));
      }
    } catch (error) {
      console.error(error);
      setIsUploading(false);
      toast.error(t('an_error_occurred_during_upload'));
    }
  };

  const cancel = () => {
    onClose();
    setIsPostLink(true);
    setStatus(OrderPreviewType.POST_CONTENT);
  };

  return (
    <Dialog open={isOpen} onOpenChange={cancel}>
      <DialogContent className="border-border w-96">
        <DialogHeader>
          <DialogTitle>{t('already_post_on_twitter_for_this_task')}?</DialogTitle>
        </DialogHeader>
        <AnimatePresence mode="wait">
          {isPostLink ? (
            <motion.div
              key="post-link"
              className="flex w-full items-center justify-center gap-6"
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(10px)' }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex w-full flex-col items-start gap-2">
                <span className="text-md font-medium">{t('link_to_post')}</span>
                <Input
                  placeholder={t('enter_tweet_link')}
                  className="w-full"
                  value={tweetUrl}
                  onChange={(e) => setTweetUrl(e.target.value)}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="complete"
              className="flex w-full items-center justify-center gap-6"
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(10px)' }}
            >
              <div className="border-primary flex w-full items-center justify-between gap-2 rounded-md border p-2 shadow-sm">
                <EvmConnect />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <DialogFooter>
          {isPostLink ? (
            <div className="flex w-full items-center justify-center gap-2">
              <Button variant="secondary" className="flex-1" onClick={cancel}>
                <span className="text-base">{t('cancel')}</span>
              </Button>
              <Button className="flex-1" onClick={handleTweetLinkSubmit}>
                <span className="text-base">{t('btn_submit')}</span>
              </Button>
            </div>
          ) : (
            address && (
              <>
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setIsPostLink(true);
                  }}
                >
                  <span className="text-sm">{t('change_link')}</span>
                </Button>
                <Button className="flex-1" onClick={uploadTweet} disabled={isUploading}>
                  {isUploading ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="text-sm">{t('btn_confirm')}</span>
                  )}
                </Button>
              </>
            )
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
