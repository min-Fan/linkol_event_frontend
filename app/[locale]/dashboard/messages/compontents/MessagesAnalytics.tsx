import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@shadcn-ui/tooltip';
import { CircleHelp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAppSelector } from '@store/hooks';
interface AnalyticsCardProps {
  title: string;
  subTitle: string;
  current: number;
  total: number;
  info?: string;
  unit?: string;
}

const AnalyticsCard = ({
  title,
  subTitle,
  current,
  total,
  info,
  unit = '',
}: AnalyticsCardProps) => {
  return (
    <div className="bg-opacity-20 rounded-lg">
      <div className="mb-2">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="flex items-center gap-1 text-sm text-neutral-500">
          <span>{unit}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <CircleHelp className="size-3" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{info}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
        <div
          className="h-full rounded-full bg-black"
          style={{ width: `${Math.min(100, (current / total) * 100)}%` }}
        />
      </div>
    </div>
  );
};

export default function MessagesAnalytics() {
  const t = useTranslations('common');
  const payTokenInfo = useAppSelector((state) => state.userReducer?.pay_token_info);
  return (
    <div className="sticky top-0 mb-4 w-full space-y-4">
      <div className="rounded-lg bg-neutral-100 p-4">
        <h2 className="mb-2 text-xl font-semibold">{t('increase_exposure')}</h2>
        <div className="grid grid-cols-12 gap-4">
          {/* <div className="col-span-2 flex flex-col gap-2">
            <div className="text-base font-medium">KOL Agent</div>
          </div> */}
          <div className="col-span-12 mb-4 grid grid-cols-2 gap-4">
            <AnalyticsCard
              title="600 / 1000"
              subTitle="Tweets"
              unit="Tweets"
              current={600}
              total={1000}
              info={t('tweets_already_post')}
            />

            <AnalyticsCard
              title="600 / 1000"
              subTitle={''}
              current={600}
              total={1000}
              info={t('amount_already_spent')}
              unit={''}
            />
          </div>
        </div>
        <p className="mb-2 text-base font-medium">{t('total_data_of_the_topic')}</p>
        <div className="grid grid-cols-4 gap-4">
          <div className="flex flex-col items-center justify-center rounded-lg bg-white p-2">
            <div className="mb-1 text-lg font-bold">1,000</div>
            <div className="text-sm text-neutral-500">{t('listed')}</div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-lg bg-white p-2">
            <div className="mb-1 text-lg font-bold">1,000</div>
            <div className="text-sm text-neutral-500">{t('likes')}</div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-lg bg-white p-2">
            <div className="mb-1 text-lg font-bold">1,000</div>
            <div className="text-sm text-neutral-500">{t('views')}</div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-lg bg-white p-2">
            <div className="mb-1 text-lg font-bold">1,000</div>
            <div className="text-sm text-neutral-500">{t('reposts')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
