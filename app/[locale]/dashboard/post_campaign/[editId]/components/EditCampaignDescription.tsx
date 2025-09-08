'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { Card, CardContent } from '@shadcn-ui/card';
import { Textarea } from '@shadcn-ui/textarea';

interface EditCampaignDescriptionProps {
  initialDescription?: string;
  onDescriptionChange?: (description: string) => void;
}

export default function EditCampaignDescription({
  initialDescription,
  onDescriptionChange,
}: EditCampaignDescriptionProps) {
  const t = useTranslations('common');
  const [description, setDescription] = useState(initialDescription || '');
  const maxLength = 800;

  // 初始化描述
  useEffect(() => {
    if (initialDescription) {
      setDescription(initialDescription);
    }
  }, [initialDescription]);

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = e.target.value;
    if (newDescription.length <= maxLength) {
      setDescription(newDescription);
      onDescriptionChange?.(newDescription);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xl font-semibold">
        {t('post_campaign_campaign_description')}
        <span className="ml-1 text-red-500">*</span>
      </h3>
      <Card className="overflow-hidden rounded-3xl border-none p-0 shadow-[0px_7.51px_11.27px_0px_#0000000D]">
        <CardContent className="p-0">
          <div className="relative">
            <Textarea
              value={description}
              onChange={handleDescriptionChange}
              maxLength={800}
              className="min-h-24 resize-none border-none p-5 !text-base placeholder:text-base"
              placeholder={t('post_campaign_campaign_description_placeholder')}
            />
            <p className="text-muted-foreground absolute right-5 bottom-0 text-right text-base leading-9">
              {description.length}/{maxLength}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
