import { useTranslations } from 'next-intl';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';

import {
  AIAnalysis,
  CPM,
  ExpectedExposure,
  InteractionRate,
  Limitation,
  Partners,
  Performance,
  TransmissionRate,
} from '@assets/svg';
import UIDialogRadarChart from '@ui/dialog/RadarChart';
import CompKOLInformation from './KOLInformation';
import { KolRankListItem } from 'app/@types/types';
import { formatNumberKMB, formatPrecision } from '@libs/utils';
import { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import {
  addSelectedKOL,
  removeSelectedKOL,
  updateSelectedKOLInfo,
} from '@store/reducers/userSlice';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getKOLInfo, getKOLListLineChart } from '@libs/request';
import { Badge } from '@shadcn/components/ui/badge';
import { cn } from '@shadcn/lib/utils';
import { ChevronDown, CircleChevronDown, Image } from 'lucide-react';
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from '@shadcn-ui/chart';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';

function formatRadarChartData(radarData: { data: number[]; indicator: Array<{ name: string }> }) {
  if (!radarData || !radarData.data || !radarData.indicator) return undefined;

  return radarData.indicator.map((item, index) => ({
    name: item.name.toLowerCase() === 'nft' ? 'NFT' : item.name,
    value: radarData.data[index] || 0,
  }));
}

function formatAIAnalysisChartData(data: { count: number; price: number }[], price_yuan: number) {
  // 先对数据进行排序
  const sortedData = [...data].sort((a, b) => a.price - b.price);

  // 创建镜像数据（倒序），剔除最大值
  const mirroredData = [...sortedData]
    .slice(0, -1) // 剔除最后一个元素（最大值）
    .reverse()
    .map((item) => ({
      count: item.count,
      price: Number(item.price) - 1 < 0 ? 0 : Number(item.price) - 1,
    }));

  // 合并原始数据和镜像数据
  const combinedData = [...sortedData, ...mirroredData];
  return combinedData.map((item) => ({
    count: item.count,
    value: item.price,
  }));
}

const chartConfig = {
  value: {
    label: 'Price',
    color: 'var(--color-chart-2)',
  },
} satisfies ChartConfig;

export default function KOLDetails(props: { kol: KolRankListItem; isExpanded: boolean }) {
  const { kol, isExpanded } = props;
  const t = useTranslations('common');
  const [lineData, setLineData] = useState<any>();

  const getLineData = useCallback(async () => {
    try {
      const res = await getKOLListLineChart({ kol_id: kol.id.toString() });
      console.log(res);
      if (res.code === 200) {
        setLineData(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  }, [isExpanded]);

  useEffect(() => {
    if (isExpanded) {
      getLineData();
    }
  }, [isExpanded, getLineData]);

  const formattedChartData = useMemo(() => {
    return formatAIAnalysisChartData(lineData?.distribution || [], kol.price_yuan);
  }, [lineData, kol.price_yuan]);

  const dotRenderer = useCallback(
    (props: any) => {
      const { payload } = props;
      if (payload.value === kol.price_yuan) {
        return (
          <circle
            key={payload.value}
            cx={props.cx}
            cy={props.cy}
            r={4}
            fill="var(--color-value)"
            stroke="var(--color-value)"
            strokeWidth={2}
          />
        );
      }

      return <Fragment />;
    },
    [kol.price_yuan]
  );

  return (
    <div className="grid grid-cols-1 gap-2 xl:grid-cols-10">
      <div className="grid grid-cols-3 gap-2 xl:col-span-6">
        <div className="border-border bg-card box-border flex max-h-40 flex-col gap-y-2 rounded-lg border p-3">
          <div className="text-muted-foreground flex items-center gap-x-1 text-sm">
            <Partners className="size-4" />
            <span className="font-medium">{t('partners')}</span>
          </div>
          <div className="item-center flex h-full w-full flex-1">
            <div className="grid w-full grid-cols-4 gap-2">
              {!kol?.projects ||
                (kol?.projects.length === 0 && (
                  <div className="text-muted-foreground col-span-4 flex w-full items-center justify-center text-sm">
                    {t('no_partners')}
                  </div>
                ))}
              {kol?.projects.slice(0, 8).map((project, index) => {
                return (
                  <dl
                    className="flex flex-col items-center justify-center space-y-1 overflow-hidden"
                    key={index}
                  >
                    <dd className="bg-border flex size-6 items-center justify-center overflow-hidden rounded-md">
                      {project.icon && (
                        <img
                          src={project.icon}
                          alt={project.name}
                          className="h-full w-full object-cover"
                        />
                      )}
                      {!project.icon && <Image className="text-muted-foreground size-full" />}
                    </dd>
                    <dt className="text-muted-foreground max-w-full truncate text-left text-xs capitalize">
                      {project.name}
                    </dt>
                  </dl>
                );
              })}
            </div>
          </div>
        </div>
        <div className="border-border bg-card relative box-border flex max-h-40 flex-col gap-y-2 rounded-lg border p-3">
          <div className="text-muted-foreground flex items-center gap-x-1 text-sm">
            <AIAnalysis className="size-4" />
            <span className="font-medium">{t('ai_analysis')}</span>
          </div>
          <div className="text-muted-foreground absolute top-3 right-3 flex flex-col items-end gap-y-1 text-xs">
            <span>No.{lineData?.ranks?.rank || 0}</span>
            <span>Rank: {lineData?.ranks?.percentage || 0}%</span>
          </div>
          <div className="flex h-full w-full flex-1 items-center justify-center overflow-hidden">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <LineChart
                accessibilityLayer
                data={formattedChartData}
                margin={{
                  top: 12,
                  left: 12,
                  right: 12,
                  bottom: 12,
                }}
              >
                <CartesianGrid horizontal={false} vertical={false} />
                {/* <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} /> */}
                <Line
                  dataKey="value"
                  type="natural"
                  stroke="var(--color-value)"
                  strokeWidth={2}
                  dot={dotRenderer}
                  activeDot={false}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </div>
        <div className="border-border bg-card box-border flex max-h-40 flex-col gap-y-2 rounded-lg border p-3">
          <div className="text-muted-foreground flex items-center gap-x-1 text-sm">
            <Performance className="size-4" />
            <span className="font-medium">{t('performance')}</span>
          </div>
          <div className="flex h-full w-full flex-1 items-center justify-center overflow-hidden">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <RadarChart
                data={formatRadarChartData(kol.radar_chart)}
                margin={{
                  top: 10,
                  left: 10,
                  right: 10,
                  bottom: 10,
                }}
              >
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <PolarAngleAxis dataKey="name" />
                <PolarGrid />
                <Radar
                  dataKey="value"
                  fill="var(--color-value)"
                  fillOpacity={0.1}
                  stroke="var(--color-chart-2)"
                  strokeWidth={2}
                  dot={{
                    r: 4,
                    fillOpacity: 1,
                    stroke: 'var(--color-chart-2)',
                    strokeWidth: 1,
                  }}
                />
              </RadarChart>
            </ChartContainer>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 xl:col-span-4 xl:grid-cols-2">
        <div className="border-border bg-card text-muted-foreground flex flex-col justify-between gap-y-2 rounded-lg border p-3">
          <div className="flex items-center gap-x-1 text-sm">
            <InteractionRate className="size-4" />
            <span className="font-medium">{t('interaction_amount')}</span>
          </div>
          <div className="flex items-center justify-end gap-x-1">
            <Limitation className="size-4" />
            <strong className="text-md text-foreground font-bold">
              {kol.interaction_amount < 0.01 ? '<0.01' : kol.interaction_amount}
            </strong>
          </div>
        </div>
        <div className="border-border bg-card text-muted-foreground flex flex-col justify-between gap-y-2 rounded-lg border p-3">
          <div className="flex items-center gap-x-1 text-sm">
            <ExpectedExposure className="size-4" />
            <span className="font-medium">{t('expected_exposure')}</span>
          </div>
          <div className="flex items-center justify-end gap-x-1">
            <Limitation className="size-4" />
            <strong className="text-md text-foreground font-bold">
              {formatNumberKMB(kol.expected_exposure)}/{t('sub')}
            </strong>
          </div>
        </div>
        <div className="border-border bg-card text-muted-foreground flex flex-col justify-between gap-y-2 rounded-lg border p-3">
          <div className="flex items-center gap-x-1 text-sm">
            <TransmissionRate className="size-4" />
            <span className="font-medium">{t('transmission_rate')}</span>
          </div>
          <div className="flex items-center justify-end gap-x-1">
            <Limitation className="size-4" />
            <strong className="text-md text-foreground font-bold">{kol.exposure_rate}%</strong>
          </div>
        </div>
        <div className="border-border bg-card flex flex-col justify-between gap-y-2 rounded-lg border bg-gradient-to-r from-[#88BBF3] to-[#5C99F4] p-3 text-white">
          <div className="flex items-center gap-x-1 text-sm">
            <CPM className="size-4" />
            <span className="font-medium">{t('cpm')}</span>
          </div>
          <div className="flex items-center justify-end gap-x-1">
            <strong className="text-md font-bold">{formatNumberKMB(kol.cpm)}/$</strong>
          </div>
        </div>
      </div>
      {/* {kol.projects && kol.projects.length > 0 ? (
        <>
          <div className="bg-muted-foreground/10 flex h-full flex-wrap content-start gap-3 rounded-2xl p-4">
            {kol?.projects.map((project, index) => (
              <dl className="flex flex-col items-center justify-center space-y-1" key={index}>
                <dd className="bg-border flex size-8 items-center justify-center overflow-hidden rounded-md">
                  {project.icon && <img src={project.icon} alt={project.name} className="h-full w-full object-cover" />}
                  {!project.icon && <Image className="text-muted-foreground size-6" />}
                </dd>
                <dt className="text-xs capitalize">{project.name}</dt>
              </dl>
            ))}
          </div>
          <div className="bg-muted-foreground/10 h-full rounded-lg p-4">
            <dl className="text-muted-foreground mb-2 flex items-baseline space-x-1">
              <dt className="text-foreground text-base font-semibold">{kol.name}</dt>
              <dt className="text-muted-foreground/60 text-xs">@{kol.screen_name}</dt>
            </dl>
            <div className="mx-auto h-[280px] w-full">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <RadarChart data={formatRadarChartData(kol.radar_chart)}>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <PolarAngleAxis dataKey="name" />
                  <PolarGrid />
                  <Radar
                    dataKey="value"
                    fill="var(--color-value)"
                    fillOpacity={0.1}
                    stroke="var(--color-chart-1)"
                    strokeWidth={2}
                    dot={{
                      r: 4,
                      fillOpacity: 1,
                      stroke: 'var(--color-chart-1)',
                      strokeWidth: 1,
                    }}
                  />
                </RadarChart>
              </ChartContainer>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-muted-foreground/10 col-span-2 h-full rounded-lg p-4">
          <dl className="text-muted-foreground mb-2 flex items-baseline space-x-1">
            <dt className="text-foreground text-base font-semibold">{kol.name}</dt>
            <dt className="text-muted-foreground/60 text-xs">@{kol.screen_name}</dt>
          </dl>
          <div className="mx-auto h-[280px] w-full max-w-md">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <RadarChart data={formatRadarChartData(kol.radar_chart)}>
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <PolarAngleAxis dataKey="name" />
                <PolarGrid />
                <Radar
                  dataKey="value"
                  fill="var(--color-value)"
                  fillOpacity={0.1}
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  dot={{
                    r: 4,
                    fillOpacity: 1,
                    stroke: 'var(--color-chart-1)',
                    strokeWidth: 1,
                  }}
                />
              </RadarChart>
            </ChartContainer>
          </div>
        </div>
      )} */}
    </div>
  );
}
