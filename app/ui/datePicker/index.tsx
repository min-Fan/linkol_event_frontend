'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { format } from 'date-fns';
import { zhCN, enGB } from 'date-fns/locale';
import { CalendarIcon, Clock } from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'sonner';

import { Button } from '@shadcn/components/ui/button';
import { Calendar } from '@shadcn/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn/components/ui/popover';

export function DatePicker(props: {
  className?: string;
  iconClassName?: string;
  dateClassName?: string;
  defaultDate?: Date;
  showTime?: boolean;
  onChange?: (date: Date) => void;
}) {
  const {
    className,
    iconClassName,
    dateClassName,
    defaultDate,
    showTime = false,
    onChange,
  } = props;
  const t = useTranslations('common');
  const locale = useLocale();

  const [date, setDate] = useState<Date | undefined>(defaultDate);
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState<string>('');
  const [minutes, setMinutes] = useState<string>('');

  // 使用useCallback包装onSelect处理函数，避免重复创建
  const handleDateSelect = useCallback(
    (newDate: Date | undefined) => {
      if (!newDate) {
        return;
      }

      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      const selectedDate = new Date(newDate);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate < currentDate) {
        toast.error(t('error_date_must_be_future'));
        return;
      }

      // 如果显示时间，则设置时间
      if (showTime) {
        selectedDate.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0, 0);
      }

      setDate(selectedDate);

      if (onChange) {
        onChange(selectedDate);
      }
    },
    [onChange, showTime, hours, minutes]
  );

  // 处理时间变化
  const handleTimeChange = useCallback(() => {
    if (!date) return;

    const newDate = new Date(date);
    newDate.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0, 0);

    setDate(newDate);

    if (onChange) {
      onChange(newDate);
    }
  }, [date, hours, minutes, onChange]);

  // 仅在defaultDate发生变化且与当前date不同时更新
  useEffect(() => {
    if (defaultDate && (!date || defaultDate.getTime() !== date.getTime())) {
      setDate(defaultDate);
      if (showTime) {
        setHours(String(defaultDate.getHours()).padStart(2, '0'));
        setMinutes(String(defaultDate.getMinutes()).padStart(2, '0'));
      }
    }
  }, [defaultDate, date, showTime]);

  // 格式化显示文本
  const formatDisplayText = () => {
    if (!date) return t('pick_a_date');

    if (showTime) {
      return format(date, 'PPP HH:mm', { locale: locale === 'zh' ? zhCN : enGB });
    }

    return format(date, 'PPP', { locale: locale === 'zh' ? zhCN : enGB });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={clsx(
            'w-[240px] justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className
          )}
          onClick={() => setIsOpen(true)}
        >
          <CalendarIcon className={clsx('mr-2 h-4 w-4', iconClassName)} />
          <span className={clsx(dateClassName)}>{formatDisplayText()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
            locale={locale === 'zh' ? zhCN : enGB}
          />

          {showTime && (
            <div className="border-border mt-4 space-y-3 border-t pt-2">
              <div className="flex items-center gap-2">
                <Clock className="text-muted-foreground h-4 w-4" />
                <span className="text-sm font-medium">{t('pick_time') || 'Time'}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-muted-foreground text-center text-xs">
                    {t('hours') || 'Hours'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        const currentHour = parseInt(hours) || 0;
                        const newHour = currentHour <= 0 ? 23 : currentHour - 1;
                        const newHourStr = String(newHour).padStart(2, '0');
                        setHours(newHourStr);

                        if (date) {
                          const newDate = new Date(date);
                          newDate.setHours(newHour, parseInt(minutes) || 0, 0, 0);
                          setDate(newDate);
                          if (onChange) {
                            onChange(newDate);
                          }
                        }
                      }}
                    >
                      -
                    </Button>
                    <div className="flex-1 text-center">
                      <span className="inline-block min-w-[2rem] text-lg font-medium">
                        {hours || '00'}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        const currentHour = parseInt(hours) || 0;
                        const newHour = currentHour >= 23 ? 0 : currentHour + 1;
                        const newHourStr = String(newHour).padStart(2, '0');
                        setHours(newHourStr);

                        if (date) {
                          const newDate = new Date(date);
                          newDate.setHours(newHour, parseInt(minutes) || 0, 0, 0);
                          setDate(newDate);
                          if (onChange) {
                            onChange(newDate);
                          }
                        }
                      }}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-muted-foreground text-center text-xs">
                    {t('minutes') || 'Minutes'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        const currentMinute = parseInt(minutes) || 0;
                        const newMinute = currentMinute <= 0 ? 59 : currentMinute - 1;
                        const newMinuteStr = String(newMinute).padStart(2, '0');
                        setMinutes(newMinuteStr);

                        if (date) {
                          const newDate = new Date(date);
                          newDate.setHours(parseInt(hours) || 0, newMinute, 0, 0);
                          setDate(newDate);
                          if (onChange) {
                            onChange(newDate);
                          }
                        }
                      }}
                    >
                      -
                    </Button>
                    <div className="flex-1 text-center">
                      <span className="inline-block min-w-[2rem] text-lg font-medium">
                        {minutes || '00'}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        const currentMinute = parseInt(minutes) || 0;
                        const newMinute = currentMinute >= 59 ? 0 : currentMinute + 1;
                        const newMinuteStr = String(newMinute).padStart(2, '0');
                        setMinutes(newMinuteStr);

                        if (date) {
                          const newDate = new Date(date);
                          newDate.setHours(parseInt(hours) || 0, newMinute, 0, 0);
                          setDate(newDate);
                          if (onChange) {
                            onChange(newDate);
                          }
                        }
                      }}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
