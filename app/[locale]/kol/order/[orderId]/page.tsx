'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@shadcn-ui/button';
import { ChevronLeft, CircleCheckBig, Loader2, LoaderCircle, Plus } from 'lucide-react';
import { Card, CardContent } from '@shadcn-ui/card';
import { useRouter } from '@libs/i18n/navigation';
import { useParams } from 'next/navigation';
import {
  brandinPaymentProcessed,
  getKOLOrderDetail,
  getKolWithdrawSignature,
  getTweetTypeAndAddOnService,
  getWithdraw,
  kolTakeOrder,
} from '@libs/request';
import defaultAvatar from '@assets/image/avatar.png';
import { IKolOrderDetail, OrderPreviewType } from 'app/@types/types';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import OrderPreview from './components/order-preview';
import { useOrderPreview } from 'app/context/OrderPreviewContext';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { cn } from '@shadcn/lib/utils';
import { getContractAddress } from '@constants/config';
import { erc20Abi } from 'viem';
import {
  CampaignRequirement,
  AITweet2,
  Company,
  CPM,
  ImageThread,
  OrderTask,
  ProjectDescription,
  PromoteTime,
  PromotionalMaterials,
  TextIcon,
  TextImage,
  TextThread,
  TwitterBlack,
  Website,
} from '@assets/svg';
import AlreadyPostDialog from './components/already-post-dialog';
import { format, parseISO, isWithinInterval, startOfDay } from 'date-fns';
import EvmConnect from 'app/components/evm-connect';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import CountdownTimer from 'app/components/CountdownTimer';
import { Skeleton } from '@shadcn-ui/skeleton';
import TokenIcon from 'app/components/TokenIcon';
import KOLService_abi from '@constants/abi/KOLService_abi.json';
import { getExplorerLink } from '@constants/chains';
import { formatDateYMDHMS } from '@libs/utils';
import { toContractAmount } from '@libs/utils/format-bignumber';
import { useLocale } from 'next-intl';
interface TweetType {
  id: number;
  name: {
    en: string;
    zh: string;
  };
  code: string;
  price_rate: number;
  require: {
    en: string;
    zh: string;
  };
  s_type: string;
  is_delete: boolean;
}

interface ExtraService {
  id: number;
  name: {
    en: string;
    zh: string;
  };
  code: string;
  price_rate: number;
  require: {
    en: string;
    zh: string;
  };
  s_type: string;
  is_delete: boolean;
}

interface ServiceData {
  exts: ExtraService[];
  tweet_types: TweetType[];
}

export default function KOLPage() {
  const locale = useLocale();
  const payTokenInfo = useAppSelector((state) => state.userReducer?.pay_token_info);
  const { address } = useAccount();
  const t = useTranslations('common');
  const router = useRouter();
  const { orderId } = useParams();
  const [orderInfo, setOrderInfo] = useState<IKolOrderDetail>();
  const { setStatus, reload, isPost, setIsPost } = useOrderPreview();
  const isLoggedIn = useAppSelector((state) => state.userReducer?.isLoggedIn);
  const [isLoading, setIsLoading] = useState(false);
  const [alreadyOpen, setAlreadyOpen] = useState(false);
  const [serviceData, setServiceData] = useState<ServiceData | null>(null);
  const startTime = useRef<number>(0);
  const endTime = useRef<number>(0);
  const { chainId } = useAccount();
  const {
    data: payForKolHash,
    writeContract: writeContractPayForKol,
    isPending: isPendingPayForKol,
    isError: isErrorPayForKol,
    error: errorPayForKol,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isErrorWaitForTransactionReceipt,
    error: errorWaitForTransactionReceipt,
  } = useWaitForTransactionReceipt({
    hash: payForKolHash,
  });

  const pay_token_info = useAppSelector((state) => state.userReducer?.pay_token_info);

  useEffect(() => {
    if (reload || isLoggedIn) {
      init();
    }
  }, [reload, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/kol');
    }
  }, [isLoggedIn]);

  const formatTime = (timestamp: string | number | undefined) => {
    if (!timestamp) return '--';
    try {
      return format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss');
    } catch (error) {
      return '--';
    }
  };

  const init = async () => {
    try {
      setIsLoading(true);
      const res: any = await getKOLOrderDetail({ order_item_id: orderId });

      if (res && res.code === 200 && res.data[0]) {
        if (
          res.data[0].kol_audit_status !== 'done' &&
          res.data[0].kol_audit_status !== 'executed'
        ) {
          setStatus(OrderPreviewType.POST_CONTENT);
        }
        setOrderInfo(res.data[0]);
        startTime.current = parseISO(res.data[0].buy_agent_order.promotional_start_at).getTime();
        endTime.current = parseISO(res.data[0].buy_agent_order.promotional_end_at).getTime();
        check(res.data[0]);
      } else {
        // toast.error(res.msg);
        router.push('/kol');
      }

      const serviceRes: any = await getTweetTypeAndAddOnService();
      if (serviceRes.code === 200) {
        setServiceData(serviceRes.data);
      }
    } catch (error) {
      toast.error(error.message);
      console.log('error', error);
    } finally {
      setIsLoading(false);
    }
  };

  const check = (info) => {
    const startTime = info?.buy_agent_order.promotional_start_at;
    const endTime = info?.buy_agent_order.promotional_end_at;
    if (startTime && endTime) {
      const isInRange = isWithinInterval(new Date(), {
        start: parseISO(startTime),
        end: parseISO(endTime),
      });
      setIsPost(isInRange);
    } else {
      setIsPost(false);
    }
  };

  const acceptTask = async (action_type: 'take' | 'vie') => {
    try {
      setIsLoading(true);
      const res: any = await kolTakeOrder({
        action_type,
        order_item_id: Number(orderId),
      });
      setIsLoading(false);
      if (res.code === 200) {
        toast.success(t('accept_task_success'));
        init();
      } else {
        toast.error(res.msg);
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(error.message);
      console.error(error);
    }
  };

  const [claimLoading, setClaimLoading] = useState(false);

  const kolClaimSignature = async () => {
    try {
      if (!address || !orderId) {
        toast.error('Please connect your wallet');
        return;
      }
      const res: any = await getKolWithdrawSignature({
        order_item_id: orderId as string,
        address: address,
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

  const claim = async () => {
    try {
      setClaimLoading(true);
      // 1. 获取签名
      const signatureData = await kolClaimSignature();
      if (!signatureData) {
        toast.error(t('claim_failed_get_signature'));
        return;
      }

      // 2. 调用合约
      writeContractPayForKol({
        address: getContractAddress()?.KOLServiceAddress as `0x${string}`,
        abi: KOLService_abi,
        functionName: 'payForKol',
        args: [
          signatureData.kolAddress as `0x${string}`,
          toContractAmount(signatureData.amount, 0),
          signatureData.timestamp,
          signatureData.projectAddress as `0x${string}`,
          signatureData.orderId,
          signatureData.signature as `0x${string}`,
        ],
      });
    } catch (error) {
      toast.error(error.message);
      console.log('error', error);
    } finally {
      setClaimLoading(false);
    }
  };

  // 监听 payForKol 方法调用结果
  useEffect(() => {
    if (isErrorWaitForTransactionReceipt) {
      setClaimLoading(false);
      const errorMessage = errorWaitForTransactionReceipt?.message;
      const match = errorMessage?.match(/execution reverted: (.+?)(?:\n|$)/);
      const shortMessage = match ? match[1] : t('claim_failed');
      toast.error(shortMessage);
    }
    if (isErrorPayForKol) {
      setClaimLoading(false);
      toast.error(t('claim_failed'));
    }
    if (isPendingPayForKol) {
      setClaimLoading(true);
    }
  }, [
    isErrorPayForKol,
    errorPayForKol,
    isConfirmed,
    isPendingPayForKol,
    isConfirming,
    isErrorWaitForTransactionReceipt,
    errorWaitForTransactionReceipt,
  ]);

  const handlePaymentProcessed = async () => {
    const res: any = await brandinPaymentProcessed({
      kol: address as string,
      token: '',
      amount: orderInfo?.amount.toString() as string,
      orderId: orderId as string,
    });
    if (res.code === 200) {
      toast.success(t('payment_processed_success'));
    } else {
      toast.error(res.msg);
    }
  };

  // 监听交易确认状态
  useEffect(() => {
    if (isConfirmed) {
      setClaimLoading(false);
      if (orderInfo) {
        setOrderInfo({
          ...orderInfo,
          kol_audit_status: 'done',
        });
      }
      toast.success(t('claim_success'), {
        action: (
          <Button
            variant="outline"
            onClick={() =>
              window.open(
                getExplorerLink(chainId as number, payForKolHash as `0x${string}`),
                '_blank'
              )
            }
          >
            {t('view_transaction')}
          </Button>
        ),
      });
      // init();
      // router.push('/kol');
    }
  }, [isConfirmed, payForKolHash, chainId]);

  return (
    <div className="mx-auto box-border flex h-full w-full max-w-[1600px] items-start gap-x-4 p-4 pt-6">
      {/* left */}
      <article className="w-full flex-1 space-y-4">
        <div className="box-border space-y-5 md:pr-10 lg:pr-20">
          <div className="flex flex-row items-center justify-between">
            <Button
              variant="secondary"
              onClick={() => {
                router.push('/kol');
              }}
            >
              <ChevronLeft className="text-muted-foreground size-4" />
              <span>{t('btn_back')}</span>
            </Button>

            {/* action */}
            <div className="flex items-center justify-end gap-4">
              {isLoggedIn && (
                <div className="flex flex-col items-center justify-center gap-1">
                  {orderInfo?.action_type === 'accept' ? (
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
                  ) : orderInfo?.action_type === 'vie' ? (
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
                  ) : orderInfo?.action_type === 'post' ? (
                    //发送推文
                    <>
                      {isPost ? (
                        <div className="flex items-center gap-x-3">
                          <div
                            className="text-md hover:text-primary cursor-pointer text-[#999] underline"
                            onClick={() => setAlreadyOpen(true)}
                          >
                            {t('already_posted')}?
                          </div>
                          <div
                            className="text-primary bg-primary/15 flex items-center gap-1 rounded-lg p-2 px-4 transition-all duration-300"
                            onClick={() => {
                              setStatus(OrderPreviewType.POST_CONTENT);
                            }}
                          >
                            <AITweet2 className="size-6" />
                            <span className="text-md text-primary">{t('AI_tweet')}</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Button variant="secondary">
                            <div className="text-md space-x-2">
                              <span>
                                {startTime.current > Date.now() ? t('start_in') : t('end_in')}
                              </span>
                              <CountdownTimer
                                startTime={startTime.current}
                                endTime={endTime.current}
                                onEnd={() => init()}
                              ></CountdownTimer>
                            </div>
                          </Button>
                        </>
                      )}
                    </>
                  ) : orderInfo?.action_type === 'expired' ? (
                    <Button variant="secondary">
                      <span>{t('task_end')}</span>
                    </Button>
                  ) : orderInfo?.action_type === '' && orderInfo.kol_audit_status === 'pending' ? (
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
                  ) : orderInfo?.action_type === '' && orderInfo.kol_audit_status === 'doing' ? (
                    <>
                      {isPost ? (
                        <div className="flex items-center gap-x-3">
                          <div
                            className="text-md hover:text-primary cursor-pointer text-[#999] underline"
                            onClick={() => setAlreadyOpen(true)}
                          >
                            {t('already_posted')}?
                          </div>
                          <div
                            className="text-primary bg-primary/15 flex items-center gap-1 rounded-lg p-2 px-4 transition-all duration-300"
                            onClick={() => {
                              setStatus(OrderPreviewType.POST_CONTENT);
                            }}
                          >
                            <AITweet2 className="size-6" />
                            <span className="text-md text-primary">{t('AI_tweet')}</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Button variant="secondary">
                            <div className="text-md space-x-2">
                              <span>
                                {startTime.current > Date.now() ? t('start_in') : t('end_in')}
                              </span>
                              <CountdownTimer
                                startTime={startTime.current}
                                endTime={endTime.current}
                                onEnd={() => init()}
                              ></CountdownTimer>
                            </div>
                          </Button>
                        </>
                      )}
                    </>
                  ) : orderInfo?.action_type === '' &&
                    (orderInfo.kol_audit_status === 'finished' ||
                      orderInfo?.kol_audit_status === 'done') ? (
                    <Button variant="secondary">
                      <span>{t('complete_task')}</span>
                    </Button>
                  ) : orderInfo?.action_type === '' && orderInfo?.kol_audit_status === 'reject' ? (
                    <Button variant="secondary">
                      <span>{t('reject_task')}</span>
                    </Button>
                  ) : orderInfo?.action_type === '' &&
                    orderInfo?.kol_audit_status === 'refunded' ? (
                    <Button variant="secondary">
                      <span>{t('refund_task')}</span>
                    </Button>
                  ) : orderInfo?.action_type === '' &&
                    orderInfo?.kol_audit_status === 'executed' ? (
                    <Button variant="secondary">
                      <span>{t('claim_reward')}</span>
                    </Button>
                  ) : (
                    <Button variant="secondary">
                      <span>{t('not_task')}</span>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="text-md flex w-full font-medium">
            <Card className="relative w-50 bg-[#0F1013] py-5">
              <CardContent className="flex h-full flex-col items-stretch justify-between px-3 text-white">
                <div className="flex items-center gap-x-1 text-white">
                  <Company className="size-6"></Company>
                  {t('project_name')}
                </div>
                <div className="flex items-center justify-end gap-x-1.5">
                  <span>{orderInfo?.buy_agent_order?.project?.name}</span>
                </div>
                <div className="absolute bottom-2 left-2 z-1 size-18">
                  <img
                    src={orderInfo?.buy_agent_order?.project?.icon || defaultAvatar.src}
                    alt={''}
                    className="size-18 rounded-full blur-[5px]"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = defaultAvatar.src;
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="-ml-2 box-border flex flex-1 flex-col gap-y-3 rounded-l-none pr-6 pl-7">
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground flex items-center gap-x-1">
                  <PromoteTime className="size-6"></PromoteTime>
                  {t('promote_time')}
                </div>
                {isLoading ? (
                  <div className="flex items-center justify-end gap-x-1">
                    <Skeleton className="h-4 w-20" />
                    <div className="h-[1px] w-5 border"></div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                ) : (
                  <div>
                    {orderInfo?.buy_agent_order?.promotional_start_at && (
                      <div className="flex items-center justify-end gap-x-1">
                        <div>{formatTime(orderInfo?.buy_agent_order?.promotional_start_at)}</div>
                        <div className="h-[1px] w-5 border"></div>
                        <div>{formatTime(orderInfo?.buy_agent_order?.promotional_end_at)}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-muted-foreground flex items-center gap-x-1">
                  <CPM className="size-6"></CPM>
                  {t('payment_amount')}
                </div>
                {isLoading ? (
                  <div className="flex items-center justify-end gap-x-1.5">
                    <Skeleton className="h-6 w-16" />
                  </div>
                ) : (
                  <div className="flex items-center justify-end gap-x-1.5">
                    <div className="font-bold">
                      ${orderInfo?.amount ? orderInfo.amount.toFixed(2) : 0}
                    </div>
                    <div className="flex flex-row items-center gap-x-0.5">
                      <TokenIcon type={''} className="size-4" />
                    </div>
                  </div>
                )}
              </div>

              {isLoggedIn && (
                <div className="flex items-center justify-end">
                  {orderInfo?.kol_audit_status === 'done' ? (
                    <div className="border-primary box-border w-max rounded-lg border px-3 py-2">
                      <div className="text-primary flex space-x-4">
                        <CircleCheckBig />
                        <span>{t('reward_claimed')}</span>
                        <span className="box-border border-l pl-4 font-bold">
                          ${orderInfo?.amount ? orderInfo.amount.toFixed(2) : 0}
                        </span>
                      </div>
                    </div>
                  ) : orderInfo?.kol_audit_status === 'executed' ? (
                    <>
                      {address ? (
                        <Button
                          className="bg-primary !h-auto !rounded-lg"
                          onClick={claim}
                          disabled={claimLoading}
                        >
                          {claimLoading ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                          ) : (
                            <div className="space-x-2">
                              <span>{t('claim_reward')}</span>
                              <span className="box-border border-l pl-2">
                                ${orderInfo?.amount ? orderInfo.amount.toFixed(2) : 0}
                              </span>
                            </div>
                          )}
                        </Button>
                      ) : (
                        <div className="w-20">
                          <EvmConnect />
                        </div>
                      )}
                    </>
                  ) : (
                    <></>
                  )}
                </div>
              )}
            </Card>
          </div>

          <div className="mt-10 space-y-10">
            <Card className="box-border p-6 shadow-none">
              <CardContent className="p-0">
                <div className="text-md space-y-5">
                  <div className="text-muted-foreground text-md flex items-center gap-x-1 font-medium">
                    <CampaignRequirement className="size-5"></CampaignRequirement>
                    {t('campaign_requirement')}
                  </div>
                  {isLoading ? (
                    <div className="box-border space-y-2 p-0 px-4 font-normal">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  ) : (
                    <div className="box-border grid grid-cols-1 gap-6 px-0.5 sm:grid-cols-3">
                      <Card className="ring-primary/15 box-border cursor-pointer gap-2 rounded-3xl border-none px-6 py-4 shadow-[0px_4px_6px_0px_rgba(0,0,0,0.05)] ring-2 transition-all">
                        <div className="gap-0 p-0">
                          <div className="flex items-center justify-between">
                            <div className="text-md flex items-center gap-1 font-medium">
                              {orderInfo?.buy_agent_order?.tweet_service_type.code ===
                                'standard' && <TextIcon className="size-6 min-w-6" />}
                              {orderInfo?.buy_agent_order?.tweet_service_type.code ===
                                'standard_images' && <TextThread className="size-6 min-w-6" />}
                              {orderInfo?.buy_agent_order?.tweet_service_type.code ===
                                'standard_image' && <TextImage className="size-6 min-w-6" />}
                              {orderInfo?.buy_agent_order?.tweet_service_type.code ===
                                'standard_tweets' && <ImageThread className="size-6 min-w-6" />}
                              <span>{orderInfo?.buy_agent_order?.tweet_service_type[locale]}</span>
                            </div>
                          </div>
                        </div>
                        <CardContent className="text-md flex flex-col gap-2 p-0 font-medium">
                          <div className="text-[#999]">
                            {
                              serviceData?.tweet_types?.find(
                                (item) =>
                                  item.code == orderInfo?.buy_agent_order?.tweet_service_type.code
                              )?.require[locale]
                            }
                          </div>
                          <div className="text-primary">
                            {' '}
                            {serviceData?.tweet_types?.find(
                              (item) =>
                                item.code == orderInfo?.buy_agent_order?.tweet_service_type.code
                            )?.price_rate === 100
                              ? t('original_price')
                              : t('original_price_with_rate', {
                                  rate:
                                    serviceData?.tweet_types?.find(
                                      (item) =>
                                        item.code ==
                                        orderInfo?.buy_agent_order?.tweet_service_type.code
                                    )?.price_rate || 0,
                                })}
                          </div>
                        </CardContent>
                      </Card>

                      {orderInfo?.buy_agent_order?.ext_tweet_service_types &&
                        orderInfo?.buy_agent_order.ext_tweet_service_types.map((item, index) => {
                          return (
                            <Card
                              className="ring-primary/15 box-border cursor-pointer gap-2 rounded-3xl border-none px-6 py-4 shadow-[0px_4px_6px_0px_rgba(0,0,0,0.05)] ring-2 transition-all"
                              key={index}
                            >
                              <div className="gap-0 p-0">
                                <div className="flex items-center justify-between">
                                  <div className="text-md flex items-center gap-1 font-medium">
                                    {item.name[locale]}
                                  </div>
                                </div>
                              </div>
                              <CardContent className="text-md flex flex-col gap-2 p-0 font-medium">
                                <div className="text-[#999]">
                                  {
                                    serviceData?.exts?.find((sd) => sd.code == item.code)?.require[
                                      locale
                                    ]
                                  }
                                </div>
                                <div className="text-primary">
                                  {' '}
                                  {serviceData?.exts?.find((sd) => item.code == item.code)
                                    ?.price_rate === 100
                                    ? t('original_price')
                                    : t('original_price_with_rate', {
                                        rate:
                                          serviceData?.exts?.find((sd) => sd.code == item.code)
                                            ?.price_rate || 0,
                                      })}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="box-border p-6 shadow-none">
              <CardContent className="p-0">
                <div className="text-md space-y-5">
                  <div className="text-muted-foreground text-md flex items-center gap-x-1 font-medium">
                    <ProjectDescription className="size-5"></ProjectDescription>
                    {t('Project_description')}
                  </div>
                  {isLoading ? (
                    <div className="box-border space-y-2 p-0 px-4 font-normal">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  ) : (
                    <div className="box-border p-0 px-4 font-normal">
                      {orderInfo?.buy_agent_order?.project?.desc}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="box-border p-6 shadow-none">
              <CardContent className="p-0">
                <div className="text-md space-y-5">
                  <div className="text-muted-foreground text-md flex items-center gap-x-1 font-medium">
                    <PromotionalMaterials className="size-5"></PromotionalMaterials>
                    {t('promotional_materials')}
                  </div>
                  {isLoading ? (
                    <div className="box-border space-y-2 p-0 px-4 font-normal">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  ) : (
                    <div className="box-border p-0 px-4 font-normal">
                      {orderInfo?.buy_agent_order?.promotional_materials}
                    </div>
                  )}

                  {orderInfo?.buy_agent_order?.medias &&
                    orderInfo?.buy_agent_order?.medias.length > 0 && (
                      <>
                        <div>
                          <div className="text-muted-foreground text-md flex items-center gap-x-1 font-medium">
                            {t('required_images')}
                          </div>
                        </div>
                        {isLoading ? (
                          <div className="box-border space-y-2 p-0 px-4 font-normal">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-5/6" />
                          </div>
                        ) : (
                          <div className="box-border grid grid-cols-1 gap-6 px-0.5 sm:grid-cols-4">
                            {orderInfo?.buy_agent_order?.medias.map((item, index) => (
                              <div
                                key={index}
                                className="relative min-h-32.5 overflow-hidden rounded-3xl"
                              >
                                <img
                                  src={item}
                                  alt={`uploaded-image-${index}`}
                                  className="size-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <AlreadyPostDialog
          orderId={orderId}
          isOpen={alreadyOpen}
          onClose={() => setAlreadyOpen(false)}
          onConfirm={() => {}}
        ></AlreadyPostDialog>
      </article>

      {/* right */}
      <aside className="sticky top-20 right-0 z-50 h-[calc(100dvh-7rem)] w-75 min-w-75 xl:w-100">
        {isLoading ? (
          <Card className="h-full w-full overflow-hidden py-0">
            <CardContent className="flex h-full w-full flex-col px-0">
              <div className="border-border w-full border-b">
                <div className="relative h-24 w-full">
                  <Skeleton className="h-full w-full" />
                  <div className="bg-muted-foreground border-background absolute bottom-0 left-4 size-16 translate-y-1/2 overflow-hidden rounded-full border-4">
                    <Skeleton className="h-full w-full" />
                  </div>
                </div>
                <div className="space-y-1 p-2 pt-4">
                  <div className="h-3"></div>
                  <div className="flex items-baseline space-x-1 overflow-hidden">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>
              <div className="box-border w-full flex-1 overflow-hidden">
                <div className="box-border h-full w-full p-2">
                  <div className="flex w-full flex-col gap-2">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          orderInfo && <OrderPreview kol={orderInfo.kol} orderDetail={orderInfo} />
        )}
      </aside>
    </div>
  );
}
