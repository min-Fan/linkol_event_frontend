'use client';
import React from 'react';
import DefaultAvatarImg from '@assets/image/avatar.png';
import OpinionActions from './OpinionActions';
import { Info } from 'lucide-react';
import { IBetProspectiveItem } from '@libs/request';

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
}> = ({ side, count, handle, icons, percentage, brandValue }) => {
  const isYes = side === 'yes';

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/20 hover:bg-muted/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span
            className={`rounded-md px-3 py-1 text-sm font-bold shadow-sm ${
              isYes
                ? 'bg-green-500/10 text-green-600 dark:text-green-400 ring-1 ring-green-500/30'
                : 'bg-red-500/10 text-red-600 dark:text-red-400 ring-1 ring-red-500/30'
            }`}
          >
            {isYes ? 'YES' : 'NO'}
          </span>
          <span className="text-base font-medium text-muted-foreground">
            <span className="font-bold text-foreground">{count} KOLs</span>{' '}
            {isYes ? 'agree' : 'disagree'} with <span className="text-primary">{handle}</span>
          </span>
        </div>

        <div className="flex items-center -space-x-3">
          {icons.slice(0, 5).map((icon, idx) => (
            <img
              key={idx}
              src={icon || DefaultAvatarImg.src}
              alt={`avatar-${idx}`}
              className={`h-10 w-10 rounded-full border-2 border-card object-cover transition-transform hover:scale-110 hover:z-10 ${
                idx === 0 ? 'z-0' : `z-${idx}`
              }`}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = DefaultAvatarImg.src;
              }}
            />
          ))}
          {icons.length > 5 && (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-card bg-muted text-xs font-medium text-muted-foreground z-10">
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
        <div className="text-center text-muted-foreground py-8">暂无数据</div>
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
        />
        <VoterRow
          side="no"
          count={firstItem.no.number}
          handle={`@${kolHandle}`}
          icons={firstItem.no.icons}
          percentage={firstItem.no.percentage}
          brandValue={firstItem.no.total_brand_value}
        />
      </div>

      {/* Simplified Calculation Methodology Explainer */}
      <div className="rounded-xl border border-dashed border-border bg-transparent p-5 text-sm text-muted-foreground">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="space-y-1">
            <h4 className="font-medium text-foreground">How is Brand Voice calculated?</h4>
            <p className="leading-relaxed">
              Brand Voice volume is calculated based on participants'{' '}
              <span className="text-foreground">Followers</span>,{' '}
              <span className="text-foreground">Views</span>,{' '}
              <span className="text-foreground">Likes</span>, and{' '}
              <span className="text-foreground">Reading volume</span>. We use the{' '}
              <span className="text-primary font-medium">Entropy Weight Method</span> to accumulate
              these metrics into a single influence score.
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
