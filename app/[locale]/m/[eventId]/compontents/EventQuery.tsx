import { Magic } from '@assets/svg';
import { IEventInfoResponseData } from '@libs/request';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@shadcn/components/ui/accordion';
import { cn } from '@shadcn/lib/utils';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { Skeleton } from '@shadcn/components/ui/skeleton';

export default function EventQuery({
  eventInfo,
  isLoading,
}: {
  eventInfo: IEventInfoResponseData;
  isLoading: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  // 如果正在加载，显示骨架屏
  if (isLoading) {
    return (
      <div className="w-full rounded-lg p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
    );
  }

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      defaultValue="item-1"
      onValueChange={(value) => setIsOpen(value === 'item-1')}
    >
      <AccordionItem value="item-1">
        <AccordionTrigger className="flex items-center px-2 py-2 hover:no-underline sm:px-4 sm:py-3 [&>svg]:ml-0 [&[data-state=open]>svg]:hidden">
          <div className={cn('flex w-full items-center', isOpen ? 'justify-between' : 'gap-4')}>
            <span className="text-base font-bold sm:text-3xl">
              What is {eventInfo?.project?.name}?
            </span>
            <div className="text-primary bg-primary/10 flex items-center gap-1 rounded-lg p-2">
              <Magic className="text-primary h-4 w-4" />
              <p className="sm:text-md text-xs whitespace-nowrap">
                Research by <span className="font-bold">Linkol AI</span>
              </p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-2 px-2 text-base sm:px-4">
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
              {eventInfo?.ai_analysis}
            </ReactMarkdown>
          </div>
          {/* <div className="flex flex-col gap-2 px-2 sm:px-4">
            <h2 className="text-md font-bold sm:text-base">About</h2>
            <p className="text-xs font-semibold sm:text-base">
              Bitcoin is a global influencer-driven campaign launched by the Bitcoin community in
              2025 to raise public awareness and education around the world’s first decentralized
              digital currency. The campaign aims to onboard creators across social and
              crypto-native platforms to produce engaging, insightful content about Bitcoin’s
              purpose, history, and real-world impact. It seeks to demystify Bitcoin for everyday
              users and reclaim the narrative around financial freedom, self-custody, and
              open-source money.
            </p>
            <h2 className="text-md font-bold sm:text-base">Unique value proposition</h2>
            <p className="text-xs font-semibold sm:text-base">
              Rather than focusing solely on price or hype, the campaign empowers creators to
              explore Bitcoin from multiple angles — tech, ideology, finance, and freedom — while
              rewarding participation through transparent, performance-based incentives. The
              initiative highlights Bitcoin's unmatched decentralization and cultural significance
              in the crypto ecosystem.
            </p>
            <h2 className="text-md font-bold sm:text-base">Recent talking points</h2>
            <ul className="list-inside list-disc space-y-2 pl-2">
              <li className="m-0">
                <span className="text-xs font-semibold sm:text-base">
                  Bitcoin as digital gold in a volatile macro environment
                </span>
              </li>
              <li className="m-0">
                <span className="text-xs font-semibold sm:text-base">
                  The importance of self-custody: “Not your keys, not your coins”
                </span>
              </li>
              <li className="m-0">
                <span className="text-xs font-semibold sm:text-base">
                  Bitcoin’s role in global remittances and financial inclusion
                </span>
              </li>
              <li className="m-0">
                <span className="text-xs font-semibold sm:text-base">
                  Growing institutional attention amid tightening monetary policy
                </span>
              </li>
            </ul>
          </div> */}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
