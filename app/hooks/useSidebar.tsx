'use client';

import { useApp } from '@store/AppProvider';
import { AppEventType } from '@store/reducer';

export default function useSidebar() {
  const { state, dispatch } = useApp();
  const { isToggleSidebar } = state;

  const toggleSidebar = () => {
    dispatch({ type: AppEventType.TOGGLE_SIDEBAR, payload: { isToggleSidebar: !isToggleSidebar } });
  };

  return { isToggleSidebar, toggleSidebar };
}
