import { AI, AITweet, Chat1, Chat2, SelectFile } from '@assets/svg';
import { Button } from '@shadcn/components/ui/button';
import { Textarea } from '@shadcn/components/ui/textarea';
import { ArrowUpRight, FileQuestion } from 'lucide-react';
import Image from 'next/image';
import avatar from '@assets/image/avatar.png';
import remarkGfm from 'remark-gfm';
import { Badge } from '@shadcn/components/ui/badge';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useChatApi } from '@hooks/useChatApi';
import { useState, useEffect, useMemo, useRef } from 'react';
import useChatMessage from '@hooks/useChatMessage';
import { MessageType } from '@db/index';
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
import { updateChatCid } from 'app/store/reducers/userSlice';

// 添加加载动画组件
const LoadingDots = () => {
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

export default function Chat() {
  const [inputMessage, setInputMessage] = useState('');
  const cid = useAppSelector((state) => state.userReducer?.chat_cid);
  const chatMessages = useAppSelector((state) => state.userReducer?.chat_messages) || [];
  const { username } = useUserInfo();
  const { sendMessage, isLoading } = useChatApi();
  const { messages: dbMessages, isLoading: isLoadingMessages } = useChatMessage(cid || undefined);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const t = useTranslations('common');
  const dispatch = useAppDispatch();

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
    if (!cid) {
      return chatMessages.length == 0
        ? [
            {
              role: 'assistant',
              content: t('chat_welcome_msg'),
              result_type: 'str',
              timestamp: Date.now(),
              mid: -1,
            },
          ]
        : chatMessages;
    }

    // 如果数据库消息为空，使用实时消息
    if (dbMessages.length === 0) {
      return chatMessages;
    }

    // 合并消息，确保不重复
    const messageMap = new Map();

    // 先添加数据库消息
    dbMessages.forEach((msg) => {
      messageMap.set(msg.mid, {
        role: msg.type === MessageType.USER ? 'user' : 'assistant',
        content: msg.content,
        result_type: msg.result_type,
        timestamp: msg.timestamp,
        mid: msg.mid,
      });
    });

    // 添加实时消息（如果有的话）
    chatMessages.forEach((msg) => {
      if (!messageMap.has(msg.mid)) {
        messageMap.set(msg.mid, {
          ...msg,
          timestamp: Date.now(),
        });
      }
    });

    // 转换为数组并按时间戳排序
    return Array.from(messageMap.values()).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  }, [chatMessages, dbMessages, cid]);

  // 监听消息变化，自动滚动到底部
  useEffect(() => {
    if (messages.length > 0) {
      // 如果是新消息，使用平滑滚动
      const isNewMessage = messages[messages.length - 1].role === 'assistant';
      scrollToBottom(isNewMessage);
    }
  }, [messages]);

  // 处理鼠标进入事件
  const handleMouseEnter = () => {
    if (!cid) return;
    setIsHovering(true);
  };

  // 处理鼠标离开事件
  const handleMouseLeave = () => {
    if (!cid) return;
    setIsHovering(false);
  };

  // 监听 cid 变化，直接滚动到底部
  useEffect(() => {
    if (cid) {
      // 先禁用鼠标监听
      setIsHovering(false);
      // 直接滚动到底部
      scrollToBottom(false);
      // 延迟开启鼠标监听
      const timer = setTimeout(() => {
        setIsHovering(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      // 如果是新对话，重置输入框
      setInputMessage('');
      // 重置滚动位置
      scrollToBottom(false);
    }
  }, [cid]);

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
        // behavior: 'auto',
      });
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

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
    <div className="box-border flex h-full w-full flex-col pt-5">
      <div className="min-h-0 flex-1">
        <div
          ref={scrollRef}
          className="h-full overflow-y-auto"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {messages.map((msg, index) => (
            <div
              key={msg.mid}
              className={`mb-4 flex flex-row gap-1 ${msg.role === 'user' ? 'justify-end pl-4' : 'pr-4'}`}
            >
              {msg.role === 'assistant' && (
                <div className="flex size-6 min-w-6 items-center justify-center overflow-hidden rounded-full bg-[rgba(92,153,244,0.80)]">
                  <AI className="size-4" />
                </div>
              )}
              <div className="bg-muted-foreground/10 text-md box-border inline-block w-fit max-w-[85%] rounded-md p-2">
                {msg.result_type === 'str' && (
                  <div className="space-y-2">
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
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
                {msg.result_type === 'dict' && msg.content.data_type === 'simple' && (
                  <ChatKolList data={msg.content} />
                )}
                {msg.result_type === 'dict' && msg.content.data_type === 'package' && (
                  <ChatKolPackage data={msg.content} />
                )}
              </div>
              {msg.role === 'user' && (
                <div className="flex size-6 items-center justify-center overflow-hidden rounded-full bg-[rgba(92,153,244,0.80)]">
                  <UserAvatar className="size-6" username={username} />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="mb-4 flex flex-row items-center gap-1">
              <div className="flex h-6 min-h-6 w-6 min-w-6 items-center justify-center overflow-hidden rounded-full bg-[rgba(92,153,244,0.80)]">
                <AI className="size-4 min-h-4 min-w-4"></AI>
              </div>
              <div className="text-md box-border inline-block rounded-[12px] px-3">
                <LoadingDots />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto">
        <ChatKeyword />

        <div className="border-primary/80 dark:border-primary/20 bg-background box-border space-y-1 rounded-2xl border p-2">
          <Textarea
            ref={textareaRef}
            className="!text-md h-6 min-h-6 border-0 !bg-transparent p-0"
            rows={1}
            placeholder={t('chat_placeholder')}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
          />

          <div className="flex items-center justify-between">
            <Button
              className="ml-auto h-6 max-h-6 min-h-6 w-6 max-w-6 min-w-6"
              disabled={isLoading || !inputMessage.trim()}
              onClick={handleSendMessage}
            >
              <ArrowUpRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
