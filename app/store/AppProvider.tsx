'use client';

import React, { createContext, useReducer, useMemo, JSX, useContext } from 'react';

import { CACHE_KEY } from '@constants/app';
import { IGetInfoByTokenResponseData } from '@libs/request';
import { IAppState, IAppAction } from './types';
import { reducer, initialAppState } from './reducer';

interface IAppContextProps {
  state: IAppState;
  dispatch: React.Dispatch<IAppAction>;
}

export const AppContext = createContext({} as IAppContextProps);

// 安全的浏览器API调用
const safeSetCookie = (key: string, value: string) => {
  if (typeof document !== 'undefined') {
    document.cookie = `${key}=${value}; path=/;`;
  }
};

const safeClearCookie = (key: string) => {
  if (typeof document !== 'undefined') {
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
};

const safeSetLocalStorage = (key: string, value: string) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('Failed to set localStorage:', error);
    }
  }
};

const safeRemoveLocalStorage = (key: string) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove localStorage:', error);
    }
  }
};

export const AppProvider = (props: {
  userInfo: IGetInfoByTokenResponseData | null;
  children: React.ReactNode;
}): JSX.Element => {
  const { userInfo, children } = props;
  const initialState = useMemo(() => {
    if (userInfo) {
      const { id, username, email, token } = userInfo;

      safeSetCookie(CACHE_KEY.TOKEN, token);
      safeSetLocalStorage(CACHE_KEY.TOKEN, token);

      return {
        ...initialAppState,
        isLogin: true,
        userId: id,
        username,
        email: email || '',
      };
    }

    safeClearCookie(CACHE_KEY.TOKEN);
    safeRemoveLocalStorage(CACHE_KEY.TOKEN);

    return initialAppState;
  }, [userInfo]);

  const [state, dispatch] = useReducer(reducer, initialState);

  const contextValue = useMemo(() => {
    return { state, dispatch };
  }, [state, dispatch]);

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useApp = (): IAppContextProps => {
  const contextValue = useContext(AppContext);

  return contextValue;
};
