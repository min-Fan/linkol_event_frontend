'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { CircleHelp } from 'lucide-react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@shadcn-ui/tooltip';
import { Button } from '@shadcn-ui/button';
import { Card, CardContent } from '@shadcn-ui/card';

import { useAppSelector, useAppDispatch } from '@store/hooks';
import { useAccount } from 'wagmi';
import { ORDER_PROGRESS } from '@constants/app';
import { clearSelectedKOLs, clearQuickOrder, clearPromotionData } from '@store/reducers/userSlice';
import useOrderProgress from '@hooks/uesOrderProgress';
import UIDialogWithdraw from '@ui/dialog/Withdraw';

export default function KOLPromotionPanel() {
  const t = useTranslations('common');
  const promotionData = useAppSelector((state) => state.userReducer?.promotionData);
  const quickOrder = useAppSelector((state) => state.userReducer?.quickOrder);
  const { address } = useAccount();
  const payTokenInfo = useAppSelector((state) => state.userReducer?.pay_token_info);
  const dispatch = useAppDispatch();
  const { setOrderProgress } = useOrderProgress();

  const amount = useMemo(
    () => Number(promotionData?.payment_amount) - Number(promotionData?.consumption_amount) || 0,
    [promotionData]
  );

  const onComplete = () => {
    dispatch(clearSelectedKOLs());
    dispatch(clearQuickOrder());
    dispatch(clearPromotionData());
    setOrderProgress(ORDER_PROGRESS.KOL_SQUARE);
  };

  return (
    <Card className="p-0">
      <CardContent className="p-0">
        <div className="box-border w-full space-y-2 p-4">
          <div className="grid grid-cols-3 gap-4">
            <dl className="text-muted-foreground space-y-1">
              <dt className="capitalize">{t('payment_amount')}</dt>
              <dd>
                <span className="font-semibold">{promotionData?.payment_amount || 0}</span>{' '}
              </dd>
            </dl>
            <dl className="text-muted-foreground space-y-1">
              <dt className="capitalize">{t('spent')}</dt>
              <dd>
                <span className="font-semibold">{promotionData?.consumption_amount || 0}</span>{' '}
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
                <span className="text-primary font-semibold">{amount}</span>
              </dd>
            </dl>
          </div>
          <UIDialogWithdraw
            address={address as string}
            orderId={Number(quickOrder?.order_id)}
            amount={amount}
            onComplete={onComplete}
          >
            <Button className="mx-auto flex">{t('btn_withdraw')}</Button>
          </UIDialogWithdraw>
        </div>
      </CardContent>
    </Card>
  );
}
