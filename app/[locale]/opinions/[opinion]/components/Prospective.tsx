'use client';
import React from 'react';
import DefaultAvatarImg from '@assets/image/avatar.png';
import OpinionActions from './OpinionActions';
import { Info } from 'lucide-react';
import { IBetProspectiveItem } from '@libs/request';
import { useTranslations } from 'next-intl';

interface ProspectiveProps {
  data?: IBetProspectiveItem[];
  issueScreenName?: string;
}

const VoterRow: React.FC<{
  side: 'yes' | 'no';
  count: number;
  handle: string;
  icons: string[];
  percentage: number;
  brandValue: number;
  t: (key: string) => string;
}> = ({ side, count, handle, icons, percentage, brandValue, t }) => {
  const isYes = side === 'yes';

  return (
    <div className="group border-border bg-accent dark:bg-muted/20 hover:border-primary/20 hover:bg-muted/50 relative overflow-hidden rounded-xl border p-4 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span
            className={`rounded-md px-3 py-1 text-sm font-bold shadow-sm ${
              isYes
                ? 'bg-green-500/10 text-green-600 ring-1 ring-green-500/30 dark:text-green-400'
                : 'bg-red-500/10 text-red-600 ring-1 ring-red-500/30 dark:text-red-400'
            }`}
          >
            {isYes ? 'YES' : 'NO'}
          </span>
          <span className="text-muted-foreground text-base font-medium">
            <span className="text-foreground font-bold">
              {count} {t('kol_count')}
            </span>{' '}
            {isYes ? t('agree') : t('disagree')} with <span className="text-primary">{handle}</span>
          </span>
        </div>

        <div className="flex items-center -space-x-3">
          {icons.slice(0, 5).map((icon, idx) => (
            <img
              key={idx}
              src={icon || DefaultAvatarImg.src}
              alt={`avatar-${idx}`}
              className={`border-card h-10 w-10 rounded-full border-2 object-cover transition-transform hover:z-10 hover:scale-110 ${
                idx === 0 ? 'z-0' : `z-${idx}`
              }`}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = DefaultAvatarImg.src;
              }}
            />
          ))}
          {icons.length > 5 && (
            <div className="border-card bg-muted text-muted-foreground z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-medium">
              +{count - 5}
            </div>
          )}
        </div>
      </div>

      {/* Subtle background gradient bar based on side */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 w-full ${
          isYes
            ? 'bg-gradient-to-r from-green-500/0 via-green-500/50 to-green-500/0'
            : 'bg-gradient-to-r from-red-500/0 via-red-500/50 to-red-500/0'
        } opacity-0 transition-opacity group-hover:opacity-100`}
      ></div>
    </div>
  );
};

export default function Prospective({ data, issueScreenName }: ProspectiveProps) {
  const t = useTranslations('common');

  const handleAddPerspective = () => {
    console.log('Add perspective clicked');
  };

  const handleLetAgentComment = () => {
    console.log('Let agent comment clicked');
  };

  // 如果没有数据，显示空状态
  if (!data || data.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-muted-foreground py-8 text-center">{t('no_data_available')}</div>
        <OpinionActions
          onAddPerspective={handleAddPerspective}
          onLetAgentComment={handleLetAgentComment}
        />
      </div>
    );
  }

  // 使用第一条数据（根据API返回结构，通常只有一条）
  const firstItem = data[0];
  const kolHandle = issueScreenName || firstItem.issue_screen_name;

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <VoterRow
          side="yes"
          count={firstItem.yes.number}
          handle={`@${kolHandle}`}
          icons={firstItem.yes.icons}
          percentage={firstItem.yes.percentage}
          brandValue={firstItem.yes.total_brand_value}
          t={t}
        />
        <VoterRow
          side="no"
          count={firstItem.no.number}
          handle={`@${kolHandle}`}
          icons={firstItem.no.icons}
          percentage={firstItem.no.percentage}
          brandValue={firstItem.no.total_brand_value}
          t={t}
        />
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

      {/* 操作按钮 */}
      {/* <OpinionActions
        onAddPerspective={handleAddPerspective}
        onLetAgentComment={handleLetAgentComment}
      /> */}
    </div>
  );
}
