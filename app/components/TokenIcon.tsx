import { UsdcIcon, Usdt } from '@assets/svg';

const iconMap = {
  usdc: UsdcIcon,
  usdt: Usdt,
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
