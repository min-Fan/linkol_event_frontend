import React from 'react';
import { X, Copy, Download, Twitter, CheckCircle2, Zap } from 'lucide-react';
import { Market, PredictionSide } from '../opinions/[opinion]/types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  market: Market;
  side: PredictionSide; // The side the user is supporting
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, market, side }) => {
  if (!isOpen) return null;

  const isYes = side === PredictionSide.YES;
  const gradient = isYes ? 'from-green-600 to-emerald-800' : 'from-red-600 to-rose-800';
  const borderColor = isYes ? 'border-green-500' : 'border-red-500';

  const shareText = `I bet ${side} on @${market.kol.handle}'s market on Linkol! 🚀\n\n"${market.question}"\n\nJoin my side and boost the Brand Voice! 👇\nhttps://linkol.xyz/market/${market.id}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm duration-200">
      <div className="border-theme bg-surface animate-in zoom-in-95 relative w-full max-w-md rounded-3xl border p-0 shadow-2xl duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="text-textSecondary hover:text-textPrimary absolute top-4 right-4 z-10 rounded-full bg-black/10 p-2 transition-all hover:bg-black/20 dark:bg-black/50 dark:hover:bg-black/70"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6">
          <h3 className="text-textPrimary mb-6 text-center text-xl font-bold">Rally Support</h3>

          {/* Share Card Preview - Kept dark intentionally for sharing visual consistency or adapted */}
          <div
            className={`relative overflow-hidden rounded-2xl border-2 ${borderColor} bg-gradient-to-br ${gradient} p-6 shadow-2xl`}
          >
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

            {/* Card Content */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="mb-4 flex items-center gap-3 rounded-full border border-white/10 bg-black/30 px-4 py-2 backdrop-blur-md">
                <div className="relative">
                  <img src={market.kol.avatar} alt="Avatar" className="h-8 w-8 rounded-full" />
                  {market.kol.verified && (
                    <CheckCircle2 className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full bg-black text-blue-400" />
                  )}
                </div>
                <span className="text-sm font-semibold text-white">{market.kol.name}</span>
              </div>

              <h4 className="mb-6 text-lg leading-tight font-bold text-white drop-shadow-md">
                "{market.question}"
              </h4>

              <div className="w-full rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-md">
                <p className="mb-1 text-xs tracking-widest text-gray-300 uppercase">I Support</p>
                <div
                  className={`text-4xl font-black ${isYes ? 'text-green-400' : 'text-red-400'} drop-shadow-sm`}
                >
                  {side}
                </div>
                <div className="mt-2 flex items-center justify-center gap-2 text-xs font-medium text-white/80">
                  <Zap className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>Boosting Brand Voice</span>
                </div>
              </div>
            </div>

            {/* Linkol Watermark */}
            <div className="absolute right-4 bottom-3 text-[10px] font-bold text-white/40 italic">
              Linkol.xyz
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#1DA1F2] py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-[#1a8cd8]"
            >
              <Twitter className="h-4 w-4 fill-white" />
              Share to X
            </a>
            <button className="bg-surfaceHighlight hover:bg-theme text-textPrimary border-theme flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold transition-all">
              <Download className="h-4 w-4" />
              Save Image
            </button>
          </div>

          <button className="text-textSecondary hover:text-textPrimary mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-colors">
            <Copy className="h-4 w-4" />
            Copy Link
          </button>
        </div>
      </div>
    </div>
  );
};
