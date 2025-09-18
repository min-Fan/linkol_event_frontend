'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { TableCell, TableRow } from '@shadcn-ui/table';
import { Checkbox } from '@shadcn-ui/checkbox';
import defaultAvatar from '@assets/image/avatar.png';
import { OrderTask, RankFirst, RankSecond, RankThird, TwitterBlack, View } from '@assets/svg';
import { IKOLHomeOrderList, IKOLHomeOrderListNoAuth, IKol, IProject } from 'app/@types/types';
import { formatNumberKMB, formatPrecision } from '@libs/utils';
import { useState, useEffect } from 'react';
import { updateSelectedKOLInfo } from '@store/reducers/userSlice';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getKOLInfo, kolTakeOrder } from '@libs/request';
import { Badge } from '@shadcn/components/ui/badge';
import { cn } from '@shadcn/lib/utils';
import { ChevronDown, Plus, Loader2 } from 'lucide-react';
import ProjectDetails from './ProjectDetails';
import ProjectInformation from './ProjectInformation';
import CountdownTimer from 'app/components/CountdownTimer';
import { Button } from '@shadcn/components/ui/button';
import OrderTaskKolsDialog from './OrderTaskKolsDialog';
import TwitterAuth from '@hooks/useTwitterAuth';
import { toast } from 'sonner';
import { useRouter, usePathname } from '@libs/i18n/navigation';
import { formatDate } from 'date-fns';
import UIDialogKOLLogin from '@ui/dialog/KOLLogin';
import OrdeRexpiredTipsMsg from './OrdeRexpiredTipsMsg';

export default function OrderListItem(props: {
  kol: IKol;
  orderItem: IKOLHomeOrderList | IKOLHomeOrderListNoAuth;
}) {
  const { kol, orderItem } = props;
  const t = useTranslations('common');
  const isLoggedIn = useAppSelector((state) => state.userReducer?.isLoggedIn);
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const payTokenInfo = useAppSelector((state) => state.userReducer?.pay_token_info);
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // 获取订单相关数据
  const buyAgentOrder = 'buy_agent_order' in orderItem ? orderItem.buy_agent_order : orderItem;

  const project = buyAgentOrder.project;
  const startTime = buyAgentOrder.promotional_start_at
    ? new Date(buyAgentOrder.promotional_start_at).getTime()
    : 0;
  const endTime = buyAgentOrder.promotional_end_at
    ? new Date(buyAgentOrder.promotional_end_at).getTime()
    : 0;
  const promotionalTimeText =
    buyAgentOrder.promotional_start_at && buyAgentOrder.promotional_end_at
      ? `${formatDate(buyAgentOrder.promotional_start_at, 'yyyy-MM-dd')} - ${formatDate(buyAgentOrder.promotional_end_at, 'yyyy-MM-dd')}`
      : '';

  const [isLoading, setIsLoading] = useState(false);
  const acceptTask = async (action_type: 'take' | 'vie') => {
    try {
      setIsLoading(true);
      const res: any = await kolTakeOrder({
        action_type,
        order_item_id: Number(orderItem.id),
      });
      setIsLoading(false);
      if (res.code === 200) {
        toast.success(t('accept_task_success'));
        router.push(`/kol/order/${orderItem.id}`);
      } else {
        toast.error(res.msg);
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(error.message);
      console.error(error);
    }
  };

  const action_type = 'action_type' in orderItem ? orderItem.action_type || '' : '';

  // 添加预加载函数
  const prefetchOrderDetail = () => {
    router.prefetch(`/kol/order/${orderItem.id}`);
  };

  return (
    <>
      <TableRow className="border-none" onMouseEnter={prefetchOrderDetail}>
        <TableCell className="cursor-pointer">
          <ProjectInformation projectName={project?.name} projectIcon={project?.icon} />
        </TableCell>
        <TableCell>
          <div className="flex items-center justify-start">
            <span>{buyAgentOrder?.remain_amount}</span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center justify-start">
            <span>{orderItem.amount}</span>
            <span className="text-muted-foreground/60 text-xs lowercase">/tweet</span>
          </div>
        </TableCell>
        <TableCell>
          <div className={cn('flex items-center justify-start')}>
            <span>{promotionalTimeText}</span>
          </div>
        </TableCell>
        <TableCell>
          {isLoggedIn ? (
            <div className="flex w-full cursor-pointer flex-col items-center justify-start gap-1">
              <div className="flex w-full flex-nowrap items-center justify-start gap-2">
                <div className="relative flex max-w-[160px] flex-nowrap items-center overflow-hidden pl-2">
                  {buyAgentOrder &&
                    'kol_icons' in buyAgentOrder &&
                    buyAgentOrder.kol_icons?.slice(0, 5).map((icon, index) => (
                      <div
                        className="border-border -ml-2 size-6 min-w-6 overflow-hidden rounded-full border-1"
                        key={index}
                      >
                        <img
                          src={icon || defaultAvatar.src}
                          alt={''}
                          className="size-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = defaultAvatar.src;
                          }}
                        />
                      </div>
                    ))}
                </div>
                <span className="text-xs lowercase">
                  {buyAgentOrder &&
                    'kol_accept_num' in buyAgentOrder &&
                    'kol_num' in buyAgentOrder &&
                    `${buyAgentOrder?.kol_accept_num}/${buyAgentOrder?.kol_num} ${t('kol_accepted')}`}
                </span>
              </div>
            </div>
          ) : (
            // <OrderTaskKolsDialog
            //   orderId={buyAgentOrder.id?.toString() || ''}
            //   created_at={orderItem.created_at}
            //   action_type={action_type}
            // >
            //   <div className="flex w-full cursor-pointer flex-col items-center justify-start gap-1">
            //     <div className="flex w-full flex-nowrap items-center justify-start gap-2">
            //       <div className="relative flex max-w-[160px] flex-nowrap items-center overflow-hidden pl-2">
            //         {buyAgentOrder &&
            //           'kol_icons' in buyAgentOrder &&
            //           buyAgentOrder.kol_icons?.slice(0, 5).map((icon, index) => (
            //             <div
            //               className="border-border -ml-2 size-6 min-w-6 overflow-hidden rounded-full border-1"
            //               key={index}
            //             >
            //               <img
            //                 src={icon || defaultAvatar.src}
            //                 alt={''}
            //                 className="size-full"
            //                 onError={(e) => {
            //                   const target = e.target as HTMLImageElement;
            //                   target.src = defaultAvatar.src;
            //                 }}
            //               />
            //             </div>
            //           ))}
            //       </div>
            //       <span className="text-xs lowercase">
            //         {buyAgentOrder &&
            //           'kol_accept_num' in buyAgentOrder &&
            //           'kol_num' in buyAgentOrder &&
            //           `${buyAgentOrder?.kol_accept_num}/${buyAgentOrder?.kol_num} ${t('kol_accepted')}`}
            //       </span>
            //     </div>
            //   </div>
            // </OrderTaskKolsDialog>
            <div className="flex w-full flex-col items-center justify-start gap-1">
              <div className="flex w-full flex-nowrap items-center justify-start gap-2">
                <div className="relative flex max-w-[160px] flex-nowrap items-center overflow-hidden pl-2">
                  {'kol_data' in orderItem &&
                    orderItem?.kol_data?.kol_icons?.slice(0, 5).map((icon, index) => (
                      <div
                        className="border-border -ml-2 size-6 min-w-6 overflow-hidden rounded-full border-1"
                        key={index}
                      >
                        <img
                          src={icon || defaultAvatar.src}
                          alt={''}
                          className="size-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = defaultAvatar.src;
                          }}
                        />
                      </div>
                    ))}
                </div>
                <span className="text-xs lowercase">
                  {orderItem &&
                    'kol_data' in orderItem &&
                    `${orderItem.kol_data?.kol_accept_num}/${orderItem.kol_data?.kol_num} ${t('kol_accepted')}`}
                </span>
              </div>
            </div>
          )}
        </TableCell>
        <TableCell>
          <div className="flex items-center justify-end gap-4">
            {!isLoggedIn ? (
              // <UIDialogKOLLogin />
              <></>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1">
                {'action_type' in orderItem && orderItem.action_type === 'accept' ? (
                  <div
                    className={cn(
                      'bg-primary flex cursor-pointer items-center gap-1 rounded-lg p-2',
                      isLoading && 'pointer-events-none opacity-50'
                    )}
                    onClick={() => acceptTask('take')}
                  >
                    {isLoading ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <OrderTask className="size-5" />
                    )}
                    <span className="text-md text-white">{t('accept_task')}</span>
                  </div>
                ) : 'action_type' in orderItem && orderItem.action_type === 'vie' ? (
                  <div
                    className={cn(
                      'border-primary text-primary hover:bg-primary flex cursor-pointer items-center gap-1 rounded-lg border p-2 transition-all duration-300 hover:text-white',
                      isLoading && 'pointer-events-none opacity-50'
                    )}
                    onClick={() => acceptTask('vie')}
                  >
                    {isLoading ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <Plus className="size-5" />
                    )}
                    <span className="text-md">{t('join_waitlist')}</span>
                  </div>
                ) : 'action_type' in orderItem && orderItem.action_type === 'post' ? (
                  <div
                    className="border-primary text-primary hover:bg-primary flex cursor-pointer items-center gap-1 rounded-lg border p-2 px-4 transition-all duration-300 hover:text-white"
                    onClick={() => {
                      router.push(`/kol/order/${orderItem.id}`);
                    }}
                  >
                    <TwitterBlack className="size-5" />
                    <span className="text-md">{t('post')}</span>
                  </div>
                ) : 'kol_audit_status' in orderItem && orderItem.kol_audit_status === 'done' ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      router.push(`/kol/order/${orderItem.id}`);
                    }}
                  >
                    <span>{t('complete_task')}</span>
                  </Button>
                ) : 'action_type' in orderItem && orderItem.action_type === 'expired' ? (
                  orderItem.kol_audit_status == 'refunded' ? (
                    <OrdeRexpiredTipsMsg type={1}>
                      <Button variant="secondary">
                        <span>{t('task_end')}</span>
                      </Button>
                    </OrdeRexpiredTipsMsg>
                  ) : (
                    <OrdeRexpiredTipsMsg type={2}>
                      <Button variant="secondary">
                        <span>{t('task_end')}</span>
                      </Button>
                    </OrdeRexpiredTipsMsg>
                  )
                ) : 'action_type' in orderItem &&
                  orderItem.action_type === '' &&
                  orderItem.kol_audit_status === 'pending' ? (
                  <div
                    className={cn(
                      'bg-primary flex cursor-pointer items-center gap-1 rounded-lg p-2',
                      isLoading && 'pointer-events-none opacity-50'
                    )}
                    onClick={() => acceptTask('take')}
                  >
                    {isLoading ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <OrderTask className="size-5" />
                    )}
                    <span className="text-md text-white">{t('accept_task')}</span>
                  </div>
                ) : 'action_type' in orderItem &&
                  orderItem.action_type === '' &&
                  orderItem.kol_audit_status === 'doing' ? (
                  <div
                    className="border-primary text-primary hover:bg-primary flex cursor-pointer items-center gap-1 rounded-lg border p-2 px-4 transition-all duration-300 hover:text-white"
                    onClick={() => {
                      router.push(`/kol/order/${orderItem.id}`);
                    }}
                  >
                    <TwitterBlack className="size-5" />
                    <span className="text-md">{t('post')}</span>
                  </div>
                ) : 'action_type' in orderItem &&
                  orderItem.action_type === '' &&
                  orderItem.kol_audit_status === 'reject' ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      router.push(`/kol/order/${orderItem.id}`);
                    }}
                  >
                    <span>{t('reject_task')}</span>
                  </Button>
                ) : 'action_type' in orderItem &&
                  orderItem.action_type === '' &&
                  orderItem.kol_audit_status === 'refunded' ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      router.push(`/kol/order/${orderItem.id}`);
                    }}
                  >
                    <span>{t('refund_task')}</span>
                  </Button>
                ) : 'action_type' in orderItem &&
                  orderItem.action_type === '' &&
                  orderItem.kol_audit_status === 'executed' ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      router.push(`/kol/order/${orderItem.id}`);
                    }}
                  >
                    <span>{t('claim_reward')}</span>
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      router.push(`/kol/order/${orderItem.id}`);
                    }}
                  >
                    <span>{t('not_task')}</span>
                  </Button>
                )}
                {'action_type' in orderItem &&
                  (orderItem.action_type === 'vie' || orderItem.action_type === 'post') &&
                  orderItem.kol_audit_status !== 'done' && (
                    <div className="text-md text-muted-foreground/60 flex items-center justify-end gap-1">
                      <span>{startTime > Date.now() ? t('start_in') : t('end_in')}</span>
                      <CountdownTimer startTime={startTime} endTime={endTime} onEnd={() => {}} />
                    </div>
                  )}
              </div>
            )}
            <div
              onClick={toggleExpand}
              className="bg-muted-foreground/10 text-muted-foreground/80 hover:bg-muted-foreground/20 flex h-10 w-10 cursor-pointer items-center justify-center gap-2 rounded-lg p-2 transition-all duration-300"
            >
              <ChevronDown
                className={cn(
                  'size-5 transition-transform duration-300',
                  isExpanded && 'rotate-180'
                )}
              />
            </div>
          </div>
        </TableCell>
      </TableRow>
      <TableRow className="border-border hover:bg-transparent">
        <TableCell colSpan={6} className="overflow-hidden p-0">
          <div
            className={cn(
              'w-full transition-all duration-300 ease-in-out',
              isExpanded ? 'max-h-[400px] p-2 opacity-100' : 'max-h-0 p-0 opacity-0'
            )}
          >
            <ProjectDetails
              orderItem={orderItem}
              projectInfo={project as IProject}
              promotionalMaterials={buyAgentOrder.promotional_materials}
            />
          </div>
        </TableCell>
      </TableRow>
    </>
  );
}
