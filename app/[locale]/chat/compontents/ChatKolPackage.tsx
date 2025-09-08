import { Button } from '@shadcn/components/ui/button';
import { Dot } from '@assets/svg';
import defaultAvatar from '@assets/image/avatar.png';
import React from 'react';
import { useTranslations } from 'next-intl';
import { formatNumberKMB, formatPrecision } from '@libs/utils';
import { useAppSelector } from '@store/hooks';
import { useChatApi } from '@hooks/useChatApi';
import { Crown, TrendingUp, UserRound } from 'lucide-react';
import { cn } from '@shadcn/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function ChatKolPackage({ data, size }: { data: any; size?: 'default' | 'sm' }) {
  const t = useTranslations('common');
  const isOrderProcessing = useAppSelector((state) => state.userReducer?.isOrderProcessing);
  const { sendActionMessage } = useChatApi();
  const submitOrder = (item: any) => {
    console.log('提交订单:', item);

    // 构造KOL IDs和价格信息
    const kol_ids = item.kols.map((kol: any) => ({
      id: kol.id,
      price: kol.price_yuan || 0, // 如果KOL没有单独价格，默认为0
    }));

    // 创建action消息
    const actionContent = {
      function_name: 'project_order',
      parameters: {
        has: ['kol_ids', 'price_yuan'], // 表示有KOL IDs和总价格
        kol_ids: kol_ids,
        miss: [], // 没有缺失的参数
        price_yuan: parseFloat(item.total_price), // 添加总价格参数
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
  return (
    <div className="flex w-full flex-col gap-2">
      {/* <h1 className="text-md border-b-[1px] border-muted-foreground/20 pb-2 font-bold">
        {t('kol_customized_promotion_package')}
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
          'grid grid-cols-1 gap-4 sm:grid-cols-3 2xl:grid-cols-4',
          size === 'sm' && '!grid-cols-1 !gap-2'
        )}
      >
        {data.data.map((item: any) => (
          <div
            key={item.package}
            className={cn(
              'border-border bg-background relative flex flex-col gap-1 overflow-hidden rounded-md border p-2 sm:p-4',
              size === 'sm' && '!p-2',
              item.package.includes('B') && 'border-primary shadow-primary shadow-sm'
            )}
          >
            {item.package.includes('B') && (
              <div className="bg-primary absolute top-0 right-0 z-0 rounded-bl-lg px-2">
                <span className="text-xs font-bold text-white">推荐</span>
              </div>
            )}
            <div className="flex w-full flex-col items-center justify-center gap-1">
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1">
                  {item.package.includes('A') && (
                    <UserRound className="text-primary size-5 min-w-5" />
                  )}
                  {item.package.includes('B') && (
                    <TrendingUp className="text-primary size-5 min-w-5" />
                  )}
                  {item.package.includes('C') && <Crown className="text-primary size-5 min-w-5" />}
                  <span className="text-lg font-bold">{item.package.split(':')[0]}</span>
                </div>
                <span className="text-muted-foreground/60 text-xs">
                  {item.package.split(':')[1]}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-primary text-lg font-bold">${item.total_price}</span>
              </div>
            </div>
            {/* <div className="flex items-center justify-between gap-1">
              <h2 className="text-md font-bold">{item.package}</h2>
              <Button className="!h-auto !rounded-lg !p-1 !px-1.5">
                <span className="text-sm font-normal">${item.total_price}</span>
              </Button>
            </div> */}
            <div className="mb-2 flex flex-col gap-0">
              {item.why.split('|').map((val: string) => (
                <div key={val} className="flex items-center gap-1">
                  <Dot className="size-2" />
                  <span className="text-muted-foreground/60 text-xs">{val}</span>
                </div>
              ))}
            </div>
            {item.combination.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-xs font-bold">{t('combine')}</span>
                {item.combination.map((com: string) => (
                  <div key={com} className="flex items-center gap-1">
                    <span className="text-muted-foreground/60 text-xs">{com}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="[&::-webkit-scrollbar-thumb]:bg-primary/20 [&::-webkit-scrollbar-track]:bg-primary/10 flex max-h-20 flex-wrap items-center overflow-y-auto pl-3 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full">
              {item.kols.map((kol: any) => (
                <div
                  className={cn(
                    'border-border -ml-3 size-4 min-w-4 overflow-hidden rounded-full border-2 sm:size-6 sm:min-w-6'
                  )}
                  key={kol.id}
                >
                  <img
                    src={kol.icon}
                    alt={kol.username}
                    className="size-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = defaultAvatar.src;
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-auto w-full pt-3">
              <Button
                className="!h-auto w-full py-1"
                onClick={() => submitOrder(item)}
                disabled={isOrderProcessing}
              >
                {t('submit_order')}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <h1 className="text-md mt-4 font-bold">{t('package_comparison')}</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-center">
          <thead>
            <tr className="0">
              <th className="border-border border-t border-b px-3 py-2 text-xs font-bold whitespace-nowrap text-gray-500">
                {t('package_dimension')}
              </th>
              {data.data.map((item: any) => (
                <th
                  className="border-border border-t border-b px-3 py-2 text-xs font-bold whitespace-nowrap text-gray-500"
                  key={item.package}
                >
                  {item.package.split(':')[0]}
                  <br />
                  <span className="text-xs font-normal text-gray-400">
                    ({item.package.split(':')[1]})
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-3 py-2 text-xs font-bold whitespace-nowrap text-gray-500">
                {t('package_budget_percent')}
              </td>
              <td className="px-3 py-2 text-xs">{data.analysis.A.price_percent}%</td>
              <td className="px-3 py-2 text-xs">{data.analysis.B.price_percent}%</td>
              <td className="px-3 py-2 text-xs">{data.analysis.C.price_percent}%</td>
            </tr>
            <tr>
              <td className="bg-background px-3 py-2 text-xs font-bold whitespace-nowrap text-gray-500">
                {t('package_kol_count')}
              </td>
              <td className="bg-background px-3 py-2 text-xs">{data.analysis.A.kols_count}</td>
              <td className="bg-background px-3 py-2 text-xs">{data.analysis.B.kols_count}</td>
              <td className="bg-background px-3 py-2 text-xs">{data.analysis.C.kols_count}</td>
            </tr>
            <tr>
              <td className="px-3 py-2 text-xs font-bold whitespace-nowrap text-gray-500">
                {t('package_follower_total')}
              </td>
              <td className="px-3 py-2 text-xs">
                {formatNumberKMB(data.analysis.A.total_follower)}
              </td>
              <td className="px-3 py-2 text-xs">
                {formatNumberKMB(data.analysis.B.total_follower)}
              </td>
              <td className="px-3 py-2 text-xs">
                {formatNumberKMB(data.analysis.C.total_follower)}
              </td>
            </tr>
            <tr>
              <td className="bg-background px-3 py-2 text-xs font-bold whitespace-nowrap text-gray-500">
                {t('package_stage')}
              </td>
              <td className="bg-background px-3 py-2 text-xs">{data.analysis.A.suitable_stage}</td>
              <td className="bg-background px-3 py-2 text-xs">{data.analysis.B.suitable_stage}</td>
              <td className="bg-background px-3 py-2 text-xs">{data.analysis.C.suitable_stage}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {data.suggestion && (
        <div className="mt-4 space-y-2">
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
