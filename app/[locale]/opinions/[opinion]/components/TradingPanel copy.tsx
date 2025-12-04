
import React, { useState, useEffect } from 'react';
import { ArrowRight, Info, AlertCircle, Share2, TrendingUp, Trophy, XCircle, CheckCircle, Wallet, RefreshCw, Lock, Crown, Coins, Clock } from 'lucide-react';
// @ts-ignore
import { Market, PredictionSide, MarketStatus, UserPosition } from '../types';

interface TradingPanelProps {
  market: Market;
  onShare: (side: PredictionSide) => void;
  // Simulation Props
  status: MarketStatus;
  resolutionOutcome?: PredictionSide | null; // If resolved, which side won?
  userPosition?: UserPosition | null;
  onClaim?: () => void;
  // Owner / Royalty Props
  isOwner?: boolean;
  accruedRoyalties?: number;
}

export const TradingPanel: React.FC<TradingPanelProps> = ({ 
  market, 
  onShare, 
  status, 
  resolutionOutcome, 
  userPosition,
  onClaim,
  isOwner = false,
  accruedRoyalties = 0
}) => {
  // Initialize side based on position, default to YES
  const [selectedSide, setSelectedSide] = useState<PredictionSide>(
    userPosition ? userPosition.side : PredictionSide.YES
  );
  const [amount, setAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClaimingRoyalties, setIsClaimingRoyalties] = useState(false);
  const [hasClaimedRoyalties, setHasClaimedRoyalties] = useState(false);

  // Sync selected side if userPosition changes (e.g. via simulation controls)
  useEffect(() => {
    if (userPosition) {
      setSelectedSide(userPosition.side);
    }
  }, [userPosition]);

  const price = selectedSide === PredictionSide.YES ? market.yesPrice : market.noPrice;
  const potentialReturn = amount > 0 ? (amount / price).toFixed(2) : '0.00';
  const returnPercentage = ((1 / price - 1) * 100).toFixed(0);
  const isMarketResolved = status === MarketStatus.RESOLVED;

  const handleTrade = () => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => setIsProcessing(false), 1500);
  };

  const handleClaimRoyalties = () => {
    if (!isMarketResolved) return;
    setIsClaimingRoyalties(true);
    setTimeout(() => {
        setIsClaimingRoyalties(false);
        setHasClaimedRoyalties(true);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* --- OWNER ROYALTY CARD --- */}
      {isOwner && (
        <div className="relative overflow-hidden rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 p-6 shadow-xl animate-in slide-in-from-top-4">
             {/* Decor */}
             <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Crown className="h-24 w-24 text-yellow-600 dark:text-yellow-400" />
             </div>
             <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-yellow-500/20 blur-3xl pointer-events-none"></div>

             <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center h-8 w-8 rounded-full bg-yellow-500 text-white shadow-sm">
                            <Crown className="h-4 w-4" />
                        </span>
                        <div>
                            <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wide">Owner Dashboard</h3>
                            <p className="text-[10px] text-textSecondary font-medium">You minted this asset</p>
                        </div>
                    </div>
                    {/* Status Badge */}
                    <div className={`px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider ${
                        isMarketResolved 
                        ? 'bg-green-500/20 border-green-500/30 text-green-500' 
                        : 'bg-yellow-500/20 border-yellow-500/30 text-yellow-500'
                    }`}>
                        {isMarketResolved ? 'Ready to Claim' : 'Accruing Fees'}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="rounded-xl bg-surface/60 backdrop-blur-sm border border-yellow-500/20 p-3">
                        <p className="text-[10px] text-textSecondary uppercase font-bold">Total Volume</p>
                        <p className="text-lg font-mono font-bold text-textPrimary">${(market.volume / 1000000).toFixed(2)}M</p>
                    </div>
                    <div className="rounded-xl bg-surface/60 backdrop-blur-sm border border-yellow-500/20 p-3">
                        <p className="text-[10px] text-textSecondary uppercase font-bold">Royalty Rate</p>
                        <p className="text-lg font-mono font-bold text-green-500">5.0%</p>
                    </div>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-textSecondary">Unclaimed Royalties</span>
                        <span className="text-2xl font-black text-textPrimary tracking-tight">
                            ${hasClaimedRoyalties ? '0.00' : accruedRoyalties.toLocaleString()}
                        </span>
                    </div>
                    
                    {hasClaimedRoyalties ? (
                         <button disabled className="w-full flex items-center justify-center gap-2 rounded-xl bg-surfaceHighlight border border-theme py-3 text-sm font-bold text-green-500 cursor-not-allowed">
                            <CheckCircle className="h-4 w-4" />
                            Revenue Claimed
                        </button>
                    ) : (
                        <button 
                            onClick={handleClaimRoyalties}
                            disabled={isClaimingRoyalties || !isMarketResolved}
                            className={`relative group w-full overflow-hidden rounded-xl py-3.5 text-sm font-bold shadow-lg transition-transform active:scale-95 ${
                                isMarketResolved 
                                ? 'bg-textPrimary text-background' 
                                : 'bg-surfaceHighlight text-textSecondary border border-theme cursor-not-allowed'
                            }`}
                        >
                            {isMarketResolved && <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 opacity-90 group-hover:opacity-100 transition-opacity animate-[shimmer_2s_infinite]"></div>}
                            
                            <div className={`relative flex items-center justify-center gap-2 ${isMarketResolved ? 'text-white' : ''}`}>
                                {isClaimingRoyalties ? (
                                    <>Processing...</>
                                ) : !isMarketResolved ? (
                                    <>
                                        <Lock className="h-4 w-4" />
                                        Locked until Resolution
                                    </>
                                ) : (
                                    <>
                                        <Coins className="h-4 w-4" />
                                        Claim ${accruedRoyalties.toLocaleString()}
                                    </>
                                )}
                            </div>
                        </button>
                    )}
                </div>
                
                <div className="flex items-start gap-2 rounded-lg bg-surface/40 p-2 text-[10px] text-textSecondary">
                    <Clock className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <p>Royalties accrue in real-time but can only be claimed after the market successfully resolves.</p>
                </div>
             </div>
        </div>
      )}

      {/* --- STANDARD TRADING PANEL --- */}
      {status === MarketStatus.RESOLVED && resolutionOutcome ? (
        <div className="rounded-2xl border border-theme bg-surface p-6 shadow-xl h-fit">
        <div className="mb-6 flex items-center justify-between border-b border-theme pb-4">
          <h3 className="text-lg font-bold text-textPrimary">Market Resolved</h3>
          <span className="rounded-full bg-surfaceHighlight border border-theme px-3 py-1 text-xs font-bold text-textSecondary">
            Outcome: <span className={resolutionOutcome === PredictionSide.YES ? 'text-green-500' : 'text-red-500'}>{resolutionOutcome}</span>
          </span>
        </div>

        {!userPosition && (
          <div className="text-center py-8 text-textSecondary">
            <p>You did not participate in this market.</p>
          </div>
        )}

        {userPosition && userPosition.side === resolutionOutcome && (
          <div className="space-y-6 animate-in zoom-in-95 duration-300">
            <div className="relative overflow-hidden rounded-xl border border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-6 text-center">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Trophy className="h-24 w-24 text-yellow-500" />
              </div>
              
              <Trophy className="mx-auto h-12 w-12 text-yellow-500 mb-2 drop-shadow-md" />
              <h4 className="text-2xl font-black text-textPrimary">Victory!</h4>
              <p className="text-sm text-textSecondary mb-4">You predicted correctly.</p>
              
              <div className="mb-6 flex flex-col items-center justify-center rounded-lg bg-surface/50 p-3 backdrop-blur-sm border border-yellow-500/20">
                <span className="text-xs text-textSecondary uppercase tracking-wider font-bold">Claimable Amount</span>
                <span className="text-3xl font-black text-green-500">${(userPosition.shares * 1.00).toLocaleString()}</span>
              </div>

              {userPosition.isClaimed ? (
                <button disabled className="flex w-full items-center justify-center gap-2 rounded-xl bg-surfaceHighlight py-3 text-sm font-bold text-textSecondary cursor-not-allowed">
                  <CheckCircle className="h-4 w-4" />
                  Rewards Claimed
                </button>
              ) : (
                <button 
                  onClick={onClaim}
                  className="relative group w-full overflow-hidden rounded-xl bg-yellow-500 py-3.5 text-black font-bold shadow-lg shadow-yellow-500/20 transition-transform active:scale-95"
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="flex items-center justify-center gap-2">
                    <Wallet className="h-4 w-4" /> Claim Rewards
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {userPosition && userPosition.side !== resolutionOutcome && (
          <div className="space-y-6 animate-in zoom-in-95 duration-300">
            <div className="relative overflow-hidden rounded-xl border border-red-500/30 bg-gradient-to-br from-red-500/5 to-pink-500/5 p-6 text-center">
              {/* Background Elements */}
              <div className="absolute -top-6 -right-6 p-4 opacity-5 pointer-events-none">
                 <XCircle className="h-40 w-40 text-red-500" />
              </div>
              
              <div className="relative z-10 mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                 <XCircle className="h-7 w-7 text-red-500" />
              </div>

              <h4 className="relative z-10 text-2xl font-black text-textPrimary mb-1 tracking-tight">Position Liquidated</h4>
              <p className="relative z-10 text-sm text-textSecondary mb-6">
                Market resolved to <span className={resolutionOutcome === PredictionSide.YES ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>{resolutionOutcome}</span>.
              </p>
              
              <div className="relative z-10 mb-6 rounded-lg bg-surface/60 p-4 backdrop-blur-md border border-red-500/10 flex justify-between items-center shadow-inner">
                <div className="text-left">
                    <p className="text-[10px] text-textSecondary uppercase font-bold tracking-wider">Your Bet</p>
                    <p className="text-lg font-bold text-textPrimary">{userPosition.side}</p>
                </div>
                <div className="h-8 w-px bg-border"></div>
                <div className="text-right">
                    <p className="text-[10px] text-textSecondary uppercase font-bold tracking-wider">Net PnL</p>
                    <p className="text-lg font-bold text-red-500">-${userPosition.amountInvested.toLocaleString()}</p>
                </div>
              </div>

              <button 
                className="relative z-10 group w-full overflow-hidden rounded-xl bg-surfaceHighlight hover:bg-surface border border-theme py-3.5 text-textPrimary font-bold transition-all active:scale-95 shadow-sm hover:shadow-md"
              >
                 <span className="flex items-center justify-center gap-2">
                   <TrendingUp className="h-4 w-4 text-blue-500" /> Find Next Alpha
                 </span>
              </button>
            </div>
          </div>
        )}
      </div>
      ) : (
      <div className="rounded-2xl border border-theme bg-surface p-6 shadow-xl h-fit transition-all duration-300">
        <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-textPrimary">Place Order</h3>
            <span className="flex items-center gap-1 text-xs text-textSecondary bg-surfaceHighlight px-2 py-1 rounded">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span> Live
            </span>
        </div>

        {/* Existing Position Card (If any) */}
        {userPosition && (
            <div className="mb-6 rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 animate-in slide-in-from-top-2 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-500 uppercase tracking-wide">Your Position</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${userPosition.side === PredictionSide.YES ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    {userPosition.side} Holder
                </span>
            </div>
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-2xl font-bold text-textPrimary">{userPosition.shares.toLocaleString()} <span className="text-sm font-normal text-textSecondary">Shares</span></p>
                    <p className="text-xs text-textSecondary">Avg Price: ${(userPosition.avgPrice).toFixed(2)}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-textSecondary">Value</p>
                    <p className="font-mono font-medium text-textPrimary">${(userPosition.shares * (userPosition.side === PredictionSide.YES ? market.yesPrice : market.noPrice)).toFixed(2)}</p>
                </div>
            </div>
            </div>
        )}

        {/* Trading Form */}
        <div className="mb-6 flex rounded-lg bg-surfaceHighlight p-1 border border-theme relative">
            <button
            disabled={userPosition && userPosition.side !== PredictionSide.YES}
            onClick={() => setSelectedSide(PredictionSide.YES)}
            className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition-all relative ${
                selectedSide === PredictionSide.YES
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-textSecondary hover:text-textPrimary hover:bg-surface/50'
            } ${userPosition && userPosition.side !== PredictionSide.YES ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
            {userPosition && userPosition.side !== PredictionSide.YES && (
                <div className="absolute inset-0 flex items-center justify-center bg-surface/50 backdrop-blur-[1px] rounded-md">
                    <Lock className="h-4 w-4 text-textSecondary" />
                </div>
            )}
            Yes ${(market.yesPrice).toFixed(2)}
            </button>
            <button
            disabled={userPosition && userPosition.side !== PredictionSide.NO}
            onClick={() => setSelectedSide(PredictionSide.NO)}
            className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition-all relative ${
                selectedSide === PredictionSide.NO
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                : 'text-textSecondary hover:text-textPrimary hover:bg-surface/50'
            } ${userPosition && userPosition.side !== PredictionSide.NO ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
            {userPosition && userPosition.side !== PredictionSide.NO && (
                <div className="absolute inset-0 flex items-center justify-center bg-surface/50 backdrop-blur-[1px] rounded-md">
                    <Lock className="h-4 w-4 text-textSecondary" />
                </div>
            )}
            No ${(market.noPrice).toFixed(2)}
            </button>
        </div>

        {userPosition && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-surfaceHighlight/50 p-2 text-xs text-textSecondary border border-theme">
                <Info className="h-3 w-3" />
                <span>You hold <strong>{userPosition.side}</strong>. You must sell your position before betting on the opposite side.</span>
            </div>
        )}

        <div className="mb-6 space-y-4">
            <div>
            <label className="mb-2 block text-xs font-medium text-textSecondary">Amount (USDT)</label>
            <div className="relative">
                <input
                type="number"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="0"
                className="w-full rounded-xl border border-theme bg-surfaceHighlight/50 dark:bg-black/40 px-4 py-3 text-2xl font-bold text-textPrimary placeholder-textSecondary focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <div className="absolute right-2 top-2 flex gap-1">
                {[10, 50, 100].map(val => (
                    <button
                    key={val}
                    onClick={() => setAmount(val)}
                    className="rounded-lg bg-surface border border-theme px-2 py-1.5 text-xs font-medium text-textSecondary hover:bg-surfaceHighlight transition-colors"
                    >
                    +{val}
                    </button>
                ))}
                <button 
                    onClick={() => setAmount(1000)} // Mock max
                    className="rounded-lg bg-surface border border-theme px-2 py-1.5 text-xs font-medium text-blue-500 hover:bg-surfaceHighlight transition-colors"
                >
                    Max
                </button>
                </div>
            </div>
            </div>

            <div className="space-y-2 rounded-xl border border-theme bg-surfaceHighlight/50 p-4">
            <div className="flex justify-between text-sm">
                <span className="text-textSecondary">Avg. Price</span>
                <span className="font-mono text-textPrimary">${price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-textSecondary">Est. Shares</span>
                <span className="font-mono text-textPrimary">{potentialReturn}</span>
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
            className={`w-full rounded-xl py-4 text-base font-bold text-white shadow-lg transition-all 
            ${selectedSide === PredictionSide.YES 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/20' 
                : 'bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-400 hover:to-orange-500 shadow-red-500/20'
            }
            ${isProcessing ? 'opacity-70 cursor-wait' : ''}
            `}
        >
            {isProcessing ? 'Processing...' : userPosition ? `Add to ${selectedSide}` : `Buy ${selectedSide}`}
        </button>

        {/* Share / Call Out Section */}
        <div className="mt-6 border-t border-theme pt-6">
            <div className="rounded-xl bg-gradient-to-br from-surfaceHighlight to-surface p-4 border border-theme">
            <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-bold text-textPrimary">Boost Your Side</span>
            </div>
            <p className="text-xs text-textSecondary mb-3">
                Share your position to rally more users. Higher Brand Voice increases winning chances.
            </p>
            <button 
                onClick={() => onShare(selectedSide)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-surface border border-theme hover:bg-surfaceHighlight py-2.5 text-sm font-medium text-textPrimary transition-all"
            >
                <Share2 className="h-4 w-4" />
                Share & Call Out
            </button>
            </div>
        </div>

        <div className="mt-4 flex items-start gap-2 text-xs text-textSecondary">
            <Info className="mt-0.5 h-3 w-3 flex-shrink-0" />
            <p>Positions are locked until the campaign ends on <span className="text-textPrimary">{market.endDate}</span>. Settlement occurs upon resolution.</p>
        </div>
      </div>
      )}
    </div>
  );
};
