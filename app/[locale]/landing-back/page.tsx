'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { Button } from '@shadcn/components/ui/button';

import PagesRoute from '@constants/routes';
import { Link } from '@libs/i18n/navigation';
import { getPlatformTotalRechargeAndTotalDeal } from '@libs/request';
import CountUp from '@ui/countUp';
import avatar1 from '@assets/image/lading/1.png';
import avatar2 from '@assets/image/lading/2.png';
import avatar3 from '@assets/image/lading/3.png';
import avatar4 from '@assets/image/lading/4.png';
import avatar5 from '@assets/image/lading/5.png';
import avatar6 from '@assets/image/lading/6.png';
import LadingHeader from './components/LadingHeader';

export default function PageCHome() {
  const t = useTranslations('common');

  useEffect(() => {
    init();
  }, []);

  const [statistics, setStatistics] = useState({
    executed_done_item_amount: 0,
    success_order_amount: 0,
  });

  const init = async () => {
    try {
      const res = await getPlatformTotalRechargeAndTotalDeal();

      if (res.code == 200) {
        setStatistics(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <LadingHeader />
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        <div className="relative z-10 box-border max-w-3xl space-y-8 p-4 sm:space-y-10">
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-1 text-center text-3xl font-bold sm:text-5xl">
              <h2>
                {t.rich('find_the_Right_kols', {
                  color: (chunks) => <span className="text-primary">{chunks}</span>,
                })}
              </h2>
              <h2>{t('track_results_maximize_roi')}</h2>
            </div>
            <div className="text-md text-center sm:text-base">
              {t.rich('lading_desc', {
                text1: (chunks) => <p>{chunks}</p>,
                text2: (chunks) => <p>{chunks}</p>,
              })}
            </div>
            <div className="flex justify-center gap-x-2">
              <Link
                className="bg-primary text-md rounded-full px-3 py-2 font-bold text-white sm:px-4 sm:py-3 sm:text-base"
                href={PagesRoute.HOME}
                prefetch={true}
              >
                {t('i_am_marketing_manager')}
              </Link>
              <Link
                className="text-md rounded-full bg-black px-3 py-2 font-bold text-white sm:px-4 sm:py-3 sm:text-base dark:bg-white dark:text-black"
                href={PagesRoute.KOL}
                prefetch={true}
              >
                {t('i_am_kol')}
              </Link>
            </div>
          </div>
          <div className="bg-primary/15 h-px w-full"></div>
          <div className="flex flex-col items-stretch justify-center gap-4 text-center sm:flex-row sm:gap-6 sm:text-left">
            <dl className="space-y-0.5">
              <dt className="text-2xl font-bold sm:text-3xl">
                $
                <CountUp
                  from={0}
                  to={statistics?.success_order_amount}
                  separator=","
                  direction="up"
                  duration={1}
                />
              </dt>
              <dd className="text-md sm:text-base">{t('project_total_balance')}</dd>
            </dl>
            <div className="bg-primary/15 hidden w-px sm:block"></div>
            <dl className="space-y-0.5">
              <dt className="text-2xl font-bold sm:text-3xl">
                $
                <CountUp
                  from={0}
                  to={statistics?.executed_done_item_amount}
                  separator=","
                  direction="up"
                  duration={1}
                />
              </dt>
              <dd className="text-md sm:text-base">{t('project_total_invested')}</dd>
            </dl>
          </div>
        </div>

        <div className="absolute right-1/2 bottom-1/2 size-38 -translate-x-72 -translate-y-52 opacity-10">
          <Image className="relative size-full" src={avatar1} priority={true} alt="avatar1" />
        </div>

        <div className="absolute bottom-1/2 left-1/2 size-20 translate-x-40 -translate-y-80 opacity-10">
          <Image className="size-full" src={avatar2} priority={true} alt="avatar2" />
        </div>

        <div className="absolute bottom-1/2 left-1/2 size-60 translate-x-96 translate-y-4 opacity-10">
          <Image className="size-full" src={avatar3} priority={true} alt="avatar3" />
        </div>

        <div className="absolute top-1/2 left-1/2 size-60 translate-x-56 translate-y-36 opacity-10">
          <Image className="size-full" src={avatar4} priority={true} alt="avatar4" />
        </div>

        <div className="absolute top-1/2 right-1/2 size-38 -translate-x-24 translate-y-72 opacity-10">
          <Image className="size-full" src={avatar5} priority={true} alt="avatar5" />
        </div>

        <div className="absolute top-1/2 right-1/2 z-1 h-75 w-60 -translate-x-96 -translate-y-10 opacity-10">
          <Image className="size-full" src={avatar6} priority={true} alt="avatar6" />
        </div>
      </div>
      {/* banner */}
      {/* <LadingBanner></LadingBanner> */}

      {/* Linkol Core Features */}
      {/* <LadingLinkolCoreFeatures></LadingLinkolCoreFeatures> */}

      {/* 4 Simple Steps */}
      {/* <LadingSimpleSteps></LadingSimpleSteps> */}

      {/* KOL Recommendations */}
      {/* <LadingKOLRecommendations></LadingKOLRecommendations> */}

      {/* 跑马灯 */}
      {/* <LadingMarquee></LadingMarquee> */}

      {/* Ready to Elevate */}
      {/* <LadingReady></LadingReady> */}

      {/* copy right */}
      {/* <LadingCopyRight></LadingCopyRight> */}
    </div>
  );
}
