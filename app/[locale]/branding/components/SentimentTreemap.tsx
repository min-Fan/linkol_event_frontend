import React, { useMemo } from 'react';
import { Treemap, ResponsiveContainer } from 'recharts';
import { cn } from '@shadcn/lib/utils';

type DataItem = {
  name: string;
  amount: number;
  icon: string;
};

type TreemapProps = {
  data: DataItem[];
  type: 'good' | 'bad';
  // 添加可选的配置参数
  transformType?: 'sqrt' | 'log' | 'none';
  minDisplayValue?: number;
  // 自定义背景色
  backgroundColor?: string;
  backgroundGradient?: string;
  // 控制方正性的参数
  aspectRatio?: number; // 期望的宽高比
  squareness?: number; // 方正程度 0-1，1最方正
};

const CustomContent = (props: any) => {
  const {
    x,
    y,
    width,
    height,
    icon,
    name,
    amount,
    type,
    originalAmount,
    backgroundColor,
    backgroundGradient,
  } = props;
  if (name == undefined) return null;

  return (
    <foreignObject
      x={x + 1}
      y={y + 1}
      width={width - 2}
      height={height - 2}
      className="text-base-white relative"
    >
      <div className="relative flex h-full w-full cursor-pointer items-center gap-2 overflow-hidden transition-transform duration-200 hover:scale-[0.97] hover:opacity-90">
        <img
          src={icon.replace('_normal', '')}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover opacity-80 contrast-100 saturate-100"
          draggable={false}
        />
        <div
          className={cn(
            'absolute inset-0',
            backgroundGradient ||
              (type == 'bad'
                ? 'bg-gradient-to-br from-red-500/60 to-red-500/30'
                : 'bg-gradient-to-br from-green-400/60 to-green-400/30 to-50%')
          )}
          style={backgroundColor ? { backgroundColor } : undefined}
        ></div>
        <div className="absolute inset-0 flex flex-col justify-start p-0.5 font-bold text-white drop-shadow-lg sm:p-1 sm:pl-2">
          <p className="truncate text-sm sm:text-lg">{name}</p>
          {/* 显示原始数值，而不是变换后的数值 */}
          <p className="mt-0 text-xs sm:mt-1 sm:text-sm">
            {/* {amount && amount < 0 ? '-' : '+'} */}
            {(originalAmount || amount).toLocaleString()}
          </p>
        </div>
      </div>
    </foreignObject>
  );
};

export default function SentimentTreemap({
  data,
  type,
  transformType = 'sqrt',
  minDisplayValue = 0,
  backgroundColor,
  backgroundGradient,
  aspectRatio = 1,
  squareness = 0.7,
}: TreemapProps) {
  // 数据预处理，减少极值差异并确保方正显示
  const processedData = useMemo(() => {
    if (!data.length) return data;

    // 计算基础统计信息
    const amounts = data.map((item) => item.amount);
    const minAmount = Math.min(...amounts);
    const maxAmount = Math.max(...amounts);

    // 如果数据差异不大，直接返回原数据
    if (maxAmount / minAmount <= 5) {
      return data.map((item) => ({
        ...item,
        originalAmount: item.amount,
      }));
    }

    return data
      .map((item) => {
        let transformedAmount = item.amount;

        switch (transformType) {
          case 'sqrt':
            // 平方根变换，温和地压缩差异
            transformedAmount = Math.sqrt(item.amount);
            break;
          case 'log':
            // 对数变换，更强地压缩差异
            transformedAmount = Math.log10(Math.max(item.amount, 1));
            break;
          case 'none':
          default:
            transformedAmount = item.amount;
            break;
        }

        // 确保最小显示值，避免过小的区块
        const baseMinValue = Math.sqrt(maxAmount) * 0.15;
        const squarenessMinValue = Math.sqrt(maxAmount) * squareness * 0.25;
        const minValue = Math.max(minDisplayValue, baseMinValue, squarenessMinValue);
        transformedAmount = Math.max(transformedAmount, minValue);

        return {
          ...item,
          amount: transformedAmount,
          originalAmount: item.amount, // 保存原始值用于显示
        };
      })
      .map((item, index, array) => {
        // 进一步平滑处理，减少极端差异
        const sortedAmounts = array.map((i) => i.amount).sort((a, b) => b - a);
        const median = sortedAmounts[Math.floor(sortedAmounts.length / 2)];
        const q1 = sortedAmounts[Math.floor(sortedAmounts.length * 0.25)];
        const q3 = sortedAmounts[Math.floor(sortedAmounts.length * 0.75)];

        // 使用分位数来限制极值
        let smoothedAmount = item.amount;
        if (item.amount < q1 * 0.3) {
          smoothedAmount = Math.max(item.amount, q1 * 0.3);
        }
        if (item.amount > q3 * 2) {
          smoothedAmount = Math.min(item.amount, q3 * 2);
        }

        // 应用方正性系数
        const squarenessFactor = 1 - squareness * 0.5;
        const balancedAmount = smoothedAmount * squarenessFactor + median * squareness * 0.5;

        return {
          ...item,
          amount: balancedAmount,
        };
      });
  }, [data, transformType, minDisplayValue, squareness]);

  return (
    <div className="h-full w-full">
      <ResponsiveContainer>
        <Treemap
          data={processedData}
          dataKey="amount"
          stroke="var(--primary)"
          content={
            <CustomContent
              type={type}
              backgroundColor={backgroundColor}
              backgroundGradient={backgroundGradient}
            />
          }
          isAnimationActive={false}
        />
      </ResponsiveContainer>
    </div>
  );
}
