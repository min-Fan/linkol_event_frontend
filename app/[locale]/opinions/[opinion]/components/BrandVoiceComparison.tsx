'use client';
import React from 'react';
import { Zap, Info, Trophy } from 'lucide-react';

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
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-gray-900 to-black p-8 shadow-2xl dark:from-muted dark:to-card">
        {/* Decorative background glow */}
        <div
          className={`absolute -top-24 -left-24 h-64 w-64 rounded-full blur-[100px] opacity-20 ${
            isYesWinning ? 'bg-green-500' : 'bg-red-500'
          }`}
        ></div>
        <div
          className={`absolute -bottom-24 -right-24 h-64 w-64 rounded-full blur-[100px] opacity-20 ${
            !isYesWinning ? 'bg-green-500' : 'bg-red-500'
          }`}
        ></div>

        {/* Header */}
        <div className="relative mb-8 flex items-center justify-between z-10">
          <h3 className="flex items-center gap-3 text-2xl font-black text-white italic tracking-wide">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-orange-500/20">
              <Zap className="h-6 w-6 text-white fill-white" />
            </span>
            BRAND VOICE BATTLE
          </h3>
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-gray-300 backdrop-blur-md border border-white/5">
            <Info className="h-3.5 w-3.5 text-blue-400" />
            <span>Entropy Weight Method</span>
          </div>
        </div>

        {/* Scoreboard */}
        <div className="relative z-10 mb-8 flex items-end justify-between text-white">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
              <p className="text-sm font-bold uppercase tracking-widest text-green-500">
                YES Voice
              </p>
            </div>
            <p className="text-5xl md:text-6xl font-black tracking-tighter drop-shadow-lg">
              {formatNumber(yesVoice)}
            </p>
          </div>

          <div className="mb-4 text-center">
            <div className="rounded-full bg-white/10 px-4 py-1 text-[10px] font-bold text-gray-400 border border-white/10 uppercase tracking-widest">
              Current Winner
            </div>
            <div
              className={`mt-2 text-xl font-black ${isYesWinning ? 'text-green-500' : 'text-red-500'}`}
            >
              {isYesWinning ? 'YES' : 'NO'}
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end gap-2 mb-1">
              <p className="text-sm font-bold uppercase tracking-widest text-red-500">NO Voice</p>
              <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
            </div>
            <p className="text-5xl md:text-6xl font-black tracking-tighter drop-shadow-lg">
              {formatNumber(noVoice)}
            </p>
          </div>
        </div>

        {/* Main Progress Bar */}
        <div className="relative z-10 mb-8">
          <div className="relative h-8 w-full overflow-hidden rounded-full bg-gray-800 shadow-inner ring-1 ring-white/10">
            <div
              style={{ width: `${yesPercent}%` }}
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-600 via-green-500 to-green-400 shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all duration-1000 ease-out flex items-center justify-start px-4"
            >
              {yesPercent > 10 && (
                <span className="text-xs font-black text-black tracking-widest">
                  {yesPercent.toFixed(1)}%
                </span>
              )}
            </div>
            <div
              style={{ width: `${noPercent}%` }}
              className="absolute right-0 top-0 h-full bg-gradient-to-l from-red-600 via-red-500 to-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all duration-1000 ease-out flex items-center justify-end px-4"
            >
              {noPercent > 10 && (
                <span className="text-xs font-black text-black tracking-widest">
                  {noPercent.toFixed(1)}%
                </span>
              )}
            </div>

            {/* Center VS Marker */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 border-4 border-gray-800 text-xs font-black text-white shadow-xl">
              VS
            </div>
          </div>
        </div>

        {/* Info Text */}
        <p className="relative z-10 text-center text-sm font-medium text-gray-400">
          <Trophy className="inline-block h-4 w-4 text-yellow-500 mr-2 -mt-1" />
          Prediction resolves based on{' '}
          <span className="text-white font-bold underline decoration-yellow-500/50 underline-offset-4">
            Volume
          </span>
          , not just participant count.
        </p>
      </div>
    </div>
  );
}

