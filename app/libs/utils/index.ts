export const formatPrecision = (input: string | number, precision: number = 8): string => {
  // 确保输入是一个数字
  const value = typeof input === 'string' ? parseFloat(input) : input;

  // 如果输入无法解析为有效数字，直接返回 '0'
  if (isNaN(value)) return '0';

  // 判断数值小于指定精度的情况
  const factor = Math.pow(10, precision);
  if (Math.abs(value) < 1 / factor) return '0';

  // 保留精度并去掉尾随零
  // 使用精度控制，先去掉科学计数法
  let formattedValue = value.toFixed(precision).replace(/(\.0+|0+)$/, '');

  // 去掉不必要的零
  if (formattedValue.includes('.')) {
    formattedValue = formattedValue.replace(/0+$/, '').replace(/\.$/, '');
  }
  return formattedValue;
};

export const formatNumberKMB = (value: string | number, precision: number = 8): string => {
  if (Number(value) >= 1e9) {
    // 十亿及以上：使用 B
    return (Number(value) / 1e9).toFixed(2) + 'B';
  } else if (Number(value) >= 1e6) {
    // 百万及以上：使用 M
    return (Number(value) / 1e6).toFixed(2) + 'M';
  } else if (Number(value) >= 1e3) {
    // 千及以上：使用 K
    return (Number(value) / 1e3).toFixed(2) + 'K';
  } else {
    // 千以下：保留原数值
    return formatPrecision(Number(value).toString(), precision);
  }
};

/**
 * Formats a date into "Joined Month Year" format.
 * Example: "Joined January 2025"
 * @param date - The date object, date string, or timestamp to format.
 * @returns The formatted date string or an empty string if the date is invalid.
 */
export function formatJoinedDate(date: Date | string | number): string {
  try {
    const dateObj = new Date(date);

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date provided to formatJoinedDate:', date);
      return ''; // Or return a default string like "Joined Unknown"
    }

    const month = dateObj.toLocaleString('en-US', { month: 'long' }); // Get full month name (e.g., "January")
    const year = dateObj.getFullYear(); // Get the full year (e.g., 2025)

    return `in ${month} ${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return ''; // Return empty string on error
  }
}

export const formatCurrency = (value: number, precision: number = 0): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: precision,
  });

  return formatter.format(value);
};

export function formatDateYMDHMS(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 格式化相对时间
 * @param input - 日期字符串、Date 对象或时间戳
 * @param short - 是否使用简化格式（默认 false，完整格式：22 seconds ago；true 时简化格式：22s ago）
 * @returns 格式化后的相对时间字符串
 */
export function formatTimeAgo(input: number | string | Date, short: boolean = false): string {
  const date = new Date(input).getTime();
  const now = Date.now();
  const diff = Math.floor((now - date) / 1000); // 单位：秒

  if (diff < 60) {
    return short ? `${diff}s ago` : `${diff} second${diff !== 1 ? 's' : ''} ago`;
  }

  const minutes = Math.floor(diff / 60);
  if (diff < 3600) {
    return short ? `${minutes}m ago` : `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }

  const hours = Math.floor(diff / 3600);
  if (diff < 86400) {
    return short ? `${hours}h ago` : `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }

  const days = Math.floor(diff / 86400);
  if (diff < 2592000) {
    return short ? `${days}d ago` : `${days} day${days !== 1 ? 's' : ''} ago`;
  }

  const months = Math.floor(diff / 2592000);
  if (diff < 31536000) {
    return short ? `${months}mo ago` : `${months} month${months !== 1 ? 's' : ''} ago`;
  }

  const years = Math.floor(diff / 31536000);
  return short ? `${years}y ago` : `${years} year${years !== 1 ? 's' : ''} ago`;
}

/**
 * 格式化相对时间（简化版：22s ago, 1h ago, 2h ago）
 * @param input - 日期字符串、Date 对象或时间戳
 * @returns 格式化后的相对时间字符串
 */
export function formatTimeAgoShort(input: number | string | Date): string {
  return formatTimeAgo(input, true);
}

export function formatMoney(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  } else if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  } else {
    return `$${value.toFixed(2)}`;
  }
}

export function getDateRangeWithValues(
  range: 0 | 1 | 2 | 4
): { zh: string; en: string; value: number }[] {
  const labels: { zh: string; en: string; value: number }[] = [];
  const now = new Date();
  const enMonths = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const addDays = (days: number) => {
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const m = date.getMonth() + 1;
      const d = date.getDate();
      labels.push({
        zh: `${String(m).padStart(2, '0')}月${String(d).padStart(2, '0')}日`,
        en: `${enMonths[m - 1]} ${String(d).padStart(2, '0')}`,
        value: 0,
      });
    }
  };

  const addMonths = (count: number, withYear = false) => {
    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const m = date.getMonth(); // 0-based
      labels.push({
        zh: withYear
          ? `${year}年${String(m + 1).padStart(2, '0')}月`
          : `${String(m + 1).padStart(2, '0')}月`,
        en: withYear ? `${enMonths[m]} ${year}` : `${enMonths[m]}`,
        value: 0,
      });
    }
  };

  switch (range) {
    case 0: // 近7天
      addDays(7);
      break;
    case 1: // 近1月
      addDays(30);
      break;
    case 2: // 近3月
      addMonths(3);
      break;
    case 4: // 近1年
      addMonths(12, true);
      break;
  }

  return labels;
}

export const copy = async (text: string | undefined): Promise<boolean> => {
  try {
    if (text == undefined) return false;

    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    return false;
  }
};

// 格式化地址显示：前4位 + ... + 后4位
export const formatAddress = (address: string = '', pre = 4, suf = 4): string => {
  if (!address) return '';
  if (address.length < 8) return address;

  const prefix = address.slice(0, pre);
  const suffix = address.slice(-suf);
  return `${prefix}...${suffix}`;
};

// 导出域名工具函数
export { getCurrentDomain, getCurrentUrl, getCurrentProtocol } from './domain';
