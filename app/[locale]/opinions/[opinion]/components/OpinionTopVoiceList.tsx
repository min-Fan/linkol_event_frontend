'use client';
import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { useBetDetail } from '@hooks/useBetDetail';
import { useTranslations } from 'next-intl';
import { PredictionSide } from '../types';
import defaultAvatar from '@assets/image/avatar.png';

export default function OpinionTopVoiceList() {
  const params = useParams();
  const opinionId = params?.opinion as string;
  const { topVoiceData, isTopVoiceLoading } = useBetDetail(opinionId);
  const t = useTranslations('common');

  // 转换 Top Voice 数据格式
  const transformedTopVoices = useMemo(() => {
    if (!topVoiceData) return [];
    const voices: Array<{
      user: {
        id: string;
        name: string;
        handle: string;
        avatar: string;
        verified: boolean;
      };
      side: PredictionSide;
      amount: number;
      influenceScore: number;
    }> = [];

    // YES holders
    if (topVoiceData.yesHolders) {
      topVoiceData.yesHolders.forEach((holder) => {
        voices.push({
          user: {
            id: holder.id,
            name: holder.name,
            handle: '',
            avatar: holder.avatar || defaultAvatar.src,
            verified: false,
          },
          side: PredictionSide.YES,
          amount: holder.shares,
          influenceScore: holder.brandVoice,
        });
      });
    }

    // NO holders
    if (topVoiceData.noHolders) {
      topVoiceData.noHolders.forEach((holder) => {
        voices.push({
          user: {
            id: holder.id,
            name: holder.name,
            handle: '',
            avatar: holder.avatar || defaultAvatar.src,
            verified: false,
          },
          side: PredictionSide.NO,
          amount: holder.shares,
          influenceScore: holder.brandVoice,
        });
      });
    }

    return voices;
  }, [topVoiceData]);

  const yesHolders = transformedTopVoices.filter((v) => v.side === PredictionSide.YES);
  const noHolders = transformedTopVoices.filter((v) => v.side === PredictionSide.NO);

  const HolderRow: React.FC<{ voice: (typeof transformedTopVoices)[0] }> = ({ voice }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={voice.user.avatar}
            alt={voice.user.name}
            className="border-border h-10 w-10 rounded-full border"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = defaultAvatar.src;
            }}
          />
          {voice.user.verified && (
            <CheckCircle2 className="bg-card text-primary absolute -right-1 -bottom-1 h-3.5 w-3.5 rounded-full" />
          )}
        </div>
        <span className="text-foreground text-sm font-medium">{voice.user.name}</span>
      </div>
      <div className="text-right text-xs">
        <div
          className={
            voice.side === PredictionSide.YES
              ? 'font-bold text-green-500'
              : 'font-bold text-red-500'
          }
        >
          ${voice.amount.toLocaleString()}
        </div>
        <div className="text-muted-foreground">/ {voice.influenceScore.toLocaleString()}</div>
      </div>
    </div>
  );

  if (isTopVoiceLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5">
          <div className="text-muted-foreground py-4 text-center text-xs">Loading...</div>
        </div>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
          <div className="text-muted-foreground py-4 text-center text-xs">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* YES Holders */}
      <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5">
        <div className="mb-4 flex items-center justify-between border-b border-green-500/20 pb-2">
          <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">
            {t('yes_holder')}
          </h3>
          <span className="text-muted-foreground text-xs">{t('shares_brand_voice')}</span>
        </div>
        <div className="divide-y divide-green-500/10">
          {yesHolders.length > 0 ? (
            yesHolders.map((voice, idx) => <HolderRow key={idx} voice={voice} />)
          ) : (
            <div className="text-muted-foreground py-4 text-center text-xs">
              {t('no_top_voices')}
            </div>
          )}
        </div>
      </div>

      {/* NO Holders */}
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
        <div className="mb-4 flex items-center justify-between border-b border-red-500/20 pb-2">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">{t('no_holder')}</h3>
          <span className="text-muted-foreground text-xs">{t('shares_brand_voice')}</span>
        </div>
        <div className="divide-y divide-red-500/10">
          {noHolders.length > 0 ? (
            noHolders.map((voice, idx) => <HolderRow key={idx} voice={voice} />)
          ) : (
            <div className="text-muted-foreground py-4 text-center text-xs">
              {t('no_top_voices')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
