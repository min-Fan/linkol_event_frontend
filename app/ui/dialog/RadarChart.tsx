'use client';

import { ReactNode } from 'react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@shadcn-ui/dialog';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@shadcn-ui/chart';

// 默认数据，当无 radarData 时使用
const defaultChartData = [
  { name: 'DeFi', value: 186 },
  { name: 'NFT', value: 305 },
  { name: 'Meme', value: 237 },
  { name: 'Gaming', value: 273 },
  { name: 'Social', value: 209 },
];

const chartConfig = {
  value: {
    label: 'Value',
    color: 'var(--color-chart-1)',
  },
} satisfies ChartConfig;

export default function UIDialogRadarChart(props: {
  name: string;
  account: string;
  children: ReactNode;
  radarData?: Array<{ name: string; value: number }>;
}) {
  const { name, account, children, radarData } = props;

  // 使用传入的 radarData 或默认数据
  const chartData = radarData || defaultChartData;

  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="border-border">
        <DialogHeader className="sr-only">
          <DialogTitle>Radar Chart</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account and remove your
            data from our servers.
          </DialogDescription>
        </DialogHeader>
        <dl className="text-muted-foreground flex items-baseline space-x-1">
          <dt className="text-lg font-semibold">{name}</dt>
          <dd>@{account}</dd>
        </dl>
        <div className="mx-auto aspect-square w-full max-w-96">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <RadarChart data={chartData}>
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <PolarAngleAxis dataKey="name" />
              <PolarGrid />
              <Radar
                dataKey="value"
                fill="var(--color-value)"
                fillOpacity={0.6}
                dot={{
                  r: 4,
                  fillOpacity: 1,
                }}
              />
            </RadarChart>
          </ChartContainer>
        </div>
      </DialogContent>
    </Dialog>
  );
}
