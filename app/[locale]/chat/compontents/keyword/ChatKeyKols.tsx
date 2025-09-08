'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { Chat1 } from '@assets/svg';
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn/components/ui/popover';
import { Input } from '@shadcn/components/ui/input';
import { Button } from '@shadcn/components/ui/button';
import { CircleHelp, Loader2, MessageCircleQuestion } from 'lucide-react';
import { useState } from 'react';
import { useChatApi } from '@hooks/useChatApi';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import { updateChatCid } from 'app/store/reducers/userSlice';
import { toast } from 'sonner';
import { Textarea } from '@shadcn/components/ui/textarea';
import { useLocale } from 'next-intl';
import { RadioGroup, RadioGroupItem } from '@shadcn/components/ui/radio-group';
import { Label } from '@shadcn/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@shadcn/components/ui/tooltip';

export default function ChatKeyKols() {
  const t = useTranslations('common');
  const locale = useLocale();
  const dispatch = useAppDispatch();
  const currentCid = useAppSelector((state) => state.userReducer?.chat_cid);
  const { sendMessage } = useChatApi();
  const isLoading = useAppSelector((state) => state.userReducer?.isChatLoading);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [budget, setBudget] = useState<string>('');
  const [recommendCount, setRecommendCount] = useState<string>('3');
  const [recommendStrategy, setRecommendStrategy] = useState<string>('head_first');
  const [language, setLanguage] = useState<string>(locale);

  const handleSubmit = async () => {
    // 验证必填字段
    if (!description.trim()) {
      toast.error(t('keyword_project_description_required'));
      return;
    }
    if (!budget.trim()) {
      toast.error(t('keyword_project_budget_required'));
      return;
    }
    if (!recommendCount.trim()) {
      toast.error(t('keyword_recommend_count_required'));
      return;
    }

    const msg = t('keyword_message_template', {
      description,
      budget,
      recommendCount,
      recommendStrategy: t(`keyword_strategy_${recommendStrategy}`),
      language: language === 'zh' ? t('language_chinese') : t('language_english'),
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
    setRecommendCount('3');
    setRecommendStrategy('head_first');
    setLanguage(locale);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="hover:bg-muted-foreground/10 box-border flex cursor-pointer items-center gap-1 rounded-md border border-[rgba(0,0,0,0.10)] p-1 whitespace-nowrap">
          <Chat1 className="size-3" />
          {t('keyword_kols')}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">{t('keyword_kols')}</h4>
            <p className="text-muted-foreground text-sm">{t('keyword_kols_description')}</p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-1 items-start gap-2">
              <span className="col-span-1">{t('keyword_project_description')}</span>
              <Textarea
                id="description"
                defaultValue=""
                value={description}
                className="text-md col-span-1 h-full"
                onChange={(e) => setDescription(e.target.value)}
                autoComplete="off"
                disabled={isLoading}
                placeholder={t('recommend_placeholder')}
              />
            </div>
            <div className="grid grid-cols-1 items-center gap-2">
              <div className="col-span-1 flex items-center gap-1">
                <span>{t('keyword_project_budget')}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CircleHelp className="size-3 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-[150px] text-sm break-words whitespace-pre-wrap">
                        {t('keyword_project_budget_tip')}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="budget"
                type="number"
                defaultValue=""
                value={budget}
                className="text-md col-span-1 h-full"
                onChange={(e) => setBudget(e.target.value)}
                autoComplete="off"
                disabled={isLoading}
                placeholder={t('recommended_amount')}
              />
            </div>
            <div className="grid grid-cols-1 items-center gap-2">
              <span className="col-span-1">{t('keyword_recommend_count')}</span>
              <Input
                id="recommendCount"
                type="number"
                min="1"
                max="20"
                defaultValue=""
                value={recommendCount}
                className="text-md col-span-1 h-full"
                onChange={(e) => setRecommendCount(e.target.value)}
                autoComplete="off"
                disabled={isLoading}
                placeholder="3"
              />
            </div>
            <div className="grid grid-cols-1 items-start gap-2">
              <span className="col-span-1">{t('keyword_recommend_strategy')}</span>
              <div className="col-span-1">
                <RadioGroup
                  value={recommendStrategy}
                  onValueChange={setRecommendStrategy}
                  disabled={isLoading}
                  className="flex flex-wrap gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="head_first" id="head_first" />
                    <Label htmlFor="head_first" className="text-sm font-normal">
                      {t('keyword_strategy_head_first')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tail_first" id="tail_first" />
                    <Label htmlFor="tail_first" className="text-sm font-normal">
                      {t('keyword_strategy_tail_first')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="average_distribution" id="average_distribution" />
                    <Label htmlFor="average_distribution" className="text-sm font-normal">
                      {t('keyword_strategy_average_distribution')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="random" id="random" />
                    <Label htmlFor="random" className="text-sm font-normal">
                      {t('keyword_strategy_random')}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <div className="grid grid-cols-1 items-start gap-2">
              <span className="col-span-1">{t('keyword_language')}</span>
              <div className="col-span-1">
                <RadioGroup
                  value={language}
                  onValueChange={setLanguage}
                  disabled={isLoading}
                  className="flex flex-wrap gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="zh" id="zh" />
                    <Label htmlFor="zh" className="text-sm font-normal">
                      {t('language_chinese')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="en" id="en" />
                    <Label htmlFor="en" className="text-sm font-normal">
                      {t('language_english')}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
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
