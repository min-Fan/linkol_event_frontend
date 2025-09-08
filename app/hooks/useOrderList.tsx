'use client';

import useSWR from 'swr';

import {
  ENDPOINT_URL,
  getOrderList,
  IOrderListParams,
  IOrderListResponseData,
} from '@libs/request';

const fetcher = async (params: IOrderListParams): Promise<IOrderListResponseData> => {
  try {
    const res = await getOrderList(params);

    if (res.code !== 200) {
      throw res.message;
    }

    return res.data;
  } catch (err) {
    throw err;
  }
};

export const useOrderList = (params: IOrderListParams) => {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    [ENDPOINT_URL.ORDER_LIST, params],
    ([_, params]) => fetcher(params),
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
