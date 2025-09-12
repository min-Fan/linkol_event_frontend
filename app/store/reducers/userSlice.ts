import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_CHAIN } from 'app/constants/chains';
import { Filter, IConfig, KOLInfo, QuickOrder } from './types';
import { KolRankListItem, PromotionData } from 'app/@types/types';
import { ReactNode } from 'react';
import { IGetUserActivityRewardResponseData } from '@libs/request';
// 定义用户状态接口
export interface UserState {
  isLoggedIn: boolean;
  chainId: number;
  config: IConfig;
  filter: Filter;
  selectedKOLs: KolRankListItem[];
  selectedKOLInfo: KOLInfo | null;
  quickOrder: QuickOrder;
  promotionData: PromotionData;
  twitter_full_profile: any | null;
  pay_token_info: {
    symbol: string;
    decimals: number;
    balance: bigint;
    iconType: string;
  };
  chat_cid: string | null;
  chat_messages: Array<{
    role: 'user' | 'assistant';
    content:
      | string
      | {
          type: 'timeout';
          message: string;
          retryData: {
            userMessage: {
              role: 'user';
              content: string;
              mid: string;
              result_type: string;
              timestamp: number;
            };
            messageCid: string;
            userMid: string;
            assistantMid: string;
            timestamp: number;
            locale: string;
          };
        };
    mid?: string;
    result_type: string;
    timestamp: number;
  }>;
  // 用户活动奖励数据，按 eventId 分组存储
  userActivityRewards: {
    [eventId: string]: {
      data: IGetUserActivityRewardResponseData | null;
      isLoading: boolean;
      lastUpdated: number;
    };
  };
  is_view_quote_explanation_modal: boolean;
  chat_focus: boolean;
  chat_view: 'chat' | 'preview';
  chat_comparison_info: {
    kol1: {
      name: string;
      avatar: string;
    };
    kol2: {
      name: string;
      avatar: string;
    };
  };
  chat_comparison_view: boolean;
  isChatLoading: boolean;
  // 下单流程相关状态
  isOrderProcessing: boolean;
  orderStep: number;
  orderParams: {
    kol_ids: number[];
    promotional_materials: string;
    promotional_start_at: string;
    promotional_end_at: string;
    tweet_service_type_id: number;
    ext_tweet_service_type_ids?: number[];
    medias?: string[];
    project_id?: string;
    project_name?: string;
    project_description?: string;
    project_website?: string;
    project_icon?: string;
    project_tweet_url?: string;
  };
  orderThinkingMessages: Array<{
    stepId: number;
    messages: string[];
  }>;
  // 导航缓存状态
  navCache: {
    visibleItemsCount: number;
    containerWidth: number;
    itemWidths: number[];
    lastCalculatedAt: number;
  };
  // 兑换码状态
  redemptionCode: string;
  // 图片缓存状态
  imageCache: {
    [eventId: string]: {
      [screenName: string]: {
        imageUrl: string;
        templateData: any;
        generatedAt: number;
        expiresAt: number;
      };
    };
  };
}

export const initialState: UserState = {
  isLoggedIn: false,
  chainId: DEFAULT_CHAIN.id,
  config: {
    platform_receive_address: '',
    tags: {
      categories: null,
      chains: null,
      topic: null,
      languages: [],
    },
  },
  filter: {
    tags: [],
    language: [],
    min_price: '50',
    max_price: '100',
    kw: '',
    limit: 50,
    is_verified: 0,
    order: 'desc',
  },
  selectedKOLs: [],
  selectedKOLInfo: null,
  quickOrder: {
    order_no: '',
    order_id: '',
    project_id: '',
    service_type_code: '',
    promotional_materials: '',
  },
  promotionData: {
    order_amount: 0,
    payment_amount: 0,
    consumption_amount: 0,
  },
  twitter_full_profile: null,
  pay_token_info: {
    symbol: '',
    decimals: 0,
    balance: BigInt(0),
    iconType: '',
  },
  chat_cid: null,
  chat_messages: [],
  userActivityRewards: {},
  is_view_quote_explanation_modal: false,
  chat_focus: false,
  chat_view: 'chat',
  chat_comparison_info: {
    kol1: {
      name: '',
      avatar: '',
    },
    kol2: {
      name: '',
      avatar: '',
    },
  },
  chat_comparison_view: false,
  isChatLoading: false,
  // 下单流程相关状态
  isOrderProcessing: false,
  orderStep: 0,
  orderParams: {
    kol_ids: [],
    promotional_materials: '',
    promotional_start_at: '',
    promotional_end_at: '',
    tweet_service_type_id: 0,
    ext_tweet_service_type_ids: [],
    medias: [],
    project_id: '',
    project_name: '',
    project_description: '',
    project_website: '',
    project_icon: '',
    project_tweet_url: '',
  },
  orderThinkingMessages: [],
  // 导航缓存状态
  navCache: {
    visibleItemsCount: 7, // 默认显示7个
    containerWidth: 0,
    itemWidths: [],
    lastCalculatedAt: 0,
  },
  // 兑换码状态
  redemptionCode: '',
  // 图片缓存状态
  imageCache: {},
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // 使用 PayloadAction 类型声明 `action.payload` 的内容
    updateIsLoggedIn: (state, action: PayloadAction<boolean>) => {
      if (action.payload) {
        state.isLoggedIn = action.payload;
      } else {
        state.isLoggedIn = false;
      }
    },
    updateChain: (state, action: PayloadAction<number>) => {
      state.chainId = action.payload;
    },
    updateConfig: (state, action: PayloadAction<{ key: string; value: any }>) => {
      const { key, value } = action.payload;
      state.config[key] = value;
    },
    updateFilter: (state, action: PayloadAction<{ key: string; value: any }>) => {
      const { key, value } = action.payload;
      state.filter[key] = value;
    },
    clearFilter: (state) => {
      state.filter = initialState.filter;
    },
    updateSelectedKOLs: (state, action: PayloadAction<KolRankListItem[]>) => {
      state.selectedKOLs = action.payload;
    },
    addSelectedKOL: (state, action: PayloadAction<KolRankListItem>) => {
      if (!state.selectedKOLs.includes(action.payload)) {
        state.selectedKOLs.push(action.payload);
      }
    },
    removeSelectedKOL: (state, action: PayloadAction<KolRankListItem>) => {
      state.selectedKOLs = state.selectedKOLs.filter((kol) => kol.id !== action.payload.id);
    },
    clearSelectedKOLs: (state) => {
      state.selectedKOLs = [];
    },
    updateQuickOrder: (state, action: PayloadAction<{ key: keyof QuickOrder; value: any }>) => {
      const { key, value } = action.payload;
      state.quickOrder[key] = value;
    },
    clearQuickOrder: (state) => {
      state.quickOrder = initialState.quickOrder;
    },
    updatePromotionData: (
      state,
      action: PayloadAction<{ key: keyof PromotionData; value: number }>
    ) => {
      const { key, value } = action.payload;
      state.promotionData[key] = value;
    },
    clearPromotionData: (state) => {
      state.promotionData = initialState.promotionData;
    },
    updateSelectedKOLInfo: (state, action: PayloadAction<KOLInfo>) => {
      state.selectedKOLInfo = action.payload;
    },
    clearSelectedKOLInfo: (state) => {
      state.selectedKOLInfo = null;
    },
    updateTwitterFullProfile: (state, action: PayloadAction<any>) => {
      state.twitter_full_profile = {
        ...state.twitter_full_profile,
        ...action.payload,
      };

      console.log('action.payload', state.twitter_full_profile);
    },
    updatePayTokenInfo: (
      state,
      action: PayloadAction<{ symbol: string; decimals: number; balance: bigint; iconType: string }>
    ) => {
      state.pay_token_info = {
        ...state.pay_token_info,
        ...action.payload,
      };
    },
    updateChatCid: (state, action: PayloadAction<string | null>) => {
      state.chat_cid = action.payload;
      if (action.payload === null) {
        state.chat_messages = [];
      }

      // 切换对话时，强制清空所有订单执行状态
      state.isOrderProcessing = false;
      state.orderStep = 0;
      state.orderParams = {
        kol_ids: [],
        promotional_materials: '',
        promotional_start_at: '',
        promotional_end_at: '',
        tweet_service_type_id: 0,
        ext_tweet_service_type_ids: [],
        medias: [],
        project_id: '',
        project_name: '',
        project_description: '',
        project_website: '',
        project_icon: '',
        project_tweet_url: '',
      };
      state.orderThinkingMessages = [];
    },
    addChatMessage: (
      state,
      action: PayloadAction<{
        role: 'user' | 'assistant';
        content:
          | string
          | {
              type: 'timeout';
              message: string;
              retryData: {
                userMessage: {
                  role: 'user';
                  content: string;
                  mid: string;
                  result_type: string;
                  timestamp: number;
                };
                messageCid: string;
                userMid: string;
                assistantMid: string;
                timestamp: number;
                locale: string;
              };
            };
        mid?: string;
        result_type: string;
        timestamp: number;
      }>
    ) => {
      state.chat_messages.push(action.payload);
    },
    removeLastChatMessage: (state) => {
      if (state.chat_messages.length > 0) {
        state.chat_messages.pop();
      }
    },
    removeChatMessageById: (state, action: PayloadAction<string>) => {
      const messageId = action.payload;
      const beforeCount = state.chat_messages.length;
      const targetMessage = state.chat_messages.find((msg) => msg.mid === messageId);

      console.log('Redux removeChatMessageById 被调用:', {
        messageId,
        beforeCount,
        targetMessageExists: !!targetMessage,
        allMessageIds: state.chat_messages.map((m) => m.mid),
      });

      state.chat_messages = state.chat_messages.filter((msg) => msg.mid !== messageId);

      const afterCount = state.chat_messages.length;
      console.log('Redux removeChatMessageById 执行后:', {
        messageId,
        beforeCount,
        afterCount,
        removed: beforeCount - afterCount,
        remainingMessageIds: state.chat_messages.map((m) => m.mid),
      });
    },
    clearChatMessages: (state) => {
      state.chat_messages = [];
    },
    updateViewQuoteExplanationModal: (state, action: PayloadAction<boolean>) => {
      state.is_view_quote_explanation_modal = action.payload;
    },
    updateChatFocus: (state, action: PayloadAction<boolean>) => {
      state.chat_focus = action.payload;
    },
    updateChatView: (state, action: PayloadAction<'chat' | 'preview'>) => {
      state.chat_view = action.payload;
    },
    updateComparisonInfo: (
      state,
      action: PayloadAction<{
        kol1: { name: string; avatar: string };
        kol2: { name: string; avatar: string };
      }>
    ) => {
      state.chat_comparison_info = action.payload;
    },
    updateChatComparisonView: (state, action: PayloadAction<boolean>) => {
      state.chat_comparison_view = action.payload;
    },
    updateChatLoading: (state, action: PayloadAction<boolean>) => {
      state.isChatLoading = action.payload;
    },
    // 下单流程相关actions
    startOrderProcessing: (state, action: PayloadAction<{ kol_ids: number[] }>) => {
      state.isOrderProcessing = true;
      state.orderStep = 0;
      state.orderParams = {
        ...state.orderParams,
        kol_ids: action.payload.kol_ids,
      };
      state.orderThinkingMessages = [];
    },
    updateOrderStep: (state, action: PayloadAction<number>) => {
      state.orderStep = action.payload;
    },
    updateOrderParams: (state, action: PayloadAction<{ key: string; value: any }>) => {
      const { key, value } = action.payload;
      state.orderParams[key] = value;
    },
    addOrderThinkingMessage: (
      state,
      action: PayloadAction<{ stepId: number; message: string }>
    ) => {
      const { stepId, message } = action.payload;
      const existingStep = state.orderThinkingMessages.find((step) => step.stepId === stepId);

      if (existingStep) {
        // 检查是否已存在相同的消息，避免重复添加
        if (!existingStep.messages.includes(message)) {
          existingStep.messages.push(message);
        }
      } else {
        state.orderThinkingMessages.push({
          stepId,
          messages: [message],
        });
      }
    },
    clearOrderThinkingMessages: (state) => {
      state.orderThinkingMessages = [];
    },
    clearStepThinkingMessages: (state, action: PayloadAction<number>) => {
      const stepId = action.payload;
      state.orderThinkingMessages = state.orderThinkingMessages.filter(
        (step) => step.stepId !== stepId
      );
    },
    completeOrderProcessing: (state) => {
      state.isOrderProcessing = false;
      state.orderStep = 0;
      state.orderParams = {
        kol_ids: [],
        promotional_materials: '',
        promotional_start_at: '',
        promotional_end_at: '',
        tweet_service_type_id: 0,
        ext_tweet_service_type_ids: [],
        medias: [],
        project_id: '',
        project_name: '',
        project_description: '',
        project_website: '',
        project_icon: '',
        project_tweet_url: '',
      };
      state.orderThinkingMessages = [];
    },
    // 导航缓存相关actions
    updateNavCache: (
      state,
      action: PayloadAction<{
        visibleItemsCount?: number;
        containerWidth?: number;
        itemWidths?: number[];
      }>
    ) => {
      state.navCache = {
        ...state.navCache,
        ...action.payload,
        lastCalculatedAt: Date.now(),
      };
    },
    clearNavCache: (state) => {
      state.navCache = {
        visibleItemsCount: 7,
        containerWidth: 0,
        itemWidths: [],
        lastCalculatedAt: 0,
      };
    },
    // 用户活动奖励相关actions
    setUserActivityRewardLoading: (
      state,
      action: PayloadAction<{ eventId: string; isLoading: boolean }>
    ) => {
      const { eventId, isLoading } = action.payload;
      if (!state.userActivityRewards[eventId]) {
        state.userActivityRewards[eventId] = {
          data: null,
          isLoading: false,
          lastUpdated: 0,
        };
      }
      state.userActivityRewards[eventId].isLoading = isLoading;
    },
    updateUserActivityReward: (
      state,
      action: PayloadAction<{
        eventId: string;
        data: IGetUserActivityRewardResponseData;
      }>
    ) => {
      const { eventId, data } = action.payload;
      state.userActivityRewards[eventId] = {
        data,
        isLoading: false,
        lastUpdated: Date.now(),
      };
    },
    clearUserActivityReward: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      delete state.userActivityRewards[eventId];
    },
    clearAllUserActivityRewards: (state) => {
      state.userActivityRewards = {};
    },
    // 兑换码相关actions
    updateRedemptionCode: (state, action: PayloadAction<string>) => {
      state.redemptionCode = action.payload;
    },
    clearRedemptionCode: (state) => {
      state.redemptionCode = '';
    },
    // 图片缓存相关actions
    setImageCache: (
      state,
      action: PayloadAction<{
        eventId: string;
        screenName: string;
        imageUrl: string;
        templateData: any;
        expiresAt: number;
      }>
    ) => {
      const { eventId, screenName, imageUrl, templateData, expiresAt } = action.payload;
      
      if (!state.imageCache[eventId]) {
        state.imageCache[eventId] = {};
      }
      
      state.imageCache[eventId][screenName] = {
        imageUrl,
        templateData,
        generatedAt: Date.now(),
        expiresAt,
      };
    },
    clearImageCache: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      delete state.imageCache[eventId];
    },
    clearAllImageCache: (state) => {
      state.imageCache = {};
    },
    removeExpiredImageCache: (state) => {
      const now = Date.now();
      for (const eventId in state.imageCache) {
        for (const screenName in state.imageCache[eventId]) {
          if (state.imageCache[eventId][screenName].expiresAt < now) {
            delete state.imageCache[eventId][screenName];
          }
        }
        // 如果事件下没有缓存了，删除整个事件
        if (Object.keys(state.imageCache[eventId]).length === 0) {
          delete state.imageCache[eventId];
        }
      }
    },
  },
});

export const {
  updateChatComparisonView,
  updateChatLoading,
  updateComparisonInfo,
  updateIsLoggedIn,
  updateChain,
  updateConfig,
  updateFilter,
  clearFilter,
  updateSelectedKOLs,
  addSelectedKOL,
  removeSelectedKOL,
  clearSelectedKOLs,
  clearQuickOrder,
  clearPromotionData,
  updateQuickOrder,
  updatePromotionData,
  updateSelectedKOLInfo,
  clearSelectedKOLInfo,
  updateTwitterFullProfile,
  updatePayTokenInfo,
  updateChatCid,
  addChatMessage,
  removeLastChatMessage,
  removeChatMessageById,
  clearChatMessages,
  updateViewQuoteExplanationModal,
  updateChatFocus,
  updateChatView,
  startOrderProcessing,
  updateOrderStep,
  updateOrderParams,
  addOrderThinkingMessage,
  clearOrderThinkingMessages,
  clearStepThinkingMessages,
  completeOrderProcessing,
  updateNavCache,
  clearNavCache,
  setUserActivityRewardLoading,
  updateUserActivityReward,
  clearUserActivityReward,
  clearAllUserActivityRewards,
  updateRedemptionCode,
  clearRedemptionCode,
  setImageCache,
  clearImageCache,
  clearAllImageCache,
  removeExpiredImageCache,
} = userSlice.actions;

export default userSlice.reducer;
