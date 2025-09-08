'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { Chat2 } from '@assets/svg';
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn/components/ui/popover';
import { Input } from '@shadcn/components/ui/input';
import { Button } from '@shadcn/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useChatApi } from '@hooks/useChatApi';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import { updateChatCid } from 'app/store/reducers/userSlice';
import { toast } from 'sonner';
export default function ChatKeyKolAnalysis() {
  const t = useTranslations('common');
  const dispatch = useAppDispatch();
  const currentCid = useAppSelector((state) => state.userReducer?.chat_cid);
  const { sendMessage } = useChatApi();
  const isLoading = useAppSelector((state) => state.userReducer?.isChatLoading);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');

  const handleSubmit = async () => {
    // 验证 name 是否为空
    if (!name.trim()) {
      toast.error(t('keyword_kol_name_required'));
      return;
    }

    const msg = t('keyword_kol_analysis_message_template', {
      name,
    });

    // 如果没有当前对话，先清空 cid
    if (!currentCid) {
      dispatch(updateChatCid(null));
    }

    setIsOpen(false);

    // 发送消息
    await sendMessage(msg);

    // 清空表单
    setName('');
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="hover:bg-muted-foreground/10 box-border flex cursor-pointer items-center gap-1 rounded-md border border-[rgba(0,0,0,0.10)] p-1 whitespace-nowrap">
          <Chat2 className="size-3" />
          {t('keyword_kol_analysis')}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">{t('keyword_kol_analysis')}</h4>
            <p className="text-muted-foreground text-sm">{t('keyword_kol_analysis_description')}</p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-4 items-center gap-2">
              <span>{t('keyword_kol_name')}</span>
              <Input
                id="width"
                defaultValue=""
                value={name}
                className="text-md col-span-3 h-full"
                onChange={(e) => setName(e.target.value)}
                autoComplete="off"
                disabled={isLoading}
                placeholder={t('search_tip')}
              />
            </div>
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : t('keyword_submit')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
