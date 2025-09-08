'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { Chat2 } from '@assets/svg';
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn/components/ui/popover';
import { Input } from '@shadcn/components/ui/input';
import { Button } from '@shadcn/components/ui/button';
import { Loader2, X } from 'lucide-react';
import { useState } from 'react';
import { useChatApi } from '@hooks/useChatApi';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';

import {
  updateChatCid,
  updateChatComparisonView,
  updateComparisonInfo,
} from 'app/store/reducers/userSlice';
import { toast } from 'sonner';
import ChatComparisonKolItem from './ChatComparisonKolItem';

export default function ChatKeyKolsComparison() {
  const t = useTranslations('common');
  const dispatch = useAppDispatch();
  const currentCid = useAppSelector((state) => state.userReducer?.chat_cid);
  const chat_comparison_info = useAppSelector(
    (state) => state.userReducer?.chat_comparison_info
  ) || { kol1: { name: '', avatar: '' }, kol2: { name: '', avatar: '' } };
  const chat_comparison_view = useAppSelector((state) => state.userReducer?.chat_comparison_view);
  const { sendMessage, isLoading } = useChatApi();

  // const [isOpen, setIsOpen] = useState<boolean>(false);
  // const [name1, setName1] = useState<string>('');
  // const [name2, setName2] = useState<string>('');

  const setIsOpen = (value: boolean) => {
    dispatch(updateChatComparisonView(value));
  };

  const handleSubmit = async () => {
    // 验证必填字段
    if (!chat_comparison_info.kol1.name.trim()) {
      toast.error(t('keyword_kol_name1_required'));
      return;
    }
    if (!chat_comparison_info.kol2.name.trim()) {
      toast.error(t('keyword_kol_name2_required'));
      return;
    }

    const msg = t('keyword_kol_comparison_message_template', {
      name1: chat_comparison_info.kol1.name,
      name2: chat_comparison_info.kol2.name,
    });

    // 如果没有当前对话，先清空 cid
    if (!currentCid) {
      dispatch(updateChatCid(null));
    }

    setIsOpen(false);

    // 发送消息
    await sendMessage(msg);

    // 清空表单
    dispatch(
      updateComparisonInfo({
        kol1: {
          name: '',
          avatar: '',
        },
        kol2: {
          name: '',
          avatar: '',
        },
      })
    );
  };

  const setName2 = (value: string) => {
    dispatch(
      updateComparisonInfo({
        kol1: {
          name: chat_comparison_info.kol1.name,
          avatar: chat_comparison_info.kol1.avatar,
        },
        kol2: {
          name: value,
          avatar: chat_comparison_info.kol2.avatar,
        },
      })
    );
  };

  const setName1 = (value: string) => {
    dispatch(
      updateComparisonInfo({
        kol1: {
          name: value,
          avatar: chat_comparison_info.kol1.avatar,
        },
        kol2: {
          name: chat_comparison_info.kol2.name,
          avatar: chat_comparison_info.kol2.avatar,
        },
      })
    );
  };

  const removeKol = (index: number) => {
    if (index == 1) {
      dispatch(
        updateComparisonInfo({
          kol1: {
            name: '',
            avatar: '',
          },
          kol2: {
            name: chat_comparison_info.kol2.name,
            avatar: chat_comparison_info.kol2.avatar,
          },
        })
      );
    } else {
      dispatch(
        updateComparisonInfo({
          kol1: {
            name: chat_comparison_info.kol1.name,
            avatar: chat_comparison_info.kol1.name,
          },
          kol2: {
            name: '',
            avatar: '',
          },
        })
      );
    }
  };

  const query = (data: any, index: number) => {
    if (index == 1) {
      dispatch(
        updateComparisonInfo({
          kol1: {
            name: data.username,
            avatar: data.avatar,
          },
          kol2: {
            name: chat_comparison_info.kol2.name,
            avatar: chat_comparison_info.kol2.avatar,
          },
        })
      );
    }

    if (index == 2) {
      dispatch(
        updateComparisonInfo({
          kol2: {
            name: data.username,
            avatar: data.avatar,
          },
          kol1: {
            name: chat_comparison_info.kol1.name,
            avatar: chat_comparison_info.kol1.avatar,
          },
        })
      );
    }
  };

  return (
    <Popover open={chat_comparison_view} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="hover:bg-muted-foreground/10 box-border flex cursor-pointer items-center gap-1 rounded-md border border-[rgba(0,0,0,0.10)] p-1 whitespace-nowrap">
          <Chat2 className="size-3" />
          {t('keyword_kol_comparison')}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-100" onInteractOutside={(e) => e.preventDefault()}>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="leading-none font-medium">{t('keyword_kol_comparison')}</h4>
              <X className="size-4 cursor-pointer" onClick={() => setIsOpen(false)} />
            </div>
            <p className="text-muted-foreground text-sm">
              {t('keyword_kol_comparison_description')}
            </p>
          </div>
          <div className="flex w-full items-center justify-between gap-2">
            <ChatComparisonKolItem
              isLoading={isLoading || false}
              name={chat_comparison_info?.kol1?.name}
              defaultName={'KOL1'}
              avatar={chat_comparison_info?.kol1?.avatar}
              inputChange={(val) => setName1(val)}
              remove={() => removeKol(1)}
              querySuccess={(data) => query(data, 1)}
            ></ChatComparisonKolItem>

            <ChatComparisonKolItem
              isLoading={isLoading || false}
              name={chat_comparison_info?.kol2?.name}
              defaultName={'KOL2'}
              avatar={chat_comparison_info?.kol2?.avatar}
              inputChange={(val) => setName2(val)}
              remove={() => removeKol(2)}
              querySuccess={(data) => query(data, 2)}
            ></ChatComparisonKolItem>
            {/* <div className="flex flex-1/2 flex-col items-center justify-center gap-1">
              <div className="order-border bg-background box-border flex size-10 items-center justify-center overflow-hidden rounded-full border">
                <img
                  src={defaultAvatar.src}
                  alt="avatar"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = defaultAvatar.src;
                  }}
                />
              </div>
              <div>KOL 1</div>
              <Input
                id="width"
                defaultValue=""
                value={chat_comparison_info.name1}
                placeholder={t('search_tip')}
                className="text-md col-span-3 h-full"
                onChange={(e) => setName1(e.target.value)}
                autoComplete="off"
                disabled={isLoading}
              />
            </div> */}

            {/* <div className="flex flex-1/2 flex-col items-center justify-center gap-1">
              <div className="order-border bg-background box-border flex size-10 items-center justify-center overflow-hidden rounded-full border">
                <img
                  src={defaultAvatar.src}
                  alt="avatar"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = defaultAvatar.src;
                  }}
                />
              </div>
              <div>KOL 2</div>
              <Input
                id="width"
                defaultValue=""
                value={chat_comparison_info.name2}
                placeholder={t('search_tip')}
                className="text-md col-span-3 h-full"
                onChange={(e) => setName2(e.target.value)}
                autoComplete="off"
                disabled={isLoading}
              />
            </div> */}
          </div>
          {/* <div className="space-y-2">
            <div className="grid grid-cols-4 items-center gap-2">
              <span>{t('keyword_kol_name')}</span>
              <Input
                id="width"
                defaultValue=""
                value={chat_comparison_info.name1}
                placeholder={t('search_tip')}
                className="text-md col-span-3 h-full"
                onChange={(e) => setName1(e.target.value)}
                autoComplete="off"
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <span>{t('keyword_kol_name')}</span>
              <Input
                id="width"
                defaultValue=""
                value={chat_comparison_info.name2}
                placeholder={t('search_tip')}
                className="text-md col-span-3 h-full"
                onChange={(e) => setName2(e.target.value)}
                autoComplete="off"
                disabled={isLoading}
              />
            </div>
          </div> */}
          <Button className="w-full" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : t('keyword_submit')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
