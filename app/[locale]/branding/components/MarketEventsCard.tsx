'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { CartesianGrid, Line, LineChart } from 'recharts';
import clsx from 'clsx';

import { ChartContainer, ChartConfig } from '@shadcn-ui/chart';

import { Down, Up } from '@assets/svg';
import { formatTimeAgo } from '@libs/utils';
import { IBrandingMarketEventsRecord } from '@hooks/branding';

const chartConfig = {
  value: {
    label: 'Price',
    color: 'var(--color-chart-2)',
  },
} satisfies ChartConfig;

export default function MarketEventsCard(props: { data: IBrandingMarketEventsRecord }) {
  const { data } = props;
  const { name, abstract, value_curve, description, timestamp, icons } = data;
  const t = useTranslations('common');

  const { diff, diffType } = useMemo(() => {
    let diff = 0;
    let diffType = 0;

    if (value_curve && value_curve.length > 0) {
      diff = value_curve[0] - value_curve[value_curve.length - 1]; // 负数 涨 正数 跌
      diffType = diff < 0 ? 1 : 2; //   跌  |  涨
    }

    return { diff: Number(diff.toFixed(2)), diffType };
  }, [value_curve]);

  return (
    <div className="bg-background box-border h-full w-full space-y-4 rounded-2xl px-3 py-6">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-x-3">
          <div className="size-12 overflow-hidden rounded-full">
            <img src={icons[0]} alt="avatar" className="size-full rounded-full" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xl font-bold">{name}</p>
            <p className="text-muted-foreground line-clamp-2 text-base">{abstract}</p>
          </div>
        </div>
        <div className="flex flex-shrink-0 flex-row items-end gap-1">
          <div className="text-right">
            {diffType !== 0 && (
              <div className="flex items-center justify-end gap-0.5">
                {diffType == 1 ? (
                  <Up className="size-2 text-[#01D07E]" />
                ) : (
                  <Down className="size-2" />
                )}

                <span
                  className={clsx('text-md', diffType == 1 ? 'text-[#01D07E]' : 'text-[#EF1F1F]')}
                >
                  {diffType == 1 ? '+' + Math.abs(diff) : '-' + Math.abs(diff)}
                  (24h)
                </span>
              </div>
            )}
            <div className="text-muted-foreground text-md">{t('brand_value')}</div>
          </div>
          <ChartContainer config={chartConfig} className="size-8">
            <LineChart
              accessibilityLayer
              data={value_curve.map((v) => {
                return { value: v };
              })}
            >
              <CartesianGrid horizontal={false} vertical={false} />
              <Line
                dataKey="value"
                type="monotone"
                stroke="var(--color-value)"
                strokeWidth={4}
                dot={false}
                activeDot={false}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </div>

      <div className="text-muted-foreground text-md line-clamp-3">{description}</div>
      <div className="flex items-center justify-between">
        <div className="ml-3.5 flex">
          {icons &&
            icons.map((url, iconsIndex) => {
              return (
                <div
                  className="border-background -ml-3.5 size-7 rounded-full border"
                  key={iconsIndex}
                >
                  <img src={url} alt="avatar" className="size-full rounded-full" />
                </div>
              );
            })}
        </div>
        <span className="text-muted-foreground text-md">{formatTimeAgo(timestamp * 1000)}</span>
      </div>
    </div>
  );
}
