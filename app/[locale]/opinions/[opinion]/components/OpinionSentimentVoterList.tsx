'use client';
import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Info } from 'lucide-react';
import { useBetDetail } from '@hooks/useBetDetail';
import { useTranslations } from 'next-intl';
import { PredictionSide } from '../types';
import defaultAvatar from '@assets/image/avatar.png';

export default function OpinionSentimentVoterList() {
  const params = useParams();
  const opinionId = params?.opinion as string;
  const { prospectiveData, betDetail } = useBetDetail(opinionId);
  const t = useTranslations('common');

  const yesCount = prospectiveData?.list?.[0]?.yes?.number || 0;
  const noCount = prospectiveData?.list?.[0]?.no?.number || 0;
  const kolHandle = betDetail?.topic?.screen_name ? `@${betDetail.topic.screen_name}` : '';

  // 准备 voters 数据
  const yesVoters = useMemo(() => {
    if (!prospectiveData?.list?.[0]?.yes?.icons) return [];
    return prospectiveData.list[0].yes.icons.map((icon, index) => ({
      id: `yes-voter-${index}`,
      name: '',
      handle: '',
      avatar: icon || defaultAvatar.src,
      verified: false,
    }));
  }, [prospectiveData]);

  const noVoters = useMemo(() => {
    if (!prospectiveData?.list?.[0]?.no?.icons) return [];
    return prospectiveData.list[0].no.icons.map((icon, index) => ({
      id: `no-voter-${index}`,
      name: '',
      handle: '',
      avatar: icon || defaultAvatar.src,
      verified: false,
    }));
  }, [prospectiveData]);

  const VoterRow: React.FC<{
    side: PredictionSide;
    count: number;
    handle: string;
    voters: typeof yesVoters;
  }> = ({ side, count, handle, voters }) => {
    const isYes = side === PredictionSide.YES;

    return (
      <div className="group border-border bg-card hover:border-primary/20 hover:bg-muted/50 relative overflow-hidden rounded-xl border p-4 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span
              className={`rounded-md px-3 py-1 text-sm font-bold shadow-sm ${
                isYes
                  ? 'bg-green-500/10 text-green-600 ring-1 ring-green-500/30 dark:text-green-400'
                  : 'bg-red-500/10 text-red-600 ring-1 ring-red-500/30 dark:text-red-400'
              }`}
            >
              {side}
            </span>
            <span className="text-muted-foreground text-base font-medium">
              <span className="text-foreground font-bold">
                {count} {t('kol_count')}
              </span>{' '}
              {isYes ? t('agree') : t('disagree')} with{' '}
              <span className="text-primary">{handle}</span>
            </span>
          </div>

          <div className="flex items-center -space-x-3">
            {voters.slice(0, 5).map((voter, idx) => (
              <img
                key={idx}
                src={voter.avatar}
                alt={voter.name}
                className={`border-card h-10 w-10 rounded-full border-2 object-cover transition-transform hover:z-10 hover:scale-110 ${
                  idx === 0 ? 'z-0' : `z-${idx}`
                }`}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = defaultAvatar.src;
                }}
              />
            ))}
            {voters.length > 5 && (
              <div className="border-card bg-muted text-muted-foreground z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-medium">
                +{count - 5}
              </div>
            )}
          </div>
        </div>

        {/* Subtle background gradient bar based on side */}
        <div
          className={`absolute bottom-0 left-0 h-0.5 w-full ${isYes ? 'bg-gradient-to-r from-green-500/0 via-green-500/50 to-green-500/0' : 'bg-gradient-to-r from-red-500/0 via-red-500/50 to-red-500/0'} opacity-0 transition-opacity group-hover:opacity-100`}
        ></div>
      </div>
    );
  };

  return (
    <div className="mt-6 space-y-6">
      <div className="space-y-4">
        <VoterRow
          side={PredictionSide.YES}
          count={yesCount}
          handle={kolHandle}
          voters={yesVoters}
        />
        <VoterRow side={PredictionSide.NO} count={noCount} handle={kolHandle} voters={noVoters} />
      </div>

      {/* Simplified Calculation Methodology Explainer */}
      <div className="border-border text-muted-foreground rounded-xl border border-dashed bg-transparent p-5 text-sm">
        <div className="flex items-start gap-3">
          <Info className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
          <div className="space-y-1">
            <h4 className="text-foreground font-medium">{t('how_brand_voice_calculated')}</h4>
            <p className="leading-relaxed">
              {t.rich('brand_voice_calculation_desc', {
                followers: (chunks) => <span className="text-foreground">{chunks}</span>,
                views: (chunks) => <span className="text-foreground">{chunks}</span>,
                likes: (chunks) => <span className="text-foreground">{chunks}</span>,
                reading_volume: (chunks) => <span className="text-foreground">{chunks}</span>,
                method: (chunks) => <span className="text-primary font-medium">{chunks}</span>,
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
