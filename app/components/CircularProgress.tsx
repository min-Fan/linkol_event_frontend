'use client';

import React from 'react';

interface CircularProgressProps {
  percentage: number; // 0-100
  size?: number; // 圆形直径，默认48px
  strokeWidth?: number; // 线条宽度，默认4px
  className?: string;
  children?: React.ReactNode;
}

export default function CircularProgress({
  percentage,
  size = 48,
  strokeWidth = 4,
  className = '',
  children,
}: CircularProgressProps) {
  // 确保百分比在0-100之间
  const normalizedPercentage = Math.max(0, Math.min(100, percentage));

  // 计算圆形参数
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (normalizedPercentage / 100) * circumference;

  // 生成唯一的渐变ID
  const gradientId = `progress-gradient-${Math.random().toString(36).substr(2, 9)}`;

  // 根据百分比计算渐变颜色
  const getGradientColors = () => {
    if (normalizedPercentage === 100) {
      // 100%时使用纯#007AFF
      return {
        start: '#007AFF',
        end: '#007AFF',
      };
    } else {
      // 其他情况使用渐变：从#F2F8FF到#007AFF
      return {
        start: '#F2F8FF',
        end: '#007AFF',
      };
    }
  };

  const { start, end } = getGradientColors();

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* 背景圆圈 */}
      <svg className="absolute top-0 left-0 -rotate-90 transform" width={size} height={size}>
        {/* 定义沿圆弧路径的渐变 */}
        <defs>
          <linearGradient
            id={gradientId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor={start} />
            <stop offset="50%" stopColor={normalizedPercentage === 100 ? end : `#A8D1FF`} />
            <stop offset="100%" stopColor={end} />
          </linearGradient>
        </defs>

        {/* 背景圆环 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#F2F8FF"
          strokeWidth={strokeWidth}
        />

        {/* 进度圆环 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          // strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
      </svg>

      {/* 内容区域 */}
      {children && <div className="relative z-10 flex items-center justify-center">{children}</div>}
    </div>
  );
}
