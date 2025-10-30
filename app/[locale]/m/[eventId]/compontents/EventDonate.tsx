'use client';
import { getTokenConfig } from '@constants/config';
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import DialogDonate from './dialog/DialogDonate';
import Image from 'next/image';
import DonateBg from '@assets/image/donate-bg.png';
import { getActivityDonateTokenInfo } from '@libs/request';

interface EventDonateProps {
  eventInfo: any;
  onRefresh?: () => Promise<void>;
  leaderboardRef?: React.RefObject<{
    refreshAllData: () => Promise<void>;
    refreshDonationList: () => Promise<void>;
  } | null>;
}

const EventDonate = forwardRef<{ refreshDonateData: () => Promise<void> }, EventDonateProps>(
  function EventDonate({ eventInfo, onRefresh, leaderboardRef }, ref) {
    const t = useTranslations('common');
    const [isDonateDialogOpen, setIsDonateDialogOpen] = useState(false);
    const [shouldShow, setShouldShow] = useState(true);

    const handleDonateDialogOpen = () => {
      setIsDonateDialogOpen(true);
    };

    const handleDonateDialogClose = () => {
      setIsDonateDialogOpen(false);
    };

    const handleDonateSuccess = async () => {
      // 捐赠成功后刷新数据
      if (onRefresh) {
        await onRefresh();
      }
      // 刷新捐赠列表
      if (leaderboardRef?.current) {
        await leaderboardRef.current.refreshDonationList();
      }
    };

    const handleBuy = () => {
      const baseUrl = 'https://four.meme/';
      const tokenConfig = getTokenConfig(eventInfo?.chain_type, eventInfo?.token_type);
      const buyUrl = `${baseUrl}/token/${tokenConfig?.contractAddress}`;
      window.open(buyUrl, '_blank');
    };

    // 暴露刷新函数给父组件
    useImperativeHandle(ref, () => ({
      refreshDonateData: async () => {
        if (onRefresh) {
          await onRefresh();
        }
      },
    }));

    // 检查是否有可捐赠代币列表
    useEffect(() => {
      const checkTokens = async () => {
        if (!eventInfo?.id) return;
        try {
          const res: any = await getActivityDonateTokenInfo({ active_id: Number(eventInfo.id) });
          if (res?.code === 200) {
            if (!res.data || res.data.length === 0) {
              setShouldShow(false);
            } else {
              setShouldShow(true);
            }
          }
        } catch (e) {
          // 请求失败时保持默认展示，避免误伤
          setShouldShow(true);
        }
      };
      checkTokens();
    }, [eventInfo?.id]);

    if (!shouldShow) return null;

    return (
      <>
        <div
          className="flex w-full cursor-pointer items-center justify-center"
          onClick={handleDonateDialogOpen}
        >
          <img src={DonateBg.src} alt="donate" className="w-full object-cover" />
        </div>

        {/* 捐赠弹窗 */}
        <DialogDonate
          isOpen={isDonateDialogOpen}
          onClose={handleDonateDialogClose}
          eventInfo={eventInfo}
          onDonateSuccess={handleDonateSuccess}
        />
      </>
    );
  }
);

export default EventDonate;
