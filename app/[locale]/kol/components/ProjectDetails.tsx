import React from 'react';
import { useTranslations } from 'next-intl';
import defaultAvatar from '@assets/image/avatar.png';
import { Badge } from '@shadcn/components/ui/badge';
import { DescIcon, KolIcon, Link, TaskIcon, Web } from '@assets/svg';
import { IProject, IKOLHomeOrderList, IKOLHomeOrderListNoAuth } from 'app/@types/types';

interface ProjectDetailsProps {
  projectInfo?: IProject;
  promotionalMaterials?: string;
  orderItem?: IKOLHomeOrderList | IKOLHomeOrderListNoAuth;
}

export default function ProjectDetails({
  projectInfo,
  promotionalMaterials,
  orderItem,
}: ProjectDetailsProps) {
  const t = useTranslations('common');

  return (
    <div className="bg-muted-foreground/10 grid w-full grid-cols-12 gap-2 rounded-xl p-2">
      <div className="bg-background border-border col-span-4 flex flex-col gap-1 rounded-lg border p-2">
        <div className="flex items-center gap-1">
          <KolIcon className="size-4" />
          <span className="text-muted-foreground">Types of KOL</span>
        </div>
        {orderItem && 'kol' in orderItem ? (
          <div className="flex flex-wrap gap-1">
            {orderItem?.kol?.tags?.split('/').map((tag: string) => (
              <Badge
                key={tag}
                className="bg-muted-foreground/10 text-muted-foreground/60 rounded-sm px-1 text-xs font-normal"
              >
                {tag}
              </Badge>
            ))}
          </div>
        ) : (
          <Badge className="bg-muted-foreground/10 text-muted-foreground/60 rounded-sm px-1 text-xs font-normal">
            -
          </Badge>
        )}

        <div className="flex items-center gap-1">
          <Link className="text-muted-foreground/60 h-4 w-5"></Link>
          <a
            href={projectInfo?.website}
            target="_blank"
            rel="noreferrer"
            className="text-foreground w-max flex-1 truncate text-left break-words"
          >
            {projectInfo?.website || '-'}
          </a>
        </div>
      </div>
      {/* <div className="bg-background border-border col-span-4 flex flex-col gap-1 rounded-lg border p-2">
        <div className="flex flex-wrap items-center justify-start gap-1 text-xs normal-case">
          <span className="text-muted-foreground">{t('website')}:</span>
        </div>
        <div className="flex flex-wrap items-center justify-start gap-1 text-xs normal-case">
          <span className="text-muted-foreground">{t('launched_token')}:</span>
          <div className="flex flex-wrap gap-1">
            <img
              src={defaultAvatar.src}
              alt=""
              className="h-4 w-4 rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = defaultAvatar.src;
              }}
            />
            <span className="text-foreground">TOKEN</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-start gap-1 text-xs normal-case">
          <span className="text-muted-foreground">{t('network')}:</span>
          <div className="flex flex-wrap gap-1">
            <img
              src={defaultAvatar.src}
              alt=""
              className="h-4 w-4 rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = defaultAvatar.src;
              }}
            />
            <span className="text-foreground">Ethereum</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-start gap-1 text-xs normal-case">
          <div className="flex flex-wrap gap-1">
            <span className="text-muted-foreground">{t('type')}:</span>
            <Badge className="bg-muted-foreground/10 text-muted-foreground/60 rounded-sm px-1 text-xs font-normal">
              Token
            </Badge>
            <Badge className="bg-muted-foreground/10 text-muted-foreground/60 rounded-sm px-1 text-xs font-normal">
              NFT
            </Badge>
          </div>
        </div>
      </div> */}

      <div className="bg-background border-border col-span-4 flex flex-col gap-1 rounded-lg border p-2">
        <div className="flex items-center gap-1">
          <TaskIcon className="size-4" />
          <span className="text-muted-foreground">Total task budget</span>
        </div>
        <p className="text-left text-2xl font-bold">
          $
          {orderItem && 'buy_agent_order' in orderItem
            ? orderItem?.buy_agent_order?.amount
            : orderItem?.amount || '-'}
        </p>
      </div>

      <div className="bg-background border-border col-span-4 flex flex-col gap-1 rounded-lg border p-2">
        <div className="flex items-center gap-1">
          <DescIcon className="size-4" />
          <span className="text-muted-foreground">Promoting Content</span>
        </div>
        <span className="text-left text-xs break-words whitespace-normal normal-case">
          {promotionalMaterials || '-'}
        </span>
      </div>
    </div>
  );
}
