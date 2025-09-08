import { Button } from '@shadcn/components/ui/button';
import { Dot } from '@assets/svg';
import defaultAvatar from '@assets/image/avatar.png';
import React from 'react';
import { useTranslations } from 'next-intl';
import { formatNumberKMB } from '@libs/utils';
import { useAppDispatch } from '@store/hooks';
import { updateSelectedKOLs, updateQuickOrder } from '@store/reducers/userSlice';
import useOrderProgress from '@hooks/uesOrderProgress';
import { ORDER_PROGRESS } from '@constants/app';

export default function ChatKolPackage({ data }: { data: any }) {
  const t = useTranslations('common');
  const { setOrderProgress } = useOrderProgress();
  const dispatch = useAppDispatch();

  const submitOrder = (item: any) => {
    dispatch(updateSelectedKOLs(item.kols));
    dispatch(updateQuickOrder({ key: 'project_id', value: '' }));
    dispatch(updateQuickOrder({ key: 'order_id', value: '' }));
    dispatch(updateQuickOrder({ key: 'order_no', value: '' }));
    setOrderProgress(ORDER_PROGRESS.SUBMIT_ORDER);
  };
  return (
    <div className="flex w-full flex-col gap-2">
      <h1 className="text-md border-b border-gray-200 pb-2 font-bold">
        {t('kol_customized_promotion_package')}
      </h1>
      <div className="flex flex-col gap-2">
        {data.data.map((item: any) => (
          <div
            key={item.package}
            className="border-border flex flex-col gap-1 rounded-md border bg-white p-2"
          >
            <div className="flex items-center justify-between gap-1">
              <h2 className="text-md font-bold">{item.package}</h2>
              <Button className="!h-auto !rounded-lg !p-1 !px-1.5">
                <span className="text-sm font-normal">${item.total_price}</span>
              </Button>
            </div>
            <div className="mb-2 flex flex-col gap-0">
              {item.why.split('|').map((val: string) => (
                <div key={val} className="flex items-center gap-1">
                  <Dot className="size-2" />
                  <span className="text-muted-foreground/60 text-xs">{val}</span>
                </div>
              ))}
            </div>
            {item.combination.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-xs font-bold">{t('combine')}</span>
                {item.combination.map((com: string) => (
                  <div key={com} className="flex items-center gap-1">
                    <span className="text-muted-foreground/60 text-xs">{com}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-y-1 pl-2">
              {item.kols.map((kol: any) => (
                <div
                  className="border-border -ml-3 size-4 min-w-4 overflow-hidden rounded-full border-2 sm:size-6 sm:min-w-6"
                  key={kol.id}
                >
                  <img
                    src={kol.icon}
                    alt={kol.username}
                    className="size-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = defaultAvatar.src;
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 w-full">
              <Button className="!h-8 w-full" onClick={() => submitOrder(item)}>
                {t('submit_order')}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <h1 className="text-md mt-4 font-bold">{t('package_comparison')}</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-center">
          <thead>
            <tr className="0">
              <th className="border-border border-t border-b px-3 py-2 text-xs font-bold whitespace-nowrap text-gray-500">
                {t('package_dimension')}
              </th>
              {data.data.map((item: any) => (
                <th
                  className="border-border border-t border-b px-3 py-2 text-xs font-bold whitespace-nowrap text-gray-500"
                  key={item.package}
                >
                  {item.package.split(':')[0]}
                  <br />
                  <span className="text-xs font-normal text-gray-400">
                    ({item.package.split(':')[1]})
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-3 py-2 text-xs font-bold whitespace-nowrap text-gray-500">
                {t('package_budget_percent')}
              </td>
              <td className="px-3 py-2 text-xs">{data.analysis.A.price_percent}%</td>
              <td className="px-3 py-2 text-xs">{data.analysis.B.price_percent}%</td>
              <td className="px-3 py-2 text-xs">{data.analysis.C.price_percent}%</td>
            </tr>
            <tr>
              <td className="bg-background px-3 py-2 text-xs font-bold whitespace-nowrap text-gray-500">
                {t('package_kol_count')}
              </td>
              <td className="bg-background px-3 py-2 text-xs">{data.analysis.A.kols_count}</td>
              <td className="bg-background px-3 py-2 text-xs">{data.analysis.B.kols_count}</td>
              <td className="bg-background px-3 py-2 text-xs">{data.analysis.C.kols_count}</td>
            </tr>
            <tr>
              <td className="px-3 py-2 text-xs font-bold whitespace-nowrap text-gray-500">
                {t('package_follower_total')}
              </td>
              <td className="px-3 py-2 text-xs">
                {formatNumberKMB(data.analysis.A.total_follower)}
              </td>
              <td className="px-3 py-2 text-xs">
                {formatNumberKMB(data.analysis.B.total_follower)}
              </td>
              <td className="px-3 py-2 text-xs">
                {formatNumberKMB(data.analysis.C.total_follower)}
              </td>
            </tr>
            <tr>
              <td className="bg-background px-3 py-2 text-xs font-bold whitespace-nowrap text-gray-500">
                {t('package_stage')}
              </td>
              <td className="bg-background px-3 py-2 text-xs">{data.analysis.A.suitable_stage}</td>
              <td className="bg-background px-3 py-2 text-xs">{data.analysis.B.suitable_stage}</td>
              <td className="bg-background px-3 py-2 text-xs">{data.analysis.C.suitable_stage}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
