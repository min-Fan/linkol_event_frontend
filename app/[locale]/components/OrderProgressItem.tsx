'use client';

import { useEffect, useState, useTransition } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@shadcn/components/ui/button';
import { toast } from 'sonner';

import { ORDER_PROGRESS } from '@constants/app';
import useOrderProgress from '@hooks/uesOrderProgress';
import useUserInfo from '@hooks/useUserInfo';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { getKOLInfo } from '@libs/request';
import { updateSelectedKOLInfo } from '@store/reducers/userSlice';
import { cn } from '@shadcn/lib/utils';

type Variant = 'outline' | 'default' | 'secondary';

export default function ProgressItem(props: { title: string; progress: ORDER_PROGRESS }) {
  const { title, progress } = props;
  const t = useTranslations('common');
  const { isLogin, isConnected, connect, login } = useUserInfo();

  const [isPending, startTransition] = useTransition();
  const { orderProgress, setOrderProgress } = useOrderProgress();

  const [variant, setVariant] = useState<Variant>('secondary');
  const selectedKOLs = useAppSelector((state) => state.userReducer?.selectedKOLs);
  const quickOrder = useAppSelector((state) => state.userReducer?.quickOrder);
  const selectedKOLInfo = useAppSelector((state) => state.userReducer?.selectedKOLInfo);
  const lang = useLocale();
  const dispatch = useAppDispatch();
  const handleClick = () => {
    startTransition(async () => {
      if (progress !== ORDER_PROGRESS.KOL_SQUARE) {
        if (!isLogin) {
          await login();

          return;
        } else if (!isConnected) {
          connect();

          return;
        }
      }

      if (selectedKOLs?.length === 0) {
        toast.error(t('error_select_kol'));
        setOrderProgress(ORDER_PROGRESS.KOL_SQUARE);
        return;
      }

      if (progress === ORDER_PROGRESS.KOL_PROMOTION || progress === ORDER_PROGRESS.PROMOTION_DATA) {
        if (!quickOrder?.order_id || !quickOrder?.project_id) {
          toast.error(t('error_order_not_found'));
          setOrderProgress(ORDER_PROGRESS.SUBMIT_ORDER);
          return;
        }
      }

      setOrderProgress(progress);
      if (progress !== ORDER_PROGRESS.KOL_SQUARE && selectedKOLs && selectedKOLs.length > 0) {
        getKOL(selectedKOLs[0].id.toString());
      }
    });
  };

  const getKOL = async (id: string) => {
    try {
      if (selectedKOLInfo && selectedKOLs && selectedKOLInfo.id === selectedKOLs[0].id) return;
      const res: any = await getKOLInfo(id, { language: lang });
      if (res.code === 200 && res.data) {
        dispatch(updateSelectedKOLInfo(res.data));
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    let variant: Variant = 'secondary';

    if (orderProgress > progress) {
      variant = 'outline';
    } else if (orderProgress === progress) {
      variant = 'default';
    }

    setVariant(variant);
  }, [orderProgress]);

  return (
    <Button
      variant={variant}
      onClick={handleClick}
      data-progress={progress}
      className={cn(
        'border-border text-muted-foreground dark:bg-background w-auto !rounded-full border bg-white font-bold shadow-[0px_0px_5px_0px_rgba(136,187,243,0.05)] sm:w-full',
        orderProgress >= progress &&
          'text-primary !border-primary/80 border-[3px] shadow-[0px_3px_10px_0px_rgba(136,187,243,0.05)] hover:bg-white/80'
      )}
      disabled={isPending}
    >
      {title}
    </Button>
  );
}
