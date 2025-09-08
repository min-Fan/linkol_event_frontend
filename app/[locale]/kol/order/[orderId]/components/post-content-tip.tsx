'use client';
import { cloneElement, ReactElement, ReactNode, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@shadcn-ui/dialog';
import { useTranslations } from 'next-intl';
import { Button } from '@shadcn/components/ui/button';
type OrderExpiredDialogProps = {
  post: any;
  kol: any;
  media_urls: string[];
  children: ReactElement<any>;
  onConfirm: () => void;
};

export default function PostContentTip({
  post,
  kol,
  children,
  onConfirm,
  media_urls,
}: OrderExpiredDialogProps) {
  const t = useTranslations('common');
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm?.();
    setOpen(false);
  };

  const renderImages = (medias) => {
    if (medias.length === 1) {
      return (
        <div className="mt-2">
          <img src={medias[0]} className="w-full rounded-xl object-cover" />
        </div>
      );
    }
    if (medias.length === 2) {
      return (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {medias.map((item, i) => (
            <img key={i} src={item} className="h-40 w-full rounded-xl object-cover" />
          ))}
        </div>
      );
    }
    if (medias.length === 3) {
      return (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <img src={medias[0]} className="col-span-2 h-40 w-full rounded-xl object-cover" />
          {medias.slice(1).map((item, i) => (
            <img key={i} src={item} className="h-40 w-full rounded-xl object-cover" />
          ))}
        </div>
      );
    }
    if (medias.length >= 4) {
      return (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {medias.slice(0, 4).map((item, i) => (
            <img key={i} src={item} className="h-40 w-full rounded-xl object-cover" />
          ))}
        </div>
      );
    }
    return null;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (children.props.disabled) {
      e.preventDefault();
      return;
    }
    setOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {cloneElement(children, {
          onClick: handleClick,
        })}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">{t('send_post_on_twitter')}</DialogTitle>
        </DialogHeader>

        <div className="flex w-100 items-center gap-1">
          <div className="overflow-hidden rounded-full">
            <img src={kol.profile_image_url} alt="kol" className="size-6" />
          </div>
          <span className="text-md font-medium">@{kol.username}</span>
        </div>
        <div className="max-h-100 overflow-auto">
          {post.map((item, index) => {
            return (
              <div key={index}>
                <div className="border-border rounded-md border px-3 py-2">
                  <p className="text-sm">{item}</p>
                </div>
                {media_urls && media_urls.length > 0 && renderImages(media_urls)}
              </div>
            );
          })}
        </div>
        <DialogFooter>
          <div className="flex w-full justify-center gap-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t('btn_cancel')}
            </Button>
            <Button onClick={handleConfirm}>{t('btn_confirm')}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
