'use client';

import { ReactNode, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Loader2, X } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@shadcn-ui/dialog';
import { Button } from '@shadcn-ui/button';
import { Textarea } from '@shadcn-ui/textarea';
import { Input } from '@shadcn-ui/input';
import { toast } from 'sonner';

import { Plus } from '@assets/svg';
import { createProject, getTweetInfoByUrl, uploadDoc } from '@libs/request';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { clearSelectedKOLInfo, updateQuickOrder } from '@store/reducers/userSlice';
import UploadImage from '@ui/uploadImage';

export const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200KB

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // 下面是部分浏览器可能的扩展名类型
  'application/octet-stream',
  'text/plain',
];

const ALLOWED_EXTENSIONS = ['.txt'];

export default function UIDialogAddNewProject(props: {
  children: ReactNode;
  onRefresh?: () => void;
}) {
  const { children, onRefresh } = props;
  const t = useTranslations('common');
  const [isPending, startTransition] = useTransition();
  const dispatch = useAppDispatch();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [iconUrls, setIconUrls] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [tweetLink, setTweetLink] = useState('');
  const [tweetLoading, setTweetLoading] = useState(false);
  const [website, setWebsite] = useState('');
  const [discordUrl, setDiscordUrl] = useState('');
  const [telegramUrl, setTelegramUrl] = useState('');

  const handleCancel = () => {
    setIsOpen(false);
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
        toast.error(
          `file type not supported: ${invalidFiles.map((f) => f.name).join(', ')}, only support TXT`
        );
        return;
      }

      // 检查文件大小
      const oversizedFiles = selectedFiles.filter((file) => file.size > MAX_FILE_SIZE);
      if (oversizedFiles.length > 0) {
        toast.error(`file ${oversizedFiles.map((f) => f.name).join(', ')} is larger than 200KB`);
        return;
      }

      setIsUploading(true);

      // 逐个上传文件
      const uploadPromises = selectedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response: any = await uploadDoc({
          file,
        });

        if (response.code === 200) {
          return {
            file,
            url: response.data.fileUri,
          };
        } else {
          throw new Error(`upload ${file.name} failed: ${response.msg}`);
        }
      });

      const results = await Promise.all(uploadPromises);

      // 更新文件和URL列表
      setFiles((prev) => [...prev, ...results.map((r) => r.file)]);
      setFileUrls((prev) => [...prev, ...results.flatMap((r) => r.url)]);
      setIsUploading(false);
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'file upload failed');
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFileUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreate = () => {
    startTransition(async () => {
      try {
        if (
          !projectName.trim() ||
          !projectDescription.trim() ||
          !iconUrls.trim() ||
          !website.trim()
        ) {
          return;
        }

        const response: any = await createProject({
          name: projectName,
          desc: projectDescription,
          document_urls: fileUrls,
          icon: iconUrls,
          website: website,
          tweet_url: tweetLink,
          discord_url: discordUrl,
          telegram_url: telegramUrl,
        });

        if (response.code === 200) {
          toast.success(t('create_project_success'));
          dispatch(updateQuickOrder({ key: 'project_id', value: response.data.id }));
        } else {
          toast.error(response.msg);
          dispatch(updateQuickOrder({ key: 'project_id', value: '' }));
        }

        onRefresh?.();
      } catch (error) {
        console.error(error);
        dispatch(updateQuickOrder({ key: 'project_id', value: '' }));
        toast.error(error.message);
      }
    });
  };

  const getinfo = async () => {
    try {
      if (!tweetLink.trim()) {
        toast.error(t('please_enter_a_valid_tweet_URL_first'));
        return;
      }
      setTweetLoading(true);
      const res: any = await getTweetInfoByUrl({ tweet_link: tweetLink });

      if (res.code == 200) {
        setProjectName(res.data.name);
        setIconUrls(res.data.icon);
        setProjectDescription(res.data.description);
        setWebsite(tweetLink);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setTweetLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="border-border flex max-h-[90vh] w-96 max-w-full flex-col overflow-hidden sm:w-220 sm:max-w-full">
        <DialogHeader className="sr-only">
          <DialogTitle>{t('add_new_project')}</DialogTitle>
          <DialogDescription>{t('add_new_project')}</DialogDescription>
        </DialogHeader>
        <div className="flex-1 space-y-6 overflow-y-auto">
          <h3 className="text-center text-base font-semibold">{t('add_new_project')}</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <h4 className="text-md font-medium capitalize">{t('project_tweet_link')}</h4>
            </div>
            <p className="text-md text-muted-foreground">{t('get_tweet_info')}</p>
            <div className="flex gap-2">
              <Input
                value={tweetLink}
                onChange={(e) => setTweetLink(e.target.value)}
                className="resize-none"
                placeholder="https://x.com/xxxx"
              />
              <Button onClick={getinfo} disabled={tweetLoading}>
                {tweetLoading ? <Loader2 className="size-4 animate-spin" /> : t('get_info')}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <i className="text-red-500">*</i>{' '}
              <h4 className="text-md font-medium capitalize">{t('project_website')}</h4>
            </div>
            <div className="relative">
              <Input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="resize-none"
                placeholder="https://www.example.com"
              />
            </div>
            <p className="text-sm text-red-500">
              {!website.trim() && t('field_required', { field: t('project_website') })}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <i className="text-red-500">*</i>{' '}
              <h4 className="text-md font-medium capitalize">{t('project_name')}</h4>
            </div>
            <div className="relative">
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                maxLength={32}
                className="resize-none"
              />
              <p className="text-muted-foreground absolute right-1 bottom-1/2 translate-y-1/2 text-sm">
                {projectName.length} / 32
              </p>
            </div>
            <p className="text-sm text-red-500">
              {!projectName.trim() && t('field_required', { field: t('project_name') })}
            </p>
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex items-center">
                <i className="text-red-500">*</i>{' '}
                <h4 className="text-md font-medium capitalize">{t('project_logo')}</h4>
              </div>
              <p className="text-md text-muted-foreground">({t('project_logo_ps')})</p>
            </div>
            <UploadImage
              fileUrl={iconUrls}
              size={500 * 1024 * 1024}
              onSuccess={(url) => setIconUrls(url)}
            ></UploadImage>
            <p className="text-sm text-red-500">
              {!iconUrls.trim() && t('field_required', { field: t('project_logo') })}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <i className="text-red-500">*</i>{' '}
              <h4 className="text-md font-medium capitalize">{t('project_description')}</h4>
            </div>
            <div className="relative">
              <Textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                maxLength={2000}
                className="h-20"
              />
              <p className="text-muted-foreground absolute right-1 bottom-1 text-sm">
                {projectDescription.length} / 2000
              </p>
            </div>
            <p className="text-sm text-red-500">
              {!projectDescription.trim() &&
                t('field_required', { field: t('project_description') })}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <h4 className="text-md font-medium capitalize">Socials (Optional)</h4>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-muted-foreground text-sm">Telegram</label>
                <Input
                  value={telegramUrl}
                  onChange={(e) => setTelegramUrl(e.target.value)}
                  placeholder="https://t.me/username"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-muted-foreground text-sm">Discord</label>
                <Input
                  value={discordUrl}
                  onChange={(e) => setDiscordUrl(e.target.value)}
                  placeholder="https://discord.gg/invite"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <h4 className="text-md font-medium capitalize">{t('add_documents')}</h4>
              <p className="text-md text-muted-foreground">({t('add_documents_description')})</p>
            </div>
            <div className="border-border hover:border-primary text-muted-foreground relative box-border flex cursor-pointer flex-col items-center justify-center space-y-2 rounded-xl border p-4 transition-colors">
              {isUploading ? (
                <Loader2 className="size-6 animate-spin" />
              ) : (
                <Plus className="size-6" />
              )}
              <p className="text-md text-center">
                {t.rich('add_documents_ps', {
                  maxSize: (chunks) => (
                    <strong className="text-base">{MAX_FILE_SIZE / 1024 / 1024}KB</strong>
                  ),
                  format: (chunks) => <span className="text-sm">TXT</span>,
                })}
              </p>
              <Input
                type="file"
                id="file"
                multiple
                className="absolute top-0 left-0 h-full w-full cursor-pointer opacity-0"
                accept=".txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
              />
            </div>
          </div>
          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-md font-medium capitalize">{t('uploaded_files')}</h4>
              <ul className="space-y-2">
                {files.map((file, index) => (
                  <li
                    key={index}
                    className="bg-secondary flex items-center justify-between rounded-md p-2"
                  >
                    <span className="truncate text-sm">
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                      className="text-destructive hover:text-destructive/90"
                    >
                      <X className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="border-border grid grid-cols-2 gap-3 border-t pt-4">
          <Button variant="secondary" onClick={handleCancel}>
            {t('cancel')}
          </Button>
          <Button onClick={handleCreate} disabled={isPending || isUploading || tweetLoading}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : t('btn_create_new_project')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
