import React, { useState, useMemo, useEffect } from 'react';
import { Input } from '@shadcn-ui/input';
import { Search as SearchIcon, Trash2 } from 'lucide-react';
import useChat from '@hooks/useChat';
import { cn } from '@shadcn/lib/utils';
import { ChatList } from '@assets/svg';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import { updateChatCid } from 'app/store/reducers/userSlice';
import { formatDateYMDHMS } from '@libs/utils';

interface ChatHistoryProps {
  onClose: () => void;
  isOpen: boolean;
}

interface GroupedChats {
  recent: { date: string; chats: any };
  older: { date: string; chats: any };
}

export default function ChatHistory({ onClose, isOpen }: ChatHistoryProps) {
  const { chats, fetchChats, deleteChat } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const t = useTranslations('common');
  const dispatch = useAppDispatch();
  const currentCid = useAppSelector((state) => state.userReducer?.chat_cid);

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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleChatClick = (cid: string) => {
    dispatch(updateChatCid(cid));
    onClose();
  };

  const handleDeleteChat = async (e: React.MouseEvent, cid: string) => {
    e.stopPropagation(); // 阻止事件冒泡
    await deleteChat(cid);

    // 如果删除的是当前对话，切换到最新的对话
    if (cid === currentCid) {
      const remainingChats = chats.filter((chat) => chat.cid !== cid);
      if (remainingChats.length > 0) {
        // 切换到最新的对话
        const latestChat = remainingChats.sort((a, b) => b.updatedAt - a.updatedAt)[0];
        dispatch(updateChatCid(latestChat.cid));
      } else {
        // 如果没有其他对话了，清空当前对话
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
        <div className="text-primary mb-2 px-3 text-xs">{group.date}</div>
        {group.chats.map((chat) => (
          <div
            key={chat.cid}
            className="group hover:bg-accent relative mb-0 cursor-pointer rounded-lg p-3"
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

  return (
    <div
      className={cn(
        'bg-foreground/40 absolute top-0 left-0 z-10 h-full w-full backdrop-blur-sm transition-opacity duration-300',
        isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          'bg-background border-border flex h-full w-[70%] flex-col border-r p-2 transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="relative">
            <Input
              placeholder={t('search_conversation')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-primary/70 h-8 rounded-full pl-8"
            />
            <SearchIcon className="text-muted-foreground absolute top-1/2 left-2 size-4 -translate-y-1/2" />
          </div>
          <ChatList className="size-4 cursor-pointer" onClick={onClose} />
        </div>

        <div className="flex-1 overflow-y-auto">
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
    </div>
  );
}
