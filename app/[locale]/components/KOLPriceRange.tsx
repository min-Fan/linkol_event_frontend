'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Input } from '@shadcn-ui/input';

import { useAppDispatch, useAppSelector } from '@store/hooks';
import { updateFilter } from '@store/reducers/userSlice';

export default function KOLPriceRange() {
  const t = useTranslations('common');
  const dispatch = useAppDispatch();
  const filter = useAppSelector((state) => state.userReducer?.filter);
  const [minPrice, setMinPrice] = useState(filter?.min_price || '');
  const [maxPrice, setMaxPrice] = useState(filter?.max_price || '');

  const handleMinMax = (min: number, max: number) => {
    setMinPrice(min.toString());
    setMaxPrice(max.toString());
    dispatch(updateFilter({ key: 'min_price', value: min.toString() }));
    dispatch(updateFilter({ key: 'max_price', value: max.toString() }));
  };

  return (
    <div className="bg-muted text-muted-foreground hidden h-9 w-fit items-center justify-center gap-x-4 rounded-lg p-[3px] sm:inline-flex">
      <span className="text-muted-foreground pl-4 capitalize">{t('price_range')}</span>
      <span
        className="hover:text-primary hidden cursor-pointer font-semibold md:block"
        onClick={() => handleMinMax(10, 50)}
      >
        10-50($)
      </span>
      <span
        className="hover:text-primary hidden cursor-pointer font-semibold md:block"
        onClick={() => handleMinMax(50, 100)}
      >
        50-100($)
      </span>
      <span
        className="hover:text-primary hidden cursor-pointer font-semibold md:block"
        onClick={() => handleMinMax(100, 500)}
      >
        100-500($)
      </span>
      <div className="flex items-center gap-2">
        <Input
          className="bg-background h-[29px] w-16 border-none text-sm"
          value={minPrice}
          onChange={(e) => {
            // 输入阶段只更新值，不做检查
            setMinPrice(e.target.value);
          }}
          onBlur={(e) => {
            const value = parseInt(e.target.value, 10);
            if (!isNaN(value) && value >= 0) {
              setMinPrice(value.toString());
              // 如果最大值小于新的最小值，更新最大值
              if (maxPrice !== '' && parseInt(maxPrice, 10) < value) {
                setMaxPrice(value.toString());
                // 更新 Store 中的最大值
                dispatch(updateFilter({ key: 'max_price', value: value.toString() }));
              }
              // 更新 Store 中的最小值
              dispatch(updateFilter({ key: 'min_price', value: value.toString() }));
            } else if (e.target.value === '') {
              setMinPrice('');
              // 清空 Store 中的最小值
              dispatch(updateFilter({ key: 'min_price', value: '' }));
            } else {
              // 如果输入无效，重置为空或0
              setMinPrice('0');
              dispatch(updateFilter({ key: 'min_price', value: '0' }));
            }
          }}
          type="number"
          placeholder="Min"
          min={0}
        />
        <span>-</span>
        <Input
          className="bg-background h-[29px] w-16 border-none text-sm"
          value={maxPrice}
          onChange={(e) => {
            // 输入阶段只更新值，不做检查
            setMaxPrice(e.target.value);
          }}
          onBlur={(e) => {
            const value = parseInt(e.target.value, 10);
            const minVal = minPrice === '' ? 0 : parseInt(minPrice, 10);
            if (!isNaN(value) && value >= minVal) {
              setMaxPrice(value.toString());
              // 更新 Store 中的最大值
              dispatch(updateFilter({ key: 'max_price', value: value.toString() }));
            } else if (e.target.value === '') {
              setMaxPrice('');
              // 清空 Store 中的最大值
              dispatch(updateFilter({ key: 'max_price', value: '' }));
            } else {
              // 如果输入无效，设置为最小值
              setMaxPrice(minVal.toString());
              dispatch(updateFilter({ key: 'max_price', value: minVal.toString() }));
            }
          }}
          type="number"
          placeholder="Max"
          min={minPrice === '' ? 0 : minPrice}
        />
      </div>
    </div>
  );
}
