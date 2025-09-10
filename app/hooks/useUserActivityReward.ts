import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import {
  setUserActivityRewardLoading,
  updateUserActivityReward,
  clearUserActivityReward,
} from '@store/reducers/userSlice';
import { getUserActivityReward } from '@libs/request';

interface UseUserActivityRewardOptions {
  eventId: string;
  enabled?: boolean;
}

export function useUserActivityReward({ eventId, enabled = true }: UseUserActivityRewardOptions) {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((state) => state.userReducer?.isLoggedIn);

  // 从 store 中获取对应 eventId 的数据
  const userActivityRewardState = useAppSelector(
    (state) => state.userReducer?.userActivityRewards?.[eventId]
  );

  const data = userActivityRewardState?.data;
  const isLoading = userActivityRewardState?.isLoading || false;

  // 获取数据的函数
  const fetchUserActivityReward = useCallback(async () => {
    if (!eventId || !isLoggedIn) return;

    try {
      dispatch(setUserActivityRewardLoading({ eventId, isLoading: true }));

      const response = await getUserActivityReward({
        active_id: eventId.toString(),
      });

      if (response?.data) {
        dispatch(
          updateUserActivityReward({
            eventId,
            data: response.data,
          })
        );
      }
    } catch (error) {
      console.error('Failed to fetch user activity reward:', error);
    } finally {
      dispatch(setUserActivityRewardLoading({ eventId, isLoading: false }));
    }
  }, [eventId, isLoggedIn, dispatch]);

  // 手动刷新数据
  const refetch = useCallback(() => {
    return fetchUserActivityReward();
  }, [fetchUserActivityReward]);

  // 清除数据
  const clearData = useCallback(() => {
    dispatch(clearUserActivityReward(eventId));
  }, [dispatch, eventId]);

  // 每次加载页面都获取最新数据
  useEffect(() => {
    if (enabled && eventId && isLoggedIn) {
      fetchUserActivityReward();
    }
  }, [enabled, eventId, isLoggedIn, fetchUserActivityReward]);

  // 当登录状态变化时，清除数据
  useEffect(() => {
    if (!isLoggedIn && data) {
      clearData();
    }
  }, [isLoggedIn, data, clearData]);

  return {
    data,
    isLoading,
    refetch,
    clearData,
    // 提供一些便捷的属性访问
    availableReward: data?.available_reward || 0,
    totalReward: data?.total_reward || 0,
    totalReceiveAmount: data?.total_receive_amount || 0,
    ticketNumber: data?.number || 0,
    rewardPercent: data?.percent || 0,
    failLimit: data?.fail_limit || 0,
    failTimes: data?.fail_times || 0,
    level: data?.level || '',
    mustWinLimit: data?.must_win_limit || 0,
    points: data?.points || 0,
    todayJoin: data?.today_join || 0,
    usedMustWinTimes: data?.used_must_win_times || 0,
    todayJoinAt: data?.today_join_at || '',
  };
}

export default useUserActivityReward;
