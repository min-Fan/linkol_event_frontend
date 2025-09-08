'use client';
import React, { useEffect, useState, useRef } from 'react';
import { IKolOrderDetail } from 'app/@types/types';
import { useParams } from 'next/navigation';
import { Button } from '@shadcn-ui/button';
import { useOrderPreview } from 'app/context/OrderPreviewContext';
import { checkPostRelevance, getPostDetail, uploadSelfPostLink } from '@libs/request';
import { useTranslations } from 'next-intl';
import {
  Bookmark,
  ChartNoAxesColumn,
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  LoaderCircle,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
export default function PostView({ orderDetail }: { orderDetail: IKolOrderDetail }) {
  const t = useTranslations('common');
  const { tweetId, isVerified, setIsVerified, tweetUrl, setReload, setTweetId, setTweetUrl } =
    useOrderPreview();
  const [isLoading, setIsLoading] = useState(false);
  const [time, setTime] = useState(0);
  const [post, setPost] = useState<any>(null);
  const { orderId } = useParams();
  const [text, setText] = useState<string>(t('please_verify_the_post'));
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const getPost = async () => {
    try {
      const res: any = await getPostDetail({ order_item_id: orderDetail.id, tweet_urls: tweetUrl });
      if (res.code === 200) {
        if (res.data.text) {
          setPost(res.data);
          setText('');
          return res.data;
        }
      } else {
        setText(res.msg || t('failed_to_get_post_details'));
        setIsVerified(false);
        return null;
      }
    } catch (error) {
      setIsVerified(false);
      setText(t('failed_to_get_post_details'));
      console.error(error);
      return null;
    }
  };

  const verifyTweet = async () => {
    if (!tweetId) {
      setText(t('no_tweet_id_provided'));
      return;
    }

    try {
      setReload(false);
      setIsLoading(true);
      setTime(0);
      setText(t('verifying_post'));

      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);

      const postResult = await getPost();

      // 如果没有获取到推文内容，提前结束
      if (!postResult) {
        clearTimer();
        setIsLoading(false);
        return;
      }

      const res: any = await checkPostRelevance({
        tweet: postResult.text,
        order_item_id: orderId,
      });

      clearTimer();
      setIsLoading(false);

      if (res.code === 200) {
        if (res.data.is_pass) {
          setIsVerified(true);
          uploadTweet(true);
        } else {
          setIsVerified(false);
          setText(res.data.reason || t('verification_content_failed'));
        }
      } else {
        setIsVerified(false);
        setText(res.msg || t('verification_api_failed'));
      }
    } catch (error) {
      setIsVerified(false);
      setIsLoading(false);
      setText(t('error_during_verification'));
      clearTimer();
      console.error(error);
    }
  };

  const uploadTweet = async (isverified: boolean) => {
    try {
      if (!tweetId) {
        toast.error(t('please_enter_a_valid_tweet_URL_first'));
        return;
      }

      if (!isverified) {
        toast.error(t('please_post_verification'));
        return;
      }

      setIsUploading(true);
      const res: any = await uploadSelfPostLink({
        tweet_url: tweetUrl,
        order_item_id: orderId,
      });
      setIsUploading(false);

      if (res.code === 200) {
        toast.success(t('tweet_uploaded_successfully'));
        setReload(true);
        setTweetUrl('');
        setTweetId('');
      } else {
        toast.error(res.msg || t('failed_to_upload_tweet'));
      }
    } catch (error) {
      console.error(error);
      setIsUploading(false);
      toast.error(t('an_error_occurred_during_upload'));
    }
  };

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  useEffect(() => {
    if (tweetId) {
      verifyTweet();
    }
  }, [tweetId]);
  const renderImages = (medias) => {
    if (medias.length === 1) {
      return (
        <div className="mt-2">
          <img src={medias[0]} className="w-full rounded-xl object-cover" />
        </div>
      );
    }
    if (medias.length === 2) {
      return (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {medias.map((item, i) => (
            <img key={i} src={item} className="h-40 w-full rounded-xl object-cover" />
          ))}
        </div>
      );
    }
    if (medias.length === 3) {
      return (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <img src={medias[0]} className="col-span-2 h-40 w-full rounded-xl object-cover" />
          {medias.slice(1).map((item, i) => (
            <img key={i} src={item} className="h-40 w-full rounded-xl object-cover" />
          ))}
        </div>
      );
    }
    if (medias.length >= 4) {
      return (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {medias.slice(0, 4).map((item, i) => (
            <img key={i} src={item} className="h-40 w-full rounded-xl object-cover" />
          ))}
        </div>
      );
    }
    return null;
  };
  return (
    <div className="flex h-full w-full flex-col gap-2">
      <div className="flex items-center justify-between rounded-md px-2 py-2">
        <div className="flex items-center space-x-1">
          {isLoading && <LoaderCircle className="h-4 w-4 animate-spin" />}
          <span className="text-md">
            {isLoading ? `${t('verifying')}... ` : text ? `${text} ` : `${t('verified')} `}
            {`(${t.rich('use_time', {
              time: (chunks) => time,
            })}s)`}
          </span>
        </div>

        {/* 添加重新验证按钮 */}
        {!isLoading && tweetId && !isVerified && (
          <Button
            variant="outline"
            size="sm"
            onClick={verifyTweet}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            <span>{t('btn_retry')}</span>
          </Button>
        )}
      </div>

      {isVerified && post && (
        <div className="text-md flex flex-col gap-2 rounded-md">
          <div className="flex w-full items-center gap-2">
            <div className="h-6 w-6 overflow-hidden rounded-full">
              <img
                src={orderDetail.kol.profile_image_url}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-0">
              <span className="text-sm font-bold">{orderDetail.kol.name}</span>
              <span className="text-muted-foreground text-xs">@{orderDetail.kol.username}</span>
            </div>
          </div>
          <div className="w-full">
            <p>{post.text}</p>
            {post.medias && renderImages(post.medias)}
          </div>
          <div className="bg-secondary text-muted-foreground box-border flex items-center justify-between p-2">
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>0</span>
            </div>
            <div className="flex items-center space-x-1">
              <Repeat2 className="h-4 w-4" />
              <span>0</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="relative z-10 h-4 w-4" />
              <span>0</span>
            </div>
            <div className="relative flex items-center space-x-1">
              <ChartNoAxesColumn className="relative z-10 h-4 w-4" />
              <span>0</span>
            </div>
            <div className="flex items-center space-x-2">
              <Bookmark className="h-4 w-4" />
              <Share className="h-4 w-4" />
            </div>
          </div>
        </div>
      )}

      {/* 当验证失败时显示失败原因和建议 */}
      {!isVerified && !isLoading && tweetId && text.includes('failed') && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="mb-1 font-semibold">{t('verification_failed')}</p>
          <p>{text}</p>
          <p className="mt-2">{t('tips_make_project')}</p>
        </div>
      )}
    </div>
  );
}
