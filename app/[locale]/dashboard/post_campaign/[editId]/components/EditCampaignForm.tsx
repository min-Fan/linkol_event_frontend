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

import CompEditSelectProject from './EditSelectProject';
import CompEditCampaignCover from './EditCampaignCover';
import CompEditCampaignTitle from './EditCampaignTitle';
import CompEditCampaignType from './EditCampaignType';
import CompEditCampaignDescription from './EditCampaignDescription';
import CompEditCampaignRequirements from './EditCampaignRequirements';
import CompEditCampaignDuration from './EditCampaignDuration';
import CompEditRewardAmount from './EditRewardAmount';
import CompEditRewardRule from './EditRewardRule';
import useUserInfo from '@hooks/useUserInfo';
import { Loader2 } from 'lucide-react';
import {
  updateActivity,
  getCampaignDetails,
  IUpdateActivityRequest,
  getRewardRule,
} from '@libs/request';
import { useRouter } from '@libs/i18n/navigation';

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

interface EditCampaignFormProps {
  editId: string;
}

export default function EditCampaignForm({ editId }: EditCampaignFormProps) {
  const t = useTranslations('common');
  const [activeTypeId, setActiveTypeId] = useState('random_distribution');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [campaignData, setCampaignData] = useState<any>(null);
  const [isActivityStarted, setIsActivityStarted] = useState(false); // 活动是否已开始
  const [rewardRules, setRewardRules] = useState<any[]>([]);
  const { isLogin, isPending, login } = useUserInfo();
  const router = useRouter();

  // 创建动态的 Schema
  const FormSchema = createFormSchema(t);
  type ICampaignFormValues = z.infer<typeof FormSchema>;

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

  // 解析后端日期格式
  const parseBackendDate = (dateString: string): Date | undefined => {
    if (!dateString) return undefined;
    return new Date(dateString);
  };

  // 检查活动是否已开始
  const checkActivityStatus = (startDate: string) => {
    if (!startDate) return false;
    const now = new Date();
    const activityStart = new Date(startDate);
    return now >= activityStart;
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

  // 加载活动详情
  const loadCampaignDetails = async () => {
    try {
      setIsLoading(true);
      const res: any = await getCampaignDetails(editId);
      if (res.code === 200) {
        const data = res.data;
        console.log('Campaign data loaded:', data);
        setCampaignData(data);

        // 检查活动是否已开始
        const hasStarted = checkActivityStatus(data.start);
        setIsActivityStarted(hasStarted);
        console.log('Activity started status:', hasStarted, 'Start time:', data.start);

        // 填充表单数据
        setValue('projectId', data.project ? data.project.id.toString() : '');
        setValue('coverImage', data.cover_img || '');
        setValue('title', data.title || '');
        const campaignTypeValue = data.active_type ? data.active_type.id.toString() : '';
        console.log(
          'Setting campaignType value:',
          campaignTypeValue,
          'from data.active_type:',
          data.active_type
        );
        setValue('campaignType', campaignTypeValue);
        setValue('description', data.description || '');
        setValue('requirements', data.requirement || '');
        setValue('duration', {
          startDate: parseBackendDate(data.start),
          endDate: parseBackendDate(data.end),
        });
        setValue('rewardAmount', data.reward_amount ? String(data.reward_amount) : '');
        setValue('rewardRule', {
          isValid: true,
          data: data.reward_rule?.params || null,
        });

        if (data.active_type) {
          setActiveTypeId(data.active_type.id.toString());
        }
      } else {
        toast.error(res.msg || t('load_campaign_failed'));
      }
    } catch (error) {
      console.error('加载活动详情失败:', error);
      toast.error(t('load_campaign_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  // 页面加载时获取活动详情和奖励规则
  useEffect(() => {
    if (editId) {
      loadCampaignDetails();
    }
    fetchRewardRules();
  }, [editId]);

  const onSubmit = async (data: ICampaignFormValues) => {
    console.log('Form Data:', data);

    if (!isLogin) {
      toast.error(t('please_login_first'));
      return;
    }

    setIsSubmitting(true);

    try {
      // 如果活动已开始，使用原始的params数据，否则使用表单中的数据
      const paramsData = isActivityStarted
        ? campaignData?.reward_rule?.params
        : data.rewardRule.data;

      const activityData: IUpdateActivityRequest = {
        cover_img: data.coverImage,
        title: data.title,
        description: data.description,
        requirement: data.requirements,
        start: formatDateToBackend(data.duration.startDate),
        end: formatDateToBackend(data.duration.endDate),
        reward_amount: data.rewardAmount,
        params: paramsData,
        active_type_id: data.campaignType,
        project_id: data.projectId,
        reward_rule_id: getRewardRuleId(paramsData),
      };

      console.log('Updating activity with data:', activityData);

      const res: any = await updateActivity(Number(editId), activityData);

      if (res.code === 200) {
        toast.success(t('edit_campaign_success'));
        router.push('/dashboard/my_campaign');
      } else {
        toast.error(res.msg || t('edit_campaign_failed'));
      }
    } catch (error) {
      console.error('updateActivity error:', error);
      toast.error(t('edit_campaign_failed'));
    } finally {
      setIsSubmitting(false);
    }
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

    // 如果验证通过，提交表单
    handleSubmit(onSubmit)();
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form className="flex flex-col gap-y-10 px-2" onSubmit={handleSubmit(onSubmit)}>
        {/* 项目选择 - 始终只读 */}
        <FormField
          control={control}
          name="projectId"
          render={({ field }) => (
            <FormItem data-field="projectId">
              <FormControl>
                <CompEditSelectProject
                  selectedProjectId={field.value}
                  onProjectSelect={() => {}} // 禁用选择
                  isReadOnly={true}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 封面 - 根据活动状态决定是否可编辑 */}
        <FormField
          control={control}
          name="coverImage"
          render={({ field }) => (
            <FormItem data-field="coverImage">
              <FormControl>
                <CompEditCampaignCover
                  initialImageUrl={campaignData?.cover_img}
                  onImageChange={
                    !isActivityStarted
                      ? (imageUrl) => {
                          setValue('coverImage', imageUrl);
                        }
                      : () => {}
                  }
                  isReadOnly={isActivityStarted}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 标题 - 根据活动状态决定是否可编辑 */}
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem data-field="title">
              <FormControl>
                <CompEditCampaignTitle
                  initialTitle={campaignData?.title}
                  onTitleChange={
                    !isActivityStarted
                      ? (title) => {
                          setValue('title', title);
                        }
                      : () => {}
                  }
                  isReadOnly={isActivityStarted}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 活动类型 - 根据活动状态决定是否可编辑 */}
        <FormField
          control={control}
          name="campaignType"
          render={({ field }) => (
            <FormItem data-field="campaignType">
              <FormControl>
                <CompEditCampaignType
                  onTypeChange={
                    !isActivityStarted
                      ? (typeId) => {
                          setValue('campaignType', typeId);
                        }
                      : () => {}
                  } // 根据活动状态决定是否可选择
                  isReadOnly={isActivityStarted}
                  selectedType={field.value}
                  initialType={campaignData?.active_type}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 描述 - 始终可编辑 */}
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem data-field="description">
              <FormControl>
                <CompEditCampaignDescription
                  initialDescription={campaignData?.description}
                  onDescriptionChange={(description) => {
                    setValue('description', description);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 要求(推文要求) - 始终可编辑 */}
        <FormField
          control={control}
          name="requirements"
          render={({ field }) => (
            <FormItem data-field="requirements">
              <FormControl>
                <CompEditCampaignRequirements
                  onRequirementsChange={(requirements) => {
                    setValue('requirements', requirements);
                  }}
                  isReadOnly={false}
                  initialRequirements={campaignData?.requirement}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 持续时间 - 根据活动状态决定是否可编辑 */}
        <FormField
          control={control}
          name="duration"
          render={({ field }) => (
            <FormItem data-field="duration">
              <FormControl>
                <CompEditCampaignDuration
                  onDurationChange={
                    !isActivityStarted
                      ? (duration) => {
                          setValue('duration', {
                            startDate: duration.startDate || undefined,
                            endDate: duration.endDate || undefined,
                          });
                        }
                      : () => {}
                  } // 根据活动状态决定是否可编辑
                  isReadOnly={isActivityStarted}
                  initialDuration={{
                    startDate: parseBackendDate(campaignData?.start) || null,
                    endDate: parseBackendDate(campaignData?.end) || null,
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 奖励金额 - 根据活动状态决定是否可编辑 */}
        <FormField
          control={control}
          name="rewardAmount"
          render={({ field }) => (
            <FormItem data-field="rewardAmount">
              <FormControl>
                <CompEditRewardAmount
                  onAmountChange={
                    !isActivityStarted
                      ? (amount) => {
                          setValue('rewardAmount', amount);
                        }
                      : () => {}
                  } // 根据活动状态决定是否可编辑
                  isReadOnly={isActivityStarted}
                  initialAmount={
                    campaignData?.reward_amount ? String(campaignData.reward_amount) : ''
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 奖励规则 - 根据活动状态决定是否可编辑 */}
        <FormField
          control={control}
          name="rewardRule"
          render={({ field }) => (
            <FormItem data-field="rewardRule">
              <FormControl>
                <CompEditRewardRule
                  activeTypeId={activeTypeId}
                  onChange={
                    !isActivityStarted
                      ? (data) => {
                          setValue('rewardRule', { isValid: true, data });
                        }
                      : () => {}
                  } // 根据活动状态决定是否可编辑
                  onValidationChange={
                    !isActivityStarted
                      ? (isValid) => {
                          setValue('rewardRule', {
                            isValid,
                            data: watchedValues.rewardRule?.data || null,
                          });
                        }
                      : () => {}
                  } // 根据活动状态决定是否可验证变更
                  isReadOnly={isActivityStarted}
                  initialData={campaignData?.reward_rule?.params}
                  rewardAmount={watchedValues.rewardAmount}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between gap-x-20 pt-16">
          <Button
            className="!h-12 !w-full max-w-64 flex-1 text-xl"
            variant="secondary"
            type="button"
            onClick={() => router.push('/dashboard/my_campaign')}
          >
            {t('edit_campaign_cancel')}
          </Button>
          {isLogin ? (
            <Button
              className="!h-12 !w-full max-w-64 flex-1 text-xl"
              type="button"
              onClick={handleSubmitClick}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : t('edit_campaign_save')}
            </Button>
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
