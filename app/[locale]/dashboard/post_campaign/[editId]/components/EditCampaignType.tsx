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

interface EditCampaignTypeProps {
  onTypeChange?: (typeId: string) => void;
  isReadOnly?: boolean; // 只读模式
  selectedType?: string; // 已选中的类型
  initialType?: ActivityType; // 初始类型数据
}

export default function EditCampaignType({
  onTypeChange,
  isReadOnly = false,
  selectedType: propSelectedType,
  initialType,
}: EditCampaignTypeProps) {
  const t = useTranslations('common');
  const locale = useLocale();
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(!isReadOnly);

  // 监听外部传入的选中类型
  useEffect(() => {
    if (propSelectedType && propSelectedType !== selectedType) {
      setSelectedType(propSelectedType);
    }
  }, [propSelectedType]);

  // 如果是只读模式且有初始类型数据，直接使用
  useEffect(() => {
    if (isReadOnly && initialType) {
      setActivityTypes([initialType]);
      setSelectedType(initialType.id.toString());
      setIsLoading(false);
    }
  }, [isReadOnly, initialType]);

  // 获取活动类型列表（仅在非只读模式下）
  const fetchActivityTypes = async () => {
    if (isReadOnly) return;

    try {
      setIsLoading(true);
      const res: any = await getActivityType();
      if (res.code === 200) {
        setActivityTypes(res.data);
      } else {
        toast.error(res.msg || t('fetch_activity_types_failed'));
      }
    } catch (error) {
      console.error('获取活动类型失败:', error);
      toast.error(t('fetch_activity_types_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityTypes();
  }, []);

  const handleTypeChange = (typeId: string) => {
    if (isReadOnly) return;
    setSelectedType(typeId);
    onTypeChange?.(typeId);
  };

  const getDisplayName = (type: ActivityType) => {
    return locale === 'zh' ? type.zh_name : type.en_name;
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">
          {t('post_campaign_campaign_type')}
          <span className="ml-1 text-red-500">*</span>
        </h3>
        <Card className="overflow-hidden rounded-3xl border-none p-0 shadow-[0px_7.51px_11.27px_0px_#0000000D]">
          <CardContent className="flex items-center justify-center p-8">
            <UILoading />
          </CardContent>
        </Card>
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
          {isReadOnly ? (
            <div className="p-5 text-base leading-9">
              {activityTypes.find((type) => type.id.toString() === selectedType)
                ? getDisplayName(activityTypes.find((type) => type.id.toString() === selectedType)!)
                : t('post_campaign_campaign_type_placeholder')}
            </div>
          ) : (
            <Select value={selectedType} onValueChange={handleTypeChange}>
              <SelectTrigger className="border-none p-5 !text-base !leading-9 placeholder:text-base placeholder:leading-9">
                <SelectValue placeholder={t('post_campaign_campaign_type_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {getDisplayName(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
