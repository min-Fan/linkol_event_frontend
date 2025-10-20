'use client';
import { BNB, UsdcIcon, Usdt } from '@assets/svg';
import Usd1 from '@assets/image/token/usd1.png';
import Image from 'next/image';
import { getTokenConfig } from '@constants/config';
import { useState } from 'react';

// SVG组件映射
const svgIconMap = {
  usdc: UsdcIcon,
  usdt: Usdt,
  bnb: BNB,
};

// 图片组件映射
const imgIconMap = {
  usd1: Usd1,
};

interface TokenIconProps {
  type: string;
  chainType?: string;
  tokenType?: string;
  className?: string;
  width?: number;
  height?: number;
}

export default function TokenIcon({
  type,
  chainType,
  tokenType,
  className,
  width = 24,
  height = 24,
}: TokenIconProps) {
  const [imageError, setImageError] = useState(false);

  // 如果提供了 chainType 和 tokenType，尝试从配置中获取 imageUrl
  if (chainType && tokenType && !imageError) {
    try {
      const tokenConfig = getTokenConfig(chainType, tokenType);
      if (tokenConfig.imageUrl) {
        return (
          <Image
            src={tokenConfig.imageUrl}
            alt={tokenConfig.symbol || type}
            className={className}
            width={width}
            height={height}
            quality={100}
            priority={false}
            unoptimized={false}
            onError={() => {
              setImageError(true);
            }}
          />
        );
      }
    } catch (error) {
      console.warn('warring token config:', error);
    }
  }

  // 检查是否为SVG类型
  if (svgIconMap[type.toLowerCase() as keyof typeof svgIconMap]) {
    const Icon = svgIconMap[type.toLowerCase() as keyof typeof svgIconMap];
    return <Icon className={className} />;
  }

  // 检查是否为图片类型
  if (imgIconMap[type.toLowerCase() as keyof typeof imgIconMap]) {
    const imgSrc = imgIconMap[type.toLowerCase() as keyof typeof imgIconMap];
    return (
      <Image
        src={imgSrc}
        alt={type}
        className={className}
        width={width}
        height={height}
        quality={100}
        priority={false}
        unoptimized={false}
      />
    );
  }

  // 如果没有找到对应的图标，返回null
  return null;
}
