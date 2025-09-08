'use client';

import { ORDER_PROGRESS } from '@constants/app';
import { useApp } from '@store/AppProvider';
import { AppEventType } from '@store/reducer';

export default function useOrderProgress() {
  const { state, dispatch } = useApp();
  const { orderProgress } = state;

  const setOrderProgress = (progress: ORDER_PROGRESS) => {
    dispatch({ type: AppEventType.UPDATE_ORDER_PROGRESS, payload: { orderProgress: progress } });
  };

  return { orderProgress, setOrderProgress };
}
