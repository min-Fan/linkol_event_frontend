'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { Card, CardContent } from '@shadcn-ui/card';
import { DatePicker } from '@ui/datePicker';

interface EditCampaignDurationProps {
  onDurationChange?: (duration: { startDate: Date | null; endDate: Date | null }) => void;
  isReadOnly?: boolean; // 只读模式
  initialDuration?: { startDate: Date | null; endDate: Date | null }; // 初始值
}

export default function EditCampaignDuration({
  onDurationChange,
  isReadOnly = false,
  initialDuration,
}: EditCampaignDurationProps) {
  const t = useTranslations('common');
  const [startDate, setStartDate] = useState<Date | null>(initialDuration?.startDate || null);
  const [endDate, setEndDate] = useState<Date | null>(initialDuration?.endDate || null);

  // 监听初始值变化
  useEffect(() => {
    if (initialDuration) {
      setStartDate(initialDuration.startDate);
      setEndDate(initialDuration.endDate);
    }
  }, [initialDuration]);

  const handleStartDateChange = (date: Date) => {
    if (isReadOnly) return;
    setStartDate(date);
    onDurationChange?.({ startDate: date, endDate });
  };

  const handleEndDateChange = (date: Date) => {
    if (isReadOnly) return;
    setEndDate(date);
    onDurationChange?.({ startDate, endDate: date });
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xl font-semibold">
        {t('post_campaign_campaign_duration')} (UTC+8)
        <span className="ml-1 text-red-500">*</span>
      </h3>
      <p className="text-muted-foreground text-base font-medium">
        {t('post_campaign_campaign_duration_desc')}
      </p>
      <div className="pt-4">
        <Card className="rounded-3xl border-none p-0 shadow-[0px_7.51px_11.27px_0px_#0000000D]">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 gap-y-6 p-6 md:grid-cols-2 md:gap-x-24 md:gap-y-0">
              <div className="flex flex-col gap-6 md:flex-row md:items-center">
                <h4 className="text-muted-foreground text-base font-medium capitalize">
                  {t('post_campaign_campaign_duration_start_time')}
                </h4>
                {isReadOnly ? (
                  <div className="box-border !h-auto w-full flex-1 rounded-xl px-3 py-2 text-base leading-9 font-medium shadow-[0px_7.51px_11.27px_0px_#0000000D]">
                    {formatDate(startDate) ||
                      t('post_campaign_campaign_duration_select_start_time')}
                  </div>
                ) : (
                  <DatePicker
                    defaultDate={startDate || undefined}
                    showTime={true}
                    onChange={handleStartDateChange}
                    className="box-border !h-auto w-full flex-1"
                  />
                )}
              </div>
              <div className="flex flex-col gap-6 md:flex-row md:items-center">
                <h4 className="text-muted-foreground text-base font-medium capitalize">
                  {t('post_campaign_campaign_duration_end_time')}
                </h4>
                {isReadOnly ? (
                  <div className="box-border !h-auto w-full flex-1 rounded-xl px-3 py-2 text-base leading-9 font-medium shadow-[0px_7.51px_11.27px_0px_#0000000D]">
                    {formatDate(endDate) || t('post_campaign_campaign_duration_select_end_time')}
                  </div>
                ) : (
                  <DatePicker
                    defaultDate={endDate || undefined}
                    showTime={true}
                    onChange={handleEndDateChange}
                    className="box-border !h-auto w-full flex-1"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
