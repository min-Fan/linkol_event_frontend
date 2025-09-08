'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ImagePlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent } from '@shadcn-ui/card';
import { uploadImage } from '@libs/request';

interface EditCampaignCoverProps {
  initialImageUrl?: string;
  onImageChange?: (imageUrl: string) => void;
  isReadOnly?: boolean;
}

export default function EditCampaignCover({
  initialImageUrl,
  onImageChange,
  isReadOnly = false,
}: EditCampaignCoverProps) {
  const t = useTranslations('common');
  const [coverImageUrl, setCoverImageUrl] = useState(initialImageUrl || '');
  const [isUploading, setIsUploading] = useState(false);

  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/webp'];
  const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.bmp', '.webp'];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  // 初始化图片URL
  useEffect(() => {
    if (initialImageUrl) {
      setCoverImageUrl(initialImageUrl);
    }
  }, [initialImageUrl]);

  // 处理图片上传
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const selectedFiles = Array.from(e.target.files || []);
      if (selectedFiles.length === 0) return;

      const file = selectedFiles[0];

      // 类型校验
      if (
        !ALLOWED_TYPES.includes(file.type) &&
        !ALLOWED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext))
      ) {
        toast.error(t('image_format_error'));
        return;
      }

      // 检查文件大小
      if (file.size > MAX_SIZE) {
        toast.error(t('image_size_limit_5mb'));
        return;
      }

      setIsUploading(true);

      const response: any = await uploadImage({ file });

      if (response.code === 200) {
        setCoverImageUrl(response.data.url);
        onImageChange?.(response.data.url);
        toast.success(t('image_upload_success'));
      } else {
        throw new Error(response.msg || t('image_upload_failed'));
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || t('image_upload_failed'));
    } finally {
      setIsUploading(false);
      // 清空input值，允许重复选择同一文件
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xl font-semibold">
        {t('post_campaign_campaign_cover')}
        <span className="ml-1 text-red-500">*</span>
      </h3>
      <div className="3xl:grid-cols-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          className={`relative ${!isReadOnly ? 'cursor-pointer' : ''} overflow-hidden rounded-3xl border-none p-0 shadow-[0px_7.51px_11.27px_0px_#0000000D]`}
        >
          <CardContent className="p-0">
            {isUploading ? (
              <div className="pointer-events-none flex min-h-40 flex-col items-center justify-center gap-y-2">
                <Loader2 className="text-muted-foreground size-6 animate-spin" />
                <p className="text-muted-foreground text-base">{t('uploading')}</p>
              </div>
            ) : coverImageUrl ? (
              <div className="pointer-events-none relative min-h-40 overflow-hidden">
                <img src={coverImageUrl} alt="" className="size-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-200 hover:opacity-100">
                  <p className="text-sm font-medium text-white">{t('click_to_change_image')}</p>
                </div>
              </div>
            ) : (
              <div className="pointer-events-none flex min-h-40 flex-col items-center justify-center gap-y-2">
                <ImagePlus className="text-muted-foreground size-6" />
                <dl className="text-center text-base">
                  <dt className="font-bold">{t('post_campaign_campaign_cover_desc')}</dt>
                  <dd className="text-muted-foreground">
                    {t('post_campaign_campaign_cover_tips')}
                  </dd>
                </dl>
              </div>
            )}
          </CardContent>
          {!isReadOnly && (
            <input
              type="file"
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              accept=".jpeg,.jpg,.png,.bmp,.webp,image/jpeg,image/jpg,image/png,image/bmp,image/webp"
              onChange={handleFileChange}
              disabled={isUploading}
              style={{ fontSize: '16px' }}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
