'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';

import { Card, CardContent } from '@shadcn-ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shadcn-ui/select';
import { getActivityType } from '@libs/request';
import UILoading from '@ui/loading';

interface ActivityType {
  id: number;
  zh_name: string;
  en_name: string;
  code: string;
}

interface CampaignTypeProps {
  onTypeChange?: (typeId: string) => void;
  resetTrigger?: number; // 添加重置触发器
}

export default function CampaignType({ onTypeChange, resetTrigger }: CampaignTypeProps) {
  const t = useTranslations('common');
  const locale = useLocale();
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // 监听重置触发器
  useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger > 0) {
      setSelectedType('');
    }
  }, [resetTrigger]);

  // 获取活动类型列表
  const fetchActivityTypes = async () => {
    try {
      setIsLoading(true);
      const response: any = await getActivityType();

      if (response.code === 200 && response.data) {
        setActivityTypes(response.data);
      } else {
        toast.error(response.msg || t('fetch_activity_types_failed'));
      }
    } catch (error) {
      console.error('获取活动类型失败:', error);
      toast.error(t('fetch_activity_types_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  // 处理类型选择
  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    onTypeChange?.(value);
  };

  // 初始加载活动类型列表
  useEffect(() => {
    fetchActivityTypes();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">
          {t('post_campaign_campaign_type')}
          <span className="ml-1 text-red-500">*</span>
        </h3>
        <div className="flex flex-col items-center justify-center py-10">
          <UILoading />
          <div className="text-muted-foreground mt-4">{t('loading_activity_types')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xl font-semibold">
        {t('post_campaign_campaign_type')}
        <span className="ml-1 text-red-500">*</span>
      </h3>
      <Card className="overflow-hidden rounded-3xl border-none p-0 shadow-[0px_7.51px_11.27px_0px_#0000000D]">
        <CardContent className="p-0">
          <Select value={selectedType} onValueChange={handleTypeChange}>
            <SelectTrigger className="!h-auto w-full border-none px-5 py-2.5 !text-base !leading-9">
              <SelectValue placeholder={t('post_campaign_campaign_type_placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {activityTypes.map((type) => (
                <SelectItem
                  key={type.id}
                  className="cursor-pointer text-base leading-9"
                  value={type.id.toString()}
                >
                  {locale === 'zh' ? type.zh_name : type.en_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {activityTypes.length === 0 && !isLoading && (
        <div className="py-4 text-center">
          <p className="text-muted-foreground text-sm">{t('no_activity_types_found')}</p>
        </div>
      )}
    </div>
  );
}
