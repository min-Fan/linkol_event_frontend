'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { LoaderCircle, PencilLine, Check, X, RefreshCw } from 'lucide-react';
import { Button } from '@shadcn-ui/button';
import { toast } from 'sonner';
import { useOrderPreview } from 'app/context/OrderPreviewContext';
import { IKolOrderDetail, OrderPreviewType } from 'app/@types/types';
import { Textarea } from '@shadcn/components/ui/textarea';
import { generatePostContent, sendPost } from '@libs/request';
import { useLocale, useTranslations } from 'next-intl';
import CountdownTimer from 'app/components/CountdownTimer';
import { Skeleton } from '@shadcn/components/ui/skeleton';
import PostContentTip from './post-content-tip';

export default function PostContent({ orderDetail }: { orderDetail: IKolOrderDetail }) {
  const t = useTranslations('common');
  const lang = useLocale();
  const { setStatus, setTweetId, setReload, isPost } = useOrderPreview();
  const [isLoading, setIsLoading] = useState(false);
  const [postLoading, setPostLoading] = useState<number | null>(null);
  const [time, setTime] = useState(0);
  const [posts, setPosts] = useState<any[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState<string[]>([]);
  const startTime = new Date(orderDetail.buy_agent_order.promotional_start_at || '').getTime() || 0;
  const endTime = new Date(orderDetail.buy_agent_order.promotional_end_at || '').getTime() || 0;
  const [isEnd, setIsEnd] = useState(startTime <= Date.now() && endTime >= Date.now());
  const initializedRef = useRef(false);
  const [tipsOpen, setTipsOpen] = useState(false);

  const getPosts = useCallback(async () => {
    try {
      if (!orderDetail.buy_agent_order.project?.id) return toast.error(t('project_not_found'));
      setIsLoading(true);
      setTime(0);
      setPosts([]);
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
      const res = await generatePostContent({
        order_item_id: orderDetail.id,
        promotional_materials: orderDetail.buy_agent_order.promotional_materials,
        agent_id: orderDetail.agent_id,
      });

      if (res.code === 200) {
        setPosts(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [
    orderDetail.buy_agent_order.project?.id,
    orderDetail.buy_agent_order.promotional_materials,
    orderDetail.agent_id,
  ]);

  useEffect(() => {
    if (!initializedRef.current) {
      getPosts();
      initializedRef.current = true;
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [getPosts]);

  const handlePostTweet = useCallback(
    async (post: any, index: number) => {
      try {
        setPostLoading(index);
        setReload(false);

        const res: any = await sendPost({
          order_item_id: orderDetail.id,
          contents: post.contents[lang],
          medias: post.media_urls || [],
        });

        if (res.code === 200) {
          toast.success(t('post_sent_successfully'));
          setPostLoading(null);
          setStatus(OrderPreviewType.POST_NONE);
          setReload(true);
          setTipsOpen(false);
        } else {
          setPostLoading(null);
          toast.error(res.msg || t('failed_to_end_post'));
        }
      } catch (error) {
        console.error(error);
        toast.error(t('failed_to_end_post'));
        setPostLoading(null);
      }
    },
    [orderDetail.id, setReload, setStatus, t]
  );

  const handleEdit = useCallback(
    (index: number) => {
      setEditingIndex(index);
      setEditedContent(posts[index].contents[lang]);
    },
    [posts]
  );

  const handleSave = useCallback(
    (index: number) => {
      const newPosts = [...posts];
      newPosts[index].contents[lang] = editedContent;
      setPosts(newPosts);
      setEditingIndex(null);
    },
    [posts, editedContent]
  );

  const handleCancel = useCallback(() => {
    setEditingIndex(null);
    setEditedContent([]);
  }, []);

  const itemChange = (value, index, itemIndex) => {
    const newContent = [...editedContent];
    newContent[itemIndex] = value;
    setEditedContent(newContent);
  };

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

  const content = useMemo(
    () => (
      <div className="flex h-full w-full flex-col gap-2">
        <div className="bg-background flex items-center space-x-2 rounded-md">
          {isLoading && <LoaderCircle className="h-2 w-2 animate-spin" />}
          <span className="text-sm">
            {isLoading ? `${t('cntent_is_being_edited')}... ` : `${t('content_is_ready')} `}

            {`(${t.rich('use_time', {
              time: (chunks) => time,
            })}s)`}
          </span>
          {!isLoading && (
            <RefreshCw
              className="hover:text-primary size-3 cursor-pointer"
              onClick={() => {
                initializedRef.current = false;
                getPosts();
              }}
            />
          )}
        </div>
        {isLoading ? (
          <div className="flex w-full flex-col items-center justify-center gap-1">
            <div className="flex w-full items-center justify-center gap-1">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <div className="flex w-full flex-col gap-2">
            {posts.map((post, index) => (
              <div className="flex w-full flex-col gap-1" key={index}>
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="border-border pr-2 text-xs font-bold">
                      {t('twitter_case')} {index + 1}
                    </span>

                    {isPost && (
                      <PostContentTip
                        onConfirm={() => handlePostTweet(post, index)}
                        post={post?.contents[lang] || []}
                        media_urls={posts[index].media_urls}
                        kol={orderDetail.kol}
                      >
                        <Button
                          className="box-border !h-auto !rounded-full p-0 !px-2 py-0.5 text-xs font-medium"
                          disabled={postLoading === index}
                          onClick={() => setTipsOpen(true)}
                        >
                          {postLoading === index ? (
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          <span className="text-xs">
                            {t('post_this_tweet')} {tipsOpen}
                          </span>
                        </Button>
                      </PostContentTip>
                    )}
                  </div>

                  {editingIndex === index ? (
                    <div className="ml-auto flex items-center gap-2">
                      <div
                        className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full hover:bg-green-100"
                        onClick={() => handleSave(index)}
                      >
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <div
                        className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full hover:bg-red-100"
                        onClick={handleCancel}
                      >
                        <X className="h-3 w-3 text-red-600" />
                      </div>
                    </div>
                  ) : (
                    <div
                      className="ml-auto flex h-6 w-6 cursor-pointer items-center justify-center rounded-full hover:bg-slate-100"
                      onClick={() => handleEdit(index)}
                    >
                      <PencilLine className="h-3 w-3" />
                    </div>
                  )}
                </div>
                <div className="box-border w-full space-y-2 rounded-md">
                  {editingIndex === index ? (
                    editedContent.map((editItem, index2) => {
                      return (
                        <div key={index2} className="bg-secondary box-border rounded-md p-2">
                          <Textarea
                            value={editItem}
                            onChange={(e) => itemChange(e.target.value, index, index2)}
                            className="!text-md min-h-[100px] w-full border-none p-0 shadow-none focus-visible:ring-0"
                            maxLength={280}
                            placeholder="Edit your content..."
                          />
                          <span className="text-sm">{editItem.length} / 280</span>
                        </div>
                      );
                    })
                  ) : (
                    // <>

                    //   <Textarea
                    //     value={editedContent}
                    //     onChange={(e) => setEditedContent(e.target.value)}
                    //     className="!text-md min-h-[100px] w-full border-none p-0 shadow-none focus-visible:ring-0"
                    //     maxLength={280}
                    //     placeholder="Edit your content..."
                    //   />
                    //   <span className="text-sm">{editedContent.length} / 280</span>
                    // </>
                    <div className="w-full space-y-2 text-sm">
                      {post?.contents[lang].map((item, sindex) => (
                        <div className="bg-secondary box-border rounded-md p-2" key={sindex}>
                          {item}
                        </div>
                      ))}
                      {post?.media_urls && renderImages(post?.media_urls)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    ),
    [
      isLoading,
      time,
      posts,
      editingIndex,
      editedContent,
      postLoading,
      isPost,
      t,
      handlePostTweet,
      handleEdit,
      handleSave,
      handleCancel,
      getPosts,
    ]
  );

  return content;
}
