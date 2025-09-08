import { ORDER_PROGRESS } from '@constants/app';

export interface IAppState extends Record<string, any> {
  orderProgress: ORDER_PROGRESS;
  isToggleSidebar: boolean;
  isLogin: boolean;
  userId: string;
  username: string;
  email: string;
}

export interface IAppAction {
  type: string;
  payload: Partial<IAppState>;
}
