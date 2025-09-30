export interface AuthSourceData {
  type: 'telegram' | 'web';
  timestamp: string;
  isTelegram: boolean;
  userAgent: string;
  authId?: string;
}

export const getAuthSource = (): AuthSourceData | null => {
  try {
    const sourceData = localStorage.getItem('twitter_auth_source');
    if (sourceData) {
      return JSON.parse(sourceData);
    }
    return null;
  } catch (error) {
    console.error('Failed to parse auth source data:', error);
    return null;
  }
};

export const isFromTelegram = (): boolean => {
  const source = getAuthSource();
  return source?.type === 'telegram' || source?.isTelegram === true;
};

export const isFromWeb = (): boolean => {
  const source = getAuthSource();
  return source?.type === 'web' || source?.isTelegram === false;
};

export const getAuthSourceType = (): 'telegram' | 'web' | 'unknown' => {
  const source = getAuthSource();
  if (!source) {
    // 回退到简单的localStorage检查
    const urlType = localStorage.getItem('twitter_auth_url_type');
    return urlType === 'telegram' ? 'telegram' : urlType === 'web' ? 'web' : 'unknown';
  }
  return source.type;
};

export const clearAuthSource = (): void => {
  localStorage.removeItem('twitter_auth_source');
  localStorage.removeItem('twitter_auth_url_type');
  localStorage.removeItem('twitter_auth_timestamp');
};

export const isAuthSourceValid = (maxAgeMinutes: number = 30): boolean => {
  const source = getAuthSource();
  if (!source) return false;

  const now = Date.now();
  const authTime = parseInt(source.timestamp);
  const maxAge = maxAgeMinutes * 60 * 1000; // 转换为毫秒

  return now - authTime <= maxAge;
};

// 从URL参数获取授权信息
export const getAuthSourceFromUrl = (searchParams: URLSearchParams): AuthSourceData | null => {
  try {
    const authSource = searchParams.get('auth_source');
    const authTimestamp = searchParams.get('auth_timestamp');
    const authId = searchParams.get('auth_id');

    if (!authSource || !authTimestamp) {
      return null;
    }

    return {
      type: authSource as 'telegram' | 'web',
      timestamp: authTimestamp,
      isTelegram: authSource === 'telegram',
      userAgent: navigator.userAgent,
      authId: authId || undefined,
    };
  } catch (error) {
    console.error('Failed to parse auth source from URL:', error);
    return null;
  }
};

// 混合获取授权来源（优先URL参数，回退到localStorage）
export const getAuthSourceHybrid = (searchParams?: URLSearchParams): AuthSourceData | null => {
  // 如果有URL参数，优先使用
  if (searchParams) {
    const urlSource = getAuthSourceFromUrl(searchParams);
    if (urlSource) {
      console.log('Using auth source from URL params');
      return urlSource;
    }
  }

  // 回退到localStorage
  console.log('Falling back to localStorage for auth source');
  return getAuthSource();
};

// 混合获取授权来源类型
export const getAuthSourceTypeHybrid = (
  searchParams?: URLSearchParams
): 'telegram' | 'web' | 'unknown' => {
  const source = getAuthSourceHybrid(searchParams);
  return source?.type || 'unknown';
};

// 混合检查是否来自Telegram
export const isFromTelegramHybrid = (searchParams?: URLSearchParams): boolean => {
  const source = getAuthSourceHybrid(searchParams);
  return source?.isTelegram || false;
};
