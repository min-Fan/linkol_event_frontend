'use client';
import React, { useState } from 'react';
import HowItWork from './HowItWork';
import TradingCard from './TradingCard';

interface TradingPanelProps {
  dateRange: string;
  yesPrice: number;
  noPrice: number;
}

export default function TradingPanel({ dateRange, yesPrice, noPrice }: TradingPanelProps) {
  const [amount, setAmount] = useState(0);
  const [selectedOption, setSelectedOption] = useState<'yes' | 'no'>('yes');

  const quickAmounts = [10, 20, 100];

  const handleQuickAmount = (value: number) => {
    setAmount((prev) => prev + value);
  };

  const handleMax = () => {
    // 实现最大金额逻辑
    setAmount(1000);
  };

  return (
    <div className="space-y-5 sticky top-24">
      <TradingCard
        dateRange={dateRange}
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
        amount={amount}
        setAmount={setAmount}
        yesPrice={yesPrice}
        noPrice={noPrice}
      />

      <HowItWork />
    </div>
  );
}
