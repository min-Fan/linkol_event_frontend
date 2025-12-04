'use client';
import React from 'react';
import { ExternalLink } from 'lucide-react';
import avatar from '@assets/image/avatar.png';
import { useTranslations } from 'next-intl';

interface OpinionContentProps {
  question: string;
  reply: {
    author: {
      name: string;
      handle: string;
      avatar?: string;
      verified?: boolean;
    };
    content: string;
    tweetUrl?: string;
  };
}

export default function OpinionContent({ question, reply }: OpinionContentProps) {
  const t = useTranslations('common');
  return (
    <div className="space-y-4">
      {/* 主要问题/观点 */}
      <p className="text-foreground/90 mb-4 text-xl leading-relaxed font-medium">{question}</p>

      {/* 引用回复 */}
      <div className="border-border bg-muted/20 relative overflow-hidden rounded-xl border p-4">
        <div className="bg-primary absolute top-0 bottom-0 left-0 w-1"></div>
        <p className="text-muted-foreground pl-2 italic">"{reply.content}"</p>
        {reply.tweetUrl && (
          <div className="mt-2 flex justify-end">
            <a
              href={reply.tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary flex items-center gap-1 text-xs hover:underline"
            >
              {t('view_original')} <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
