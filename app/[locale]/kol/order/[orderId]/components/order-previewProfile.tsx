'use client';
import Image from 'next/image';
import { Link, CalendarDays } from 'lucide-react';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@shadcn/components/ui/tooltip';
import banner from '@assets/image/banner.png';
import avatar from '@assets/image/avatar.png';
import defaultBanner from '@assets/image/banner.png';
import { formatJoinedDate, formatNumberKMB } from '@libs/utils';
import { IKol } from 'app/@types/types';
import { useNow, useFormatter } from 'next-intl';
export default function OrderPreviewProfile({ info }: { info: IKol }) {
  const now = useNow();
  const format = useFormatter();
  return (
    <div className="border-border w-full border-b">
      <div className="relative h-24 w-full">
        {info?.profile_banner_url ? (
          <img
            src={info?.profile_banner_url}
            alt="avatar"
            className="h-full w-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = defaultBanner.src;
            }}
          />
        ) : (
          <Image
            className="size-full"
            src={banner}
            width={banner.width}
            height={banner.height}
            alt="banner"
            priority={true}
          />
        )}
        <div className="bg-muted-foreground border-background absolute bottom-0 left-4 size-16 translate-y-1/2 overflow-hidden rounded-full border-4">
          {info ? (
            <img src={info.profile_image_url} alt="avatar" className="size-full object-cover" />
          ) : (
            <Image src={avatar} alt="avatar" className="size-full object-cover" />
          )}
        </div>
      </div>
      <div className="space-y-1 p-2 pt-4">
        <div className="h-2"></div>
        <dl className="flex items-baseline space-x-1 overflow-hidden">
          <dt className="truncate text-base font-bold">{info ? info.name : 'KOL Agent'}</dt>
          <dd className="text-muted-foreground truncate text-xs">
            {info ? `@${info.username}` : '@KOLAGENT'}
          </dd>
        </dl>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <p className="text-muted-foreground line-clamp-3 text-left text-xs">
                {info ? info.description : 'PROGRAMMED TO KOL AGENT'}
              </p>
            </TooltipTrigger>
            <TooltipContent className="w-full max-w-xs">
              <p className="text-left text-xs">
                {info ? info.description : 'PROGRAMMED TO KOL AGENT'}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <ul className="flex items-center space-x-4">
          <li className="flex items-center space-x-1">
            <Link className="text-muted-foreground h-4 w-4 text-xs" />
            <a
              href={`https://x.com/${info?.username}`}
              target="_blank"
              className="truncate text-xs text-blue-500 underline"
            >
              https://x.com/{info?.username}
            </a>
          </li>
          <li className="flex items-center space-x-1">
            <CalendarDays className="text-muted-foreground h-4 w-4 text-xs" />
            <span className="text-muted-foreground text-xs">
              {info ? formatJoinedDate(info.x_created_at) : format.relativeTime(new Date(), now)}
            </span>
          </li>
        </ul>
        <ul className="flex items-center space-x-4">
          <li className="space-x-1">
            <strong className="text-xs font-bold">
              {info ? formatNumberKMB(info.followers_count) : '0'}
            </strong>
            <span className="text-muted-foreground text-xs">Followers</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
