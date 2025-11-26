import React, { useState } from 'react';
import { ArrowRight, Info, AlertCircle, Share2, TrendingUp } from 'lucide-react';
import { Market, PredictionSide } from '../opinions/[opinion]/types';

interface TradingPanelProps {
  market: Market;
  onShare: (side: PredictionSide) => void;
}

export const TradingPanel: React.FC<TradingPanelProps> = ({ market, onShare }) => {
  const [selectedSide, setSelectedSide] = useState<PredictionSide>(PredictionSide.YES);
  const [amount, setAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const price = selectedSide === PredictionSide.YES ? market.yesPrice : market.noPrice;
  const potentialReturn = amount > 0 ? (amount / price).toFixed(2) : '0.00';
  const returnPercentage = ((1 / price - 1) * 100).toFixed(0);

  const handleTrade = () => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => setIsProcessing(false), 1500);
  };

  return (
    <div className="border-theme bg-surface h-fit rounded-2xl border p-6 shadow-xl">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-textPrimary text-lg font-semibold">Place Order</h3>
        <span className="text-textSecondary bg-surfaceHighlight flex items-center gap-1 rounded px-2 py-1 text-xs">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span> Live
        </span>
      </div>

      <div className="bg-surfaceHighlight border-theme mb-6 flex rounded-lg border p-1">
        <button
          onClick={() => setSelectedSide(PredictionSide.YES)}
          className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition-all ${
            selectedSide === PredictionSide.YES
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'text-textSecondary hover:text-textPrimary'
          }`}
        >
          Yes ${market.yesPrice.toFixed(2)}
        </button>
        <button
          onClick={() => setSelectedSide(PredictionSide.NO)}
          className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition-all ${
            selectedSide === PredictionSide.NO
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
              : 'text-textSecondary hover:text-textPrimary'
          }`}
        >
          No ${market.noPrice.toFixed(2)}
        </button>
      </div>

      <div className="mb-6 space-y-4">
        <div>
          <label className="text-textSecondary mb-2 block text-xs font-medium">Amount (USDT)</label>
          <div className="relative">
            <input
              type="number"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="0"
              className="border-theme bg-surfaceHighlight/50 text-textPrimary placeholder-textSecondary w-full rounded-xl border px-4 py-3 text-2xl font-bold transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:bg-black/40"
            />
            <div className="absolute top-2 right-2 flex gap-1">
              {[10, 50, 100].map((val) => (
                <button
                  key={val}
                  onClick={() => setAmount(val)}
                  className="bg-surface border-theme text-textSecondary hover:bg-surfaceHighlight rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors"
                >
                  +{val}
                </button>
              ))}
              <button
                onClick={() => setAmount(1000)} // Mock max
                className="bg-surface border-theme hover:bg-surfaceHighlight rounded-lg border px-2 py-1.5 text-xs font-medium text-blue-500 transition-colors"
              >
                Max
              </button>
            </div>
          </div>
        </div>

        <div className="border-theme bg-surfaceHighlight/50 space-y-2 rounded-xl border p-4">
          <div className="flex justify-between text-sm">
            <span className="text-textSecondary">Avg. Price</span>
            <span className="text-textPrimary font-mono">${price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-textSecondary">Est. Shares</span>
            <span className="text-textPrimary font-mono">{potentialReturn}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-textSecondary">Potential Return</span>
            <span className="font-mono text-green-500">+{returnPercentage}%</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleTrade}
        disabled={isProcessing}
        className={`w-full rounded-xl py-4 text-base font-bold text-white shadow-lg transition-all ${
          selectedSide === PredictionSide.YES
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500'
            : 'bg-gradient-to-r from-red-500 to-orange-600 shadow-red-500/20 hover:from-red-400 hover:to-orange-500'
        } ${isProcessing ? 'cursor-wait opacity-70' : ''} `}
      >
        {isProcessing ? 'Processing...' : `Buy ${selectedSide}`}
      </button>

      {/* Share / Call Out Section */}
      <div className="border-theme mt-6 border-t pt-6">
        <div className="from-surfaceHighlight to-surface border-theme rounded-xl border bg-gradient-to-br p-4">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-yellow-500" />
            <span className="text-textPrimary text-sm font-bold">Boost Your Side</span>
          </div>
          <p className="text-textSecondary mb-3 text-xs">
            Share your position to rally more users. Higher Brand Voice increases winning chances.
          </p>
          <button
            onClick={() => onShare(selectedSide)}
            className="bg-surface border-theme hover:bg-surfaceHighlight text-textPrimary flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-all"
          >
            <Share2 className="h-4 w-4" />
            Share & Call Out
          </button>
        </div>
      </div>

      <div className="text-textSecondary mt-4 flex items-start gap-2 text-xs">
        <Info className="mt-0.5 h-3 w-3 flex-shrink-0" />
        <p>
          Positions are locked until the campaign ends on{' '}
          <span className="text-textPrimary">{market.endDate}</span>. Settlement occurs upon
          resolution.
        </p>
      </div>
    </div>
  );
};
