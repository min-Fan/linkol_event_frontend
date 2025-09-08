'use client';

import { useMemo, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@shadcn-ui/button';
import { toast } from 'sonner';

import { ORDER_PROGRESS } from '@constants/app';
import useOrderProgress from '@hooks/uesOrderProgress';
import useUserInfo from '@hooks/useUserInfo';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import defaultAvatar from '@assets/image/avatar.png';
import {
  clearSelectedKOLInfo,
  updateQuickOrder,
  updateSelectedKOLs,
} from '@store/reducers/userSlice';
import { formatCurrency } from '@libs/utils';
import UIWallet from '@ui/wallet';
import KOLSelectListView from './KOLSelectListView';

export default function KOLSquarePanel() {
  const t = useTranslations('common');
  const { setOrderProgress } = useOrderProgress();
  const { isConnected, isLogin, connect, login } = useUserInfo();
  const dispatch = useAppDispatch();
  const selectedKOLs = useAppSelector((state) => state.userReducer?.selectedKOLs);
  const estimateTotal = useMemo(() => {
    const amount = selectedKOLs?.reduce((acc, kol) => acc + kol.price_yuan, 0) || 0;

    return formatCurrency(amount, 2);
  }, [selectedKOLs]);

  const [isPending, startTransition] = useTransition();

  const handleCreate = () => {
    startTransition(async () => {
      if (selectedKOLs?.length === 0) {
        toast.error(t('error_select_kol'));

        return;
      }

      try {
        if (!isLogin) {
          await login();
        } else if (!isConnected) {
          connect();
        } else {
          dispatch(updateQuickOrder({ key: 'project_id', value: '' }));
          dispatch(updateQuickOrder({ key: 'order_id', value: '' }));
          dispatch(updateQuickOrder({ key: 'order_no', value: '' }));
          dispatch(clearSelectedKOLInfo());
          setOrderProgress(ORDER_PROGRESS.SUBMIT_ORDER);
        }
      } catch (error) {
        toast.error(t('error_login'));
      }
    });
  };

  const handleCancel = () => {
    if (selectedKOLs?.length === 0) {
      return;
    }

    dispatch(updateSelectedKOLs([]));
  };

  return (
    <div className="box-border flex w-full items-center justify-between space-x-4 px-2 py-2 sm:px-2 sm:py-4">
      <KOLSelectListView>
        <dl className="flex h-11 cursor-pointer flex-col justify-center space-y-1">
          <dt className="relative flex items-center pl-2">
            {selectedKOLs?.slice(0, 10).map((kol) => (
              <div
                className="border-border -ml-2 size-4 min-w-4 overflow-hidden rounded-full border-2 sm:size-6 sm:min-w-6"
                key={kol.id}
              >
                <img
                  src={kol.profile_image_url}
                  alt={kol.name}
                  className="size-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = defaultAvatar.src;
                  }}
                />
              </div>
            ))}
            {/* <div className="from-background pointer-events-none absolute inset-0 top-0 left-0 h-full bg-gradient-to-r from-[0%] to-transparent to-[20%]"></div> */}
          </dt>
          <dd className="flex items-center gap-x-2 text-sm">
            <p className="text-muted-foreground/60">
              {t.rich('selected_kol', {
                count: (chunks) => (
                  <strong className="text-primary">{selectedKOLs?.length || 0}</strong>
                ),
              })}
            </p>
            <p className="text-muted-foreground block md:hidden">
              {t.rich('estimate_total', {
                amount: (chunks) => <span className="text-foreground">{estimateTotal}</span>,
              })}
            </p>
          </dd>
        </dl>
      </KOLSelectListView>
      <div className="flex items-center gap-1 sm:gap-3">
        <p className="text-md text-muted-foreground hidden md:block">
          {t.rich('estimate_total', {
            amount: (chunks) => <span className="text-foreground">{estimateTotal}</span>,
          })}
        </p>
        {!!selectedKOLs?.length && (
          <Button
            className="text-md h-6 w-auto rounded-sm sm:h-10 sm:w-32 sm:rounded-xl"
            variant="secondary"
            onClick={handleCancel}
            disabled={isPending}
          >
            {t('btn_cancel')}
          </Button>
        )}
        {isConnected && isLogin ? (
          <Button
            className="text-md h-6 w-auto rounded-sm sm:h-10 sm:w-32 sm:rounded-xl"
            onClick={handleCreate}
            disabled={isPending}
          >
            {t('btn_create')}
          </Button>
        ) : (
          <UIWallet className="text-md h-6 w-auto rounded-sm sm:h-10 sm:w-32 sm:rounded-xl" />
        )}
      </div>
    </div>
  );
}
