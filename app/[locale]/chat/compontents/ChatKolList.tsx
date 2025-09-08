import React from 'react';
import defaultAvatar from '@assets/image/avatar.png';
import { UserRound } from 'lucide-react';
import { Badge } from '@shadcn/components/ui/badge';
import { formatNumberKMB } from '@libs/utils';
import { useTranslations } from 'next-intl';
import { Button } from '@shadcn/components/ui/button';
import { useChatApi } from '@hooks/useChatApi';
import { useAppSelector } from '@store/hooks';
import { cn } from '@shadcn/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function ChatKolList({ data, size }: { data: any; size?: 'default' | 'sm' }) {
  const t = useTranslations('common');
  const { sendMessage, sendActionMessage } = useChatApi();
  const isOrderProcessing = useAppSelector((state) => state.userReducer?.isOrderProcessing);
  const submitOrder = (item: any) => {
    console.log(item);
    // sendMessage(t('kol_order_message', { kol_name: item.screen_name }));

    // 构造KOL IDs和价格信息
    const kol_ids = [{ id: item.kol_id, price: item.price_yuan }];

    // 创建action消息
    const actionContent = {
      function_name: 'project_order',
      parameters: {
        has: [item.screen_name], // 表示有KOL IDs和总价格
        kol_ids: kol_ids,
        miss: [], // 没有缺失的参数
      },
    };

    const actionMessage = {
      role: 'assistant' as const,
      content: actionContent as any, // 使用as any来绕过类型检查
      mid: `action-${Date.now()}`,
      result_type: 'action',
      timestamp: Date.now(),
    };

    // 使用sendActionMessage确保只有一个action在执行
    sendActionMessage(actionContent);
  };
  if (!Array.isArray(data?.data?.kols)) {
    console.log(data);
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-2">
      {/* <h1 className="text-md border-b-[1px] border-muted-foreground/20 pb-2 font-bold">
        {t('kol_square')}
      </h1> */}
      {/* <div className="border-primary/20 bg-primary/5 flex flex-col gap-2 rounded-lg border-b-[1px] p-2 sm:p-4">
        <h1 className="text-muted-foreground text-lg font-bold">项目信息</h1>
        <div className="flex flex-wrap gap-2">
          <div className="flex flex-1 flex-col">
            <span className="text-muted-foreground/60 text-md whitespace-nowrap">项目名称</span>
            <span className="text-base font-bold">Web3社交平台</span>
          </div>
          <div className="flex flex-1 flex-col">
            <span className="text-muted-foreground/60 text-md whitespace-nowrap">项目名称</span>
            <span className="text-base font-bold">Web3社交平台</span>
          </div>
          <div className="flex flex-1 flex-col">
            <span className="text-muted-foreground/60 text-md whitespace-nowrap">项目名称</span>
            <span className="text-base font-bold">Web3社交平台</span>
          </div>
        </div>
      </div> */}
      {data.project_analysis && (
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
                  <code className={cn('break-words whitespace-pre-wrap', className)} {...props}>
                    {children}
                  </code>
                );
              },
              p: ({ children }) => <p className="break-words whitespace-pre-wrap">{children}</p>,
              ul: ({ children }) => <ul className="space-y-2">{children}</ul>,
              ol: ({ children }) => <ol className="space-y-2">{children}</ol>,
            }}
          >
            {data.project_analysis}
          </ReactMarkdown>
        </div>
      )}
      <div
        className={cn(
          'grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4',
          size === 'sm' && '!grid-cols-1'
        )}
      >
        {data.data.kols.map((item: any) => (
          <div
            key={item.kol_id}
            className="bg-background border-border flex flex-col gap-2 rounded-md border p-2 sm:p-4"
          >
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                {item?.icon && (
                  <img
                    src={item?.icon}
                    alt="avatar"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = defaultAvatar.src;
                    }}
                  />
                )}
                {!item?.icon && <UserRound className="size-6" />}
              </div>
              <div className="flex flex-1 flex-col gap-0 overflow-hidden">
                <h2 className="text-md truncate font-bold">{item.name}</h2>
                <span className="text-muted-foreground/60 text-sm">@{item.screen_name}</span>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">{t('promotion_index')}: </span>
                  <span className="inline-block rounded-lg bg-green-500/10 px-1 py-0.5 text-sm text-green-700">
                    {item.matching_degree}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {item.tags.split('/').map((tag: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs text-white">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-muted-foreground/60 text-sm whitespace-nowrap">
                  {t('followers')}
                </span>
                <span className="text-sm text-gray-500">{formatNumberKMB(item.followers)}</span>
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-muted-foreground/60 text-sm whitespace-nowrap">
                  {t('interaction_amount')}
                </span>
                <span className="text-sm text-gray-500">
                  {formatNumberKMB(item.interaction_amount)}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-muted-foreground/60 text-sm whitespace-nowrap">
                  {t('collaboration_price')}
                </span>
                <span className="text-sm text-gray-500">${item.price_yuan}/tweet</span>
              </div>
            </div>
            <div className="text-muted-foreground/60 flex flex-col gap-1">
              <span className="text-xs">
                {t('promotion_reason')}: {item.reason}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                className="!h-8 w-full"
                onClick={() => submitOrder(item)}
                disabled={isOrderProcessing}
              >
                <span className="text-sm font-normal">{t('kol_add_to_order')}</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
      {data.suggestion && (
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
                  <code className={cn('break-words whitespace-pre-wrap', className)} {...props}>
                    {children}
                  </code>
                );
              },
              p: ({ children }) => <p className="break-words whitespace-pre-wrap">{children}</p>,
              ul: ({ children }) => <ul className="space-y-2">{children}</ul>,
              ol: ({ children }) => <ol className="space-y-2">{children}</ol>,
            }}
          >
            {data.suggestion}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
