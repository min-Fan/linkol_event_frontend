import Image from 'next/image';
import chat from '@assets/image/chat.png';
import bannerBg2 from '@assets/image/banner-bg2.png';
import { useEffect, useRef } from 'react';
import { Star1, Star2, Star3, User1, User2, User3 } from '@assets/svg';
import { useTranslations } from 'next-intl';
export default function Banner() {
  const chatRef = useRef<HTMLDivElement>(null);
  const star1Ref = useRef<HTMLDivElement>(null);
  const star2Ref = useRef<HTMLDivElement>(null);
  const star3Ref = useRef<HTMLDivElement>(null);
  const t = useTranslations('common');

  useEffect(() => {
    const floatingAnimation = () => {
      // Chat icon floating animation
      if (chatRef.current) {
        const chatElement = chatRef.current;
        let chatYPosition = 0;
        let chatYDirection = 1;
        const chatAnimateFloat = () => {
          if (chatYDirection === 1) {
            chatYPosition += 0.1;
            if (chatYPosition >= 10) chatYDirection = -1;
          } else {
            chatYPosition -= 0.1;
            if (chatYPosition <= 0) chatYDirection = 1;
          }
          chatElement.style.transform = `translateY(${chatYPosition}px)`;
          requestAnimationFrame(chatAnimateFloat);
        };
        chatAnimateFloat();
      }

      // Star1 animation
      if (star1Ref.current) {
        const star1Element = star1Ref.current;
        let star1YPosition = 0;
        let star1YDirection = 1;
        const star1AnimateFloat = () => {
          if (star1YDirection === 1) {
            star1YPosition += 0.15;
            if (star1YPosition >= 15) star1YDirection = -1;
          } else {
            star1YPosition -= 0.15;
            if (star1YPosition <= 0) star1YDirection = 1;
          }
          star1Element.style.transform = `translateY(${star1YPosition}px) rotate(${star1YPosition}deg)`;
          requestAnimationFrame(star1AnimateFloat);
        };
        star1AnimateFloat();
      }

      // Star2 animation
      if (star2Ref.current) {
        const star2Element = star2Ref.current;
        let star2XPosition = 0;
        let star2XDirection = 1;
        const star2AnimateFloat = () => {
          if (star2XDirection === 1) {
            star2XPosition += 0.2;
            if (star2XPosition >= 20) star2XDirection = -1;
          } else {
            star2XPosition -= 0.2;
            if (star2XPosition <= 0) star2XDirection = 1;
          }
          star2Element.style.transform = `translateX(${star2XPosition}px) rotate(-${star2XPosition}deg)`;
          requestAnimationFrame(star2AnimateFloat);
        };
        star2AnimateFloat();
      }

      // Star3 animation
      if (star3Ref.current) {
        const star3Element = star3Ref.current;
        let star3Position = 0;
        let star3Direction = 1;
        const star3AnimateFloat = () => {
          if (star3Direction === 1) {
            star3Position += 0.1;
            if (star3Position >= 10) star3Direction = -1;
          } else {
            star3Position -= 0.1;
            if (star3Position <= 0) star3Direction = 1;
          }
          star3Element.style.transform = `translate(${star3Position}px, ${star3Position}px) rotate(${star3Position * 2}deg)`;
          requestAnimationFrame(star3AnimateFloat);
        };
        star3AnimateFloat();
      }
    };

    floatingAnimation();
  }, []);

  return (
    <div className="relative box-border flex min-h-24 w-full items-center justify-between overflow-hidden rounded-lg p-2 shadow-none sm:h-48 sm:rounded-3xl sm:px-6 sm:py-5">
      <Image src={bannerBg2} alt="background" fill className="z-0 object-cover" priority={true} />
      {/* Stars decorations */}
      <div ref={star1Ref} className="absolute top-16 right-[7%] z-10">
        <Star1 />
      </div>
      <div ref={star2Ref} className="absolute top-6 right-[10%] z-10">
        <Star3 className="h-3 w-3" />
      </div>
      <div ref={star3Ref} className="absolute right-[32%] bottom-4 z-10">
        <Star2 className="h-4 w-4" />
      </div>
      <div className="absolute top-4 right-[28%] z-10 sm:right-[32%]">
        <User1 className="size-14 sm:size-16" />
      </div>
      <div className="absolute top-2 right-2 z-10">
        <User2 className="size-14 sm:size-16" />
      </div>
      <div className="absolute right-[6%] bottom-2 z-10 sm:right-[10%]">
        <User3 className="size-12 sm:size-14" />
      </div>

      <div className="relative z-10 flex max-w-[100%] flex-col gap-1 sm:max-w-[60%] sm:gap-2">
        <h1 className="text-lg leading-tight font-semibold tracking-wide text-white sm:text-3xl">
          {t('kol_banner_title')}
          {t('kol_banner_subtitle')}
        </h1>
        <p className="text-xs tracking-wider text-white sm:text-base">
          {t('kol_banner_description')}
          <br />
          {t('kol_banner_description2')}
        </p>
      </div>
      <div
        ref={chatRef}
        className="relative right-[5%] z-10 flex translate-x-1/8 items-center gap-2 sm:translate-x-0"
      >
        <Image src={chat} alt="banner" width={280} height={280} />
      </div>
    </div>
  );
}
