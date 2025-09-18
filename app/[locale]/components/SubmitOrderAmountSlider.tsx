'use client';

import { useTranslations } from 'next-intl';
import { Minus, Plus } from 'lucide-react';
import clsx from 'clsx';
import { Slider } from '@shadcn-ui/slider';
import CompSubmitOrderSelectedKOL from './SubmitOrderSelectedKOL';
import { useAppSelector } from '@store/hooks';
import defaultAvatar from '@assets/image/avatar.png';
import { cn } from '@shadcn/lib/utils';

export default function SubmitOrderAmountSlider(props: {
  min: number;
  max: number;
  current: number;
  onValueChange: (value: number[]) => void;
  amount?: string;
}) {
  const { min, max, current, onValueChange } = props;
  const t = useTranslations('common');
  const selectedKOLs = useAppSelector((state) => state.userReducer?.selectedKOLs);
  const payTokenInfo = useAppSelector((state) => state.userReducer?.pay_token_info);
  const sortedKOLs = [...(selectedKOLs || [])].sort((a, b) => b.price_yuan - a.price_yuan);
  const handleMinus = () => {
    if (current <= min) {
      return;
    }

    onValueChange([current - 1]);
  };

  const handlePlus = () => {
    if (current >= max) {
      return;
    }

    onValueChange([current + 1]);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-x-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xl font-semibold">{t('selected_kols')}</h3>
        <ul className="text-md text-primary flex items-center gap-x-2">
          <li>
            <strong>{current}</strong>
            <span> KOLs</span>
          </li>
          <li>|</li>
          <li>
            <span>{t('estimated_total')}: </span>
            <strong>{props.amount || 0}</strong>
          </li>
        </ul>
      </div>
      <div className="text-muted-foreground bg-primary-foreground space-y-2 rounded-2xl p-4">
        <CompSubmitOrderSelectedKOL KOLsCount={current} />
        <div className="border-primary/50 my-6 w-full border-t"></div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="text-primary text-md font-medium">{t('kols_list_description_title')}</p>
          <p className="text-primary text-md">
            {t.rich('kols_list_description', {
              current: (chunks) => (
                <span className="text-foreground text-md font-medium">
                  {current} {t('lead')}
                </span>
              ),
              max: (chunks) => (
                <span className="text-foreground text-md font-medium">
                  {' '}
                  {t('combine', { max: max })}
                </span>
              ),
            })}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <div
            className={clsx(
              'bg-primary flex h-4 w-4 cursor-pointer items-center justify-center rounded-full',
              current === min && 'bg-primary/40 !cursor-not-allowed'
            )}
          >
            <Minus className={clsx('w-2 text-white')} onClick={handleMinus} />
          </div>
          <Slider
            value={[current]}
            min={min}
            max={max}
            step={1}
            trackClassName="bg-primary/40"
            onValueChange={onValueChange}
          />
          <div
            className={clsx(
              'bg-primary flex h-4 w-4 cursor-pointer items-center justify-center rounded-full',
              current === max && 'bg-primary/40 !cursor-not-allowed'
            )}
          >
            <Plus className="w-2 text-white" onClick={handlePlus} />
          </div>
        </div>
        <div className="flex w-full items-center justify-between">
          <div className="bg-background flex h-10 items-center justify-between gap-10 rounded-xl p-2">
            <div className="relative flex items-center gap-1 overflow-hidden">
              {sortedKOLs.slice(0, current > 5 ? 5 : current).map((kol, index) => (
                <div
                  className={cn(
                    'border-border size-6 min-w-6 overflow-hidden rounded-full border-2',
                    index !== 0 && '-ml-3'
                  )}
                  key={kol.id}
                >
                  <img
                    src={kol.profile_image_url}
                    alt={kol.name}
                    className="size-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = defaultAvatar.src;
                    }}
                  />
                </div>
              ))}
              {/* <div className="from-background pointer-events-none absolute inset-0 top-0 right-0 h-full bg-gradient-to-l from-[0%] to-transparent to-[20%]"></div> */}
              <span className="text-foreground text-sm">
                {current}/{max}
              </span>
            </div>
            <span className="text-foreground text-sm whitespace-nowrap">{t('lead_kol')}</span>
          </div>

          {sortedKOLs.length > 1 && (
            <div className="bg-background flex h-10 items-center justify-between gap-10 rounded-xl p-2">
              <div className="relative flex items-center gap-1 overflow-hidden">
                {sortedKOLs.slice(current, current + 5).map((kol, index) => (
                  <div
                    className={cn(
                      'border-border size-6 min-w-6 overflow-hidden rounded-full border-2',
                      index !== 0 && '-ml-3'
                    )}
                    key={kol.id}
                  >
                    <img
                      src={kol.profile_image_url}
                      alt={kol.name}
                      className="size-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = defaultAvatar.src;
                      }}
                    />
                  </div>
                ))}
                {/* <div className="from-background pointer-events-none absolute inset-0 top-0 right-0 h-full bg-gradient-to-l from-[0%] to-transparent to-[20%]"></div> */}
                <span className="text-foreground text-sm">
                  {max - current}/{max}
                </span>
              </div>
              <span className="text-foreground text-sm whitespace-nowrap">
                {t('kol_in_waitlist')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
