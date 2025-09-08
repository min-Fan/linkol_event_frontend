import { ScrollArea } from '@shadcn/components/ui/scroll-area';
import { cn } from '@shadcn/lib/utils';
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import remarkGfm from 'remark-gfm';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
interface TypingMarkdownProps {
  messages: string[];
  duration?: number; // 总持续时间（毫秒）
  onDone?: () => void; // 💡 新增
  media_urls?: string[];
}

const TypingMarkdown: React.FC<TypingMarkdownProps> = ({ messages, duration = 1000, onDone }) => {
  const [displayText, setDisplayText] = useState('');
  const fullText = messages.join(' ');
  const totalLength = fullText.length;
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let currentIndex = 0;
    const interval = duration / totalLength;

    const timer = setInterval(() => {
      currentIndex++;
      setDisplayText(fullText.slice(0, currentIndex));

      if (currentIndex >= totalLength) {
        clearInterval(timer);

        if (onDone) {
          onDone(); // ✅ 打完后触发
        }
      }
    }, interval);

    return () => clearInterval(timer);
  }, [messages, duration]);

  useEffect(() => {
    if (bottomRef.current) {
      const scrollContainer = bottomRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [displayText]);

  return (
    <ScrollArea className="h-full w-full" ref={bottomRef}>
      <div className="border-primary border-l-2 pl-2">
        <div className="bg-primary/10 text-md space-y-2 rounded-md p-2 whitespace-pre-wrap">
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
            {displayText}
          </ReactMarkdown>
        </div>
      </div>
    </ScrollArea>
  );
};

export default TypingMarkdown;
