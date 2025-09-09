'use client';

import React from 'react';
import { Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts';
import { ChartConfig, ChartContainer } from '@shadcn/components/ui/chart';

interface CircularProgressChartProps {
  percentage: number; // 0-100
  size?: number; // 图表大小，默认48px
  strokeWidth?: number; // 线条宽度，默认4px
  className?: string;
  children?: React.ReactNode;
}

export default function CircularProgressChart({
  percentage,
  size = 48,
  strokeWidth = 4,
  className = '',
  children,
}: CircularProgressChartProps) {
  // 确保百分比在0-100之间
  const normalizedPercentage = Math.max(0, Math.min(100, percentage));

  // 计算角度 - 完整圆圈是360度
  const endAngle = (normalizedPercentage / 100) * 360;

  // 计算半径
  const outerRadius = size / 2 - 2;
  const innerRadius = outerRadius - strokeWidth;

  // 生成唯一的渐变ID
  const gradientId = `progress-gradient-${Math.random().toString(36).substr(2, 9)}`;

  const chartData = [
    {
      progress: normalizedPercentage,
      fill: `url(#${gradientId})`,
    },
  ];

  const chartConfig = {
    progress: {
      label: 'Progress',
    },
  } satisfies ChartConfig;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <ChartContainer
        config={chartConfig}
        className="aspect-square"
        style={{ width: size, height: size }}
      >
        <RadialBarChart
          data={chartData}
          startAngle={90}
          endAngle={90 + endAngle}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          width={size}
          height={size}
        >
          <defs>
            <linearGradient
              id={gradientId}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
              gradientUnits="objectBoundingBox"
            >
              {normalizedPercentage === 100 ? (
                <>
                  <stop offset="0%" stopColor="#007AFF" />
                  <stop offset="100%" stopColor="#007AFF" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#F2F8FF" />
                  <stop offset="50%" stopColor="#A8D1FF" />
                  <stop offset="100%" stopColor="#007AFF" />
                </>
              )}
            </linearGradient>
          </defs>
          <PolarGrid
            gridType="circle"
            radialLines={false}
            stroke="none"
            className="first:fill-white last:fill-white"
            polarRadius={[outerRadius, innerRadius]}
          />
          <RadialBar
            dataKey="progress"
            background={{ fill: '#F2F8FF' }}
            cornerRadius={strokeWidth / 2}
            fill={`url(#${gradientId})`}
          />
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
            {children && (
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <foreignObject
                        x={(viewBox.cx || 0) - 20}
                        y={(viewBox.cy || 0) - 10}
                        width="40"
                        height="20"
                      >
                        <div className="flex h-full w-full items-center justify-center">
                          {children}
                        </div>
                      </foreignObject>
                    );
                  }
                }}
              />
            )}
          </PolarRadiusAxis>
        </RadialBarChart>
      </ChartContainer>
    </div>
  );
}
