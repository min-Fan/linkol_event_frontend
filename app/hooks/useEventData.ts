import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import {
  getActivityDetail,
  getActivityDetailLogin,
  getActivityFollowers,
  getInvitationCode,
} from '@libs/request';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { setInvitationCodeLoading, updateInvitationCode } from '@store/reducers/userSlice';
import useUserInfo from './useUserInfo';

/**
 * 自定义 hook 用于管理活动详情页面的数据获取和缓存
 * 优化重复请求和组件重新渲染问题
 */
export function useEventData(eventId: string | string[] | undefined) {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((state) => state.userReducer?.isLoggedIn);
  const { isLogin } = useUserInfo();

  // 获取活动详情信息
  const getEventInfo = useCallback(async () => {
    if (!eventId) return null;

    if (isLoggedIn) {
      const res: any = await getActivityDetailLogin(eventId as string);
      if (res.code === 200) {
        return res.data;
      }
    } else {
      const res: any = await getActivityDetail(eventId as string);
      if (res.code === 200) {
        return res.data;
      }
    }
    return null;
  }, [isLoggedIn, eventId]);

  // 获取邀请码
  const fetchInvitationCode = useCallback(async () => {
    if (!eventId || !isLoggedIn) return;

    try {
      dispatch(setInvitationCodeLoading({ eventId: eventId as string, isLoading: true }));
      const response: any = await getInvitationCode({ active_id: eventId as string });

      if (response.code === 200) {
        const code = response.data.invite_code;
        const invitedNum = response.data.invited_num;
        const ticketNum = response.data.ticket_num;

        dispatch(
          updateInvitationCode({
            eventId: eventId as string,
            code,
            invitedNum,
            ticketNum,
          })
        );
      } else {
        console.error('get invitation code failed:', response.msg);
      }
    } catch (error) {
      console.error('get invitation code failed:', error);
    } finally {
      dispatch(setInvitationCodeLoading({ eventId: eventId as string, isLoading: false }));
    }
  }, [eventId, isLoggedIn, dispatch]);

  // 使用 React Query 缓存数据
  const {
    data: eventInfo,
    isLoading: isEventInfoLoading,
    refetch: refetchEventInfo,
    error: eventInfoError,
  } = useQuery({
    queryKey: ['eventInfo', eventId, isLoggedIn, isLogin],
    queryFn: getEventInfo,
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5分钟内数据被认为是新鲜的
    gcTime: 10 * 60 * 1000, // 10分钟后清除缓存
    retry: 2, // 失败时重试2次
  });

  // const {
  //   data: eventInfoCreator,
  //   isLoading: isEventInfoLoadingCreator,
  //   refetch: refetchEventInfoCreator,
  // } = useQuery({
  //   queryKey: ['eventInfoCreator', eventId, isLogin],
  //   queryFn: getEventInfoCreator,
  //   enabled: !!eventId && !!isLogin,
  //   staleTime: 5 * 60 * 1000,
  //   gcTime: 10 * 60 * 1000,
  //   retry: 2,
  // });

  const { data: followers } = useQuery({
    queryKey: ['activityFollowers'],
    queryFn: () => getActivityFollowers(),
    enabled: !!isLoggedIn,
    staleTime: 10 * 60 * 1000, // 10分钟内数据被认为是新鲜的
    gcTime: 30 * 60 * 1000, // 30分钟后清除缓存
  });

  // 刷新所有数据的函数
  const refreshAllData = useCallback(async () => {
    try {
      await Promise.all([refetchEventInfo(), fetchInvitationCode()]);
    } catch (error) {
      console.error('Failed to refresh all data:', error);
    }
  }, [refetchEventInfo, fetchInvitationCode]);

  // 使用 useMemo 优化返回的对象，避免不必要的重新渲染
  const result = useMemo(
    () => ({
      // 数据
      eventInfo,
      followers,

      // 加载状态
      isEventInfoLoading,

      // 错误状态
      eventInfoError,

      // 刷新函数
      refreshAllData,
      refetchEventInfo,
      fetchInvitationCode,
    }),
    [
      eventInfo,
      followers,
      isEventInfoLoading,
      eventInfoError,
      refreshAllData,
      refetchEventInfo,
      fetchInvitationCode,
    ]
  );

  return result;
}
