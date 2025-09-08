'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import {
  useReadContract,
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
} from 'wagmi';
import { erc20Abi } from 'viem';

import { Form, FormControl, FormField, FormItem, FormMessage } from '@shadcn-ui/form';
import { Button } from '@shadcn-ui/button';

import CompSelectProject from './SelectProject';
import CompCampaignCover from './CampaignCover';
import CompCampaignTitle from './CampaignTitle';
import CompCampaignType from './CampaignType';
import CompCampaignDescription from './CampaignDescription';
import CompCampaignRequirements from './CampaignRequirements';
import CompCampaignDuration from './CampaignDuration';
import CompRewardAmount from './RewardAmount';
import CompRewardRule from './RewardRule';
import useUserInfo from '@hooks/useUserInfo';
import { Loader2 } from 'lucide-react';
import { createActivity, createActivityCallback, getRewardRule } from '@libs/request';
import { useRouter } from '@libs/i18n/navigation';
import { getContractAddress } from '@constants/config';
import { DEFAULT_CHAIN } from '@constants/chains';
import Activityservice_abi from '@constants/abi/Activityservice_abi.json';
import {
  hasEnoughBalance,
  hasEnoughAllowance,
  toContractAmount,
} from '@libs/utils/format-bignumber';
import PagesRoute from '@constants/routes';
import ChainInfo from './ChainInfo';

// 创建一个函数来生成 Schema，以便使用 t 函数
const createFormSchema = (t: any) =>
  z.object({
    projectId: z.string().min(1, t('validation_project_required')),
    coverImage: z.string().min(1, t('validation_cover_image_required')),
    title: z
      .string()
      .min(1, t('validation_title_required'))
      .max(40, t('validation_title_max_length')),
    campaignType: z.string().min(1, t('validation_campaign_type_required')),
    description: z
      .string()
      .min(1, t('validation_description_required'))
      .max(800, t('validation_description_max_length')),
    requirements: z
      .string()
      .min(1, t('validation_requirements_required'))
      .max(4000, t('validation_requirements_max_length')),
    duration: z
      .object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
      .refine(
        (data) => {
          return data.startDate && data.endDate;
        },
        {
          message: t('validation_duration_required'),
        }
      )
      .refine(
        (data) => {
          if (data.startDate && data.endDate) {
            return data.endDate > data.startDate;
          }
          return true;
        },
        {
          message: t('validation_end_time_greater'),
        }
      ),
    rewardAmount: z
      .string()
      .min(1, t('validation_reward_amount_required'))
      .refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
      }, t('validation_reward_amount_positive')),
    rewardRule: z
      .object({
        isValid: z.boolean(),
        data: z.any(),
      })
      .refine((data) => data.isValid, t('validation_reward_rule_required')),
  });

export default function CampaignForm() {
  const t = useTranslations('common');
  const [activeTypeId, setActiveTypeId] = useState('random_distribution');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rewardRules, setRewardRules] = useState<any[]>([]);
  const [resetTrigger, setResetTrigger] = useState(0); // 添加重置触发器
  const { isLogin, isPending, login, isConnected, connect } = useUserInfo();
  const router = useRouter();
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const [isWrongChain, setIsWrongChain] = useState(false);
  const [activityId, setActivityId] = useState<string>('');
  const [needApprove, setNeedApprove] = useState(false);
  // 创建动态的 Schema
  const FormSchema = createFormSchema(t);
  type ICampaignFormValues = z.infer<typeof FormSchema>;

  // 代币相关的合约调用
  const { data: decimals, refetch: refetchDecimals } = useReadContract({
    address: getContractAddress().pay_member_token_address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'decimals',
  });
  const { data: symbol, refetch: refetchSymbol } = useReadContract({
    address: getContractAddress().pay_member_token_address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'symbol',
  });
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: getContractAddress().pay_member_token_address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
  });

  // 检查代币授权额度
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: getContractAddress().pay_member_token_address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address as `0x${string}`, getContractAddress().ActivityServiceAddress as `0x${string}`],
  });

  // 授权代币
  const {
    data: approveHash,
    writeContract: writeContractApprove,
    isPending: isPendingApprove,
    isError: isErrorApprove,
    error: errorApprove,
  } = useWriteContract();

  const {
    isLoading: isApproving,
    isSuccess: isConfirmedApprove,
    isError: isErrorWaitForTransactionReceiptApprove,
    error: errorWaitForTransactionReceiptApprove,
  } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // 调用ActivityService合约的deposit方法
  const {
    data: depositHash,
    writeContract: writeContractDeposit,
    isPending: isPendingDeposit,
    isError: isErrorDeposit,
    error: errorDeposit,
  } = useWriteContract();

  const {
    isLoading: isDepositing,
    isSuccess: isConfirmedDeposit,
    isError: isErrorWaitForTransactionReceiptDeposit,
    error: errorWaitForTransactionReceiptDeposit,
  } = useWaitForTransactionReceipt({
    hash: depositHash,
  });

  const form = useForm<ICampaignFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      projectId: '',
      coverImage: '',
      title: '',
      campaignType: '',
      description: '',
      requirements: '',
      duration: {
        startDate: undefined,
        endDate: undefined,
      },
      rewardAmount: '',
      rewardRule: {
        isValid: false,
        data: null,
      },
    },
    mode: 'onSubmit',
  });

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    trigger,
    clearErrors,
    formState: { isValid, errors },
  } = form;

  // 监听表单值变化
  const watchedValues = watch();

  // 监听字段变化，实时清除错误
  useEffect(() => {
    if (watchedValues.projectId && errors.projectId) {
      clearErrors('projectId');
    }
  }, [watchedValues.projectId, errors.projectId]);

  useEffect(() => {
    if (watchedValues.coverImage && errors.coverImage) {
      clearErrors('coverImage');
    }
  }, [watchedValues.coverImage, errors.coverImage]);

  useEffect(() => {
    if (watchedValues.title?.trim() && errors.title) {
      clearErrors('title');
    }
  }, [watchedValues.title, errors.title]);

  useEffect(() => {
    if (watchedValues.campaignType && errors.campaignType) {
      clearErrors('campaignType');
    }
  }, [watchedValues.campaignType, errors.campaignType]);

  useEffect(() => {
    if (watchedValues.description?.trim() && errors.description) {
      clearErrors('description');
    }
  }, [watchedValues.description, errors.description]);

  useEffect(() => {
    if (watchedValues.requirements?.trim() && errors.requirements) {
      clearErrors('requirements');
    }
  }, [watchedValues.requirements, errors.requirements]);

  useEffect(() => {
    const { startDate, endDate } = watchedValues.duration || {};
    if (startDate && endDate && endDate > startDate && errors.duration) {
      clearErrors('duration');
    }
  }, [watchedValues.duration?.startDate, watchedValues.duration?.endDate, errors.duration]);

  useEffect(() => {
    const amount = parseFloat(watchedValues.rewardAmount || '');
    if (watchedValues.rewardAmount && !isNaN(amount) && amount > 0 && errors.rewardAmount) {
      clearErrors('rewardAmount');
    }
  }, [watchedValues.rewardAmount, errors.rewardAmount]);

  useEffect(() => {
    if (watchedValues.rewardRule?.isValid && errors.rewardRule) {
      clearErrors('rewardRule');
    }
  }, [watchedValues.rewardRule?.isValid, errors.rewardRule]);

  // 格式化日期为后端需要的格式 (YYYY-MM-DD HH:MM:SS)
  const formatDateToBackend = (date: Date | undefined): string => {
    if (!date) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // 获取奖励规则数据
  const fetchRewardRules = async () => {
    try {
      const res = await getRewardRule();
      if (res.code === 200) {
        setRewardRules(res.data);
      }
    } catch (error) {
      console.error('获取奖励规则失败:', error);
    }
  };

  // 获取奖励规则ID - 根据ruleType查找对应的ID
  const getRewardRuleId = (rewardRuleData: any): string => {
    if (!rewardRuleData || !rewardRuleData.ruleType || !rewardRules.length) return '';

    // 从奖励规则数据中查找对应的ID
    const foundRule = rewardRules.find((rule) => rule.code === rewardRuleData.ruleType);
    return foundRule ? foundRule.id.toString() : '';
  };

  // 检查当前链是否为默认链
  useEffect(() => {
    if (chainId && DEFAULT_CHAIN.id !== chainId) {
      setIsWrongChain(true);
    } else {
      setIsWrongChain(false);
    }
    refetchAllowance();
    refetchBalance();
    refetchDecimals();
    refetchSymbol();
  }, [chainId]);

  // 获取奖励规则数据
  useEffect(() => {
    fetchRewardRules();
  }, []);

  // 检查授权额度是否足够
  const checkAllowance = (amount: string) => {
    if (!decimals || !allowance || !amount) return false;
    return hasEnoughAllowance(allowance, amount, Number(decimals));
  };

  // 检查余额是否足够
  const checkBalance = (amount: string) => {
    if (!decimals || !balance || !amount) return false;
    return hasEnoughBalance(balance, amount, Number(decimals));
  };

  // 切换到默认链
  const handleSwitchChain = async () => {
    try {
      setIsSubmitting(true);
      await switchChain({ chainId: DEFAULT_CHAIN.id });
      setIsSubmitting(false);
    } catch (error) {
      console.error('切换链失败:', error);
      toast.error(t('switch_chain_failed'));
      setIsSubmitting(false);
    }
  };

  // 执行授权
  const handleApprove = async (amount: string) => {
    if (!decimals || !amount) return;

    try {
      writeContractApprove({
        address: getContractAddress().pay_member_token_address as `0x${string}`,
        abi: erc20Abi,
        functionName: 'approve',
        args: [getContractAddress().ActivityServiceAddress as `0x${string}`, ethers.MaxUint256],
      });
    } catch (error) {
      console.error('授权错误:', error);
      toast.error(t('approve_failed'));
      setIsSubmitting(false);
    }
  };

  // 执行deposit调用
  const handleDeposit = async (amount: string, activityId: string) => {
    if (!decimals || !amount || !address || !activityId) return;

    try {
      const amountBigInt = toContractAmount(amount, Number(decimals));
      writeContractDeposit({
        address: getContractAddress().ActivityServiceAddress as `0x${string}`,
        abi: Activityservice_abi,
        functionName: 'deposit',
        args: [
          getContractAddress().pay_member_token_address as `0x${string}`,
          amountBigInt,
          activityId,
        ],
      });
    } catch (error) {
      console.error('调用deposit方法错误:', error);
      toast.error(t('deposit_failed'));
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: ICampaignFormValues) => {
    console.log('Form Data:', data);

    if (!isLogin) {
      toast.error(t('please_login_first'));
      return;
    }

    if (!isConnected) {
      connect();
      return;
    }

    // 检查余额是否足够
    if (!checkBalance(data.rewardAmount)) {
      toast.error(t('insufficient_balance'));
      return;
    }

    setIsSubmitting(true);

    try {
      const activityData = {
        project_id: data.projectId,
        cover_img: data.coverImage,
        title: data.title,
        active_type_id: data.campaignType,
        description: data.description,
        requirement: data.requirements,
        start: formatDateToBackend(data.duration.startDate),
        end: formatDateToBackend(data.duration.endDate),
        reward_amount: data.rewardAmount,
        reward_rule_id: getRewardRuleId(data.rewardRule.data),
        params: data.rewardRule.data,
      };

      console.log('Creating activity with data:', activityData);

      const res: any = await createActivity(activityData);

      if (res.code === 200) {
        // toast.success(t('post_campaign_create_success'));
        console.log('Activity created successfully:', res.data);

        // 保存activity ID用于后续合约调用
        setActivityId(res.data.id);

        // 检查授权额度
        await refetchAllowance();
        const hasEnoughAllowance = checkAllowance(data.rewardAmount);

        if (!hasEnoughAllowance) {
          setNeedApprove(true);
          // 执行授权
          await handleApprove(data.rewardAmount);
        } else {
          // 直接调用deposit方法
          await handleDeposit(data.rewardAmount, res.data.id);
        }
      } else {
        toast.error(res.msg || t('post_campaign_create_failed'));
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('createActivity error:', error);
      toast.error(t('post_campaign_create_failed'));
      setIsSubmitting(false);
    }
  };

  const createActivityPayCallback = async (activityId: string, txHash: string) => {
    try {
      const res: any = await createActivityCallback({ active_id: activityId, tx_hash: txHash });
      if (res.code === 200) {
        // 重置表单和所有子组件状态
        form.reset();
        setResetTrigger((prev) => prev + 1); // 触发所有子组件重置
        toast.success(t('post_campaign_pay_success'));
        setIsSubmitting(false);
        // router.push(`/market_events/${activityId}`);
        router.push(PagesRoute.MY_CAMPAIGNS);
      } else {
        toast.error(res.msg || t('post_campaign_pay_failed'));
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('createActivityPayCallback error:', error);
      toast.error(t('post_campaign_pay_failed'));
      setIsSubmitting(false);
    }
  };

  // 处理合约支付成功后的回调
  const handlePaymentSuccess = async () => {
    if (!depositHash || !activityId) return;

    await createActivityPayCallback(activityId, depositHash);
  };

  // 监听授权结果
  useEffect(() => {
    if (isConfirmedApprove) {
      // 授权成功后调用deposit方法
      const watchedValues = form.getValues();
      handleDeposit(watchedValues.rewardAmount, activityId);
    }
    if (isErrorWaitForTransactionReceiptApprove) {
      setIsSubmitting(false);
      toast.error(errorWaitForTransactionReceiptApprove?.message || t('approve_failed'));
    }
    if (isPendingApprove) {
      setIsSubmitting(true);
    }
    if (isErrorApprove) {
      setIsSubmitting(false);
      toast.error(errorApprove?.message || t('approve_failed'));
    }
  }, [
    isErrorApprove,
    errorApprove,
    isConfirmedApprove,
    isPendingApprove,
    isErrorWaitForTransactionReceiptApprove,
    errorWaitForTransactionReceiptApprove,
  ]);

  // 监听deposit方法调用结果
  useEffect(() => {
    if (isConfirmedDeposit) {
      handlePaymentSuccess();
    }
    if (isErrorWaitForTransactionReceiptDeposit) {
      setIsSubmitting(false);
      toast.error(errorWaitForTransactionReceiptDeposit?.message || t('deposit_failed'));
    }
    if (isPendingDeposit) {
      setIsSubmitting(true);
    }
    if (isErrorDeposit) {
      setIsSubmitting(false);
      toast.error(errorDeposit?.message || t('deposit_failed'));
    }
  }, [
    isErrorDeposit,
    errorDeposit,
    isConfirmedDeposit,
    isPendingDeposit,
    isErrorWaitForTransactionReceiptDeposit,
    errorWaitForTransactionReceiptDeposit,
  ]);

  // 安全的浮点数计算
  const parseNumber = (value: any): number => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : Math.round(num * 100) / 100; // 保留两位小数
  };

  // 验证奖励规则总额
  const validateRewardRuleAmount = (): boolean => {
    const currentValues = watch();
    const rewardAmount = parseNumber(currentValues.rewardAmount || '0');
    const rewardRuleData = currentValues.rewardRule?.data;

    if (!rewardRuleData || !rewardRuleData.ruleType || rewardAmount <= 0) {
      return true; // 如果没有奖励规则数据，跳过验证
    }

    let totalReward = 0;

    switch (rewardRuleData.ruleType) {
      case 'fixed_ranking_random_distribution':
        // 计算固定排名奖励总额
        if (rewardRuleData.ranks) {
          totalReward = rewardRuleData.ranks.reduce((total: number, rank: any) => {
            const amount = parseNumber(rank.reward);
            return Math.round((total + amount) * 100) / 100;
          }, 0);
        }
        break;

      case 'segmented_distribution':
        // 计算分段发放总额
        if (rewardRuleData.ranges) {
          totalReward = rewardRuleData.ranges.reduce((total: number, range: any) => {
            const amount = parseNumber(range.reward);
            const participants = (range.end || 0) - (range.start || 0) + 1;
            const segmentReward = Math.round(amount * participants * 100) / 100;
            return Math.round((total + segmentReward) * 100) / 100;
          }, 0);
        }
        break;

      default:
        return true; // 随机分发不需要验证
    }

    return totalReward <= rewardAmount;
  };

  const handleSubmitClick = async () => {
    const isFormValid = await trigger();

    if (!isFormValid) {
      // 找到第一个错误字段并滚动到该位置
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[data-field="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const errorMessage = errors[firstErrorField as keyof ICampaignFormValues]?.message;
          toast.error(errorMessage ? String(errorMessage) : t('validation_form_check'));
        }
      }
      return;
    }

    // 验证奖励规则总额
    if (!validateRewardRuleAmount()) {
      const rewardRuleElement = document.querySelector(`[data-field="rewardRule"]`);
      if (rewardRuleElement) {
        rewardRuleElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      toast.error(t('reward_rule_total_amount_validation_failed'));
      return;
    }

    // 如果验证通过，提交表单
    handleSubmit(onSubmit)();
  };

  return (
    <Form {...form}>
      <form className="flex flex-col gap-y-10 px-2" onSubmit={handleSubmit(onSubmit)}>
        <FormField
          control={control}
          name="projectId"
          render={({ field }) => (
            <FormItem data-field="projectId">
              <FormControl>
                <CompSelectProject
                  onProjectSelect={(projectId) => {
                    setValue('projectId', projectId);
                  }}
                  resetTrigger={resetTrigger}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="coverImage"
          render={({ field }) => (
            <FormItem data-field="coverImage">
              <FormControl>
                <CompCampaignCover
                  onImageChange={(imageUrl) => {
                    setValue('coverImage', imageUrl);
                  }}
                  resetTrigger={resetTrigger}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem data-field="title">
              <FormControl>
                <CompCampaignTitle
                  onTitleChange={(title) => {
                    setValue('title', title);
                  }}
                  resetTrigger={resetTrigger}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="campaignType"
          render={({ field }) => (
            <FormItem data-field="campaignType">
              <FormControl>
                <CompCampaignType
                  onTypeChange={(typeId) => {
                    setValue('campaignType', typeId);
                  }}
                  resetTrigger={resetTrigger}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem data-field="description">
              <FormControl>
                <CompCampaignDescription
                  onDescriptionChange={(description) => {
                    setValue('description', description);
                  }}
                  resetTrigger={resetTrigger}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="requirements"
          render={({ field }) => (
            <FormItem data-field="requirements">
              <FormControl>
                <CompCampaignRequirements
                  onRequirementsChange={(requirements) => {
                    setValue('requirements', requirements);
                  }}
                  resetTrigger={resetTrigger}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="duration"
          render={({ field }) => (
            <FormItem data-field="duration">
              <FormControl>
                <CompCampaignDuration
                  onDurationChange={(duration) => {
                    setValue('duration', {
                      startDate: duration.startDate || undefined,
                      endDate: duration.endDate || undefined,
                    });
                  }}
                  resetTrigger={resetTrigger}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="rewardAmount"
          render={({ field }) => (
            <FormItem data-field="rewardAmount">
              <FormControl>
                <CompRewardAmount
                  onAmountChange={(amount) => {
                    setValue('rewardAmount', amount);
                  }}
                  resetTrigger={resetTrigger}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="rewardRule"
          render={({ field }) => (
            <FormItem data-field="rewardRule">
              <FormControl>
                <CompRewardRule
                  activeTypeId={activeTypeId}
                  onChange={(data) => {
                    setValue('rewardRule', { isValid: true, data });
                  }}
                  onValidationChange={(isValid) => {
                    setValue('rewardRule', {
                      isValid,
                      data: watchedValues.rewardRule?.data || null,
                    });
                  }}
                  resetTrigger={resetTrigger}
                  rewardAmount={watchedValues.rewardAmount}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ChainInfo
          amount={watchedValues.rewardAmount}
          symbol={symbol}
          address={address}
          balance={balance}
          decimals={decimals}
        />

        {/* 错误链提示 */}
        {isWrongChain && (
          <div className="mb-4 rounded-md bg-yellow-100 p-4 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
            <p className="text-sm">{t('wrong_chain_message', { chainName: DEFAULT_CHAIN.name })}</p>
            <Button
              onClick={handleSwitchChain}
              disabled={isSubmitting}
              className="mt-2 bg-yellow-800 text-white hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('switching_chain')}
                </>
              ) : (
                t('switch_to_chain', { chainName: DEFAULT_CHAIN.name })
              )}
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between gap-x-20 pt-16">
          <Button
            className="!h-12 !w-full max-w-64 flex-1 text-xl"
            variant="secondary"
            onClick={() => router.push(PagesRoute.MY_CAMPAIGNS)}
          >
            {t('post_campaign_cancel')}
          </Button>
          {isLogin ? (
            isConnected ? (
              <Button
                className="!h-12 !w-full max-w-64 flex-1 text-xl"
                type="button"
                onClick={handleSubmitClick}
                disabled={isSubmitting || isWrongChain}
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  t('post_campaign_pay')
                )}
              </Button>
            ) : (
              <Button
                className="!h-12 !w-full max-w-64 flex-1 text-xl"
                type="button"
                onClick={connect}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : t('connect_wallet')}
              </Button>
            )
          ) : (
            <Button
              className="!h-12 !w-full max-w-64 flex-1 text-xl"
              type="button"
              onClick={login}
              disabled={isPending}
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : t('btn_log_in')}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
