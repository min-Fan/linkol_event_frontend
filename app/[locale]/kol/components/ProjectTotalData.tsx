'use client';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { getPlatformTotalRechargeAndTotalDeal } from '@libs/request';

export default function KOLTotalData() {
  const t = useTranslations('common');
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });

  const { data: platformTotalRechargeAndTotalDeal } = useQuery<any>({
    queryKey: ['platformTotalRechargeAndTotalDeal'],
    queryFn: () => getPlatformTotalRechargeAndTotalDeal(),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    staleTime: 10000,
  });

  return (
    <div className="box-border grid h-48 w-64 min-w-64 grid-rows-2 overflow-hidden rounded-3xl bg-radial-[159.05%_124.16%_at_138.39%_50%] from-[#D4F5D0] to-[#35B888] px-5 py-2 text-white">
      <dl className="flex w-full flex-col justify-center space-y-1 overflow-hidden">
        <dd className="truncate text-3xl font-bold">
          {formatter.format(platformTotalRechargeAndTotalDeal?.data?.success_order_amount || 0)}
        </dd>
        <dt className="text-md capitalize">{t('project_total_balance')}</dt>
      </dl>
      <dl className="flex w-full flex-col justify-center space-y-1 overflow-hidden border-t border-white">
        <dd className="truncate text-3xl font-bold">
          {formatter.format(
            platformTotalRechargeAndTotalDeal?.data?.executed_done_item_amount || 0
          )}
        </dd>
        <dt className="text-md capitalize">{t('project_total_invested')}</dt>
      </dl>
    </div>
  );
}
