'use client';
import { useBanner } from '@hooks/marketEvents';
import PagesRoute from '@constants/routes';
import { Link } from '@libs/i18n/navigation';
import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@shadcn/components/ui/button';
import { ArrowRight } from 'lucide-react';
import PixelBlast from '@shadcn/components/pixelBlast/PixelBlast';
import { track } from '@vercel/analytics';

export default function HomeScreenBanner() {
  const { data, isLoading } = useBanner();
  const t = useTranslations('common');
  return (
    <div className="relative w-full pt-14 pb-52 sm:pt-16">
      <div className="absolute inset-0 z-0 h-full w-full">
        <PixelBlast
          className="h-full w-full bg-black"
          variant="triangle"
          pixelSize={5}
          color="#007AFF"
          patternScale={4}
          patternDensity={1.3}
          pixelSizeJitter={0.4}
          enableRipples
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          liquidStrength={0.12}
          liquidRadius={1.2}
          liquidWobbleSpeed={5}
          speed={0.6}
          edgeFade={0.1}
          transparent
        />
      </div>
      <div className="to-background absolute -bottom-1 h-10 w-full bg-gradient-to-b from-transparent backdrop-blur-sm"></div>
      <div className="relative z-10 flex flex-col items-center justify-center gap-4 pt-28 pb-16">
        <h1 className="font-kyiv text-5xl leading-none font-bold text-white sm:text-[60px]">
          {t('post_to_earn')}
        </h1>
        <p className="max-w-[90%] text-center text-lg text-white sm:max-w-[420px] sm:text-2xl">
          {t('boost_personal_brand')}
        </p>
        <div className="mt-6 rounded-full shadow-[0_1px_40px_0_rgba(242,242,242,0.80)]">
          <Link
            href={`${PagesRoute.MARKET_EVENTS}/5`}
            title={t('join_campaign')}
            onClick={() => {
              track('Join Campaign Button ==> MarketEvents Detail Page', { active_id: '5' });
            }}
          >
            <Button className="text-primary !h-11 gap-x-1 !rounded-full bg-white !px-6 !text-base font-medium">
              <span>{t('join_campaign')}</span>
              <ArrowRight className="size-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
