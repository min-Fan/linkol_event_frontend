import { AppProvider } from './AppProvider';
import { AppEventType } from './reducer';
// configureStore: store配置项
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';
// combineReducers： 组合reducers目录下的所有reducer模块
import { combineReducers } from 'redux';
// 数据持久化
import { persistStore, persistReducer } from 'redux-persist';
// defaults to localStorage for web
import localForage from 'localforage';

// 导入自己封装好的reducers
import userReducer, { initialState, UserState } from './reducers/userSlice';
import { updateVersion } from './global/actions';
import { DEFAULT_CHAIN } from 'app/constants/chains';

// 创建一个安全的存储配置，支持SSR
const createSafeStorage = () => {
  // 检查是否在客户端环境
  if (typeof window === 'undefined') {
    // 服务器端：返回一个模拟的存储对象
    return {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve(),
    };
  }

  // 客户端：使用 localForage
  try {
    return localForage.createInstance({
      name: 'linkol_event:redux',
    });
  } catch (error) {
    console.warn('LocalForage failed to initialize, falling back to localStorage:', error);
    // 降级到 localStorage
    return {
      getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
      setItem: (key: string, value: any) => Promise.resolve(localStorage.setItem(key, value)),
      removeItem: (key: string) => Promise.resolve(localStorage.removeItem(key)),
    };
  }
};

// 持久化存储配置对象
const persistConfig = {
  key: 'interface',
  storage: createSafeStorage(),
  version: 0.5,
  throttle: 1000, // ms
  serialize: false,
  deserialize: false,
  migrate: (state: any) => {
    if (!state || state._persist?.version === persistConfig.version) {
      return Promise.resolve(state);
    }

    // 获取初始状态的所有键
    const initial = {
      userReducer: initialState,
    };

    // 深度合并函数
    const deepMerge = (target: any, source: any) => {
      const result = { ...target };
      for (const key in source) {
        if (
          typeof source[key] === 'object' &&
          source[key] !== null &&
          !Array.isArray(source[key])
        ) {
          result[key] = deepMerge(target[key] || {}, source[key]);
        } else if (!(key in target)) {
          result[key] = source[key];
        }
      }
      return result;
    };

    // 过滤多余的键，只保留在 schema 中定义的键
    const filterExtraKeys = (data: any, schema: any): any => {
      if (!data || typeof data !== 'object' || typeof schema !== 'object') {
        return data;
      }

      // 对于数组，直接返回原始数据
      if (Array.isArray(data)) {
        return data;
      }

      const result: any = {};

      // 遍历 schema 的键，只保留 schema 中存在的键
      for (const key in schema) {
        if (key in data) {
          if (
            typeof schema[key] === 'object' &&
            schema[key] !== null &&
            typeof data[key] === 'object' &&
            data[key] !== null &&
            !Array.isArray(schema[key])
          ) {
            // 递归处理嵌套对象
            result[key] = filterExtraKeys(data[key], schema[key]);
          } else {
            result[key] = data[key];
          }
        } else {
          // 如果 data 中不存在该键，使用 schema 中的默认值
          result[key] = schema[key];
        }
      }

      return result;
    };

    // 合并状态，先补充缺失的键，然后过滤多余的键
    const mergedUserReducer = deepMerge(state.userReducer || {}, initial.userReducer);
    const filteredUserReducer = filterExtraKeys(mergedUserReducer, initial.userReducer);

    const newState = {
      ...state,
      userReducer: filteredUserReducer,
      _persist: {
        ...state._persist,
        version: persistConfig.version,
      },
    };

    return Promise.resolve(newState);
  },
};

// 持久化处理后的reducers
const persistedReducer = persistReducer(
  persistConfig,
  combineReducers({
    // 数据切片
    userReducer,
  })
);

// 将持久化插件和store通过middleware关联起来
const store = configureStore({
  // userReducer 模块名
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true,
      serializableCheck: false,
    }),
});

// 可以订阅 store
// store.subscribe(() => console.log(store.getState(), 'userSlice'))

// 持久化的store - 只在客户端创建
let persistor: any = null;
if (typeof window !== 'undefined') {
  persistor = persistStore(store);
}

setupListeners(store.dispatch);

// 只在客户端派发更新版本的action
if (typeof window !== 'undefined') {
  store.dispatch(updateVersion());
}

export { store, persistor, AppProvider, AppEventType };
