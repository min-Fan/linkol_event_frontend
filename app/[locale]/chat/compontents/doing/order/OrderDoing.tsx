import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import {
  startOrderProcessing,
  updateOrderStep,
  updateOrderParams,
  addOrderThinkingMessage,
  clearStepThinkingMessages,
  completeOrderProcessing,
  removeLastChatMessage,
  removeChatMessageById,
  clearOrderThinkingMessages,
  addChatMessage,
} from '@store/reducers/userSlice';
import { useChatApi } from '@hooks/useChatApi';
import useChatMessage from '@hooks/useChatMessage';
import {
  getServiceData,
  createOrder,
  payOrder,
  validateOrderParams,
  formatDateToYYYYMMDD,
  createNewProject,
} from './order';
import { getProjectList, uploadImage, getTweetInfoByUrl } from '@libs/request';
import ChatThinking from '../../ChatThinking';
import { Button } from '@shadcn/components/ui/button';
import { Textarea } from '@shadcn/components/ui/textarea';
import { Input } from '@shadcn/components/ui/input';
import { DatePicker } from '@ui/datePicker';
import { Card, CardContent } from '@shadcn/components/ui/card';
import { Checkbox } from '@shadcn/components/ui/checkbox';
import { TextIcon, TextThread, TextImage, ImageThread, Plus } from '@assets/svg';
import UploadImage from '@ui/uploadImage';
import { toast } from 'sonner';
import { CornerRightDown, Loader2, X } from 'lucide-react';
import {
  useReadContract,
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
} from 'wagmi';
import { erc20Abi } from 'viem';
import { getContractAddress } from '@constants/config';
import { DEFAULT_CHAIN } from '@constants/chains';
import KOLService_abi from '@constants/abi/KOLService_abi.json';
import {
  hasEnoughBalance,
  hasEnoughAllowance,
  toContractAmount,
  MAX256,
} from '@libs/utils/format-bignumber';
import useUserInfo from '@hooks/useUserInfo';
import { LoadingDots } from '../../Chat';
import { MessageType, ChatType } from '@db/index';
import { cn } from '@shadcn/lib/utils';
import { usePathname } from 'next/navigation';
import { ScrollArea } from '@shadcn/components/ui/scroll-area';
import { formatAddress } from '@libs/utils/avatar';
import { getExplorerLink } from '@constants/chains';
import UIDialogBindEmail from '@ui/dialog/BindEmail';

interface OrderDoingProps {
  data: {
    function_name: string;
    parameters: {
      has: string[];
      kol_ids: Array<{
        id: number;
        price: number;
      }>;
      miss: string[];
      price_yuan?: number; // 添加总价格参数（可选）
    };
  };
  actionId: string;
  messages: any[]; // 当前消息列表
}

// 创建动态步骤配置函数
const getStepsConfig = (t: (key: string) => string) => [
  {
    id: 0,
    thinkingMessages: [t('order_step_checking_login'), t('order_step_checking_login_complete')],
    title: t('order_title_check_login'),
    description: t('order_desc_check_login'),
  },
  {
    id: 1,
    thinkingMessages: [
      t('order_step_fetching_projects'),
      t('order_step_fetching_projects_complete'),
    ],
    title: t('order_title_fetch_projects'),
    description: t('order_desc_fetch_projects'),
  },
  {
    id: 1.5,
    thinkingMessages: [t('order_step_select_project'), t('order_step_select_project_complete')],
    title: t('order_title_select_project'),
    description: t('order_desc_select_project'),
    component: 'selectProject',
  },
  {
    id: 2,
    thinkingMessages: [t('order_step_creating_project'), t('order_step_creating_project_complete')],
    title: t('order_title_create_project'),
    description: t('order_desc_create_project'),
    component: 'createProject',
  },
  {
    id: 3,
    thinkingMessages: [
      t('order_step_select_tweet_type'),
      t('order_step_select_tweet_type_complete'),
    ],
    title: t('order_title_select_tweet_type'),
    description: t('order_desc_select_tweet_type'),
    component: 'tweetType',
  },
  {
    id: 4,
    thinkingMessages: [
      t('order_step_select_extra_service'),
      t('order_step_select_extra_service_complete'),
    ],
    title: t('order_title_select_extra_service'),
    description: t('order_desc_select_extra_service'),
    component: 'extraService',
  },
  {
    id: 5,
    thinkingMessages: [t('order_step_upload_images'), t('order_step_upload_images_complete')],
    title: t('order_title_upload_images'),
    description: t('order_desc_upload_images'),
    component: 'uploadImages',
  },
  {
    id: 6,
    thinkingMessages: [
      t('order_step_promotional_materials'),
      t('order_step_promotional_materials_complete'),
    ],
    title: t('order_title_promotional_materials'),
    description: t('order_desc_promotional_materials'),
    component: 'promotionalMaterials',
  },
  {
    id: 7,
    thinkingMessages: [t('order_step_promotion_time'), t('order_step_promotion_time_complete')],
    title: t('order_title_promotion_time'),
    description: t('order_desc_promotion_time'),
    component: 'promotionTime',
  },
  {
    id: 8,
    thinkingMessages: [
      t('order_step_calculating_amount'),
      t('order_step_calculating_amount_complete'),
    ],
    title: t('order_title_calculate_amount'),
    description: t('order_desc_calculate_amount'),
  },
  {
    id: 9,
    thinkingMessages: [t('order_step_validating_order'), t('order_step_validating_order_complete')],
    title: t('order_title_validate_order'),
    description: t('order_desc_validate_order'),
  },
  {
    id: 10,
    thinkingMessages: [t('order_step_creating_order'), t('order_step_creating_order_complete')],
    title: t('order_title_create_order'),
    description: t('order_desc_create_order'),
  },
  {
    id: 11,
    thinkingMessages: [t('order_step_checking_network'), t('order_step_checking_network_complete')],
    title: t('order_title_check_network'),
    description: t('order_desc_check_network'),
  },
  {
    id: 12,
    thinkingMessages: [t('order_step_checking_balance'), t('order_step_checking_balance_complete')],
    title: t('order_title_check_balance'),
    description: t('order_desc_check_balance'),
  },
  {
    id: 13,
    thinkingMessages: [
      t('order_step_checking_allowance'),
      t('order_step_checking_allowance_complete'),
    ],
    title: t('order_title_check_allowance'),
    description: t('order_desc_check_allowance'),
  },
  {
    id: 14,
    thinkingMessages: [t('order_step_approving_token'), t('order_step_approving_token_complete')],
    title: t('order_title_approve_token'),
    description: t('order_desc_approve_token'),
  },
  {
    id: 15,
    thinkingMessages: [
      t('order_step_initiating_transaction'),
      t('order_step_initiating_transaction_complete'),
    ],
    title: t('order_title_initiate_transaction'),
    description: t('order_desc_initiate_transaction'),
  },
  {
    id: 16,
    thinkingMessages: [
      t('order_step_waiting_confirmation'),
      t('order_step_waiting_confirmation_complete'),
    ],
    title: t('order_title_wait_confirmation'),
    description: t('order_desc_wait_confirmation'),
  },
  {
    id: 17,
    thinkingMessages: [
      t('order_step_submitting_payment'),
      t('order_step_submitting_payment_complete'),
    ],
    title: t('order_title_submit_payment'),
    description: t('order_desc_submit_payment'),
  },
  {
    id: 18,
    thinkingMessages: [t('order_step_order_complete')],
    title: t('order_title_order_confirmation'),
    description: t('order_desc_order_confirmation'),
    component: 'orderConfirmation',
  },
];

// 定义ref接口
export interface OrderDoingRef {
  handleStepError: (error: any, stepName: string, errorMessage?: string) => Promise<void>;
}

const OrderDoing = forwardRef<OrderDoingRef, OrderDoingProps>(
  ({ data, actionId, messages }, ref) => {
    const t = useTranslations('common');
    const dispatch = useAppDispatch();
    const locale = useLocale();
    const { sendCompletionMessage, updateActionMessage } = useChatApi();
    const { isLogin, isConnected, connect, login, email } = useUserInfo();
    const { address, chainId } = useAccount();
    const { switchChain } = useSwitchChain();

    // 动态获取步骤配置
    const STEPS_CONFIG = useMemo(() => getStepsConfig(t), [t]);

    // 获取当前chat_cid，用于监听对话切换
    const currentChatCid = useAppSelector((state) => state.userReducer?.chat_cid);

    // 获取数据库操作函数
    const { createMessage } = useChatMessage(currentChatCid || undefined);

    const isOrderProcessing = useAppSelector((state) => state.userReducer?.isOrderProcessing);
    const orderStep = useAppSelector((state) => state.userReducer?.orderStep);
    const orderParams = useAppSelector((state) => state.userReducer?.orderParams);
    const pathname = usePathname();
    const orderThinkingMessages = useAppSelector(
      (state) => state.userReducer?.orderThinkingMessages
    );

    const [serviceData, setServiceData] = useState<any>(null);
    const [kolsInfo, setKolsInfo] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isServiceLoading, setIsServiceLoading] = useState(false);
    const [stepStartTime, setStepStartTime] = useState<number>(0);
    const [canGoBack, setCanGoBack] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const thinkingScrollRef = useRef<HTMLDivElement>(null); // 思考过程滚动区域的ref
    const hasStartedFlowRef = useRef(false); // 添加防重复执行的ref
    const isErrorHandlingRef = useRef(false); // 使用ref防止重复错误处理
    const isPayingRef = useRef(false); // 添加支付处理状态
    const isActionDeletedRef = useRef(false); // 添加action删除状态跟踪

    // 支付相关状态
    const [order, setOrder] = useState<any>(null);
    const [orderId, setOrderId] = useState<string>('');
    const [needApprove, setNeedApprove] = useState(false);
    const [isWrongChain, setIsWrongChain] = useState(false);
    const [showBindEmailDialog, setShowBindEmailDialog] = useState(false);

    // 合约相关hooks
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
      args: [address as `0x${string}`, getContractAddress().KOLServiceAddress as `0x${string}`],
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

    // 调用KOLService合约的issue方法
    const {
      data: issueHash,
      writeContract: writeContractIssue,
      isPending: isPendingIssue,
      isError: isErrorIssue,
      error: errorIssue,
    } = useWriteContract();

    const {
      isLoading: isIssuing,
      isSuccess: isConfirmedIssue,
      isError: isErrorWaitForTransactionReceiptIssue,
      error: errorWaitForTransactionReceiptIssue,
    } = useWaitForTransactionReceipt({
      hash: issueHash,
    });

    // 通用错误处理函数
    const handleStepError = useCallback(
      async (error: any, stepName: string, errorMessage?: string) => {
        const errorHandlingKey = `error_handling_${actionId}`;

        console.error(`${stepName}失败:`, error);
        console.log('要删除的actionId:', actionId);

        // 防止重复调用错误处理 - 使用多重检查
        if (isErrorHandlingRef.current) {
          console.log('错误处理正在进行中，跳过重复调用');
          return;
        }

        // 检查action是否已被删除
        if (isActionDeletedRef.current) {
          console.log('action已被删除，跳过错误处理');
          return;
        }

        // 使用sessionStorage防止同一actionId重复处理
        if (sessionStorage.getItem(errorHandlingKey) === 'processing') {
          console.log('同一actionId正在处理错误，跳过重复调用');
          return;
        }

        console.log('开始错误处理流程');
        isErrorHandlingRef.current = true;
        sessionStorage.setItem(errorHandlingKey, 'processing');

        const finalErrorMessage =
          error?.message || errorMessage || t('order_error_retry', { stepName });
        console.log('准备发送错误消息:', finalErrorMessage);

        try {
          // 删除action消息（包括数据库和Redux状态）
          console.log('准备删除action消息:', actionId, 'currentChatCid:', currentChatCid);
          const deleteResult = await updateActionMessage(actionId, null);
          console.log('删除action消息结果:', deleteResult);

          if (!deleteResult) {
            console.error('删除action消息失败，但将继续执行错误处理流程');
          }

          // 准备重试数据 - 保存当前执行状态用于重试
          const retryData = {
            userMessage: {
              role: 'user' as const,
              content: `重试action操作: ${stepName}`,
              mid: `retry-user-${Date.now()}`,
              result_type: 'str',
              timestamp: Date.now(),
            },
            messageCid: currentChatCid || '',
            userMid: `retry-user-${Date.now()}`,
            assistantMid: `retry-assistant-${Date.now()}`,
            timestamp: Date.now(),
            locale: locale,
            // 添加重试action的特殊数据
            retryAction: {
              actionData: data,
              actionId: actionId,
              stepName: stepName,
              // 保存当前执行状态，用于重试时恢复
              executionState: {
                orderStep: orderStep,
                orderParams: orderParams,
                orderThinkingMessages: orderThinkingMessages,
                serviceData: serviceData,
                projects: projects,
                uploadedImages: uploadedImages,
                order: order,
                orderId: orderId,
                needApprove: needApprove,
                isWrongChain: isWrongChain,
              },
            },
          };

          // 构造错误消息数据
          const errorMessageData = {
            type: 'timeout' as const,
            message: finalErrorMessage,
            retryData: retryData,
          };

          const errorMid = `error-${Date.now()}`;
          const timestamp = Date.now();

          // 发送带有重试功能的错误消息，使用timeout类型以复用现有逻辑
          dispatch(
            addChatMessage({
              role: 'assistant',
              content: errorMessageData,
              mid: errorMid,
              result_type: 'timeout',
              timestamp: timestamp,
            })
          );

          // 保存到数据库（持久化重试消息）
          try {
            if (currentChatCid && createMessage) {
              await createMessage({
                cid: currentChatCid,
                mid: errorMid,
                type: MessageType.AGENT,
                chatType: ChatType.CHAT,
                content: JSON.stringify(errorMessageData), // 序列化保存，与useChatApi保持一致
                result_type: 'timeout',
                timestamp: timestamp,
              });
              console.log('错误消息已保存到数据库，包含重试功能');
            } else {
              console.warn('无法获取当前对话ID或createMessage函数，错误消息未保存到数据库');
            }
          } catch (dbError) {
            console.error('保存错误消息到数据库失败:', dbError);
          }

          console.log('错误消息发送成功，包含重试数据');
        } catch (sendError) {
          console.error('发送错误消息失败:', sendError);
          // 即使发送失败，也要确保toast显示
          toast.error(finalErrorMessage);
        }

        // 标记action已被删除和流程结束
        isActionDeletedRef.current = true;
        hasStartedFlowRef.current = false;
        isPayingRef.current = false;
        dispatch(completeOrderProcessing());

        // 清理sessionStorage标记
        sessionStorage.removeItem(errorHandlingKey);

        console.log('错误处理完成，action已删除，流程已结束');
        isErrorHandlingRef.current = false;
      },
      [sendCompletionMessage, dispatch, updateActionMessage, actionId]
    );

    // 暴露方法给父组件
    useImperativeHandle(
      ref,
      () => ({
        handleStepError,
      }),
      [handleStepError]
    );

    // 计算订单总金额
    const calculateOrderAmount = useCallback(() => {
      if (!data.parameters.kol_ids?.length) return 0;

      // 如果有price_yuan参数，使用它作为基础金额，否则累加所有KOL的价格
      const baseAmount =
        data.parameters.price_yuan !== undefined
          ? data.parameters.price_yuan
          : data.parameters.kol_ids.reduce((total, kol) => total + kol.price, 0);

      let totalAmount = baseAmount;

      // 推文类型调整
      if (orderParams?.tweet_service_type_id && serviceData) {
        const selectedTweetType = serviceData.tweet_types.find(
          (type: any) => type.id === orderParams.tweet_service_type_id
        );
        if (selectedTweetType && selectedTweetType.price_rate !== 100) {
          const adjustment = baseAmount * (selectedTweetType.price_rate / 100) - baseAmount;
          totalAmount += adjustment;
        }
      }

      // 增值服务调整（支持多选）
      if (orderParams?.ext_tweet_service_type_ids && serviceData) {
        orderParams.ext_tweet_service_type_ids.forEach((extId: number) => {
          const selectedExtraService = serviceData.exts.find((ext: any) => ext.id === extId);
          if (selectedExtraService) {
            const extraAmount = baseAmount * (selectedExtraService.price_rate / 100);
            totalAmount += extraAmount;
          }
        });
      }

      return totalAmount.toFixed(2);
    }, [data.parameters.kol_ids, data.parameters.price_yuan, orderParams, serviceData]);

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

    // 检查授权额度是否足够
    const checkAllowance = useCallback(() => {
      if (!decimals || !allowance) return false;
      const amount = calculateOrderAmount();
      return hasEnoughAllowance(allowance, amount.toString(), Number(decimals));
    }, [decimals, allowance, calculateOrderAmount]);

    // 检查余额是否足够
    const checkBalance = useCallback(() => {
      if (!balance || !decimals) return false;
      const amount = calculateOrderAmount();
      return hasEnoughBalance(balance, amount.toString(), Number(decimals));
    }, [balance, decimals, calculateOrderAmount]);

    // 执行授权
    const handleApprove = useCallback(async () => {
      if (!decimals) return;

      try {
        writeContractApprove({
          address: getContractAddress().pay_member_token_address as `0x${string}`,
          abi: erc20Abi,
          functionName: 'approve',
          args: [getContractAddress().KOLServiceAddress as `0x${string}`, MAX256],
        });
      } catch (error) {
        console.error('授权错误:', error);
        toast.error(t('approve_failed'));
        setIsLoading(false);
      }
    }, [decimals, writeContractApprove, t]);

    // 执行issue调用
    const handleIssue = useCallback(async () => {
      if (!decimals || !address) return;

      try {
        const amount = calculateOrderAmount();
        const amountBigInt = toContractAmount(amount.toString(), Number(decimals));
        writeContractIssue({
          address: getContractAddress().KOLServiceAddress as `0x${string}`,
          abi: KOLService_abi,
          functionName: 'issue',
          args: [
            getContractAddress().pay_member_token_address as `0x${string}`,
            amountBigInt,
            address as `0x${string}`,
          ],
        });
      } catch (error) {
        console.error('调用issue方法错误:', error);
        toast.error(t('issue_failed'));
        setIsLoading(false);
      }
    }, [decimals, address, calculateOrderAmount, writeContractIssue, t]);

    // 监听授权结果
    useEffect(() => {
      // 检查action是否已被删除
      if (isActionDeletedRef.current) {
        console.log('action已被删除，跳过授权监听器');
        return;
      }

      // 检查订单是否已完成，如果完成则不执行任何操作
      const orderConfirmationData = (data as any)?.orderConfirmationData;
      if (orderConfirmationData?.status === 'completed') {
        console.log('订单已完成，跳过授权监听器');
        return;
      }

      if (isConfirmedApprove) {
        // 成功情况下检查流程状态
        if (!hasStartedFlowRef.current) {
          console.log('流程已结束，跳过授权成功处理');
          return;
        }
        // 授权成功后调用issue方法
        addStepCompletionMessage(16);
        dispatch(updateOrderStep(17));
        handleIssue();
      }
      if (isPendingApprove) {
        // 处理中状态下检查流程状态
        if (!hasStartedFlowRef.current) {
          console.log('流程已结束，跳过授权处理中状态');
          return;
        }
        setIsLoading(true);
      }

      // 错误情况下不检查流程状态，允许错误处理继续执行
      if (isErrorWaitForTransactionReceiptApprove) {
        setIsLoading(false);
        handleStepError(
          errorWaitForTransactionReceiptApprove,
          t('order_title_approve_token'),
          errorWaitForTransactionReceiptApprove?.message || t('approve_failed')
        );
      }
      if (isErrorApprove) {
        setIsLoading(false);
        handleStepError(
          errorApprove,
          t('order_title_approve_token'),
          errorApprove?.message || t('approve_failed')
        );
      }
    }, [
      isErrorApprove,
      errorApprove,
      isConfirmedApprove,
      isPendingApprove,
      isErrorWaitForTransactionReceiptApprove,
      errorWaitForTransactionReceiptApprove,
      t,
      dispatch,
      data,
    ]);

    // 监听issue方法调用结果
    useEffect(() => {
      // 检查action是否已被删除
      if (isActionDeletedRef.current) {
        console.log('action已被删除，跳过issue监听器');
        return;
      }

      // 检查订单是否已完成，如果完成则不执行任何操作
      const orderConfirmationData = (data as any)?.orderConfirmationData;
      if (orderConfirmationData?.status === 'completed') {
        console.log('订单已完成，跳过issue监听器');
        return;
      }
      console.log('issue监听器触发:', {
        actionId,
        isConfirmedIssue,
        isErrorWaitForTransactionReceiptIssue,
        isPendingIssue,
        isErrorIssue,
        issueHash,
        order,
        isLoading,
        orderConfirmationData: orderConfirmationData?.status,
      });

      if (isConfirmedIssue && issueHash && order) {
        console.log('交易确认成功，准备调用handlePay, actionId:', actionId);
        console.log('开始执行handlePay');
        addStepCompletionMessage(17);
        handlePay();
      }

      // 错误情况下不检查流程状态，允许错误处理继续执行
      if (isErrorWaitForTransactionReceiptIssue) {
        setIsLoading(false);
        handleStepError(
          errorWaitForTransactionReceiptIssue,
          t('order_title_wait_confirmation'),
          errorWaitForTransactionReceiptIssue?.message || t('issue_failed')
        );
      }
      if (isErrorIssue) {
        setIsLoading(false);
        handleStepError(
          errorIssue,
          t('order_title_initiate_transaction'),
          errorIssue?.message || t('issue_failed')
        );
      }
    }, [
      isErrorIssue,
      errorIssue,
      isConfirmedIssue,
      isPendingIssue,
      isErrorWaitForTransactionReceiptIssue,
      errorWaitForTransactionReceiptIssue,
      t,
      dispatch,
      data,
      issueHash,
      order,
      isLoading,
      actionId,
    ]);

    // 添加步骤完成提示
    const addStepCompletionMessage = useCallback(
      (stepId: number) => {
        const currentStep = STEPS_CONFIG.find((step) => step.id === stepId);
        if (currentStep && currentStep.thinkingMessages.length > 1 && stepStartTime > 0) {
          const elapsedTime = Math.round((Date.now() - stepStartTime) / 1000);
          let completionMessage = `${currentStep.thinkingMessages[1]} ${t(
            'order_step_completion_time',
            {
              time: elapsedTime,
            }
          )}`;

          // 添加具体的详细信息
          let detailInfo = '';

          // 根据不同步骤添加详细信息
          switch (stepId) {
            case 0: // 登录检查完成
              if (data.parameters.kol_ids && data.parameters.kol_ids.length > 0) {
                const kolCount = data.parameters.kol_ids.length;
                const baseAmount =
                  data.parameters.price_yuan !== undefined
                    ? data.parameters.price_yuan
                    : data.parameters.kol_ids.reduce((total, kol) => total + kol.price, 0);
                detailInfo = ` - ${t('kol_count_and_amount', { count: kolCount, amount: baseAmount.toFixed(2) })}`;
              }
              break;

            case 1: // 项目列表获取完成
              break;

            case 1.5: // 项目选择完成
              if (orderParams?.project_id && projects.length > 0) {
                const selectedProject = projects.find(
                  (p) => p.id.toString() === orderParams.project_id
                );
                if (selectedProject) {
                  detailInfo = ` - ${t('selected_project', { name: selectedProject.name })}`;
                }
              }
              break;

            case 2: // 创建项目完成
              if (orderParams?.project_name) {
                detailInfo = ` - ${t('project_name_created', { name: orderParams.project_name })}`;
              }
              break;

            case 3: // 推文类型选择完成
              if (orderParams?.tweet_service_type_id && serviceData) {
                const selectedTweetType = serviceData.tweet_types.find(
                  (type: any) => type.id === orderParams.tweet_service_type_id
                );
                if (selectedTweetType) {
                  const typeName =
                    locale === 'zh' ? selectedTweetType.name.zh : selectedTweetType.name.en;
                  detailInfo = ` - ${t('selected_tweet_type', { type: typeName })}`;
                }
              }
              break;

            case 4: // 增值服务选择完成
              if (
                orderParams?.ext_tweet_service_type_ids &&
                orderParams.ext_tweet_service_type_ids.length > 0 &&
                serviceData
              ) {
                const selectedServices = orderParams.ext_tweet_service_type_ids
                  .map((extId) => serviceData.exts.find((ext) => ext.id === extId))
                  .filter(Boolean)
                  .map((service) => (locale === 'zh' ? service.name.zh : service.name.en));
                if (selectedServices.length > 0) {
                  const servicesList = selectedServices.join(locale === 'zh' ? '、' : ', ');
                  detailInfo = ` - ${t('selected_extra_services', { services: servicesList })}`;
                } else {
                  detailInfo = ` - ${t('no_extra_services')}`;
                }
              } else {
                detailInfo = ` - ${t('no_extra_services')}`;
              }
              break;

            case 5: // 图片上传完成
              if (uploadedImages.length > 0) {
                detailInfo = ` - ${t('uploaded_images_count', { count: uploadedImages.length })}`;
              }
              break;

            case 6: // 宣传材料填写完成
              if (orderParams?.promotional_materials) {
                const content = orderParams.promotional_materials;
                const preview = content.length > 30 ? content.substring(0, 30) + '...' : content;
                detailInfo = ` - ${t('promotional_content_preview', { preview })}`;
              }
              break;

            case 7: // 推广时间设置完成
              if (orderParams?.promotional_start_at && orderParams?.promotional_end_at) {
                detailInfo = ` - ${t('promotion_period', { start: orderParams.promotional_start_at, end: orderParams.promotional_end_at })}`;
              }
              break;

            case 8: // 金额计算完成
              const totalAmount = calculateOrderAmount();
              if (totalAmount) {
                detailInfo = ` - ${t('order_total_amount', { amount: totalAmount })}`;
              }
              break;

            case 9: // 订单验证完成
              const validationAmount = calculateOrderAmount();
              let validationSummary = '';
              if (orderParams?.project_id && projects.length > 0) {
                const project = projects.find((p) => p.id.toString() === orderParams.project_id);
                validationSummary += `${t('project_label')}：${project?.name}`;
              }
              if (orderParams?.tweet_service_type_id && serviceData) {
                const tweetType = serviceData.tweet_types.find(
                  (t) => t.id === orderParams.tweet_service_type_id
                );
                if (tweetType) {
                  const typeName = locale === 'zh' ? tweetType.name.zh : tweetType.name.en;
                  const separator = locale === 'zh' ? '，' : ', ';
                  validationSummary += `${separator}${t('tweet_type_label')}：${typeName}`;
                }
              }
              if (validationAmount) {
                const separator = locale === 'zh' ? '，' : ', ';
                validationSummary += `${separator}${t('order_amount_label')}：$${validationAmount}`;
              }
              if (validationSummary) {
                detailInfo = ` - ${t('validation_summary', { summary: validationSummary })}`;
              }
              break;

            case 11: // 网络检查完成
              if (chainId) {
                const networkName = t('chat_step_chain_id', { chainId });
                detailInfo = ` - ${t('current_network', { network: networkName })}`;
              }
              break;

            case 12: // 余额检查完成
              if (balance && decimals && symbol) {
                const balanceFormatted = (Number(balance) / Math.pow(10, Number(decimals))).toFixed(
                  4
                );
                detailInfo = ` - ${t('current_balance', { balance: balanceFormatted, symbol })}`;
              }
              break;

            case 13: // 授权检查完成
              if (allowance && decimals && symbol) {
                const allowanceFormatted = (
                  Number(allowance) / Math.pow(10, Number(decimals))
                ).toFixed(4);
                detailInfo = ` - ${t('current_allowance', { allowance: allowanceFormatted, symbol })}`;
              }
              break;

            case 10: // 订单创建完成
              if (order) {
                detailInfo = ` - ${t('order_number_created', { orderNo: order })}`;
              }
              break;

            case 14: // 代币授权完成
              if (symbol) {
                detailInfo = ` - ${t('token_approved', { symbol })}`;
              }
              break;

            case 15: // 交易发起完成
              const orderAmount = calculateOrderAmount();
              if (orderAmount) {
                detailInfo = ` - ${t('transaction_amount', { amount: orderAmount })}`;
              }
              break;

            case 16: // 等待交易确认完成
              if (issueHash) {
                const shortHash = `${issueHash.substring(0, 6)}...${issueHash.substring(issueHash.length - 4)}`;
                detailInfo = ` - ${t('transaction_hash_short', { hash: shortHash })}`;
              }
              break;

            case 17: // 提交支付完成
              const paymentAmount = calculateOrderAmount();
              if (paymentAmount) {
                detailInfo = ` - ${t('chat_step_payment_amount', { amount: paymentAmount })}`;
              }
              break;

            case 18: // 订单完成
              if (order) {
                const finalAmount = calculateOrderAmount();
                detailInfo = ` - ${t('order_completed', { orderNo: order, amount: finalAmount })}`;
              }
              break;
          }

          completionMessage += detailInfo;

          dispatch(
            addOrderThinkingMessage({
              stepId: stepId,
              message: completionMessage,
            })
          );
        }
      },
      [
        stepStartTime,
        dispatch,
        orderParams,
        projects,
        serviceData,
        locale,
        uploadedImages,
        calculateOrderAmount,
        balance,
        decimals,
        symbol,
        allowance,
        issueHash,
        order,
        chainId,
      ]
    );

    // 保存订单信息到消息缓存
    const saveOrderInfoToMessageCache = useCallback(async () => {
      try {
        // 将订单确认信息保存到action消息的缓存中
        const orderConfirmationData = {
          status: 'completed',
          orderData: (orderParams as any)?.order_data,
          orderNo: order,
          orderId: orderId,
          issueHash: issueHash,
          finalAmount: calculateOrderAmount(),
          projectInfo: projects.find((p) => p.id.toString() === orderParams?.project_id),
          tweetTypeInfo: serviceData?.tweet_types.find(
            (t) => t.id === orderParams?.tweet_service_type_id
          ),
          extraServiceInfos:
            orderParams?.ext_tweet_service_type_ids
              ?.map((extId) => serviceData?.exts.find((e) => e.id === extId))
              .filter(Boolean) || [],
          promotionalMaterials: orderParams?.promotional_materials,
          promotionalStartAt: orderParams?.promotional_start_at,
          promotionalEndAt: orderParams?.promotional_end_at,
          uploadedImages: uploadedImages,
          completedAt: Date.now(),
        };

        // 更新action消息的内容，添加orderConfirmationData字段
        const updatedContent = {
          ...data,
          orderConfirmationData: orderConfirmationData,
        };

        // 更新action消息
        console.log('调用updateActionMessage前，updatedContent:', updatedContent);
        console.log('调用updateActionMessage前，actionId:', actionId);
        await updateActionMessage(actionId, updatedContent);

        console.log('订单信息已保存到消息缓存');
      } catch (error) {
        console.error('保存订单信息到消息缓存失败:', error);
      }
    }, [
      orderParams,
      order,
      orderId,
      issueHash,
      calculateOrderAmount,
      projects,
      serviceData,
      uploadedImages,
      data,
      actionId,
      updateActionMessage,
    ]);

    // 恢复执行状态（用于重试操作）
    const restoreExecutionState = useCallback(
      (executionState: any) => {
        console.log('开始恢复执行状态:', executionState);

        try {
          // 恢复 Redux 状态
          if (executionState.orderStep !== undefined) {
            dispatch(startOrderProcessing({ kol_ids: executionState.orderParams?.kol_ids || [] }));
            dispatch(updateOrderStep(executionState.orderStep));
          }

          if (executionState.orderParams) {
            Object.keys(executionState.orderParams).forEach((key) => {
              dispatch(updateOrderParams({ key, value: executionState.orderParams[key] }));
            });
          }

          // 恢复 thinking 消息
          if (executionState.orderThinkingMessages) {
            dispatch(clearOrderThinkingMessages());
            executionState.orderThinkingMessages.forEach((stepMessages: any) => {
              stepMessages.messages.forEach((message: string) => {
                dispatch(addOrderThinkingMessage({ stepId: stepMessages.stepId, message }));
              });
            });
          }

          // 恢复组件本地状态
          if (executionState.serviceData) {
            setServiceData(executionState.serviceData);
          }

          if (executionState.projects) {
            setProjects(executionState.projects);
          }

          if (executionState.uploadedImages) {
            setUploadedImages(executionState.uploadedImages);
          }

          if (executionState.order) {
            setOrder(executionState.order);
          }

          if (executionState.orderId) {
            setOrderId(executionState.orderId);
          }

          if (executionState.needApprove !== undefined) {
            setNeedApprove(executionState.needApprove);
          }

          if (executionState.isWrongChain !== undefined) {
            setIsWrongChain(executionState.isWrongChain);
          }

          console.log('执行状态恢复完成，当前步骤:', executionState.orderStep);

          // 延迟一小段时间，让状态更新完成，然后从当前步骤继续执行
          setTimeout(() => {
            if (!isActionDeletedRef.current) {
              console.log('从步骤', executionState.orderStep, '继续执行');
              // 根据当前步骤决定下一步操作
              const currentStep = executionState.orderStep;

              // 如果是失败在需要用户交互的步骤，不自动继续
              const interactiveSteps = [1.5, 2, 3, 4, 5, 6, 7]; // 需要用户交互的步骤
              if (interactiveSteps.includes(currentStep)) {
                console.log('当前步骤需要用户交互，不自动继续执行');
                return;
              }

              // 如果是自动执行的步骤，重新触发执行
              // 通过更新步骤时间来触发 useEffect 中的自动执行逻辑
              setStepStartTime(Date.now());
            }
          }, 500);
        } catch (error) {
          console.error('恢复执行状态失败:', error);
          // 如果恢复失败，降级到从头开始执行
          console.log('恢复状态失败，从头开始执行');
          dispatch(clearOrderThinkingMessages());
          setTimeout(() => {
            if (!isActionDeletedRef.current) {
              // 从头开始执行，重新触发流程
              hasStartedFlowRef.current = false;
              window.location.reload(); // 简单重新加载页面来重新开始
            }
          }, 0);
        }
      },
      [dispatch]
    );

    // 处理支付
    const handlePay = async () => {
      console.log('handlePay函数被调用:', {
        actionId,
        issueHash,
        order,
        isLoading,
        isPayingRef: isPayingRef.current,
        orderConfirmationData: (data as any)?.orderConfirmationData?.status,
      });

      // 检查action是否已被删除
      if (isActionDeletedRef.current) {
        console.log('action已被删除，跳过支付处理');
        return;
      }

      if (!issueHash) {
        console.log('issueHash为空，退出handlePay');
        return;
      }

      if (!order) {
        console.log('order为空，退出handlePay');
        return;
      }

      // 检查是否已经完成支付，避免重复调用
      if ((data as any)?.orderConfirmationData?.status === 'completed') {
        console.log('订单已完成，跳过支付API调用');
        return;
      }

      // 使用actionId作为唯一标识符，防止多个action组件之间的交叉调用
      const paymentKey = `payment_${actionId}`;
      const currentPayingAction = sessionStorage.getItem('currentPayingAction');

      // 检查是否有其他action正在支付
      if (currentPayingAction && currentPayingAction !== actionId) {
        console.log('其他action正在支付，跳过当前action的支付调用');
        return;
      }

      // 检查是否正在处理支付，避免重复调用
      if (isPayingRef.current) {
        console.log('正在处理支付，跳过重复调用');
        return;
      }

      // 检查是否正在处理中，避免重复调用
      if (isLoading) {
        console.log('正在处理支付，跳过重复调用');
        return;
      }

      // 检查是否已经支付过这个action
      const alreadyPaid = sessionStorage.getItem(paymentKey);
      if (alreadyPaid === 'completed') {
        console.log('这个action已经支付完成，跳过重复支付');
        return;
      }

      console.log('开始调用payOrder接口，参数:', { order, issueHash, actionId });
      try {
        isPayingRef.current = true; // 设置支付处理状态，防止重复调用
        setIsLoading(true); // 设置加载状态，防止重复调用

        // 标记当前正在支付的action
        sessionStorage.setItem('currentPayingAction', actionId);
        sessionStorage.setItem(paymentKey, 'processing');

        const pay: any = await payOrder(order, issueHash);
        console.log('payOrder接口返回结果:', pay);

        if (pay.result !== 'success') {
          throw new Error(pay.msg || t('payment_failed'));
        }

        console.log('payOrder接口调用成功，开始保存订单信息');
        // payOrder接口调用成功后，保存订单信息到消息缓存
        console.log('调用saveOrderInfoToMessageCache前，当前data:', data);
        console.log('调用saveOrderInfoToMessageCache前，actionId:', actionId);
        console.log('调用saveOrderInfoToMessageCache前，currentChatCid:', currentChatCid);
        await saveOrderInfoToMessageCache();

        console.log('订单信息保存完成，显示成功消息');

        // 标记支付完成
        sessionStorage.setItem(paymentKey, 'completed');
        sessionStorage.removeItem('currentPayingAction');

        // 首先重置所有状态标志，防止重新触发流程
        isPayingRef.current = false;
        hasStartedFlowRef.current = false;

        // 立即结束订单处理流程
        dispatch(completeOrderProcessing());
        dispatch(clearOrderThinkingMessages());
        setIsLoading(false);
        addStepCompletionMessage(18);

        // 操作完成后打开邮箱绑定弹窗
        setTimeout(() => {
          if (!email.includes('@')) {
            setShowBindEmailDialog(true);
          }
        }, 1000);

        console.log('支付流程完成，订单处理已结束');
      } catch (error) {
        console.error('payOrder接口调用失败:', error);
        setIsLoading(false);

        // 清除支付标记
        sessionStorage.removeItem(paymentKey);
        sessionStorage.removeItem('currentPayingAction');

        // 只有在还没有处理错误的情况下才调用 handleStepError
        if (isPayingRef.current) {
          isPayingRef.current = false; // 重置支付状态
          await handleStepError(
            error,
            t('submit_payment_step_name'),
            t('order_error_submit_payment')
          );
        }
      } finally {
        // 无论成功还是失败，都重置支付状态
        isPayingRef.current = false;
      }
    };

    // 开始下单流程或恢复重试状态
    useEffect(() => {
      // 检查action是否已被删除
      if (isActionDeletedRef.current) {
        console.log('action已被删除，跳过流程启动');
        return;
      }

      // 检查是否已经完成订单
      const orderConfirmationData = (data as any)?.orderConfirmationData;
      const isOrderCompleted = orderConfirmationData?.status === 'completed';
      const isRetry = (data as any)?.isRetry;
      const retryExecutionState = (data as any)?.retryExecutionState;

      if (
        data.function_name === 'project_order' &&
        !isOrderProcessing &&
        !hasStartedFlowRef.current &&
        !isOrderCompleted // 如果订单已完成，不要重新开始流程
      ) {
        if (isRetry && retryExecutionState) {
          console.log('检测到重试操作，恢复之前的执行状态');
          hasStartedFlowRef.current = true; // 标记已开始流程

          // 恢复之前的状态
          setTimeout(() => {
            if (!isActionDeletedRef.current) {
              restoreExecutionState(retryExecutionState);
            }
          }, 0);
        } else {
          console.log('开始下单流程（从第0步开始）');
          hasStartedFlowRef.current = true; // 标记已开始流程

          // 确保从第0步开始，清空之前的思考消息
          dispatch(clearOrderThinkingMessages());
          // 使用setTimeout确保dispatch完成后再执行startOrderFlow
          setTimeout(() => {
            // 再次检查action是否已被删除
            if (!isActionDeletedRef.current) {
              startOrderFlow();
            }
          }, 0);
        }
      }
    }, [data, isOrderProcessing]);

    // 组件初始化时重置状态
    useEffect(() => {
      console.log('OrderDoing组件初始化，actionId:', actionId);
      // 重置执行状态，确保刷新后能正常重新开始
      isErrorHandlingRef.current = false;
      isPayingRef.current = false;
      hasStartedFlowRef.current = false; // 确保刷新页面后重置流程启动标志

      // 对于新的action消息，初始化isActionDeletedRef为false
      // 这样可以确保新创建的action能正常执行
      isActionDeletedRef.current = false;
      console.log('初始化isActionDeletedRef为false，action可以正常执行');

      // 检查是否已经完成订单
      const orderConfirmationData = (data as any)?.orderConfirmationData;
      const isOrderCompleted = orderConfirmationData?.status === 'completed';

      // 如果订单未完成，且有订单状态，清空Redux中的订单状态，从第0步重新开始
      if (data.function_name === 'project_order' && !isOrderCompleted && isOrderProcessing) {
        console.log('刷新页面检测到进行中的订单，重置到第0步');
        dispatch(completeOrderProcessing());
      }
    }, [actionId]); // 依赖actionId，确保每个新的action都会重新初始化

    // 监听chat_cid变化，当切换对话时重置hasStartedFlowRef
    useEffect(() => {
      console.log('chat_cid变化，重置hasStartedFlowRef和isPayingRef');
      hasStartedFlowRef.current = false;
      isPayingRef.current = false;
      isActionDeletedRef.current = false;

      // 清除当前action的支付标记
      const paymentKey = `payment_${actionId}`;
      const currentPayingAction = sessionStorage.getItem('currentPayingAction');
      if (currentPayingAction === actionId) {
        sessionStorage.removeItem('currentPayingAction');
      }
      sessionStorage.removeItem(paymentKey);
    }, [currentChatCid, actionId]);

    // 当isOrderProcessing变为false时，重置hasStartedFlowRef
    useEffect(() => {
      if (!isOrderProcessing) {
        hasStartedFlowRef.current = false;
        isPayingRef.current = false;
      }
    }, [isOrderProcessing]);

    // 组件卸载时清理sessionStorage
    useEffect(() => {
      return () => {
        // 清除当前action的支付标记
        const paymentKey = `payment_${actionId}`;
        const currentPayingAction = sessionStorage.getItem('currentPayingAction');
        if (currentPayingAction === actionId) {
          sessionStorage.removeItem('currentPayingAction');
        }
        sessionStorage.removeItem(paymentKey);

        // 注意：不要设置 isActionDeletedRef.current = true
        // 因为页面刷新时组件会卸载然后重新挂载，我们希望重新挂载时能正常执行
      };
    }, [actionId]);

    // 记录步骤开始时间
    useEffect(() => {
      if (isOrderProcessing && (orderStep || 0) > 0) {
        setStepStartTime(Date.now());
        // 更新是否可以返回上一步
        setCanGoBack((orderStep || 0) > 1);
      }
    }, [orderStep, isOrderProcessing]);

    // 从Redux状态恢复已上传的图片
    useEffect(() => {
      if (orderParams?.medias && Array.isArray(orderParams.medias)) {
        setUploadedImages(orderParams.medias);
      }
    }, [orderParams?.medias]);

    // 监听思考消息变化，自动滚动到底部
    useEffect(() => {
      if (thinkingScrollRef.current && orderThinkingMessages && orderThinkingMessages.length > 0) {
        const scrollElement = thinkingScrollRef.current;
        // 使用 requestAnimationFrame 确保DOM更新后再滚动
        requestAnimationFrame(() => {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        });
      }
    }, [orderThinkingMessages]);

    // 显示当前步骤的思考消息
    useEffect(() => {
      // 检查action是否已被删除
      if (isActionDeletedRef.current) {
        console.log('action已被删除，跳过思考消息显示');
        return;
      }

      // 检查订单是否已完成，如果完成则不执行任何操作
      const orderConfirmationData = (data as any)?.orderConfirmationData;
      if (orderConfirmationData?.status === 'completed') {
        console.log('订单已完成，跳过思考消息显示');
        return;
      }

      if (isOrderProcessing && orderStep !== undefined && orderStep > 0) {
        const currentStep = STEPS_CONFIG.find((step) => step.id === orderStep);
        if (currentStep) {
          const existingStep = orderThinkingMessages?.find(
            (step) => step.stepId === currentStep.id
          );
          if (!existingStep) {
            // 延迟显示思考消息，模拟逐步执行
            setTimeout(() => {
              dispatch(
                addOrderThinkingMessage({
                  stepId: currentStep.id,
                  message: currentStep.thinkingMessages[0],
                })
              );
            }, 100);
          }
        }
      }
    }, [orderStep, isOrderProcessing, orderThinkingMessages, data]);

    // 监听步骤变化，自动触发相应的执行函数
    useEffect(() => {
      // 检查action是否已被删除
      if (isActionDeletedRef.current) {
        console.log('action已被删除，跳过步骤自动执行');
        return;
      }

      // 检查订单是否已完成，如果完成则不执行任何操作
      const orderConfirmationData = (data as any)?.orderConfirmationData;
      if (orderConfirmationData?.status === 'completed') {
        console.log('订单已完成，跳过步骤自动执行');
        return;
      }

      if (!isOrderProcessing || !orderStep) return;

      // 防止重复调用
      const timeoutId = setTimeout(() => {
        // 自动执行的步骤
        if (orderStep === 0) {
          // 步骤0: 检查登录状态（已在startOrderFlow中处理）
          // 这里不需要额外处理
        } else if (orderStep === 1) {
          // 步骤1: 获取项目列表（包括返回时重新执行）
          reFetchProjects();
        } else if (orderStep === 9) {
          // 步骤9: 验证订单
          validateAndProceed();
        } else if (orderStep === 10) {
          // 步骤10: 创建订单
          createOrderAndProceed();
        } else if (orderStep === 11) {
          // 步骤11: 检查网络连接
          checkChainAndProceed();
        } else if (orderStep === 12) {
          // 步骤12: 检查代币余额
          checkBalanceAndProceed();
        } else if (orderStep === 13) {
          // 步骤13: 检查授权额度
          checkAllowanceAndProceed();
        } else if (orderStep === 14) {
          // 步骤14: 授权代币
          approveAndProceed();
        } else if (orderStep === 15) {
          // 步骤15: 发起交易
          issueAndProceed();
        } else if (orderStep === 16) {
          // 步骤16: 等待交易确认（由useEffect监听处理）
          // 这里不需要额外处理，由监听器自动处理
        }
      }, 1000); // 等待思考消息显示

      return () => clearTimeout(timeoutId);
    }, [orderStep, isOrderProcessing, data]);

    // 重新获取项目列表
    const reFetchProjects = async () => {
      try {
        console.log('重新获取项目列表');
        setIsLoading(true);

        await new Promise((resolve) => setTimeout(resolve, 1000));
        const projectRes: any = await getProjectList({ page: 1, size: 9999 });
        console.log('项目列表获取结果:', projectRes);

        if (projectRes.code === 200) {
          setProjects(projectRes.data.list);

          // 如果没有项目，进入创建项目步骤
          if (projectRes.data.list.length === 0) {
            console.log('没有项目，进入创建项目步骤');
            addStepCompletionMessage(1);
            dispatch(updateOrderStep(2));
            return;
          } else {
            // 如果有项目，进入项目选择步骤
            console.log('有项目，进入项目选择步骤');
            addStepCompletionMessage(1);
            dispatch(updateOrderStep(1.5)); // 使用1.5表示项目选择步骤
            return;
          }
        }
      } catch (error) {
        await handleStepError(
          error,
          t('order_title_fetch_projects'),
          t('order_error_fetch_projects')
        );
      } finally {
        setIsLoading(false);
      }
    };

    const startOrderFlow = async () => {
      try {
        console.log('startOrderFlow 开始执行');

        // 检查action是否已被删除
        if (isActionDeletedRef.current) {
          console.log('action已被删除，跳过流程执行');
          return;
        }

        // 检查是否已经完成订单
        const orderConfirmationData = (data as any)?.orderConfirmationData;
        if (orderConfirmationData?.status === 'completed') {
          console.log('订单已完成，跳过流程执行');
          return;
        }

        setIsLoading(true);

        if (hasStartedFlowRef.current) {
          console.log('订单流程已开始，跳过步骤0');
          return;
        }

        // 检查KOL查找结果
        const { has, miss, kol_ids } = data.parameters;

        // 如果没有找到任何KOL（kol_ids为空），不执行下单操作
        if (!kol_ids || kol_ids.length === 0) {
          let message = t('order_error_cannot_create');

          if (has && has.length > 0) {
            message += t('order_error_found_kols') + has.join('、') + '，';
          }

          if (miss && miss.length > 0) {
            message += t('order_error_missing_kols') + miss.join('、') + '。';
          } else {
            message += t('order_error_no_kols');
          }

          message += t('order_error_reselect_kols');

          await handleStepError(null, t('kol_search_step_name'), message);
          return;
        }

        // 提取kol_ids中的id数组
        const kolIds = kol_ids.map((kol) => kol.id);
        dispatch(startOrderProcessing({ kol_ids: kolIds }));

        // 清空之前的thinking消息
        dispatch(clearOrderThinkingMessages());

        // 步骤-1: 如果有未找到的KOL，显示KOL查找结果
        // 注意：只有在有找到KOL的情况下才显示此步骤，避免与上面的错误处理重复
        if (miss && miss.length > 0 && kol_ids && kol_ids.length > 0) {
          console.log('执行步骤-1: 显示KOL查找结果');
          dispatch(updateOrderStep(-1));
          setStepStartTime(Date.now());

          let message = t('order_notice');

          if (has && has.length > 0) {
            message += t('order_notice_found_kols') + has.join('、') + '，';
          }

          message +=
            t('order_notice_missing_kols') + miss.join('、') + '。' + t('order_notice_continue');

          // 添加到thinking消息中
          dispatch(
            addOrderThinkingMessage({
              stepId: -1,
              message: message,
            })
          );
        }

        // 步骤0: 检查登录状态
        console.log('执行步骤0: 检查登录状态');
        dispatch(updateOrderStep(0));
        // 设置步骤开始时间
        setStepStartTime(Date.now());

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 检查登录状态
        if (!isLogin || !isConnected) {
          // 直接返回str消息，提示用户登录
          await handleStepError(null, 'not_logged_in', t('order_error_login_required'));
          return;
        }

        // 已登录且已连接
        addStepCompletionMessage(0);
        dispatch(updateOrderStep(1));
      } catch (error) {
        console.error('下单流程启动失败:', error);
        await handleStepError(error, t('order_flow_start_step_name'), t('order_flow_start_failed'));
      } finally {
        setIsLoading(false);
      }
    };

    const handleParameterChange = (key: string, value: any) => {
      dispatch(updateOrderParams({ key, value }));
    };

    // 处理图片上传
    const handleImageUpload = async (file: File) => {
      // 根据推文类型确定最大图片数量
      const maxImages =
        orderParams?.tweet_service_type_id === 7
          ? 4
          : orderParams?.tweet_service_type_id === 8
            ? 5
            : 4;

      if (uploadedImages.length >= maxImages) {
        toast.error(t('max_images_allowed', { count: maxImages }));
        return;
      }

      // 验证文件类型
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(t('image_format_validation_error'));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('image_size_limit_5mb'));
        return;
      }

      try {
        setIsUploading(true);

        const response: any = await uploadImage({ file });
        if (response.code === 200) {
          const newImages = [...uploadedImages, response.data.url];
          setUploadedImages(newImages);
          handleParameterChange('medias', newImages);
          toast.success(t('image_upload_success'));
        } else {
          toast.error(response.msg || t('image_upload_failed'));
        }
      } catch (error) {
        console.error('图片上传失败:', error);
        toast.error(t('image_upload_failed'));
      } finally {
        setIsUploading(false);
      }
    };

    // 删除图片
    const handleRemoveImage = (index: number) => {
      const newImages = uploadedImages.filter((_, i) => i !== index);
      setUploadedImages(newImages);
      handleParameterChange('medias', newImages);
    };

    // 处理logo上传
    const handleLogoUpload = async (file: File) => {
      try {
        setIsUploading(true);

        // 验证文件类型
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          toast.error(t('image_format_validation_error'));
          return;
        }

        // 验证文件大小（限制为 5MB）
        if (file.size > 5 * 1024 * 1024) {
          toast.error(t('image_size_validation_error'));
          return;
        }

        // 上传图片
        const response: any = await uploadImage({ file });
        if (response.code === 200) {
          const imageUrl = response.data.url;

          // 保存到Redux状态
          handleParameterChange('project_icon', imageUrl);

          toast.success(t('logo_upload_success'));
        } else {
          toast.error(response.msg || t('logo_upload_failed'));
        }
      } catch (error) {
        console.error('Logo上传失败:', error);
        toast.error(t('logo_upload_retry'));
      } finally {
        setIsUploading(false);
      }
    };

    // 处理从推文获取项目信息
    const handleGetTweetInfo = async () => {
      try {
        const tweetUrl = orderParams?.project_tweet_url?.trim();
        if (!tweetUrl) {
          toast.error(t('tweet_link_required'));
          return;
        }

        setIsLoading(true);
        const response: any = await getTweetInfoByUrl({ tweet_link: tweetUrl });

        if (response.code === 200) {
          const data = response.data;
          if (data.name) handleParameterChange('project_name', data.name);
          if (data.icon) handleParameterChange('project_icon', data.icon);
          if (data.description) handleParameterChange('project_description', data.description);
          if (data.website || tweetUrl)
            handleParameterChange('project_website', data.website || tweetUrl);

          toast.success(t('project_info_get_success'));
        } else {
          toast.error(response.msg || t('project_info_get_failed'));
        }
      } catch (error) {
        console.error('获取推文信息失败:', error);
        toast.error(t('project_info_get_retry'));
      } finally {
        setIsLoading(false);
      }
    };

    // 处理文件选择
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        // 检查是否是在创建项目步骤中的logo上传
        if ((orderStep || 0) === 2) {
          handleLogoUpload(file);
        } else {
          // 其他情况使用原来的图片上传
          handleImageUpload(file);
        }
      }
      // 清空input值，允许重复选择同一文件
      event.target.value = '';
    };

    // 返回上一步
    const handleGoBack = useCallback(() => {
      if (!canGoBack) return;

      const currentStep = orderStep || 0;
      let prevStep = 0;

      // 清除当前步骤的思考消息
      dispatch(clearStepThinkingMessages(currentStep));

      // 根据当前步骤和状态确定上一步
      if (currentStep === 1.5) {
        // 从项目选择步骤返回，重新执行第一步
        prevStep = 1;
      } else if (currentStep === 2) {
        // 从创建项目步骤返回，执行第一步
        prevStep = 1;
      } else if (currentStep === 3) {
        // 从推文类型选择步骤返回，需要判断是否有项目列表
        if (projects.length > 0) {
          // 有项目列表，返回到项目选择步骤
          prevStep = 1.5;
        } else {
          // 没有项目列表，返回到创建项目步骤
          prevStep = 2;
        }
      } else if (currentStep === 4) {
        // 从增值服务选择步骤返回，返回到推文类型选择
        prevStep = 3;
      } else if (currentStep === 5) {
        // 从图片上传步骤返回，返回到增值服务选择
        prevStep = 4;
      } else if (currentStep === 6) {
        // 从宣传材料填写步骤返回，需要判断推文类型
        const selectedTweetType = orderParams?.tweet_service_type_id;
        if (selectedTweetType === 7 || selectedTweetType === 8) {
          // 推文类型是7或8，返回到图片上传步骤
          prevStep = 5;
        } else {
          // 推文类型不是7或8，返回到增值服务选择步骤
          prevStep = 4;
        }
      } else if (currentStep === 7) {
        // 从时间设置步骤返回，返回到宣传材料填写
        prevStep = 6;
      } else if (currentStep === 8) {
        // 从金额计算步骤返回，返回到时间设置
        prevStep = 7;
      } else if (currentStep === 10) {
        // 从验证订单步骤返回，返回到金额计算
        prevStep = 8;
      } else if (currentStep === 11) {
        // 从创建订单步骤返回，返回到验证订单
        prevStep = 10;
      } else if (currentStep === 12) {
        // 从检查登录状态步骤返回，返回到创建订单
        prevStep = 11;
      } else if (currentStep === 13) {
        // 从检查网络连接步骤返回，返回到检查登录状态
        prevStep = 12;
      } else if (currentStep === 14) {
        // 从检查代币余额步骤返回，返回到检查网络连接
        prevStep = 13;
      } else if (currentStep === 15) {
        // 从检查授权额度步骤返回，返回到检查代币余额
        prevStep = 14;
      } else if (currentStep === 16) {
        // 从授权代币步骤返回，返回到检查授权额度
        prevStep = 15;
      } else if (currentStep === 17) {
        // 从发起交易步骤返回，返回到授权代币或检查授权额度
        if (needApprove) {
          prevStep = 16;
        } else {
          prevStep = 15;
        }
      } else if (currentStep === 18) {
        // 从等待交易确认步骤返回，返回到发起交易
        prevStep = 17;
      } else if (currentStep > 19) {
        // 其他步骤正常返回上一步
        prevStep = currentStep - 1;
      }

      if (prevStep > 0) {
        // 清除目标步骤的思考消息，确保重新显示
        dispatch(clearStepThinkingMessages(prevStep));
        dispatch(updateOrderStep(prevStep));
      }
    }, [canGoBack, orderStep, projects.length, orderParams?.tweet_service_type_id, needApprove]);

    const handleStepComplete = () => {
      // 添加当前步骤完成提示
      addStepCompletionMessage(orderStep || 0);

      const nextStep = (orderStep || 0) + 1;

      // 如果当前是项目选择步骤，先获取服务数据再进入推文类型选择
      if ((orderStep || 0) === 1.5) {
        getServiceDataAndProceed();
        return;
      }

      // 如果当前是创建项目步骤，先创建项目
      if ((orderStep || 0) === 2) {
        createProjectAndProceed();
        return;
      }

      // 如果当前是推文类型选择步骤，直接进入下一步
      if ((orderStep || 0) === 3) {
        dispatch(updateOrderStep(4));
        return;
      }

      // 如果当前是增值服务选择步骤，检查是否需要上传图片
      if ((orderStep || 0) === 4) {
        const selectedTweetType = orderParams?.tweet_service_type_id;
        if (selectedTweetType === 7 || selectedTweetType === 8) {
          // 推文类型是7或8，需要上传图片
          dispatch(updateOrderStep(5));
        } else {
          // 推文类型不是7或8，直接进入宣传材料填写
          dispatch(updateOrderStep(6));
        }
        return;
      }

      // 如果当前是图片上传步骤，验证图片数量并进入宣传材料填写
      if ((orderStep || 0) === 5) {
        const selectedTweetType = orderParams?.tweet_service_type_id;

        // 验证图片上传要求
        if (selectedTweetType === 7 || selectedTweetType === 8) {
          const minImages = 1;
          const maxImages = selectedTweetType === 7 ? 4 : 5;

          if (uploadedImages.length === 0) {
            toast.error(`推文类型 ${selectedTweetType} 必须上传至少 ${minImages} 张图片`);
            return;
          }

          if (uploadedImages.length > maxImages) {
            toast.error(`推文类型 ${selectedTweetType} 最多只能上传 ${maxImages} 张图片`);
            return;
          }
        }

        dispatch(updateOrderStep(6));
        return;
      }

      // 如果当前是宣传材料填写步骤，进入时间设置
      if ((orderStep || 0) === 6) {
        dispatch(updateOrderStep(7));
        return;
      }

      // 如果当前是时间设置步骤，验证图片要求后进入金额计算
      if ((orderStep || 0) === 7) {
        // 最终验证推文类型7和8的图片要求
        const selectedTweetType = orderParams?.tweet_service_type_id;
        if (selectedTweetType === 7 || selectedTweetType === 8) {
          const minImages = 1;
          const maxImages = selectedTweetType === 7 ? 4 : 5;

          if (uploadedImages.length === 0) {
            toast.error(
              `推文类型 ${selectedTweetType} 必须上传至少 ${minImages} 张图片，请返回上传图片`
            );
            return;
          }

          if (uploadedImages.length > maxImages) {
            toast.error(
              `推文类型 ${selectedTweetType} 最多只能上传 ${maxImages} 张图片，请删除多余图片`
            );
            return;
          }
        }

        calculateAmountAndProceed();
        return;
      }

      // 其他步骤会自动执行，不需要在这里调用
      dispatch(updateOrderStep(nextStep));
    };

    const createProjectAndProceed = async () => {
      try {
        setIsLoading(true);
        // 设置步骤开始时间
        setStepStartTime(Date.now());

        await new Promise((resolve) => setTimeout(resolve, 1000));
        const projectData = await createNewProject({
          name: orderParams?.project_name || '',
          desc: orderParams?.project_description || '',
          website: orderParams?.project_website || '',
          icon: orderParams?.project_icon || '',
        });

        // 更新项目ID
        dispatch(updateOrderParams({ key: 'project_id', value: projectData.id }));

        // 添加步骤完成提示
        addStepCompletionMessage(2);

        // 继续下一步：获取服务数据并进入推文类型选择
        getServiceDataAndProceed();
      } catch (error) {
        await handleStepError(
          error,
          t('create_project_step_name'),
          error.message || t('order_error_create_project')
        );
      } finally {
        setIsLoading(false);
      }
    };

    const getServiceDataAndProceed = async () => {
      try {
        console.log('getServiceDataAndProceed 开始执行');
        // 获取服务数据
        setIsServiceLoading(true);
        const service = await getServiceData();
        setServiceData(service);
        setIsServiceLoading(false);
        console.log('服务数据获取完成:', service);

        // 等待状态更新
        await new Promise((resolve) => setTimeout(resolve, 100));

        // 进入推文类型选择步骤
        dispatch(updateOrderStep(3));
      } catch (error) {
        await handleStepError(
          error,
          t('get_service_data_step_name'),
          t('order_error_get_service_data')
        );
      }
    };

    const calculateAmountAndProceed = async () => {
      try {
        console.log('calculateAmountAndProceed 开始执行');
        dispatch(updateOrderStep(8));
        // 设置步骤开始时间
        setStepStartTime(Date.now());

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 计算订单金额（参照SubmitOrderForm的计算方式）
        const baseAmount = data.parameters.kol_ids.reduce((total, kol) => total + kol.price, 0);
        let totalAmount = baseAmount;

        // 推文类型调整
        if (orderParams?.tweet_service_type_id && serviceData) {
          const selectedTweetType = serviceData.tweet_types.find(
            (type: any) => type.id === orderParams.tweet_service_type_id
          );
          if (selectedTweetType && selectedTweetType.price_rate !== 100) {
            const adjustment = baseAmount * (selectedTweetType.price_rate / 100) - baseAmount;
            totalAmount += adjustment;
          }
        }

        // 增值服务调整（支持多选）
        if (orderParams?.ext_tweet_service_type_ids && serviceData) {
          orderParams.ext_tweet_service_type_ids.forEach((extId: number) => {
            const selectedExtraService = serviceData.exts.find((ext: any) => ext.id === extId);
            if (selectedExtraService) {
              const extraAmount = baseAmount * (selectedExtraService.price_rate / 100);
              totalAmount += extraAmount;
            }
          });
        }

        console.log('订单金额计算完成:', totalAmount);

        // 添加步骤完成提示
        addStepCompletionMessage(8);

        // 进入验证订单步骤
        dispatch(updateOrderStep(9));
      } catch (error) {
        await handleStepError(
          error,
          t('calculate_amount_step_name'),
          t('order_error_calculate_amount')
        );
      }
    };

    const validateAndProceed = async () => {
      try {
        // 设置步骤开始时间
        setStepStartTime(Date.now());

        await new Promise((resolve) => setTimeout(resolve, 1000));
        const errors = validateOrderParams(orderParams || {});
        if (errors.length > 0) {
          throw new Error(errors[0]);
        }

        // 添加步骤完成提示
        addStepCompletionMessage(9);

        // 继续到创建订单步骤
        dispatch(updateOrderStep(10));
      } catch (error) {
        await handleStepError(
          error,
          t('validate_params_step_name'),
          t('order_error_validate_params')
        );
      }
    };

    const createOrderAndProceed = async () => {
      try {
        setIsLoading(true);
        // 设置步骤开始时间
        setStepStartTime(Date.now());

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 使用Redux状态中的kol_ids和计算后的总金额
        const kolIds = orderParams?.kol_ids || [];
        const totalAmount = calculateOrderAmount(); // 使用计算后的总金额，包含所有调整

        console.log('创建订单参数:', {
          kolIds,
          totalAmount,
          orderParams,
        });

        const orderData = await createOrder({
          project_id: orderParams?.project_id || '1',
          kol_ids: kolIds,
          amount: totalAmount, // 使用计算后的总金额
          promotional_materials: orderParams?.promotional_materials || '',
          promotional_start_at: orderParams?.promotional_start_at || '',
          promotional_end_at: orderParams?.promotional_end_at || '',
          tweet_service_type_id: orderParams?.tweet_service_type_id || 0,
          medias: orderParams?.medias || [],
          ...(orderParams?.ext_tweet_service_type_ids &&
            orderParams.ext_tweet_service_type_ids.length > 0 && {
              ext_tweet_service_type_ids: orderParams.ext_tweet_service_type_ids,
            }),
        });

        // 保存订单数据到Redux状态
        dispatch(updateOrderParams({ key: 'order_data', value: orderData }));
        setOrder(orderData.order_no);
        setOrderId(orderData.order_id);

        // 添加步骤完成提示
        addStepCompletionMessage(11);

        // 进入检查登录状态步骤
        dispatch(updateOrderStep(12));
      } catch (error) {
        await handleStepError(
          error,
          t('create_order_step_name'),
          error.message || t('order_error_create_order')
        );
      } finally {
        setIsLoading(false);
      }
    };

    // 检查登录状态
    const checkLoginAndProceed = async () => {
      try {
        // 设置步骤开始时间
        setStepStartTime(Date.now());

        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (!isLogin) {
          await login();
          // 登录后继续下一步
          addStepCompletionMessage(12);
          dispatch(updateOrderStep(13));
          return;
        } else if (!isConnected) {
          connect();
          // 连接后继续下一步
          addStepCompletionMessage(12);
          dispatch(updateOrderStep(13));
          return;
        }

        // 已登录且已连接
        addStepCompletionMessage(12);
        dispatch(updateOrderStep(13));
      } catch (error) {
        await handleStepError(
          error,
          t('check_login_status_step_name'),
          t('order_error_check_login')
        );
      }
    };

    // 检查网络连接
    const checkChainAndProceed = async () => {
      try {
        // 设置步骤开始时间
        setStepStartTime(Date.now());

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 检查是否在正确的链上
        if (chainId && DEFAULT_CHAIN.id !== chainId) {
          throw new Error(t('wrong_chain'));
        }

        addStepCompletionMessage(13);
        dispatch(updateOrderStep(14));
      } catch (error) {
        await handleStepError(error, t('check_network_step_name'), t('order_error_check_network'));
      }
    };

    // 检查代币余额
    const checkBalanceAndProceed = async () => {
      try {
        // 设置步骤开始时间
        setStepStartTime(Date.now());

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 刷新余额
        await refetchBalance();

        const hasEnoughBalance = checkBalance();
        if (!hasEnoughBalance) {
          throw new Error(t('insufficient_balance'));
        }

        addStepCompletionMessage(14);
        dispatch(updateOrderStep(15));
      } catch (error) {
        await handleStepError(
          error,
          t('check_balance_step_name'),
          t('order_error_insufficient_balance')
        );
      }
    };

    // 检查授权额度
    const checkAllowanceAndProceed = async () => {
      try {
        // 设置步骤开始时间
        setStepStartTime(Date.now());

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 刷新授权额度
        await refetchAllowance();

        const hasEnoughAllowance = checkAllowance();
        if (!hasEnoughAllowance) {
          // 需要授权，进入授权步骤
          setNeedApprove(true);
          addStepCompletionMessage(15);
          dispatch(updateOrderStep(16));
        } else {
          // 授权足够，直接进入发起交易步骤
          addStepCompletionMessage(15);
          dispatch(updateOrderStep(17));
        }
      } catch (error) {
        await handleStepError(
          error,
          t('check_allowance_step_name'),
          t('order_error_check_allowance')
        );
      }
    };

    // 授权代币
    const approveAndProceed = async () => {
      try {
        // 设置步骤开始时间
        setStepStartTime(Date.now());

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 执行授权
        await handleApprove();

        // 授权发起后，等待监听器处理结果
        // 这里不需要手动进入下一步，由监听器自动处理
      } catch (error) {
        await handleStepError(error, t('approve_token_step_name'), t('order_error_approve_token'));
      }
    };

    // 发起交易
    const issueAndProceed = async () => {
      try {
        // 设置步骤开始时间
        setStepStartTime(Date.now());

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 执行issue调用
        await handleIssue();

        // 交易发起后，等待监听器处理结果
        // 这里不需要手动进入下一步，由监听器自动处理
      } catch (error) {
        await handleStepError(
          error,
          t('initiate_transaction_step_name'),
          t('order_error_initiate_transaction')
        );
      }
    };

    const completeOrder = async () => {
      try {
        // 设置步骤开始时间
        setStepStartTime(Date.now());

        // 添加步骤完成提示
        addStepCompletionMessage(18);

        // 等待一段时间，让用户看到步骤完成消息
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // 发送完成消息
        await sendCompletionMessage(t('order_success_complete'));

        // 不调用completeOrderProcessing，保持流程状态，停留在步骤18
        // 这样下次读取这条action消息时，会直接显示订单确认信息
      } catch (error) {
        await handleStepError(
          error,
          t('order_title_order_confirmation'),
          t('order_error_complete_order')
        );
      }
    };

    // 获取本地化文本
    const getLocalizedText = useCallback(
      (textObj: { en: string; zh: string }) => {
        return locale === 'zh' ? textObj.zh : textObj.en;
      },
      [locale]
    );

    // 检查是否已有完成的订单确认信息
    const orderConfirmationData = (data as any)?.orderConfirmationData;
    const isOrderCompleted = orderConfirmationData?.status === 'completed';

    // // 如果订单已完成，直接显示订单确认信息
    // if (isOrderCompleted && orderConfirmationData) {
    //   return (
    //     <div className="flex w-full flex-col gap-4">
    //       <div className="space-y-4">
    //         <h3 className="text-lg font-semibold">订单信息</h3>
    //         <p className="text-muted-foreground">您的订单已成功创建并支付完成</p>

    //         <div className="bg-muted space-y-3 rounded-lg p-4">
    //           <div className="flex justify-between">
    //             <span className="text-muted-foreground">项目:</span>
    //             <span>{orderConfirmationData.projectInfo?.name || '--'}</span>
    //           </div>
    //           <div className="flex justify-between">
    //             <span className="text-muted-foreground">推文类型:</span>
    //             <span>{orderConfirmationData.tweetTypeInfo?.name?.[locale] || '--'}</span>
    //           </div>
    //           {orderConfirmationData.extraServiceInfo && (
    //             <div className="flex justify-between">
    //               <span className="text-muted-foreground">增值服务:</span>
    //               <span>{orderConfirmationData.extraServiceInfo.name?.[locale] || '--'}</span>
    //             </div>
    //           )}
    //           <div className="flex justify-between">
    //             <span className="text-muted-foreground">宣传材料:</span>
    //             <span className="max-w-xs truncate">
    //               {orderConfirmationData.promotionalMaterials || '--'}
    //             </span>
    //           </div>
    //           <div className="flex justify-between">
    //             <span className="text-muted-foreground">推广时间:</span>
    //             <span>
    //               {orderConfirmationData.promotionalStartAt} 至{' '}
    //               {orderConfirmationData.promotionalEndAt}
    //             </span>
    //           </div>
    //           <div className="flex justify-between">
    //             <span className="text-muted-foreground">订单金额:</span>
    //             <span className="text-primary text-lg font-semibold">
    //               ${orderConfirmationData.finalAmount}
    //             </span>
    //           </div>
    //           <div className="flex justify-between">
    //             <span className="text-muted-foreground">支付状态:</span>
    //             <span className="font-semibold text-green-600">支付成功</span>
    //           </div>
    //           <div className="flex justify-between">
    //             <span className="text-muted-foreground">交易哈希:</span>
    //             <span className="font-mono text-sm">{orderConfirmationData.issueHash || '--'}</span>
    //           </div>
    //           <div className="flex justify-between">
    //             <span className="text-muted-foreground">完成时间:</span>
    //             <span className="text-sm">
    //               {new Date(orderConfirmationData.completedAt).toLocaleString()}
    //             </span>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   );
    // }

    // 渲染当前步骤的组件
    const currentStepComponent = useMemo(() => {
      const currentStep = STEPS_CONFIG.find((step) => step.id === (orderStep || 0));

      if (!currentStep || !currentStep.component) {
        return null;
      }

      switch (currentStep.component) {
        case 'selectProject':
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{currentStep.title}</h3>
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <span>{currentStep.description}</span>
                <span> / </span>
                <Button
                  onClick={() => {
                    // 跳转到创建项目步骤，不输出选择项目完成消息
                    dispatch(updateOrderStep(2));
                  }}
                  variant="link"
                  className="!p-0"
                >
                  {t('btn_create_new_project')}
                </Button>
              </div>

              <div
                className={cn(
                  'grid grid-cols-1 gap-4',
                  pathname.includes('chat') ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
                )}
              >
                {projects.map((project: any) => (
                  <Card
                    key={project.id}
                    className={`bg-background/45 !shadow-primary/10 cursor-pointer p-4 transition-all ${
                      orderParams?.project_id === project.id.toString() ? 'ring-primary ring-2' : ''
                    }`}
                    onClick={() => handleParameterChange('project_id', project.id.toString())}
                  >
                    <CardContent className="p-0">
                      <div className="relative flex items-center justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-md">
                            {project.icon ? (
                              <img
                                src={project.icon}
                                alt="project"
                                className="h-full w-full rounded-md object-cover"
                              />
                            ) : (
                              <span className="text-sm font-medium">{project.name[0] || 'P'}</span>
                            )}
                          </div>
                          <div className="max-w-20">
                            <div className="truncate font-medium">{project.name}</div>
                            <div
                              className="text-muted-foreground hover:text-primary cursor-pointer truncate text-sm"
                              onClick={() => {
                                window.open(project.website, '_blank');
                              }}
                            >
                              {project.website || '--'}
                            </div>
                          </div>
                        </div>
                        <Checkbox
                          className="absolute top-0 right-0"
                          checked={orderParams?.project_id === project.id.toString()}
                          onCheckedChange={() =>
                            handleParameterChange('project_id', project.id.toString())
                          }
                        />
                      </div>
                      <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                        {project.desc}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-2">
                {canGoBack && (
                  <Button onClick={handleGoBack} variant="outline" className="flex-1">
                    {t('previous_step')}
                  </Button>
                )}

                <Button
                  onClick={handleStepComplete}
                  disabled={!orderParams?.project_id}
                  className="flex-1"
                >
                  {t('next_step')}
                </Button>
              </div>
            </div>
          );

        case 'createProject':
          return (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">{currentStep.title}</h3>
                <p className="text-muted-foreground text-sm">{currentStep.description}</p>
              </div>

              <div className="space-y-6">
                {/* Tweet链接获取功能 */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <h4 className="text-sm font-medium">{t('project_tweet_link')}</h4>
                  </div>
                  <p className="text-muted-foreground text-sm">{t('project_tweet_link_desc')}</p>
                  <div className="flex gap-2">
                    <Input
                      value={orderParams?.project_tweet_url || ''}
                      onChange={(e) => handleParameterChange('project_tweet_url', e.target.value)}
                      placeholder="https://x.com/xxxx"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleGetTweetInfo}
                      disabled={isLoading || !orderParams?.project_tweet_url?.trim()}
                      size="sm"
                    >
                      {isLoading ? <Loader2 className="size-4 animate-spin" /> : t('get_info')}
                    </Button>
                  </div>
                </div>

                {/* 项目网站 */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <i className="text-red-500">*</i>
                    <h4 className="ml-1 text-sm font-medium">{t('project_website')}</h4>
                  </div>
                  <div className="relative">
                    <Input
                      value={orderParams?.project_website || ''}
                      onChange={(e) => handleParameterChange('project_website', e.target.value)}
                      placeholder="https://www.example.com"
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-sm text-red-500">
                    {!orderParams?.project_website?.trim() && t('project_website_required')}
                  </p>
                </div>

                {/* 项目名称 */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <i className="text-red-500">*</i>
                    <h4 className="ml-1 text-sm font-medium">{t('project_name')}</h4>
                  </div>
                  <div className="relative">
                    <Input
                      value={orderParams?.project_name || ''}
                      onChange={(e) => handleParameterChange('project_name', e.target.value)}
                      maxLength={32}
                      placeholder={t('please_enter_project_name')}
                      disabled={isLoading}
                    />
                    <p className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm">
                      {(orderParams?.project_name || '').length} / 32
                    </p>
                  </div>
                  <p className="text-sm text-red-500">
                    {!orderParams?.project_name?.trim() && t('project_name_required')}
                  </p>
                </div>

                {/* 项目Logo */}
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center">
                      <i className="text-red-500">*</i>
                      <h4 className="ml-1 text-sm font-medium">{t('project_logo')}</h4>
                    </div>
                    <p className="text-muted-foreground text-sm">{t('project_logo_size_hint')}</p>
                  </div>
                  <UploadImage
                    fileUrl={orderParams?.project_icon || ''}
                    size={5 * 1024 * 1024} // 5MB
                    onSuccess={(url) => handleParameterChange('project_icon', url)}
                  />
                  <p className="text-sm text-red-500">
                    {!orderParams?.project_icon?.trim() && t('project_logo_required')}
                  </p>
                </div>

                {/* 项目描述 */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <i className="text-red-500">*</i>
                    <h4 className="ml-1 text-sm font-medium">{t('project_description')}</h4>
                  </div>
                  <div className="relative">
                    <Textarea
                      value={orderParams?.project_description || ''}
                      onChange={(e) => handleParameterChange('project_description', e.target.value)}
                      maxLength={2000}
                      placeholder={t('please_enter_project_description')}
                      className="min-h-20 resize-none"
                      disabled={isLoading}
                    />
                    <p className="text-muted-foreground absolute right-3 bottom-2 text-sm">
                      {(orderParams?.project_description || '').length} / 2000
                    </p>
                  </div>
                  <p className="text-sm text-red-500">
                    {!orderParams?.project_description?.trim() && t('project_description_required')}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {canGoBack && (
                  <Button
                    onClick={handleGoBack}
                    variant="outline"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {t('previous_step')}
                  </Button>
                )}
                <Button
                  onClick={handleStepComplete}
                  disabled={
                    !orderParams?.project_name?.trim() ||
                    !orderParams?.project_description?.trim() ||
                    !orderParams?.project_website?.trim() ||
                    !orderParams?.project_icon?.trim() ||
                    isLoading
                  }
                  className="flex-1"
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    t('create_project_continue')
                  )}
                </Button>
              </div>
            </div>
          );

        case 'tweetType':
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{currentStep.title}</h3>
              <p className="text-muted-foreground text-sm">{currentStep.description}</p>

              {isServiceLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                  <span className="ml-2">{t('loading')}</span>
                </div>
              ) : serviceData ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {serviceData.tweet_types?.map((tweetType: any) => (
                    <Card
                      key={tweetType.id}
                      className={`cursor-pointer p-4 transition-all ${
                        orderParams?.tweet_service_type_id === tweetType.id
                          ? 'ring-primary ring-2'
                          : ''
                      }`}
                      onClick={() => handleParameterChange('tweet_service_type_id', tweetType.id)}
                    >
                      <CardContent className="p-0">
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {tweetType.id === 5 && <TextIcon className="size-5 min-h-5 min-w-5" />}
                            {tweetType.id === 6 && (
                              <TextThread className="size-5 min-h-5 min-w-5" />
                            )}
                            {tweetType.id === 7 && <TextImage className="size-5 min-h-5 min-w-5" />}
                            {tweetType.id === 8 && (
                              <ImageThread className="size-5 min-h-5 min-w-5" />
                            )}
                            <span>{getLocalizedText(tweetType.name)}</span>
                          </div>
                          {/* <Checkbox
                            className="absolute right-1 top-1"
                            checked={orderParams?.tweet_service_type_id === tweetType.id}
                            onCheckedChange={() =>
                              handleParameterChange('tweet_service_type_id', tweetType.id)
                            }
                          /> */}
                        </div>
                        <p className="text-muted-foreground mt-2 text-sm">
                          {getLocalizedText(tweetType.require)}
                        </p>
                        <div className="text-primary">
                          {tweetType.price_rate === 100
                            ? t('original_price')
                            : t('original_price_with_rate', { rate: tweetType.price_rate })}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground text-center">{t('no_data')}</div>
              )}

              <div className="flex gap-2">
                {canGoBack && (
                  <Button onClick={handleGoBack} variant="outline" className="flex-1">
                    {t('previous_step')}
                  </Button>
                )}
                <Button
                  onClick={handleStepComplete}
                  disabled={!orderParams?.tweet_service_type_id}
                  className="flex-1"
                >
                  {t('next_step')}
                </Button>
              </div>
            </div>
          );

        case 'extraService':
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{currentStep.title}</h3>
              <p className="text-muted-foreground text-sm">{currentStep.description}</p>

              {serviceData ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {serviceData.exts?.map((extraService: any) => {
                    const selectedIds = orderParams?.ext_tweet_service_type_ids || [];
                    const isSelected = selectedIds.includes(extraService.id);

                    return (
                      <Card
                        key={extraService.id}
                        className={`cursor-pointer p-4 transition-all ${
                          isSelected ? 'ring-primary ring-2' : ''
                        }`}
                        onClick={() => {
                          const currentIds = orderParams?.ext_tweet_service_type_ids || [];
                          let newIds;

                          if (isSelected) {
                            // 如果已选中，从数组中移除
                            newIds = currentIds.filter((id) => id !== extraService.id);
                          } else {
                            // 如果未选中，添加到数组中
                            newIds = [...currentIds, extraService.id];
                          }

                          handleParameterChange('ext_tweet_service_type_ids', newIds);
                        }}
                      >
                        <CardContent className="p-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span>{getLocalizedText(extraService.name)}</span>
                            </div>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => {
                                const currentIds = orderParams?.ext_tweet_service_type_ids || [];
                                let newIds;

                                if (isSelected) {
                                  // 如果已选中，从数组中移除
                                  newIds = currentIds.filter((id) => id !== extraService.id);
                                } else {
                                  // 如果未选中，添加到数组中
                                  newIds = [...currentIds, extraService.id];
                                }

                                handleParameterChange('ext_tweet_service_type_ids', newIds);
                              }}
                            />
                          </div>
                          <p className="text-muted-foreground mt-2 text-sm">
                            {getLocalizedText(extraService.require)}
                          </p>
                          <div className="text-primary">
                            {t('extra_service_price', { rate: extraService.price_rate })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-muted-foreground text-center">{t('no_data')}</div>
              )}

              <div className="flex gap-2">
                {canGoBack && (
                  <Button onClick={handleGoBack} variant="outline" className="flex-1">
                    {t('previous_step')}
                  </Button>
                )}
                <Button onClick={handleStepComplete} className="flex-1">
                  {t('next_step')}
                </Button>
              </div>
            </div>
          );

        case 'uploadImages':
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{currentStep.title}</h3>
              <p className="text-muted-foreground text-sm">{currentStep.description}</p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                {/* 已上传的图片 */}
                {uploadedImages.map((imageUrl, index) => (
                  <div key={index} className="relative min-h-32.5 overflow-hidden rounded-3xl">
                    <img
                      src={imageUrl}
                      alt={`uploaded-image-${index}`}
                      className="size-full object-cover"
                    />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}

                {/* 添加图片按钮 */}
                {(() => {
                  const maxImages =
                    orderParams?.tweet_service_type_id === 7
                      ? 4
                      : orderParams?.tweet_service_type_id === 8
                        ? 4
                        : 4;
                  return (
                    uploadedImages.length < maxImages && (
                      <Card className="ring-border hover:ring-primary relative flex min-h-32.5 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-3xl border-none px-6 py-4 ring-1 transition-all hover:ring-2">
                        <CardContent className="text-muted-foreground flex flex-col items-center justify-center gap-y-2">
                          {isUploading ? (
                            <>
                              <Loader2 className="size-6 animate-spin" />
                              <p className="text-md whitespace-nowrap">{t('uploading')}</p>
                            </>
                          ) : (
                            <>
                              <Plus className="size-6" />
                              <p className="text-md whitespace-nowrap">{t('add_image')}</p>
                            </>
                          )}
                        </CardContent>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".jpeg,.jpg,.png,.bmp,.webp,image/jpeg,image/jpg,image/png,image/bmp,image/webp"
                          onChange={handleFileSelect}
                          className="absolute inset-0 cursor-pointer opacity-0"
                          disabled={isUploading}
                        />
                      </Card>
                    )
                  );
                })()}
              </div>

              {/* 图片数量提示和要求说明 */}
              <div className="text-muted-foreground space-y-2 text-sm">
                {orderParams?.tweet_service_type_id === 7 && (
                  <>
                    <p>{t('must_upload_1_to_4_images')}</p>
                    <p>{t('current_uploaded', { count: uploadedImages.length, total: 4 })}</p>
                  </>
                )}
                {orderParams?.tweet_service_type_id === 8 && (
                  <>
                    <p>{t('must_upload_1_to_4_images')}</p>
                    <p>{t('current_uploaded', { count: uploadedImages.length, total: 4 })}</p>
                  </>
                )}
              </div>

              <div className="flex gap-2">
                {canGoBack && (
                  <Button onClick={handleGoBack} variant="outline" className="flex-1">
                    {t('previous_step')}
                  </Button>
                )}
                <Button
                  onClick={handleStepComplete}
                  disabled={(() => {
                    const selectedTweetType = orderParams?.tweet_service_type_id;
                    if (selectedTweetType === 7 || selectedTweetType === 8) {
                      return uploadedImages.length === 0;
                    }
                    return false;
                  })()}
                  className="flex-1"
                >
                  {t('next_step')}
                </Button>
              </div>
            </div>
          );

        case 'promotionalMaterials':
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{currentStep.title}</h3>
              <p className="text-muted-foreground text-sm">{currentStep.description}</p>

              <Textarea
                placeholder={t('please_enter_promotional_content')}
                value={orderParams?.promotional_materials || ''}
                onChange={(e) => handleParameterChange('promotional_materials', e.target.value)}
                className="bg-background/50 min-h-32 w-full text-xs sm:text-base"
              />

              <div className="flex gap-2">
                {canGoBack && (
                  <Button onClick={handleGoBack} variant="outline" className="flex-1">
                    上一步
                  </Button>
                )}
                <Button
                  onClick={handleStepComplete}
                  disabled={!orderParams?.promotional_materials?.trim()}
                  className="flex-1"
                >
                  下一步
                </Button>
              </div>
            </div>
          );

        case 'promotionTime':
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{currentStep.title}</h3>
              <p className="text-muted-foreground text-sm">{currentStep.description}</p>

              <div
                className={cn(
                  'grid grid-cols-1 gap-4',
                  pathname.includes('chat') ? 'sm:grid-cols-2' : 'sm:grid-cols-1'
                )}
              >
                <div className="flex items-center gap-2">
                  <label className="text-muted-foreground text-sm">
                    {t('promotion_start_time')}
                  </label>
                  <DatePicker
                    onChange={(date) => {
                      if (date) {
                        handleParameterChange('promotional_start_at', formatDateToYYYYMMDD(date));
                      }
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-muted-foreground text-sm">{t('promotion_end_time')}</label>
                  <DatePicker
                    onChange={(date) => {
                      if (date) {
                        handleParameterChange('promotional_end_at', formatDateToYYYYMMDD(date));
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                {canGoBack && (
                  <Button onClick={handleGoBack} variant="outline" className="flex-1">
                    {t('previous_step')}
                  </Button>
                )}
                <Button
                  onClick={handleStepComplete}
                  disabled={!orderParams?.promotional_start_at || !orderParams?.promotional_end_at}
                  className="flex-1"
                >
                  {t('next_step')}
                </Button>
              </div>
            </div>
          );

        case 'orderConfirmation':
          return (
            <div className="bg-background/70 space-y-4 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold">{t('order_info')}</h3>
              <p className="text-muted-foreground text-sm">{t('order_success_message')}</p>

              <div className="bg-primary/5 space-y-3 rounded-lg p-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('project_label')}</span>
                  <span className="text-right">
                    {projects.find((p) => p.id.toString() === orderParams?.project_id)?.name ||
                      '--'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('tweet_type_label')}</span>
                  <span className="text-right">
                    {serviceData?.tweet_types.find(
                      (t) => t.id === orderParams?.tweet_service_type_id
                    )?.name?.[locale] || '--'}
                  </span>
                </div>
                {orderParams?.ext_tweet_service_type_ids &&
                  orderParams.ext_tweet_service_type_ids.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('extra_service_label')}</span>
                      <div className="flex flex-col items-end gap-1">
                        {orderParams.ext_tweet_service_type_ids.map((extId) => {
                          const extraService = serviceData?.exts.find((e) => e.id === extId);
                          return (
                            <span key={extId} className="text-right">
                              {extraService?.name?.[locale] || '--'}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('promotional_materials_label')}</span>
                  <span className="max-w-xs truncate text-right">
                    {orderParams?.promotional_materials || '--'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('promotion_time_label')}</span>
                  <span className="text-right">
                    {orderParams?.promotional_start_at} - {orderParams?.promotional_end_at}
                  </span>
                </div>
                <div className="border-muted-foreground/20 w-full border-b border-dashed"></div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('order_amount_label')}</span>
                  <span className="text-primary text-right text-lg font-semibold">
                    ${calculateOrderAmount()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('payment_status_label')}</span>
                  <span className="text-right font-semibold text-green-600">
                    {t('payment_success')}
                  </span>
                </div>
                <div className="flex flex-wrap justify-between">
                  <span className="text-muted-foreground">{t('transaction_hash_label')}</span>
                  <span
                    className="hover:text-primary cursor-pointer text-right font-mono text-sm"
                    onClick={() => {
                      window.open(
                        getExplorerLink(
                          DEFAULT_CHAIN.id,
                          orderConfirmationData.issueHash || '',
                          'transaction'
                        ),
                        '_blank'
                      );
                    }}
                  >
                    {formatAddress(issueHash, 6, 6) || '--'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('order_number_label')}</span>
                  <span className="text-right font-mono text-sm">{order || '--'}</span>
                </div>
              </div>
            </div>
          );

        default:
          return null;
      }
    }, [
      orderStep,
      serviceData,
      projects,
      orderParams,
      isServiceLoading,
      handleParameterChange,
      handleStepComplete,
      handleGoBack,
      isLoading,
      getLocalizedText,
      canGoBack,
    ]);

    // 如果action已被删除，不渲染任何UI
    if (isActionDeletedRef.current) {
      return null;
    }

    if (!isOrderProcessing && !isOrderCompleted) {
      return null;
    }

    return (
      <>
        {isOrderCompleted && orderConfirmationData ? (
          <div className="bg-background/70 flex w-full flex-col gap-4 rounded-lg p-4 shadow-sm">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('order_info')}</h3>
              <p className="text-muted-foreground text-sm">{t('order_success_message')}</p>

              <div className="bg-primary/5 space-y-3 rounded-lg p-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('project_label')}</span>
                  <span className="text-right">
                    {orderConfirmationData.projectInfo?.name || '--'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('tweet_type_label')}</span>
                  <span className="text-right">
                    {orderConfirmationData.tweetTypeInfo?.name?.[locale] || '--'}
                  </span>
                </div>
                {orderConfirmationData.extraServiceInfos &&
                  orderConfirmationData.extraServiceInfos.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('extra_service_label')}</span>
                      <div className="flex flex-col items-end gap-1">
                        {orderConfirmationData.extraServiceInfos.map((extraService, index) => (
                          <span key={index} className="text-right">
                            {extraService?.name?.[locale] || '--'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('promotional_materials_label')}</span>
                  <span className="max-w-xs truncate text-right">
                    {orderConfirmationData.promotionalMaterials || '--'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('promotion_time_label')}</span>
                  <span className="text-right">
                    {orderConfirmationData.promotionalStartAt} -{' '}
                    {orderConfirmationData.promotionalEndAt}
                  </span>
                </div>
                <div className="border-muted-foreground/20 w-full border-b border-dashed"></div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('order_amount_label')}</span>
                  <span className="text-primary text-right text-lg font-semibold">
                    ${orderConfirmationData.finalAmount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('payment_status_label')}</span>
                  <span className="text-right font-semibold text-green-600">
                    {t('payment_success')}
                  </span>
                </div>
                <div className="flex flex-wrap justify-between">
                  <span className="text-muted-foreground">{t('transaction_hash_label')}</span>
                  <span
                    className="hover:text-primary cursor-pointer text-right font-mono text-sm"
                    onClick={() => {
                      window.open(
                        getExplorerLink(
                          DEFAULT_CHAIN.id,
                          orderConfirmationData.issueHash || '',
                          'transaction'
                        ),
                        '_blank'
                      );
                    }}
                  >
                    {formatAddress(orderConfirmationData.issueHash, 6, 6) || '--'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('completion_time_label')}</span>
                  <span className="text-right text-sm">
                    {new Date(orderConfirmationData.completedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-2">
            {/* 链错误提示 */}
            {(data as any)?.orderConfirmationData?.status !== 'completed' && (
              <div className="flex flex-row items-center gap-1">
                <div className="text-md box-border inline-block">
                  <LoadingDots />
                </div>
                <CornerRightDown className="text-primary/80 size-4" />
              </div>
            )}
            {isWrongChain && (
              <div className="mb-4 rounded-md bg-yellow-100 p-4 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                <p className="text-sm">
                  {t('wrong_chain_message', { chainName: DEFAULT_CHAIN.name })}
                </p>
                <Button
                  onClick={() => switchChain({ chainId: DEFAULT_CHAIN.id })}
                  disabled={isLoading}
                  className="mt-2 bg-yellow-800 text-white hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600"
                >
                  {isLoading ? (
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

            {/* 思考过程 */}
            <div
              ref={thinkingScrollRef}
              className="hover:[&::-webkit-scrollbar-thumb]:bg-primary/20 h-full max-h-[100px] space-y-0 overflow-y-auto [&::-webkit-scrollbar]:w-1 hover:[&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
            >
              {orderThinkingMessages?.map((stepMessages, index) => (
                <ChatThinking key={index} messages={stepMessages.messages} />
              ))}
            </div>

            {/* 当前步骤组件 */}
            {currentStepComponent}

            {/* 订单金额预览 */}
            {(orderStep || 0) >= 8 && data.parameters.kol_ids.length > 0 && (
              <div className="bg-background/70 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span>{t('order_amount')}</span>
                  <span className="text-primary text-lg font-semibold">
                    ${calculateOrderAmount()}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
        <UIDialogBindEmail open={showBindEmailDialog} onOpenChange={setShowBindEmailDialog}>
          <div></div>
        </UIDialogBindEmail>
      </>
    );
  }
);

OrderDoing.displayName = 'OrderDoing';

export default OrderDoing;
