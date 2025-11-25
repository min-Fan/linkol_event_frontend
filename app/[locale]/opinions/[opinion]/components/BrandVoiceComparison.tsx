'use client';
import React from 'react';
import { Zap, Info, Trophy } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface BrandVoiceComparisonProps {
  yesVoice: number;
  noVoice: number;
  yesCount: number;
  noCount: number;
}

export default function BrandVoiceComparison({
  yesVoice,
  noVoice,
  yesCount,
  noCount,
}: BrandVoiceComparisonProps) {
  const t = useTranslations('common');
  const totalVoice = yesVoice + noVoice;
  const yesPercent = totalVoice > 0 ? (yesVoice / totalVoice) * 100 : 50;
  const noPercent = 100 - yesPercent;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const isYesWinning = yesVoice >= noVoice;

  return (
    <div className="space-y-6">
      {/* Main Voice Battle Card */}
      <div className="border-border from-background to-primary/50 dark:from-background dark:to-card relative overflow-hidden rounded-3xl border bg-gradient-to-b from-[30%] p-8 shadow-2xl">
        {/* Decorative background glow */}
        <div
          className={`absolute -top-24 -left-24 h-64 w-64 rounded-full opacity-20 blur-[100px] ${
            isYesWinning ? 'bg-green-500' : 'bg-red-500'
          }`}
        ></div>
        <div
          className={`absolute -right-24 -bottom-24 h-64 w-64 rounded-full opacity-20 blur-[100px] ${
            !isYesWinning ? 'bg-green-500' : 'bg-red-500'
          }`}
        ></div>

        {/* Header */}
        <div className="relative z-10 mb-8 flex items-center justify-between">
          <h3 className="flex items-center gap-3 text-2xl font-black tracking-wide italic">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-orange-500/20">
              <Zap className="fill-white h-6 w-6 text-white" />
            </span>
            {t('brand_voice_battle')}
          </h3>
          <div className="flex items-center gap-2 rounded-full border border-white/5 bg-accent-foreground/5 px-4 py-2 text-xs font-medium text-muted-foreground/60 backdrop-blur-md">
            <Info className="h-3.5 w-3.5 text-blue-400" />
            <span>{t('entropy_weight_method')}</span>
          </div>
        </div>

        {/* Scoreboard */}
        <div className="relative z-10 mb-8 flex items-end justify-between text-white">
          <div className="text-left">
            <div className="mb-1 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
              <p className="text-sm font-bold tracking-widest text-green-500 uppercase">
                {t('yes')} Voice
              </p>
            </div>
            <p className="text-5xl font-black tracking-tighter drop-shadow-lg md:text-6xl">
              {formatNumber(yesVoice)}
            </p>
          </div>

          <div className="mb-4 text-center">
            <div className="rounded-full border border-white/10 bg-white/10 px-4 py-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              {t('current_winner')}
            </div>
            <div
              className={`mt-2 text-xl font-black ${isYesWinning ? 'text-green-500' : 'text-red-500'}`}
            >
              {isYesWinning ? t('yes').toUpperCase() : t('no').toUpperCase()}
            </div>
          </div>

          <div className="text-right">
            <div className="mb-1 flex items-center justify-end gap-2">
              <p className="text-sm font-bold tracking-widest text-red-500 uppercase">{t('no')} Voice</p>
              <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
            </div>
            <p className="text-5xl font-black tracking-tighter drop-shadow-lg md:text-6xl">
              {formatNumber(noVoice)}
            </p>
          </div>
        </div>

        {/* Main Progress Bar */}
        <div className="relative z-10 mb-8">
          <div className="relative h-8 w-full overflow-hidden rounded-full bg-gray-800 shadow-inner ring-1 ring-white/10">
            <div
              style={{ width: `${yesPercent}%` }}
              className="absolute top-0 left-0 flex h-full items-center justify-start bg-gradient-to-r from-green-600 via-green-500 to-green-400 px-4 shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all duration-1000 ease-out"
            >
              {yesPercent > 10 && (
                <span className="text-xs font-black tracking-widest text-black">
                  {yesPercent.toFixed(1)}%
                </span>
              )}
            </div>
            <div
              style={{ width: `${noPercent}%` }}
              className="absolute top-0 right-0 flex h-full items-center justify-end bg-gradient-to-l from-red-600 via-red-500 to-red-400 px-4 shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all duration-1000 ease-out"
            >
              {noPercent > 10 && (
                <span className="text-xs font-black tracking-widest text-black">
                  {noPercent.toFixed(1)}%
                </span>
              )}
            </div>

            {/* Center VS Marker */}
            <div className="absolute top-1/2 left-1/2 z-20 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-gray-800 bg-gray-900 text-xs font-black text-white shadow-xl">
              {t('vs')}
            </div>
          </div>
        </div>

        {/* Info Text */}
        <p className="relative z-10 text-center text-sm font-medium text-muted-foreground">
          <Trophy className="-mt-1 mr-2 inline-block h-4 w-4 text-yellow-500" />
          {t.rich('prediction_resolves_volume', {
            volume: (chunks) => (
              <span className="font-bold text-white underline decoration-yellow-500/50 underline-offset-4">
                {chunks}
              </span>
            ),
          })}
        </p>
      </div>
    </div>
  );
}
