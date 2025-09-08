'use client';

import { useTranslations } from 'next-intl';
import { CircleHelp, Loader2 } from 'lucide-react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@shadcn-ui/tooltip';
import { Button } from '@shadcn-ui/button';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { formatNumberKMB } from '@libs/utils';
import { useMemo, useState } from 'react';
import { withdrawOrderAmount } from '@libs/request';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { ORDER_PROGRESS } from '@constants/app';
import { clearSelectedKOLs, clearQuickOrder, clearPromotionData } from '@store/reducers/userSlice';
import useOrderProgress from '@hooks/uesOrderProgress';
import { useParams, useRouter } from 'next/navigation';
import PagesRoute from '@constants/routes';
import UIDialogWithdraw from '@ui/dialog/Withdraw';

export default function OrderDetailsPanel() {
  const t = useTranslations('common');
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const promotionData = useAppSelector((state) => state.userReducer?.promotionData);
  const { address } = useAccount();
  const dispatch = useAppDispatch();
  const payTokenInfo = useAppSelector((state) => state.userReducer?.pay_token_info);
  const amount = useMemo(
    () => Number(promotionData?.payment_amount) - Number(promotionData?.consumption_amount) || 0,
    [promotionData]
  );

  const onComplete = () => {
    dispatch(clearSelectedKOLs());
    dispatch(clearQuickOrder());
    dispatch(clearPromotionData());
    router.push(PagesRoute.MY_ORDERS);
  };

  return (
    <div className="bg-secondary box-border flex w-full items-center justify-between space-x-2 rounded-md p-4">
      <dl className="text-muted-foreground space-y-1">
        <dt className="capitalize">{t('payment_amount')}</dt>
        <dd>
          <span className="font-semibold">{promotionData?.payment_amount || 0}</span>{' '}
          {payTokenInfo?.symbol}
        </dd>
      </dl>
      <dl className="text-muted-foreground space-y-1">
        <dt className="capitalize">{t('spent')}</dt>
        <dd>
          <span className="font-semibold">{promotionData?.consumption_amount || 0}</span>{' '}
          {payTokenInfo?.symbol}
        </dd>
      </dl>
      <dl className="text-muted-foreground space-y-1">
        <dt className="flex items-center space-x-1 capitalize">
          <span>{t('unspent')}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <CircleHelp className="size-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{t('unspent_tips')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </dt>
        <dd>
          <span className="text-primary font-semibold">{amount}</span> {payTokenInfo?.symbol}
        </dd>
      </dl>
      <UIDialogWithdraw
        address={address as string}
        orderId={Number(orderId)}
        amount={amount}
        onComplete={onComplete}
      >
        <Button className="flex">{t('btn_withdraw')}</Button>
      </UIDialogWithdraw>
    </div>
  );
}
