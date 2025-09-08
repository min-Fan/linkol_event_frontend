import { useTranslations } from 'next-intl';

import { formatCurrency } from '@libs/utils';
import { useQuery } from '@tanstack/react-query';
import { getPlatformTotalRechargeAndTotalDeal } from '@libs/request';

export default function KOLTotalData() {
  const t = useTranslations('common');
  const { data: platformTotalRechargeAndTotalDeal } = useQuery<any>({
    queryKey: ['platformTotalRechargeAndTotalDeal'],
    queryFn: () => getPlatformTotalRechargeAndTotalDeal(),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    staleTime: 10000,
  });

  return (
    <div className="box-border hidden h-64 grid-rows-2 overflow-hidden rounded-3xl bg-radial-[97%_132%_at_97%_50%] from-[#88BBF3] to-[#0806FD] px-5 py-2 text-white">
      <dl className="flex w-full flex-col justify-center space-y-1 overflow-hidden">
        <dd className="truncate text-3xl font-bold">
          {formatCurrency(platformTotalRechargeAndTotalDeal?.data?.success_order_amount || 0, 2)}
        </dd>
        <dt className="text-md capitalize">{t('total_balence')}</dt>
      </dl>
      <dl className="flex w-full flex-col justify-center space-y-1 overflow-hidden border-t border-white">
        <dd className="truncate text-3xl font-bold">
          {formatCurrency(
            platformTotalRechargeAndTotalDeal?.data?.executed_done_item_amount || 0,
            2
          )}
        </dd>
        <dt className="text-md capitalize">{t('total_invested')}</dt>
      </dl>
    </div>
  );
}
