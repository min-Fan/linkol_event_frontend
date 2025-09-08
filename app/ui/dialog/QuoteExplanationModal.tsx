'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Marquee from 'react-fast-marquee';
import {
  ActivityConsideration,
  AICommercializationPredictions,
  AIList,
  AntiCheating,
  MultiDimensionality,
  NetworkEffects,
  Normalization,
  Personalization,
  QualityOverQuantity,
  TweetBlue,
  UnderstandingSocialNetworks,
} from '@assets/svg';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@shadcn/components/ui/button';
import Image from 'next/image';
import { cn } from '@shadcn/lib/utils';
import ai_1 from '@assets/image/ai/1.png';
import ai_2 from '@assets/image/ai/2.png';
import ai_3 from '@assets/image/ai/3.png';
import ai_4 from '@assets/image/ai/4.png';
import ai_5 from '@assets/image/ai/5.png';
import ai_6 from '@assets/image/ai/6.png';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@shadcn/components/ui/carousel';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { updateViewQuoteExplanationModal } from 'app/store/reducers/userSlice';
import { useTranslations } from 'next-intl';
export default function QuoteExplanationModal() {
  const t = useTranslations('common');
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [step, setStep] = useState(0);
  const [priceShow, setPriceShow] = useState(false);

  const dispatch = useAppDispatch();
  const ai_item = [ai_1, ai_2, ai_3, ai_4, ai_5, ai_6];

  useEffect(() => {
    if (!api) return;
    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  // 防止滚动穿透
  useEffect(() => {
    const preventScroll = (e: TouchEvent) => {
      e.preventDefault();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('touchmove', preventScroll);
    };
  }, []);

  const onSelect = () => {
    if (api != null) {
      setStep(api.selectedScrollSnap());
    }
  };

  const close = () => {
    dispatch(updateViewQuoteExplanationModal(true));
    setPriceShow(false);
    setStep(0);
  };

  const next = () => {
    if (step < 1) {
      api?.scrollNext();
    }
  };

  const back = () => {
    if (step > 0) {
      api?.scrollPrev();
    }
  };

  const setp1 = () => {
    return (
      <div className="w-full sm:max-w-none">
        <div className="text-center">
          <div className="text-2xl font-bold sm:text-3xl">{t('how_is_your_quote_generated')}?</div>
          <div className="sm:text-md text-sm">{t('authorized_to_generate_quotes')}</div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2 sm:mt-10 sm:grid-cols-3 sm:gap-3">
          <div className="box-border rounded-lg border border-[rgba(136,187,243,0.20)] bg-[rgba(136,187,243,0.10)] px-3 py-2 sm:px-6 sm:py-3">
            <div className="space-y-1">
              <MultiDimensionality className="size-5 sm:size-6"></MultiDimensionality>
              <div className="text-primary text-sm font-bold sm:text-base">
                {t('multi_dimensionality')}
              </div>
              <div className="text-xs sm:text-sm">{t('avoid_single_metric')}</div>
            </div>
          </div>

          <div className="box-border rounded-lg border border-[rgba(136,187,243,0.20)] bg-[rgba(136,187,243,0.10)] px-3 py-2 sm:px-6 sm:py-3">
            <div className="space-y-1">
              <QualityOverQuantity className="size-5 sm:size-6"></QualityOverQuantity>
              <div className="text-primary text-sm font-bold sm:text-base">
                {t('quality_over_quantity')}
              </div>
              <div className="text-xs sm:text-sm">{t('focus_on_quality')}</div>
            </div>
          </div>

          <div className="box-border rounded-lg border border-[rgba(136,187,243,0.20)] bg-[rgba(136,187,243,0.10)] px-3 py-2 sm:px-6 sm:py-3">
            <div className="space-y-1">
              <ActivityConsideration className="size-5 sm:size-6"></ActivityConsideration>
              <div className="text-primary text-sm font-bold sm:text-base">
                {t('activity_consideration')}
              </div>
              <div className="text-xs sm:text-sm">{t('recent_activities_influence')}</div>
            </div>
          </div>
          <div className="box-border rounded-lg border border-[rgba(136,187,243,0.20)] bg-[rgba(136,187,243,0.10)] px-3 py-2 sm:px-6 sm:py-3">
            <div className="space-y-1">
              <NetworkEffects className="size-5 sm:size-6"></NetworkEffects>
              <div className="text-primary text-sm font-bold sm:text-base">
                {t('network_effects')}
              </div>
              <div className="text-xs sm:text-sm">{t('pay_attention_connections')}</div>
            </div>
          </div>
          <div className="box-border rounded-lg border border-[rgba(136,187,243,0.20)] bg-[rgba(136,187,243,0.10)] px-3 py-2 sm:px-6 sm:py-3">
            <div className="space-y-1">
              <AntiCheating className="size-5 sm:size-6"></AntiCheating>
              <div className="text-primary text-sm font-bold sm:text-base">
                {t('anti_cheating')}
              </div>
              <div className="text-xs sm:text-sm">{t('choose_metrics')}</div>
            </div>
          </div>
          <div className="box-border rounded-lg border border-[rgba(136,187,243,0.20)] bg-[rgba(136,187,243,0.10)] px-3 py-2 sm:px-6 sm:py-3">
            <div className="space-y-1">
              <Normalization className="size-5 sm:size-6"></Normalization>
              <div className="text-primary text-sm font-bold sm:text-base">
                {t('normalization')}
              </div>
              <div className="text-xs sm:text-sm">{t('metrics_standardization')}</div>
            </div>
          </div>
        </div>
        <div className="mt-6 sm:mt-10">
          <div
            className="sm:text-md flex w-max cursor-pointer items-center text-sm"
            onClick={() => setPriceShow(!priceShow)}
          >
            <span>{t('view_calculation_formula')}</span>
            {priceShow ? (
              <ChevronDown className="size-6" />
            ) : (
              <ChevronRight className="size-6"></ChevronRight>
            )}
          </div>

          {priceShow && (
            <div className="mt-3 box-border max-w-93 rounded-md border border-[rgba(136,187,243,0.20)] px-6 py-3">
              <p>
                {t('basic_influence_score')} = 0.4 × log₁₀({t('totalFollowers')})
              </p>
              <p>
                0.3 × （{t('avgLikesLast10Tweets')} / {t('totalFollowers')} × 10000）
              </p>
              <p>
                0.2 × （{t('avgCommentsLast10Tweets')} / {t('avgViewsLast10Tweets')} × 100）
              </p>
              <p>
                0.1 × （{t('totalLikesReceived')} / {t('totalTweets')}）
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const setp2 = () => {
    return (
      <div className="w-full sm:max-w-none">
        <div className="text-center">
          <div className="text-2xl font-bold sm:text-3xl">{t('aiCollaborativePlatformTitle')}</div>
          <div className="sm:text-md text-sm">{t('aiCollaborativePlatformTitle')}</div>
        </div>

        <div className="m-auto mt-6 max-w-full sm:mt-10 sm:max-w-165">
          <div className="relative w-full">
            <div className="absolute top-0 left-0 z-10 h-full w-23 rounded-md bg-gradient-to-r from-[var(--background)] to-transparent"></div>
            <div className="absolute top-0 right-0 z-10 h-full w-23 rounded-md bg-gradient-to-r from-transparent to-[var(--background)]"></div>
            <Marquee pauseOnHover speed={50} gradient={false} className="[&_.rfm-child]:mr-2">
              {ai_item.map((item, index) => {
                return (
                  <div key={index} className="bg-background box-border p-5">
                    <Image
                      src={item}
                      alt="background"
                      className="size-15 object-cover"
                      priority={true}
                    />
                  </div>
                );
              })}
            </Marquee>
            <div className="m-auto mt-1 w-78">
              <AIList className="h-auto w-full"></AIList>
            </div>
          </div>
          <div className="text-primary text-md m-auto mt-3 text-center">{t('quoteAssessment')}</div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-2 sm:mt-10 sm:grid-cols-4 sm:gap-3">
          <div className="box-border rounded-lg border border-[rgba(136,187,243,0.20)] bg-[rgba(136,187,243,0.10)] px-3 py-2 sm:px-6 sm:py-3">
            <div className="space-y-1">
              <TweetBlue className="size-5 sm:size-6"></TweetBlue>
              <div className="text-primary text-sm font-bold sm:text-base">{t('tweetQuality')}</div>
              <div className="text-xs sm:text-sm">{t('contentAnalysis')}</div>
            </div>
          </div>
          <div className="box-border rounded-lg border border-[rgba(136,187,243,0.20)] bg-[rgba(136,187,243,0.10)] px-3 py-2 sm:px-6 sm:py-3">
            <div className="space-y-1">
              <UnderstandingSocialNetworks className="size-5 sm:size-6"></UnderstandingSocialNetworks>
              <div className="text-primary text-sm font-bold sm:text-base">
                {t('understandingSocialNetworks')}
              </div>
              <div className="text-xs sm:text-sm">{t('interactionAndFansAssessment')}</div>
            </div>
          </div>
          <div className="box-border rounded-lg border border-[rgba(136,187,243,0.20)] bg-[rgba(136,187,243,0.10)] px-3 py-2 sm:px-6 sm:py-3">
            <div className="space-y-1">
              <AICommercializationPredictions className="size-5 sm:size-6"></AICommercializationPredictions>
              <div className="text-primary text-sm font-bold sm:text-base">
                {t('aiCommercializationPredictions')}
              </div>
              <div className="text-xs sm:text-sm">{t('predictBusinessConversion')}</div>
            </div>
          </div>
          <div className="box-border rounded-lg border border-[rgba(136,187,243,0.20)] bg-[rgba(136,187,243,0.10)] px-3 py-2 sm:px-6 sm:py-3">
            <div className="space-y-1">
              <Personalization className="size-5 sm:size-6"></Personalization>
              <div className="text-primary text-sm font-bold sm:text-base">
                {t('personalization')}
              </div>
              <div className="text-xs sm:text-sm">{t('semanticSentimentProfessionalism')}</div>
            </div>
          </div>
        </div>
        <div className="sm:text-md mt-3 w-full text-sm">{t('moeWeightedAverage')}</div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.50)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onWheel={(e) => {
          e.stopPropagation();
        }}
        onTouchMove={(e) => {
          e.stopPropagation();
        }}
      >
        <motion.div
          className="bg-background relative box-border max-h-[90vh] w-full max-w-80 overflow-auto rounded-3xl px-4 py-6 sm:max-w-225 sm:px-6 sm:py-10"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onWheel={(e) => {
            e.stopPropagation();
          }}
          onTouchMove={(e) => {
            e.stopPropagation();
          }}
        >
          <Carousel className="w-full" setApi={setApi}>
            <CarouselContent>
              <CarouselItem>{setp1()}</CarouselItem>
              <CarouselItem>{setp2()}</CarouselItem>
            </CarouselContent>
          </Carousel>
          <div className="sticky bottom-0 flex items-center justify-center pt-6 sm:pt-10">
            {step < 1 ? (
              <Button onClick={next} className="flex items-center gap-2">
                <span>{t('next')}</span>
                <ArrowRight className="size-5 sm:size-6" />
              </Button>
            ) : (
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <Button onClick={back} className="flex items-center gap-2">
                  <ArrowLeft className="size-5 sm:size-6" />
                  <span>{t('previous')}</span>
                </Button>
                <Button onClick={close}>{t('finished')}</Button>
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center justify-center gap-x-3 sm:mt-6">
            <div
              className={cn('h-1.5 w-11 rounded-full bg-[#F2F2F2]', step == 0 && 'bg-primary')}
            ></div>
            <div
              className={cn('h-1.5 w-11 rounded-full bg-[#F2F2F2]', step == 1 && 'bg-primary')}
            ></div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
