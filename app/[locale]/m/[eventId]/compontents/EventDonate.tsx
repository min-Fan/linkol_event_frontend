'use client';
import { getTokenConfig } from '@constants/config';
import { useEventTokenInfo } from '@hooks/useEventTokenInfo';
import { Button } from '@shadcn/components/ui/button';
import TokenIcon from 'app/components/TokenIcon';
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { useTranslations } from 'next-intl';
import SpaceButton from 'app/components/SpaceButton/SpaceButton';
import DialogDonate from './dialog/DialogDonate';

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
    const { symbol } = useEventTokenInfo({
      chain_type: eventInfo?.chain_type,
      token_type: eventInfo?.token_type,
    });
    const [isDonateDialogOpen, setIsDonateDialogOpen] = useState(false);

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

    return (
      <>
        <div className="flex h-full w-full items-center gap-2 p-2 sm:gap-4 sm:p-4">
          <SpaceButton onClick={handleDonateDialogOpen} className="!h-12 min-w-24 flex-1 px-4">
            <span className="sm:text-md text-sm">{t('donate')}</span>
          </SpaceButton>
          {eventInfo?.token_type && (
            <Button
              variant="outline"
              onClick={handleBuy}
              className="h-10 flex-1 !rounded-full !px-4 font-bold sm:!h-12"
            >
              {t('buy_token')} {symbol}
            </Button>
          )}
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
