'use client';
import React, { useState } from 'react';
import { Button } from '@shadcn/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { Input } from '@shadcn/components/ui/input';

interface TradingCardProps {
  dateRange: string;
  selectedOption: 'yes' | 'no';
  setSelectedOption: (option: 'yes' | 'no') => void;
  amount: number;
  setAmount: (amount: number) => void;
  yesPrice: number;
  noPrice: number;
}
export default function TradingCard({
  dateRange,
  selectedOption,
  setSelectedOption,
  amount,
  setAmount,
  yesPrice,
  noPrice,
}: TradingCardProps) {
  const quickAmounts = [10, 20, 100];
  const tabs = ['Buy', 'Sell'];
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');

  const handleTabChange = (index: number) => {
    setTradeType(index === 0 ? 'buy' : 'sell');
  };

  const handleQuickAmount = (value: number) => {
    // 确保是数字相加
    setAmount(Number(amount) + Number(value));
  };

  const handleMax = () => {
    // 实现最大金额逻辑
    setAmount(1000);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // 只允许数字
    setAmount(value === '' ? 0 : Number(value));
  };

  return (
    <div className="border-border space-y-4 rounded-3xl border px-4 py-5">
      {/* 日期范围 */}
      <div className="text-base font-bold">{dateRange}</div>

      {/* Buy/Sell 切换 */}
      <div className="border-border flex gap-2 border-b">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              onClick={() => handleTabChange(index)}
              className={`text-md px-4 py-2 transition-colors ${
                (index === 0 && tradeType === 'buy') || (index === 1 && tradeType === 'sell')
                  ? 'border-primary text-foreground border-b-2 font-bold'
                  : 'text-muted-foreground/60 hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {/* Market 下拉 */}
        <div className="ml-auto flex items-center justify-end gap-2">
          <span className="text-md font-bold">Market</span>
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>

      {/* Yes/No 选项 */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setSelectedOption('yes')}
          className={`flex items-center justify-center gap-1 rounded-lg py-4 text-center transition-all ${
            selectedOption === 'yes'
              ? 'bg-green-500/10'
              : 'bg-muted-foreground/10 hover:bg-muted-foreground/20'
          }`}
        >
          <div
            className={`text-md transition-colors ${selectedOption === 'yes' ? 'text-green-400' : 'text-muted-foreground'}`}
          >
            Yes
          </div>
          <div
            className={`text-md transition-colors ${selectedOption === 'yes' ? 'text-green-400' : 'text-muted-foreground'}`}
          >
            ${yesPrice.toFixed(1)}
          </div>
        </button>
        <button
          onClick={() => setSelectedOption('no')}
          className={`flex items-center justify-center gap-1 rounded-lg py-4 text-center transition-all ${
            selectedOption === 'no'
              ? 'bg-red-500/10'
              : 'bg-muted-foreground/10 hover:bg-muted-foreground/20'
          }`}
        >
          <div
            className={`text-md transition-colors ${selectedOption === 'no' ? 'text-red-400' : 'text-muted-foreground'}`}
          >
            No
          </div>
          <div
            className={`text-md transition-colors ${selectedOption === 'no' ? 'text-red-400' : 'text-muted-foreground'}`}
          >
            ${noPrice.toFixed(1)}
          </div>
        </button>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xl font-medium">Amount</span>
          <div className="flex min-w-0 items-center justify-between">
            <Input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              className="w-auto border-none bg-transparent text-right !text-3xl font-bold outline-none focus:ring-0 dark:bg-transparent"
              placeholder="$0"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {quickAmounts.map((value) => (
            <Button
              key={value}
              variant="outline"
              onClick={() => handleQuickAmount(value)}
              className="border-border flex-1"
            >
              +{value}
            </Button>
          ))}
          <Button variant="outline" onClick={handleMax} className="border-border px-6">
            Max
          </Button>
        </div>
      </div>

      {/* Trade Button */}
      <Button
        className={`w-full rounded-lg py-6 text-lg font-semibold text-white transition-all ${
          tradeType === 'buy' ? 'bg-primary hover:bg-primary/90' : 'bg-red-500 hover:bg-red-600'
        }`}
      >
        Trade
      </Button>
    </div>
  );
}
