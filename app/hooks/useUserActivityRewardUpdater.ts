import { useCallback } from 'react';
import { useAppDispatch } from '@store/hooks';
import { updateUserActivityReward, setUserActivityRewardLoading } from '@store/reducers/userSlice';
import { getUserActivityReward } from '@libs/request';

/**
 * 提供全局更新用户活动奖励数据的功能
 * 可以在任何组件中使用，无需关心具体的 eventId
 */
export function useUserActivityRewardUpdater() {
  const dispatch = useAppDispatch();

  // 更新特定 eventId 的用户活动奖励数据
  const updateRewardData = useCallback(
    async (eventId: string) => {
      if (!eventId) return;

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
        console.error('Failed to update user activity reward:', error);
      } finally {
        dispatch(setUserActivityRewardLoading({ eventId, isLoading: false }));
      }
    },
    [dispatch]
  );

  // 批量更新多个 eventId 的数据
  const updateMultipleRewardData = useCallback(
    async (eventIds: string[]) => {
      const promises = eventIds.map((eventId) => updateRewardData(eventId));
      await Promise.all(promises);
    },
    [updateRewardData]
  );

  // 手动设置某个 eventId 的奖励数据（用于本地更新）
  const setRewardData = useCallback(
    (
      eventId: string,
      data: {
        available_reward: number;
        total_reward: number;
        total_receive_amount: number;
        number: number;
        percent: number;
        fail_limit: number;
        fail_times: number;
        level: string;
        must_win_limit: number;
        points: number;
        today_join: number;
        used_must_win_times: number;
        today_join_at: string;
      }
    ) => {
      dispatch(updateUserActivityReward({ eventId, data }));
    },
    [dispatch]
  );

  return {
    updateRewardData,
    updateMultipleRewardData,
    setRewardData,
  };
}

export default useUserActivityRewardUpdater;
