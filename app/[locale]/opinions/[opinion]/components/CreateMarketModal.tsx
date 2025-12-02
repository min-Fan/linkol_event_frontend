import React, { useState } from 'react';
import {
  Wallet,
  AlertCircle,
  Coins,
  TrendingUp,
  Gem,
  ScanLine,
  ShieldCheck,
  Rocket,
  Crown,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/components/ui/dialog';
import { Input } from '@shadcn/components/ui/input';

interface CreateMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'INPUT' | 'ANALYZING' | 'PAYMENT' | 'MINTING' | 'SUCCESS';

export const CreateMarketModal: React.FC<CreateMarketModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<Step>('INPUT');
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{
    isEligible: boolean;
    controversyScore: number;
  } | null>(null);

  // Step 1: Trigger Analysis
  const handleAnalyze = async () => {
    if (!url) return;

    setError(null);
    setStep('ANALYZING');

    try {
      // 模拟 API 延迟
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock 验证逻辑
      // 检查 URL 格式
      if (!url.includes('x.com') && !url.includes('twitter.com')) {
        setStep('INPUT');
        setError('Invalid URL. Please provide a valid Twitter/X post URL.');
        return;
      }

      // Mock: 80% 概率通过，生成 60-100 的随机 controversy score
      const isEligible = Math.random() > 0.2;
      const controversyScore = Math.floor(Math.random() * 40) + 60; // Score between 60-100

      if (isEligible) {
        const result = {
          isEligible: true,
          controversyScore,
        };
        setAnalysisResult(result);
        setStep('PAYMENT');
      } else {
        setStep('INPUT');
        setError(
          'This tweet does not meet the eligibility criteria. It may lack sufficient controversy or engagement potential.'
        );
      }
    } catch (e) {
      setStep('INPUT');
      setError('AI Analysis failed. Please try again.');
    }
  };

  // Step 2: Trigger Payment & Minting
  const handlePayment = async () => {
    setStep('MINTING');

    // Simulate payment transaction
    setTimeout(() => {
      setStep('SUCCESS');
    }, 2000);
  };

  const reset = () => {
    setStep('INPUT');
    setUrl('');
    setError(null);
    setAnalysisResult(null);
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[90%] w-full gap-0 overflow-hidden rounded-3xl p-0 shadow-2xl sm:max-w-lg">
        {/* Background Effects */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-yellow-500/10 to-transparent dark:from-yellow-500/10"></div>
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-yellow-500/20 blur-[80px]"></div>
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-600/20 blur-[80px]"></div>

        <div className="p-5 md:p-8">
          {/* Header (Dynamic based on step) */}
          <DialogHeader className="mb-6 text-center md:mb-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-600 shadow-lg ring-1 shadow-orange-500/40 ring-yellow-200/50 transition-all duration-500 md:h-16 md:w-16">
              {step === 'SUCCESS' ? (
                <Rocket className="h-7 w-7 text-white md:h-8 md:w-8" />
              ) : (
                <Gem className="h-7 w-7 text-white drop-shadow-md md:h-8 md:w-8" />
              )}
            </div>
            <DialogTitle className="text-center text-2xl font-black tracking-tight md:text-3xl">
              {step === 'PAYMENT'
                ? 'Deploy Asset'
                : step === 'SUCCESS'
                  ? 'Market Live'
                  : 'Market Launchpad'}
            </DialogTitle>
            <p className="text-muted-foreground mt-2 px-4 text-center text-xs font-medium md:text-sm">
              {step === 'PAYMENT'
                ? 'Verify eligibility and mint your market.'
                : 'Tokenize a viral tweet. You own the volume.'}
            </p>
          </DialogHeader>

          {/* STEP 1: INPUT */}
          {step === 'INPUT' && (
            <div className="space-y-5 md:space-y-6">
              {/* Wealth Simulator Card */}
              <div className="relative overflow-hidden rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-50 to-orange-50 p-4 md:p-5 dark:from-yellow-900/20 dark:to-orange-900/10">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <Coins className="h-20 w-20 text-yellow-600 md:h-24 md:w-24 dark:text-yellow-500" />
                </div>

                <div className="relative z-10">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex items-center justify-center rounded-md bg-yellow-500 px-2 py-0.5 text-[10px] font-bold tracking-wider text-black uppercase">
                      Creator Royalty
                    </span>
                    <span className="animate-pulse text-xs font-semibold text-yellow-700 dark:text-yellow-400">
                      Perpetual Revenue
                    </span>
                  </div>

                  <div className="mb-2 flex items-end gap-3">
                    <span className="text-4xl font-black tracking-tighter drop-shadow-sm md:text-5xl">
                      5<span className="text-2xl md:text-3xl">%</span>
                    </span>
                    <span className="text-muted-foreground mb-2 text-xs font-medium md:text-sm">
                      of total trading volume
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="text-muted-foreground flex justify-between text-xs">
                      <span>Projected Volume</span>
                      <span>Your Payout</span>
                    </div>
                    <div className="flex h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                      <div className="h-full w-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-yellow-600 to-yellow-400"></div>
                    </div>
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-muted-foreground text-xs">$1,000,000</span>
                      <span className="text-base font-bold text-yellow-600 md:text-lg dark:text-yellow-400">
                        +$50,000
                      </span>
                    </div>
                  </div>

                  {/* Event Ownership Rights */}
                  <div className="mt-4 flex items-start gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
                    <div className="mt-0.5 shrink-0 rounded-full bg-yellow-500 p-1.5 text-white shadow-sm">
                      <Crown className="h-3 w-3" />
                    </div>
                    <div className="text-xs">
                      <p className="mb-0.5 font-bold text-yellow-700 dark:text-yellow-400">
                        Event Owner Rights
                      </p>
                      <p className="text-muted-foreground leading-tight opacity-80">
                        If you are the owner of this event (Tweet/Post), you hold the{' '}
                        <strong className="">Market Ownership</strong>. You are entitled to share{' '}
                        <strong className="">5% of the royalty income</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Section */}
              <div className="space-y-2 md:space-y-3">
                <label className="text-muted-foreground mb-2 ml-1 text-xs font-bold tracking-wider uppercase ">
                  Your Tweet / X Post URL
                </label>
                <div className="group relative">
                  <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600 opacity-20 blur transition duration-500 group-hover:opacity-60"></div>
                  <Input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste link to your post (e.g. https://x.com/...)"
                    className="placeholder-muted-foreground relative !h-auto w-full rounded-xl !px-4 !py-3 text-sm shadow-inner transition-all focus:!border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none md:!py-4 md:!text-base"
                  />
                </div>
                {error && (
                  <div className="animate-in slide-in-from-top-1 flex items-center gap-2 px-2 text-xs font-medium text-red-500">
                    <AlertCircle className="h-3 w-3" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={handleAnalyze}
                  disabled={!url}
                  className="group relative w-full overflow-hidden rounded-xl px-6 py-3.5 shadow-xl transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 md:py-4"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-90 transition-opacity group-hover:opacity-100"></div>
                  <div className="relative flex items-center justify-center gap-2 text-xs font-black tracking-wide text-white uppercase md:text-sm">
                    <ScanLine className="h-4 w-4" />
                    <span>Analyze & Launch</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ANALYZING */}
          {step === 'ANALYZING' && (
            <div className="animate-in fade-in zoom-in-95 space-y-6 py-8 text-center duration-300 md:space-y-8 md:py-12">
              <div className="relative mx-auto h-24 w-24 md:h-28 md:w-28">
                <div className="border-surfaceHighlight absolute inset-0 rounded-full border-2"></div>
                <div className="absolute inset-0 animate-spin rounded-full border-t-2 border-blue-500"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-blue-500/10 md:h-20 md:w-20">
                    <ScanLine className="h-6 w-6 text-blue-500 md:h-8 md:w-8" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold md:text-xl">AI Agent Scanning...</h3>
                <p className="text-muted-foreground text-xs md:text-sm">
                  Checking market viability and controversy score.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT */}
          {step === 'PAYMENT' && analysisResult && (
            <div className="animate-in fade-in slide-in-from-right-4 space-y-5 duration-300 md:space-y-6">
              {/* Result Card */}
              <div className="flex items-start gap-4 rounded-xl border border-green-500/30 bg-green-500/5 p-4">
                <div className="shrink-0 rounded-full bg-green-500/20 p-2 text-green-500">
                  <ShieldCheck className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold md:text-base">Asset Eligible</h4>
                  <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                    High volume potential detected. Controversy Score:{' '}
                    <span className="font-bold text-green-500">
                      {analysisResult.controversyScore}/100
                    </span>
                    .
                  </p>
                </div>
              </div>

              {/* Fee Section */}
              <div className="bg-muted/20 rounded-2xl p-5 md:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-muted-foreground text-xs font-medium md:text-sm">
                    Minting Fee
                  </span>
                  <span className="font-mono text-base font-bold md:text-lg">1.00 USDT</span>
                </div>
                <div className="bg-border mb-4 h-px w-full"></div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs font-medium md:text-sm">
                    Est. Weekly Revenue
                  </span>
                  <span className="text-xs font-bold text-green-500 md:text-sm">~$340.00</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                className="group relative w-full overflow-hidden rounded-xl px-6 py-3.5 shadow-xl transition-all active:scale-95 md:py-4"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 opacity-90 transition-opacity group-hover:opacity-100"></div>
                <div className="relative flex items-center justify-center gap-2 text-xs font-black tracking-wide text-white uppercase md:text-sm">
                  <Wallet className="h-4 w-4" />
                  <span>Pay 1.00 USDT & Mint</span>
                </div>
              </button>
              <p className="text-muted-foreground text-center text-[10px]">
                Secure transaction powered by Smart Contract.
              </p>
            </div>
          )}

          {/* STEP 4: MINTING (Processing Payment) */}
          {step === 'MINTING' && (
            <div className="space-y-6 py-8 text-center md:space-y-8 md:py-12">
              <div className="relative mx-auto h-24 w-24 md:h-28 md:w-28">
                <div className="border-surfaceHighlight absolute inset-0 rounded-full border-2"></div>
                <div className="absolute inset-0 animate-spin rounded-full border-t-2 border-yellow-500"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10 md:h-20 md:w-20">
                    <Wallet className="h-6 w-6 animate-pulse text-yellow-500 md:h-8 md:w-8" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold md:text-xl">Minting Asset</h3>
                <p className="text-muted-foreground text-xs md:text-sm">
                  Deploying market contract on-chain...
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS */}
          {step === 'SUCCESS' && (
            <div className="animate-in zoom-in-95 relative text-center duration-500">
              {/* Confetti / Glow Effect */}
              <div className="pointer-events-none absolute inset-0 -top-20 bg-gradient-to-b from-yellow-500/10 to-transparent blur-3xl"></div>

              <div className="relative z-10">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-700 shadow-[0_0_30px_rgba(16,185,129,0.4)] md:mb-6 md:h-24 md:w-24">
                  <Rocket className="h-8 w-8 text-white drop-shadow-md md:h-10 md:w-10" />
                </div>

                <h3 className="mb-2 text-2xl font-black md:text-3xl">Market Deployed</h3>
                <p className="text-muted-foreground mb-6 text-xs md:mb-8 md:text-sm">
                  You are now the owner of this market asset.
                </p>

                {/* Ownership Card */}
                <div className="bg-muted/20 mb-6 rounded-xl p-3 shadow-inner md:mb-8 md:p-4">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border">
                      <img
                        src="https://picsum.photos/id/64/100/100"
                        className="h-full w-full rounded-full opacity-90"
                        alt="You"
                      />
                      <div className="absolute -top-1 -right-1 rounded-full bg-yellow-500 p-0.5 text-white shadow-sm">
                        <Crown className="h-2.5 w-2.5" />
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-muted-foreground text-[10px] font-bold uppercase">Role</p>
                      <p className="text-sm font-bold">Market Owner</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-muted-foreground text-[10px] font-bold uppercase">
                        Revenue Share
                      </p>
                      <p className="text-lg font-black text-yellow-600 md:text-xl dark:text-yellow-500">
                        5.0%
                      </p>
                    </div>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                    <div className="h-full w-1/12 bg-green-500"></div>
                  </div>
                  <div className="text-muted-foreground mt-2 flex justify-between font-mono text-[10px]">
                    <span>Status: Live</span>
                    <span>Vol: $0.00</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={reset}
                    className="bg-muted/20 hover:bg-muted/30 rounded-xl py-3 text-xs font-bold transition-colors md:py-3.5 md:text-sm"
                  >
                    View Market
                  </button>
                  <button className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 md:py-3.5 md:text-sm">
                    <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    Shill to Earn
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
