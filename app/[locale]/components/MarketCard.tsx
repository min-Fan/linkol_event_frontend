import React from 'react';
import { MessageSquare, BarChart2, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { Market } from '../opinions/[opinion]/types';

interface MarketCardProps {
  market: Market;
  onClick: (id: string) => void;
}

export const MarketCard: React.FC<MarketCardProps> = ({ market, onClick }) => {
  const yesPct = Math.round(market.yesPrice * 100);
  const noPct = Math.round(market.noPrice * 100);

  return (
    <div
      onClick={() => onClick(market.id)}
      className="group border-theme bg-surface relative cursor-pointer overflow-hidden rounded-2xl border p-5 transition-all hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-blue-900/10"
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={market.kol.avatar}
              alt={market.kol.name}
              className="border-theme h-10 w-10 rounded-full border object-cover"
            />
            {market.kol.verified && (
              <CheckCircle2 className="bg-surface absolute -right-1 -bottom-1 h-4 w-4 rounded-full text-blue-500" />
            )}
          </div>
          <div>
            <h3 className="text-textPrimary font-semibold transition-colors group-hover:text-blue-500">
              {market.kol.name}
            </h3>
            <p className="text-textSecondary text-xs">
              {market.kol.handle} • {market.tweetDate}
            </p>
          </div>
        </div>
        {market.isTrending && (
          <span className="flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-500">
            <BarChart2 className="h-3 w-3" /> Trending
          </span>
        )}
      </div>

      {/* Content */}
      <div className="mb-5 space-y-3">
        <p className="text-textPrimary/90 line-clamp-2 text-sm font-medium">{market.question}</p>
        <div className="border-theme bg-surfaceHighlight text-textSecondary rounded-xl border p-3 text-sm italic">
          "{market.tweetContent}"
        </div>
      </div>

      {/* Probability Bar */}
      <div className="mb-4">
        <div className="mb-2 flex justify-between text-sm font-semibold">
          <span className="text-blue-500">Yes {yesPct}%</span>
          <span className="text-red-500">No {noPct}%</span>
        </div>
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
          <div
            style={{ width: `${yesPct}%` }}
            className="bg-gradient-to-r from-blue-600 to-indigo-500"
          />
          <div style={{ width: `${noPct}%` }} className="bg-surfaceHighlight dark:bg-gray-700" />
        </div>
      </div>

      {/* Footer */}
      <div className="text-textSecondary flex items-center justify-between text-xs">
        <span className="font-mono font-medium">${(market.volume / 1000000).toFixed(1)}m Vol.</span>
        <div className="flex items-center gap-4">
          <span className="hover:text-textPrimary flex items-center gap-1 transition-colors">
            <MessageSquare className="h-3.5 w-3.5" /> {market.commentsCount}
          </span>
          <MoreHorizontal className="hover:text-textPrimary h-4 w-4 transition-colors" />
        </div>
      </div>
    </div>
  );
};
