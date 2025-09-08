'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { Chat1 } from '@assets/svg';
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn/components/ui/popover';
import { Input } from '@shadcn/components/ui/input';
import { Button } from '@shadcn/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useChatApi } from '@hooks/useChatApi';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import { updateChatCid } from 'app/store/reducers/userSlice';
import { toast } from 'sonner';
import { Textarea } from '@shadcn/components/ui/textarea';

export default function ChatKeyKols() {
  const t = useTranslations('common');
  const dispatch = useAppDispatch();
  const currentCid = useAppSelector((state) => state.userReducer?.chat_cid);
  const { sendMessage, isLoading } = useChatApi();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [budget, setBudget] = useState<string>('');

  const handleSubmit = async () => {
    // 验证必填字段
    // if (!name.trim()) {
    //   toast.error(t('keyword_project_name_required'));
    //   return;
    // }
    if (!description.trim()) {
      toast.error(t('keyword_project_description_required'));
      return;
    }
    if (!budget.trim()) {
      toast.error(t('keyword_project_budget_required'));
      return;
    }

    const msg = t('keyword_message_template', {
      // name,
      description,
      budget,
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
    setDescription('');
    setBudget('');
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="hover:bg-muted-foreground/10 box-border flex cursor-pointer items-center gap-1 rounded-md border border-[rgba(0,0,0,0.10)] p-1 whitespace-nowrap">
          <Chat1 className="size-3" />
          {t('keyword_kols')}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-85">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">{t('keyword_kols')}</h4>
            <p className="text-muted-foreground text-sm">{t('keyword_kols_description')}</p>
          </div>
          <div className="grid gap-2">
            {/* <div className="grid grid-cols-4 items-center gap-2">
              <span>{t('keyword_project_name')}</span>
              <Input
                id="width"
                defaultValue=""
                value={name}
                className="col-span-3 text-md h-full"
                onChange={(e) => setName(e.target.value)}
                autoComplete="off"
                disabled={isLoading}
              />
            </div> */}
            <div className="grid grid-cols-4 items-start gap-2">
              <span>{t('keyword_project_description')}</span>
              <Textarea
                id="width"
                defaultValue=""
                value={description}
                className="text-md col-span-3 h-full"
                onChange={(e) => setDescription(e.target.value)}
                autoComplete="off"
                rows={5}
                disabled={isLoading}
                placeholder={t('recommend_placeholder')}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <span>{t('keyword_project_budget')}</span>
              <Input
                id="width"
                type="number"
                defaultValue=""
                value={budget}
                className="text-md col-span-3 h-full"
                onChange={(e) => setBudget(e.target.value)}
                autoComplete="off"
                disabled={isLoading}
                placeholder={t('recommended_amount')}
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
