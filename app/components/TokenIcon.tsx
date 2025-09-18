import { UsdcIcon, Usdt } from '@assets/svg';
import Usd1 from '@assets/image/token/usd1.png';

const iconMap = {
  usdc: UsdcIcon,
  usdt: Usdt,
  usd1: Usd1,
};

interface TokenIconProps {
  type: string;
  className?: string;
}

export default function TokenIcon({ type, className }: TokenIconProps) {
  const Icon = iconMap[type as keyof typeof iconMap];
  if (!Icon) return null;
  return <Icon className={className} />;
}
