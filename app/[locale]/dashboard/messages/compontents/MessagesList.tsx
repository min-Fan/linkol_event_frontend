'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  ChevronDown,
  Heart,
  MoreHorizontal,
  Repeat2,
  Reply,
  User,
  Loader2,
  MessageSquareDashed,
} from 'lucide-react';
import { Button } from '@shadcn/components/ui/button';
import { Card, CardContent } from '@shadcn/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shadcn/components/ui/dropdown-menu';
import { Badge } from '@shadcn/components/ui/badge';
import ScoreStar from './ScoreStar';
import { getAdvertiserMessages } from '@libs/request';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { MessageItem } from 'app/@types/types';
import defaultAvatar from '@assets/image/avatar.png';

export default function MessagesList() {
  const t = useTranslations('common');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);

  // 处理评分成功
  const handleRateSuccess = (messageIndex: number, newScore: string) => {
    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages];
      updatedMessages[messageIndex] = {
        ...updatedMessages[messageIndex],
        kol_score: parseFloat(newScore),
      };
      return updatedMessages;
    });
  };

  const getMessages = async (currentPage = 1, isLoadMore = false) => {
    try {
      setLoading(true);
      const res: any = await getAdvertiserMessages({ page: currentPage, limit: pageSize });
      console.log('获取到的消息数据:', res);

      setLoading(false);
      if (res.code === 200 && res.data) {
        // 过滤掉content为空的消息
        const filteredMessages = res.data.list.filter((message) => message.content);
        console.log('过滤后的消息:', filteredMessages);

        // 检查每条消息是否包含order_id
        filteredMessages.forEach((msg, index) => {
          console.log(`消息 ${index + 1} 的order_id:`, msg.order_id);
        });

        // 加载更多时追加数据，否则替换数据
        if (isLoadMore) {
          setMessages((prev) => [...prev, ...filteredMessages]);
        } else {
          setMessages(filteredMessages);
        }

        // 判断是否还有更多数据
        setHasMore(filteredMessages.length === pageSize);
        setTotal(res.data.total);
      } else {
        toast.error(res.msg || t('error_message'));
      }
    } catch (error) {
      console.error('获取消息失败:', error);
      toast.error(error.message || t('error_message'));
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMessages();
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    getMessages(nextPage, true);
    setPage(nextPage);
  };

  // 渲染加载中状态
  if (loading && messages.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center py-10">
        <Loader2 className="text-primary size-10 animate-spin" />
        <p className="text-muted-foreground mt-4 text-base">{t('loading')}</p>
      </div>
    );
  }

  // 渲染空数据状态
  if (!loading && messages.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center py-10">
        <div className="bg-muted rounded-full p-3">
          <MessageSquareDashed className="text-muted-foreground size-10" />
        </div>
        <p className="text-muted-foreground mt-4 text-base">{t('no_data')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message, index) => {
        console.log(`渲染消息 ${index + 1}, order_id:`, message.order_item_id);
        return (
          <Card key={index} className="overflow-hidden py-0">
            <CardContent className="p-0">
              <div className="border-border flex items-start space-x-3 border-b p-4">
                <div className="border-border bg-background flex-shrink-0 overflow-hidden rounded-full border">
                  {message.kol && message.kol.profile_image_url ? (
                    <img
                      src={message.kol?.profile_image_url}
                      alt={message.kol?.name || 'avatar'}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = defaultAvatar.src;
                      }}
                      className="size-10 object-cover"
                    />
                  ) : (
                    <div className="flex size-10 items-center justify-center">
                      <User className="text-muted-foreground size-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <span className="text-base font-semibold">{message.kol?.name}</span>
                      <span className="text-muted-foreground text-sm">
                        @{message.kol?.user_name}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        · {format(new Date(message.created_at), 'yyyy-MM-dd HH:mm:ss')}
                      </span>
                    </div>
                    {/* <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">{t('more_options')}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>{t('copy_link')}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu> */}
                  </div>
                  <p className="text-sm">{message.content}</p>
                  {message.medias?.length > 0 && (
                    <div className="border-border mt-2 overflow-hidden rounded-md border">
                      <img
                        src={message.medias[0].media_url_https}
                        alt="Post image"
                        className="w-full"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-4">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Reply className="text-muted-foreground size-4" />
                        <span className="ml-1 text-xs">{message.replays}</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Repeat2 className="text-muted-foreground size-4" />
                        <span className="ml-1 text-xs">{message.reposts}</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Heart className="text-muted-foreground size-4" />
                        <span className="ml-1 text-xs">{message.likes}</span>
                      </Button>
                    </div>
                    {message.kol_score !== 0 && (
                      <div className="flex items-center">
                        <ScoreStar
                          orderId={message.order_item_id?.toString() || ''}
                          score={message.kol_score}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {message.kol_score === 0 && (
                <div className="p-4">
                  <p className="text-sm font-medium">{t('rate_kol')}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <ScoreStar
                      orderId={message.order_item_id?.toString() || ''}
                      score={message.kol_score}
                      onRateSuccess={(newScore) => handleRateSuccess(index, newScore)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {hasMore && (
        <Button
          variant="outline"
          className="text-muted-foreground my-4 w-full border-dashed"
          onClick={loadMore}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              {t('loading')}
            </>
          ) : (
            <>
              <ChevronDown className="mr-2 size-4" />
              {t('load_more')}
            </>
          )}
        </Button>
      )}
    </div>
  );
}
