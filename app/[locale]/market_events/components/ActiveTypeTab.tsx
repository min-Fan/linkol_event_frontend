'use client';

import { ReactNode, useState } from 'react';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';

export enum ACTIVE_TYPE {
  ALL = '',
  LATEST = 'new',
  TRENDING = 'hot',
  HIGH_REWARDS = 'high',
  ENDING_SOON = 'deadline',
}

const ActiveTypeTabItem = (props: {
  type: ACTIVE_TYPE;
  currentType: ACTIVE_TYPE;
  onChangeAction: (type: ACTIVE_TYPE) => void;
  children: ReactNode;
}) => {
  const { type, currentType, onChangeAction, children } = props;

  const isActive = type === currentType;

  const handleClick = () => {
    onChangeAction(type);
  };

  return (
    <div
      className={clsx(
        'box-border flex h-10 w-full flex-1 items-center justify-center rounded-xl border px-6 text-base font-medium whitespace-nowrap lg:w-auto lg:flex-none',
        isActive
          ? 'border-primary text-primary bg-primary/5'
          : 'bg-secondary text-muted-foreground cursor-pointer border-transparent'
      )}
      onClick={handleClick}
    >
      {children}
    </div>
  );
};

export default function ActiveTypeTab(props: {
  defaultType: ACTIVE_TYPE;
  onChangeAction: (type: ACTIVE_TYPE) => void;
}) {
  const { defaultType, onChangeAction } = props;
  const t = useTranslations('common');

  const [type, setType] = useState(defaultType);

  const handleChangeType = (type: ACTIVE_TYPE) => {
    setType(type);
    onChangeAction(type);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <h1 className="text-xl font-bold text-white">{t('all_events')}</h1>
      {/* <ActiveTypeTabItem
        type={ACTIVE_TYPE.ALL}
        currentType={type}
        onChangeAction={handleChangeType}
      >
        {t('all')}
      </ActiveTypeTabItem>
      <ActiveTypeTabItem
        type={ACTIVE_TYPE.LATEST}
        currentType={type}
        onChangeAction={handleChangeType}
      >
        {t('latest')}
      </ActiveTypeTabItem>
      <ActiveTypeTabItem
        type={ACTIVE_TYPE.TRENDING}
        currentType={type}
        onChangeAction={handleChangeType}
      >
        {t('trending')}
      </ActiveTypeTabItem>
      <ActiveTypeTabItem
        type={ACTIVE_TYPE.HIGH_REWARDS}
        currentType={type}
        onChangeAction={handleChangeType}
      >
        {t('high_rewards')}
      </ActiveTypeTabItem>
      <ActiveTypeTabItem
        type={ACTIVE_TYPE.ENDING_SOON}
        currentType={type}
        onChangeAction={handleChangeType}
      >
        {t('ending_soon')}
      </ActiveTypeTabItem> */}
    </div>
  );
}
