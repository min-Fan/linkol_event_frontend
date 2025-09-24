'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: {
      id: number;
      is_bot?: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      is_premium?: boolean;
      added_to_attachment_menu?: boolean;
      allows_write_to_pm?: boolean;
      photo_url?: string;
    };
    isFullscreen?: boolean;
    receiver?: {
      id: number;
      is_bot?: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      is_premium?: boolean;
      added_to_attachment_menu?: boolean;
      allows_write_to_pm?: boolean;
      photo_url?: string;
    };
    chat?: {
      id: number;
      type: string;
      title: string;
      username?: string;
      photo_url?: string;
    };
    chat_type?: string;
    chat_instance?: string;
    start_param?: string;
    can_send_after?: number;
    auth_date: number;
    hash: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  backButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  mainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isProgressVisible: boolean;
    isActive: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    setText: (text: string) => void;
    setParams: (params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_visible?: boolean;
      is_progress_visible?: boolean;
      is_active?: boolean;
    }) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  openTelegramLink: (url: string) => void;
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  switchInlineQuery: (query: string, choose_chat_types?: string[]) => void;
  showPopup: (params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id?: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text: string;
    }>;
  }) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  showScanQrPopup: (params: { text?: string }, callback?: (data: string) => void) => void;
  readTextFromClipboard: (callback?: (data: string) => void) => void;
  requestWriteAccess: (callback?: (access: boolean) => void) => void;
  requestContact: (
    callback?: (contact: {
      phone_number: string;
      first_name: string;
      last_name?: string;
      user_id?: number;
    }) => void
  ) => void;
  invokeCustomMethod: (method: string, params?: any) => void;
  invokeCustomMethodAsync: (method: string, params?: any) => Promise<any>;
  offEvent: (eventType: string, eventHandler: (...args: any[]) => void) => void;
  onEvent: (eventType: string, eventHandler: (...args: any[]) => void) => void;
  sendData: (data: string) => void;
  openInvoice: (
    url: string,
    callback?: (status: 'paid' | 'cancelled' | 'failed' | 'pending') => void
  ) => void;
}

interface TelegramContextType {
  webApp: TelegramWebApp | null;
  isTelegram: boolean;
  isReady: boolean;
  user: TelegramWebApp['initDataUnsafe']['user'] | null;
  startParam: string | null;
}

const TelegramContext = createContext<TelegramContextType>({
  webApp: null,
  isTelegram: false,
  isReady: false,
  user: null,
  startParam: null,
});

export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
};

interface TelegramProviderProps {
  children: ReactNode;
}

export default function TelegramProvider({ children }: TelegramProviderProps) {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isTelegram, setIsTelegram] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<TelegramWebApp['initDataUnsafe']['user'] | null>(null);
  const [startParam, setStartParam] = useState<string | null>(null);

  useEffect(() => {
    const initializeTelegram = () => {
      console.log('初始化Telegram Mini App...');

      // 检查是否在Telegram环境中
      if (typeof window === 'undefined') {
        console.log('服务端环境，跳过Telegram初始化');
        return;
      }

      // 检查Telegram WebApp对象
      const telegramWebApp = (window as any).Telegram?.WebApp;
      if (!telegramWebApp) {
        console.log('未检测到Telegram WebApp对象');
        return;
      }

      console.log('检测到Telegram WebApp对象:', telegramWebApp);
      setIsTelegram(true);
      setWebApp(telegramWebApp);

      telegramWebApp.ready();

      // 全屏
      // telegramWebApp.requestFullscreen();
      // telegramWebApp.disableVerticalSwipes();

      // 获取用户信息
      if (telegramWebApp.initDataUnsafe?.user) {
        setUser(telegramWebApp.initDataUnsafe.user);
        console.log('获取到用户信息:', telegramWebApp.initDataUnsafe.user);
      }

      // 获取启动参数
      if (telegramWebApp.initDataUnsafe?.start_param) {
        setStartParam(telegramWebApp.initDataUnsafe.start_param);
        console.log('获取到启动参数:', telegramWebApp.initDataUnsafe.start_param);
      }

      // 初始化WebApp
      try {
        telegramWebApp.ready();
        console.log('Telegram WebApp已就绪');
        setIsReady(true);
      } catch (error) {
        console.error('初始化Telegram WebApp失败:', error);
      }

      // 设置主题
      try {
        if (telegramWebApp.themeParams) {
          const { bg_color, text_color, button_color, button_text_color } =
            telegramWebApp.themeParams;

          // 应用主题颜色到CSS变量
          if (bg_color) {
            document.documentElement.style.setProperty('--tg-theme-bg-color', bg_color);
          }
          if (text_color) {
            document.documentElement.style.setProperty('--tg-theme-text-color', text_color);
          }
          if (button_color) {
            document.documentElement.style.setProperty('--tg-theme-button-color', button_color);
          }
          if (button_text_color) {
            document.documentElement.style.setProperty(
              '--tg-theme-button-text-color',
              button_text_color
            );
          }

          console.log('应用Telegram主题:', telegramWebApp.themeParams);
        }
      } catch (error) {
        console.error('应用主题失败:', error);
      }

      telegramWebApp.expand();

      // 设置视口高度
      try {
        if (telegramWebApp.viewportHeight) {
          document.documentElement.style.setProperty(
            '--tg-viewport-height',
            `${telegramWebApp.viewportHeight}px`
          );
          console.log('设置视口高度:', telegramWebApp.viewportHeight);
        }
      } catch (error) {
        console.error('设置视口高度失败:', error);
      }
    };

    // 延迟初始化，确保Telegram脚本已加载
    const timer = setTimeout(initializeTelegram, 100);
    return () => clearTimeout(timer);
  }, []);

  const value: TelegramContextType = {
    webApp,
    isTelegram,
    isReady,
    user,
    startParam,
  };

  return <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>;
}
