'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { CornerDownLeft } from 'lucide-react';

import { Button } from '@shadcn-ui/button';
import { Textarea } from '@shadcn-ui/textarea';
import { Card } from '@shadcn-ui/card';

import { useRouter } from '@libs/i18n/navigation';
import { useAppDispatch } from '@store/hooks';
import { updateChatCid } from '@store/reducers/userSlice';
import useChat from '@hooks/useChat';
import { ChatType } from '@db/index';

export default function ChatPage() {
  const t = useTranslations('common');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { createChat } = useChat();

  const texts = [t('chat_welcome_title'), t('chat_welcome_desc')];
  const typingSpeed = 100;
  const deletingSpeed = 50;
  const pauseDuration = 1000;

  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [value, setValue] = useState('');

  // 处理Start按钮点击
  const handleStart = async () => {
    try {
      if (value.trim()) {
        // 如果有输入内容，创建新对话
        const title = value.length > 20 ? value.slice(0, 20) + '...' : value;
        const newCid = await createChat(title, ChatType.CHAT);

        // 切换到新对话
        dispatch(updateChatCid(newCid));

        // 将要发送的消息保存到sessionStorage，供view页面使用
        sessionStorage.setItem('pendingMessage', value);

        // 跳转到view页面
        router.push('/chat/view');
      } else {
        // 如果没有输入内容，直接跳转
        router.push('/chat/view');
      }
    } catch (error) {
      console.error('创建对话失败:', error);
      // 如果创建对话失败，仍然跳转到view页面
      router.push('/chat/view');
    }
  };

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleStart();
    }
  };

  const handleQuickInfo = (value: string) => {
    setValue(value);
  };

  useEffect(() => {
    const currentText = texts[currentIndex];

    if (!isDeleting) {
      // 打字输出
      if (charIndex < currentText.length) {
        const timeout = setTimeout(() => {
          setDisplayText(currentText.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        }, typingSpeed);
        return () => clearTimeout(timeout);
      } else {
        // 输出完成，等待后开始删除
        const timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDuration);
        return () => clearTimeout(timeout);
      }
    } else {
      // 删除文字
      if (charIndex > 0) {
        const timeout = setTimeout(() => {
          setDisplayText(currentText.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        }, deletingSpeed);
        return () => clearTimeout(timeout);
      } else {
        // 删除完成，切换到下一句
        setIsDeleting(false);
        setCurrentIndex((currentIndex + 1) % texts.length);
      }
    }
  }, [charIndex, isDeleting, currentIndex, texts]);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center">
      <div className="box-border flex w-full max-w-[1100px] flex-col items-center justify-center gap-10 px-4">
        <div className="h-14 overflow-hidden text-3xl sm:text-5xl">
          <h1 className="text-primary font-bold">
            <span>{displayText}</span>
            <span className="animate-pulse font-medium">|</span>
          </h1>
        </div>
        <div className="bg-background border-primary/15 focus-visible:ring-primary/20 relative w-full max-w-4xl space-y-4 rounded-3xl border p-4 sm:space-y-6 sm:p-6">
          <div className="relative max-h-48 min-h-6">
            <span className="text-base break-all opacity-0">
              {value || t('chat_welcome_placeholder')}
            </span>
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={t('chat_welcome_placeholder')}
              className="absolute top-0 left-0 size-full min-h-6 border-none p-0 !text-base"
            />
          </div>
          <div className="flex w-full justify-end">
            <Button className="bg-primary !rounded-xl" onClick={handleStart}>
              <div className="flex items-center gap-x-1 text-white">
                <span className="text-base">{t('chat_welcome_start')}</span>
                <CornerDownLeft className="size-4" />
              </div>
            </Button>
          </div>
        </div>
        <div className="grid w-full gap-4 sm:grid-cols-2">
          <Card className="bg-background/45 border-primary/15 !shadow-primary/10 flex-1 rounded-2xl border p-4 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)]">
            <div className="flex flex-col gap-1">
              <i className="text-xl font-bold">{t('chat_find_kol_title')}</i>
              <div className="flex w-full flex-col gap-1">
                <div
                  className="bg-background border-border flex cursor-pointer flex-col gap-0 rounded-lg border p-2"
                  onClick={() => handleQuickInfo(t('chat_quick_info1'))}
                >
                  <span className="text-sm">{t('chat_find_kol_subtitle1')}</span>
                  <i className="text-muted-foreground text-sm">{t('chat_find_kol_desc1')}</i>
                </div>
                <div
                  className="bg-background border-border flex cursor-pointer flex-col gap-0 rounded-lg border p-2"
                  onClick={() => handleQuickInfo(t('chat_quick_info2'))}
                >
                  <span className="text-sm">{t('chat_find_kol_subtitle2')}</span>
                  <i className="text-muted-foreground text-sm">{t('chat_find_kol_desc2')}</i>
                </div>
              </div>
            </div>
          </Card>
          <Card className="bg-background/45 border-primary/15 !shadow-primary/10 flex-1 rounded-2xl border p-4 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)]">
            <div className="flex flex-col gap-1">
              <i className="text-xl font-bold">{t('chat_marketing_strategy_title')}</i>
              <div className="flex w-full flex-col gap-1">
                <div
                  className="bg-background border-border flex cursor-pointer flex-col gap-0 rounded-lg border p-2"
                  onClick={() => handleQuickInfo(t('chat_quick_info3'))}
                >
                  <span className="text-sm">{t('chat_marketing_strategy_subtitle1')}</span>
                  <i className="text-muted-foreground text-sm">
                    {t('chat_marketing_strategy_desc1')}
                  </i>
                </div>
                <div
                  className="bg-background border-border flex cursor-pointer flex-col gap-0 rounded-lg border p-2"
                  onClick={() => handleQuickInfo(t('chat_quick_info4'))}
                >
                  <span className="text-sm">{t('chat_marketing_strategy_subtitle2')}</span>
                  <i className="text-muted-foreground text-sm">
                    {t('chat_marketing_strategy_desc2')}
                  </i>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
