'use client';

import { Card, CardContent } from '@shadcn-ui/card';
import Preview from './Preview';
import { useEffect, useState } from 'react';
import { cn } from '@shadcn/lib/utils';
import { ChatList, AddChat } from '@assets/svg';
import ChatHistory from './ChatHistory';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import {
  updateChatCid,
  updateChatFocus,
  updateChatView,
  completeOrderProcessing,
} from 'app/store/reducers/userSlice';
import Chat from '../chat/compontents/Chat';
import ChatMenu from '../chat/compontents/ChatMenu';

export default function OrderPreview() {
  // const [active, setActive] = useState('chat');
  const [showHistory, setShowHistory] = useState(false);
  const dispatch = useAppDispatch();
  const chat_view = useAppSelector((state) => state.userReducer?.chat_view);

  const handleAddChat = () => {
    // 清空当前对话的 cid
    dispatch(updateChatCid(null));
    dispatch(completeOrderProcessing());
    dispatch(updateChatView('chat'));
    // 切换到聊天界面
    // setActive('chat');
  };

  const [flashRing, setFlashRing] = useState(false);

  useEffect(() => {
    setFlashRing(true);
    const timer = setTimeout(() => setFlashRing(false), 600); // 动画持续 300ms
    return () => clearTimeout(timer);
  }, [chat_view]);

  const tabChange = (view: 'chat' | 'preview') => {
    setFlashRing(false);
    dispatch(updateChatView(view));
  };

  return (
    <Card
      className={cn(
        'relative h-full w-full flex-1 overflow-hidden rounded-3xl border-none p-0 shadow-[0px_4px_35px_0px_rgba(92,153,244,0.20)] dark:shadow-[0px_4px_6px_0px_rgba(92,153,244,0.20)]'
      )}
    >
      <CardContent
        className="box-border flex h-full min-h-0 w-full flex-col px-2 py-3"
        onMouseEnter={() => dispatch(updateChatFocus(true))}
        onMouseLeave={() => dispatch(updateChatFocus(false))}
      >
        <div className="relative z-10 flex items-center justify-between p-2 pb-4">
          {/* {chat_view == 'chat' && (
            <ChatList
              className="size-4 cursor-pointer"
              onClick={() => setShowHistory(!showHistory)}
            />
          )} */}
          <div className="mr-auto box-border flex h-8 w-auto items-center justify-center rounded-full border border-[rgba(23,27,252,0.10)] p-1 shadow-[2px_1px_20px_0px_rgba(92,153,244,0.20)] backdrop-blur-md">
            <div
              className={cn(
                'flex h-full flex-1 cursor-pointer items-center justify-center rounded-full px-5 text-sm font-medium',
                chat_view == 'chat' ? 'bg-primary text-[#fff]' : 'text-primary'
              )}
              onClick={() => tabChange('chat')}
            >
              <span>Chat</span>
            </div>
            <div
              className={cn(
                'flex h-full flex-1 cursor-pointer items-center justify-center rounded-full px-5 text-sm font-medium',
                chat_view == 'preview' ? 'bg-primary text-[#fff]' : 'text-primary'
              )}
              onClick={() => tabChange('preview')}
            >
              <span>Preview</span>
            </div>
          </div>
          {chat_view == 'chat' && <ChatMenu onOpenHistory={() => setShowHistory(true)} />}
        </div>
        <ChatHistory onClose={() => setShowHistory(false)} isOpen={showHistory} />
        {chat_view == 'chat' ? (
          <div className="relative flex-1 overflow-hidden">{<Chat size="sm"></Chat>}</div>
        ) : (
          <div className="absolute top-0 left-0 z-1 h-full w-full flex-1 overflow-hidden">
            {<Preview></Preview>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
