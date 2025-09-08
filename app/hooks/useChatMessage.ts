'use client';

import { useEffect, useState, useCallback } from 'react';

import { message, IMessage } from '@db/index';

export default function useChatMessage(cid?: string) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [messages, setMessages] = useState<IMessage[]>([]);

  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!cid) {
        setMessages([]);
        return;
      }

      const messages = await message.findMany(cid);
      setMessages(messages);
    } catch (error) {
      console.error('获取消息失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [cid]);

  const createMessage = async (data: IMessage) => {
    await message.create(data);
    // 创建消息后自动刷新
    await fetchMessages();
  };

  const deleteMessage = async (cid: string, mid: string) => {
    await message.delete(cid, mid);
    // 删除消息后自动刷新
    await fetchMessages();
  };

  const deleteMessages = async (cid: string) => {
    await message.deleteMany(cid);
    // 删除消息后自动刷新
    await fetchMessages();
  };

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // // 定期刷新消息（每30秒检查一次，避免频繁覆盖实时消息）
  // useEffect(() => {
  //   if (!cid) return;

  //   const interval = setInterval(() => {
  //     fetchMessages();
  //   }, 5000); // 改为30秒

  //   return () => clearInterval(interval);
  // }, [cid, fetchMessages]);

  return {
    isLoading,
    messages,
    fetchMessages,
    createMessage,
    deleteMessage,
    deleteMessages,
  };
}
