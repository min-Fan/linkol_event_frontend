'use client';
import React from 'react';
import { ExternalLink } from 'lucide-react';
import avatar from '@assets/image/avatar.png';

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
  return (
    <div className="space-y-4">
      {/* 主要问题/观点 */}
      <p className="text-xl font-medium text-foreground/90 leading-relaxed mb-4">{question}</p>

      {/* 引用回复 */}
      <div className="rounded-xl border border-border bg-muted/50 p-4 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
        <p className="text-muted-foreground italic pl-2">"{reply.content}"</p>
        {reply.tweetUrl && (
          <div className="mt-2 flex justify-end">
            <a
              href={reply.tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary flex items-center gap-1 hover:underline"
            >
              View Original <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
