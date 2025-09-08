import { ORDER_PROGRESS } from '@constants/app';

import { IAppState, IAppAction } from './types';

export const initialAppState: IAppState = {
  orderProgress: ORDER_PROGRESS.KOL_SQUARE,
  isToggleSidebar: true,
  isLogin: false,
  userId: '',
  username: '',
  email: '',
};

export const AppEventType = {
  UPDATE_ORDER_PROGRESS: 'UPDATE_ORDER_PROGRESS',
  UPDATE_USER_INFO: 'UPDATE_USER_INFO',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
};

export const reducer = (state: IAppState, action: IAppAction): any => {
  switch (action.type) {
    case AppEventType.UPDATE_ORDER_PROGRESS: {
      const { payload } = action;

      return {
        ...state,
        ...payload,
      };
    }
    case AppEventType.TOGGLE_SIDEBAR: {
      const { payload } = action;

      return {
        ...state,
        ...payload,
      };
    }
    case AppEventType.UPDATE_USER_INFO: {
      const { payload } = action;

      return {
        ...state,
        ...payload,
      };
    }
    default:
      throw new Error('Unexpected action');
  }
};
