'use client';

import React, { ReactNode, useEffect, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { LoaderCircle } from 'lucide-react';
import { useAppSelector } from '@store/hooks';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@shadcn-ui/dialog';
import { Button } from '@shadcn-ui/button';
import { toast } from 'sonner';

import SaveMoneyDollarIcon from '@assets/svg/save_money_dollar.svg';
import { getKolWithdrawSignature, getOrderUnconsumedAmountSignature } from '@libs/request';
import TokenIcon from 'app/components/TokenIcon';
import { getContractAddress } from '@constants/config';
import KOLService_abi from '@constants/abi/KOLService_abi.json';
import { getExplorerLink } from '@constants/chains';
import { toContractAmount } from '@libs/utils/format-bignumber';

export default function UIDialogWithdraw(props: {
  address: string;
  orderId: number;
  amount: number;
  onComplete?: () => void;
  children: ReactNode;
}) {
  const { address, orderId, amount, onComplete, children } = props;
  const { chain, chainId } = useAccount();
  const t = useTranslations('common');
  const payTokenInfo = useAppSelector((state) => state.userReducer?.pay_token_info);
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const pay_token_info = useAppSelector((state) => state.userReducer?.pay_token_info);

  const {
    data: redeemHash,
    writeContract: writeContractRedeem,
    isPending: isPendingRedeem,
    isError: isErrorRedeem,
    error: errorRedeem,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isErrorWaitForTransactionReceipt,
    error: errorWaitForTransactionReceipt,
  } = useWaitForTransactionReceipt({
    hash: redeemHash,
  });

  const handleCancel = () => {
    setIsOpen(false);
  };

  const toExplorerUrl = (explorerUrl: string) => {
    if (!explorerUrl) return;
    window.open(`${explorerUrl}/address/${address}`, '_blank');
  };

  const getWithdrawSignature = async () => {
    try {
      if (!address || !orderId) {
        toast.error(t('keyword_order_id_required'));
        return null;
      }
      const res: any = await getOrderUnconsumedAmountSignature({
        order_id: orderId,
      });
      if (res && res.code === 200) {
        return res.data;
      } else {
        toast.error(res.msg);
        return null;
      }
    } catch (error) {
      toast.error(error.message);
      console.log('error', error);
      return null;
    }
  };

  const handleWithdraw = () => {
    startTransition(async () => {
      try {
        if (!orderId) return;

        // 1. 获取签名
        const signatureData = await getWithdrawSignature();
        if (!signatureData) {
          toast.error(t('withdraw_failed_get_signature'));
          return;
        }

        if (signatureData.amount <= 0) {
          toast.error(t('withdraw_failed_amount_zero'));
          return;
        }

        // 2. 调用合约
        writeContractRedeem({
          address: getContractAddress()?.KOLServiceAddress as `0x${string}`,
          abi: KOLService_abi,
          functionName: 'redeem',
          args: [
            toContractAmount(signatureData.amount, 0),
            signatureData.timestamp,
            signatureData.projectAddress as `0x${string}`,
            signatureData.orderId,
            signatureData.signature as `0x${string}`,
          ],
        });
      } catch (error) {
        toast.error(error.message);
        console.error(error);
      }
    });
  };

  // 监听 redeem 方法调用结果
  useEffect(() => {
    if (isErrorWaitForTransactionReceipt) {
      const errorMessage = errorWaitForTransactionReceipt?.message;
      const match = errorMessage?.match(/execution reverted: (.+?)(?:\n|$)/);
      const shortMessage = match ? match[1] : t('withdraw_failed');
      toast.error(shortMessage);
    }
    console.log('isErrorRedeem', errorRedeem);
    if (isErrorRedeem) {
      toast.error(t('withdraw_failed'));
    }
  }, [
    isErrorRedeem,
    errorRedeem,
    isErrorWaitForTransactionReceipt,
    errorWaitForTransactionReceipt,
  ]);

  // 监听交易确认状态
  useEffect(() => {
    if (isConfirmed) {
      toast.success(
        t.rich('withdraw_success', {
          amount: (chunks) => <span className="text-primary">{amount}</span>,
        }),
        {
          action: (
            <Button
              variant="outline"
              onClick={() =>
                window.open(
                  getExplorerLink(chainId as number, redeemHash as `0x${string}`),
                  '_blank'
                )
              }
            >
              {t('view_transaction')}
            </Button>
          ),
        }
      );

      onComplete?.();
      setIsOpen(false);
    }
  }, [isConfirmed, redeemHash, chainId]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="border-border w-md p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{t('withdraw_title')}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-y-10 px-14 py-10">
          <h3 className="text-lg font-semibold capitalize">{t('withdraw_title')}</h3>
          <SaveMoneyDollarIcon className="size-20" />
          <div className="text-md w-full space-y-1.5">
            <p>{t('withdraw_description')}</p>
            <div className="bg-secondary flex items-center justify-between rounded-md p-3">
              <span>$ {amount}</span>
              <div className="flex items-center gap-x-0.5">
                <TokenIcon type={''} className="size-4 rounded-full" />
              </div>
            </div>
            <p className="text-muted-foreground">{t('withdraw_tips')}</p>
          </div>
          <div className="flex items-center justify-center gap-x-4">
            <Button variant="outline" className="mx-auto" onClick={handleCancel}>
              {t('btn_cancel')}
            </Button>
            <Button
              className="mx-auto"
              disabled={isPending || isPendingRedeem || isConfirming}
              onClick={handleWithdraw}
            >
              {isPending || isPendingRedeem || isConfirming ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <span>{t('btn_withdraw')}</span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
