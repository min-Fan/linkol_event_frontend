'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { Card, CardContent } from '@shadcn-ui/card';
import { Input } from '@shadcn-ui/input';

interface EditCampaignTitleProps {
  initialTitle?: string;
  onTitleChange?: (title: string) => void;
  isReadOnly?: boolean;
}

export default function EditCampaignTitle({
  initialTitle,
  onTitleChange,
  isReadOnly = false,
}: EditCampaignTitleProps) {
  const t = useTranslations('common');
  const [title, setTitle] = useState(initialTitle || '');
  const maxLength = 40;

  // 初始化标题
  useEffect(() => {
    if (initialTitle) {
      setTitle(initialTitle);
    }
  }, [initialTitle]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    const newTitle = e.target.value;
    if (newTitle.length <= maxLength) {
      setTitle(newTitle);
      onTitleChange?.(newTitle);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xl font-semibold">
        {t('post_campaign_campaign_title')}
        <span className="ml-1 text-red-500">*</span>
      </h3>
      <Card className="overflow-hidden rounded-3xl border-none p-0 shadow-[0px_7.51px_11.27px_0px_#0000000D]">
        <CardContent className="p-0">
          <div className="relative">
            <Input
              value={title}
              onChange={handleTitleChange}
              maxLength={40}
              className="border-none p-5 !text-base !leading-9 placeholder:text-base placeholder:leading-9"
              placeholder={t('post_campaign_campaign_title_placeholder')}
              readOnly={isReadOnly}
              disabled={isReadOnly}
            />
            <p className="text-muted-foreground absolute right-5 bottom-0 text-right text-base leading-9">
              {title.length}/{maxLength}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
