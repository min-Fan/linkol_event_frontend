/* The provided code is a TypeScript React component that renders a line chart using the Recharts
library. Here is a breakdown of what the code does: */
'use client';

import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@shadcn/components/ui/chart';

const chartData = [
  { day: '7D', value: 186 },
  { day: '6D', value: 186 },
  { day: '5D', value: 186 },
  { day: '4D', value: 200 },
  { day: '6D', value: 237 },
  { day: '2D', value: 290 },
  { day: '1D', value: 350 },
  { day: 'Today', value: 400 },
];

const chartConfig = {
  value: {
    label: '',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

// 格式化日期显示
const formatDate = (dateString: string) => {
  if (!dateString) return '';

  // 如果是日期格式 (YYYY-MM-DD)
  if (dateString.includes('-')) {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  // 如果是其他格式，直接返回
  return dateString;
};

export function CommLineChart({ data }: { data: any[] }) {
  // 确保数据存在且有效
  const chartData = data && data.length > 0 ? data : [];

  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <AreaChart
        className="h-full w-full"
        accessibilityLayer
        data={chartData.map((item) => ({
          day: item.day,
          value: item.value,
        }))}
        margin={{
          top: 20,
          left: 20,
          right: 20,
          bottom: 20, // 增加底部边距确保x轴标签完全显示
        }}
      >
        <defs>
          <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.5} />
            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tickMargin={12}
          tickFormatter={formatDate}
          interval="preserveStartEnd" // 自动计算间隔，确保标签不重叠
          minTickGap={20} // 增加标签之间的最小间距
          textAnchor="end" // 文本锚点调整
          // angle={-45} // 倾斜标签角度，减少重叠
          // height={60} // 增加X轴高度以容纳倾斜的标签
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Area
          dataKey="value"
          type="monotone"
          fill="url(#fillValue)"
          stroke="var(--color-primary)"
          strokeWidth={3}
          dot={{
            fill: 'var(--color-primary)',
            strokeWidth: 2,
            r: 2,
          }}
          activeDot={{
            r: 6,
            fill: 'var(--color-primary)',
          }}
        />
      </AreaChart>
    </ChartContainer>
  );
}
