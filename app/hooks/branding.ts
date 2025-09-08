import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';

import request from '@libs/request/request';

const EndPoint = {
  LINKOL_CAMPAIGNS: '/kol/api/v2/banding/linkol/campaigns',
  MARKET_EVENTS: '/kol/api/v2/banding/market/events',
  SENTIMENT_GOOD: '/kol/api/v2/banding/sentiment/good',
  SENTIMENT_BAD: '/kol/api/v2/banding/sentiment/bad',
  VALUE_RANKING: '/kol/api/v2/banding/value/ranking',
};

export interface IBrandingLinkolCampaign {
  name: string;
  screen_name: string;
  icons: string[];
  uniqueKols: number;
  band_value: number;
}

export interface IBrandingLinkolCampaigns {
  data: IBrandingLinkolCampaign[];
  page: number;
  page_size: number;
  total: number;
}

export interface IBrandingMarketEventsRecord {
  name: string;
  abstract: string;
  volume: number;
  volumeType: number;
  value_curve: number[];
  description: string;
  timestamp: number;
  icons: string[];
}

export interface IBrandingMarketEvents {
  data: IBrandingMarketEventsRecord[];
  page: number;
  page_size: number;
  total: number;
}

export interface IBrandingSentimentRecord {
  name: string;
  icon: string;
  amount: number;
}

export interface IBrandingSentiment {
  data: IBrandingSentimentRecord[];
  page: number;
  page_size: number;
  total: number;
}

export interface IBrandingValueRankingRecord {
  project_name: string;
  brand_value: number;
  volume_24h: number;
  sentiment: number;
  market_cap: number;
  price: number;
  last_7_day: number[];
  icon: string;
}

export interface IBrandingValueRanking {
  data: IBrandingValueRankingRecord[];
  page: number;
  page_size: number;
  total: number;
}

export const brandingLinkolCampaignsFetcher = async (
  url: string,
  page: number,
  pageSize: number
): Promise<IBrandingLinkolCampaigns | null> => {
  try {
    const res = await request.get(url, { page, page_size: pageSize });

    if (res.code !== 200) {
      throw 'fetch branding linkol campaigns error';
    }

    return res.data as IBrandingLinkolCampaigns;
  } catch (error) {
    console.log(error);

    return null;
  }
};

export const useBrandingLinkolCampaigns = (page: number, pageSize: number) => {
  const { data, ...rest } = useSWR(
    [EndPoint.LINKOL_CAMPAIGNS, page, pageSize],
    ([url, page, pageSize]) => brandingLinkolCampaignsFetcher(url, page, pageSize),
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
};

const brandingMarketEventsFetcher = async (
  url: string,
  page: number,
  pageSize: number,
  type: number
): Promise<IBrandingMarketEvents | null> => {
  try {
    const res = await request.get(url, { page, page_size: pageSize, type });

    if (res.code !== 200) {
      throw 'fetch branding market events error';
    }

    return res.data as any;
  } catch (error) {
    console.log(error);

    return null;
  }
};

export const useBrandingMarketEvents = (page: number, page_size: number, type: number) => {
  const { data, ...rest } = useSWR(
    [EndPoint.MARKET_EVENTS, page, page_size, type],
    ([url, page, page_size, type]) => brandingMarketEventsFetcher(url, page, page_size, type),
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
};

const brandingSentimentFetcher = async (
  url: string,
  page: number,
  pageSize: number,
  type: number
): Promise<IBrandingSentiment | null> => {
  try {
    const res = await request.get(url, { page, page_size: pageSize, type });

    if (res.code !== 200) {
      throw 'fetch branding sentiment error';
    }

    return res.data as any;
  } catch (error) {
    console.log(error);

    return null;
  }
};

export const useBrandingGoodSentiment = (page: number, page_size: number, type: number) => {
  const { data, ...rest } = useSWR(
    [EndPoint.SENTIMENT_GOOD, page, page_size, type],
    ([url, page, page_size, type]) => brandingSentimentFetcher(url, page, page_size, type),
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
};

export const useBrandingBadSentiment = (page: number, page_size: number, type: number) => {
  const { data, ...rest } = useSWR(
    [EndPoint.SENTIMENT_BAD, page, page_size, type],
    ([url, page, page_size, type]) => brandingSentimentFetcher(url, page, page_size, type),
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
};

export const brandingValueRankingFetcher = async (
  url: string,
  page: number,
  pageSize: number,
  type: number
): Promise<IBrandingValueRanking | null> => {
  try {
    const res = await request.get(url, { page, page_size: pageSize, type });

    if (res.code !== 200) {
      throw 'fetch branding value ranking error';
    }

    return res.data as any;
  } catch (error) {
    console.log(error);

    return null;
  }
};

export const useBrandValueRanking = (page: number, page_size: number, type: number) => {
  const { data, ...rest } = useSWR(
    [EndPoint.VALUE_RANKING, page, page_size, type],
    ([url, page, page_size, type]) => brandingValueRankingFetcher(url, page, page_size, type),
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
};
