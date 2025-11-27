'use client';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowRight, HelpCircle, Info, Share2, TrendingUp } from 'lucide-react';
import { useBetDetail } from '@hooks/useBetDetail';
import { useTranslations } from 'next-intl';
import { PredictionSide } from '../types';
import HowItWork from './HowItWork';
import { Input } from '@shadcn/components/ui/input';

interface OpinionTradingPanelProps {
  onShare?: (side: PredictionSide) => void;
}

export default function OpinionTradingPanel({ onShare }: OpinionTradingPanelProps) {
  const params = useParams();
  const opinionId = params?.opinion as string;
  const { yesPrice, noPrice, betDetail } = useBetDetail(opinionId);
  const t = useTranslations('common');

  const [selectedSide, setSelectedSide] = useState<PredictionSide>(PredictionSide.YES);
  const [amount, setAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const price = selectedSide === PredictionSide.YES ? yesPrice / 100 : noPrice / 100;
  const potentialReturn = amount > 0 ? (amount / price).toFixed(2) : '0.00';
  const returnPercentage = price > 0 ? ((1 / price - 1) * 100).toFixed(0) : '0';

  const handleTrade = () => {
    setIsProcessing(true);
    // TODO: 实现实际的交易逻辑
    setTimeout(() => setIsProcessing(false), 1500);
  };

  return (
    <div className="sticky top-24 space-y-5">
      <div className="border-border bg-card h-fit rounded-2xl border p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-foreground text-lg font-semibold">{t('place_order')}</h3>
          <span className="text-muted-foreground bg-muted flex items-center gap-1 rounded px-2 py-1 text-xs">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>{' '}
            {t('opinion_live')}
          </span>
        </div>

        <div className="bg-muted/20 border-border mb-6 flex rounded-lg border p-1">
          <button
            onClick={() => setSelectedSide(PredictionSide.YES)}
            className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition-all ${
              selectedSide === PredictionSide.YES
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('yes')} ${(yesPrice / 100).toFixed(2)}
          </button>
          <button
            onClick={() => setSelectedSide(PredictionSide.NO)}
            className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition-all ${
              selectedSide === PredictionSide.NO
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('no')} ${(noPrice / 100).toFixed(2)}
          </button>
        </div>

        <div className="mb-6 space-y-4">
          <div>
            <label className="text-muted-foreground mb-2 block text-xs font-medium">
              {t('amount_usdt')}
            </label>
            <div className="border-border bg-muted/50 text-foreground placeholder-muted-foreground has-[:focus]:border-primary has-[:focus]:ring-primary flex w-full flex-col gap-1 rounded-xl border px-4 py-2 transition-colors has-[:focus]:ring-0.5 dark:bg-black/40">
              <Input
                type="number"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="0"
                className="border-none !bg-transparent !text-2xl font-bold focus:outline-none px-0"
              />
              <div className="ml-auto flex gap-1">
                {[10, 50, 100].map((val) => (
                  <button
                    key={val}
                    onClick={() => setAmount(val)}
                    className="bg-card border-border text-muted-foreground hover:bg-muted rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors"
                  >
                    +{val}
                  </button>
                ))}
                <button
                  onClick={() => setAmount(1000)}
                  className="bg-card border-border text-primary hover:bg-muted rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors"
                >
                  {t('max')}
                </button>
              </div>
            </div>
          </div>

          <div className="border-border bg-muted/20 space-y-2 rounded-xl border p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('est_shares')}</span>
              <span className="text-foreground font-mono">{potentialReturn}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('potential_return')}</span>
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
          {isProcessing ? t('opinion_processing') : `${t('buy')} ${selectedSide}`}
        </button>

        {/* Share / Call Out Section */}
        {onShare && (
          <div className="border-border mt-6 border-t pt-6">
            <div className="from-muted to-card border-border rounded-xl border bg-gradient-to-br p-4">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-yellow-500" />
                <span className="text-foreground text-sm font-bold">{t('boost_your_side')}</span>
              </div>
              <p className="text-muted-foreground mb-3 text-xs">{t('share_position_rally')}</p>
              <button
                onClick={() => onShare(selectedSide)}
                className="bg-card border-border hover:bg-muted text-foreground flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-all"
              >
                <Share2 className="h-4 w-4" />
                {t('share_call_out')}
              </button>
            </div>
          </div>
        )}

        <div className="text-muted-foreground mt-4 flex items-start gap-2 text-xs">
          <Info className="mt-0.5 h-3 w-3 flex-shrink-0" />
          <p>{t('positions_locked_info')}</p>
        </div>
      </div>

      {/* <HowItWork /> */}
      {/* Rules / Credibility Section */}
      <div className="border-border bg-card rounded-2xl border p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-2">
          <HelpCircle className="text-muted-foreground h-5 w-5" />
          <h3 className="text-foreground text-lg font-semibold">{t('how_it_works')}</h3>
        </div>
        <div className="text-muted-foreground space-y-4 text-sm">
          <p className="leading-relaxed">
            <strong className="text-foreground mb-1 block">{t('resolution_criteria')}:</strong>
            {t('default_resolution_criteria')}
          </p>
          <ul className="list-disc space-y-2 pl-4">
            <li>{t('how_it_works_step_1')}</li>
            <li>{t('how_it_works_step_2')}</li>
            <li>{t('how_it_works_step_3')}</li>
            <li>{t('how_it_works_step_4')}</li>
            <li>{t('how_it_works_step_5')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
