import React from 'react';
import defaultAvatar from '@assets/image/avatar.png';
import { UserRound } from 'lucide-react';
import { Badge } from '@shadcn/components/ui/badge';
import { formatNumberKMB } from '@libs/utils';
import { useTranslations } from 'next-intl';

export default function ChatKolList({ data }: { data: any }) {
  const t = useTranslations('common');

  if (!Array.isArray(data?.data?.kols) || data.data.kols.length === 0) {
    console.log(data);
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <h1 className="text-md border-b border-gray-200 pb-2 font-bold">{t('kol_square')}</h1>
      <div className="flex flex-col gap-2">
        {data.data.kols.map((item: any) => (
          <div
            key={item.kol_id}
            className="bg-background border-border flex flex-col gap-2 rounded-md border p-2"
          >
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                {item?.icon && (
                  <img
                    src={item?.icon}
                    alt="avatar"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = defaultAvatar.src;
                    }}
                  />
                )}
                {!item?.icon && <UserRound className="size-6" />}
              </div>
              <div className="flex flex-1 flex-col gap-0 overflow-hidden">
                <h2 className="text-md truncate font-bold">{item.name}</h2>
                <span className="text-muted-foreground/60 text-sm">@{item.screen_name}</span>
                <div className="text-primary text-sm">
                  <span>{t('promotion_index')}: </span>
                  <span>{item.matching_degree}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {item.tags.split('/').map((tag: string, index: number) => (
                <Badge key={index} className="text-xs text-white">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-muted-foreground/60 text-sm whitespace-nowrap">
                  {t('followers')}
                </span>
                <span className="text-sm text-gray-500">{formatNumberKMB(item.followers)}</span>
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-muted-foreground/60 text-sm whitespace-nowrap">
                  {t('interaction_amount')}
                </span>
                <span className="text-sm text-gray-500">
                  {formatNumberKMB(item.interaction_amount)}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-muted-foreground/60 text-sm whitespace-nowrap">
                  {t('collaboration_price')}
                </span>
                <span className="text-sm text-gray-500">${item.price_yuan}/tweet</span>
              </div>
            </div>
            <div className="text-muted-foreground/60 flex flex-col gap-1">
              <span className="text-xs">
                {t('promotion_reason')}: {item.reason}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
