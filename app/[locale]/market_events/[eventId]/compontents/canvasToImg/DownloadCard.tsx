'use client';
import React, { forwardRef } from 'react';
import { cn } from '@shadcn/lib/utils';
import { getCurrentDomain } from '@libs/utils';
import { IGetPriceData } from '@libs/request';
interface DownloadCardProps {
  className?: string;
  data: IGetPriceData;
}

import { copy } from '@libs/utils';
import { useTranslations } from 'next-intl';
import defaultAvatar from '@assets/image/avatar.png';
import cardBg from '@assets/image/card-bg.png';
import logoBorder from '@assets/image/logo-border.png';
import downloadCardBg from '@assets/image/download-card-bg.png';
import { toast } from 'sonner';

const KolCard = ({ data, className }: { data: IGetPriceData; className?: string }) => {
  const t = useTranslations('common');

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* 背景图片 */}
      <div className="absolute inset-0 z-[-1] h-full w-full">
        <img src={cardBg.src} alt="Card Background" className="h-full w-full" />
      </div>

      {/* 日期 */}
      <div
        id="date"
        className="text-primary font-kyiv absolute top-0 right-2 z-10 flex scale-90 justify-end pt-2 pr-2 text-right text-sm leading-none font-medium"
      >
        {new Date().toISOString().split('T')[0].replace(/-/g, '.')}
      </div>

      {/* 中央Logo区域 */}
      <div className="z-10 mt-14 flex flex-col items-center">
        {/* Logo背景圆圈 */}
        <div className="relative mb-3 flex items-center justify-center p-5">
          <div className="absolute inset-0 z-1 h-full w-full">
            <img src={logoBorder.src} alt="Card Background" className="h-full w-full" />
          </div>

          {/* 用户头像 */}
          <div className="flex h-[200px] w-[200px] items-center justify-center overflow-hidden !rounded-md">
            <img
              id="user-avatar"
              src={data?.kol?.profile_image_url?.replace('_normal', '') || defaultAvatar.src}
              alt="User Avatar"
              className="h-full w-full !rounded-sm object-cover"
            />
          </div>
        </div>
      </div>

      {/* 价格显示 */}
      <div className="mt-5 flex flex-col items-center justify-center pb-10">
        <div id="price" className="font-kyiv mb-2 text-4xl leading-none font-bold text-white">
          ${data?.current_value >= 10000 ? '10000+' : data?.current_value?.toLocaleString() || '0'}
        </div>
        <div className="font-kyiv flex items-center justify-center">
          <span className="text-primary !scale-90 text-xs">Single&nbsp;</span>
          <span className="text-primary !scale-90 text-xs">Tweet&nbsp;</span>
          <span className="text-primary !scale-90 text-xs">Value&nbsp;</span>
          <span className="text-primary !scale-90 text-xs">By&nbsp;</span>
          <span className="text-primary ml-0.5 !scale-90 text-xs">AI</span>
        </div>
      </div>

      {/* 用户名称 */}
      <div className="font-kyiv pb-[18px] pl-16 text-[#090909]">
        <div
          id="brand-name"
          className="cursor-pointer text-xl font-bold"
          onClick={() => {
            copy(data?.kol?.name).then((success) => {
              if (success) {
                toast.success(t('copy_success'));
              } else {
                toast.error(t('copy_failed'));
              }
            });
          }}
        >
          {data?.kol?.name.length > 16 ? data?.kol?.name.slice(0, 16) + '...' : data?.kol?.name}
        </div>
        <div
          id="username"
          className="cursor-pointer text-sm font-bold"
          onClick={() => {
            copy(data?.kol?.screen_name).then((success) => {
              if (success) {
                toast.success(t('copy_success'));
              } else {
                toast.error(t('copy_failed'));
              }
            });
          }}
        >
          @{data?.kol?.screen_name}
        </div>
      </div>
    </div>
  );
};

const DownloadCard = forwardRef<HTMLDivElement, DownloadCardProps>(({ className, data }, ref) => {
  return (
    <div
      className={cn('relative flex h-[600px] w-[600px] items-center justify-center', className)}
      style={{
        backgroundImage: `url(${downloadCardBg.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      ref={ref}
    >
      <div className="relative z-10">
        <KolCard data={data} className="z-10 w-[330px]" />
        {/* <div className="absolute inset-0 top-1/2 left-1/2 z-0 h-[96%] w-[96%] -translate-x-1/2 -translate-y-1/2 shadow-[0_0_130px_rgba(255,255,255,0.9)]"></div> */}
      </div>
      <div className="absolute bottom-4 left-0 w-full text-center text-2xl font-bold text-black">
        {getCurrentDomain()}
      </div>
    </div>
  );
});

DownloadCard.displayName = 'DownloadCard';

export default DownloadCard;
