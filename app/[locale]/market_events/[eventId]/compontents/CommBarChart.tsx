'use client';

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@shadcn/components/ui/chart';
import { Skeleton } from '@shadcn/components/ui/skeleton';
import { getBrandValueLineChart, IEventInfoResponseData } from '@libs/request';
import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@store/hooks';
import { useMemo } from 'react';
import { NullData } from '@assets/svg';
import { useTranslations } from 'next-intl';

const chartConfig = {
  brandValue: {
    label: 'Brand Value',
    color: 'hsl(var(--brand-value))',
  },
} satisfies ChartConfig;

// 柱状图骨架屏组件
const BarChartSkeleton = () => {
  return (
    <div className="h-full w-full p-4">
      <div className="flex h-full w-full flex-col gap-2">
        {/* 模拟柱状图的多个柱子 */}
        <div className="flex h-full items-end justify-center gap-2">
          <div className="flex h-full flex-1 flex-col items-center justify-end">
            <Skeleton className="mb-1 h-3/4 w-4" />
          </div>
          <div className="flex h-full flex-1 flex-col items-center justify-end">
            <Skeleton className="mb-1 h-1/2 w-4" />
          </div>
          <div className="flex h-full flex-1 flex-col items-center justify-end">
            <Skeleton className="mb-1 h-5/6 w-4" />
          </div>
          <div className="flex h-full flex-1 flex-col items-center justify-end">
            <Skeleton className="mb-1 h-2/3 w-4" />
          </div>
          <div className="flex h-full flex-1 flex-col items-center justify-end">
            <Skeleton className="mb-1 h-4/5 w-4" />
          </div>
          <div className="flex h-full flex-1 flex-col items-center justify-end">
            <Skeleton className="mb-1 h-1/3 w-4" />
          </div>
          <div className="flex h-full flex-1 flex-col items-center justify-end">
            <Skeleton className="mb-1 h-3/5 w-4" />
          </div>
          <div className="flex h-full flex-1 flex-col items-center justify-end">
            <Skeleton className="mb-1 h-full w-4" />
          </div>
          <div className="flex h-full flex-1 flex-col items-center justify-end">
            <Skeleton className="mb-1 h-5/6 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export function CommBarChart({
  eventInfo,
  isLoading,
}: {
  eventInfo: IEventInfoResponseData;
  isLoading: boolean;
}) {
  const t = useTranslations('common');
  const isLoggedIn = useAppSelector((state) => state.userReducer?.isLoggedIn);
  const { data: brandValueBarChart, isLoading: isBrandValueBarChartLoading } = useQuery({
    queryKey: ['brandValueBarChart', eventInfo?.id, isLoggedIn],
    queryFn: () => getBrandValueLineChart(eventInfo?.id),
    enabled: !!eventInfo?.id && isLoggedIn,
  });

  // 处理图表数据，将 API 返回的数据转换为图表需要的格式
  const chartData = useMemo(() => {
    if (!brandValueBarChart?.data) return [];

    return brandValueBarChart.data.map((item: { day: string; value: number }) => ({
      month: item.day,
      brandValue: item.value,
    }));
  }, [brandValueBarChart]);

  // 如果正在加载或没有数据，显示空状态
  if (isBrandValueBarChartLoading) {
    return (
      <ChartContainer config={chartConfig} className="h-full w-full">
        <BarChartSkeleton />
      </ChartContainer>
    );
  }

  if (!chartData.length) {
    return (
      <ChartContainer config={chartConfig} className="h-full w-full">
        <div className="text-muted-foreground flex h-full w-full flex-col items-center justify-center">
          <NullData className="h-14 w-14" />
          <p className="text-md">{t('brand_value_will_show_after_this_event')}</p>
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <BarChart accessibilityLayer data={chartData} className="h-full w-full">
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="brandValue" fill="var(--color-brand-value)" radius={10} barSize={15} />
      </BarChart>
    </ChartContainer>
  );
}
