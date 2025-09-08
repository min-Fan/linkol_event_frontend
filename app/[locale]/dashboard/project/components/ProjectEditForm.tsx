'use client';

import { useTranslations } from 'next-intl';
import { Plus, Loader2, X, Edit, Pencil, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';

import { Input } from '@shadcn-ui/input';
import { Textarea } from '@shadcn-ui/textarea';
import { Button } from '@shadcn-ui/button';

import PagesRoute from '@constants/routes';
import { useRouter } from '@libs/i18n/navigation';
import { MAX_FILE_SIZE } from 'app/[locale]/components/CreateProductForm';
import { IProjectDetail } from 'app/@types/types';
import { getTweetInfoByUrl, updateProject, uploadDoc } from '@libs/request';
import { useParams } from 'next/navigation';
import UploadImage from '@ui/uploadImage';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream',
  'text/plain',
];

const ALLOWED_EXTENSIONS = ['.txt'];

export default function ProjectEditForm({
  projectDetail,
}: {
  projectDetail: IProjectDetail | undefined;
}) {
  const t = useTranslations('common');
  const router = useRouter();
  const { projectId } = useParams();
  const [tweetLoading, setTweetLoading] = useState(false);
  const [form, setForm] = useState<{
    website: string;
    name: string;
    desc: string;
    icon: string;
    doc_url: string[];
    tweet_url: string;
  }>({
    website: '',
    name: '',
    desc: '',
    icon: '',
    doc_url: [],
    tweet_url: '',
  });

  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (projectDetail) {
      setForm({
        website: projectDetail.website || '',
        name: projectDetail.name || '',
        desc: projectDetail.desc || '',
        icon: projectDetail.icon || '',
        doc_url: projectDetail.document_urls || [],
        tweet_url: projectDetail.tweet_url || '',
      });
      // 初始化文件列表
      if (projectDetail.document_urls?.length) {
        setFiles(
          projectDetail.document_urls.map(
            (url) => new File([], url.split('/').pop() || '', { type: 'text/plain' })
          )
        );
      }
    }
  }, [projectDetail]);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const urlReg = /^https?:\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/;

  const [isUpdating, setIsUpdating] = useState(false);
  const handleUpdate = async () => {
    if (!form.name.trim() || !form.desc.trim()) {
      toast.error(t('error_required_fields'));
      return;
    }
    if (form.website && !urlReg.test(form.website.trim())) {
      toast.error(t('error_invalid_url'));
      return;
    }

    console.log('pass', form);
    try {
      setIsUpdating(true);
      const response: any = await updateProject(Number(projectId), {
        desc: form.desc,
        icon: form.icon,
        name: form.name,
        website: form.website,
        document_urls: form.doc_url,
        tweet_url: form.tweet_url,
      });
      setIsUpdating(false);
      if (response.code === 200) {
        toast.success(t('update_success'));
        router.replace(PagesRoute.DASHBOARD);
      } else {
        toast.error(response.msg);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || t('update_failed'));
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    router.replace(PagesRoute.DASHBOARD);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const selectedFiles = Array.from(e.target.files || []);

      // 类型校验
      const invalidFiles = selectedFiles.filter(
        (file) =>
          !ALLOWED_TYPES.includes(file.type) &&
          !ALLOWED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext))
      );
      if (invalidFiles.length > 0) {
        toast.error(`不支持的文件类型: ${invalidFiles.map((f) => f.name).join(', ')}, 仅支持 TXT`);
        return;
      }

      // 检查文件大小
      const oversizedFiles = selectedFiles.filter((file) => file.size > MAX_FILE_SIZE);
      if (oversizedFiles.length > 0) {
        toast.error(`文件 ${oversizedFiles.map((f) => f.name).join(', ')} 超过 200KB`);
        return;
      }

      setIsUploading(true);

      // 逐个上传文件
      const uploadPromises = selectedFiles.map(async (file) => {
        const response: any = await uploadDoc({
          file,
        });

        if (response.code === 200) {
          return {
            file,
            url: response.data.fileUri,
          };
        } else {
          throw new Error(`上传 ${file.name} 失败: ${response.msg}`);
        }
      });

      const results = await Promise.all(uploadPromises);

      // 更新文件和URL列表
      setFiles((prev) => [...prev, ...results.map((r) => r.file)]);
      setForm((prev) => ({
        ...prev,
        doc_url: [...prev.doc_url, ...results.map((r) => r.url)],
      }));
      setIsUploading(false);
    } catch (error) {
      console.error(error);
      toast.error(error.message || '文件上传失败');
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setForm((prev) => ({
      ...prev,
      doc_url: prev.doc_url.filter((_, i) => i !== index),
    }));
  };

  const handlePreview = (url: string) => {
    window.open(url, '_blank');
  };

  const getinfo = async () => {
    try {
      if (!form.tweet_url.trim()) {
        toast.error(t('please_enter_a_valid_tweet_URL_first'));
        return;
      }
      setTweetLoading(true);
      const res: any = await getTweetInfoByUrl({ tweet_link: form.tweet_url });

      if (res.code == 200) {
        handleChange('name', res.data.name);
        handleChange('icon', res.data.icon);
        handleChange('desc', res.data.description);
        handleChange('website', form.tweet_url);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setTweetLoading(false);
    }
  };
  return (
    <div className="w-full max-w-full flex-1 space-y-6 rounded-xl bg-[url('/background.jpg')] bg-cover bg-center bg-no-repeat p-4 px-2">
      {isUpdating && (
        <div className="bg-background/60 absolute inset-0 z-10 flex h-full w-full items-center justify-center">
          <Loader2 className="text-primary size-10 animate-spin" />
        </div>
      )}
      <div className="text-muted-foreground space-y-2">
        <dl>
          <dt className="font-semibold capitalize">
            <div className="flex items-center">
              <h3 className="font-semibold capitalize">{t('project_tweet_link')}</h3>
            </div>
          </dt>
          <dd className="text-muted-foreground text-sm">{t('get_tweet_info')}</dd>
        </dl>

        <div className="flex items-center gap-2">
          <Input
            value={form.tweet_url}
            placeholder="https://x.com/xxxx"
            onChange={(e) => handleChange('tweet_url', e.target.value)}
          />
          <Button onClick={getinfo} disabled={tweetLoading}>
            {tweetLoading ? <Loader2 className="size-4 animate-spin" /> : t('get_info')}
          </Button>
        </div>
      </div>
      <div className="text-muted-foreground space-y-2">
        <div className="flex items-center">
          <i className="text-red-500">*</i>{' '}
          <h3 className="font-semibold capitalize">{t('project_website')}</h3>
        </div>
        <Input
          value={form.website}
          placeholder="https://www.example.com"
          onChange={(e) => handleChange('website', e.target.value)}
        />
      </div>
      <div className="text-muted-foreground space-y-2">
        <div className="flex items-center">
          <i className="text-red-500">*</i>{' '}
          <h3 className="font-semibold capitalize">{t('project_name')}</h3>
        </div>
        <div className="relative">
          <Input
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            maxLength={32}
          />
          <p className="text-muted-foreground absolute right-1 bottom-1/2 translate-y-1/2 text-sm">
            {form.name.length} / 32
          </p>
        </div>
      </div>
      <div className="text-muted-foreground space-y-2">
        <dl>
          <dt className="font-semibold capitalize">
            <div className="flex items-center">
              <i className="text-red-500">*</i>{' '}
              <h3 className="font-semibold capitalize">{t('project_logo')}</h3>
            </div>
          </dt>
          <dd className="text-muted-foreground text-sm">{t('project_logo_ps')}</dd>
        </dl>
        <UploadImage
          fileUrl={form.icon}
          size={500 * 1024 * 1024}
          onSuccess={(url) => handleChange('icon', url)}
        ></UploadImage>
      </div>
      <div className="text-muted-foreground w-full space-y-2">
        <div className="flex items-center">
          <i className="text-red-500">*</i>{' '}
          <h3 className="font-semibold capitalize">{t('project_description')}</h3>
        </div>
        <div className="relative flex w-full">
          <Textarea
            value={form.desc}
            onChange={(e) => handleChange('desc', e.target.value)}
            className="h-auto max-h-[100px] w-full resize-none break-words whitespace-pre-wrap"
            rows={5}
            maxLength={2000}
          />
          <p className="text-muted-foreground absolute right-1 bottom-1 text-sm">
            {form.desc.length} / 2000
          </p>
        </div>
      </div>
      <div className="text-muted-foreground space-y-2">
        <dl>
          <dt className="font-semibold capitalize">{t('add_documents')}</dt>
          <dd className="text-muted-foreground text-sm">{t('add_documents_description')}</dd>
        </dl>
        <div className="hover:bg-card border-secondary hover:border-primary bg-secondary relative box-border flex max-w-md cursor-pointer flex-col items-center justify-center space-y-2 rounded-xl border p-6 transition-colors">
          {isUploading ? <Loader2 className="size-6 animate-spin" /> : <Plus className="size-6" />}
          <p className="relative cursor-pointer text-sm">
            {t.rich('add_documents_ps', {
              maxSize: (chunks) => <strong className="text-base">{MAX_FILE_SIZE / 1024}KB</strong>,
              format: (chunks) => <span className="text-sm">TXT</span>,
            })}
          </p>
          <Input
            type="file"
            id="file"
            multiple
            className="absolute top-0 left-0 z-10 h-full w-full opacity-0"
            accept=".txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
          />
        </div>

        {/* 已上传文件列表 */}
        {(files.length > 0 || form.doc_url.length > 0) && (
          <div className="mt-4 space-y-2">
            <h4 className="font-medium">{t('uploaded_files')}:</h4>
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li
                  key={index}
                  className="bg-secondary flex items-center justify-between rounded-md p-2"
                >
                  <span
                    className="cursor-pointer truncate text-sm"
                    onClick={() => handlePreview(form.doc_url[index])}
                  >
                    {file.name} ({(file.size / 1024).toFixed(2)}KB)
                  </span>
                  <div className="flex items-center gap-0">
                    {/* <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreview(form.doc_url[index])}
                      className="text-primary hover:text-primary/90"
                    >
                      <Eye className="size-4" />
                    </Button> */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-destructive hover:text-destructive/90"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleCancel}>
          {t('btn_cancel')}
        </Button>
        <Button onClick={handleUpdate}>{t('btn_update')}</Button>
      </div>
    </div>
  );
}
