import { useState, useCallback, useEffect, useRef } from 'react';
import { chat } from '@libs/request';
import { nanoid } from 'nanoid';
import { message, IMessage, ChatType, MessageType, chat as chatDB } from '@db/index';
import useChat from './useChat';
import useChatMessage from './useChatMessage';
import { usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from 'app/store/hooks';
import {
  updateChatCid,
  clearChatMessages,
  addChatMessage,
  removeLastChatMessage,
  removeChatMessageById,
  completeOrderProcessing,
  updateChatLoading,
} from 'app/store/reducers/userSlice';
import { useLocale } from 'next-intl';

interface Message {
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
}

interface ChatResponse {
  code: number;
  data: string;
  msg: string;
  result_type: string;
}

export function useChatApi() {
  const isLoading = useAppSelector((state) => state.userReducer?.isChatLoading);
  const cachedCid = useAppSelector((state) => state.userReducer?.chat_cid);
  const messages = useAppSelector((state) => state.userReducer?.chat_messages);
  const { createChat, refreshChats } = useChat();
  const { createMessage, deleteMessage } = useChatMessage(cachedCid || undefined);
  const pathname = usePathname();
  const locale = pathname.includes('/zh') ? 'zh' : 'en';
  const dispatch = useAppDispatch();
  const currentCidRef = useRef<string | null>(null);
  const isSendingCompletionRef = useRef(false);

  // 监听 cid 变化，当 cid 变化时清空消息列表
  useEffect(() => {
    // 只有当 cid 真正改变时才重置状态
    if (currentCidRef.current !== cachedCid) {
      console.log('cid变化检测:', {
        currentCid: currentCidRef.current,
        newCid: cachedCid,
        willClearMessages: currentCidRef.current !== null && cachedCid !== null,
      });

      // 只有在切换到不同对话时才清空消息
      if (currentCidRef.current !== null && cachedCid !== null) {
        console.log('清空消息列表，切换到不同对话');
        dispatch(clearChatMessages());
      }

      // 清空所有订单相关的sessionStorage缓存
      const currentPayingAction = sessionStorage.getItem('currentPayingAction');
      if (currentPayingAction) {
        console.log('切换对话时清空支付相关缓存:', currentPayingAction);
        sessionStorage.removeItem('currentPayingAction');
        sessionStorage.removeItem(`payment_${currentPayingAction}`);
      }

      // 清空所有以payment_开头的sessionStorage项
      const keys = Object.keys(sessionStorage);
      keys.forEach((key) => {
        if (key.startsWith('payment_')) {
          sessionStorage.removeItem(key);
        }
      });

      // 判断是否是创建新对话的情况
      const isCreatingNewChat = currentCidRef.current === null && cachedCid !== null;

      currentCidRef.current = cachedCid || null;

      // 只有在以下情况才重置加载状态：
      // 1. 从一个cid切换到另一个cid（切换现有对话）
      // 2. 从cid变为null（进入新对话页面）
      // 不重置的情况：从null变为新cid（创建新对话）
      if (!isCreatingNewChat) {
        dispatch(updateChatLoading(false)); // 重置加载状态
        dispatch(completeOrderProcessing()); // 重置订单处理状态
        console.log('切换对话时重置订单处理状态');
      }
    }
  }, [cachedCid, dispatch]);

  const sendMessage = useCallback(
    async (content: string) => {
      try {
        dispatch(updateChatLoading(true));
        let messageCid = cachedCid;
        const timestamp = Date.now();

        // 生成消息ID
        const userMid = nanoid();
        const assistantMid = nanoid();

        // 添加用户消息
        const userMessage = {
          role: 'user' as const,
          content,
          mid: userMid,
          result_type: 'str',
          timestamp,
        };

        // 如果没有 cid，创建新对话
        if (!messageCid) {
          // 使用用户的第一条消息作为标题，如果超过20个字符则截断
          const title = content.length > 20 ? content.slice(0, 20) + '...' : content;
          messageCid = await createChat(title, ChatType.CHAT);
          // 更新当前对话的 cid（先更新ref，避免触发clearChatMessages）
          currentCidRef.current = messageCid;
          // 更新 Redux store 中的 chat_cid
          dispatch(updateChatCid(messageCid));
        }

        // 立即添加用户消息到 Redux（优先显示）
        dispatch(addChatMessage(userMessage));
        console.log('已添加用户消息到Redux:', userMessage);

        // 存储用户消息到数据库（异步操作）
        createMessage({
          cid: messageCid,
          mid: userMid,
          type: MessageType.USER,
          chatType: ChatType.CHAT,
          content,
          result_type: 'str',
          timestamp,
        }).catch((error) => {
          console.error('存储用户消息到数据库失败:', error);
        });

        // 更新对话的更新时间（异步操作）
        chatDB
          .update(messageCid, {
            updatedAt: timestamp,
          })
          .catch((error) => {
            console.error('更新对话时间失败:', error);
          });

        // 立即刷新聊天列表，确保时间显示更新
        refreshChats();

        // 调用聊天接口，添加超时处理
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        // 获取历史消息（最近11条），过滤掉失败的action消息
        const allMessages = messages || [];
        const processedHistoryMessages = allMessages
          .slice(-11) // 取最近11条历史消息
          .filter((msg) => {
            // 过滤掉已经失败的action消息
            if (msg.result_type === 'action') {
              // 检查是否有对应的timeout错误消息
              const hasTimeoutError = allMessages.some(
                (errorMsg) =>
                  errorMsg.result_type === 'timeout' &&
                  errorMsg.content &&
                  typeof errorMsg.content === 'object' &&
                  (errorMsg.content as any).retryData &&
                  (errorMsg.content as any).retryData.retryAction &&
                  (errorMsg.content as any).retryData.retryAction.actionId === msg.mid
              );

              if (hasTimeoutError) {
                console.log('过滤掉失败的action消息:', msg.mid);
                return false;
              }
            }
            return true;
          })
          .map((msg) => {
            // 如果是dict类型的消息，替换content为字符串
            if (msg.result_type !== 'str') {
              return {
                ...msg,
                content: 'ok',
              };
            }
            return msg;
          })
          .concat([userMessage]); // 加上当前用户消息，总共20条

        try {
          const response: any = await chat(
            {
              messages: processedHistoryMessages,
              language: locale,
            },
            controller.signal
          );

          clearTimeout(timeoutId);

          // 检查是否已经切换到其他对话
          if (currentCidRef.current !== messageCid) {
            dispatch(updateChatLoading(false)); // 如果已切换对话，重置加载状态
            return;
          }

          if (response.code === 200) {
            // 添加助手消息
            const assistantMessage = {
              role: 'assistant' as const,
              content: response.data,
              mid: assistantMid,
              result_type: response.result_type,
              timestamp: timestamp + 1,
            };

            // 立即添加助手消息到 Redux（优先显示）
            dispatch(addChatMessage(assistantMessage));
            console.log('已添加助手消息到Redux:', assistantMessage);

            // 存储助手消息到数据库（异步操作）
            let dbContent = response.data;
            // 对于action类型，需要序列化为字符串存储
            if (response.result_type === 'action' && typeof response.data === 'object') {
              dbContent = JSON.stringify(response.data);
            }

            createMessage({
              cid: messageCid,
              mid: assistantMid,
              type: MessageType.AGENT,
              chatType: ChatType.CHAT,
              content: dbContent,
              result_type: response.result_type,
              timestamp: timestamp + 1,
            }).catch((error) => {
              console.error('存储助手消息到数据库失败:', error);
            });

            // 再次检查是否已经切换到其他对话
            if (currentCidRef.current !== messageCid) {
              dispatch(updateChatLoading(false)); // 如果已切换对话，重置加载状态
              return;
            }

            // 再次刷新聊天列表，确保时间显示更新
            refreshChats();
          }
        } catch (error) {
          clearTimeout(timeoutId);

          // 检查是否是超时错误
          if (error.name === 'AbortError' || error.message.includes('timeout')) {
            // 发送超时消息
            const timeoutMessage = {
              role: 'assistant' as const,
              content: {
                type: 'timeout' as const,
                message: '请求超时，请稍后重试',
                retryData: {
                  userMessage,
                  messageCid,
                  userMid,
                  assistantMid,
                  timestamp,
                  locale,
                },
              },
              mid: assistantMid,
              result_type: 'timeout',
              timestamp: timestamp + 1,
            };

            // 立即添加超时消息到 Redux（优先显示）
            dispatch(addChatMessage(timeoutMessage));

            // 存储超时消息到数据库（异步操作）
            createMessage({
              cid: messageCid,
              mid: assistantMid,
              type: MessageType.AGENT,
              chatType: ChatType.CHAT,
              content: JSON.stringify(timeoutMessage.content),
              result_type: 'timeout',
              timestamp: timestamp + 1,
            }).catch((error) => {
              console.error('存储超时消息到数据库失败:', error);
            });

            // 检查是否已经切换到其他对话
            if (currentCidRef.current !== messageCid) {
              dispatch(updateChatLoading(false));
              return;
            }

            // 刷新聊天列表
            refreshChats();
          } else {
            // 发送错误消息，使用error.message的内容，触发重试UI
            const errorMessage = {
              role: 'assistant' as const,
              content: {
                type: 'timeout' as const, // 复用timeout类型以使用现有的重试UI
                message: error?.message || '发送消息失败，请稍后重试',
                retryData: {
                  userMessage,
                  messageCid,
                  userMid,
                  assistantMid,
                  timestamp,
                  locale,
                  // 添加标记表示这是发送失败的重试
                  retryAction: {
                    type: 'sendMessage',
                    originalError: error?.message || '发送消息失败',
                  },
                },
              },
              mid: assistantMid,
              result_type: 'timeout',
              timestamp: timestamp + 1,
            };

            // 立即添加错误消息到 Redux（优先显示）
            dispatch(addChatMessage(errorMessage));

            // 存储错误消息到数据库（异步操作）
            createMessage({
              cid: messageCid,
              mid: assistantMid,
              type: MessageType.AGENT,
              chatType: ChatType.CHAT,
              content: JSON.stringify(errorMessage.content),
              result_type: 'timeout',
              timestamp: timestamp + 1,
            }).catch((dbError) => {
              console.error('存储错误消息到数据库失败:', dbError);
            });

            // 检查是否已经切换到其他对话
            if (currentCidRef.current !== messageCid) {
              dispatch(updateChatLoading(false));
              return;
            }

            // 刷新聊天列表
            refreshChats();
          }
        }
      } catch (error) {
        console.error('发送消息失败:', error);
        // 这里的错误主要是创建对话等初始化错误，已经在内层try-catch中处理API调用错误
      } finally {
        dispatch(updateChatLoading(false));
      }
    },
    [messages, cachedCid, dispatch, createChat, refreshChats, locale, createMessage, deleteMessage]
  );

  // 发送完成消息（不调用API，直接添加到对话中）
  const sendCompletionMessage = useCallback(
    async (content: string) => {
      // 防止重复调用
      if (isSendingCompletionRef.current) {
        console.log('sendCompletionMessage 正在执行中，跳过重复调用');
        return;
      }

      isSendingCompletionRef.current = true;

      try {
        let messageCid = cachedCid;
        const timestamp = Date.now();
        const assistantMid = nanoid();

        // 如果没有 cid，创建新对话
        if (!messageCid) {
          messageCid = await createChat('订单完成', ChatType.CHAT);
          dispatch(updateChatCid(messageCid));
          currentCidRef.current = messageCid;
        }

        // 添加助手消息
        const assistantMessage = {
          role: 'assistant' as const,
          content,
          mid: assistantMid,
          result_type: 'str',
          timestamp,
        };

        // 立即添加助手消息到 Redux（优先显示）
        dispatch(addChatMessage(assistantMessage));

        // 存储助手消息到数据库（异步操作）
        createMessage({
          cid: messageCid,
          mid: assistantMid,
          type: MessageType.AGENT,
          chatType: ChatType.CHAT,
          content,
          result_type: 'str',
          timestamp,
        }).catch((error) => {
          console.error('存储完成消息到数据库失败:', error);
        });

        // 更新对话的更新时间（异步操作）
        chatDB
          .update(messageCid, {
            updatedAt: timestamp,
          })
          .catch((error) => {
            console.error('更新对话时间失败:', error);
          });

        // 刷新聊天列表
        refreshChats();
      } catch (error) {
        console.error('发送完成消息失败:', error);
      } finally {
        isSendingCompletionRef.current = false;
      }
    },
    [cachedCid, createChat, dispatch, refreshChats, messages, createMessage]
  );

  // 重试消息（用于超时消息的重试）
  const retryMessage = useCallback(
    async (retryData: {
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
    }) => {
      try {
        dispatch(updateChatLoading(true));
        const { userMessage, messageCid, userMid, assistantMid, timestamp } = retryData;
        const newAssistantMid = nanoid();

        // 删除超时消息
        const currentMessages = messages || [];
        if (currentMessages.length > 0) {
          const lastMessage = currentMessages[currentMessages.length - 1];
          if (lastMessage.result_type === 'timeout') {
            dispatch(removeLastChatMessage());
            // 从数据库中删除超时消息
            if (lastMessage.mid) {
              await deleteMessage(messageCid, lastMessage.mid);
            }
          }
        }

        // 重新调用聊天接口
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

        // 获取历史消息（最近11条），过滤掉失败的action消息
        const retryAllMessages = messages || [];
        const processedHistoryMessages = retryAllMessages
          .slice(-11) // 取最近11条历史消息
          .filter((msg) => {
            // 过滤掉已经失败的action消息
            if (msg.result_type === 'action') {
              // 检查是否有对应的timeout错误消息
              const hasTimeoutError = retryAllMessages.some(
                (errorMsg) =>
                  errorMsg.result_type === 'timeout' &&
                  errorMsg.content &&
                  typeof errorMsg.content === 'object' &&
                  (errorMsg.content as any).retryData &&
                  (errorMsg.content as any).retryData.retryAction &&
                  (errorMsg.content as any).retryData.retryAction.actionId === msg.mid
              );

              if (hasTimeoutError) {
                console.log('重试时过滤掉失败的action消息:', msg.mid);
                return false;
              }
            }
            return true;
          })
          .map((msg) => {
            // 如果是dict类型的消息，替换content为字符串
            if (msg.result_type !== 'str') {
              return {
                ...msg,
                content: 'ok',
              };
            }
            return msg;
          })
          .concat([userMessage]);

        try {
          const response: any = await chat(
            {
              messages: processedHistoryMessages,
              language: retryData.locale,
            },
            controller.signal
          );

          clearTimeout(timeoutId);

          // 检查是否已经切换到其他对话
          if (currentCidRef.current !== messageCid) {
            dispatch(updateChatLoading(false));
            return;
          }

          if (response.code === 200) {
            // 添加助手消息
            const assistantMessage = {
              role: 'assistant' as const,
              content: response.data,
              mid: newAssistantMid,
              result_type: response.result_type,
              timestamp: Date.now(),
            };

            // 存储助手消息到数据库
            let dbContent = response.data;
            // 对于action类型，需要序列化为字符串存储
            if (response.result_type === 'action' && typeof response.data === 'object') {
              dbContent = JSON.stringify(response.data);
            }

            await createMessage({
              cid: messageCid,
              mid: newAssistantMid,
              type: MessageType.AGENT,
              chatType: ChatType.CHAT,
              content: dbContent,
              result_type: response.result_type,
              timestamp: Date.now(),
            });

            // 再次检查是否已经切换到其他对话
            if (currentCidRef.current !== messageCid) {
              dispatch(updateChatLoading(false));
              return;
            }

            // 添加助手消息到 Redux
            dispatch(addChatMessage(assistantMessage));

            // 刷新聊天列表
            refreshChats();
          }
        } catch (error) {
          clearTimeout(timeoutId);

          // 如果重试也超时，再次发送超时消息
          if (error.name === 'AbortError' || error.message.includes('timeout')) {
            const timeoutMessage = {
              role: 'assistant' as const,
              content: {
                type: 'timeout' as const,
                message: '重试失败，请求仍然超时',
                retryData: {
                  userMessage,
                  messageCid,
                  userMid,
                  assistantMid: newAssistantMid,
                  timestamp: Date.now(),
                  locale: retryData.locale,
                },
              },
              mid: newAssistantMid,
              result_type: 'timeout',
              timestamp: Date.now(),
            };

            // 存储超时消息到数据库
            await createMessage({
              cid: messageCid,
              mid: newAssistantMid,
              type: MessageType.AGENT,
              chatType: ChatType.CHAT,
              content: JSON.stringify(timeoutMessage.content),
              result_type: 'timeout',
              timestamp: Date.now(),
            });

            // 检查是否已经切换到其他对话
            if (currentCidRef.current !== messageCid) {
              dispatch(updateChatLoading(false));
              return;
            }

            // 添加超时消息到 Redux
            dispatch(addChatMessage(timeoutMessage));

            // 刷新聊天列表
            refreshChats();
          } else {
            throw error;
          }
        }
      } catch (error) {
        console.error('重试消息失败:', error);
      } finally {
        dispatch(updateChatLoading(false));
      }
    },
    [messages, dispatch, refreshChats, createMessage, deleteMessage]
  );

  // 更新action消息内容
  const updateActionMessage = useCallback(
    async (actionId: string, updatedContent: any) => {
      try {
        console.log('updateActionMessage被调用:', {
          actionId,
          cachedCid,
          updatedContentType: typeof updatedContent,
          updatedContent: updatedContent,
        });

        if (!cachedCid) {
          console.error('updateActionMessage: 没有cid');
          return false;
        }

        // 如果updatedContent为null，则删除消息
        if (updatedContent === null) {
          console.log('删除action消息:', actionId, 'cid:', cachedCid);

          // 首先从Redux中删除消息（立即生效）
          const currentMessages = messages || [];
          const filteredMessages = currentMessages.filter((msg) => msg.mid !== actionId);

          console.log('删除前Redux消息数量:', currentMessages.length);
          console.log('删除后Redux消息数量:', filteredMessages.length);

          // 使用更精确的删除方法，只删除指定的消息，不清空所有消息
          dispatch(removeChatMessageById(actionId));

          // 异步删除数据库中的消息
          try {
            // 验证消息是否存在于数据库中
            const existingMessage = await message.find(cachedCid, actionId);
            console.log('删除前验证，消息是否存在于数据库:', !!existingMessage);

            if (existingMessage) {
              // 从数据库中删除消息
              const deleteResult = await message.delete(cachedCid, actionId);
              console.log('数据库删除操作结果:', deleteResult);

              // 等待一小段时间确保异步操作完成
              await new Promise((resolve) => setTimeout(resolve, 100));

              // 验证删除后的状态
              const afterDeleteMessage = await message.find(cachedCid, actionId);
              console.log('删除后验证，消息是否仍存在于数据库:', !!afterDeleteMessage);

              if (afterDeleteMessage) {
                console.log('尝试再次删除数据库消息...');
                await message.delete(cachedCid, actionId);
              }
            }
          } catch (dbError) {
            console.error('删除数据库消息时出错:', dbError);
            // 即使数据库删除失败，Redux删除已经生效，继续执行
          }

          // 刷新聊天列表
          refreshChats();
          console.log('action消息删除完成');
          return true; // 返回true表示删除操作已执行
        }

        // 更新数据库中的消息内容
        // 对于action类型的消息，需要序列化为字符串存储
        const dbContent =
          typeof updatedContent === 'object' ? JSON.stringify(updatedContent) : updatedContent;
        console.log(
          '准备更新数据库，dbContent长度:',
          dbContent.length,
          '前100字符:',
          dbContent.substring(0, 100)
        );

        const updateResult = await message.update(cachedCid, actionId, {
          content: dbContent,
        });
        console.log('数据库更新结果:', updateResult);

        // 更新Redux中的消息
        const currentMessages = messages || [];
        console.log('当前Redux消息数量:', currentMessages.length);
        const updatedMessages = currentMessages.map((msg) => {
          if (msg.mid === actionId) {
            console.log(
              '找到要更新的消息，原内容类型:',
              typeof msg.content,
              '新内容类型:',
              typeof updatedContent
            );
            return {
              ...msg,
              content: updatedContent,
            };
          }
          return msg;
        });

        // 更新Redux状态
        dispatch(clearChatMessages());
        updatedMessages.forEach((msg) => {
          dispatch(addChatMessage(msg));
        });
        console.log('Redux状态更新完成');

        // 刷新聊天列表
        refreshChats();
        console.log('聊天列表刷新完成');
        return true;
      } catch (error) {
        console.error('更新action消息失败:', error);
        return false;
      }
    },
    [cachedCid, messages, dispatch, refreshChats]
  );

  // 停止当前action操作
  const stopCurrentAction = useCallback(async () => {
    try {
      if (!cachedCid || !messages) {
        console.log('没有当前对话或消息，无需停止action');
        return;
      }

      // 查找最后一个action消息
      const actionMessages = messages.filter((msg) => msg.result_type === 'action');
      if (actionMessages.length === 0) {
        console.log('没有找到action消息，无需停止');
        return;
      }

      const lastActionMessage = actionMessages[actionMessages.length - 1];
      console.log('找到最后一个action消息，准备停止:', lastActionMessage.mid);

      // 删除action消息
      await updateActionMessage(lastActionMessage.mid || '', null);

      // 发送停止消息
      await sendCompletionMessage('操作已被用户终止');

      console.log('action已成功停止');
    } catch (error) {
      console.error('停止action失败:', error);
      throw error;
    }
  }, [cachedCid, messages, updateActionMessage, sendCompletionMessage]);

  // 发送action消息（确保只有一个action在执行）
  const sendActionMessage = useCallback(
    async (actionContent: any) => {
      try {
        console.log('sendActionMessage被调用，准备清理现有action消息');

        // 1. 清理所有现有的action消息
        const currentMessages = messages || [];
        const actionMessages = currentMessages.filter((msg) => msg.result_type === 'action');

        console.log('找到现有action消息数量:', actionMessages.length);

        // 清理Redux中的action消息
        for (const actionMsg of actionMessages) {
          if (actionMsg.mid) {
            console.log('清理Redux中的action消息:', actionMsg.mid);
            dispatch(removeChatMessageById(actionMsg.mid));

            // 异步清理数据库中的action消息
            if (cachedCid) {
              try {
                await message.delete(cachedCid, actionMsg.mid);
                console.log('已从数据库删除action消息:', actionMsg.mid);
              } catch (dbError) {
                console.error('删除数据库action消息失败:', dbError);
              }
            }
          }
        }

        // 2. 创建新的action消息
        const actionMid = `action-${Date.now()}`;
        const timestamp = Date.now();

        const newActionMessage = {
          role: 'assistant' as const,
          content: actionContent,
          mid: actionMid,
          result_type: 'action',
          timestamp: timestamp,
        };

        console.log('创建新的action消息:', actionMid);

        // 3. 添加新的action消息到Redux
        dispatch(addChatMessage(newActionMessage));

        // 4. 保存到数据库
        if (cachedCid && createMessage) {
          try {
            const dbContent = JSON.stringify(actionContent);
            await createMessage({
              cid: cachedCid,
              mid: actionMid,
              type: MessageType.AGENT,
              chatType: ChatType.CHAT,
              content: dbContent,
              result_type: 'action',
              timestamp: timestamp,
            });
            console.log('新action消息已保存到数据库');
          } catch (dbError) {
            console.error('保存action消息到数据库失败:', dbError);
          }
        }

        // 5. 刷新聊天列表
        refreshChats();

        console.log('sendActionMessage完成，确保只有一个action在执行');
        return actionMid;
      } catch (error) {
        console.error('sendActionMessage失败:', error);
        throw error;
      }
    },
    [messages, cachedCid, dispatch, createMessage, refreshChats]
  );

  return {
    messages,
    isLoading,
    sendMessage,
    sendCompletionMessage,
    retryMessage,
    updateActionMessage,
    stopCurrentAction,
    sendActionMessage, // 添加新的方法到返回值
  };
}
