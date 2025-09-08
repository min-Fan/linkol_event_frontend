'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { Card, CardContent } from '@shadcn-ui/card';
import { Input } from '@shadcn-ui/input';
import { useAppSelector } from '@store/hooks';

interface RewardAmountProps {
  onAmountChange?: (amount: string) => void;
  resetTrigger?: number; // 添加重置触发器
  value?: string; // 初始值
}

export default function RewardAmount({ onAmountChange, resetTrigger, value }: RewardAmountProps) {
  const t = useTranslations('common');
  const [amount, setAmount] = useState(value || '');
  const payTokenInfo = useAppSelector((state) => state.userReducer?.pay_token_info);

  // 监听重置触发器和初始值
  useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger > 0) {
      setAmount('');
    }
  }, [resetTrigger]);

  useEffect(() => {
    if (value !== undefined) {
      setAmount(value);
    }
  }, [value]);

  // 安全的数值处理函数
  const formatNumber = (value: string): string => {
    const num = parseFloat(value);
    if (isNaN(num)) return '';
    return num.toFixed(2);
  };

  const handleNumberInput = (value: string): boolean => {
    // 允许输入数字和小数点，最多两位小数
    return value === '' || /^\d*\.?\d{0,2}$/.test(value);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (handleNumberInput(inputValue)) {
      setAmount(inputValue);
      onAmountChange?.(inputValue);
    }
  };

  const handleAmountBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const formatted = formatNumber(e.target.value);
    if (formatted !== e.target.value && formatted !== '') {
      setAmount(formatted);
      onAmountChange?.(formatted);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xl font-semibold">
        {t('post_campaign_reward_amount')}
        <span className="ml-1 text-red-500">*</span>
      </h3>
      <div className="flex items-center gap-x-6">
        <Card className="border-border w-full max-w-64 overflow-hidden rounded-3xl border p-0 shadow-[0px_7.51px_11.27px_0px_#0000000D]">
          <CardContent className="p-0">
            <Input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={handleAmountChange}
              onBlur={handleAmountBlur}
              className="!h-auto border-none px-6 py-3 !text-base !leading-9 placeholder:text-base placeholder:leading-9"
              placeholder="0.00"
            />
          </CardContent>
        </Card>
        <span className="text-xl font-medium">{payTokenInfo?.symbol}</span>
      </div>
      <p className="text-muted-foreground text-base font-medium">
        {t('post_campaign_total_campaign_payout', {
          amount: amount ? `${amount} ${payTokenInfo?.symbol}` : `0 ${payTokenInfo?.symbol}`,
        })}
      </p>
    </div>
  );
}
