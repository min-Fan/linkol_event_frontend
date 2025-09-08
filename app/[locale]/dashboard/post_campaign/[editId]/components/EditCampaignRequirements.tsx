'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { Card, CardContent } from '@shadcn-ui/card';
import { Textarea } from '@shadcn-ui/textarea';

interface EditCampaignRequirementsProps {
  onRequirementsChange?: (requirements: string) => void;
  isReadOnly?: boolean; // 只读模式
  initialRequirements?: string; // 初始推文要求
}

export default function EditCampaignRequirements({
  onRequirementsChange,
  isReadOnly = false,
  initialRequirements,
}: EditCampaignRequirementsProps) {
  const t = useTranslations('common');
  const [requirements, setRequirements] = useState(initialRequirements || '');
  const maxLength = 4000;

  // 初始化推文要求
  useEffect(() => {
    if (initialRequirements !== undefined) {
      setRequirements(initialRequirements);
    }
  }, [initialRequirements]);

  const handleRequirementsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isReadOnly) return;
    const newRequirements = e.target.value;
    if (newRequirements.length <= maxLength) {
      setRequirements(newRequirements);
      onRequirementsChange?.(newRequirements);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xl font-semibold">
        {t('post_campaign_campaign_requirements')}
        <span className="ml-1 text-red-500">*</span>
      </h3>
      <Card className="overflow-hidden rounded-3xl border-none p-0 shadow-[0px_7.51px_11.27px_0px_#0000000D]">
        <CardContent className="p-0">
          <div className="relative">
            <Textarea
              value={requirements}
              onChange={handleRequirementsChange}
              maxLength={maxLength}
              className="min-h-24 resize-none border-none p-5 !text-base placeholder:text-base"
              placeholder={t('post_campaign_campaign_requirements_placeholder')}
              readOnly={isReadOnly}
              disabled={isReadOnly}
            />
            <p className="text-muted-foreground absolute right-5 bottom-0 text-right text-base leading-9">
              {requirements.length}/{maxLength}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
