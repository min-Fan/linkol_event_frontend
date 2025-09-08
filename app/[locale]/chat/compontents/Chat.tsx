'use client';
import { AI, AITweet, Chat1, Chat2, SelectFile } from '@assets/svg';
import { Button } from '@shadcn/components/ui/button';
import { Textarea } from '@shadcn/components/ui/textarea';
import {
  ArrowUp,
  ArrowUpRight,
  CirclePause,
  CirclePower,
  FileQuestion,
  RefreshCw,
} from 'lucide-react';
import Image from 'next/image';
import avatar from '@assets/image/avatar.png';
import remarkGfm from 'remark-gfm';
import { Badge } from '@shadcn/components/ui/badge';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useChatApi } from '@hooks/useChatApi';
import { useState, useEffect, useMemo, useRef } from 'react';
import useChatMessage from '@hooks/useChatMessage';
import { MessageType, ChatType } from '@db/index';
import UserAvatar from '@ui/profile/components/UserAvatar';
import useUserInfo from '@hooks/useUserInfo';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from '@shadcn/components/ui/scroll-area';
import ChatKolList from './ChatKolList';
import ChatKolPackage from './ChatKolPackage';
import { useTranslations } from 'next-intl';
import ChatKeyword from './ChatKeyword';
import { cn } from '@shadcn/lib/utils';
import { useAppSelector, useAppDispatch } from 'app/store/hooks';
import {
  updateChatCid,
  completeOrderProcessing,
  addChatMessage,
  removeChatMessageById,
  updateChatLoading,
} from 'app/store/reducers/userSlice';
import ChatDoing, { ChatDoingRef } from './ChatDoing';

// 添加加载动画组件
export const LoadingDots = () => {
  return (
    <div className="flex items-center gap-1">
      <div
        className="h-2 w-2 animate-bounce rounded-full bg-[rgba(92,153,244,0.80)]"
        style={{ animationDelay: '0ms' }}
      ></div>
      <div
        className="h-2 w-2 animate-bounce rounded-full bg-[rgba(92,153,244,0.80)]"
        style={{ animationDelay: '150ms' }}
      ></div>
      <div
        className="h-2 w-2 animate-bounce rounded-full bg-[rgba(92,153,244,0.80)]"
        style={{ animationDelay: '300ms' }}
      ></div>
    </div>
  );
};

export default function Chat({ size = 'default' }: { size?: 'default' | 'sm' }) {
  const [inputMessage, setInputMessage] = useState('');
  const cid = useAppSelector((state) => state.userReducer?.chat_cid);
  const chatMessages = useAppSelector((state) => state.userReducer?.chat_messages) || [];
  const isOrderProcessing = useAppSelector((state) => state.userReducer?.isOrderProcessing);
  const { login, isLogin } = useUserInfo();
  const { sendMessage, retryMessage, sendCompletionMessage, sendActionMessage } = useChatApi();
  const isLoading = useAppSelector((state) => state.userReducer?.isChatLoading);
  const {
    messages: dbMessages,
    isLoading: isLoadingMessages,
    createMessage,
    deleteMessage,
  } = useChatMessage(cid || undefined);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatDoingRef = useRef<ChatDoingRef>(null);
  const chatDoingRefsMap = useRef<Map<string, ChatDoingRef>>(new Map());
  const sendMessageRef = useRef(sendMessage);
  const [isComposing, setIsComposing] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isSwitchingChat, setIsSwitchingChat] = useState(false); // 添加切换对话状态
  const [lastCid, setLastCid] = useState<string | null>(null); // 记录上一次的cid
  const t = useTranslations('common');
  const dispatch = useAppDispatch();
  const { username } = useUserInfo();

  // 更新sendMessage的ref
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  // 检查是否应该禁用输入框
  const isInputDisabled = isLoading || isOrderProcessing;

  // 初始化新对话时清除可能的状态问题
  useEffect(() => {
    if (!cid && isOrderProcessing) {
      // 新对话时清除订单处理状态
      dispatch(completeOrderProcessing());
    }
  }, [cid, isOrderProcessing, dispatch]);

  // 进入聊天页面时检查状态一致性
  useEffect(() => {
    // 检查消息和状态的一致性
    const hasActionMessage = chatMessages.some((msg) => msg.result_type === 'action');
    const hasDbActionMessage = dbMessages.some((msg) => msg.result_type === 'action');

    console.log('Chat组件状态检查:', {
      isOrderProcessing,
      hasActionMessage,
      hasDbActionMessage,
      chatMessagesCount: chatMessages.length,
      dbMessagesCount: dbMessages.length,
    });

    // 只有在以下情况下才清空订单状态：
    // 1. 当前正在处理订单
    // 2. 实时消息中没有action消息
    // 3. 数据库消息中也没有action消息
    if (isOrderProcessing && !hasActionMessage && !hasDbActionMessage) {
      console.log('没有发现action消息，清空订单处理状态');
      dispatch(completeOrderProcessing());
    }
  }, [isOrderProcessing, chatMessages, dbMessages]); // 监听相关状态变化

  // 添加自动调整高度的函数
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = '24px'; // 重置高度
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, 24), 160);
      textarea.style.height = `${newHeight}px`;
    }
  };

  // 监听输入变化，调整高度
  useEffect(() => {
    adjustTextareaHeight();
  }, [inputMessage]);

  // 合并实时消息和数据库消息
  const messages = useMemo(() => {
    console.log('messages useMemo 重新计算，触发原因:', {
      chatMessagesLength: chatMessages.length,
      dbMessagesLength: dbMessages.length,
      cid,
      chatMessagesIds: chatMessages.map((m) => m.mid),
    });

    if (!cid) {
      // 如果是新对话（cid为null），添加欢迎消息
      const welcomeMessage = {
        role: 'assistant' as const,
        content: t('chat_welcome_msg'),
        result_type: 'str' as const,
        timestamp: Date.now(),
        mid: 'welcome-message',
      };

      // 如果有实时消息，合并欢迎消息和实时消息
      if (chatMessages.length > 0) {
        const result = [welcomeMessage, ...chatMessages];
        console.log('新对话返回消息数量:', result.length);
        return result;
      }

      // 否则只返回欢迎消息
      console.log('新对话返回欢迎消息');
      return [welcomeMessage];
    }

    // 合并消息，实时消息绝对优先
    const messageMap = new Map();

    // 创建实时消息ID的Set，用于快速查找
    const realtimeMessageIds = new Set(chatMessages.map((msg) => msg.mid));

    // 先添加所有数据库消息作为基础
    dbMessages.forEach((msg) => {
      let content = msg.content;

      // 特别处理action和timeout类型的消息，确保content格式正确
      if (msg.result_type === 'action' || msg.result_type === 'timeout') {
        try {
          // 如果content是字符串，尝试解析为对象
          if (typeof content === 'string') {
            content = JSON.parse(content);
          }
        } catch (error) {
          console.error(`解析${msg.result_type}消息content失败:`, error);
          // 如果解析失败，跳过这条消息
          return;
        }
      }

      messageMap.set(msg.mid, {
        role: msg.type === MessageType.USER ? 'user' : 'assistant',
        content: content,
        result_type: msg.result_type,
        timestamp: msg.timestamp,
        mid: msg.mid,
        source: 'database', // 标记来源
      });
    });

    // 添加实时消息，实时消息会完全覆盖数据库消息
    chatMessages.forEach((msg) => {
      messageMap.set(msg.mid, {
        ...msg,
        // 保持原始时间戳，不重新设置
        timestamp: msg.timestamp || Date.now(),
        source: 'realtime', // 标记来源
      });
    });

    // 处理消息删除逻辑
    // 实时消息优先原则：如果某个消息在实时消息中存在，以实时消息为准
    // 如果某个消息在数据库中存在但不在实时消息中，需要判断是否被删除
    let finalMessages = Array.from(messageMap.values());

    if (chatMessages.length > 0) {
      // 检查数据库中是否有消息在实时消息中不存在
      const dbOnlyMessages = dbMessages.filter((dbMsg) => !realtimeMessageIds.has(dbMsg.mid));

      if (dbOnlyMessages.length > 0) {
        console.log(
          '检测到数据库独有的消息:',
          dbOnlyMessages.map((m) => m.mid)
        );

        // 判断逻辑：
        // 1. 如果实时消息中有错误/超时消息，说明可能是删除后的错误处理，保留数据库消息
        // 2. 如果实时消息最后一条是timeout类型且包含retryAction，说明是action被删除了
        const hasTimeoutMessage = chatMessages.some((msg) => msg.result_type === 'timeout');
        const lastRealtimeMessage = chatMessages[chatMessages.length - 1];
        const isActionDeleted =
          lastRealtimeMessage &&
          lastRealtimeMessage.result_type === 'timeout' &&
          typeof lastRealtimeMessage.content === 'object' &&
          lastRealtimeMessage.content.retryData &&
          (lastRealtimeMessage.content.retryData as any).retryAction;

        if (isActionDeleted) {
          // 如果检测到action被删除，过滤掉相关的action消息
          console.log('检测到action删除操作，过滤被删除的action消息');
          finalMessages = finalMessages.filter((msg) => {
            if (
              msg.source === 'database' &&
              !realtimeMessageIds.has(msg.mid) &&
              msg.result_type === 'action'
            ) {
              console.log('过滤掉被删除的action消息:', msg.mid);
              return false;
            }
            return true;
          });
        } else if (!hasTimeoutMessage) {
          // 如果没有timeout消息，可能是正常的新消息发送，保留所有历史消息
          console.log('正常发送新消息，保留所有历史消息');
        }
      }
    }

    // 转换为数组并按时间戳排序
    const sortedMessages = finalMessages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    // 调试日志
    console.log('消息合并结果:', {
      dbMessagesCount: dbMessages.length,
      chatMessagesCount: chatMessages.length,
      mergedMessagesCount: sortedMessages.length,
      realtimeMessageIds: Array.from(realtimeMessageIds),
      hasActionMessage: sortedMessages.some((msg) => msg.result_type === 'action'),
      hasUserMessage: sortedMessages.some((msg) => msg.role === 'user'),
      realtimeMessagesCount: sortedMessages.filter((msg) => msg.source === 'realtime').length,
      databaseMessagesCount: sortedMessages.filter((msg) => msg.source === 'database').length,
    });

    console.log('messages useMemo 最终返回:', {
      messagesCount: sortedMessages.length,
      messageIds: sortedMessages.map((m) => m.mid),
    });

    return sortedMessages;
  }, [chatMessages, dbMessages, cid, t]);

  // 监听发送消息后的滚动
  useEffect(() => {
    if (isLoading || (chatMessages.length > 0 && messages.length > 0)) {
      // 在发送消息或接收响应时滚动到底部
      scrollToBottom(true);
    }
  }, [isLoading, chatMessages.length]);

  // 监听消息列表变化，确保切换对话后滚动到底部
  useEffect(() => {
    if (messages.length > 0) {
      // 延迟滚动，确保DOM渲染完成
      setTimeout(() => {
        scrollToBottom(false);
      }, 100);
    }
  }, [messages.length, cid]);

  // 监听 cid 变化，直接滚动到底部
  useEffect(() => {
    // 检查是否真的切换了对话
    if (lastCid !== cid) {
      console.log('检测到对话切换，从', lastCid, '切换到', cid);
      setIsSwitchingChat(true); // 设置切换状态
      setLastCid(cid || null); // 更新记录的cid，处理undefined情况
    }

    // 清空ChatDoing组件的refs map
    chatDoingRefsMap.current.clear();

    if (cid) {
      // 切换到有cid的对话时，重置初始化状态
      setHasInitialized(true);
      dispatch(completeOrderProcessing());

      // 不立即滚动，等待消息合并完成

      // 检查是否有待发送的消息
      const pendingMessage = sessionStorage.getItem('pendingMessage');
      if (pendingMessage) {
        // 清除待发送消息（立即清除避免重复处理）
        sessionStorage.removeItem('pendingMessage');

        // 立即显示 loading 状态
        dispatch(updateChatLoading(true));

        // 延迟发送消息，确保界面准备就绪
        setTimeout(() => {
          setInputMessage(pendingMessage);
          // 再延迟一点发送消息
          setTimeout(() => {
            sendMessageRef.current(pendingMessage);
            setInputMessage('');
          }, 100);
        }, 200);
      }
    } else {
      // 如果是新对话，只在第一次时重置输入框
      if (!hasInitialized) {
        setInputMessage('');
        setHasInitialized(true);
      }

      // 检查是否有待发送的消息（新对话情况）
      const pendingMessage = sessionStorage.getItem('pendingMessage');
      if (pendingMessage) {
        // 清除待发送消息
        sessionStorage.removeItem('pendingMessage');

        // 立即显示 loading 状态和消息
        dispatch(updateChatLoading(true));
        setInputMessage(pendingMessage);

        // 延迟发送消息，确保界面准备就绪
        setTimeout(() => {
          sendMessageRef.current(pendingMessage);
          setInputMessage('');
        }, 300);
      }
    }
  }, [cid]);

  // 监听消息合并完成，清除切换状态
  useEffect(() => {
    if (isSwitchingChat && messages.length >= 0) {
      // 等待一小段时间确保DOM渲染完成
      setTimeout(() => {
        setIsSwitchingChat(false);
        console.log('消息合并完成，清除切换状态');
        // 延迟滚动到底部，确保消息渲染完成
        setTimeout(() => {
          scrollToBottom(false);
        }, 50);
      }, 200);
    }
  }, [messages, isSwitchingChat]);

  // 当发送第一条消息时，会创建新的对话，此时需要更新 cid
  useEffect(() => {
    if (chatMessages.length > 0 && !cid) {
      // 从最新的消息中获取 cid
      const lastMessage = dbMessages[dbMessages.length - 1];
      if (lastMessage) {
        dispatch(updateChatCid(lastMessage.cid));
      }
    }
  }, [chatMessages, dbMessages, cid]);

  // 滚动到底部的函数
  const scrollToBottom = (smooth = true) => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current;
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  const pauseAction = async () => {
    console.log('开始暂停操作');

    // 从消息中找到最新的action消息
    const actionMessages = messages.filter((msg) => msg.result_type === 'action');
    const latestActionMessage = actionMessages[actionMessages.length - 1];

    if (latestActionMessage && latestActionMessage.mid) {
      const actionRef = chatDoingRefsMap.current.get(latestActionMessage.mid);
      if (actionRef) {
        console.log(`通过actionId ${latestActionMessage.mid} 找到对应的ref，执行暂停`);
        await actionRef.handleStepError(null, t('user_pause'), t('operation_cancelled_by_user'));
        return;
      } else {
        console.log(`actionId ${latestActionMessage.mid} 对应的ref不存在`);
      }
    }
  };

  const handleRetryAction = async (retryActionData: any) => {
    try {
      console.log('重试操作:', retryActionData);

      if (retryActionData.type === 'sendMessage') {
        // 重试发送消息操作 - 直接调用retryMessage
        console.log(t('retry_send_message'));
        // 这种情况下，retryActionData是嵌套在retryData中的，需要使用完整的retryData
        // 这里不需要特殊处理，会在onClick中直接调用retryMessage
      } else {
        // 重试action操作 - 恢复之前的执行状态
        const actionMid = `retry-action-${Date.now()}`;
        const timestamp = Date.now();

        // 创建包含恢复状态的action内容
        const actionContentWithState = {
          ...retryActionData.actionData,
          // 添加状态恢复标记
          isRetry: true,
          retryExecutionState: retryActionData.executionState,
        };

        const newActionMessage = {
          role: 'assistant' as const,
          content: actionContentWithState,
          mid: actionMid,
          result_type: 'action',
          timestamp: timestamp,
        };

        // 使用sendActionMessage确保只有一个action在执行
        await sendActionMessage(actionContentWithState);
        console.log('重试action消息已通过sendActionMessage发送，包含状态恢复信息');
      }
    } catch (error) {
      console.error('重试操作失败:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || isOrderProcessing) return;

    try {
      sendMessage(inputMessage);
      setInputMessage('');
    } catch (error) {
      console.error('发送消息失败:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="box-border flex h-full w-full flex-col">
      <div className="min-h-0 flex-1">
        <div
          ref={scrollRef}
          className={cn(
            'hover:[&::-webkit-scrollbar-thumb]:bg-primary/20 h-full overflow-y-auto px-2 pt-6 sm:px-20 [&::-webkit-scrollbar]:w-1 hover:[&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent',
            size === 'sm' && '!px-2'
          )}
        >
          {isSwitchingChat ? (
            // 切换对话时显示加载状态
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center justify-center text-center">
                <LoadingDots />
                <p className="text-muted-foreground mt-2 text-sm">{t('loading_messages')}</p>
              </div>
            </div>
          ) : (
            // 正常显示消息列表
            <>
              {messages.map((msg) => {
                return (
                  <div
                    key={msg.mid}
                    className={`mb-4 flex flex-row gap-1 ${msg.role === 'user' ? 'justify-end pl-4' : 'pr-4'}`}
                  >
                    {msg.role === 'assistant' && size === 'default' && (
                      <div className="hidden size-6 min-w-6 items-center justify-center overflow-hidden rounded-full bg-[rgba(92,153,244,0.80)] sm:flex">
                        <AI className="size-4" />
                      </div>
                    )}
                    <div
                      className={cn(
                        'text-md box-border inline-block w-full max-w-[100%] rounded-md',
                        msg.role === 'user' && 'bg-muted-foreground/5 w-fit'
                      )}
                    >
                      {msg.result_type === 'action' && (
                        <ChatDoing
                          ref={(ref) => {
                            // 将每个ChatDoing组件的ref存储到map中
                            if (ref && msg.mid) {
                              chatDoingRefsMap.current.set(msg.mid, ref);
                            } else if (!ref && msg.mid) {
                              // 组件卸载时从map中移除
                              chatDoingRefsMap.current.delete(msg.mid);
                            }

                            // 同时保持对最新组件的引用（向后兼容）
                            if (ref) {
                              chatDoingRef.current = ref;
                            }
                          }}
                          data={msg.content}
                          actionId={msg.mid}
                          messages={messages}
                        />
                      )}
                      {msg.result_type === 'timeout' &&
                        (() => {
                          const isErrorMessage =
                            typeof msg.content === 'object' &&
                            msg.content.retryData &&
                            msg.content.retryData.retryAction;

                          return (
                            <div
                              className={cn(
                                'rounded-lg border p-2',
                                isErrorMessage
                                  ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                                  : 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
                              )}
                            >
                              <div className="flex w-full items-center gap-3">
                                <div className="flex-shrink-0">
                                  <div
                                    className={cn(
                                      'flex h-6 w-6 items-center justify-center rounded-full',
                                      isErrorMessage
                                        ? 'bg-red-100 dark:bg-red-900/40'
                                        : 'bg-yellow-100 dark:bg-yellow-900/40'
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        'text-sm font-semibold',
                                        isErrorMessage
                                          ? 'text-red-600 dark:text-red-300'
                                          : 'text-yellow-600'
                                      )}
                                    >
                                      {isErrorMessage ? '✕' : '!'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-1 flex-wrap items-center gap-2">
                                  <p
                                    className={cn(
                                      'word-break overflow-wrap-anywhere min-w-0 flex-1 font-medium break-words',
                                      isErrorMessage
                                        ? 'text-red-800 dark:text-red-200'
                                        : 'text-yellow-800 dark:text-yellow-200'
                                    )}
                                    style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                                  >
                                    {typeof msg.content === 'object' &&
                                    msg.content.type === 'timeout'
                                      ? msg.content.message
                                      : t('request_timeout_retry')}
                                  </p>
                                  {typeof msg.content === 'object' &&
                                    msg.content.type === 'timeout' && (
                                      <>
                                        {msg.content.retryData.retryAction.stepName ===
                                          'not_logged_in' && !isLogin ? (
                                          <Button
                                            size="sm"
                                            onClick={() => {
                                              login();
                                            }}
                                          >
                                            {t('btn_log_in')}
                                          </Button>
                                        ) : (
                                          <Button
                                            onClick={async () => {
                                              // 先删除当前的错误/超时消息（同时删除Redux和数据库）
                                              if (msg.mid) {
                                                console.log('开始删除消息:', msg.mid);

                                                // 从Redux中删除（立即生效）
                                                dispatch(removeChatMessageById(msg.mid));
                                                console.log('已从Redux删除消息:', msg.mid);

                                                // 异步删除数据库中的消息，不阻塞重试逻辑
                                                if (cid && deleteMessage) {
                                                  deleteMessage(cid, msg.mid)
                                                    .then(() => {
                                                      console.log(
                                                        '已从数据库删除错误消息:',
                                                        msg.mid
                                                      );
                                                    })
                                                    .catch((error) => {
                                                      console.error(
                                                        '删除数据库错误消息失败:',
                                                        error
                                                      );
                                                    });
                                                }

                                                // 使用 setTimeout 确保 Redux 状态更新和 DOM 重新渲染完成后再执行重试
                                                setTimeout(() => {
                                                  // 然后执行重试逻辑
                                                  if (
                                                    isErrorMessage &&
                                                    msg.content.retryData.retryAction
                                                  ) {
                                                    // 检查是发送消息失败还是action操作失败
                                                    if (
                                                      msg.content.retryData.retryAction.type ===
                                                      'sendMessage'
                                                    ) {
                                                      // 发送消息失败的重试 - 重新发送原始用户消息
                                                      const originalUserMessage =
                                                        msg.content.retryData.userMessage;
                                                      if (
                                                        originalUserMessage &&
                                                        originalUserMessage.content
                                                      ) {
                                                        console.log(
                                                          '重新发送用户消息:',
                                                          originalUserMessage.content
                                                        );
                                                        sendMessage(originalUserMessage.content);
                                                      }
                                                    } else {
                                                      // action操作失败的重试
                                                      handleRetryAction(
                                                        msg.content.retryData.retryAction
                                                      );
                                                    }
                                                  } else {
                                                    // 普通超时消息重试
                                                    retryMessage(msg.content.retryData);
                                                  }
                                                }, 100); // 给 React 100ms 时间完成重新渲染
                                              }
                                            }}
                                            disabled={isLoading || isOrderProcessing}
                                            variant="outline"
                                            size="sm"
                                            className={cn(
                                              isErrorMessage
                                                ? 'border-red-300 bg-red-400 text-red-700 hover:bg-red-200 dark:border-red-700 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60'
                                                : 'border-yellow-300 bg-yellow-400 text-yellow-700 hover:bg-yellow-200 dark:border-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 dark:hover:bg-yellow-900/60'
                                            )}
                                          >
                                            <RefreshCw className={cn('mr-2 h-4 w-4')} />
                                            {t('btn_retry')}
                                          </Button>
                                        )}
                                      </>
                                    )}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      {msg.result_type === 'str' && (
                        <div className="space-y-2 p-2">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({ node, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '');
                                return match ? (
                                  <SyntaxHighlighter style={dracula} language={match[1]} {...props}>
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                ) : (
                                  <code
                                    className={cn('break-words whitespace-pre-wrap', className)}
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                );
                              },
                              p: ({ children }) => (
                                <p className="break-words whitespace-pre-wrap">{children}</p>
                              ),
                              ul: ({ children }) => <ul className="space-y-2">{children}</ul>,
                              ol: ({ children }) => <ol className="space-y-2">{children}</ol>,
                            }}
                          >
                            {typeof msg.content === 'string' ? msg.content : ''}
                          </ReactMarkdown>
                        </div>
                      )}
                      {msg.result_type === 'dict' && msg.content.data_type === 'simple' && (
                        <div className="p-2">
                          <ChatKolList data={msg.content} size={size} />
                        </div>
                      )}
                      {msg.result_type === 'dict' && msg.content.data_type === 'package' && (
                        <div className="p-2">
                          <ChatKolPackage data={msg.content} size={size} />
                        </div>
                      )}
                    </div>
                    {msg.role === 'user' && size === 'default' && (
                      <div className="hidden size-6 min-w-6 items-center justify-center overflow-hidden rounded-full bg-[rgba(92,153,244,0.80)] sm:flex">
                        <UserAvatar className="size-6" username={username} />
                      </div>
                    )}
                  </div>
                );
              })}
              {isLoading && (
                <div className="mb-4 flex flex-row items-center gap-1">
                  {size === 'default' && (
                    <div className="hidden h-6 min-h-6 w-6 min-w-6 items-center justify-center overflow-hidden rounded-full bg-[rgba(92,153,244,0.80)] sm:flex">
                      <AI className="size-4 min-h-4 min-w-4"></AI>
                    </div>
                  )}
                  <div className="text-md box-border inline-block rounded-[12px] px-3">
                    <LoadingDots />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className={cn('mt-auto px-2 pb-2 sm:px-20', size === 'sm' && '!px-2')}>
        <ChatKeyword />

        <div className="border-primary/20 focus-within:border-primary/80 dark:border-primary/20 bg-background relative box-border space-y-1 rounded-xl border p-2">
          <Textarea
            ref={textareaRef}
            className="!text-md m-0 min-h-6 border-0 !bg-transparent p-0"
            rows={1}
            placeholder={t('chat_placeholder')}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            disabled={isInputDisabled}
          />

          <div className="absolute right-2 bottom-2">
            {isOrderProcessing ? (
              <Button
                className="!bg-primary hover:bg-primary/80 dark:bg-primary/40 dark:text-primary-foreground dark:hover:bg-primary/60 ml-auto h-6 max-h-6 min-h-6 w-6 max-w-6 min-w-6 !px-4"
                onClick={pauseAction}
              >
                <div className="h-3 min-h-3 w-3 min-w-3 rounded-xs bg-white"></div>
              </Button>
            ) : (
              <Button
                className={cn('ml-auto h-6 max-h-6 min-h-6 w-6 max-w-6 min-w-6 !px-4')}
                disabled={isInputDisabled || !inputMessage.trim()}
                onClick={handleSendMessage}
              >
                <ArrowUp className="size-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="text-muted-foreground mt-1 text-center text-xs">
          <span>{t('chat_content_by_ai')}</span>
        </div>
      </div>
    </div>
  );
}
