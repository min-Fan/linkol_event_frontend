import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';

import request from '@libs/request/request';
import { IGetCampaignJoinListItem, getPointsTopList, IGetPointsTopListItem } from '@libs/request';

const EndPoint = {
  BANNER: '/kol/api/v3/active/hot/',
  ACTIVES: '/kol/api/v3/index/actives/',
  LEADBOARD: '/kol/api/v1/kols/by/tags/',
  // LEADBOARD: '/kol/api/v3/active/all/voices/',
  TWEET_RECORD: '/kol/api/v3/active/all/tweets/',
};

const PAGE_SIZE = 3;

interface IBanner {
  id: number;
  cover_img: string;
  title: string;
  description: string;
  requirement: string;
  start: string;
  end: string;
  reward_amount: number;
  project: {
    id: number;
    name: string;
    logo: string;
  };
  active_type: {
    id: number;
    zh_name: string;
    en_name: string;
    code: string;
  };
  days_remaining: number;
  a_type: string;
  short_desc: string;
}

export const bannerFetcher = async (url: string): Promise<IBanner | null> => {
  try {
    const res = await request.get(url);

    if (!res.data) {
      throw 'fetch banner error';
    }

    console.log('bannerFetcher', res);

    return res.data;
  } catch (error) {
    console.log(error);

    return null;
  }
};

export function useBanner() {
  const { data, ...rest } = useSWR(EndPoint.BANNER, () => bannerFetcher(EndPoint.BANNER), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });

  return {
    data,
    ...rest,
  };
}

export interface IActive {
  id: number;
  cover_img: string;
  title: string;
  description: string;
  requirement: string;
  start: string;
  end: string;
  reward_amount: number;
  project: {
    id: number;
    name: string;
    logo: string;
  };
  active_type: {
    id: number;
    zh_name: string;
    en_name: string;
    code: string;
  };
  days_remaining: number;
  a_type: string;
  participants: number;
  joins: string[];
  join_count: number;
  /**
   * 代币网络
   */
  chain_type: string;
  /**
   * 代币类型
   */
  token_type: string;
  /**
   * 代币图片
   */
  token_icon: string;
  /**
   * 代币精度
   */
  token_decimals: string;
  /**
   * 是否已经认证
   */
  is_verified: boolean;
}

export interface IActives {
  total: number;
  current_page: number;
  page_range: number[];
  list: IActive[];
}

const activesFetcher = async (url: string): Promise<IActives> => {
  try {
    const res = await request.get(url);

    if (res.code !== 200) {
      throw 'fetch tweets error';
    }

    return res.data;
  } catch (error) {
    throw error;
  }
};

export function useActives(
  type: string,
  page: number,
  search: string = '',
  size: number = PAGE_SIZE,
  is_verify?: number
) {
  const { data, ...rest } = useSWR(
    `${EndPoint.ACTIVES}?data_type=${type}&page=${page}&size=${size}&kw=${search}` +
      (is_verify !== undefined ? `&is_verify=${is_verify}` : ''),
    (url) => activesFetcher(url),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  );

  return {
    data,
    ...rest,
  };
}

// 支持无限滚动的活动列表 hook
export function useActivesInfinite(
  type: string,
  search: string = '',
  size: number = PAGE_SIZE,
  is_verify?: number
) {
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
    size: currentSize,
    setSize,
  } = useSWRInfinite(
    (index) =>
      `${EndPoint.ACTIVES}?data_type=${type}&page=${index + 1}&size=${size}&kw=${search}` +
      (is_verify !== undefined ? `&is_verify=${is_verify}` : ''),
    (url) => activesFetcher(url),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  );

  // 合并所有页面的数据
  const allActives = data ? data.flatMap((page) => page.list) : [];
  const total = data?.[0]?.total || 0;
  const hasMore = allActives.length < total;
  const isLoadingMore =
    isLoading || (currentSize > 0 && data && typeof data[currentSize - 1] === 'undefined');

  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      setSize(currentSize + 1);
    }
  };

  return {
    data: allActives,
    total,
    hasMore,
    isLoadingMore,
    isLoading: isLoading && !data,
    error,
    loadMore,
    mutate,
  };
}

// 使用 getPointsTopList 的返回类型
type ILeadboardRecord = IGetPointsTopListItem;

export const leadboardFetcher = async (): Promise<ILeadboardRecord[]> => {
  try {
    const res = await getPointsTopList();

    if (res.code !== 200) {
      throw 'fetch points top list error';
    }

    return res.data || [];
  } catch (error) {
    console.log(error);
    return [];
  }
};

export function useLeadboard() {
  const { data, ...rest } = useSWR('points-top-list', () => leadboardFetcher(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });

  return {
    data,
    ...rest,
  };
}

export interface ITweet {
  id: number;
  screen_name: string;
  name: string;
  profile_image_url: string;
  tweet_language: string;
  tweet_text: string;
  tweet_created_at: string;
  tweet_medias: string[];
  like_count: number;
  reply_count: number;
  retweet_count: number;
  view_count: number;
  is_verified: boolean;
  is_real_user: boolean;
  join_type: string;
}

export interface ITweetRecord {
  total: number;
  current_page: number;
  page_range: number[];
  list: ITweet[];
}

const tweetRecordFetcher = async (url: string): Promise<ITweetRecord> => {
  try {
    const res = await request.get(url);

    if (res.code !== 200) {
      throw 'fetch tweets error';
    }

    return res.data;
  } catch (error) {
    throw error;
  }
};

export function useTweetRecord(language: string, size: number = PAGE_SIZE) {
  const { data, ...rest } = useSWRInfinite(
    (index) => `${EndPoint.TWEET_RECORD}?page=${index + 1}&size=${size}&language=${language}`,
    (url) => tweetRecordFetcher(url),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  );

  return {
    data,
    ...rest,
  };
}
