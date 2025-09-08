'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Carousel, CarouselApi, CarouselContent, CarouselItem } from '@shadcn-ui/carousel';

import { IBrandingLinkolCampaigns } from '@hooks/branding';
import CompLinkolCampaignsCard from './LinkolCampaignsCard';

export default function LinkolCampaignsList(props: { data: IBrandingLinkolCampaigns }) {
  const { data } = props;
  const { data: list, total } = data;
  const t = useTranslations('common');

  const [api, setApi] = useState<CarouselApi>();

  const handlePrev = () => {
    api?.scrollPrev();
  };
  const handleNext = () => {
    api?.scrollNext();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">{t('linkol_campaigns')}</h3>
        <div className="flex items-center gap-x-3">
          <div
            className="bg-accent flex size-6 cursor-pointer items-center justify-center rounded-lg"
            onClick={handlePrev}
          >
            <ChevronLeft className="text-muted-foreground size-4" />
          </div>
          <div
            className="bg-accent flex size-6 cursor-pointer items-center justify-center rounded-lg"
            onClick={handleNext}
          >
            <ChevronRight className="text-muted-foreground size-4" />
          </div>
        </div>
      </div>
      <Carousel
        className="w-full"
        opts={{
          align: 'start',
          loop: true,
        }}
        setApi={setApi}
      >
        <CarouselContent className="-ml-3 pb-4">
          {list.map((item, index) => (
            <CarouselItem key={index} className="pl-3 md:basis-1/2 lg:basis-1/3">
              <CompLinkolCampaignsCard key={item.screen_name} data={item} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
