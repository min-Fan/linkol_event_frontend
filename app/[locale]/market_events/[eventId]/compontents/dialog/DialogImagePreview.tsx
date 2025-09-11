import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 当弹窗打开时，设置初始索引
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  // 当弹窗打开时，自动聚焦到容器
  useEffect(() => {
    if (isOpen && containerRef.current) {
      containerRef.current.focus();
    }
  }, [isOpen]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => {
      const newIndex = prev === 0 ? images.length - 1 : prev - 1;
      console.log('Previous clicked, new index:', newIndex);
      return newIndex;
    });
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => {
      const newIndex = prev === images.length - 1 ? 0 : prev + 1;
      console.log('Next clicked, new index:', newIndex);
      return newIndex;
    });
  }, [images.length]);

  // 触摸手势处理
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && images.length > 1) {
      handleNext();
    }
    if (isRightSwipe && images.length > 1) {
      handlePrevious();
    }
  };

  // 监听全局键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      console.log('Key pressed:', e.key, 'Current index:', currentIndex);
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex((prev) => {
          const newIndex = prev === 0 ? images.length - 1 : prev - 1;
          console.log('Arrow left, new index:', newIndex);
          return newIndex;
        });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentIndex((prev) => {
          const newIndex = prev === images.length - 1 ? 0 : prev + 1;
          console.log('Arrow right, new index:', newIndex);
          return newIndex;
        });
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, images.length, onClose, currentIndex]);

  if (images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="h-screen w-screen max-h-screen max-w-screen border-0 bg-black/90 p-0 shadow-none sm:max-h-[90vh] sm:max-w-[90vw] sm:bg-transparent"
        nonClosable
      >
        <DialogHeader className="absolute top-2 right-0 z-10 sm:top-4">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
          <DialogClose asChild className="absolute top-0 right-2 sm:right-4">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border-white/20 bg-black/20 text-white hover:bg-black/40 hover:text-white sm:h-8 sm:w-8"
            >
              <X className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div
          ref={containerRef}
          className="relative flex h-full w-full items-center justify-center"
          tabIndex={0}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* 主图片 */}
          <div className="relative flex min-h-[200px] min-w-[200px] max-h-full max-w-full items-center justify-center sm:min-h-0 sm:min-w-0">
            <img
              key={`image-${currentIndex}`}
              src={currentImage}
              alt={`Image ${currentIndex + 1}`}
              className="max-h-[85vh] max-w-full object-contain sm:max-h-[80vh]"
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
                className="absolute top-1/2 left-2 h-12 w-12 -translate-y-1/2 rounded-full border-white/20 bg-black/20 text-white hover:bg-black/40 sm:left-4 sm:h-10 sm:w-10"
              >
                <ChevronLeft className="h-6 w-6 sm:h-5 sm:w-5" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                className="absolute top-1/2 right-2 h-12 w-12 -translate-y-1/2 rounded-full border-white/20 bg-black/20 text-white hover:bg-black/40 sm:right-4 sm:h-10 sm:w-10"
              >
                <ChevronRight className="h-6 w-6 sm:h-5 sm:w-5" />
              </Button>
            </>
          )}

          {/* 图片计数器 */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white sm:bottom-4">
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {/* 缩略图导航 - 移动端隐藏，桌面端显示 */}
          {images.length > 1 && (
            <div className="absolute bottom-12 left-1/2 hidden -translate-x-1/2 space-x-2 sm:bottom-16 sm:flex">
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
