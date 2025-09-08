'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Copy, RefreshCw, LoaderCircle } from 'lucide-react';

import { Input } from '@shadcn-ui/input';
import { Button } from '@shadcn-ui/button';
import { toast } from 'sonner';

import { CACHE_KEY } from '@constants/app';
import { verifyTweet } from '@libs/request';
import { useVerifyTweet } from '@hooks/useVerifyTweet';
import { useAppDispatch } from '@store/hooks';
import { updateIsLoggedIn, updateTwitterFullProfile } from '@store/reducers/userSlice';
import { CopyBtn } from '@assets/svg';

export default function KOLPostLogin(props: { onVerify: () => void }) {
  const { onVerify } = props;
  const t = useTranslations('common');
  const dispatch = useAppDispatch();
  const [isPending, startTransition] = useTransition();
  const { data, isLoading, isValidating, error, mutate } = useVerifyTweet();

  const [link, setLink] = useState<string>('');

  const handleRefresh = () => {
    mutate();
  };

  const handleVerify = () => {
    startTransition(async () => {
      if (!link) {
        toast.error(t('placeholder_tweet_link'));
        return;
      }

      try {
        const res = await verifyTweet({ tweet_url: link });

        console.log('res', res);

        if (res.code !== 200 || !res?.data) {
          toast.error(t('verification_tweet_failed'));

          return;
        }

        const { token } = res.data;

        document.cookie = `${CACHE_KEY.KOL_TOKEN}=${token}; path=/;`;
        localStorage.setItem(CACHE_KEY.KOL_TOKEN, token);

        dispatch(updateIsLoggedIn(true));
        dispatch(updateTwitterFullProfile({ ...res.data }));

        onVerify();
      } catch (error) {
        console.error(error);

        toast.error(t('verification_tweet_failed'));
      }
    });
  };

  const handleChangeLink = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLink(e.target.value);
  };

  const handleCopyText = () => {
    try {
      navigator.clipboard.writeText(data?.text || '');
      toast.success(t('copy_success'));
      const tweetText = data?.text;
      const tweetUrl = `https://x.com/intent/post?text=${encodeURIComponent(tweetText)}`;
      window.open(tweetUrl, '_blank');
    } catch (error) {
      toast.error(t('copy_failed'));
    }
  };

  return (
    <div className="space-y-10">
      <dl>
        <dt className="text-md text-center font-semibold capitalize">{t('twitter_post_login')}</dt>
      </dl>
      <div className="space-y-5">
        <dl className="space-y-2">
          <dt className="flex items-center justify-between gap-x-2">
            <span className="text-sm">{t('post_tweet_instruction')}</span>
            <div className="flex items-center gap-x-2">
              {/* {data?.text && <Copy className="size-4 cursor-pointer" onClick={handleCopyText} />} */}
              {!isLoading && (
                <RefreshCw
                  className="text-muted-foreground size-4 cursor-pointer"
                  onClick={handleRefresh}
                />
              )}
              {isLoading && <LoaderCircle className="text-muted-foreground animate-spin" />}
            </div>
          </dt>
          {isLoading ? (
            <dd className="flex h-28 items-center justify-center">
              <LoaderCircle className="text-muted-foreground animate-spin" />
            </dd>
          ) : (
            <dd className="bg-muted-foreground/10 space-y-1 rounded-xl border-none px-3 py-2 shadow-none">
              <div>{data?.text}</div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  className="border-primary bg-primary hover:bg-primary/80 box-border h-6 rounded-full px-2 text-white hover:text-white"
                  onClick={handleCopyText}
                >
                  <CopyBtn className="size-4"></CopyBtn>
                  <span className="text-sm">{t('copy_btn')}</span>
                </Button>
              </div>
            </dd>
          )}
        </dl>
        <div className="space-y-2">
          <div className="text-sm">{t('submit_tweet_link')}</div>
          <div className="flex items-center gap-x-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder={t('placeholder_tweet_link')}
                onChange={handleChangeLink}
              />
            </div>
            <div className="w-max">
              <Button
                className="relative h-6 rounded-full"
                disabled={isPending || isLoading}
                onClick={handleVerify}
              >
                <span className="opacity-0">{t('btn_verify')}</span>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  {isPending ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    <span>{t('btn_verify')}</span>
                  )}
                </div>
              </Button>
            </div>
          </div>
        </div>
        <div className="hover:text-primary text-muted-foreground cursor-pointer text-sm underline">
          {t('tg_help')}
        </div>
      </div>
    </div>
  );
}
