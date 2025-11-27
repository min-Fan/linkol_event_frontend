'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import {
  getBetDetail,
  getBetChart,
  getBetProspective,
  getBetTopVoice,
  getBetComments,
  getBetActivity,
  IGetBetDetailResponseData,
} from '@libs/request';

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

  // 获取图表数据
  const {
    data: betChartResponse,
    isLoading: isChartLoading,
    refetch: refetchChart,
  } = useQuery({
    queryKey: ['betChart', betId],
    queryFn: async () => {
      if (!betId) return null;
      const response = await getBetChart({ bet_id: betId as string });
      return response;
    },
    enabled: !!betId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });

  const chartData = betChartResponse?.data;

  // 获取 prospective 数据
  const {
    data: betProspectiveResponse,
    isLoading: isProspectiveLoading,
    refetch: refetchProspective,
  } = useQuery({
    queryKey: ['betProspective', betId],
    queryFn: async () => {
      if (!betId) return null;
      const response = await getBetProspective({ bet_id: betId as string });
      return response;
    },
    enabled: !!betId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });

  const prospectiveData = betProspectiveResponse?.data;

  // 获取 top voice 数据
  const {
    data: betTopVoiceResponse,
    isLoading: isTopVoiceLoading,
    refetch: refetchTopVoice,
  } = useQuery({
    queryKey: ['betTopVoice', betId],
    queryFn: async () => {
      if (!betId) return null;
      const response = await getBetTopVoice({ bet_id: betId as string });
      return response;
    },
    enabled: !!betId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });

  const topVoiceData = betTopVoiceResponse?.data;

  // 获取评论总数（获取第一页数据以获取总数）
  const { data: betCommentsTotalResponse, isLoading: isCommentsTotalLoading } = useQuery({
    queryKey: ['betCommentsTotal', betId],
    queryFn: async () => {
      if (!betId) return null;
      const response = await getBetComments({
        bet_id: betId as string,
        page: 1,
        size: 1, // 只需要获取总数，所以只获取1条
      });
      return response;
    },
    enabled: !!betId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });

  const commentsTotal = betCommentsTotalResponse?.data?.total || 0;

  // 转换 top voice 数据格式
  const transformedTopVoiceData = useMemo(() => {
    if (!topVoiceData?.list) return { yesHolders: [], noHolders: [] };

    const yesHolders: Array<{
      id: string;
      name: string;
      avatar?: string;
      shares: number;
      brandVoice: number;
    }> = [];
    const noHolders: Array<{
      id: string;
      name: string;
      avatar?: string;
      shares: number;
      brandVoice: number;
    }> = [];

    topVoiceData.list.forEach((item, index) => {
      if (item.yes && item.yes.length > 0) {
        item.yes.forEach((user, userIndex) => {
          yesHolders.push({
            id: `yes-${index}-${userIndex}`,
            name: user.name,
            avatar: user.icon,
            shares: user.amount,
            brandVoice: user.brand_value,
          });
        });
      }
      if (item.no && item.no.length > 0) {
        item.no.forEach((user, userIndex) => {
          noHolders.push({
            id: `no-${index}-${userIndex}`,
            name: user.name,
            avatar: user.icon,
            shares: user.amount,
            brandVoice: user.brand_value,
          });
        });
      }
    });

    return { yesHolders, noHolders };
  }, [topVoiceData]);

  // 获取评论数据（支持分页）
  const fetchComments = useCallback(
    async (page: number = 1, pageSize: number = 20) => {
      if (!betId) {
        return {
          list: [],
          total: 0,
          current_page: 1,
          total_pages: 0,
        };
      }
      try {
        const response = await getBetComments({
          bet_id: betId as string,
          page,
          size: pageSize,
        });

        if (response?.data) {
          // 转换数据格式
          const transformedList = response.data.list.map((item, index) => ({
            id: `comment-${page}-${index}`,
            name: item.name,
            screen_name: item.screen_name,
            profile_image_url: item.icon,
            is_verified: false, // API 没有提供
            comment_text: item.content,
            created_at: item.tweet_update_time || item.created_at || '',
            like_count: item.favorite_count,
            retweet_count: 0, // API 没有提供
            reply_count: item.reply_count,
            position: item.amount > 0 ? item.amount : undefined,
            position_type: item.amount > 0 ? 'yes' : ('no' as 'yes' | 'no'),
            link: item.link,
            views: item.views,
          }));

          return {
            list: transformedList,
            total: response.data.total,
            current_page: response.data.current_page,
            total_pages: response.data.total_pages,
          };
        }
        return {
          list: [],
          total: 0,
          current_page: 1,
          total_pages: 0,
        };
      } catch (error) {
        console.error('Failed to fetch comments:', error);
        return {
          list: [],
          total: 0,
          current_page: 1,
          total_pages: 0,
        };
      }
    },
    [betId]
  );

  // 获取活动数据（支持分页）
  const fetchActivity = useCallback(
    async (page: number = 1, pageSize: number = 20) => {
      if (!betId) {
        return {
          list: [],
          total: 0,
          current_page: 1,
          total_pages: 0,
        };
      }
      try {
        const response = await getBetActivity({
          bet_id: betId as string,
          page,
          size: pageSize,
        });

        if (response?.data) {
          // 转换数据格式
          const transformedList = response.data.list.map((item, index) => ({
            id: `activity-${page}-${index}`,
            user_name: item.name,
            profile_image_url: item.icon,
            action: (item.attitude === 'Yes' ? 'bought' : 'sold') as 'bought' | 'sold',
            quantity: item.amount,
            position_type: item.attitude.toLowerCase() as 'yes' | 'no',
            condition: '', // API 没有提供，留空
            price: 0, // API 没有提供价格
            total_value: item.total_brand_value,
            created_at: item.created_at || '', // 使用 API 提供的创建时间
            link_url: item.tx_hash_link, // 使用 API 提供的交易哈希链接
          }));

          return {
            list: transformedList,
            total: response.data.total,
            current_page: response.data.current_page,
            total_pages: response.data.total_pages,
          };
        }
        return {
          list: [],
          total: 0,
          current_page: 1,
          total_pages: 0,
        };
      } catch (error) {
        console.error('Failed to fetch activity:', error);
        return {
          list: [],
          total: 0,
          current_page: 1,
          total_pages: 0,
        };
      }
    },
    [betId]
  );

  // 转换图表数据格式以匹配组件需求
  const transformedChartData = useMemo(() => {
    if (!chartData) return null;

    return chartData.map((item) => ({
      date: item.date,
      yes: item.yes[0] * 100, // 提取数值并转换为百分比
      no: item.no[0] * 100, // 提取数值并转换为百分比
      yesUsers:
        item.yes[1]?.icons?.map((iconItem) => ({
          avatar: iconItem.icon,
          name: iconItem.kol_user_name || '',
          address: '', // API 没有提供地址，留空
        })) || [],
      noUsers:
        item.no[1]?.icons?.map((iconItem) => ({
          avatar: iconItem.icon,
          name: iconItem.kol_user_name || '',
          address: '', // API 没有提供地址，留空
        })) || [],
    }));
  }, [chartData]);

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
    chainId: betDetail?.attitude?.chain_id,
    tokenAddress: betDetail?.attitude?.token_address,
    // 图表数据
    chartData: transformedChartData,
    isChartLoading,
    refreshChart: refetchChart,
    // Prospective 数据
    prospectiveData,
    isProspectiveLoading,
    refreshProspective: refetchProspective,
    // Top Voice 数据
    topVoiceData: transformedTopVoiceData,
    isTopVoiceLoading,
    refreshTopVoice: refetchTopVoice,
    // 评论数据
    fetchComments,
    commentsTotal,
    isCommentsTotalLoading,
    // 活动数据
    fetchActivity,
  };
}
