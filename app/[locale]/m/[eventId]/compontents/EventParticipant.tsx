import {
  IEventInfoResponseData,
  RewardRule,
  getCampaignJoinList,
  IGetCampaignJoinListParams,
  IGetCampaignJoinListItem,
  submitReward,
  ISubmitRewardParams,
  RewardStatus,
} from '@libs/request';
import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
  memo,
} from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@shadcn/components/ui/table';
import { Checkbox } from '@shadcn/components/ui/checkbox';
import defaultAvatar from '@assets/image/avatar.png';
import { cn } from '@shadcn/lib/utils';
import { useAppSelector } from '@store/hooks';
import { Button } from '@shadcn/components/ui/button';
import { getRewardRule } from '@libs/request';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { NullData } from '@assets/svg';

const EventParticipant = memo(
  forwardRef<
    { refreshParticipants: () => Promise<void> },
    { eventInfo: IEventInfoResponseData; isLoading: boolean; onRefresh?: () => Promise<void> }
  >(function EventParticipant({ eventInfo, isLoading, onRefresh }, ref) {
    const t = useTranslations('common');
    const isLoggedIn = useAppSelector((state) => state.userReducer?.isLoggedIn);
    const payTokenInfo = useAppSelector((state) => state.userReducer?.pay_token_info);
    const locale = useLocale();
    const [rewardRules, setRewardRules] = useState<RewardRule[]>([]);

    // 参与者列表相关状态
    const [participants, setParticipants] = useState<IGetCampaignJoinListItem[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(20);
    const [total, setTotal] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(false);

    // 选择模式相关状态
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());
    const [isSubmittingReward, setIsSubmittingReward] = useState(false);
    const [processingParticipants, setProcessingParticipants] = useState<Set<string>>(new Set());

    // 滚动容器引用
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const getRules = async () => {
      try {
        const res = await getRewardRule();
        if (res.code === 200) {
          setRewardRules(res.data);
        }
      } catch (error) {
        console.error('获取奖励规则失败:', error);
      }
    };

    // 获取参与者列表
    const fetchParticipants = useCallback(
      async (page: number, isLoadMore = false) => {
        if (!eventInfo?.id || !isLoggedIn) return;

        try {
          if (isLoadMore) {
            setIsLoadingMore(true);
          } else {
            setIsInitialLoading(true);
          }

          const params: IGetCampaignJoinListParams = {
            active_id: eventInfo.id,
            page,
            size: pageSize,
          };

          const response = await getCampaignJoinList(params);

          if (response.code === 200 && response.data) {
            const newParticipants = response.data.list || [];
            const totalCount = response.data.total || 0;

            if (isLoadMore) {
              setParticipants((prev) => [...prev, ...newParticipants]);
            } else {
              setParticipants(newParticipants);
            }

            setTotal(totalCount);
            setCurrentPage(page);
            setHasMore(page * pageSize < totalCount);
          }
        } catch (error) {
          console.error('获取参与者列表失败:', error);
        } finally {
          setIsLoadingMore(false);
          setIsInitialLoading(false);
        }
      },
      [eventInfo?.id, pageSize, isLoggedIn]
    );

    // 初始加载
    useEffect(() => {
      if (eventInfo?.id && isLoggedIn) {
        fetchParticipants(1, false);
      }
    }, [eventInfo?.id, fetchParticipants, isLoggedIn]);

    // 获取奖励规则
    useEffect(() => {
      getRules();
    }, []);

    // 滚动加载更多
    const handleScroll = useCallback(() => {
      if (!scrollContainerRef.current || isLoadingMore || !hasMore) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const threshold = 100; // 距离底部100px时触发加载

      if (scrollTop + clientHeight >= scrollHeight - threshold) {
        fetchParticipants(currentPage + 1, true);
      }
    }, [currentPage, fetchParticipants, isLoadingMore, hasMore]);

    // 添加滚动监听
    useEffect(() => {
      const scrollContainer = scrollContainerRef.current;
      if (scrollContainer) {
        scrollContainer.addEventListener('scroll', handleScroll);
        return () => scrollContainer.removeEventListener('scroll', handleScroll);
      }
    }, [handleScroll]);

    // 格式化品牌价值
    const formatBrandValue = (value: number | undefined) => {
      if (!value) return '-';
      return value.toFixed(1);
    };

    // 格式化奖励金额
    const formatRewardAmount = (amount: number | undefined) => {
      if (!amount) return '-';
      return `${amount.toLocaleString()}`;
    };

    // 获取状态显示
    const getStatusDisplay = (rewardStatus: string | undefined) => {
      if (!rewardStatus) return '-';

      switch (rewardStatus) {
        case 'not_sure':
          return t('not_sure');
        case 'selected':
          return t('selected');
        case 'un_selected':
          return t('un_selected');
        case 'receiving':
          return t('receiving');
        case 'received':
          return t('received');
        case 'failed':
          return t('failed');
        default:
          return '-';
      }
    };

    // 获取状态样式
    const getStatusStyle = (rewardStatus: RewardStatus | undefined) => {
      if (!rewardStatus) return 'text-muted-foreground';

      switch (rewardStatus) {
        case RewardStatus.not_sure:
          return 'text-muted-foreground';
        case RewardStatus.selected:
          return 'text-blue-500';
        case RewardStatus.un_selected:
          return 'text-gray-500';
        case RewardStatus.receiving:
          return 'text-yellow-500';
        case RewardStatus.received:
          return 'text-green-500';
        case RewardStatus.failed:
          return 'text-red-500';
        default:
          return 'text-muted-foreground';
      }
    };

    // 切换选择模式
    const toggleSelectionMode = () => {
      if (isSelectionMode) {
        // 退出选择模式，清空选择
        setSelectedParticipants(new Set());
      }
      setIsSelectionMode(!isSelectionMode);
    };

    // 处理单个KOL选择
    const handleParticipantSelect = (participantId: string, checked: boolean) => {
      const newSelected = new Set(selectedParticipants);
      if (checked) {
        newSelected.add(participantId);
      } else {
        newSelected.delete(participantId);
      }
      setSelectedParticipants(newSelected);
    };

    // 全选/取消全选
    const handleSelectAll = (checked: boolean) => {
      if (checked) {
        const allIds = participants.map((p) => p.id?.toString() || '').filter((id) => id);
        setSelectedParticipants(new Set(allIds));
      } else {
        setSelectedParticipants(new Set());
      }
    };

    // 验证选择人数是否符合规则
    const validateSelectionCount = (): { isValid: boolean; message?: string } => {
      if (!eventInfo?.reward_rule?.params || selectedParticipants.size === 0) {
        return { isValid: false, message: t('please_select_participants') };
      }

      const ruleParams = eventInfo.reward_rule.params;
      const ruleType = eventInfo.reward_rule.code;
      const selectedCount = selectedParticipants.size;

      switch (ruleType) {
        case 'random_distribution':
          const maxRandom = ruleParams.random_number || 0;
          if (selectedCount > maxRandom) {
            return {
              isValid: false,
              message: t('reward_rule_random_select_exceeded', {
                max: maxRandom,
                selected: selectedCount,
              }),
            };
          }
          break;

        case 'fixed_ranking_random_distribution':
          const maxRandomAdditional = ruleParams.random_number || 0;
          const rankingCount = ruleParams.ranks?.length || 0;
          const maxTotal = rankingCount + maxRandomAdditional;
          if (selectedCount > maxTotal) {
            return {
              isValid: false,
              message: t('reward_rule_fixed_ranking_exceeded', {
                max: maxTotal,
                selected: selectedCount,
              }),
            };
          }
          break;

        case 'segmented_distribution':
          // 检查是否在允许的排名范围内
          const selectedParticipantsData = participants.filter((p) =>
            selectedParticipants.has(p.id?.toString() || '')
          );

          for (const participant of selectedParticipantsData) {
            if (participant.ranges) {
              const [start, end] = participant.ranges.split('-').map(Number);
              if (isNaN(start) || isNaN(end)) continue;
              const ruleParams = eventInfo.reward_rule.params;
              const selectedCount = selectedParticipants.size;
              if (selectedCount > ruleParams.random_number) {
                return {
                  isValid: false,
                  message: t('reward_rule_random_select_exceeded', {
                    max: ruleParams.random_number,
                    selected: selectedCount,
                  }),
                };
              }
            }
          }
          break;
      }

      return { isValid: true };
    };

    // 提交奖励
    const handleSubmitReward = async () => {
      const validation = validateSelectionCount();
      if (!validation.isValid) {
        toast.error(validation.message);
        return;
      }

      if (selectedParticipants.size === 0) {
        toast.error(t('please_select_participants'));
        return;
      }

      setIsSubmittingReward(true);

      // 标记正在处理的KOL
      setProcessingParticipants(new Set(selectedParticipants));

      try {
        const selectedData = participants.filter((p) =>
          selectedParticipants.has(p.id?.toString() || '')
        );

        const submitData: ISubmitRewardParams = {
          joins: selectedData.map((p) => ({
            id: p.id?.toString() || '',
            receive_amount: p.receive_amount?.toString() || '0',
          })),
        };

        const response = await submitReward(submitData);

        if (response.code === 200) {
          toast.success(t('reward_submit_success'));

          // 刷新参与者列表
          // await fetchParticipants(1, false);

          // 手动更新本地状态中已选中KOL的状态
          setParticipants((prevParticipants) =>
            prevParticipants.map((participant) => {
              if (selectedParticipants.has(participant.id?.toString() || '')) {
                // 更新已发放奖励的KOL状态
                return {
                  ...participant,
                  reward_status: RewardStatus.selected, // 标记为已选中
                };
              }
              return participant;
            })
          );

          // 清除处理状态
          setProcessingParticipants(new Set());

          // 退出选择模式
          setIsSelectionMode(false);
          setSelectedParticipants(new Set());

          // 刷新按钮状态
          onRefresh?.();
        } else {
          toast.error(response.data?.msg || t('reward_submit_failed'));
        }
      } catch (error) {
        console.error('提交奖励失败:', error);
        toast.error(t('reward_submit_failed'));
      } finally {
        setIsSubmittingReward(false);
        // 清除处理状态
        setProcessingParticipants(new Set());
      }
    };

    // 获取已发放奖励的参与者数量
    const getIssuedCount = () => {
      return participants.filter((p) => p.reward_status === RewardStatus.selected).length;
    };

    // 获取未发放奖励的参与者数量
    const getUnissuedCount = () => {
      return participants.filter((p) => p.reward_status !== RewardStatus.un_selected).length;
    };

    // 使用 useImperativeHandle 暴露刷新函数
    useImperativeHandle(ref, () => ({
      refreshParticipants: () => fetchParticipants(1, false),
    }));

    return (
      <div className="flex flex-col gap-4 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="text-md font-bold sm:text-base">{t('participant')}</h2>
            {rewardRules.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {rewardRules.map(
                  (rule) =>
                    eventInfo?.reward_rule?.code === rule.code && (
                      <Button
                        variant="secondary"
                        size="sm"
                        key={rule.code}
                        className={cn(
                          'cursor-default',
                          eventInfo?.reward_rule?.code === rule.code &&
                            'bg-primary/5 border-primary text-primary hover:bg-primary/5 hover:border-primary hover:text-primary border'
                        )}
                      >
                        <span className="sm:text-md text-sm">
                          {locale === 'zh'
                            ? rewardRules.find((r) => r.code === rule.code)?.zh_name
                            : rewardRules.find((r) => r.code === rule.code)?.en_name}
                        </span>
                      </Button>
                    )
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* 统计信息 */}
            {/* <div className="text-muted-foreground flex items-center gap-4 text-sm">
            <span>{t('total_participants', { count: total })}</span>
            <span>{t('issued_count', { count: getIssuedCount() })}</span>
            <span>{t('unissued_count', { count: getUnissuedCount() })}</span>
          </div> */}

            {/* 选择模式按钮 */}
            <Button
              className="!rounded-full sm:!px-6"
              variant={isSelectionMode ? 'secondary' : 'default'}
              onClick={toggleSelectionMode}
            >
              {isSelectionMode ? (
                <>
                  <X className="mr-2 h-4 w-4" />
                  {t('exit_selection')}
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {t('select_participants')}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 选择模式下的操作栏 */}
        {isSelectionMode && (
          <div className="bg-primary/5 flex flex-wrap items-center justify-between gap-2 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <Checkbox
                checked={
                  selectedParticipants.size === participants.length && participants.length > 0
                }
                onCheckedChange={handleSelectAll}
                className="h-5 w-5"
              />
              <span className="text-sm font-medium">
                {t('select_all')} ({selectedParticipants.size}/{participants.length})
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-muted-foreground text-sm">
                {t('selected_count', { count: selectedParticipants.size })}
              </span>
              <Button
                onClick={handleSubmitReward}
                disabled={selectedParticipants.size === 0 || isSubmittingReward}
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmittingReward ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('submitting')}
                  </>
                ) : (
                  t('submit_reward')
                )}
              </Button>
            </div>
          </div>
        )}

        <div
          ref={scrollContainerRef}
          className="bg-muted-foreground/5 max-h-[600px] overflow-y-auto rounded-2xl py-2"
        >
          <Table>
            <TableHeader>
              <TableRow className="border-none">
                {/* 选择模式下的复选框列 */}
                {isSelectionMode && (
                  <TableHead className="w-12 pb-2 text-center">
                    <span className="text-sm font-semibold sm:text-base">{t('select')}</span>
                  </TableHead>
                )}
                <TableHead className="pb-2 text-center">
                  <span className="text-sm font-semibold sm:text-base">{t('event_rank')}</span>
                </TableHead>
                <TableHead className="pb-2 text-center">
                  <span className="text-sm font-semibold sm:text-base">KOL</span>
                </TableHead>
                <TableHead className="pb-2 text-center">
                  <span className="text-sm font-semibold sm:text-base">{t('brand_value')}</span>
                </TableHead>
                <TableHead className="pb-2 text-center">
                  <span className="text-sm font-semibold sm:text-base">{t('tweet_link')}</span>
                </TableHead>
                <TableHead className="pb-2 text-center">
                  <span className="text-sm font-semibold sm:text-base">{t('reward_amount')}</span>
                </TableHead>
                <TableHead className="pb-2 text-center">
                  <span className="text-sm font-semibold sm:text-base">
                    {t('segmented_distribution')}
                  </span>
                </TableHead>
                <TableHead className="pb-2 text-center">
                  <span className="text-sm font-semibold sm:text-base">{t('event_status')}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isInitialLoading ? (
                // 初始加载状态
                <TableRow className="border-none">
                  <TableCell colSpan={isSelectionMode ? 8 : 7}>
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span className="text-sm">{t('loading')}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : participants.length === 0 ? (
                // 空数据状态
                <TableRow className="border-none">
                  <TableCell colSpan={isSelectionMode ? 8 : 7}>
                    <div className="flex flex-col items-center justify-center py-8">
                      <NullData className="h-14 w-14" />
                      <span className="text-muted-foreground text-sm">{t('no_data')}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // 参与者数据
                participants.map((participant, index) => (
                  <TableRow className="border-none" key={participant.id || index}>
                    {/* 选择模式下的复选框 */}
                    {isSelectionMode && (
                      <TableCell className="text-center">
                        <Checkbox
                          checked={selectedParticipants.has(participant.id?.toString() || '')}
                          onCheckedChange={(checked) =>
                            handleParticipantSelect(
                              participant.id?.toString() || '',
                              checked as boolean
                            )
                          }
                          disabled={
                            participant.reward_status === RewardStatus.selected ||
                            processingParticipants.has(participant.id?.toString() || '')
                          } // 已选中的或正在处理的不能选择
                          className="h-4 w-4"
                        />
                      </TableCell>
                    )}

                    <TableCell>
                      <div className="flex items-center justify-center">
                        <span className="sm:text-md flex h-8 w-8 items-center justify-center rounded-full border text-sm">
                          {index + 1}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="p-1">
                      <div className="flex items-center justify-center gap-2">
                        <div className="size-8 min-w-8 overflow-hidden rounded-full">
                          <img
                            src={participant.profile_image_url || defaultAvatar.src}
                            alt="avatar"
                            className="size-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = defaultAvatar.src;
                            }}
                          />
                        </div>
                        <p className="sm:text-md max-w-[100px] truncate text-sm">
                          {participant.name || participant.screen_name || 'Unknown'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <span className="sm:text-md text-sm">
                          {formatBrandValue(participant.brand_value)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <span className="sm:text-md max-w-[150px] truncate text-sm">
                          {participant.tweet_url ? (
                            <a
                              href={participant.tweet_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {participant.tweet_url}
                            </a>
                          ) : (
                            '-'
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <span className="sm:text-md text-sm">
                          {formatRewardAmount(participant.receive_amount)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <span className="sm:text-md text-sm">{participant.ranges || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        {processingParticipants.has(participant.id?.toString() || '') ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="text-primary h-4 w-4 animate-spin" />
                            <span className="text-primary text-sm">{t('processing')}</span>
                          </div>
                        ) : (
                          <span
                            className={cn(
                              'sm:text-md text-sm',
                              getStatusStyle(participant.reward_status)
                            )}
                          >
                            {getStatusDisplay(participant.reward_status)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}

              {/* 加载更多状态 */}
              {isLoadingMore && (
                <TableRow className="border-none">
                  <TableCell colSpan={isSelectionMode ? 8 : 7}>
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span className="text-sm">{t('loading')}</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* 底部统计信息 */}
          {participants.length > 0 && (
            <div className="border-border/20 hidden border-t px-2 py-3 sm:block sm:px-6">
              <div className="text-muted-foreground flex items-center justify-between text-sm">
                <span className="text-left">{t('total_participants', { count: total })}</span>
                <span className="text-right">
                  {t('current_display', { count: participants.length })}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  })
);

export default EventParticipant;
