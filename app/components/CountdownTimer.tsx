import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
interface CountdownTimerProps {
  startTime: number; // 开始时间戳（毫秒）
  endTime: number; // 结束时间戳（毫秒）
  onEnd?: () => void; // 倒计时结束的回调
  className?: string; // 自定义样式
}

export default function CountdownTimer({
  startTime,
  endTime,
  onEnd,
  className,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const t = useTranslations('common');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();

      // 如果当前时间小于开始时间，倒计时到开始时间
      if (now < startTime) {
        const diff = startTime - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = seconds.toString().padStart(2, '0');

        setTimeLeft(
          days > 0
            ? `${days}${t('days')} ${formattedHours}:${formattedMinutes}:${formattedSeconds}`
            : `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
        );
        return;
      }

      // 如果当前时间大于等于开始时间且小于结束时间，倒计时到结束时间
      if (now >= startTime && now < endTime) {
        const diff = endTime - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = seconds.toString().padStart(2, '0');

        setTimeLeft(
          days > 0
            ? `${days}${t('days')} ${formattedHours}:${formattedMinutes}:${formattedSeconds}`
            : `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
        );
        return;
      }

      // 如果当前时间大于等于结束时间，不显示倒计时
      setTimeLeft('');
      onEnd?.();
    };

    // 立即计算一次
    calculateTimeLeft();

    // 每秒更新一次
    const timer = setInterval(calculateTimeLeft, 1000);

    // 清理定时器
    return () => clearInterval(timer);
  }, [startTime, endTime, onEnd]);

  // 如果没有剩余时间，不显示任何内容
  if (!timeLeft) {
    return null;
  }

  return <span className={className}>{timeLeft}</span>;
}
