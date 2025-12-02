'use client';
import React, { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Copy, Download, Twitter, CheckCircle2, Zap, Loader2, Rocket } from 'lucide-react';
import { useBetDetail } from '@hooks/useBetDetail';
import { useTranslations } from 'next-intl';
import { PredictionSide } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/components/ui/dialog';
import { getCurrentDomain, getCurrentUrl, copy, formatPrecision } from '@libs/utils';
import { toast } from 'sonner';
import { domToPng } from 'modern-screenshot';

interface OpinionShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  side: PredictionSide;
  mode?: 'DEFAULT' | 'POST_TRADE';
  amountInvested?: number;
}

export default function OpinionShareModal({
  isOpen,
  onClose,
  side,
  mode = 'DEFAULT',
  amountInvested,
}: OpinionShareModalProps) {
  const params = useParams();
  const opinionId = params?.opinion as string;
  const { betDetail, topic, attitude, tokenAddress } = useBetDetail(opinionId);
  const t = useTranslations('common');
  const [isCopying, setIsCopying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  if (!betDetail || !topic) return null;

  const isYes = side === PredictionSide.YES;
  const gradient = isYes ? 'from-green-600 to-emerald-800' : 'from-red-600 to-rose-800';
  const borderColor = isYes ? 'border-green-500' : 'border-red-500';

  // 动态获取当前完整URL
  const currentUrl = `${getCurrentUrl()}/opinions/${opinionId}`;
  const currentDomain = getCurrentDomain();

  // 获取原文链接，优先使用 attitude.tweet_url，否则构建 Twitter 用户主页链接
  const originalTweetUrl = attitude?.tweet_url || `https://twitter.com/${topic.screen_name}`;

  // 分享文本中使用链接引用原文，而不是直接显示内容
  const shareText = `I bet ${side} on @${topic.screen_name}'s market on Linkol! 🚀\n\n${originalTweetUrl}\n\nJoin my side and boost the Brand Voice! 👇\n${currentUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  const handleCopyLink = async () => {
    setIsCopying(true);
    const success = await copy(currentUrl);
    if (success) {
      toast.success(t('copy_success') || 'Link copied to clipboard');
    } else {
      toast.error(t('copy_failed') || 'Failed to copy link');
    }
    setIsCopying(false);
  };

  const handleDownloadImage = async () => {
    if (!shareCardRef.current || isDownloading) return;

    try {
      setIsDownloading(true);

      // 等待DOM完全渲染
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 使用 modern-screenshot 将DOM转换为PNG
      const dataUrl = await domToPng(shareCardRef.current, {
        scale: 2, // 提高图片质量
        quality: 0.95,
        backgroundColor: null,
      });

      // 将 data URL 转换为 blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `opinion-share-${topic.screen_name}-${side}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(t('download_success') || 'Image downloaded successfully');
      setIsDownloading(false);
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error(t('download_failed') || 'Failed to generate image');
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-border bg-card w-full max-w-[90%] rounded-2xl border p-0 shadow-2xl sm:max-w-md sm:rounded-3xl">
        <DialogHeader className="p-4 pb-0 sm:p-6">
          {mode === 'POST_TRADE' ? (
            <div className="text-center mb-4 animate-in slide-in-from-top-2">
              <div className="mx-auto mb-4 flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-green-500/10 ring-1 ring-green-500/50">
                <Rocket className="h-7 w-7 md:h-8 md:w-8 text-green-500 drop-shadow-sm" />
              </div>
              <DialogTitle className="text-foreground text-xl md:text-2xl font-black">
                {t('position_confirmed') || 'Position Confirmed!'}
              </DialogTitle>
              <p className="text-muted-foreground text-xs md:text-sm mt-2 max-w-[95%] mx-auto leading-relaxed">
                {t('you_invested') || 'You invested'}{' '}
                {amountInvested && (
                  <strong className="text-foreground">
                    {formatPrecision(amountInvested.toString())}
                  </strong>
                )}{' '}
                {t('in') || 'in'}{' '}
                <strong className={isYes ? 'text-green-500' : 'text-red-500'}>{side}</strong>.
                <br />
                {t('share_now_to_boost') || 'Share now to boost'}{' '}
                <strong className="text-foreground">{t('brand_voice') || 'Brand Voice'}</strong>{' '}
                {t('and_increase_winning_chance') || 'and increase your chance of winning.'}
              </p>
            </div>
          ) : (
            <DialogTitle className="text-foreground text-center text-lg font-bold sm:text-xl">
              {t('rally_support')}
            </DialogTitle>
          )}
        </DialogHeader>

        <div className="p-4 pt-3 sm:p-6 sm:pt-4">
          {/* Share Card Preview */}
          <div
            ref={shareCardRef}
            className={`relative overflow-hidden rounded-xl border-2 ${borderColor} bg-gradient-to-br ${gradient} p-4 shadow-2xl sm:rounded-2xl sm:p-6`}
          >
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

            {/* Card Content */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="mb-3 flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 backdrop-blur-md sm:mb-4 sm:gap-3 sm:px-4 sm:py-2">
                <div className="relative">
                  <img
                    src={topic.icon || ''}
                    alt="Avatar"
                    className="h-7 w-7 rounded-full sm:h-8 sm:w-8"
                  />
                  {false && (
                    <CheckCircle2 className="text-primary absolute -right-1 -bottom-1 h-3 w-3 rounded-full bg-black" />
                  )}
                </div>
                <span className="text-xs font-semibold text-white sm:text-sm">{topic.name}</span>
              </div>

              <h4 className="mb-4 text-base leading-tight font-bold text-white drop-shadow-md sm:mb-6 sm:text-lg">
                "{topic.content}"
              </h4>

              <div className="w-full rounded-lg border border-white/10 bg-black/40 p-3 backdrop-blur-md sm:rounded-xl sm:p-4">
                <p className="mb-1 text-[10px] tracking-widest text-gray-300 uppercase sm:text-xs">
                  {t('i_support')}
                </p>
                <div
                  className={`text-3xl font-black ${isYes ? 'text-green-400' : 'text-red-400'} drop-shadow-sm sm:text-4xl`}
                >
                  {side}
                </div>

                {/* Visual Amount Badge */}
                {amountInvested && amountInvested > 0 && (
                  <div className="mt-3 mb-2 flex flex-col items-center">
                    <div className="h-px w-16 md:w-20 bg-white/20 mb-2"></div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg md:text-xl font-black text-white tracking-tight">
                        {formatPrecision(amountInvested.toString())}
                      </span>
                      <span className="text-[10px] text-gray-300 uppercase font-bold tracking-wider">
                        {t('invested') || 'Invested'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-1.5 flex items-center justify-center gap-1.5 text-[10px] font-medium text-white/80 sm:mt-2 sm:gap-2 sm:text-xs">
                  <Zap className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400 sm:h-3 sm:w-3" />
                  <span>{t('boosting_brand_voice')}</span>
                </div>
              </div>
            </div>

            {/* Linkol Watermark */}
            <div className="absolute right-2 bottom-0.5 text-[9px] font-bold text-white/40 italic sm:right-4 sm:bottom-1 sm:text-[10px]">
              {currentDomain}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2">
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#1DA1F2] py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-[#1a8cd8] sm:py-3"
            >
              <Twitter className="h-4 w-4 fill-white" />
              {mode === 'POST_TRADE' ? t('shill_on_x') || 'Shill on X' : t('share_to_x')}
            </a>
            <button
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className="border-border bg-muted text-foreground hover:bg-muted/80 hidden items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-bold transition-all disabled:opacity-50 sm:flex sm:py-3"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {t('save_image')}
            </button>
          </div>

          <button
            onClick={handleCopyLink}
            disabled={isCopying}
            className="text-muted-foreground hover:text-foreground mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-colors disabled:opacity-50 sm:py-3"
          >
            <Copy className="h-4 w-4" />
            {t('copy_link')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
