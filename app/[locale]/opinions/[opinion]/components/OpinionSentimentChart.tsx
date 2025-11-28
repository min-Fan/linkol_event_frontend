'use client';
import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useBetDetail } from '@hooks/useBetDetail';
import { useTranslations } from 'next-intl';
import { PredictionSide } from '../types';
import defaultAvatar from '@assets/image/avatar.png';

export default function OpinionSentimentChart() {
  const params = useParams();
  const opinionId = params?.opinion as string;
  const { chartData } = useBetDetail(opinionId);
  const t = useTranslations('common');

  // 转换图表数据格式
  const transformedChartData = useMemo(() => {
    if (!chartData) return [];
    return chartData.map((item) => ({
      time: item.date,
      price: item.yes / 100, // 转换为 0-1 范围
      kols: [
        ...(item.yesUsers?.map((user) => ({
          user: {
            id: user.address || '',
            name: user.name || '',
            handle: '',
            avatar: user.avatar,
            verified: false,
          },
          side: PredictionSide.YES,
          action: 'YES',
        })) || []),
        ...(item.noUsers?.map((user) => ({
          user: {
            id: user.address || '',
            name: user.name || '',
            handle: '',
            avatar: user.avatar,
            verified: false,
          },
          side: PredictionSide.NO,
          action: 'NO',
        })) || []),
      ],
    }));
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      // 计算YES和NO的数量
      const yesCount = data.kols?.filter((k: any) => k.side === PredictionSide.YES).length || 0;
      const noCount = data.kols?.filter((k: any) => k.side === PredictionSide.NO).length || 0;

      return (
        <div className="border-border bg-card/95 pointer-events-auto min-w-[220px] rounded-xl border p-3 shadow-xl backdrop-blur-md">
          <p className="text-muted-foreground mb-2 text-xs font-medium">{label}</p>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-foreground text-sm">{t('probability')}</span>
            <span className="text-primary text-lg font-bold">{(data.price * 100).toFixed(0)}%</span>
          </div>

          {data.kols && data.kols.length > 0 && (
            <div className="border-border mt-2 border-t pt-2">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                  {t('key_activity')}
                </p>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="font-medium text-green-500">
                    {t('yes')}: {yesCount}
                  </span>
                  <span className="text-muted-foreground">|</span>
                  <span className="font-medium text-red-500">
                    {t('no')}: {noCount}
                  </span>
                </div>
              </div>
              <div className="custom-scrollbar max-h-48 space-y-2.5 overflow-y-auto pr-1">
                {data.kols.map((k: any, i: number) => {
                  // 如果没有 name，使用默认文本或地址缩写
                  return (
                    <div
                      key={i}
                      className="animate-in fade-in slide-in-from-bottom-1 flex items-start gap-2.5 duration-300"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <img
                        src={k.user.avatar}
                        className="border-border mt-0.5 h-6 w-6 flex-shrink-0 rounded-full border object-cover"
                        alt={k.user.name || ''}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = defaultAvatar.src;
                        }}
                      />
                      <div className="flex min-w-0 flex-1 flex-col justify-center leading-tight">
                        {k.user.name && (
                          <span className="text-foreground truncate text-xs font-bold">
                            {k.user.name}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-medium ${k.side === PredictionSide.YES ? 'text-green-500' : 'text-red-500'}`}
                        >
                          {k.action === 'YES' ? t('yes') : t('no')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  if (!transformedChartData || transformedChartData.length === 0) {
    return (
      <div className="text-muted-foreground flex h-[300px] items-center justify-center">
        {t('no_chart_data')}
      </div>
    );
  }

  return (
    <div className="mt-4 h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={transformedChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#71717a"
            strokeOpacity={0.2}
            vertical={false}
          />
          <XAxis dataKey="time" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#71717a"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: '#71717a', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.5 }}
            allowEscapeViewBox={{ x: false, y: false }}
            animationDuration={0}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#3b82f6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorPrice)"
            activeDot={{ r: 6, strokeWidth: 0, fill: '#60a5fa' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
