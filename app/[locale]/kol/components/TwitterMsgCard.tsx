import React, { useEffect, useRef } from 'react';
import {
  HugeiconsLimitation,
  InteractionRate,
  Notice,
  PriceRank,
  ProiconXTwitter,
  TotalEarn,
  TransmissionRate,
  UnitPrice,
  FocusScore,
} from '@assets/svg';
import { formatNumberKMB } from '@libs/utils';
import { Card, CardContent } from '@shadcn/components/ui/card';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { Link, useRouter } from '@libs/i18n/navigation';
import { getKOLUserInfo, getKolIncome, getKolMessagesList } from '@libs/request';
import { updateTwitterFullProfile } from '@store/reducers/userSlice';
import { useQuery } from '@tanstack/react-query';
import defaultAvatar from '@assets/image/avatar.png';
import { formatDate } from 'date-fns';
import { ScrollArea } from '@shadcn/components/ui/scroll-area';
import { useTranslations } from 'next-intl';
import UIDialogBindEmail from '@ui/dialog/BindEmail';

export default function TwitterMsgCard() {
  const t = useTranslations('common');
  const isLoggedIn = useAppSelector((state) => state.userReducer?.isLoggedIn);
  const twitterFullProfile = useAppSelector((state) => state.userReducer?.twitter_full_profile);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const fakeTriggerRef = useRef<HTMLSpanElement>(null);
  const getUserInfo = async () => {
    try {
      const res = await getKOLUserInfo();
      if (res.code === 200) {
        dispatch(updateTwitterFullProfile(res.data));
        if (res.data.email == '') {
          fakeTriggerRef.current?.click();
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const kolIncome = async () => {
    try {
      const res = await getKolIncome();
      console.log(res);
      if (res.code === 200) {
        dispatch(updateTwitterFullProfile(res.data));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handled = useRef(false);
  useEffect(() => {
    if (handled.current) return;
    if (!isLoggedIn) {
      router.push('/kol');
      return;
    }
    getUserInfo();
    kolIncome();
    handled.current = true;
  }, [isLoggedIn]);

  const { data: messagesList } = useQuery({
    queryKey: ['messagesList'],
    queryFn: () =>
      getKolMessagesList({
        msg_type: 'project_paid',
        limit: 10,
      }),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    staleTime: 10000,
    enabled: !!isLoggedIn,
  });

  return (
    <>
      <div className="relative box-border flex w-full flex-col gap-4 md:flex-row">
        <Card className="w-full flex-1 gap-2 rounded-3xl border-none shadow-[0_0_4px_4px_rgba(0,0,0,0.05)]">
          <CardContent className="box-border flex flex-col flex-wrap gap-3">
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
              <div className="flex flex-1 flex-row items-center gap-3">
                <div className="border-border bg-background box-border flex size-25 min-w-25 items-center justify-center overflow-hidden rounded-full border">
                  <img
                    src={twitterFullProfile?.profile_image_url}
                    className="size-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = defaultAvatar.src;
                    }}
                  />
                </div>
                <div className="flex w-full flex-1 flex-col gap-2 overflow-hidden">
                  <div className="flex items-center text-base font-bold">
                    {twitterFullProfile?.name}
                  </div>
                  <div className="text-md flex flex-wrap items-center gap-2 font-medium">
                    <Link
                      className="flex items-center space-x-1 overflow-hidden"
                      href={`https://x.com/${twitterFullProfile?.screen_name}`}
                      target="_blank"
                    >
                      <ProiconXTwitter className="size-5 cursor-pointer" />
                      <span className="truncate">@{twitterFullProfile?.screen_name}</span>
                    </Link>
                    <div>|</div>
                    <div className="space-x-1">
                      <span>{formatNumberKMB(twitterFullProfile?.followers_count)}</span>
                      <span className="text-muted-foreground">{t('followers')}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-md box-border pr-3 font-medium">{t('tags')}</div>
                    <div className="flex items-center gap-x-1">
                      {twitterFullProfile?.tags && twitterFullProfile?.tags?.length > 0 ? (
                        twitterFullProfile?.tags?.map((tag) => (
                          <div
                            key={tag}
                            className="text-muted-foreground box-border rounded-md bg-[#F2F2F2] px-1 py-0.5 text-sm font-[400]"
                          >
                            {tag}
                          </div>
                        ))
                      ) : (
                        <div className="text-muted-foreground box-border rounded-md bg-[#F2F2F2] px-1 py-0.5 text-sm font-[400]">
                          -
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Card
                  className="flex-1 border-none p-3 shadow-none"
                  style={{
                    background:
                      'linear-gradient(127.11deg, rgba(207, 207, 207, 0.15) 14.15%, rgba(53, 184, 136, 0.15) 71.54%)',
                  }}
                >
                  <CardContent className="px-0">
                    <div className="box-border flex h-full flex-col justify-between gap-6">
                      <div className="flex items-center gap-x-1">
                        <TotalEarn className="size-4 min-w-4" />
                        <span className="text-md font-medium whitespace-nowrap">
                          {t('total_earning')}
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-x-1">
                        {/* <HugeiconsLimitation className="size-7" /> */}
                        <span className="text-2xl font-[700]">
                          ${Number(twitterFullProfile?.total_amount || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card
                  className="flex-1 border-none p-3 shadow-none"
                  style={{
                    background:
                      'linear-gradient(127.11deg, rgba(207, 207, 207, 0.15) 14.15%, rgba(53, 184, 136, 0.15) 71.54%)',
                  }}
                >
                  <CardContent className="px-0">
                    <div className="box-border flex h-full flex-col justify-between gap-6">
                      <div className="flex items-center gap-x-1">
                        <UnitPrice className="size-4 min-w-4" />
                        <span className="text-md font-medium whitespace-nowrap">
                          {t('unit_price')}
                        </span>
                      </div>
                      <div className="flex items-end justify-end gap-x-1">
                        {/* <HugeiconsLimitation className="size-7" /> */}
                        <span className="text-2xl font-[700]">
                          ${Number(twitterFullProfile?.unit_price || '0').toLocaleString()}
                        </span>
                        <span className="text-md mb-1 font-medium">/tweet</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Card
                className="border-none p-3 shadow-none"
                style={{
                  background:
                    'linear-gradient(119.17deg, rgba(207, 207, 207, 0.1) 11.41%, rgba(111, 109, 232, 0.1) 70.89%)',
                }}
              >
                <CardContent className="flex h-full flex-col justify-between gap-6 p-0">
                  <div className="flex items-center gap-x-1">
                    <InteractionRate className="size-4 min-w-4" />
                    <span className="text-md text-muted-foreground font-medium">
                      {t('interaction_amount')}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-x-1">
                    <HugeiconsLimitation className="size-7" />
                    <span className="text-2xl font-bold">
                      {twitterFullProfile?.interaction_amount < 0.01
                        ? '<0.01'
                        : twitterFullProfile?.interaction_amount || '0'}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card
                className="border-none p-3 shadow-none"
                style={{
                  background:
                    'linear-gradient(125.97deg, rgba(207, 207, 207, 0.1) 12.54%, rgba(255, 149, 0, 0.1) 71.03%)',
                }}
              >
                <CardContent className="flex h-full flex-col justify-between gap-6 p-0">
                  <div className="flex items-center gap-x-1">
                    <TransmissionRate className="size-4 min-w-4" />
                    <span className="text-md text-muted-foreground font-medium">
                      {t('transmission_rate')}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-x-1">
                    <HugeiconsLimitation className="size-7" />
                    <span className="text-2xl font-bold">
                      {twitterFullProfile?.exposure_rate || '0'}%
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card
                className="border-none p-3 shadow-none"
                style={{
                  background:
                    'linear-gradient(121.95deg, rgba(207, 207, 207, 0.1) 10.48%, rgba(92, 153, 244, 0.1) 69.21%)',
                }}
              >
                <CardContent className="flex h-full flex-col justify-between gap-6 p-0">
                  <div className="flex items-center gap-x-1">
                    <PriceRank className="size-4 min-w-4" />
                    <span className="text-md text-muted-foreground font-medium">
                      {t('price_rank')}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-x-1">
                    <span className="text-2xl font-bold">No.{twitterFullProfile?.rank || '0'}</span>
                  </div>
                </CardContent>
              </Card>
              <Card
                className="border-none p-3 shadow-none"
                style={{
                  background:
                    'linear-gradient(123.86deg, rgba(207, 207, 207, 0.1) 11.57%, rgba(239, 31, 31, 0.1) 70.08%)',
                }}
              >
                <CardContent className="flex h-full flex-col justify-between gap-6 p-0">
                  <div className="flex items-center gap-x-1">
                    <FocusScore className="size-4 min-w-4" />
                    <span className="text-md text-muted-foreground font-medium">
                      {t('focus_score')}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-x-1">
                    <span className="text-2xl font-bold">
                      {formatNumberKMB(twitterFullProfile?.score) || '0'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
        <Card className="flex w-full flex-col rounded-3xl border-none border-[#88BBF3] shadow-[0_0_4px_4px_rgba(0,0,0,0.05)] md:w-[30%]">
          <CardContent className="box-border flex h-full flex-col gap-y-2">
            <div className="flex items-center gap-x-1">
              <Notice className="size-7" />
              <span className="text-primary text-sm font-medium capitalize">
                {t('linkol_on_the_move')}
              </span>
            </div>
            <div className="relative h-full max-h-72 flex-1 overflow-auto md:max-h-none">
              <div className="h-fit w-full md:absolute md:inset-0">
                <ScrollArea className="h-full w-full">
                  <div className="space-y-2">
                    {messagesList && messagesList?.data?.length > 0 ? (
                      messagesList?.data?.map((item, index) => (
                        <div
                          className="box-border space-y-1.5 rounded-xl bg-[rgba(136,187,243,0.1)] p-2 text-sm"
                          key={index}
                        >
                          <div className="text-muted-foreground flex justify-between">
                            <span>{t('new_payment')}</span>
                            <span>{formatDate(item.msg_at, 'hh:mm a')}</span>
                          </div>
                          <div>{item.content}</div>
                        </div>
                      ))
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        {t('no_messages')}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <UIDialogBindEmail kol={true}>
        <span ref={fakeTriggerRef}></span>
      </UIDialogBindEmail>
    </>
  );
}
