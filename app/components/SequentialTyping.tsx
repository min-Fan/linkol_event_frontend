'use client';

import { useState } from 'react';
import TypingMarkdown from 'app/components/TypingMarkdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@shadcn/lib/utils';
import { useLocale, useTranslations } from 'next-intl';
interface TypingMarkdownListProps {
  posts: any;
  duration?: number;
}

const TypingMarkdownList: React.FC<TypingMarkdownListProps> = ({ posts, duration }) => {
  const [current, setCurrent] = useState(0);
  const lang = useLocale();
  const t = useTranslations('common');
  const renderImages = (medias) => {
    if (medias.length === 1) {
      return (
        <div className="mt-2">
          <img src={medias[0]} className="w-25 rounded-xl object-cover" />
        </div>
      );
    }
    if (medias.length === 2) {
      return (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {medias.map((item, i) => (
            <img key={i} src={item} className="h-40 w-full rounded-xl object-cover" />
          ))}
        </div>
      );
    }
    if (medias.length === 3) {
      return (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <img src={medias[0]} className="col-span-2 h-40 w-full rounded-xl object-cover" />
          {medias.slice(1).map((item, i) => (
            <img key={i} src={item} className="h-40 w-full rounded-xl object-cover" />
          ))}
        </div>
      );
    }
    if (medias.length >= 4) {
      return (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {medias.slice(0, 4).map((item, i) => (
            <img key={i} src={item} className="h-40 w-full rounded-xl object-cover" />
          ))}
        </div>
      );
    }
    return <></>;
  };

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post, index) => {
        if (index < current || current == post.length) {
          return (
            <div className="border-primary space-y-2 border-l-2 pl-2" key={index}>
              <div>
                {t('twitter_case')}
                {index + 1}
              </div>
              {post.contents[lang].map((msg, msgIndex) => {
                return (
                  <div
                    className="bg-primary/10 text-md rounded-md p-2 whitespace-pre-wrap"
                    key={msgIndex}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      key={msgIndex}
                      components={{
                        code({ node, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          return match ? (
                            <SyntaxHighlighter style={dracula} language={match[1]} {...props}>
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code
                              className={cn('break-words whitespace-pre-wrap', className)}
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                        p: ({ children }) => (
                          <p className="break-words whitespace-pre-wrap">{children}</p>
                        ),
                      }}
                    >
                      {msg}
                    </ReactMarkdown>
                    {post.media_urls && renderImages(post.media_urls)}
                  </div>
                );
              })}
            </div>
          );
        }

        if (index === current && current != post.length) {
          return (
            <div key={index}>
              <div className="pl-2">
                {' '}
                {t('twitter_case')}
                {index + 1}
              </div>
              <TypingMarkdown
                key={index}
                messages={post.contents[lang]}
                duration={duration}
                onDone={() => {
                  setTimeout(() => setCurrent(current + 1), 300);
                }}
              />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

export default TypingMarkdownList;
