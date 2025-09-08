'use client';

import { useTranslations } from 'next-intl';
import Autoplay from 'embla-carousel-autoplay';

import { Carousel, CarouselContent, CarouselItem } from '@shadcn-ui/carousel';

import { IBrandingMarketEvents } from '@hooks/branding';
import CompMarketEventsCard from './MarketEventsCard';

export default function MarketEventsList(props: { data: IBrandingMarketEvents }) {
  const { data } = props;
  const { data: list, total } = data;

  return (
    <div className="box-border w-full rounded-3xl border border-solid border-[#88BBF3]/15 bg-gradient-to-b from-[#88BBF3]/15 to-[#5C99F4]/15 p-6">
      <Carousel
        className="w-full"
        opts={{
          align: 'start',
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 3000,
          }),
        ]}
      >
        <CarouselContent className="-ml-3">
          {list.map((item, index) => (
            <CarouselItem key={index} className="pl-3 md:basis-1/2 lg:basis-1/3">
              <CompMarketEventsCard data={item} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
