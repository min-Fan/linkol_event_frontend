'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAgentDetails, IGetAgentDetailsData } from '@libs/request';
import { useAppSelector } from '@store/hooks';

export function useAgentDetails() {
  const isLoggedIn = useAppSelector((state) => state.userReducer?.isLoggedIn);
  const queryClient = useQueryClient();

  const {
    data: agentDetails,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['agentDetails'],
    queryFn: getAgentDetails,
    enabled: isLoggedIn,
    staleTime: 5 * 60 * 1000, // 5分钟内数据不会重新获取
  });

  // 刷新数据的方法
  const refreshAgentDetails = async () => {
    return await refetch();
  };

  // 使缓存失效并重新获取数据
  const invalidateAgentDetails = async () => {
    await queryClient.invalidateQueries({ queryKey: ['agentDetails'] });
  };

  // 手动更新缓存数据（用于乐观更新）
  const updateAgentDetails = (
    updater: (oldData: IGetAgentDetailsData | undefined) => IGetAgentDetailsData
  ) => {
    queryClient.setQueryData(['agentDetails'], updater);
  };

  return {
    agentDetails: agentDetails?.data,
    isLoading,
    isError,
    error,
    refreshAgentDetails,
    invalidateAgentDetails,
    updateAgentDetails,
    // 便捷的字段访问
    totalReward: agentDetails?.data?.total_reward || 0,
    points: agentDetails?.data?.point || 0,
    rank: agentDetails?.data?.rank || 0,
    inviteCode: agentDetails?.data?.invite_code || '',
    isAllAutoPlay: agentDetails?.data?.is_all_auto || false,
  };
}
