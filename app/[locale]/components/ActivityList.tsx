import React from 'react';
import { ExternalLink } from 'lucide-react';
import { TradeActivity, PredictionSide } from '../opinions/[opinion]/types';

interface ActivityListProps {
  activities: TradeActivity[];
  currentYesPrice: number;
  currentNoPrice: number;
}

export const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  currentYesPrice,
  currentNoPrice,
}) => {
  if (activities.length === 0) {
    return <div className="text-textSecondary p-8 text-center">No recent activity.</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      {activities.map((activity) => {
        const isYes = activity.side === PredictionSide.YES;
        const price = isYes ? currentYesPrice : currentNoPrice;

        return (
          <div
            key={activity.id}
            className="group border-theme bg-surface flex items-center justify-between rounded-xl border p-4 transition-colors hover:border-blue-500/20"
          >
            <div className="flex items-center gap-3">
              <img
                src={activity.user.avatar}
                alt={activity.user.name}
                className="border-theme h-10 w-10 rounded-full border"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-textPrimary font-semibold">{activity.user.name}</span>
                  <span className="text-textSecondary">bought</span>
                  <span className="text-textPrimary font-bold">
                    {activity.shares.toLocaleString()}
                  </span>
                  <span className={`font-bold ${isYes ? 'text-green-500' : 'text-red-500'}`}>
                    {activity.side}
                  </span>
                </div>
                <div className="text-textSecondary text-xs">
                  for {activity.side === 'YES' ? 'No change' : '50+ bps decrease'} at{' '}
                  <span className="text-textPrimary">${(price * 100).toFixed(1)}</span>
                  <span className="text-textSecondary ml-1">
                    (${activity.amount.toLocaleString()})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-textSecondary text-xs font-medium">{activity.timestamp}</span>
              <ExternalLink className="text-textSecondary h-4 w-4 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100 hover:text-blue-500" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
