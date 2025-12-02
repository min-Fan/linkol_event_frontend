'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getBetList, IGetBetListResponseData } from '@libs/request';

/**
 * 自定义 hook 用于管理 bet 列表的数据获取和缓存
 * 提供刷新方法，方便在创建新市场后更新列表
 */
export function useBetList() {
  const queryClient = useQueryClient();

  // 获取 bet 列表数据
  const {
    data: betListResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<{ data: IGetBetListResponseData }>({
    queryKey: ['betList'],
    queryFn: async () => {
      const response = await getBetList();
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5分钟内数据被认为是新鲜的
    gcTime: 10 * 60 * 1000, // 10分钟后清除缓存
    retry: 2, // 失败时重试2次
  });

  // 刷新数据的方法
  const refreshBetList = async () => {
    return await refetch();
  };

  // 使缓存失效并重新获取数据
  const invalidateBetList = async () => {
    await queryClient.invalidateQueries({ queryKey: ['betList'] });
  };

  // 手动更新缓存数据（用于乐观更新）
  const updateBetList = (
    updater: (oldData: { data: IGetBetListResponseData } | undefined) => {
      data: IGetBetListResponseData;
    }
  ) => {
    queryClient.setQueryData(['betList'], updater);
  };

  return {
    betList: betListResponse?.data,
    isLoading,
    isError,
    error,
    refreshBetList,
    invalidateBetList,
    updateBetList,
    // 便捷的字段访问
    list: betListResponse?.data?.list || [],
    total: betListResponse?.data?.total || 0,
    currentPage: betListResponse?.data?.current_page || 1,
  };
}

