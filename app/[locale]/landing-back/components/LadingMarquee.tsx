import Marquee from 'react-fast-marquee';
import Image from 'next/image';
import woman from '@assets/image/woman.png';
import { LadingpageChart, LadingpageLike, LadingpageText, LadingpageTranform } from '@assets/svg';
import { Button } from '@shadcn/components/ui/button';
import { useEffect, useState } from 'react';
import { LoadingPageLastContent } from '@libs/request';
import { useRouter } from '@libs/i18n/navigation';
import PagesRoute from '@constants/routes';
export default function LadingMarquee() {
  const router = useRouter();
  useEffect(() => {
    init();
  }, []);

  const [tweet, setTweet] = useState([]);

  const init = async () => {
    try {
      const res = await LoadingPageLastContent();

      if (res.code == 200) {
        setTweet(res.data || []);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="box-border w-full px-5">
      <div className="relative m-auto md:max-w-240">
        <div className="absolute top-0 left-0 z-10 h-full w-23 rounded-md bg-gradient-to-r from-white to-transparent dark:from-black"></div>
        <div className="absolute top-0 right-0 z-10 h-full w-23 rounded-md bg-gradient-to-r from-transparent to-white dark:to-black"></div>
        <Marquee
          pauseOnHover
          speed={50}
          gradient={false}
          className="rounded-md [&_.rfm-child]:mr-2"
        >
          {tweet?.map((item: any, index: number) => {
            return (
              <div
                key={index}
                className="border-secondary box-border flex w-114 gap-x-3 rounded-md border px-2.5 py-5"
              >
                <div className="bg-muted-foreground border-background size-12 overflow-hidden rounded-full">
                  <img src={item?.kol?.avatar} alt="avatar" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-x-2">
                    <span className="text-base font-bold">{item?.kol?.name}</span>
                    <span className="text-md">@{item?.kol?.username}</span>
                  </div>
                  <div className="text-md flex items-center text-[#5C99F4]">
                    <span>
                      Followers <span className="font-bold">{item?.kol?.followers}</span>
                    </span>
                    <span className="px-1">｜</span>
                    <span>
                      Engagement Rate:<span className="font-bold">{item?.kol?.interaction}%</span>
                    </span>
                  </div>
                  <div className="text-md">{item.content}</div>
                  <div className="flex gap-x-2">
                    <div className="flex items-center">
                      <LadingpageText className="size-4"></LadingpageText>
                      <span className="text-md font-medium text-[#999999]">{item?.replay}</span>
                    </div>
                    <span>·</span>
                    <div className="flex items-center">
                      <LadingpageTranform className="size-4"></LadingpageTranform>
                      <span className="text-md font-medium text-[#999999]">{item?.repost}</span>
                    </div>
                    <span>·</span>
                    <div className="flex items-center">
                      <LadingpageLike className="size-4"></LadingpageLike>
                      <span className="text-md font-medium text-[#999999]">{item?.likes}</span>
                    </div>
                    <span>·</span>
                    <div className="flex items-center">
                      <LadingpageChart className="size-4"></LadingpageChart>
                      <span className="text-md font-medium text-[#999999]">{item?.replay}</span>
                    </div>
                  </div>
                  <div className="mt-10 flex items-center justify-end gap-x-2">
                    <div className="text-md text-[#5C99F4]">{item?.price} USDC / Session</div>
                    <Button className="h-10 sm:h-10 sm:rounded-full">Get in touch</Button>
                  </div>
                </div>
              </div>
            );
          })}
        </Marquee>
      </div>

      <Button
        className="text-md m-auto mt-15 flex h-12 rounded-full bg-[#0500FF] sm:h-12 sm:rounded-full"
        onClick={() => {
          router.push(PagesRoute.PROJECT);
        }}
      >
        View KOL Ranking
      </Button>
    </div>
  );
}
