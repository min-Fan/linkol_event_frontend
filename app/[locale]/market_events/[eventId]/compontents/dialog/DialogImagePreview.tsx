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
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface DialogImagePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
}

export default function DialogImagePreview({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
}: DialogImagePreviewProps) {
  const t = useTranslations('common');
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // 当弹窗打开时，设置初始索引
  React.useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrevious();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-h-[90vh] max-w-[90vw] border-0 bg-transparent p-0 shadow-none"
        nonClosable
      >
        <DialogHeader className="absolute top-4 right-0 z-10">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
          <DialogClose asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full border-white/20 bg-black/20 text-white hover:bg-black/40 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div
          className="relative flex h-full min-h-[80vh] w-full items-center justify-center"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* 主图片 */}
          <div className="relative max-h-full max-w-full">
            <img
              src={currentImage}
              alt={`Image ${currentIndex + 1}`}
              className="max-h-[80vh] max-w-full object-contain"
              onError={(e) => {
                // 图片加载失败时的处理
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          {/* 导航按钮 */}
          {images.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevious}
                className="absolute top-1/2 left-4 h-10 w-10 -translate-y-1/2 rounded-full border-white/20 bg-black/20 text-white hover:bg-black/40"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                className="absolute top-1/2 right-4 h-10 w-10 -translate-y-1/2 rounded-full border-white/20 bg-black/20 text-white hover:bg-black/40"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* 图片计数器 */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {/* 缩略图导航 */}
          {images.length > 1 && (
            <div className="absolute bottom-16 left-1/2 flex -translate-x-1/2 space-x-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-12 w-12 overflow-hidden rounded-lg border-2 transition-all ${
                    index === currentIndex
                      ? 'scale-110 border-white'
                      : 'border-white/30 hover:border-white/60'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
