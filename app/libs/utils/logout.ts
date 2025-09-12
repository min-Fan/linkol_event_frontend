import { CACHE_KEY } from '@constants/app';
import { store } from '@store/index';
import {
  updateIsLoggedIn,
  clearQuickOrder,
  updateTwitterFullProfile,
  clearSelectedKOLs,
  clearSelectedKOLInfo,
  clearPromotionData,
  clearChatMessages,
  clearAllUserActivityRewards,
  clearRedemptionCode,
} from '@store/reducers/userSlice';

/**
 * 退出登录的工具函数
 * 可以在请求拦截器中调用，不依赖React hooks
 */
export const logout = () => {
  // 清除cookie
  document.cookie = `${CACHE_KEY.TOKEN}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  document.cookie = `${CACHE_KEY.KOL_TOKEN}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

  // 清除localStorage
  localStorage.removeItem(CACHE_KEY.TOKEN);
  localStorage.removeItem(CACHE_KEY.KOL_TOKEN);

  // 清除store中的状态
  store.dispatch(updateIsLoggedIn(false));
  store.dispatch(clearQuickOrder());
  store.dispatch(updateTwitterFullProfile(null));
  store.dispatch(clearSelectedKOLs());
  store.dispatch(clearSelectedKOLInfo());
  store.dispatch(clearPromotionData());
  store.dispatch(clearChatMessages());
  store.dispatch(clearAllUserActivityRewards());
  store.dispatch(clearRedemptionCode());

  // 刷新页面以重置应用状态
  // if (typeof window !== 'undefined') {
  //   window.location.reload();
  // }
};
