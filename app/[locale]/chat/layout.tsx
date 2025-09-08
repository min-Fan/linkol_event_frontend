'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import { updateChatCid } from 'app/store/reducers/userSlice';
import { useChatApi } from '@hooks/useChatApi';
import { AlignJustify, Edit, History, Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@shadcn/lib/utils';
import { usePathname } from 'next/navigation';
import useChat from '@hooks/useChat';
import { formatDateYMDHMS } from '@libs/utils';
import { useRouter } from '@libs/i18n/navigation';
import { toast } from 'sonner';
import Header from '@ui/header';
import ChatSidebar from './compontents/ChatSidebar';

export default function ChatPageLayout({ children }: { children: React.ReactNode }) {
  const [showHistory, setShowHistory] = useState(false);
  const t = useTranslations('common');
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { chats } = useChat();
  const router = useRouter();
  const { stopCurrentAction } = useChatApi();
  const isOrderProcessing = useAppSelector((state) => state.userReducer?.isOrderProcessing);

  // 检测是否在view页面
  const isViewPage = pathname.includes('/chat/view');

  // 获取当前聊天信息
  const currentCid = useAppSelector((state) => state.userReducer?.chat_cid);
  const currentChat = chats.find((chat) => chat.cid === currentCid);

  // 在view页面时，默认显示缩小的侧边栏
  useEffect(() => {
    if (isViewPage) {
      setShowHistory(false);
    }
  }, [isViewPage]);

  const handleAddChat = async () => {
    if (isOrderProcessing) {
      // 如果有正在进行的订单，先停止当前操作
      toast.error(t('order_processing'));
      return;
      // try {
      //   await stopCurrentAction();
      //   console.log('当前操作已停止，继续创建新对话');
      // } catch (error) {
      //   console.error('停止当前操作失败:', error);
      //   // 如果停止失败，仍然继续创建新对话
      // }
    }

    // 清空当前对话的 cid（会自动清空订单状态）
    dispatch(updateChatCid(null));
    router.push('/chat/view');
  };

  return (
    <div className="bg-background relative flex h-screen w-full flex-col bg-[radial-gradient(66.14%_90.55%_at_49.89%_100%,rgba(0,122,255,0.10)_0%,rgba(0,122,255,0.00)_100%)] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.05)] backdrop-blur-[30px]">
      <Header />

      {/* 主内容区域 */}
      <div className="flex min-h-0 flex-1">
        {/* 历史记录侧边栏 */}
        <ChatSidebar
          showHistory={showHistory}
          isViewPage={isViewPage}
          onAddChat={handleAddChat}
          onOpenCHange={setShowHistory}
          onStopCurrentAction={stopCurrentAction}
        />

        {/* 主内容区域 */}
        <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden">
          {/* 聊天标题栏 - 只在view页面显示 */}
          {isViewPage && (
            <div className="border-border bg-background/95 shadow-background relative z-1 flex items-center border-b shadow-[0_10px_10px_20px_#fff] backdrop-blur-sm">
              <div className="box-content flex w-6 items-center justify-center pl-4 md:hidden">
                <History
                  className="text-muted-foreground hover:text-primary size-4 cursor-pointer transition-colors"
                  onClick={() => setShowHistory(true)}
                />
              </div>
              <div className="mx-auto w-full max-w-[1600px] p-2 px-4">
                <h1 className="text-foreground w-full max-w-[1520px] flex-1 truncate text-base font-semibold">
                  {currentChat?.title || 'AI Chat'}
                </h1>
                <p className="text-muted-foreground text-xs">
                  {currentChat?.updatedAt
                    ? formatDateYMDHMS(currentChat.updatedAt)
                    : t('chat_conversation')}
                </p>
              </div>
            </div>
          )}
          {/* 顶部工具栏 - 只在非view页面且侧边栏收起时显示 */}
          {!isViewPage && !showHistory && (
            <div className="absolute top-2 left-2 z-10 flex flex-col items-center gap-4 p-4 pb-0">
              <Menu className="size-6 cursor-pointer" onClick={() => setShowHistory(true)} />
              <Edit className="size-6 cursor-pointer" onClick={handleAddChat} />
            </div>
          )}

          {/* 主内容 */}
          <div className="min-h-0 flex-1 transition-all duration-300 ease-in-out">{children}</div>
        </div>
      </div>
    </div>
  );
}
