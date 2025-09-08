'use client';

import { useEffect, useState } from 'react';
import { nanoid } from 'nanoid';

import { chat, IChat, ChatType, message } from '@db/index';

const CHAT_REFRESH_EVENT = 'chat:refresh';

export default function useChat() {
  const [chats, setChats] = useState<IChat[]>([]);

  const refreshChats = () => {
    const event = new CustomEvent(CHAT_REFRESH_EVENT);

    globalThis.dispatchEvent(event);
  };

  const fetchChats = async () => {
    const chats = await chat.getAll();

    setChats(chats);
  };

  const createChat = async (title: string, type: ChatType) => {
    const cid = nanoid();
    const timestamp = Date.now();

    await chat.create({
      cid,
      title,
      type,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return cid;
  };

  const deleteChat = async (cid: string) => {
    await chat.delete(cid);
    await message.deleteMany(cid);
  };

  const deleteAllChats = async () => {
    await chat.clear();
  };

  useEffect(() => {
    fetchChats();

    globalThis.addEventListener(CHAT_REFRESH_EVENT, fetchChats);

    // 添加定时器，每5秒刷新一次聊天列表，确保时间显示实时更新
    const interval = setInterval(fetchChats, 5000);

    return () => {
      globalThis.removeEventListener(CHAT_REFRESH_EVENT, fetchChats);
      clearInterval(interval);
    };
  }, []);

  return {
    chats,
    fetchChats,
    refreshChats,
    createChat,
    deleteChat,
    deleteAllChats,
  };
}
