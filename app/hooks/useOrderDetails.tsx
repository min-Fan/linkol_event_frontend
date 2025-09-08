'use client';

import useSWR from 'swr';

import { ENDPOINT_URL, getOrderDetail, IOrderDetailParams } from '@libs/request';

const fetcher = async (params: IOrderDetailParams): Promise<any> => {
  try {
    const res = await getOrderDetail(params);

    if (res.code !== 200) {
      throw res.message;
    }

    return res.data;
  } catch (err) {
    throw err;
  }
};

export const useOrderDetails = (params: IOrderDetailParams) => {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    [ENDPOINT_URL.ORDER_DETAIL, params],
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
