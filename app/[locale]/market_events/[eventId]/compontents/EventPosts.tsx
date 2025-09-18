import { Button } from '@shadcn/components/ui/button';
import { cn } from '@shadcn/lib/utils';
import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import { Skeleton } from '@shadcn/components/ui/skeleton';
import { useAppSelector } from '@store/hooks';
import { Like, Message, ReTwet, Share, Verified } from '@assets/svg';
import {
  getActivityPosts,
  getActivityPostsMyRecord,
  IGetActivityPostsResponseData,
  IEventInfoResponseData,
  IGetActivityPostsResponseDataItem,
  IGetActivityPostsParams,
  IGetActivityPostsMyRecordParams,
  IGetActivityPostsMyRecordResponseData,
  LanguageCodeShort,
} from '@libs/request';
import { PostNull } from '@assets/svg';
import { useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shadcn/components/ui/dropdown-menu';
import { ChevronDown, Check, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import Link from 'next/link';
import PagesRoute from '@constants/routes';

// 推文卡片骨架屏组件
const PostItemSkeleton = () => {
  return (
    <div className="bg-background border-primary/10 shadow-primary/5 flex h-full w-full flex-col gap-2 rounded-2xl border-2 p-2 shadow-sm sm:gap-4 sm:rounded-3xl sm:p-4">
      <div className="flex w-full items-start justify-between">
        <div className="flex w-full flex-1 items-center gap-2">
          <Skeleton className="size-10 min-w-10 rounded-full sm:size-12 sm:min-w-12" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex w-full flex-1 items-center justify-between gap-2">
              <div className="flex w-full items-center gap-2">
                <Skeleton className="h-4 w-24 sm:h-5 sm:w-32" />
                <Skeleton className="h-4 w-4" />
                <div className="ml-auto">
                  <Skeleton className="h-3 w-16 sm:h-4 sm:w-20" />
                </div>
              </div>
            </div>
            <Skeleton className="h-3 w-20 sm:h-4 sm:w-24" />
          </div>
        </div>
      </div>

      {/* 推文内容骨架 */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>

      <div className="border-border mt-auto w-full border-t"></div>

      {/* 互动数据骨架 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1">
            <Skeleton className="h-3 w-3" />
            <Skeleton className="h-3 w-6" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-3 w-3" />
            <Skeleton className="h-3 w-6" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-3 w-3" />
            <Skeleton className="h-3 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

const PostItem = ({
  post,
  isFirst = false,
}: {
  post: IGetActivityPostsResponseDataItem;
  isFirst?: boolean;
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      className={cn(
        'border-primary/10 shadow-primary/5 hover:border-primary/20 flex h-full w-full flex-col gap-2 rounded-2xl border-2 p-2 shadow-sm hover:shadow-md sm:gap-4 sm:rounded-3xl sm:p-4',
        isFirst && 'animate-shake'
      )}
    >
      <div className="flex w-full items-start justify-between">
        <div className="flex w-full flex-1 items-center gap-2">
          <div className="bg-muted-foreground/10 size-10 min-w-10 overflow-hidden rounded-full sm:size-12 sm:min-w-12">
            {post.profile_image_url && (
              <img
                src={post.profile_image_url}
                alt={post.name || 'Profile'}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-0 sm:gap-0">
            <div className="flex w-full flex-1 items-center justify-between gap-2 text-sm sm:text-base">
              <div className="flex w-full items-center">
                <div className="flex w-full flex-1 items-center gap-2">
                  <span className="text-md line-clamp-1 truncate sm:text-base">
                    {post.name || 'Unknown User'}
                  </span>
                  {post.is_verified && <Verified className="size-4 min-w-4" />}
                  <span className="ml-auto text-xs whitespace-nowrap sm:text-base">
                    {formatDate(post.tweet_created_at)}
                  </span>
                </div>
              </div>
            </div>
            <span className="text-muted-foreground sm:text-md line-clamp-1 truncate text-sm">
              @{post.screen_name || 'unknown'}
            </span>
          </div>
        </div>
      </div>
      <p className="sm:text-md text-muted-foreground/90 line-clamp-4 text-sm">{post.tweet_text}</p>
      <div className="border-border mt-auto w-full border-t"></div>
      <div className="flex items-center justify-between">
        <div className="sm:text-md flex items-center gap-2 text-sm sm:gap-4">
          <div className="text-muted-foreground/90 flex items-center gap-0.5 sm:gap-1">
            <Like className="size-3" />
            <span>{post.like_count || 0}</span>
          </div>
          <div className="text-muted-foreground/90 flex items-center gap-0.5 sm:gap-1">
            <ReTwet className="size-3" />
            <span>{post.retweet_count || 0}</span>
          </div>
          <div className="text-muted-foreground/90 flex items-center gap-0.5 sm:gap-1">
            <Message className="size-3" />
            <span>{post.reply_count || 0}</span>
          </div>
        </div>
        {/* <div className="text-muted-foreground/90 sm:text-md flex cursor-pointer items-center gap-0.5 text-sm sm:gap-1">
          <Share className="size-3" />
          <span>Share</span>
        </div> */}
      </div>
    </div>
  );
};

const EmptyState = () => {
  const t = useTranslations('common');

  return (
    <div className="flex h-80 w-full flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-4 flex items-center justify-center rounded-full">
        <PostNull className="text-muted-foreground size-20" />
      </div>
      <h3 className="text-muted-foreground/60 mb-2 text-xl font-semibold">
        {t('no_tweets_found')}
      </h3>
      <p className="text-md text-muted-foreground/60 mb-2 max-w-md">{t('no_tweets_description')}</p>
      <Link href={PagesRoute.MARKET_EVENTS}>
        <Button
          variant="outline"
          className="bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary !rounded-lg border-none px-6 py-2"
        >
          {t('explore_campaigns')}
        </Button>
      </Link>
    </div>
  );
};

// 提取公共的头部组件
export const HeaderSection = ({
  selectedLanguages,
  onLanguageChange,
  onMyTweetClick,
  disabled = false,
  showMyTweetButton = true,
  isMyTweetsMode = false,
}: {
  selectedLanguages: string[];
  onLanguageChange: (lang: string) => void;
  onMyTweetClick: () => void;
  disabled?: boolean;
  showMyTweetButton?: boolean;
  isMyTweetsMode?: boolean;
}) => {
  const t = useTranslations('common');
  const isLoggedIn = useAppSelector((state) => state.userReducer?.isLoggedIn);

  const languages = [
    { code: LanguageCodeShort.All, label: t('all') },
    { code: LanguageCodeShort.English, label: t('english') },
    { code: LanguageCodeShort.Chinese, label: t('chinese') },
    { code: LanguageCodeShort.Korea, label: t('korean') },
    { code: LanguageCodeShort.Japanese, label: t('japanese') },
  ];

  // 获取显示文本：如果选择了"全部"或没有选择，显示"全部"，否则显示选中的语言
  const getDisplayText = () => {
    if (selectedLanguages.includes(LanguageCodeShort.All) || selectedLanguages.length === 0) {
      return t('all');
    }
    if (selectedLanguages.length === 1) {
      const lang = languages.find((l) => l.code === selectedLanguages[0]);
      return lang ? lang.label : t('all');
    }
    return `${selectedLanguages.length} ${t('languages')}`;
  };

  return (
    <div className="flex items-center gap-2 px-2 sm:gap-2 sm:px-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={disabled} className="border-none shadow-none">
          <Button
            variant="outline"
            className={cn(
              'flex items-center gap-1 !rounded-lg',
              isMyTweetsMode
                ? 'bg-muted-foreground/5 text-muted-foreground hover:bg-muted-foreground/10'
                : 'bg-primary/5 text-primary hover:bg-primary/10'
            )}
          >
            <span className="text-sm font-medium">{getDisplayText()}</span>
            <ChevronDown className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40 rounded-lg border-none p-0 shadow-lg" align="start">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => !disabled && onLanguageChange(lang.code)}
              className="border-b-border flex cursor-pointer items-center gap-3 rounded-none border-b px-4 py-3"
            >
              <div className="flex h-4 w-4 items-center justify-center">
                {selectedLanguages.includes(lang.code) ? (
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
                  selectedLanguages.includes(lang.code)
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

      {showMyTweetButton && isLoggedIn && (
        <div className="">
          <Button
            variant="secondary"
            disabled={disabled}
            onClick={onMyTweetClick}
            className={cn(
              isMyTweetsMode
                ? 'bg-primary/5 text-primary hover:bg-primary/10'
                : 'bg-muted-foreground/5 text-muted-foreground hover:bg-muted-foreground/10'
            )}
          >
            My tweet
          </Button>
        </div>
      )}
    </div>
  );
};

// 提取公共的加载状态组件
const LoadingState = ({ col }: { col?: number }) => {
  const isLoggedIn = useAppSelector((state) => state.userReducer?.isLoggedIn);
  const itemsPerPage = isLoggedIn ? 8 : 9; // 默认显示9个骨架屏

  return (
    <div className="flex flex-col gap-4 p-2 sm:p-4">
      <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2', col && `sm:grid-cols-${col}`)}>
        {Array.from({ length: itemsPerPage }).map((_, index) => (
          <PostItemSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

// 提取公共的错误状态组件
const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => {
  const t = useTranslations('common');

  return (
    <div className="flex h-80 items-center justify-center py-16">
      <div className="text-center">
        <div className="text-muted-foreground mb-4">{error}</div>
        <Button onClick={onRetry} variant="outline">
          {t('btn_retry')}
        </Button>
      </div>
    </div>
  );
};

// 分页组件
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  isAutoMode = false,
  onAutoModeToggle,
  isMyTweetsMode = false,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  isAutoMode?: boolean;
  onAutoModeToggle?: () => void;
  isMyTweetsMode?: boolean;
}) => {
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5; // 最多显示5个页码

    if (totalPages <= maxVisible) {
      // 如果总页数小于等于最大显示数，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 否则需要智能显示
      if (currentPage <= 3) {
        // 当前页在前面，显示 1,2,3,4,...,last
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        // 当前页在后面，显示 1,...,last-3,last-2,last-1,last
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // 当前页在中间，显示 1,...,current-1,current,current+1,...,last
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {/* Auto模式按钮 */}
      {!isMyTweetsMode && onAutoModeToggle && (
        <Button
          onClick={onAutoModeToggle}
          variant="outline"
          size="sm"
          disabled={disabled}
          className={cn(
            'hover:bg-primary/10 hover:text-primary flex h-8 items-center gap-2 px-3',
            isAutoMode
              ? 'bg-primary/10 text-primary border-primary/20'
              : 'bg-muted-foreground/5 text-muted-foreground hover:bg-muted-foreground/10'
          )}
        >
          {isAutoMode ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span className="text-sm">Auto</span>
        </Button>
      )}

      {/* 上一页按钮 */}
      <button
        onClick={() => !disabled && !isAutoMode && canPrev && onPageChange(currentPage - 1)}
        disabled={disabled || isAutoMode || !canPrev}
        className={cn(
          'bg-muted-foreground/5 hover:bg-muted-foreground/10 text-muted-foreground/50 flex h-8 w-8 items-center justify-center rounded-sm backdrop-blur-sm transition-all',
          canPrev && !disabled && !isAutoMode ? 'text-muted-foreground' : 'cursor-not-allowed'
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* 页码按钮 */}
      {visiblePages.map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="text-muted-foreground flex h-8 w-8 items-center justify-center text-sm">
              ...
            </span>
          ) : (
            <button
              onClick={() => !disabled && !isAutoMode && onPageChange(page as number)}
              disabled={disabled || isAutoMode}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-sm text-sm transition-all',
                page === currentPage
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted-foreground/5 hover:bg-muted-foreground/10 text-muted-foreground/50 hover:text-muted-foreground',
                (disabled || isAutoMode) && 'cursor-not-allowed'
              )}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}

      {/* 下一页按钮 */}
      <button
        onClick={() => !disabled && !isAutoMode && canNext && onPageChange(currentPage + 1)}
        disabled={disabled || isAutoMode || !canNext}
        className={cn(
          'bg-muted-foreground/5 hover:bg-muted-foreground/10 text-muted-foreground/50 flex h-8 w-8 items-center justify-center rounded-sm backdrop-blur-sm transition-all',
          canNext && !disabled && !isAutoMode ? 'text-muted-foreground' : 'cursor-not-allowed'
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default forwardRef<
  { refreshPosts: () => Promise<void> },
  {
    eventInfo: IEventInfoResponseData;
    isLoading: boolean;
    onRefresh?: () => Promise<void>;
    col?: number;
  }
>(function EventPosts({ eventInfo, isLoading, onRefresh, col }, ref) {
  const t = useTranslations('common');
  const isLoggedIn = useAppSelector((state) => state.userReducer?.isLoggedIn);
  const [selectedLanguages, setSelectedLanguages] = useState<LanguageCodeShort[]>([LanguageCodeShort.All]); // 支持多选，默认选择全部
  const [posts, setPosts] = useState<IGetActivityPostsResponseDataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 分页相关状态 - 现在使用服务端分页
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [isMyTweetsMode, setIsMyTweetsMode] = useState(false); // 标记当前是否在查看我的推文
  const [isAutoMode, setIsAutoMode] = useState(true); // auto模式，默认开启
  const [showShake, setShowShake] = useState(false); // 控制首个推文的shake动画
  const autoTimerRef = useRef<NodeJS.Timeout | null>(null); // auto模式定时器
  const itemsPerPage = isLoggedIn ? 8 : 9; // 每页显示的项目数量
  const autoTime = 2000; // auto模式下每2秒切换页面

  // 获取活动ID，优先使用props传入的eventId
  const getEventId = useCallback(() => {
    if (eventInfo?.id) {
      return eventInfo.id;
    }
    // 如果没有传入eventId，尝试从URL获取
    if (typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/');
      const eventIdIndex = pathParts.findIndex((part) => part === 'market_events') + 1;
      if (eventIdIndex > 0 && pathParts[eventIdIndex]) {
        return pathParts[eventIdIndex];
      }
    }
    return '';
  }, [eventInfo?.id]);

  const fetchPosts = useCallback(
    async (languages: LanguageCodeShort[], page: number = 1, isAutoModeCall = false) => {
      try {
        // auto模式下不显示loading状态
        if (!isAutoModeCall) {
          setLoading(true);
        }
        setError(null);
        setIsMyTweetsMode(false); // 重置为普通模式
        const currentEventId = getEventId();

        if (!currentEventId) {
          setError('Event ID not found');
          setPosts([]);
          setTotalPages(0);
          setTotal(0);
          return;
        }

        // 构建请求参数
        const params: IGetActivityPostsParams = {
          active_id: currentEventId.toString(),
          page: page,
          size: itemsPerPage,
          language: '', // 默认为空字符串表示全部
        };

        // 处理语言参数
        const hasAll = languages.includes(LanguageCodeShort.All);
        if (!hasAll && languages.length > 0) {
          // 后端API支持逗号分隔的多语言参数，尽管TypeScript类型定义可能不够准确
          params.language = languages.join(',') as LanguageCodeShort;
        }

        const response = await getActivityPosts(params);
        const responseData = response.data;

        if (responseData) {
          setPosts(responseData.list || []);
          setCurrentPage(responseData.current_page || 1);
          setTotal(responseData.total || 0);
          // 计算总页数
          setTotalPages(Math.ceil((responseData.total || 0) / itemsPerPage));

          // auto模式下，显示首个推文的shake动画
          if (isAutoModeCall && responseData.list && responseData.list.length > 0) {
            setShowShake(true);
            // 1.5秒后停止shake动画
            setTimeout(() => setShowShake(false), 1500);
          }
        } else {
          setPosts([]);
          setTotalPages(0);
          setTotal(0);
        }
      } catch (err) {
        console.error('Failed to fetch posts:', err);
        setError('Failed to fetch posts');
        setPosts([]);
        setTotalPages(0);
        setTotal(0);
      } finally {
        // auto模式下不设置loading为false
        if (!isAutoModeCall) {
          setLoading(false);
        }
      }
    },
    [getEventId, itemsPerPage, isLoggedIn]
  );

  // auto模式定时器逻辑
  useEffect(() => {
    if (isAutoMode && !isMyTweetsMode && totalPages > 1) {
      // 清除之前的定时器
      if (autoTimerRef.current) {
        clearInterval(autoTimerRef.current);
      }

      // 设置新的定时器，每autoTime秒切换页面
      autoTimerRef.current = setInterval(() => {
        setCurrentPage((prevPage) => {
          const nextPage = prevPage >= totalPages ? 1 : prevPage + 1;
          fetchPosts(selectedLanguages, nextPage, true); // 使用auto模式调用
          return nextPage;
        });
      }, autoTime);
    } else {
      // 清除定时器
      if (autoTimerRef.current) {
        clearInterval(autoTimerRef.current);
        autoTimerRef.current = null;
      }
    }

    // 清理函数
    return () => {
      if (autoTimerRef.current) {
        clearInterval(autoTimerRef.current);
        autoTimerRef.current = null;
      }
    };
  }, [isAutoMode, isMyTweetsMode, totalPages, selectedLanguages, fetchPosts]);

  useEffect(() => {
    // 只有当eventInfo存在且有ID时才获取推文
    if (eventInfo?.id) {
      fetchPosts(selectedLanguages, 1); // 重置到第一页
    }
  }, [selectedLanguages, fetchPosts, eventInfo?.id, isLoggedIn]);

  const handlePageChange = (page: number) => {
    if (page !== currentPage) {
      if (isMyTweetsMode) {
        handleMyTweetClick(page);
      } else {
        fetchPosts(selectedLanguages, page);
      }
    }
  };

  const handleLanguageChange = (language: LanguageCodeShort) => {
    // 当选择语言时，退出我的推文模式并自动开启auto模式
    setIsMyTweetsMode(false);
    setIsAutoMode(true); // 从我的推文切换回全部数据时自动开启auto模式

    setSelectedLanguages((prev) => {
      if (language === LanguageCodeShort.All) {
        // 如果选择"全部"，清空其他选择
        return [LanguageCodeShort.All];
      } else {
        // 如果选择具体语言
        if (prev.includes(LanguageCodeShort.All)) {
          // 如果之前选择了"全部"，移除"全部"并添加当前语言
          return [language];
        } else if (prev.includes(language)) {
          // 如果当前语言已选中，移除它
          return prev.filter((lang) => lang !== language);
        } else {
          // 添加新语言
          return [...prev, language];
        }
      }
    });
  };

  const handleAutoModeToggle = () => {
    setIsAutoMode((prev) => !prev);
  };

  const handleRetry = () => {
    if (isMyTweetsMode) {
      handleMyTweetClick(currentPage);
    } else {
      fetchPosts(selectedLanguages, currentPage);
    }
  };

  const handleMyTweetClick = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      setIsMyTweetsMode(true); // 设置为我的推文模式
      setIsAutoMode(false); // 我的推文模式下关闭auto模式
      const currentEventId = getEventId();

      if (!currentEventId) {
        setError('Event ID not found');
        setPosts([]);
        setTotalPages(0);
        setTotal(0);
        return;
      }

      const params: IGetActivityPostsMyRecordParams = {
        active_id: currentEventId.toString(),
        page: page,
        size: itemsPerPage,
      };

      const response = await getActivityPostsMyRecord(params);
      const responseData = response.data;

      if (responseData) {
        setPosts(responseData.list || []);
        setCurrentPage(responseData.current_page || 1);
        setTotal(responseData.total || 0);
        setTotalPages(Math.ceil((responseData.total || 0) / itemsPerPage));
      } else {
        setPosts([]);
        setTotalPages(0);
        setTotal(0);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error('Failed to fetch my tweets:', err);
      setError('Failed to fetch my tweets');
      setPosts([]);
      setTotalPages(0);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // 使用 useImperativeHandle 暴露刷新函数
  useImperativeHandle(ref, () => ({
    refreshPosts: () => {
      if (isMyTweetsMode) {
        return handleMyTweetClick(currentPage);
      } else {
        return fetchPosts(selectedLanguages, currentPage);
      }
    },
  }));

  // 公共容器样式
  const containerClass =
    'flex h-full w-full flex-col gap-2 p-2 px-0 pt-2 pb-2 sm:p-2 sm:pt-4 sm:pb-4';

  if (loading || isLoading) {
    return (
      <div className={containerClass}>
        <HeaderSection
          selectedLanguages={selectedLanguages}
          onLanguageChange={handleLanguageChange}
          onMyTweetClick={() => handleMyTweetClick(1)}
          disabled={true}
          isMyTweetsMode={isMyTweetsMode}
        />
        <LoadingState col={col} />
        {/* 分页组件 */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            disabled={loading}
            isAutoMode={isAutoMode}
            onAutoModeToggle={handleAutoModeToggle}
            isMyTweetsMode={isMyTweetsMode}
          />
        )}
      </div>
    );
  }

  // 如果eventInfo不存在，显示加载状态或空状态
  if (!eventInfo) {
    return (
      <div className={containerClass}>
        <HeaderSection
          selectedLanguages={selectedLanguages}
          onLanguageChange={handleLanguageChange}
          onMyTweetClick={() => handleMyTweetClick(1)}
          disabled={true}
          isMyTweetsMode={isMyTweetsMode}
        />
        <LoadingState col={col} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={containerClass}>
        <HeaderSection
          selectedLanguages={selectedLanguages}
          onLanguageChange={handleLanguageChange}
          onMyTweetClick={() => handleMyTweetClick(1)}
          disabled={true}
          isMyTweetsMode={isMyTweetsMode}
        />
        <ErrorState error={error} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <HeaderSection
        selectedLanguages={selectedLanguages}
        onLanguageChange={handleLanguageChange}
        onMyTweetClick={() => handleMyTweetClick(1)}
        isMyTweetsMode={isMyTweetsMode}
      />

      {posts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-4 p-2 sm:p-4">
          {/* 推文列表 - 移动端单列，桌面端多列 */}
          <div
            className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2', col && `sm:grid-cols-${col}`)}
          >
            {posts.map((post, index) => (
              <PostItem key={post.id || index} post={post} isFirst={index === 0 && showShake} />
            ))}
          </div>

          {/* 分页组件 */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              disabled={loading}
              isAutoMode={isAutoMode}
              onAutoModeToggle={handleAutoModeToggle}
              isMyTweetsMode={isMyTweetsMode}
            />
          )}
        </div>
      )}
    </div>
  );
});
