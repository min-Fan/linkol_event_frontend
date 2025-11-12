'use client';
import React from 'react';
import { Verified } from '@assets/svg';
import { TrophyIcon } from 'lucide-react';
import avatar from '@assets/image/avatar.png';

interface OpinionDetailHeaderProps {
  author: {
    name: string;
    handle: string;
    avatar?: string;
    verified: boolean;
  };
  volume: string;
}

export default function OpinionDetailHeader({ author, volume }: OpinionDetailHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative flex-shrink-0">
          <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-black dark:bg-gray-900">
            {author.avatar ? (
              <img
                src={author.avatar}
                alt={author.name}
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
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-base font-semibold">{author.name}</span>
            {author.verified && <Verified className="h-5 w-5 flex-shrink-0 text-blue-500" />}
          </div>
          <div className="text-muted-foreground/80 text-md truncate">{author.handle}</div>
        </div>
      </div>
      <div className="text-primary flex flex-shrink-0 items-center gap-2">
        <TrophyIcon className="text-primary h-5 w-5" />
        <span className="text-md">{volume} Vol.</span>
      </div>
    </div>
  );
}
