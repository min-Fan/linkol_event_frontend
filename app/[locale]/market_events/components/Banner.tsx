'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';

import { Skeleton } from '@shadcn-ui/skeleton';
import { Button } from '@shadcn-ui/button';

import PagesRoute from '@constants/routes';
import { Link } from '@libs/i18n/navigation';
import { useBanner } from '@hooks/marketEvents';

// Banner 骨架屏组件
const BannerSkeleton = () => {
  return (
    <div className="bg-background relative flex w-full flex-col overflow-hidden rounded-3xl p-2 sm:p-4 lg:h-80 lg:flex-row-reverse lg:justify-between">
      {/* 封面图片骨架 */}
      <Skeleton className="h-80 w-full rounded-3xl lg:h-full lg:w-[476px]" />

      {/* 内容区域骨架 */}
      <div className="box-border flex w-full flex-1 flex-col justify-center gap-y-8 p-6 lg:p-10">
        {/* 标题和描述骨架 */}
        <div className="space-y-2">
          <Skeleton className="h-10 w-3/4 sm:h-12" />
          <Skeleton className="h-6 w-1/2 sm:h-7" />
        </div>

        {/* 按钮区域骨架 */}
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <Skeleton className="h-11 w-48 rounded-full" />
          <Skeleton className="h-11 w-36 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default function Banner() {
  const t = useTranslations('common');
  const { data, isLoading } = useBanner();

  if (isLoading || !data === null) {
    return <BannerSkeleton />;
  }

  return (
    <div className="bg-primary relative flex w-full flex-col overflow-hidden rounded-3xl bg-cover bg-center bg-no-repeat p-2 sm:p-4 lg:h-80 lg:flex-row-reverse lg:justify-between">
      <img
        src={data?.cover_img}
        alt={data?.title}
        className="h-80 w-full overflow-hidden rounded-3xl object-cover lg:h-full lg:w-[476px]"
      />
      <div className="box-border flex w-full flex-1 flex-col justify-center gap-y-8 p-6 lg:p-10">
        <dl className="space-y-2 font-bold text-white">
          <dt className="text-4xl">{data?.title}</dt>
          <dd className="text-xl">{data?.short_desc}</dd>
        </dl>
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <div className="bg-primary/10 box-border flex h-11 items-center rounded-full border border-white px-6 !text-base font-medium text-white">
            {data?.start?.split(' ')[0]} - {data?.end?.split(' ')[0]}
          </div>
          <Link href={`${PagesRoute.MARKET_EVENTS}/${data?.id}`} title={t('join_campaign')}>
            <Button className="text-primary !h-11 gap-x-1 !rounded-full bg-white !px-6 !text-base font-medium">
              <span>{t('join_campaign')}</span>
              <ArrowRight className="size-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
