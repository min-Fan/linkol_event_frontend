import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import {
  setUserActivityRewardLoading,
  updateUserActivityReward,
  clearUserActivityReward,
} from '@store/reducers/userSlice';
import { getUserActivityReward } from '@libs/request';

// 全局请求状态跟踪，避免重复请求
const requestStatus = new Map<string, boolean>();

interface UseUserActivityRewardOptions {
  eventId: string;
  enabled?: boolean;
}

export function useUserActivityReward({ eventId, enabled = true }: UseUserActivityRewardOptions) {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((state) => state.userReducer?.isLoggedIn);
  const hasRequestedRef = useRef(false);

  // 从 store 中获取对应 eventId 的数据
  const userActivityRewardState = useAppSelector(
    (state) => state.userReducer?.userActivityRewards?.[eventId]
  );

  const data = userActivityRewardState?.data;
  const isLoading = userActivityRewardState?.isLoading || false;

  // 获取数据的函数
  const fetchUserActivityReward = useCallback(async () => {
    if (!eventId || !isLoggedIn) return;

    const requestKey = `${eventId}-${isLoggedIn}`;

    // 如果已经有请求在进行中，直接返回
    if (requestStatus.get(requestKey)) {
      return;
    }

    try {
      // 标记请求状态
      requestStatus.set(requestKey, true);
      hasRequestedRef.current = true;

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
      // 清除请求状态
      requestStatus.delete(requestKey);
    }
  }, [eventId, isLoggedIn, dispatch]);

  // 手动刷新数据
  const refetch = useCallback(() => {
    // 清除请求状态，允许重新请求
    const requestKey = `${eventId}-${isLoggedIn}`;
    requestStatus.delete(requestKey);
    hasRequestedRef.current = false;
    return fetchUserActivityReward();
  }, [eventId, isLoggedIn, fetchUserActivityReward]);

  // 清除数据
  const clearData = useCallback(() => {
    dispatch(clearUserActivityReward(eventId));
    // 清除请求状态
    const requestKey = `${eventId}-${isLoggedIn}`;
    requestStatus.delete(requestKey);
    hasRequestedRef.current = false;
  }, [dispatch, eventId, isLoggedIn]);

  // 页面加载时只请求一次
  useEffect(() => {
    if (enabled && eventId && isLoggedIn && !hasRequestedRef.current) {
      fetchUserActivityReward();
    }
  }, [enabled, eventId, isLoggedIn, fetchUserActivityReward]);

  // 当登录状态变化时，清除数据
  useEffect(() => {
    if (!isLoggedIn && data) {
      clearData();
    }
  }, [isLoggedIn, data, clearData]);

  // 当 eventId 变化时，重置请求状态
  useEffect(() => {
    hasRequestedRef.current = false;
  }, [eventId]);

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
    isVerifiedFollow: data?.is_verified_follow || false,
    hasWithdrawn: data?.has_withdrawn || false,
  };
}

export default useUserActivityReward;
