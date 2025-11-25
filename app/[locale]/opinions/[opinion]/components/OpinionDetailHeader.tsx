'use client';
import React from 'react';
import avatar from '@assets/image/avatar.png';
import { Verified } from '@assets/svg';

interface OpinionDetailHeaderProps {
  author: {
    name: string;
    handle: string;
    avatar?: string;
    verified?: boolean;
  };
  volume: number;
}

export default function OpinionDetailHeader({ author, volume }: OpinionDetailHeaderProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-4">
        <img
          src={author.avatar || avatar.src}
          className="h-16 w-16 rounded-full border-2 border-border object-cover"
          alt={author.name}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = avatar.src;
          }}
        />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">{author.name}</h1>
            {author.verified && <Verified className="h-5 w-5 text-primary" />}
          </div>
          <p className="text-primary">{author.handle}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-sm text-muted-foreground">Volume</p>
          <p className="text-lg font-mono font-bold text-primary">
            ${volume.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
