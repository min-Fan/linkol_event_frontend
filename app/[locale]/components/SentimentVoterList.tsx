import React from 'react';
import { PredictionSide, KOL } from '../opinions/[opinion]/types';
import { Info } from 'lucide-react';

interface SentimentVoterListProps {
  yesCount: number;
  noCount: number;
  kolHandle: string;
  yesVoters: KOL[]; // Top voters for preview
  noVoters: KOL[]; // Top voters for preview
}

const VoterRow: React.FC<{
  side: PredictionSide;
  count: number;
  handle: string;
  voters: KOL[];
}> = ({ side, count, handle, voters }) => {
  const isYes = side === PredictionSide.YES;

  return (
    <div className="group border-theme bg-surface hover:bg-surfaceHighlight/50 relative overflow-hidden rounded-xl border p-4 transition-all hover:border-blue-500/20">
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
          <span className="text-textSecondary text-base font-medium">
            <span className="text-textPrimary font-bold">{count} KOLs</span>{' '}
            {isYes ? 'agree' : 'disagree'} with <span className="text-blue-500">{handle}</span>
          </span>
        </div>

        <div className="flex items-center -space-x-3">
          {voters.slice(0, 5).map((voter, idx) => (
            <img
              key={idx}
              src={voter.avatar}
              alt={voter.name}
              className={`border-surface h-10 w-10 rounded-full border-2 object-cover transition-transform hover:z-10 hover:scale-110 ${
                idx === 0 ? 'z-0' : `z-${idx}`
              }`}
            />
          ))}
          {voters.length > 5 && (
            <div className="border-surface bg-surfaceHighlight text-textSecondary z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-medium">
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

export const SentimentVoterList: React.FC<SentimentVoterListProps> = ({
  yesCount,
  noCount,
  kolHandle,
  yesVoters,
  noVoters,
}) => {
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
      <div className="border-theme text-textSecondary rounded-xl border border-dashed bg-transparent p-5 text-sm">
        <div className="flex items-start gap-3">
          <Info className="text-textSecondary mt-0.5 h-4 w-4 shrink-0" />
          <div className="space-y-1">
            <h4 className="text-textPrimary font-medium">How is Brand Voice calculated?</h4>
            <p className="leading-relaxed">
              Brand Voice volume is calculated based on participants'{' '}
              <span className="text-textPrimary">Followers</span>,{' '}
              <span className="text-textPrimary">Views</span>,{' '}
              <span className="text-textPrimary">Likes</span>, and{' '}
              <span className="text-textPrimary">Reading volume</span>. We use the{' '}
              <span className="font-medium text-blue-500">Entropy Weight Method</span> to accumulate
              these metrics into a single influence score.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
