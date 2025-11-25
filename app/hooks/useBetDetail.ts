'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getBetDetail, IGetBetDetailResponseData } from '@libs/request';

/**
 * 自定义 hook 用于管理 bet 详情页面的数据获取和缓存
 * 提供计算好的数据，方便多个组件使用
 */
export function useBetDetail(betId: string | string[] | undefined) {
  const queryClient = useQueryClient();

  // 获取 bet 详情数据
  const {
    data: betDetailResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['betDetail', betId],
    queryFn: async () => {
      if (!betId) return null;
      const response = await getBetDetail({ bet_id: betId as string });
      return response;
    },
    enabled: !!betId,
    staleTime: 5 * 60 * 1000, // 5分钟内数据被认为是新鲜的
    gcTime: 10 * 60 * 1000, // 10分钟后清除缓存
    retry: 2, // 失败时重试2次
  });

  const betDetail = betDetailResponse?.data;

  // 计算投票百分比和价格
  const computedData = useMemo(() => {
    if (!betDetail) {
      return {
        totalVotes: 0,
        yesPercentage: 0,
        noPercentage: 0,
        yesPrice: 50,
        noPrice: 50,
      };
    }

    const totalVotes = betDetail.yes_brand_value + betDetail.no_brand_value;
    const yesPercentage = totalVotes > 0 ? (betDetail.yes_brand_value / totalVotes) * 100 : 0;
    const noPercentage = totalVotes > 0 ? (betDetail.no_brand_value / totalVotes) * 100 : 0;
    
    // 价格基于百分比计算
    const yesPrice = yesPercentage;
    const noPrice = noPercentage;

    return {
      totalVotes,
      yesPercentage,
      noPercentage,
      yesPrice,
      noPrice,
    };
  }, [betDetail]);

  // 刷新数据的方法
  const refreshBetDetail = async () => {
    return await refetch();
  };

  // 使缓存失效并重新获取数据
  const invalidateBetDetail = async () => {
    await queryClient.invalidateQueries({ queryKey: ['betDetail', betId] });
  };

  // 手动更新缓存数据（用于乐观更新）
  const updateBetDetail = (
    updater: (oldData: IGetBetDetailResponseData | undefined) => IGetBetDetailResponseData
  ) => {
    queryClient.setQueryData(['betDetail', betId], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        data: updater(old.data),
      };
    });
  };

  return {
    // 原始数据
    betDetail,
    // 计算后的数据
    ...computedData,
    // 状态
    isLoading,
    isError,
    error,
    // 操作方法
    refreshBetDetail,
    invalidateBetDetail,
    updateBetDetail,
    // 便捷的字段访问
    topic: betDetail?.topic,
    attitude: betDetail?.attitude,
    commission: betDetail?.commission || 0,
    yesBrandValue: betDetail?.yes_brand_value || 0,
    noBrandValue: betDetail?.no_brand_value || 0,
    tweetUrl: betDetail?.attitude?.tweet_url,
    tokenAddress: betDetail?.attitude?.token_address,
  };
}

