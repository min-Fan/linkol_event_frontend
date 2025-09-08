import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Input } from '@shadcn-ui/input';
import {
  AlignJustify,
  Edit,
  History,
  Menu,
  PanelRightClose,
  PanelRightOpen,
  Search as SearchIcon,
  SlidersIcon,
  Trash2,
  X,
} from 'lucide-react';
import useChat from '@hooks/useChat';
import { cn } from '@shadcn/lib/utils';
import { AddChat, ChatList } from '@assets/svg';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import {
  clearOrderThinkingMessages,
  completeOrderProcessing,
  updateChatCid,
} from 'app/store/reducers/userSlice';
import { formatDateYMDHMS } from '@libs/utils';
import { useRouter } from '@libs/i18n/navigation';
import { toast } from 'sonner';

interface ChatHistoryProps {
  onClose: () => void;
  isOpen: boolean;
  isInline?: boolean;
  onStopCurrentAction?: () => Promise<void>; // 添加停止当前操作的回调
  isSheet?: boolean;
}

interface GroupedChats {
  recent: { date: string; chats: any };
  older: { date: string; chats: any };
}

export default function ChatHistory({
  onClose,
  isOpen,
  isInline = false,
  onStopCurrentAction,
  isSheet = false,
}: ChatHistoryProps) {
  const { chats, fetchChats, deleteChat } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const t = useTranslations('common');
  const dispatch = useAppDispatch();
  const currentCid = useAppSelector((state) => state.userReducer?.chat_cid);
  const router = useRouter();
  const isOrderProcessing = useAppSelector((state) => state.userReducer?.isOrderProcessing);
  const handleAddChat = async () => {
    if (isOrderProcessing && onStopCurrentAction) {
      // 如果有正在进行的订单，先停止当前操作
      toast.error(t('order_processing'));
      return;
      // try {
      //   await onStopCurrentAction();
      //   console.log('当前操作已停止，继续创建新对话');
      // } catch (error) {
      //   console.error('停止当前操作失败:', error);
      //   toast.error('停止当前操作失败');
      //   return;
      // }
    }

    // 清空当前对话的 cid（会自动清空订单状态）
    dispatch(updateChatCid(null));
    setTimeout(() => {
      router.push('/chat/view');
    }, 0);
  };

  useEffect(() => {
    if (isOpen) {
      fetchChats();
    }
  }, [isOpen, fetchChats]);

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedChats = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const grouped: GroupedChats = {
      recent: { date: t('recent_30_days'), chats: [] },
      older: { date: t('older'), chats: [] },
    };

    const sortedChats = [...filteredChats].sort((a, b) => b.updatedAt - a.updatedAt);

    sortedChats.forEach((chat) => {
      const chatDate = new Date(chat.updatedAt);
      if (chatDate >= thirtyDaysAgo) {
        grouped.recent.chats.push(chat);
      } else {
        grouped.older.chats.push(chat);
      }
    });

    return grouped;
  }, [filteredChats, t]);

  const handleChatClick = async (cid: string) => {
    if (isOrderProcessing && onStopCurrentAction) {
      // 如果有正在进行的订单，先停止当前操作
      toast.error(t('order_processing'));
      return;
      // try {
      //   await onStopCurrentAction();
      //   console.log('当前操作已停止，继续切换对话');
      // } catch (error) {
      //   console.error('停止当前操作失败:', error);
      //   toast.error('停止当前操作失败');
      //   return;
      // }
    }

    // 切换到指定对话（会自动清空订单状态）
    dispatch(updateChatCid(cid));
    router.push('/chat/view');
    // onClose();
  };

  const handleDeleteChat = async (e: React.MouseEvent, cid: string) => {
    e.stopPropagation(); // 阻止事件冒泡
    await deleteChat(cid);

    // 如果删除的是当前对话，切换到最新的对话
    if (cid === currentCid) {
      const remainingChats = chats.filter((chat) => chat.cid !== cid);
      if (remainingChats.length > 0) {
        // 切换到最新的对话（会自动清空订单状态）
        const latestChat = remainingChats.sort((a, b) => b.updatedAt - a.updatedAt)[0];
        dispatch(updateChatCid(latestChat.cid));
      } else {
        // 如果没有其他对话了，清空当前对话（会自动清空订单状态）
        dispatch(updateChatCid(null));
      }
    }

    // 刷新对话列表
    fetchChats();
  };

  const renderChatGroup = (group: { date: string; chats: any }) => {
    if (group.chats.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="text-primary mb-2 px-3 text-xs font-medium">{group.date}</div>
        {group.chats.map((chat) => (
          <div
            key={chat.cid}
            className={cn(
              'group hover:bg-accent relative mb-1 cursor-pointer rounded-lg p-3 transition-all duration-200',
              currentCid === chat.cid && 'bg-accent/50 border-primary/20 border shadow-sm'
            )}
            onClick={() => handleChatClick(chat.cid)}
          >
            <div className="truncate pr-8 text-sm font-medium">{chat.title}</div>
            <div className="text-muted-foreground text-xs">{formatDateYMDHMS(chat.updatedAt)}</div>
            <button
              className="absolute top-1/2 right-3 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => handleDeleteChat(e, chat.cid)}
            >
              <Trash2 className="text-destructive hover:text-destructive/80 size-4" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  // 内联模式 - 直接渲染内容
  if (isInline) {
    return (
      <div className="flex h-full w-full flex-col">
        {/* 头部 */}
        <div className="border-border bg-background/95 flex items-center justify-between p-4 pb-0 backdrop-blur-sm">
          <div
            className={cn(
              'flex flex-nowrap items-center gap-2 rounded-lg px-3 py-2 transition-all duration-200',
              'text-base font-medium'
            )}
          >
            <AlignJustify className="size-6" />
            {/* <span>{t('chat_history')}</span> */}
          </div>
          {!isSheet && (
            <button onClick={onClose} className="hover:bg-accent rounded-md transition-colors">
              {isOpen ? (
                <PanelRightOpen className="text-muted-foreground/60 hover:text-foreground size-6" />
              ) : (
                <PanelRightClose className="text-muted-foreground/60 hover:text-foreground size-6" />
              )}
            </button>
          )}
        </div>

        {/* 搜索框 */}
        <div className="flex items-center gap-2 p-2 px-4 pl-6">
          {/* <div className="relative">
            <Input
              placeholder={t('search_conversation')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-primary/70 h-6 rounded-full pl-8"
            />
            <SearchIcon className="text-muted-foreground absolute top-1/2 left-2 size-4 -translate-y-1/2" />
          </div> */}
          <div
            className="hover:bg-accent border-border ml-auto flex w-full cursor-pointer items-center gap-2 rounded-lg border p-2 transition-all duration-200 hover:shadow-sm"
            onClick={handleAddChat}
          >
            <Edit className="text-muted-foreground size-5 cursor-pointer" />
            <span className="text-muted-foreground text-sm font-medium">
              {t('chat_menu_new_chat')}
            </span>
          </div>
        </div>

        {/* 聊天列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredChats.length === 0 ? (
            <div className="text-muted-foreground flex h-full items-center justify-center">
              {t('no_history')}
            </div>
          ) : (
            <>
              {renderChatGroup(groupedChats.recent)}
              {renderChatGroup(groupedChats.older)}
            </>
          )}
        </div>
      </div>
    );
  }

  // 弹出模式 - 保持原有的弹出层设计
  return (
    <>
      {/* 遮罩层 */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
      />

      {/* 侧边栏 */}
      <div
        className={cn(
          'bg-background border-border fixed top-0 left-0 z-50 h-full border-r shadow-xl transition-transform duration-300 ease-in-out',
          'w-full sm:w-80 md:w-80 lg:w-80',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* 头部 */}
        <div className="border-border bg-background/95 flex items-center justify-between border-b p-4 backdrop-blur-sm">
          <h2 className="text-lg font-semibold">{t('chat_history')}</h2>
          <button onClick={onClose} className="hover:bg-accent rounded-md p-1 transition-colors">
            <X className="size-5" />
          </button>
        </div>

        {/* 搜索框 */}
        <div className="border-border border-b p-4">
          <div className="relative">
            <Input
              placeholder={t('search_conversation')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-primary/70 h-9 rounded-lg pl-8"
            />
            <SearchIcon className="text-muted-foreground absolute top-1/2 left-2 size-4 -translate-y-1/2" />
          </div>
        </div>

        {/* 聊天列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredChats.length === 0 ? (
            <div className="text-muted-foreground flex h-full items-center justify-center">
              {t('no_history')}
            </div>
          ) : (
            <>
              {renderChatGroup(groupedChats.recent)}
              {renderChatGroup(groupedChats.older)}
            </>
          )}
        </div>
      </div>
    </>
  );
}
