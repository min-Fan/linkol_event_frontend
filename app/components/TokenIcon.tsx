import { UsdcIcon, Usdt } from '@assets/svg';
import Usd1 from '@assets/image/token/usd1.png';
import Image from 'next/image';

// SVG组件映射
const svgIconMap = {
  usdc: UsdcIcon,
  usdt: Usdt,
};

// 图片组件映射
const imgIconMap = {
  usd1: Usd1,
  // 可以在这里添加更多图片类型的token
};

interface TokenIconProps {
  type: string;
  className?: string;
  width?: number;
  height?: number;
}

export default function TokenIcon({ type, className, width = 24, height = 24 }: TokenIconProps) {
  // 检查是否为SVG类型
  if (svgIconMap[type.toLowerCase() as keyof typeof svgIconMap]) {
    const Icon = svgIconMap[type.toLowerCase() as keyof typeof svgIconMap];
    return <Icon className={className} />;
  }

  // 检查是否为图片类型
  if (imgIconMap[type.toLowerCase() as keyof typeof imgIconMap]) {
    const imgSrc = imgIconMap[type.toLowerCase() as keyof typeof imgIconMap];
    return <Image src={imgSrc} alt={type} className={className} width={width} height={height} />;
  }

  // 如果没有找到对应的图标，返回null
  return null;
}
