import Image from 'next/image';
import Banner from '@assets/image/banner-loading.png';
import { Button } from '@shadcn/components/ui/button';
import CountUp from '@ui/countUp';
import { useEffect, useState } from 'react';
import { getPlatformTotalRechargeAndTotalDeal } from '@libs/request';
import { useRouter } from '@libs/i18n/navigation';
import PagesRoute from '@constants/routes';
export default function LadingBanner() {
  const router = useRouter();
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
    <div className="flex h-full w-full flex-col gap-y-4">
      <div className="relative w-full bg-[#88BBF3]">
        <Image src={Banner} alt="background" fill className="z-0 object-cover" priority={true} />
        <div className="relative mx-auto box-border w-full p-27 px-5 sm:max-w-240">
          <div className="space-y-4">
            <div className="text-5xl font-bold text-white">
              <p>Find the Right KOLs. </p>
              <p>Track Results. Maximize ROI.</p>
            </div>

            <div className="text-base text-white">
              <p>Discover, manage, and measure KOL campaigns in one platform — powered by AI,</p>
              <p>
                blockchain, and verified digital identity for real-time tracking and performance
              </p>
              <p>insights.</p>
            </div>

            <div className="flex gap-x-2">
              <Button
                className="flex h-12 rounded-full bg-[#0500FF] text-base sm:h-12 sm:rounded-full"
                onClick={() => {
                  router.push(PagesRoute.HOME);
                }}
              >
                I am Marketing Manager
              </Button>
              <Button
                className="flex h-12 rounded-full bg-[#ffffff] text-base text-[#5C99F4] sm:h-12 sm:rounded-full"
                onClick={() => {
                  router.push(PagesRoute.KOL);
                }}
              >
                I am KOL
              </Button>
            </div>
          </div>

          <div className="mt-8 mb-8 h-[1px] max-w-158.5 bg-[#F2F2F7]"></div>

          <div className="flex h-max flex-wrap gap-2 font-bold text-white">
            <div>
              <div className="text-2xl">
                ${' '}
                <CountUp
                  from={0}
                  to={statistics?.success_order_amount}
                  separator=","
                  direction="up"
                  duration={1}
                />
              </div>
              <p className="text-base font-normal">Total marketing fund on Linkol</p>
            </div>
            <div className="mr-6 ml-6 h-auto w-[1px] bg-[#fff]"></div>
            <div>
              <div className="text-2xl">
                ${' '}
                <CountUp
                  from={0}
                  to={statistics?.executed_done_item_amount}
                  separator=","
                  direction="up"
                  duration={1}
                />
              </div>
              <p className="text-base font-normal">Already Invested</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
