'use client';
import React from 'react';
import { Verified } from '@assets/svg';
import avatar from '@assets/image/avatar.png';

interface OpinionContentProps {
  question: string;
  reply: {
    author: {
      name: string;
      handle: string;
      avatar?: string;
      verified: boolean;
    };
    date: string;
    content: string;
  };
}

export default function OpinionContent({ question, reply }: OpinionContentProps) {
  return (
    <div className="space-y-4">
      {/* 主要问题/观点 */}
      <div className="text-muted-foreground/60 line-clamp-3 text-base">{question}</div>

      {/* 引用回复 */}
      <div className="border-border bg-gray-400/10 space-y-3 rounded-xl border p-4">
        <div className="flex items-center gap-2">
          <div className="relative flex h-8 w-8 flex-shrink-0 rounded-full shadow-sm">
            {reply.author.avatar ? (
              <img
                src={reply.author.avatar}
                alt={reply.author.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = avatar.src;
                }}
              />
            ) : (
              <>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800 opacity-60 blur-sm"></div>
                <div className="relative h-full w-full rounded-full bg-gray-700 ring-1 ring-gray-500 dark:bg-gray-600 dark:ring-gray-400"></div>
              </>
            )}
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-1.5">
              <span className="truncate text-base font-semibold">{reply.author.name}</span>
              {reply.author.verified && <Verified className="text-primary h-4 w-4 flex-shrink-0" />}
              <span className="text-muted-foreground/60 truncate text-md">{reply.author.handle}</span>
            </div>
            <span className="flex-shrink-0 text-md">{reply.date}</span>
          </div>
        </div>
        <div className="text-muted-foreground/60 text-md line-clamp-2">{reply.content}</div>
      </div>
    </div>
  );
}
