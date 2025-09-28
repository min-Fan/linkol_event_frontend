'use client';
import { Base, SOL, SolIcon, TonIcon } from '@assets/svg';
import Image from 'next/image';
import { getChainConfig } from '@constants/config';
import { useState } from 'react';

// SVG组件映射
const svgIconMap = {
  base: Base,
  solana: SOL,
  sol: SolIcon,
  ton: TonIcon,
};

// 图片组件映射
const imgIconMap = {
  // 可以在这里添加更多本地图片类型的链图标
  // 例如: ton: TonIcon,
};

interface ChainIconProps {
  chainType: string;
  className?: string;
  width?: number;
  height?: number;
  fallbackIcon?: React.ReactNode; // 当所有方式都失败时的备用图标
}

export default function ChainIcon({
  chainType,
  className,
  width = 24,
  height = 24,
  fallbackIcon = null,
}: ChainIconProps) {
  const [imageError, setImageError] = useState(false);
  const [configError, setConfigError] = useState(false);

  // 如果配置中没有错误，尝试从配置中获取 iconUrl
  if (!configError && !imageError) {
    try {
      const chainConfig = getChainConfig(chainType as any);
      if (chainConfig?.iconUrl) {
        return (
          <Image
            src={chainConfig.iconUrl}
            alt={chainConfig.name || chainType}
            className={className}
            width={width}
            height={height}
            onError={() => {
              setImageError(true);
            }}
          />
        );
      }
    } catch (error) {
      console.warn('a:', error);
      setConfigError(true);
    }
  }

  // 检查是否为SVG类型
  const normalizedChainType = chainType.toLowerCase();
  if (svgIconMap[normalizedChainType as keyof typeof svgIconMap]) {
    const Icon = svgIconMap[normalizedChainType as keyof typeof svgIconMap];
    return <Icon className={className} />;
  }

  // 检查是否为本地图片类型
  if (imgIconMap[normalizedChainType as keyof typeof imgIconMap]) {
    const imgSrc = imgIconMap[normalizedChainType as keyof typeof imgIconMap];
    return (
      <Image src={imgSrc} alt={chainType} className={className} width={width} height={height} />
    );
  }

  // 如果提供了备用图标，返回备用图标
  if (fallbackIcon) {
    return <>{fallbackIcon}</>;
  }

  // 如果没有找到对应的图标，返回null
  return null;
}
