'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { X, Copy, Download, Twitter, CheckCircle2, Zap } from 'lucide-react';
import { useBetDetail } from '@hooks/useBetDetail';
import { useTranslations } from 'next-intl';
import { PredictionSide } from '../types';

interface OpinionShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  side: PredictionSide;
}

export default function OpinionShareModal({ isOpen, onClose, side }: OpinionShareModalProps) {
  const params = useParams();
  const opinionId = params?.opinion as string;
  const { betDetail, topic, attitude } = useBetDetail(opinionId);
  const t = useTranslations('common');

  if (!isOpen || !betDetail || !topic) return null;

  const isYes = side === PredictionSide.YES;
  const gradient = isYes ? 'from-green-600 to-emerald-800' : 'from-red-600 to-rose-800';
  const borderColor = isYes ? 'border-green-500' : 'border-red-500';

  const shareText = `I bet ${side} on @${topic.screen_name}'s market on Linkol! 🚀\n\n"${topic.content}"\n\nJoin my side and boost the Brand Voice! 👇\nhttps://linkol.xyz/opinions/${opinionId}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm duration-200">
      <div className="border-border bg-card animate-in zoom-in-95 relative w-full max-w-md rounded-3xl border p-0 shadow-2xl duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground absolute top-4 right-4 z-10 rounded-full bg-black/10 p-2 transition-all hover:bg-black/20 dark:bg-black/50 dark:hover:bg-black/70"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6">
          <h3 className="text-foreground mb-6 text-center text-xl font-bold">
            {t('rally_support')}
          </h3>

          {/* Share Card Preview */}
          <div
            className={`relative overflow-hidden rounded-2xl border-2 ${borderColor} bg-gradient-to-br ${gradient} p-6 shadow-2xl`}
          >
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

            {/* Card Content */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="mb-4 flex items-center gap-3 rounded-full border border-white/10 bg-black/30 px-4 py-2 backdrop-blur-md">
                <div className="relative">
                  <img src={topic.icon || ''} alt="Avatar" className="h-8 w-8 rounded-full" />
                  {false && (
                    <CheckCircle2 className="text-primary absolute -right-1 -bottom-1 h-3 w-3 rounded-full bg-black" />
                  )}
                </div>
                <span className="text-sm font-semibold text-white">{topic.name}</span>
              </div>

              <h4 className="mb-6 text-lg leading-tight font-bold text-white drop-shadow-md">
                "{topic.content}"
              </h4>

              <div className="w-full rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-md">
                <p className="mb-1 text-xs tracking-widest text-gray-300 uppercase">
                  {t('i_support')}
                </p>
                <div
                  className={`text-4xl font-black ${isYes ? 'text-green-400' : 'text-red-400'} drop-shadow-sm`}
                >
                  {side}
                </div>
                <div className="mt-2 flex items-center justify-center gap-2 text-xs font-medium text-white/80">
                  <Zap className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{t('boosting_brand_voice')}</span>
                </div>
              </div>
            </div>

            {/* Linkol Watermark */}
            <div className="absolute right-4 bottom-3 text-[10px] font-bold text-white/40 italic">
              Linkol.xyz
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#1DA1F2] py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-[#1a8cd8]"
            >
              <Twitter className="h-4 w-4 fill-white" />
              {t('share_to_x')}
            </a>
            <button className="bg-muted hover:bg-muted/80 text-foreground border-border flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold transition-all">
              <Download className="h-4 w-4" />
              {t('save_image')}
            </button>
          </div>

          <button className="text-muted-foreground hover:text-foreground mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-colors">
            <Copy className="h-4 w-4" />
            {t('copy_link')}
          </button>
        </div>
      </div>
    </div>
  );
}
