'use client';
import React from 'react';
import avatar from '@assets/image/avatar.png';
import { Verified } from '@assets/svg';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('common');
  return (
    <div className="border-border bg-background dark:bg-muted/20 rounded-2xl border p-6">
      <div className="flex items-center gap-4">
        <img
          src={author.avatar || avatar.src}
          className="border-border h-16 w-16 rounded-full border-2 object-cover"
          alt={author.name}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = avatar.src;
          }}
        />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-foreground text-2xl font-bold">{author.name}</h1>
            {author.verified && <Verified className="text-primary h-5 w-5" />}
          </div>
          <p className="text-primary">{author.handle}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-muted-foreground text-sm">{t('vol')}</p>
          <p className="text-primary font-mono text-lg font-bold">${volume.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
