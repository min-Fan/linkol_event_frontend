import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from '@shadcn/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from '@shadcn/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shadcn/components/ui/dropdown-menu';
import { Loader2, AlertCircle, Edit, ChevronDown, Check } from 'lucide-react';
import { Fail, Success, MoneyBag, Magic } from '@assets/svg';
import { useParams } from 'next/navigation';
import { Input } from '@shadcn/components/ui/input';
import { Textarea } from '@shadcn/components/ui/textarea';
import {
  IEventInfoResponseData,
  postTweetLink,
  postTweetLinkOffline,
  getAiChatTweet,
  sendActivityTweet,
  sendActivityTweetPlatform,
  getPrice,
  uploadImage,
  LanguageCode,
} from '@libs/request';
import { toast } from 'sonner';
import { useLocale, useTranslations } from 'next-intl';
import Loader from '@ui/loading/loader';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { updateRedemptionCode } from '@store/reducers/userSlice';
import { useAccount, useSwitchChain } from 'wagmi';
import { cn } from '@shadcn/lib/utils';
import useUserInfo from '@hooks/useUserInfo';
import useUserActivityReward from '@hooks/useUserActivityReward';
import { DEFAULT_CHAIN } from '@constants/chains';
import avatar from '@assets/image/avatar.png';
import placeholderImage from '@assets/image/banner-loading.png';
import DialogImagePreview from './DialogImagePreview';
import DownloadCard from '../canvasToImg/DownloadCard';
import html2canvas from 'html2canvas';

// 图片生成模板配置
interface ImageTemplateConfig {
  component: React.ComponentType<any>;
  dataFetcher?: () => Promise<any>;
  props?: any;
  fileName?: string;
}

// 根据不同的事件类型返回对应的模板配置
const getImageTemplateConfig = (
  eventTitle: string,
  twitterFullProfile: any
): ImageTemplateConfig | null => {
  switch (eventTitle) {
    case 'Tweet Value Checker':
      return {
        component: DownloadCard,
        dataFetcher: async () => {
          if (!twitterFullProfile?.screen_name) return null;
          try {
            const res: any = await getPrice({ screen_name: twitterFullProfile.screen_name });
            return res.code === 200 ? res.data : null;
          } catch (error) {
            console.error('Failed to get price data:', error);
            return null;
          }
        },
        fileName: 'tweet-value-card',
      };
    // 未来可以添加更多模板
    // case 'KOL Analysis Report':
    //   return {
    //     component: KOLAnalysisCard,
    //     dataFetcher: async () => {
    //       const res = await fetchKOLAnalysisData(twitterFullProfile.screen_name);
    //       return res.code === 200 ? res.data : null;
    //     },
    //     fileName: 'kol-analysis-report',
    //     props: { theme: 'dark', showChart: true }
    //   };
    // case 'Campaign Statistics':
    //   return {
    //     component: CampaignStatsCard,
    //     dataFetcher: async () => {
    //       const res = await fetchCampaignStats(eventId);
    //       return res.code === 200 ? res.data : null;
    //     },
    //     fileName: 'campaign-stats',
    //     props: { format: 'detailed' }
    //   };
    // case 'Market Trend':
    //   return {
    //     component: MarketTrendCard,
    //     dataFetcher: async () => {
    //       const res = await fetchMarketTrend();
    //       return res.code === 200 ? res.data : null;
    //     },
    //     fileName: 'market-trend-analysis'
    //   };
    default:
      return null;
  }
};

interface DialogInvireProps {
  isOpen: boolean;
  onClose: () => void;
  eventInfo: IEventInfoResponseData;
  onRefresh?: () => Promise<void>;
}

export default function DialogPostTweetLink({
  isOpen,
  onClose,
  eventInfo,
  onRefresh,
}: DialogInvireProps) {
  const t = useTranslations('common');
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [rewardAmount, setRewardAmount] = useState<number | null>(null);
  const [templateData, setTemplateData] = useState<any>(null);
  const [imageTemplate, setImageTemplate] = useState<ImageTemplateConfig | null>(null);
  const [isWrongChain, setIsWrongChain] = useState(false);
  const { eventId } = useParams();

  // 新增状态
  const [isGenerateMode, setIsGenerateMode] = useState(true); // true: 生成推文模式, false: 提交链接模式
  const [tweetContent, setTweetContent] = useState('');
  const [isGeneratingTweet, setIsGeneratingTweet] = useState(false);
  const [isEditingTweet, setIsEditingTweet] = useState(false);
  const [originalTweetContent, setOriginalTweetContent] = useState('');
  const [tweetMedias, setTweetMedias] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [tweetContentError, setTweetContentError] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [pendingImageGeneration, setPendingImageGeneration] = useState(false);
  const [isLoadingTemplateData, setIsLoadingTemplateData] = useState(false);
  const [hasAutoGenerated, setHasAutoGenerated] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(LanguageCode.English); // 语言选择状态
  const [kolScreenNames, setKolScreenNames] = useState<string[]>([]); // 存储从推文接口获取的KOL名称数组
  const downloadCardRef = useRef<HTMLDivElement>(null);
  const payTokenInfo = useAppSelector((state) => state.userReducer?.pay_token_info);

  // 原有状态
  const [tweetUrl, setTweetUrl] = useState('');
  const [email, setEmail] = useState('');
  const [eventCode, setEventCode] = useState('');
  const [errors, setErrors] = useState<{ tweetUrl?: string; email?: string; eventCode?: string }>(
    {}
  );
  const [emailError, setEmailError] = useState('');

  const twitterFullProfile = useAppSelector((state) => state.userReducer?.twitter_full_profile);
  const redemptionCode = useAppSelector((state) => state.userReducer?.redemptionCode || '');
  const { isLogin } = useUserInfo();
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const locale = useLocale();

  // 根据客户端locale设置默认语言
  const getDefaultLanguage = (): LanguageCode => {
    switch (locale) {
      case 'zh':
        return LanguageCode.Chinese;
      case 'ko':
        return LanguageCode.Korean;
      case 'en':
      default:
        return LanguageCode.English;
    }
  };

  // 使用用户活动奖励hook来获取和更新奖励数据
  const { refetch: refetchUserActivityReward } = useUserActivityReward({
    eventId: eventId as string,
    enabled: !!eventId && isOpen,
  });

  // 根据locale设置默认语言
  useEffect(() => {
    setSelectedLanguage(getDefaultLanguage());
  }, [locale]);

  // 初始化图片模板配置
  useEffect(() => {
    if (eventInfo?.title) {
      const templateConfig = getImageTemplateConfig(eventInfo.title, twitterFullProfile);
      setImageTemplate(templateConfig);
    }
  }, [eventInfo?.title, twitterFullProfile]);

  // 弹窗打开时提前获取模板数据
  useEffect(() => {
    if (isOpen && imageTemplate && !templateData && kolScreenNames.length > 0) {
      fetchTemplateData();
    }
  }, [isOpen, imageTemplate, templateData, kolScreenNames]);

  // 获取模板数据 - 支持多个KOL
  const fetchTemplateData = async () => {
    if (!imageTemplate?.dataFetcher || kolScreenNames.length === 0) return null;

    setIsLoadingTemplateData(true);
    try {
      // 并发请求所有KOL的价格数据
      const pricePromises = kolScreenNames.map((screenName) =>
        getPrice({ screen_name: screenName }).catch((error) => {
          console.error(`Failed to get price for ${screenName}:`, error);
          return null; // 返回null表示请求失败
        })
      );

      const priceResults = await Promise.all(pricePromises);

      // 过滤掉失败的请求，只保留成功的数据
      const validData = priceResults
        .filter(
          (result): result is { code: number; data: any; message: string } =>
            result !== null && result.code === 200
        )
        .map((result) => result.data);

      setTemplateData(validData);
      return validData;
    } catch (error) {
      console.error('Failed to fetch template data:', error);
      return null;
    } finally {
      setIsLoadingTemplateData(false);
    }
  };

  // 当模板数据准备好且有待生成的图片时，自动生成图片
  useEffect(() => {
    if (templateData && pendingImageGeneration && !isGeneratingImage) {
      const generateImage = async () => {
        // 立即重置pendingImageGeneration以防止重复调用
        setPendingImageGeneration(false);

        // 等待一小段时间确保DOM已经更新
        await new Promise((resolve) => setTimeout(resolve, 50));

        const imageUrls = await generateAndUploadImages();
        if (imageUrls.length > 0) {
          // 更新推文媒体
          setTweetMedias(imageUrls);
          setIsGeneratingImage(false);
        }
      };

      generateImage();
    }
  }, [templateData, pendingImageGeneration, isGeneratingImage]);

  // 检查当前链是否为默认链
  useEffect(() => {
    if (chainId && DEFAULT_CHAIN.id !== chainId) {
      setIsWrongChain(true);
    } else {
      setIsWrongChain(false);
    }
  }, [chainId]);

  // 弹窗打开时自动生成推文（只执行一次）
  useEffect(() => {
    if (isOpen && isGenerateMode && eventId && !hasAutoGenerated) {
      setHasAutoGenerated(true);
      handleGenerateTweet();
    }
  }, [isOpen, isGenerateMode, eventId, hasAutoGenerated]);

  // 当弹窗打开且有 redemptionCode 时，自动赋值给 eventCode
  useEffect(() => {
    if (isOpen && redemptionCode && !eventCode) {
      setEventCode(redemptionCode);
    }
  }, [isOpen, redemptionCode]);

  // 邮箱验证函数
  const validateEmail = (email: string): boolean => {
    if (!email.trim()) return false;

    // 更严格的邮箱验证正则表达式
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email.trim());
  };

  // 处理邮箱输入变化
  const handleEmailChange = (value: string) => {
    setEmail(value);

    // 实时验证邮箱格式
    if (value.trim() && !validateEmail(value)) {
      setEmailError(t('invalid_email_format'));
    } else {
      setEmailError('');
    }
  };

  // 切换到默认链
  const handleSwitchChain = async () => {
    try {
      await switchChain({ chainId: DEFAULT_CHAIN.id });
    } catch (error) {
      console.error('switch chain failed:', error);
      toast.error(t('switch_chain_failed'));
    }
  };

  // 通用图片生成和上传函数 - 支持多张图片并发处理
  const generateAndUploadImages = async () => {
    if (!imageTemplate || !templateData || templateData.length === 0) {
      return [];
    }

    // 防止重复调用
    if (isGeneratingImage) {
      return [];
    }

    try {
      setIsGeneratingImage(true);

      // 等待一小段时间确保DOM更新
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 并发生成所有图片的canvas
      const canvasPromises = templateData.map(async (data, i) => {
        try {
          // 查找对应的模板组件ref
          const templateRef = document.querySelector(`[data-template-index="${i}"]`) as HTMLElement;
          if (!templateRef) {
            console.warn(`Template ref not found for index ${i}`);
            return null;
          }

          // 使用html2canvas将组件转换为canvas
          const canvas = await html2canvas(templateRef, {
            backgroundColor: null,
            scale: 2,
            useCORS: true,
            allowTaint: true,
          });

          return { canvas, index: i };
        } catch (error) {
          console.error(`Failed to generate canvas for index ${i}:`, error);
          return null;
        }
      });

      // 等待所有canvas生成完成
      const canvasResults = await Promise.all(canvasPromises);
      const validCanvasResults = canvasResults.filter((result) => result !== null);

      if (validCanvasResults.length === 0) {
        return [];
      }

      // 并发上传所有图片
      const uploadPromises = validCanvasResults.map(async ({ canvas, index }) => {
        try {
          // 将canvas转换为blob并上传
          const imageUrl = await new Promise<string | null>((resolve) => {
            canvas.toBlob(
              async (blob) => {
                if (!blob) {
                  resolve(null);
                  return;
                }

                try {
                  // 使用模板配置中的文件名，如果没有则使用默认名称
                  const fileName = imageTemplate.fileName || 'generated-image';
                  const file = new File([blob], `${fileName}-${index}.png`, { type: 'image/png' });
                  console.log(
                    `prepare to upload ${fileName}-${index}, file size:`,
                    file.size / 1024 / 1024,
                    'MB'
                  );

                  // 上传图片
                  const response: any = await uploadImage({ file });

                  if (response.code === 200) {
                    console.log(`image upload success for ${index}:`, response.data.url);
                    resolve(response.data.url);
                  } else {
                    console.error(`image upload failed for ${index}:`, response.msg);
                    resolve(null);
                  }
                } catch (error) {
                  console.error(`Failed to upload generated image for ${index}:`, error);
                  resolve(null);
                }
              },
              'image/png',
              0.9
            );
          });

          return imageUrl;
        } catch (error) {
          console.error(`Failed to process image for index ${index}:`, error);
          return null;
        }
      });

      // 等待所有上传完成
      const uploadResults = await Promise.all(uploadPromises);

      // 过滤掉失败的上传，只保留成功的URL
      const uploadedUrls = uploadResults.filter((url): url is string => url !== null);

      return uploadedUrls;
    } catch (error) {
      console.error('Failed to generate images:', error);
      return [];
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 生成推文
  const handleGenerateTweet = async () => {
    if (!eventId) return;

    try {
      setIsGeneratingTweet(true);
      const res: any = await getAiChatTweet(eventId as string, selectedLanguage);

      if (res.code === 200 && res.data?.data?.content) {
        const generatedContent = res.data.data.content;
        const generatedMedias = res.data.data.medias || [];

        // 提取 kol_screen_name 字段，支持字符串或数组格式
        const kolScreenName = res.data?.data?.kol_screen_name;
        let kolNames: string[] = [];

        if (kolScreenName) {
          if (Array.isArray(kolScreenName)) {
            kolNames = kolScreenName;
          } else if (typeof kolScreenName === 'string') {
            kolNames = [kolScreenName];
          }
        }

        // 添加当前用户的 screen_name 到数组开头（如果存在且不在数组中）
        if (twitterFullProfile?.screen_name && !kolNames.includes(twitterFullProfile.screen_name)) {
          kolNames.unshift(twitterFullProfile.screen_name);
        }

        setKolScreenNames(kolNames);

        // 如果有图片模板配置，则生成自定义图片
        if (imageTemplate) {
          // 标记待生成图片（useEffect会监听并自动生成）
          setPendingImageGeneration(true);
        }

        setTweetContent(generatedContent);
        setOriginalTweetContent(generatedContent);
        setTweetMedias(generatedMedias);
        setIsEditingTweet(false);
        // toast.success(t('tweet_generated_successfully'));
      }
    } catch (error) {
      console.error('Failed to generate tweet:', error);
      toast.error(t('failed_to_generate_tweet'));
    } finally {
      setIsGeneratingTweet(false);
    }
  };

  // 编辑推文
  const handleEditTweet = () => {
    setIsEditingTweet(true);
  };

  // 保存编辑
  const handleSaveEdit = () => {
    setIsEditingTweet(false);
    setOriginalTweetContent(tweetContent);
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setTweetContent(originalTweetContent);
    setIsEditingTweet(false);
  };

  // 处理图片点击
  const handleImageClick = (imageUrl: string, index: number) => {
    setSelectedImage(imageUrl);
    setSelectedImageIndex(index);
  };

  // 验证推文内容长度
  const validateTweetContent = (content: string) => {
    if (!content.trim()) {
      setTweetContentError(t('tweet_content_required'));
      toast.error(t('tweet_content_required'));
      return false;
    }

    // 检测是否包含中文字符
    const hasChinese = /[\u4e00-\u9fa5]/.test(content);

    if (hasChinese) {
      // 中文字符不能超过160
      if (content.length > 160) {
        setTweetContentError(
          t('tweet_content_too_long_chinese', { max: 160, current: content.length })
        );
        toast.error(t('tweet_content_too_long_chinese', { max: 160, current: content.length }));
        return false;
      }
    } else {
      // 英文字符不能超过280
      if (content.length > 280) {
        setTweetContentError(
          t('tweet_content_too_long_english', { max: 280, current: content.length })
        );
        return false;
      }
    }

    setTweetContentError('');
    return true;
  };

  // 处理推文内容变化
  const handleTweetContentChange = (content: string) => {
    setTweetContent(content);
    validateTweetContent(content);
  };

  // 发送推文
  const handlePostTweet = async () => {
    // if (!address || !tweetContent.trim()) {
    //   toast.error(t('please_connect_wallet') || 'Please connect wallet');
    //   return;
    // }

    // 验证推文内容长度
    if (!validateTweetContent(tweetContent)) {
      return;
    }

    // 如果是platform类型，验证邮箱和邀请码
    if (eventInfo?.a_type === 'platform') {
      if (!email.trim()) {
        toast.error(t('error_email_required'));
        setErrors({ email: t('error_email_required') });
        return;
      }

      // 验证邮箱格式
      if (!validateEmail(email)) {
        toast.error(t('invalid_email_format'));
        setErrors({ email: t('invalid_email_format') });
        return;
      }

      // 验证 eventCode
      if (!eventCode.trim()) {
        toast.error(t('event_code_required'));
        setErrors({ eventCode: t('event_code_required') });
        return;
      }
    }

    try {
      setIsLoading(true);

      let res: any;

      if (eventInfo?.a_type === 'platform') {
        // 如果是 platform 类型，调用 sendActivityTweetPlatform 接口
        res = await sendActivityTweetPlatform({
          active_id: eventId as string,
          content: tweetContent.trim(),
          invite_code: redemptionCode || eventCode.trim(), // 优先使用传入的兑换码
          language: 'en', // 可以根据需要调整
          medias: tweetMedias, // 使用AI生成的媒体文件
        });
      } else {
        // 如果不是 platform 类型，调用 sendActivityTweet 接口
        res = await sendActivityTweet({
          active_id: eventId as string,
          content: tweetContent.trim(),
          language: 'en', // 可以根据需要调整
          medias: tweetMedias, // 使用AI生成的媒体文件
        });
      }

      if (res.code === 200) {
        setIsLoading(false);
        setIsSuccess(true);

        // 如果是platform类型且有奖励金额，保存奖励金额
        if (eventInfo?.a_type === 'platform' && res.data?.reward) {
          setRewardAmount(res.data.reward);
        }

        // 发推文成功后更新用户活动奖励数据
        refetchUserActivityReward();

        onRefresh?.();
        toast.success(t('tweet_posted_successfully'));
      } else {
        setIsLoading(false);
        setIsFailed(true);
        toast.error(res.message || t('failed_to_post_tweet'));
      }
    } catch (err: any) {
      setIsLoading(false);
      setIsFailed(true);
      toast.error(err.response?.data?.msg || t('failed_to_post_tweet'));
      console.error('Failed to post tweet:', err);
    }
  };

  // 提交推文链接
  const handleSubmitTweetLink = async () => {
    // 清除之前的错误
    setErrors({});

    // 验证表单
    if (!validateForm()) {
      toast.error(errors.tweetUrl || errors.email || errors.eventCode);
      return;
    }

    try {
      setIsLoading(true);

      let res: any;

      if (eventInfo?.a_type === 'platform') {
        // 如果是 platform 类型，调用 postTweetLinkOffline 接口
        res = await postTweetLinkOffline({
          active_id: eventId as string,
          tweet_url: tweetUrl.trim(),
          email: email.trim(),
          code: eventCode.trim(), // 优先使用传入的兑换码
        });
      } else {
        // 如果不是 platform 类型，调用 postTweetLink 接口
        res = await postTweetLink({
          active_id: eventId as string,
          tweet_url: tweetUrl.trim(),
        });
      }

      if (res.code === 200) {
        setIsLoading(false);
        setIsSuccess(true);

        // 如果是platform类型且有奖励金额，保存奖励金额
        if (eventInfo?.a_type === 'platform' && res.data?.reward) {
          setRewardAmount(res.data.reward);
        }

        // 提交推文链接成功后更新用户活动奖励数据
        refetchUserActivityReward();

        onRefresh?.();
        toast.success(t('task_verified'));
      } else {
        setIsLoading(false);
        setIsFailed(true);
        toast.error(res.message);
      }
    } catch (err: any) {
      setIsLoading(false);
      setIsFailed(true);
      toast.error(err.response?.data?.msg || t('failed_to_submit_tweet_link'));
      console.error('Failed to submit tweet link:', err.response?.data?.msg);
    }
  };

  const validateForm = () => {
    const newErrors: { tweetUrl?: string; email?: string; eventCode?: string } = {};

    // 验证 tweetUrl 必填
    if (!tweetUrl.trim()) {
      newErrors.tweetUrl = t('tweet_url_required');
    }

    // 只在 platform 类型时验证 email 和 eventCode
    if (eventInfo?.a_type === 'platform') {
      // 验证 email 必填
      if (!email.trim()) {
        newErrors.email = t('error_email_required');
      } else if (!validateEmail(email)) {
        // 使用新的邮箱验证函数
        newErrors.email = t('invalid_email_format');
      }

      // 验证 eventCode
      if (!eventCode.trim()) {
        newErrors.eventCode = t('event_code_required');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = useCallback(() => {
    setIsSuccess(false);
    setIsFailed(false);
    setIsGenerateMode(true);
    setTweetContent('');
    setOriginalTweetContent('');
    setIsEditingTweet(false);
    setTweetMedias([]);
    setSelectedImage(null);
    setSelectedImageIndex(0);
    setTweetUrl('');
    setEmail('');
    setEventCode('');
    setErrors({});
    setTweetContentError('');
    setEmailError('');
    setRewardAmount(null);
    setIsGeneratingImage(false);
    setTemplateData(null);
    setPendingImageGeneration(false);
    setIsLoadingTemplateData(false);
    setHasAutoGenerated(false);
    setSelectedLanguage(getDefaultLanguage()); // 重置语言选择
    setKolScreenNames([]); // 重置KOL名称数组
    onClose();
  }, [onClose]);

  const handleTryAgain = () => {
    setIsFailed(false);
    setErrors({});
    setTweetUrl('');
    setEmail('');
    setEventCode('');
    setEmailError('');
    setRewardAmount(null);
    setIsGeneratingImage(false);
    setTemplateData(null);
    setPendingImageGeneration(false);
    setIsLoadingTemplateData(false);
    setHasAutoGenerated(false);
    setSelectedLanguage(getDefaultLanguage()); // 重置语言选择
    setKolScreenNames([]); // 重置KOL名称数组
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogClose asChild></DialogClose>
      <DialogContent
        className="border-border flex max-h-[90vh] w-96 max-w-full flex-col gap-0 overflow-hidden bg-transparent p-2 shadow-none sm:w-96 sm:max-w-full sm:p-0"
        nonClosable
      >
        {/* Header */}
        <DialogHeader className="bg-primary gap-0 rounded-t-xl p-2 text-center text-white sm:rounded-t-2xl sm:p-4">
          <DialogTitle className="text-center text-base font-semibold text-white">
            {isGenerateMode ? t('post_tweet_for_task') : t('submit_tweet_for_task')}
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="bg-background space-y-4 overflow-y-auto rounded-b-xl p-6 sm:rounded-b-2xl">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader />
              <div className="text-center">
                <p className="text-sm">{t('loading')}</p>
              </div>
            </div>
          ) : isSuccess ? (
            // 成功弹窗
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full">
                <Success className="h-full w-full text-white" />
              </div>
              <div className="text-center">
                <p className="text-md">
                  {eventInfo?.a_type === 'platform' && rewardAmount !== null
                    ? t('task_verified_with_reward')
                    : t('task_verified')}
                </p>
                {/* 如果是platform类型且有奖励金额，显示奖励信息 */}
                {eventInfo?.a_type === 'platform' && rewardAmount !== null && (
                  <div className="mt-3 flex items-center justify-center space-x-2">
                    <MoneyBag className="h-5 w-5 text-yellow-500" />
                    <span className="text-lg font-semibold text-green-600">
                      +{rewardAmount} {payTokenInfo?.symbol || 'USDC'}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex w-40">
                <Button
                  onClick={handleClose}
                  variant="secondary"
                  className="!h-auto flex-1 !rounded-lg"
                >
                  {t('done')}
                </Button>
              </div>
            </div>
          ) : isFailed ? (
            // 失败弹窗
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full">
                <Fail className="h-full w-full text-white" />
              </div>
              <div className="text-center">
                <p className="text-md">{t('verification_failed')}</p>
              </div>
              <div className="flex w-full gap-3">
                <Button
                  variant="secondary"
                  onClick={handleClose}
                  className="border-border hover:bg-muted-foreground/10 !h-auto flex-1 !rounded-lg"
                >
                  {t('cancel')}
                </Button>
                <Button
                  onClick={handleTryAgain}
                  className="bg-primary hover:bg-primary/90 !h-auto flex-1 !rounded-lg text-white"
                >
                  {t('try_again')}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {isGenerateMode ? (
                // 生成推文模式
                <>
                  {/* 推文预览区域 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-6 w-6 rounded-full bg-gray-300">
                          <img
                            src={twitterFullProfile?.profile_image_url}
                            alt=""
                            className="h-full w-full rounded-full"
                            onError={(e) => {
                              e.currentTarget.src = avatar.src;
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          @{twitterFullProfile?.screen_name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* 语言选择器 */}
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            disabled={
                              isGeneratingTweet || isGeneratingImage || isLoadingTemplateData
                            }
                            className="border-none shadow-none"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary flex !h-auto items-center gap-1 !rounded-full py-1 text-sm"
                            >
                              <span className="text-sm">
                                {selectedLanguage === LanguageCode.English && t('english')}
                                {selectedLanguage === LanguageCode.Chinese && t('chinese')}
                                {selectedLanguage === LanguageCode.Korean && t('korean')}
                              </span>
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            className="w-32 rounded-lg border-none p-0 shadow-lg"
                            align="end"
                          >
                            {[
                              { code: LanguageCode.English, label: t('english') },
                              { code: LanguageCode.Chinese, label: t('chinese') },
                              { code: LanguageCode.Korean, label: t('korean') },
                            ].map((lang) => (
                              <DropdownMenuItem
                                key={lang.code}
                                onClick={() =>
                                  !isGeneratingTweet &&
                                  !isGeneratingImage &&
                                  !isLoadingTemplateData &&
                                  setSelectedLanguage(lang.code)
                                }
                                className="border-b-border flex cursor-pointer items-center gap-3 rounded-none border-b px-4 py-2 last:border-b-0"
                                disabled={
                                  isGeneratingTweet || isGeneratingImage || isLoadingTemplateData
                                }
                              >
                                <div className="flex h-4 w-4 items-center justify-center">
                                  {selectedLanguage === lang.code ? (
                                    <div className="flex h-4 w-4 items-center justify-center rounded bg-blue-500">
                                      <Check className="h-3 w-3 text-white" />
                                    </div>
                                  ) : (
                                    <div className="h-4 w-4 rounded border border-gray-300"></div>
                                  )}
                                </div>
                                <span
                                  className={cn(
                                    'text-sm',
                                    selectedLanguage === lang.code
                                      ? 'font-medium text-blue-500'
                                      : 'text-gray-500'
                                  )}
                                >
                                  {lang.label}
                                </span>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          onClick={handleGenerateTweet}
                          disabled={isGeneratingTweet || isGeneratingImage || isLoadingTemplateData}
                          variant="outline"
                          size="sm"
                          className="bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary !h-auto !rounded-full border-none py-1 text-sm"
                        >
                          {isGeneratingTweet || isGeneratingImage || isLoadingTemplateData ? (
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          ) : (
                            <Magic className="text-primary h-5 w-5" />
                          )}
                          <span className="w-12 truncate sm:w-auto">
                            {isGeneratingTweet
                              ? t('generating')
                              : isLoadingTemplateData
                                ? t('getting_data')
                                : isGeneratingImage
                                  ? t('generating_image')
                                  : t('regenerate')}
                          </span>
                        </Button>
                      </div>
                    </div>

                    <div className="border-border rounded-lg border p-3">
                      {isEditingTweet ? (
                        <div>
                          <Textarea
                            value={tweetContent}
                            onChange={(e) => handleTweetContentChange(e.target.value)}
                            className={`!border-border min-h-[100px] resize-none border-0 bg-transparent p-0 shadow-none focus:ring-0 ${
                              tweetContentError ? 'border-red-500' : ''
                            }`}
                            placeholder={t('enter_tweet_content') || 'Enter tweet content...'}
                          />
                        </div>
                      ) : (
                        <div className="min-h-[100px] text-sm text-gray-800">
                          {tweetContent ? (
                            <div>
                              <p>{tweetContent}</p>
                              {/* 显示图片媒体或生成中的占位符 */}
                              {(tweetMedias.length > 0 ||
                                (imageTemplate &&
                                  (isGeneratingImage || pendingImageGeneration))) && (
                                <div className="mt-3">
                                  <div className="text-muted-foreground mb-2 text-xs">
                                    📎{' '}
                                    {isGeneratingImage || pendingImageGeneration
                                      ? t('generating_image_placeholder')
                                      : t('media_files_attached', { count: tweetMedias.length })}
                                  </div>
                                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                                    {/* 如果正在生成图片，显示占位符 */}
                                    {(isGeneratingImage || pendingImageGeneration) &&
                                    imageTemplate ? (
                                      <div className="border-border bg-muted relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                          <Loader2 className="text-primary h-6 w-6 animate-spin" />
                                          <span className="text-muted-foreground text-xs">
                                            {t('generating_image')}
                                          </span>
                                        </div>
                                      </div>
                                    ) : (
                                      /* 显示实际的媒体图片 */
                                      tweetMedias.map((media, index) => (
                                        <div
                                          key={index}
                                          className="group border-border bg-muted relative aspect-square cursor-pointer overflow-hidden rounded-lg border"
                                          onClick={() => handleImageClick(media, index)}
                                        >
                                          <img
                                            src={media}
                                            alt={`Media ${index + 1}`}
                                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                            onError={(e) => {
                                              e.currentTarget.src = placeholderImage.src;
                                            }}
                                          />
                                          <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/10" />
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-muted-foreground">
                              {isGeneratingTweet || isGeneratingImage || isLoadingTemplateData
                                ? t('loading_data')
                                : t('click_regenerate_to_generate_tweet') ||
                                  'Click Regenerate to generate tweet content, or click Edit to input manually...'}
                            </p>
                          )}
                        </div>
                      )}
                      {tweetContentError && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-red-500">
                          <AlertCircle className="h-6 w-6" />
                          {tweetContentError}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setIsGenerateMode(false)}
                        className="text-muted-foreground/60 hover:text-muted-foreground cursor-pointer text-sm hover:underline"
                      >
                        {t('already_posted')}?
                      </button>
                      <div className="flex items-center space-x-4">
                        {isEditingTweet && (
                          <button
                            onClick={handleCancelEdit}
                            className="text-muted-foreground/60 hover:text-muted-foreground/80 cursor-pointer"
                          >
                            {t('cancel')}
                          </button>
                        )}
                        <button
                          onClick={isEditingTweet ? handleSaveEdit : handleEditTweet}
                          disabled={isGeneratingTweet || isGeneratingImage || isLoadingTemplateData}
                          className={cn(
                            'flex cursor-pointer items-center',
                            isGeneratingTweet || isGeneratingImage || isLoadingTemplateData
                              ? 'text-muted-foreground/60 hover:text-muted-foreground/80 cursor-not-allowed'
                              : 'text-primary'
                          )}
                        >
                          {isEditingTweet ? (
                            <>
                              <span className="text-primary">{t('save')}</span>
                            </>
                          ) : (
                            <div className="flex items-center">
                              <Edit className="mr-1 h-3 w-3" />
                              <span>{t('edit')}</span>
                            </div>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* 在生成推文模式下，如果是platform类型也显示邮箱和邀请码 */}
                    {eventInfo?.a_type === 'platform' && (
                      <div className="flex items-center space-x-4">
                        {/* Email Input */}
                        <div className="space-y-2">
                          <label className="text-foreground text-sm font-medium">
                            {t('email')} <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="email"
                            value={email}
                            placeholder={t('email_placeholder')}
                            className={`!text-md bg-transparent outline-none ${
                              emailError ? 'border-red-500' : ''
                            }`}
                            onChange={(e) => handleEmailChange(e.target.value)}
                          />
                        </div>

                        {/* Event Code 输入框 */}
                        <div className="space-y-2">
                          <label className="text-foreground text-sm font-medium">
                            {t('event_code')} <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="text"
                            value={eventCode}
                            placeholder={t('enter_code_placeholder')}
                            className="!text-md bg-transparent outline-none"
                            onChange={(e) => {
                              setEventCode(e.target.value);
                              dispatch(updateRedemptionCode(e.target.value));
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                // 提交推文链接模式
                <>
                  {/* Tweet URL Input */}
                  <div className="space-y-2">
                    <label className="text-foreground text-sm font-medium">
                      {t('tweet_post')}
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={tweetUrl}
                      placeholder={t('tweet_url_placeholder')}
                      className={`!text-md bg-transparent outline-none ${
                        errors.tweetUrl ? 'border-red-500' : ''
                      }`}
                      onChange={(e) => setTweetUrl(e.target.value)}
                    />
                    {errors.tweetUrl && (
                      <div className="flex items-center gap-2 text-sm text-red-500">
                        <AlertCircle className="h-4 w-4" />
                        {errors.tweetUrl}
                      </div>
                    )}
                    <div className="text-muted-foreground text-sm">
                      <span
                        className="text-muted-foreground/60 hover:text-muted-foreground cursor-pointer hover:underline"
                        onClick={() => setIsGenerateMode(true)}
                      >
                        {t('ai_generate_tweet')}
                      </span>
                    </div>
                  </div>

                  {/* 只在 platform 类型时显示 Email 和 Event Code 输入框 */}
                  {eventInfo?.a_type === 'platform' && (
                    <>
                      {/* Email Input */}
                      <div className="space-y-2">
                        <label className="text-foreground text-sm font-medium">
                          {t('email')} <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="email"
                          value={email}
                          placeholder={t('email_placeholder')}
                          className={`!text-md bg-transparent outline-none ${
                            errors.email || emailError ? 'border-red-500' : ''
                          }`}
                          onChange={(e) => handleEmailChange(e.target.value)}
                        />
                        {(errors.email || emailError) && (
                          <div className="flex items-center gap-2 text-sm text-red-500">
                            <AlertCircle className="h-4 w-4" />
                            {errors.email || emailError}
                          </div>
                        )}
                      </div>

                      {/* Event Code 输入框 */}
                      <div className="space-y-2">
                        <label className="text-foreground text-sm font-medium">
                          {t('event_code')} <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          value={eventCode}
                          placeholder={t('enter_code_placeholder')}
                          className={`!text-md bg-transparent outline-none ${
                            errors.eventCode ? 'border-red-500' : ''
                          }`}
                          onChange={(e) => {
                            setEventCode(e.target.value);
                            dispatch(updateRedemptionCode(e.target.value));
                          }}
                        />
                        {errors.eventCode && (
                          <div className="flex items-center gap-2 text-sm text-red-500">
                            <AlertCircle className="h-4 w-4" />
                            {errors.eventCode}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}

          {/* Action Buttons - 只在显示表单时显示 */}
          {!isLoading && !isSuccess && !isFailed && (
            <>
              {/* 错误链提示 */}
              {isWrongChain && (
                <div className="mb-4 rounded-md bg-yellow-100 p-4 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                  <p className="text-sm">
                    {t('wrong_chain_message', { chainName: DEFAULT_CHAIN.name })}
                  </p>
                  <Button
                    onClick={handleSwitchChain}
                    className="mt-2 bg-yellow-800 text-white hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600"
                  >
                    {t('switch_to_chain', { chainName: DEFAULT_CHAIN.name })}
                  </Button>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={handleClose}
                  className="border-border hover:bg-muted-foreground/10 !h-auto flex-1 !rounded-lg"
                >
                  {t('cancel')}
                </Button>
                <Button
                  onClick={isGenerateMode ? handlePostTweet : handleSubmitTweetLink}
                  className="bg-primary hover:bg-primary/90 !h-auto flex-1 !rounded-lg text-white"
                  disabled={
                    isGenerateMode
                      ? !tweetContent.trim() ||
                        !!tweetContentError ||
                        isGeneratingTweet ||
                        isGeneratingImage ||
                        pendingImageGeneration ||
                        (eventInfo?.a_type === 'platform' &&
                          (!email.trim() || !!emailError || !eventCode.trim())) ||
                        isWrongChain
                      : !tweetUrl.trim() ||
                        (eventInfo?.a_type === 'platform' &&
                          (!email.trim() || !!emailError || !eventCode.trim())) ||
                        isWrongChain
                  }
                >
                  {isGenerateMode ? t('post') || 'Post' : t('submit') || 'Submit'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>

      {/* 图片预览弹窗 */}
      <DialogImagePreview
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        images={tweetMedias}
        initialIndex={selectedImageIndex}
      />
      {/* 隐藏的模板组件用于生成图片 - 支持多个KOL */}
      {imageTemplate &&
        templateData &&
        templateData.length > 0 &&
        (() => {
          const TemplateComponent = imageTemplate.component;
          return (
            <div className="pointer-events-none fixed -top-[10000px] left-0">
              {templateData.map((data, index) => (
                <div key={index} data-template-index={index}>
                  <TemplateComponent data={data} {...(imageTemplate.props || {})} />
                </div>
              ))}
            </div>
          );
        })()}
    </Dialog>
  );
}
