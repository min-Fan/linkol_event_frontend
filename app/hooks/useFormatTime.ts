import { useFormatter, useNow } from 'next-intl';

export function useFormatTime(timestamp: number): string {
  const format = useFormatter();
  const now = useNow();
  let time = '';

  if (timestamp > -1) {
    const dateTime = new Date(timestamp);

    if (now.getTime() - timestamp < 24 * 60 * 60 * 1000) {
      time = format.relativeTime(dateTime, now);
    } else {
      time = format.dateTime(dateTime, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      });
    }
  }

  return time;
}
