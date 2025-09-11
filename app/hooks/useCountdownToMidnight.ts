import { useState, useEffect, useMemo } from 'react';

interface CountdownTime {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  formatted: string;
}

export function useCountdownToMidnight(timeString?: string): CountdownTime {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // 计算目标时间：当天的UTC 0点
  const targetTime = useMemo(() => {
    if (!timeString) return null;
    
    try {
      // 解析输入的时间字符串
      const inputDate = new Date(timeString);
      if (isNaN(inputDate.getTime())) return null;
      
      // 获取当天的UTC 0点
      const today = new Date();
      const nextMidnight = new Date(Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate() + 1, // 下一天的0点
        0, 0, 0, 0
      ));
      
      return nextMidnight;
    } catch (error) {
      console.error('Error parsing time string:', error);
      return null;
    }
  }, [timeString]);

  // 计算倒计时
  const countdown = useMemo((): CountdownTime => {
    if (!targetTime) {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSeconds: 0,
        formatted: '00:00:00'
      };
    }

    const now = currentTime.getTime();
    const target = targetTime.getTime();
    const diff = Math.max(0, target - now);

    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return {
      hours,
      minutes,
      seconds,
      totalSeconds,
      formatted
    };
  }, [currentTime, targetTime]);

  // 每秒更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return countdown;
}

export default useCountdownToMidnight;
