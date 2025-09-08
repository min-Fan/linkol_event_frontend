'use client';

import useSWR from 'swr';

import { ENDPOINT_URL, getVerifyTweet } from '@libs/request';

const fetcher = async (): Promise<any> => {
  try {
    const res = await getVerifyTweet();

    if (res.code !== 200) {
      throw res.message;
    }

    return res.data;
  } catch (err) {
    throw err;
  }
};

export const useVerifyTweet = () => {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    [ENDPOINT_URL.KOL_GET_VERIFY_TWEET],
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    data,
    isLoading,
    isValidating,
    error,
    mutate,
  };
};
