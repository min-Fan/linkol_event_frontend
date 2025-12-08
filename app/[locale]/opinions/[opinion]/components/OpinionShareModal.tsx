'use client';
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Copy, Download, Twitter, CheckCircle2, Zap, Loader2, Rocket } from 'lucide-react';
import { useBetDetail } from '@hooks/useBetDetail';
import { useTranslations } from 'next-intl';
import { PredictionSide } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/components/ui/dialog';
import { getCurrentDomain, getCurrentUrl, copy, formatPrecision } from '@libs/utils';
import { toast } from 'sonner';
import { domToPng } from 'modern-screenshot';
import { useAccount, useReadContract } from 'wagmi';
import { erc20Abi } from 'viem';
import { ethers } from 'ethers';
import Bet_abi from '@constants/abi/Bet_abi.json';
import { getChainConfig, getChainTypeFromChainId } from '@constants/config';
import { formatBigNumber } from '@libs/utils/format-bignumber';
import { cn } from '@shadcn/lib/utils';

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
  const { betDetail, topic, attitude, tokenAddress, chainId } = useBetDetail(opinionId);
  const t = useTranslations('common');
  const [isCopying, setIsCopying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const { address, chainId: currentChainId } = useAccount();

  // 确定使用的链
  const betChainId = !chainId || chainId === 0 ? 84532 : Number(chainId);
  const chainType = getChainTypeFromChainId(betChainId);
  const chainConfig = getChainConfig(chainType);
  const expectedChainId = chainConfig ? parseInt(chainConfig.chainId) : null;
  const isWrongChain = currentChainId !== expectedChainId;

  // 读取用户下注信息（用于单独打开时显示下注总数）
  // 两种模式都启用，确保能获取最新数据
  const { data: betInfo, refetch: refetchBetInfo } = useReadContract({
    address: chainConfig?.AgentBetAddress as `0x${string}`,
    abi: Bet_abi,
    functionName: 'getBetInfo',
    args: opinionId && address ? [BigInt(opinionId), address as `0x${string}`] : undefined,
    query: {
      enabled: !!opinionId && !!address && !!chainConfig?.AgentBetAddress && !isWrongChain,
    },
  });

  // 每次打开弹窗时，重新获取最新的 betInfo
  useEffect(() => {
    if (isOpen && opinionId && address && chainConfig?.AgentBetAddress && !isWrongChain) {
      refetchBetInfo();
    }
  }, [isOpen, opinionId, address, chainConfig?.AgentBetAddress, isWrongChain, refetchBetInfo]);

  // 读取代币精度
  const { data: tokenDecimals, refetch: refetchTokenDecimals } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: 'decimals',
    query: {
      enabled: !!tokenAddress && !isWrongChain && tokenAddress !== ethers.ZeroAddress,
    },
  });

  // 每次打开弹窗时，重新获取最新的 tokenDecimals
  useEffect(() => {
    if (isOpen && tokenAddress && !isWrongChain && tokenAddress !== ethers.ZeroAddress) {
      refetchTokenDecimals();
    }
  }, [isOpen, tokenAddress, isWrongChain, refetchTokenDecimals]);

  // 计算实际显示的下注金额
  // 如果是 POST_TRADE 模式，使用传入的 amountInvested
  // 如果是 DEFAULT 模式（单独打开），使用 betInfo 中的下注总数
  const displayAmountInvested = useMemo(() => {
    if (mode === 'POST_TRADE') {
      return amountInvested;
    }
    
    // DEFAULT 模式：从 betInfo 中获取下注总数
    if (betInfo && (betInfo as any).amount) {
      const tokenDecimalsValue = tokenAddress === ethers.ZeroAddress 
        ? 18 
        : tokenDecimals 
          ? Number(tokenDecimals) 
          : 18;
      const betAmount = formatBigNumber(
        BigInt((betInfo as any).amount.toString()),
        tokenDecimalsValue
      );
      return parseFloat(betAmount);
    }
    
    return amountInvested;
  }, [mode, amountInvested, betInfo, tokenAddress, tokenDecimals]);

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
      <DialogContent className="border-border bg-card w-full max-w-[90%] rounded-xl border p-0 shadow-2xl sm:max-w-md sm:rounded-2xl gap-0">
        <DialogHeader className="p-3 pb-0 sm:p-4 sm:pb-0">
        {mode !== 'POST_TRADE' ? (
            <div className="text-center mb-3 animate-in slide-in-from-top-2">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 ring-1 ring-green-500/50 md:h-14 md:w-14">
                <Rocket className="h-6 w-6 text-green-500 drop-shadow-sm md:h-7 md:w-7" />
              </div>
              <DialogTitle className="text-foreground text-lg md:text-xl font-black">
                {t('position_confirmed') || 'Position Confirmed!'}
              </DialogTitle>
              <p className="text-muted-foreground text-[11px] md:text-xs mt-1.5 max-w-[95%] mx-auto leading-relaxed">
                {t('you_invested') || 'You invested'}{' '}
                {displayAmountInvested && displayAmountInvested > 0 && (
                  <strong className={cn(isYes ? 'text-green-500' : 'text-red-500')}>
                    {formatPrecision(displayAmountInvested.toString())}
                  </strong>
                )}{' '}
                {t('in') || 'in'}{' '}
                <strong className={cn(isYes ? 'text-green-500' : 'text-red-500')}>{side}</strong>.
                <br />
                {t('share_now_to_boost') || 'Share now to boost'}{' '}
                <strong className="text-muted-foreground">{t('brand_voice') || 'Brand Voice'}</strong>{' '}
                {t('and_increase_winning_chance') || 'and increase your chance of winning.'}
              </p>
            </div>
          ) : (
            <DialogTitle className="text-foreground text-center text-base font-bold sm:text-lg">
              {t('rally_support')}
            </DialogTitle>
          )}
        </DialogHeader>

        <div className="p-3 pt-2 sm:p-4 sm:pt-3">
          {/* Share Card Preview */}
          <div
            ref={shareCardRef}
            className={`relative overflow-hidden rounded-lg border-2 ${borderColor} bg-gradient-to-br ${gradient} p-3 shadow-2xl sm:rounded-xl sm:p-4`}
          >
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

            {/* Card Content */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="mb-2 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-2.5 py-1 backdrop-blur-md sm:mb-2.5 sm:gap-2 sm:px-3 sm:py-1.5">
                <div className="relative">
                  <img
                    src={topic.icon || ''}
                    alt="Avatar"
                    className="h-6 w-6 rounded-full sm:h-7 sm:w-7"
                  />
                  {false && (
                    <CheckCircle2 className="text-primary absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full bg-black" />
                  )}
                </div>
                <span className="text-[11px] font-semibold text-white sm:text-xs">{topic.name}</span>
              </div>

              <h4 className="mb-3 text-sm leading-tight font-bold text-white drop-shadow-md sm:mb-3.5 sm:text-base line-clamp-3">
                "{topic.content}"
              </h4>

              <div className="w-full rounded-lg border border-white/10 bg-black/40 p-2.5 backdrop-blur-md sm:rounded-xl sm:p-3">
                <p className="mb-0.5 text-[9px] tracking-widest text-gray-300 uppercase sm:text-[10px]">
                  {t('i_support')}
                </p>
                <div
                  className={`text-2xl font-black ${isYes ? 'text-green-400' : 'text-red-400'} drop-shadow-sm sm:text-3xl`}
                >
                  {side}
                </div>

                {/* Visual Amount Badge */}
                {displayAmountInvested && displayAmountInvested > 0 && (
                  <div className="mt-2 mb-1.5 flex flex-col items-center">
                    <div className="h-px w-14 md:w-16 bg-white/20 mb-1.5"></div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base md:text-lg font-black text-white tracking-tight">
                        {formatPrecision(displayAmountInvested.toString())}
                      </span>
                      <span className="text-[9px] text-gray-300 uppercase font-bold tracking-wider">
                        {t('invested') || 'Invested'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-1 flex items-center justify-center gap-1 text-[9px] font-medium text-white/80 sm:mt-1.5 sm:gap-1.5 sm:text-[10px]">
                  <Zap className="h-2 w-2 fill-yellow-400 text-yellow-400 sm:h-2.5 sm:w-2.5" />
                  <span>{t('boosting_brand_voice')}</span>
                </div>
              </div>
            </div>

            {/* Linkol Watermark */}
            <div className="absolute right-1.5 bottom-0.5 text-[8px] font-bold text-white/40 italic sm:right-3 sm:bottom-1 sm:text-[9px]">
              {currentDomain}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-3 grid grid-cols-1 gap-2 sm:mt-4 sm:grid-cols-2">
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-[#1DA1F2] py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-[#1a8cd8] sm:py-2.5 sm:text-sm"
            >
              <Twitter className="h-3.5 w-3.5 fill-white sm:h-4 sm:w-4" />
              {mode === 'POST_TRADE' ? t('shill_on_x') || 'Shill on X' : t('share_to_x')}
            </a>
            <button
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className="border-border bg-muted text-foreground hover:bg-muted/80 hidden items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition-all disabled:opacity-50 sm:flex sm:py-2.5 sm:text-sm"
            >
              {isDownloading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
              ) : (
                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              )}
              {t('save_image')}
            </button>
          </div>

          <button
            onClick={handleCopyLink}
            disabled={isCopying}
            className="text-muted-foreground hover:text-foreground mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium transition-colors disabled:opacity-50 sm:py-2.5 sm:text-sm"
          >
            <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {t('copy_link')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
