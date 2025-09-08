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
import { Copy } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Input } from '@shadcn/components/ui/input';
import { useTranslations } from 'next-intl';

interface DialogInvireProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DialogInvire({ isOpen, onClose }: DialogInvireProps) {
  const t = useTranslations('common');
  const [copied, setCopied] = useState(false);
  const { eventId } = useParams();
  const inviteLink = `${window.location.origin}/market_events/${eventId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
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
            {t('invite_other_creators')}
          </DialogTitle>
          <DialogDescription>
            <p className="text-md text-center text-white opacity-90">
              {t('share_link_invite_others')}
            </p>
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="bg-background space-y-4 rounded-b-xl p-6 sm:rounded-b-2xl">
          {/* Invite Link Field */}
          <div className="border-border flex items-center gap-2 rounded-lg border px-2">
            <Input
              type="text"
              value={inviteLink}
              readOnly
              className="flex-1 border-none bg-transparent text-sm outline-none"
            />
            <div
              onClick={handleCopyLink}
              className="hover:bg-muted-foreground/10 text-muted-foreground flex h-6 w-6 items-center justify-center rounded p-2"
            >
              <Copy className="h-4 w-4 min-w-4" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              className="border-border hover:bg-muted-foreground/10 !h-auto flex-1 !rounded-lg"
            >
              {t('close')}
            </Button>
            <Button
              onClick={handleCopyLink}
              className="bg-primary hover:bg-primary/90 !h-auto flex-1 !rounded-lg text-white"
            >
              {copied ? t('copied') : t('copy_link')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
