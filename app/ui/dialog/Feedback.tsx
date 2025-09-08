'use client';

import { ReactNode, useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@shadcn-ui/dialog';
import { Input } from '@shadcn-ui/input';
import { Textarea } from '@shadcn-ui/textarea';
import { Button } from '@shadcn-ui/button';
import { ScrollArea } from '@shadcn-ui/scroll-area';

import { Chains, Categories, Topic, Languages } from '@assets/svg';
import { useAppSelector } from '@store/hooks';
import ComFeedbackCategory, { FeedbackCategoryType } from './components/FeedbackCategory';
import { getProblemCategory, submitFeedback } from '@libs/request';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import useUserInfo from '@hooks/useUserInfo';
export default function UIDialogFeedback(props: {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
  kolId: number;
}) {
  const { children, isOpen, onOpenChange, kolId } = props;
  const t = useTranslations('common');
  const chains = useAppSelector((state) => state.userReducer?.config.tags.chains);
  const categories = useAppSelector((state) => state.userReducer?.config.tags.categories);
  const topic = useAppSelector((state) => state.userReducer?.config.tags.topic);
  const languages = useAppSelector((state) => state.userReducer?.config.tags.languages);

  const [currentCategory, setCurrentCategory] = useState<FeedbackCategoryType>(
    FeedbackCategoryType.KOL_PRICING
  );
  const [problemCategory, setProblemCategory] = useState<any>([]);
  const [isLoadingProblemCategory, setIsLoadingProblemCategory] = useState<boolean>(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState<boolean>(false);
  const [feedbackContent, setFeedbackContent] = useState<string>('');
  const [feedbackEmail, setFeedbackEmail] = useState<string>('');
  const [feedbackPrice, setFeedbackPrice] = useState<string>('');
  const [feedbackScore, setFeedbackScore] = useState<string>('');
  const [feedbackTags, setFeedbackTags] = useState<number[]>([]);
  const [emailError, setEmailError] = useState<string>('');
  const [contentError, setContentError] = useState<string>('');
  const [priceError, setPriceError] = useState<string>('');
  const [scoreError, setScoreError] = useState<string>('');
  const [tagsError, setTagsError] = useState<string>('');
  const { isLogin } = useUserInfo();

  const resetForm = () => {
    setCurrentCategory(FeedbackCategoryType.KOL_PRICING);
    setFeedbackContent('');
    setFeedbackEmail('');
    setFeedbackPrice('');
    setFeedbackScore('');
    setFeedbackTags([]);
    setEmailError('');
    setContentError('');
    setPriceError('');
    setScoreError('');
    setTagsError('');
  };

  const resetCategoryData = () => {
    setFeedbackContent('');
    setFeedbackPrice('');
    setFeedbackScore('');
    setFeedbackTags([]);
    setContentError('');
    setPriceError('');
    setScoreError('');
    setTagsError('');
  };

  const handleCategoryChange = (category: FeedbackCategoryType) => {
    setCurrentCategory(category);
    resetCategoryData();
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
      getProblem();
    }
  }, [isOpen]);

  const CACHE_KEY = 'feedback_problem_category';
  const CACHE_EXPIRE_TIME = 24 * 60 * 60 * 1000; // 24小时缓存过期

  // 创建语言名称到ID的映射
  const languageIdMap = useMemo(() => {
    const map = new Map<string, number>();
    languages?.forEach((lang, index) => {
      map.set(lang.name, index + 1000); // 使用1000以上的数字作为语言ID
    });
    return map;
  }, [languages]);

  const getProblem = async () => {
    try {
      // 检查缓存
      const cachedData = sessionStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        // 检查缓存是否过期
        if (Date.now() - timestamp < CACHE_EXPIRE_TIME) {
          setProblemCategory(data);
          return;
        }
      }

      setIsLoadingProblemCategory(true);
      const res = await getProblemCategory();
      if (res.code === 200 && res.data.feedback_classes) {
        const data = res.data.feedback_classes;
        setProblemCategory(data);
        // 更新缓存
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data,
            timestamp: Date.now(),
          })
        );
      }
    } catch (error) {
      // 如果请求失败，尝试使用缓存数据
      const cachedData = sessionStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data } = JSON.parse(cachedData);
        setProblemCategory(data);
      } else {
        throw error;
      }
    } finally {
      setIsLoadingProblemCategory(false);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setFeedbackEmail(email);
    if (email && !validateEmail(email)) {
      setEmailError(t('invalid_email_format'));
    } else {
      setEmailError('');
    }
  };

  const toggleTag = (tagId: number) => {
    setFeedbackTags((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  const toggleLanguageTag = (langName: string) => {
    const langId = languageIdMap.get(langName);
    if (langId !== undefined) {
      toggleTag(langId);
    }
  };

  const validateForm = () => {
    let isValid = true;

    // 验证邮箱格式
    if (feedbackEmail && !validateEmail(feedbackEmail)) {
      setEmailError(t('invalid_email_format'));
      isValid = false;
    } else {
      setEmailError('');
    }

    // 根据不同类型验证必填字段
    switch (currentCategory) {
      case FeedbackCategoryType.KOL_PRICING:
        if (!feedbackPrice) {
          setPriceError(t('feedback_price_required'));
          isValid = false;
        } else {
          setPriceError('');
        }
        break;

      case FeedbackCategoryType.AI_SCORE:
        if (!feedbackScore) {
          setScoreError(t('feedback_score_required'));
          isValid = false;
        } else {
          setScoreError('');
        }
        break;

      case FeedbackCategoryType.KOL_TAGS:
        if (feedbackTags.length === 0) {
          setTagsError(t('feedback_tags_required'));
          isValid = false;
        } else {
          setTagsError('');
        }
        break;

      case FeedbackCategoryType.COMPLAINTS:
      case FeedbackCategoryType.KOL_COMPLAINTS:
      case FeedbackCategoryType.OPTIMIZATION_SUGGESTIONS:
        if (!feedbackContent.trim()) {
          setContentError(t('feedback_content_required'));
          isValid = false;
        } else {
          setContentError('');
        }
        break;
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!isLogin) {
      toast.error(t('error_login'));
      return;
    }
    if (!validateForm()) {
      toast.error(t('please_fill_required_fields'));
      return;
    }

    if (isLoadingProblemCategory || isLoadingSubmit) {
      return;
    }

    try {
      if (!kolId) return;
      setIsLoadingSubmit(true);
      const res = await submitFeedback({
        class_id: currentCategory,
        kol_id: kolId,
        tags: feedbackTags,
        content: feedbackContent,
        email: feedbackEmail,
        price: feedbackPrice ? Number(feedbackPrice) : undefined,
        score: feedbackScore ? Number(feedbackScore) : undefined,
      });
      if (res.code === 200) {
        toast.success(t('feedback_submit_success'));
        onOpenChange?.(false);
      }
    } catch (error) {
      toast.error(t('feedback_submit_failed'));
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="border-border w-md max-w-[90vw] rounded-3xl p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{t('feedback_title')}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-y-10 px-12 py-10">
          <h3 className="text-lg font-semibold capitalize">{t('feedback_title')}</h3>
          <div className="text-md space-y-10">
            {isLoadingProblemCategory ? (
              <div className="flex items-center justify-center">
                <Loader2 className="size-4 animate-spin" />
              </div>
            ) : (
              <ComFeedbackCategory
                currentCategory={currentCategory}
                onCategoryChange={handleCategoryChange}
                problemCategory={problemCategory}
              />
            )}
            {currentCategory === FeedbackCategoryType.KOL_PRICING && (
              <div className="space-y-1.5">
                <h4>{t('feedback_correction')}</h4>
                <div className="flex items-center justify-between gap-x-6">
                  <Input
                    className="w-full flex-1"
                    value={feedbackPrice}
                    onChange={(e) => setFeedbackPrice(e.target.value)}
                    type="number"
                    placeholder={t('feedback_correction_placeholder')}
                  />
                  <span>/tweet</span>
                </div>
                {priceError && <p className="text-destructive text-sm">{priceError}</p>}
              </div>
            )}
            {currentCategory === FeedbackCategoryType.AI_SCORE && (
              <div className="space-y-1.5">
                <h4>{t('feedback_ai_score_correction')}</h4>
                <Input
                  className="w-full"
                  type="text"
                  value={feedbackScore}
                  onChange={(e) => setFeedbackScore(e.target.value)}
                  placeholder={t('feedback_ai_score_correction_placeholder')}
                />
                {scoreError && <p className="text-destructive text-sm">{scoreError}</p>}
              </div>
            )}
            {currentCategory === FeedbackCategoryType.KOL_TAGS && (
              <div className="space-y-1.5">
                <h4>{t('feedback_select_preferred_tags')}</h4>
                <ScrollArea className="h-72 w-full">
                  <div className="space-y-3">
                    {chains && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-x-2 capitalize">
                          <Chains className="size-4" />
                          {t('chains')}:
                        </div>
                        <ul className="flex flex-wrap gap-2">
                          {chains.children.map((item) => (
                            <li
                              key={item.id}
                              className={`border-secondary cursor-pointer rounded-xl border px-3 py-1.5 ${
                                feedbackTags.includes(item.id)
                                  ? 'bg-primary text-primary-foreground'
                                  : ''
                              }`}
                              onClick={() => toggleTag(item.id)}
                            >
                              {item.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {categories && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-x-2 capitalize">
                          <Categories className="size-4" />
                          {t('categories')}:
                        </div>
                        <ul className="flex flex-wrap gap-2">
                          {categories.children.map((item) => (
                            <li
                              key={item.id}
                              className={`border-secondary cursor-pointer rounded-xl border px-3 py-1.5 ${
                                feedbackTags.includes(item.id)
                                  ? 'bg-primary text-primary-foreground'
                                  : ''
                              }`}
                              onClick={() => toggleTag(item.id)}
                            >
                              {item.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {topic && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-x-2 capitalize">
                          <Topic className="size-4" />
                          {t('topic')}:
                        </div>
                        <ul className="flex flex-wrap gap-2">
                          {topic.children.map((item) => (
                            <li
                              key={item.id}
                              className={`border-secondary cursor-pointer rounded-xl border px-3 py-1.5 ${
                                feedbackTags.includes(item.id)
                                  ? 'bg-primary text-primary-foreground'
                                  : ''
                              }`}
                              onClick={() => toggleTag(item.id)}
                            >
                              {item.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {languages && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-x-2 capitalize">
                          <Languages className="size-4" />
                          {t('languages')}:
                        </div>
                        <ul className="flex flex-wrap gap-2">
                          {languages.map((item) => (
                            <li
                              key={item.name}
                              className={`border-secondary cursor-pointer rounded-xl border px-3 py-1.5 ${
                                feedbackTags.includes(languageIdMap.get(item.name) || -1)
                                  ? 'bg-primary text-primary-foreground'
                                  : ''
                              }`}
                              onClick={() => toggleLanguageTag(item.name)}
                            >
                              {item.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                {tagsError && <p className="text-destructive text-sm">{tagsError}</p>}
              </div>
            )}
            {currentCategory === FeedbackCategoryType.COMPLAINTS && (
              <div className="space-y-1.5">
                <h4>{t('feedback_specify_details')}</h4>
                <Textarea
                  className="w-full"
                  placeholder={t('feedback_specify_details_placeholder')}
                  value={feedbackContent}
                  onChange={(e) => setFeedbackContent(e.target.value)}
                />
                {contentError && <p className="text-destructive text-sm">{contentError}</p>}
              </div>
            )}
            {currentCategory === FeedbackCategoryType.KOL_COMPLAINTS && (
              <div className="space-y-1.5">
                <h4>{t('feedback_specify_details')}</h4>
                <Textarea
                  className="w-full"
                  placeholder={t('feedback_specify_details_placeholder')}
                  value={feedbackContent}
                  onChange={(e) => setFeedbackContent(e.target.value)}
                />
                {contentError && <p className="text-destructive text-sm">{contentError}</p>}
              </div>
            )}
            {currentCategory === FeedbackCategoryType.OPTIMIZATION_SUGGESTIONS && (
              <div className="space-y-1.5">
                <h4>{t('feedback_specify_details')}</h4>
                <Textarea
                  className="w-full"
                  placeholder={t('feedback_specify_details_placeholder')}
                  value={feedbackContent}
                  onChange={(e) => setFeedbackContent(e.target.value)}
                />
                {contentError && <p className="text-destructive text-sm">{contentError}</p>}
              </div>
            )}
            <div className="space-y-1.5">
              <h4>{t('feedback_contact_email')}</h4>
              <Input
                type="email"
                placeholder={t('feedback_contact_email_placeholder')}
                value={feedbackEmail}
                onChange={handleEmailChange}
              />
              {emailError && <p className="text-destructive text-sm">{emailError}</p>}
            </div>
            <div className="flex items-center justify-center gap-x-3">
              <Button variant="outline" onClick={() => onOpenChange?.(false)}>
                {t('btn_cancel')}
              </Button>
              <Button disabled={isLoadingProblemCategory || isLoadingSubmit} onClick={handleSubmit}>
                {isLoadingSubmit ? <Loader2 className="size-4 animate-spin" /> : t('btn_submit')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
