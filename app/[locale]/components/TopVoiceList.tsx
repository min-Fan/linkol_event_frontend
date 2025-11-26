import React from 'react';
import { TopVoice, PredictionSide } from '../opinions/[opinion]/types';
import { CheckCircle2 } from 'lucide-react';

interface TopVoiceListProps {
  voices: TopVoice[];
}

const HolderRow: React.FC<{ voice: TopVoice }> = ({ voice }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex items-center gap-3">
      <div className="relative">
        <img
          src={voice.user.avatar}
          alt={voice.user.name}
          className="border-theme h-10 w-10 rounded-full border"
        />
        {voice.user.verified && (
          <CheckCircle2 className="bg-surface absolute -right-1 -bottom-1 h-3.5 w-3.5 rounded-full text-blue-500" />
        )}
      </div>
      <span className="text-textPrimary text-sm font-medium">{voice.user.name}</span>
    </div>
    <div className="text-right text-xs">
      <div className={voice.side === 'YES' ? 'font-bold text-green-500' : 'font-bold text-red-500'}>
        ${voice.amount.toLocaleString()}
      </div>
      <div className="text-textSecondary">/ {voice.influenceScore.toLocaleString()}</div>
    </div>
  </div>
);

export const TopVoiceList: React.FC<TopVoiceListProps> = ({ voices }) => {
  const yesHolders = voices.filter((v) => v.side === PredictionSide.YES);
  const noHolders = voices.filter((v) => v.side === PredictionSide.NO);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* YES Holders */}
      <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5">
        <div className="mb-4 flex items-center justify-between border-b border-green-500/20 pb-2">
          <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">YES Holder</h3>
          <span className="text-textSecondary text-xs">Shares / Brand voice</span>
        </div>
        <div className="divide-y divide-green-500/10">
          {yesHolders.length > 0 ? (
            yesHolders.map((voice, idx) => <HolderRow key={idx} voice={voice} />)
          ) : (
            <div className="text-textSecondary py-4 text-center text-xs">No top voices yet</div>
          )}
          {/* Duplicate for visual fullness if needed, or remove */}
          {yesHolders.length > 0 &&
            yesHolders.map((voice, idx) => <HolderRow key={`dup-${idx}`} voice={voice} />)}
          {yesHolders.length > 0 &&
            yesHolders.map((voice, idx) => <HolderRow key={`dup2-${idx}`} voice={voice} />)}
        </div>
      </div>

      {/* NO Holders */}
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
        <div className="mb-4 flex items-center justify-between border-b border-red-500/20 pb-2">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">No Holder</h3>
          <span className="text-textSecondary text-xs">Shares / Brand voice</span>
        </div>
        <div className="divide-y divide-red-500/10">
          {noHolders.length > 0 ? (
            noHolders.map((voice, idx) => <HolderRow key={idx} voice={voice} />)
          ) : (
            <div className="text-textSecondary py-4 text-center text-xs">No top voices yet</div>
          )}
          {/* Duplicate for visual fullness if needed */}
          {noHolders.length > 0 &&
            noHolders.map((voice, idx) => <HolderRow key={`dup-${idx}`} voice={voice} />)}
        </div>
      </div>
    </div>
  );
};
