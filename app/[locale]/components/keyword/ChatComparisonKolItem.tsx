import defaultAvatar from '@assets/image/avatar.png';
import { getKolInfoByUserName } from '@libs/request';
import { Input } from '@shadcn/components/ui/input';
import { Loader2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';
export default function ChatComparisonKolItem({
  isLoading,
  name,
  avatar,
  inputChange,
  defaultName,
  remove,
  querySuccess,
}: {
  isLoading: boolean;
  name: string;
  avatar: string;
  defaultName: string;
  inputChange: (val) => void;
  remove: () => void;
  querySuccess: (data: any) => void;
}) {
  const t = useTranslations('common');
  const [loading, setLoading] = useState(false);
  const query = async () => {
    try {
      if (name.trim() == '') {
        return;
      }
      setLoading(true);
      const res: any = await getKolInfoByUserName({ username: name });
      if (res.code == 200) {
        querySuccess(res.data);
      } else {
        toast.error(t('not_find_user'));
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-primary/15 f-full relative flex flex-1/2 flex-col items-center justify-center gap-1 rounded-md p-2">
      <div className="bg-background box-border flex size-10 items-center justify-center overflow-hidden rounded-full">
        {avatar ? (
          <img
            src={avatar}
            alt="avatar"
            className="h-full w-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = defaultAvatar.src;
            }}
          />
        ) : (
          <Image src={defaultAvatar} alt="avatar" className="h-full w-full object-cover"></Image>
        )}
      </div>
      <div className="">{name ? `@${name}` : defaultName}</div>
      {name && avatar ? (
        <></>
      ) : (
        <Input
          id="width"
          defaultValue=""
          value={name}
          placeholder={t('search_tip')}
          className="text-md col-span-3 h-full"
          onChange={(e) => inputChange(e.target.value)}
          autoComplete="off"
          disabled={isLoading}
          onBlur={query}
        />
      )}
      {name && avatar && (
        <div
          className="hover:bg-muted-foreground/20 absolute top-1 right-1 cursor-pointer rounded-md p-1"
          onClick={remove}
        >
          <X className="size-4" />
        </div>
      )}
      {loading ||
        (isLoading && (
          <div className="bg-background/50 absolute top-0 left-0 flex h-full w-full items-center justify-center">
            <Loader2 className="size-4 animate-spin"></Loader2>
          </div>
        ))}
    </div>
  );
}
