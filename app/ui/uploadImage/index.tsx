import { uploadImage } from '@libs/request';
import { Input } from '@shadcn/components/ui/input';
import { Loader2, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function UploadImage({
  size,
  onSuccess,
  fileUrl,
}: {
  size: number;
  fileUrl: string;
  onSuccess: (url) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/webp'];

  const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.bmp', '.webp'];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const selectedFiles = Array.from(e.target.files || []);

      if (selectedFiles.length == 0) {
        return;
      }
      // 类型校验
      const invalidFiles = selectedFiles.filter(
        (file) =>
          !ALLOWED_TYPES.includes(file.type) &&
          !ALLOWED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext))
      );
      if (invalidFiles.length > 0) {
        toast.error(
          `File type not supported: ${invalidFiles.map((f) => f.name).join(', ')}, only support JPEG, JPG, PNG, BMP, WebP`
        );
        return;
      }

      // 检查文件大小
      const oversizedFiles = selectedFiles.filter((file) => file.size > size);
      if (oversizedFiles.length > 0) {
        toast.error(`file ${oversizedFiles.map((f) => f.name).join(', ')} is larger than 5MB`);
        return;
      }

      setIsUploading(true);

      const uploadPromises = selectedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response: any = await uploadImage({
          file,
        });

        if (response.code === 200) {
          return {
            file,
            url: response.data.url,
          };
        } else {
          throw new Error(`upload ${file.name} failed: ${response.msg}`);
        }
      });
      const results = await Promise.all(uploadPromises);
      // 更新文件和URL列表
      setIsUploading(false);
      onSuccess(results[0].url);
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'file upload failed');
      setIsUploading(false);
    }
  };

  return (
    <div className="border-border hover:border-primary text-muted-foreground relative box-border flex size-40 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border transition-colors">
      {isUploading ? (
        <Loader2 className="size-6 animate-spin" />
      ) : fileUrl == '' ? (
        <Plus className="size-6" />
      ) : (
        <img src={fileUrl} alt="icon" className="size-full object-contain"></img>
      )}
      <Input
        type="file"
        className="absolute top-0 left-0 h-full w-full cursor-pointer opacity-0"
        accept=".jpeg,.jpg,.png,.bmp,.webp,image/jpeg,image/jpg,image/png,image/bmp,image/webp"
        onChange={handleFileChange}
      />
    </div>
  );
}
