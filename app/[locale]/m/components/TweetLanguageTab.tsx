'use client';

import { ReactNode, useState } from 'react';
import clsx from 'clsx';
import { HeaderSection } from '../[eventId]/compontents/EventPosts';

export enum TWEET_LANGUAGE {
  ALL = '',
  CHINESE = 'zh',
  ENGLISH = 'en',
  INDONESIAN = 'in',
  JAPANESE = 'ja',
  KOREAN = 'ko',
  SPANISH = 'es',
  FRENCH = 'fr',
  GERMAN = 'de',
  RUSSIAN = 'ru',
  ARABIC = 'ar',
  PORTUGUESE = 'pt',
  VIETNAMESE = 'vi',
  THAI = 'th',
  MALAY = 'ms',
}

const TweetLanguageTabItem = (props: {
  language: TWEET_LANGUAGE;
  currentLanguage: TWEET_LANGUAGE;
  onChangeAction: (language: TWEET_LANGUAGE) => void;
  children: ReactNode;
}) => {
  const { language, currentLanguage, onChangeAction, children } = props;

  const isActive = language === currentLanguage;

  const handleClick = () => {
    onChangeAction(language);
  };

  return (
    <div
      className={clsx(
        'box-border flex h-10 flex-1 items-center justify-center rounded-xl border text-base font-medium whitespace-nowrap sm:flex-auto sm:px-6',
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

export default function TweetLanguageTab(props: {
  defaultLanguage: TWEET_LANGUAGE;
  onChangeAction: (language: TWEET_LANGUAGE) => void;
}) {
  const { defaultLanguage, onChangeAction } = props;

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['']); // 支持多选，默认选择全部

  const handleChangeLanguage = (language: TWEET_LANGUAGE) => {
    onChangeAction(language);
    setSelectedLanguages([language]);
  };

  return (
    <div className="flex items-center gap-3">
      <HeaderSection
        selectedLanguages={selectedLanguages}
        onLanguageChange={handleChangeLanguage}
        onMyTweetClick={() => {}}
        showMyTweetButton={false}
      />
    </div>
  );
}
