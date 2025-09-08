'use client';

import { useEffect, useState, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ethers } from 'ethers';
import {
  useReadContract,
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
} from 'wagmi';
import { Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent } from '@shadcn/components/ui/card';
import { Textarea } from '@shadcn/components/ui/textarea';
import { Button } from '@shadcn/components/ui/button';
import { toast } from 'sonner';
import banner from '@assets/image/banner.png';
import { ORDER_PROGRESS } from '@constants/app';
import useOrderProgress from '@hooks/uesOrderProgress';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { updateChatView, updateQuickOrder } from '@store/reducers/userSlice';
import { erc20Abi } from 'viem';
import { getContractAddress } from '@constants/config';
import { DEFAULT_CHAIN } from '@constants/chains';
import {
  createOrder,
  payOrder,
  associateProject,
  getTweetTypeAndAddOnService,
  uploadImage,
  createOrderV2,
  payOrderV2,
} from '@libs/request';
import useUserInfo from '@hooks/useUserInfo';
import { DatePicker } from '@ui/datePicker';
import KOLService_abi from '@constants/abi/KOLService_abi.json';
import CompSubmitOrderProducts from './SubmitOrderProducts';
import CompSubmitOrderAmountSlider from './SubmitOrderAmountSlider';
import CompSubmitOrderInfo from './SubmitOrderInfo';
import {
  parseToBigNumber,
  hasEnoughBalance,
  hasEnoughAllowance,
  toContractAmount,
  calculateTotalAmount,
} from '@libs/utils/format-bignumber';
import { ImageThread, Plus, TextIcon, TextImage, TextThread } from '@assets/svg';
import { Checkbox } from '@shadcn-ui/checkbox';
import UILoading from '@ui/loading';

// 定义接口类型
interface TweetType {
  id: number;
  name: {
    en: string;
    zh: string;
  };
  code: string;
  price_rate: number;
  require: {
    en: string;
    zh: string;
  };
  s_type: string;
  is_delete: boolean;
}

interface ExtraService {
  id: number;
  name: {
    en: string;
    zh: string;
  };
  code: string;
  price_rate: number;
  require: {
    en: string;
    zh: string;
  };
  s_type: string;
  is_delete: boolean;
}

interface ServiceData {
  exts: ExtraService[];
  tweet_types: TweetType[];
}

export default function SubmitOrderForm() {
  const t = useTranslations('common');
  const locale = useLocale();
  const { setOrderProgress } = useOrderProgress();
  const selectedKOLs = useAppSelector((state) => state.userReducer?.selectedKOLs);
  const totalPrice = selectedKOLs?.reduce((acc, kol) => acc + kol.price_yuan, 0);
  const { isLogin, isConnected, connect, login } = useUserInfo();
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const [isLoading, setIsLoading] = useState(false);
  const [isWrongChain, setIsWrongChain] = useState(false);
  const [promotionalMaterials, setPromotionalMaterials] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [amount, setAmount] = useState<string>('');
  const [formErrors, setFormErrors] = useState<{
    promotionalMaterials?: string;
    startDate?: string;
    endDate?: string;
    amount?: string;
    balance?: string;
    tweetType?: string;
    images?: string;
  }>({});
  const dispatch = useAppDispatch();
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

  const [order, setOrder] = useState<any>(null);
  const [orderId, setOrderId] = useState<string>('');
  const quickOrder = useAppSelector((state) => state.userReducer?.quickOrder);
  const [needApprove, setNeedApprove] = useState(false);

  const [kolsCount, setKolsCount] = useState<number>(selectedKOLs?.length || 0);

  const promotionalMaterialsRef = useRef<HTMLTextAreaElement>(null);
  const startDateRef = useRef<HTMLDivElement>(null);
  const endDateRef = useRef<HTMLDivElement>(null);
  const amountRef = useRef<HTMLDivElement>(null);

  // 新增状态
  const [serviceData, setServiceData] = useState<ServiceData | null>(null);
  const [selectedTweetType, setSelectedTweetType] = useState<number>(0);
  const [selectedExtraServices, setSelectedExtraServices] = useState<number[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const tweetTypeRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isServiceLoading, setIsServiceLoading] = useState(false);

  // 获取推文类型和增值服务数据
  const fetchServiceData = async () => {
    setIsServiceLoading(true);
    try {
      const response: any = await getTweetTypeAndAddOnService();
      if (response.code === 200) {
        setServiceData(response.data);
      } else {
        toast.error(response.msg || t('get_service_data_failed'));
      }
    } catch (error) {
      console.error('获取服务数据失败:', error);
      toast.error(t('get_service_data_failed'));
    } finally {
      setIsServiceLoading(false);
    }
  };

  // 处理图片上传
  const handleImageUpload = async (file: File) => {
    // 根据推文类型确定最大图片数量
    const maxImages = selectedTweetType === 7 ? 4 : selectedTweetType === 8 ? 5 : 4;

    if (uploadedImages.length >= maxImages) {
      toast.error(t('max_images_allowed', { count: maxImages }));
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
        setUploadedImages((prev) => [...prev, response.data.url]);
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
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // 清空input值，允许重复选择同一文件
    event.target.value = '';
  };

  // 检查是否需要显示图片模块
  const shouldShowImages = () => {
    if (!selectedTweetType) return false;
    const selectedType = serviceData?.tweet_types.find((type) => type.id === selectedTweetType);
    return selectedType?.id === 7 || selectedType?.id === 8;
  };

  // 获取本地化文本
  const getLocalizedText = (textObj: { en: string; zh: string }) => {
    return locale === 'zh' ? textObj.zh : textObj.en;
  };

  // 计算包含推文类型和增值服务调整的总金额
  const calculateTotalAmountWithAdjustments = () => {
    if (!selectedKOLs?.length || !decimals) {
      return 0;
    }

    const sortedKOLs = [...selectedKOLs].sort((a, b) => b.price_yuan - a.price_yuan);
    const baseAmount = sortedKOLs
      .slice(0, kolsCount)
      .reduce((acc, kol) => acc + Number(kol.price_yuan), 0);

    let totalAmount = baseAmount;

    // 推文类型调整
    if (selectedTweetType > 0 && serviceData) {
      const selectedTweetTypeData = serviceData.tweet_types.find(
        (type) => type.id === selectedTweetType
      );
      if (selectedTweetTypeData && selectedTweetTypeData.price_rate !== 100) {
        const adjustment = baseAmount * (selectedTweetTypeData.price_rate / 100) - baseAmount;
        totalAmount += adjustment;
      }
    }

    // 增值服务调整
    if (selectedExtraServices.length > 0 && serviceData) {
      selectedExtraServices.forEach((serviceId) => {
        const selectedExtraServiceData = serviceData.exts.find((ext) => ext.id === serviceId);
        if (selectedExtraServiceData) {
          const extraAmount = baseAmount * (selectedExtraServiceData.price_rate / 100);
          totalAmount += extraAmount;
        }
      });
    }

    return totalAmount;
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

  // 获取服务数据
  useEffect(() => {
    fetchServiceData();
  }, []);

  // 获取服务数据
  useEffect(() => {
    if (!selectedKOLs?.length || !decimals) {
      return;
    }

    const calculatedAmount = calculateTotalAmountWithAdjustments();
    setAmount(calculatedAmount.toFixed(2));
  }, [kolsCount, decimals, selectedTweetType, selectedExtraServices, serviceData]);

  // 切换到默认链
  const handleSwitchChain = async () => {
    try {
      setIsLoading(true);
      console.log(DEFAULT_CHAIN.id);
      await switchChain({ chainId: DEFAULT_CHAIN.id });
      setIsLoading(false);
    } catch (error) {
      console.error('切换链失败:', error);
      toast.error(t('switch_chain_failed'));
      setIsLoading(false);
    }
  };

  const onKOLsChange = (value: number[]) => {
    setKolsCount(value[0]);
  };

  const handleAssociateSelectedProject = async (orderId: string, projectId: string) => {
    if (!projectId) {
      toast.error(t('please_select_project'));
      return false;
    }

    try {
      setIsLoading(true);

      // 更新到Redux store
      dispatch(updateQuickOrder({ key: 'project_id', value: projectId }));
      if (orderId) {
        const res: any = await associateProject({
          order_id: Number(orderId),
          project_id: Number(projectId),
        });

        if (res.code === 200) {
          toast.success(t('associate_project_success'));
          return true;
        } else {
          toast.error(res.msg);
          dispatch(updateQuickOrder({ key: 'project_id', value: '' }));
          dispatch(updateQuickOrder({ key: 'order_id', value: '' }));
          setOrderProgress(ORDER_PROGRESS.KOL_SQUARE);
          return false;
        }
      } else {
        toast.error(t('error_order_not_found'));
        dispatch(updateQuickOrder({ key: 'project_id', value: '' }));
        dispatch(updateQuickOrder({ key: 'order_id', value: '' }));
        setOrderProgress(ORDER_PROGRESS.KOL_SQUARE);
        return false;
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
      dispatch(updateQuickOrder({ key: 'project_id', value: '' }));
      dispatch(updateQuickOrder({ key: 'order_id', value: '' }));
      setIsLoading(false);
      return false;
    }
  };

  // 验证单个日期字段
  const validateDate = (type: 'start' | 'end') => {
    let startError: string | undefined;
    let endError: string | undefined;

    if (type === 'start') {
      startError = !startDate ? t('field_required', { field: t('start_time') }) : undefined;
    }

    if (type === 'end') {
      endError = !endDate ? t('field_required', { field: t('end_time') }) : undefined;
    }

    if (startDate && endDate && endDate < startDate) {
      endError = t('end_date_greater_than_start', { field: t('end_time') });
    }

    setFormErrors((prev) => ({
      ...prev,
      startDate: type === 'start' ? startError : prev.startDate,
      endDate: type === 'end' ? endError : prev.endDate,
    }));

    return type === 'start' ? !startError : !endError;
  };

  // 验证日期
  const validateDates = () => {
    const startValid = validateDate('start');
    const endValid = validateDate('end');
    return startValid && endValid;
  };

  // 验证单个金额字段
  const validateAmount = () => {
    let amountError: string | undefined;
    let balanceError: string | undefined;

    if (!amount) {
      amountError = t('field_required', { field: t('payment_amount') });
    } else if (Number(amount) <= 0) {
      amountError = t('amount_must_be_greater_than_zero');
    } else if (balance && address && decimals) {
      if (!hasEnoughBalance(balance, amount, Number(decimals))) {
        balanceError = t('insufficient_balance');
      }
    }

    setFormErrors((prev) => ({
      ...prev,
      amount: amountError,
      balance: balanceError,
    }));

    return !amountError && !balanceError;
  };

  // 验证余额
  const validateBalance = () => {
    return validateAmount();
  };

  const validatePromotionalMaterials = () => {
    let error = '';
    if (!promotionalMaterials.trim()) {
      error = t('field_required', { field: t('promotional_materials') });
    }

    setFormErrors((prev) => ({
      ...prev,
      promotionalMaterials: error || undefined,
    }));

    return !error;
  };

  const validateForm = () => {
    let isValid = true;
    const errors: {
      promotionalMaterials?: string;
      startDate?: string;
      endDate?: string;
      amount?: string;
      balance?: string;
      tweetType?: string;
      images?: string;
    } = {};

    if (!selectedTweetType) {
      errors.tweetType = t('please_select_tweet_type');
      isValid = false;
      tweetTypeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast.error(t('please_select_tweet_type'));
    }

    // 校验推文类型7和8的图片上传
    if (selectedTweetType === 7 || selectedTweetType === 8) {
      const minImages = 1;
      const maxImages = selectedTweetType === 7 ? 4 : 4;

      if (uploadedImages.length < minImages) {
        errors.images = t('images_required_for_tweet_type', {
          type:
            serviceData?.tweet_types.find((t) => t.id === selectedTweetType)?.name?.[locale] || '',
        });
        isValid = false;
        toast.error(
          t('images_required_for_tweet_type', {
            type:
              serviceData?.tweet_types.find((t) => t.id === selectedTweetType)?.name?.[locale] ||
              '',
          })
        );
      } else if (uploadedImages.length > maxImages) {
        errors.images = t('max_images_allowed', { count: maxImages });
        isValid = false;
        toast.error(t('max_images_allowed', { count: maxImages }));
      }
    }

    if (!promotionalMaterials.trim()) {
      errors.promotionalMaterials = t('field_required', { field: t('promotional_materials') });
      isValid = false;
      promotionalMaterialsRef.current?.focus();
      toast.error(t('field_required', { field: t('promotional_materials') }));
    }

    if (!startDate) {
      errors.startDate = t('field_required', { field: t('start_time') });
      isValid = false;
      startDateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast.error(t('field_required', { field: t('start_time') }));
    }

    if (!endDate) {
      errors.endDate = t('field_required', { field: t('end_time') });
      isValid = false;
      endDateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast.error(t('field_required', { field: t('end_time') }));
    }

    if (startDate && endDate && endDate < startDate) {
      errors.endDate = t('end_date_greater_than_start', { field: t('end_time') });
      isValid = false;
      endDateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast.error(t('end_date_greater_than_start', { field: t('end_time') }));
    }

    if (!amount) {
      errors.amount = t('field_required', { field: t('payment_amount') });
      isValid = false;
      amountRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast.error(t('field_required', { field: t('payment_amount') }));
    } else if (Number(amount) <= 0) {
      errors.amount = t('amount_must_be_greater_than_zero', { field: t('payment_amount') });
      isValid = false;
      amountRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast.error(t('amount_must_be_greater_than_zero'));
    } else if (balance && Number(amount) > 0 && decimals) {
      if (!hasEnoughBalance(balance, amount, Number(decimals))) {
        errors.balance = t('insufficient_balance');
        isValid = false;
        amountRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        toast.error(t('insufficient_balance'));
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  // 检查授权额度是否足够
  const checkAllowance = () => {
    if (!decimals || !allowance || !amount) return false;

    return hasEnoughAllowance(allowance, amount, Number(decimals));
  };

  // 执行授权
  const handleApprove = async () => {
    if (!decimals || !amount) return;

    try {
      writeContractApprove({
        address: getContractAddress().pay_member_token_address as `0x${string}`,
        abi: erc20Abi,
        functionName: 'approve',
        args: [getContractAddress().KOLServiceAddress as `0x${string}`, ethers.MaxUint256],
      });
    } catch (error) {
      console.error('授权错误:', error);
      toast.error(t('approve_failed'));
      setIsLoading(false);
    }
  };

  // 执行issue调用
  const handleIssue = async () => {
    if (!decimals || !amount || !address) return;

    try {
      const amountBigInt = toContractAmount(amount, Number(decimals));
      writeContractIssue({
        address: getContractAddress().KOLServiceAddress as `0x${string}`,
        abi: KOLService_abi,
        functionName: 'issue',
        args: [
          getContractAddress().pay_member_token_address as `0x${string}`,
          amountBigInt,
          address as `0x${string}`, // projectAddress参数是自己的钱包地址
        ],
      });
    } catch (error) {
      console.error('调用issue方法错误:', error);
      toast.error(t('issue_failed'));
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!isLogin) {
      await login();
      return;
    } else if (!isConnected) {
      connect();
      return;
    }

    // 检查是否在正确的链上
    if (chainId && DEFAULT_CHAIN.id !== chainId) {
      toast.error(t('wrong_chain'));
      return;
    }

    if (!quickOrder?.project_id) {
      toast.error(t('error_project_not_found'));
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (!selectedKOLs?.length) {
      toast.error(t('please_select_at_least_one_kol'));
      return;
    }
    if (!balance || !hasEnoughBalance(balance, amount, Number(decimals))) {
      toast.error(t('insufficient_balance'));
      return;
    }

    try {
      setIsLoading(true);

      // 计算包含推文类型和增值服务调整后的总金额
      const finalAmount = calculateTotalAmountWithAdjustments();

      const order: any = await createOrderV2({
        project_id: quickOrder.project_id,
        kol_ids: selectedKOLs.map((kol) => kol.id),
        amount: finalAmount.toFixed(2).replace(/\.?0+$/, ''),
        promotional_materials: promotionalMaterials,
        promotional_start_at: startDate ? formatDateToYYYYMMDD(startDate) : undefined,
        promotional_end_at: endDate ? formatDateToYYYYMMDD(endDate) : undefined,
        tweet_service_type_id: selectedTweetType,
        medias: uploadedImages,
        ...(selectedExtraServices.length > 0 && {
          ext_tweet_service_type_ids: selectedExtraServices,
        }),
      });

      if (order.code !== 200 || !order.data) {
        toast.error(order.msg);
        setIsLoading(false);
        return;
      }

      // 关联项目 (已废弃)
      // const isAssociated = await handleAssociateSelectedProject(order.data.order_id, quickOrder.project_id);
      // if (!isAssociated) {
      //   setIsLoading(false);
      //   return;
      // }

      setOrder(order.data.order_no);
      setOrderId(order.data.order_id);

      // 检查授权额度
      await refetchAllowance();
      const hasEnoughAllowance = checkAllowance();

      if (!hasEnoughAllowance) {
        setNeedApprove(true);
        // 执行授权
        await handleApprove();
      } else {
        // 直接调用issue方法
        await handleIssue();
      }
    } catch (error) {
      dispatch(updateQuickOrder({ key: 'order_no', value: '' }));
      dispatch(updateQuickOrder({ key: 'order_id', value: '' }));
      console.log(error);
      toast.error(error.message);
      setIsLoading(false);
    }
  };

  const handlePay = async () => {
    if (!issueHash) return;

    try {
      const pay: any = await payOrderV2({
        order_no: order,
        tx_hash: issueHash,
      });
      if (pay.code !== 200 || !pay.data) {
        toast.error(pay.msg);
        setIsLoading(false);
        return;
      }
      dispatch(updateQuickOrder({ key: 'order_no', value: order }));
      dispatch(updateQuickOrder({ key: 'order_id', value: orderId }));
      toast.success(t('payment_success'));
      setIsLoading(false);
      setOrderProgress(ORDER_PROGRESS.KOL_PROMOTION);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      toast.error(error.message);
    }
  };

  // 监听授权结果
  useEffect(() => {
    if (isConfirmedApprove) {
      // 授权成功后调用issue方法
      handleIssue();
    }
    if (isErrorWaitForTransactionReceiptApprove) {
      setIsLoading(false);
      toast.error(errorWaitForTransactionReceiptApprove?.message || t('approve_failed'));
    }
    if (isPendingApprove) {
      setIsLoading(true);
    }
    if (isErrorApprove) {
      setIsLoading(false);
      toast.error(errorApprove?.message || t('approve_failed'));
    }
  }, [isErrorApprove, errorApprove, isConfirmedApprove, isPendingApprove]);

  // 监听issue方法调用结果
  useEffect(() => {
    if (isConfirmedIssue) {
      handlePay();
    }
    if (isErrorWaitForTransactionReceiptIssue) {
      setIsLoading(false);
      toast.error(errorWaitForTransactionReceiptIssue?.message || t('issue_failed'));
    }
    if (isPendingIssue) {
      setIsLoading(true);
    }
    if (isErrorIssue) {
      setIsLoading(false);
      toast.error(errorIssue?.message || t('issue_failed'));
    }
  }, [isErrorIssue, errorIssue, isConfirmedIssue, isPendingIssue]);

  // 日期变化时进行校验
  useEffect(() => {
    if (startDate && endDate) {
      validateDates();
    }
  }, [startDate, endDate]);

  // 金额或余额变化时进行校验
  useEffect(() => {
    if (amount || (balance && decimals)) {
      validateBalance();
    }
  }, [amount, balance, decimals, address]);

  // 宣传材料变化时进行校验
  useEffect(() => {
    validatePromotionalMaterials();
  }, [promotionalMaterials]);

  // 图片上传状态变化时清除错误
  useEffect(() => {
    if (selectedTweetType === 7 || selectedTweetType === 8) {
      const minImages = 1;
      const maxImages = selectedTweetType === 7 ? 4 : 5;

      if (uploadedImages.length >= minImages && uploadedImages.length <= maxImages) {
        setFormErrors((prev) => ({
          ...prev,
          images: undefined,
        }));
      }
    }
  }, [uploadedImages, selectedTweetType]);

  // 推文类型变化时清除图片错误
  useEffect(() => {
    setFormErrors((prev) => ({
      ...prev,
      images: undefined,
    }));
  }, [selectedTweetType]);

  // 格式化日期为yyyy-MM-dd
  const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const promotionalMaterialsBlur = () => {
    validatePromotionalMaterials();
    dispatch(updateQuickOrder({ key: 'promotional_materials', value: promotionalMaterials }));
  };

  const changeTweetType = (tweetTypeId: number, code: string) => {
    setSelectedTweetType(tweetTypeId);
    dispatch(updateQuickOrder({ key: 'service_type_code', value: code }));
    dispatch(updateChatView('preview'));
  };
  return (
    <Card className="border-none bg-transparent p-0 sm:border-none">
      <CardContent className="space-y-10 p-0">
        {isWrongChain && (
          <div className="mb-4 rounded-md bg-yellow-100 p-4 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
            <p className="text-sm">{t('wrong_chain_message', { chainName: DEFAULT_CHAIN.name })}</p>
            <Button
              onClick={handleSwitchChain}
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

        <CompSubmitOrderProducts />

        {/* Post type */}
        <div className="space-y-2" ref={tweetTypeRef}>
          <h3 className="text-xl font-semibold">{t('post_type')}</h3>
          {isServiceLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <UILoading />
              <div className="text-muted-foreground mt-2">{t('loading')}</div>
            </div>
          ) : (
            <div className="box-border grid grid-cols-1 gap-6 px-0.5 sm:grid-cols-4">
              {serviceData?.tweet_types.map((tweetType) => (
                <Card
                  key={tweetType.id}
                  className={`box-border min-h-33 cursor-pointer gap-2 rounded-3xl border-none px-6 py-4 shadow-[0px_4px_6px_0px_rgba(0,0,0,0.05)] transition-all ${
                    selectedTweetType === tweetType.id ? 'ring-primary ring-2' : ''
                  }`}
                  onClick={() => changeTweetType(tweetType.id, tweetType.code)}
                >
                  <div className="gap-0 p-0">
                    <div className="flex items-center justify-between">
                      <div className="text-md flex items-center gap-1 font-medium">
                        {tweetType.id === 5 && <TextIcon className="size-6 min-w-6" />}
                        {tweetType.id === 6 && <TextThread className="size-6 min-w-6" />}
                        {tweetType.id === 7 && <TextImage className="size-6 min-w-6" />}
                        {tweetType.id === 8 && <ImageThread className="size-6 min-w-6" />}
                        <span>{getLocalizedText(tweetType.name)}</span>
                      </div>
                      <Checkbox
                        className="size-5"
                        checked={selectedTweetType === tweetType.id}
                        onCheckedChange={() => changeTweetType(tweetType.id, tweetType.code)}
                      />
                    </div>
                  </div>
                  <CardContent className="text-md flex flex-col gap-2 p-0 font-medium">
                    <div className="text-[#999]">{getLocalizedText(tweetType.require)}</div>
                    <div className="text-primary">
                      {tweetType.price_rate === 100
                        ? t('original_price')
                        : t('original_price_with_rate', { rate: tweetType.price_rate })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Extra services */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{t('extra_services')}</h3>
          {isServiceLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <UILoading />
              <div className="text-muted-foreground mt-2">{t('loading')}</div>
            </div>
          ) : (
            <div className="box-border flex gap-6 px-0.5">
              {serviceData?.exts.map((extraService) => (
                <Card
                  key={extraService.id}
                  className={`box-border max-w-67.5 cursor-pointer gap-2 rounded-3xl border-none px-6 py-4 shadow-[0px_4px_6px_0px_rgba(0,0,0,0.05)] transition-all ${
                    selectedExtraServices.includes(extraService.id) ? 'ring-primary ring-2' : ''
                  }`}
                  onClick={() => {
                    const isSelected = selectedExtraServices.includes(extraService.id);
                    if (isSelected) {
                      setSelectedExtraServices((prev) =>
                        prev.filter((id) => id !== extraService.id)
                      );
                    } else {
                      setSelectedExtraServices((prev) => [...prev, extraService.id]);
                    }
                  }}
                >
                  <div className="gap-0 p-0">
                    <div className="flex items-center justify-between">
                      <div className="text-md flex items-center gap-1 font-medium">
                        <span>{getLocalizedText(extraService.name)}</span>
                      </div>

                      <Checkbox
                        className="size-5"
                        checked={selectedExtraServices.includes(extraService.id)}
                        // onCheckedChange={(check) => {
                        //   const isSelected = selectedExtraServices.includes(extraService.id);
                        //   if (isSelected) {
                        //     setSelectedExtraServices((prev) =>
                        //       prev.filter((id) => id !== extraService.id)
                        //     );
                        //   } else {
                        //     setSelectedExtraServices((prev) => [...prev, extraService.id]);
                        //   }
                        //   setTimeout(() => {
                        //        console.log(selectedExtraServices.length);
                        //   }, 0);

                        // }}
                      />
                    </div>
                  </div>
                  <CardContent className="text-md flex flex-col gap-2 p-0 font-medium">
                    <div className="text-[#999]">{getLocalizedText(extraService.require)}</div>
                    <div className="text-primary">
                      {t('extra_service_price', { rate: extraService.price_rate })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Images */}
        {shouldShowImages() && (
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">{t('images')}</h3>
            <div className="box-border grid grid-cols-1 gap-6 px-0.5 sm:grid-cols-4">
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
              {uploadedImages.length <
                (selectedTweetType === 7 ? 4 : selectedTweetType === 8 ? 4 : 4) && (
                <Card className="ring-border hover:ring-primary relative flex min-h-32.5 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-3xl border-none px-6 py-4 ring-1 transition-all hover:ring-2">
                  <CardContent className="text-muted-foreground flex flex-col items-center justify-center gap-y-2">
                    {isUploading ? (
                      <>
                        <Loader2 className="size-6 animate-spin" />
                        <p className="text-md">{t('uploading')}</p>
                      </>
                    ) : (
                      <>
                        <Plus className="size-6" />
                        <p className="text-md">{t('add_image')}</p>
                      </>
                    )}
                  </CardContent>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    disabled={isUploading}
                  />
                </Card>
              )}
            </div>
            {/* 图片数量提示 */}
            <div className="text-muted-foreground text-sm">
              {selectedTweetType === 7 && (
                <p>{t('image_count_hint', { current: uploadedImages.length, max: 4 })}</p>
              )}
              {selectedTweetType === 8 && (
                <p>{t('image_count_hint', { current: uploadedImages.length, max: 4 })}</p>
              )}
            </div>
            {/* 错误提示 */}
            {formErrors.images && <p className="text-sm text-red-500">{formErrors.images}</p>}
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{t('promotional_materials')}</h3>
          <Textarea
            className="bg-background h-20 rounded-lg p-2 text-xs shadow-sm sm:rounded-2xl sm:p-4 sm:placeholder:text-sm"
            ref={promotionalMaterialsRef}
            value={promotionalMaterials}
            onChange={(e) => setPromotionalMaterials(e.target.value)}
            placeholder={t('promotional_materials_placeholder')}
            onBlur={promotionalMaterialsBlur}
          />
          {formErrors.promotionalMaterials && (
            <p className="text-sm text-red-500">{formErrors.promotionalMaterials}</p>
          )}
        </div>

        <div className="space-y-2">
          <div>
            <h3 className="text-xl font-semibold">{t('event_time')}</h3>
            <p className="text-md text-muted-foreground">{t('event_time_description')}</p>
          </div>
          <div className="text-muted-foreground grid grid-cols-1 gap-2 pt-2 md:grid-cols-2 md:gap-x-4">
            <div className="flex flex-1 flex-col gap-1" ref={startDateRef}>
              <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                <p className="whitespace-nowrap sm:w-15">{t('start_time')}</p>
                <div className="flex w-full flex-col gap-1">
                  <DatePicker
                    className="w-full flex-1"
                    onChange={(date) => {
                      if (date) {
                        console.log('选择了开始日期:', date);
                        setStartDate(date);
                        // 用setTimeout确保状态已更新
                        setTimeout(() => {
                          if (formErrors.startDate) {
                            setFormErrors((prev) => ({
                              ...prev,
                              startDate: undefined,
                            }));
                          }
                        }, 0);
                      }
                    }}
                  />
                </div>
              </div>
              {(formErrors.startDate || formErrors.endDate) && (
                <div className="h-4">
                  {formErrors.startDate && (
                    <p className="pl-14 text-sm text-red-500">{formErrors.startDate}</p>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1" ref={endDateRef}>
              <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                <p className="whitespace-nowrap sm:w-15">{t('end_time')}</p>
                <div className="flex w-full flex-col gap-1">
                  <DatePicker
                    className="w-full flex-1"
                    onChange={(date) => {
                      if (date) {
                        console.log('选择了结束日期:', date);
                        setEndDate(date);
                        // 用setTimeout确保状态已更新
                        setTimeout(() => {
                          if (formErrors.endDate) {
                            setFormErrors((prev) => ({
                              ...prev,
                              endDate: undefined,
                            }));
                          }
                        }, 0);
                      }
                    }}
                  />
                </div>
              </div>
              {(formErrors.startDate || formErrors.endDate) && (
                <div className="h-4">
                  {formErrors.endDate && (
                    <p className="pl-12 text-sm text-red-500">{formErrors.endDate}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 金额计算明细 */}
        {selectedKOLs?.length && (
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">{t('payment_amount')}</h3>
            <div className="bg-background space-y-2 rounded-2xl p-4">
              {/* 基础金额 */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('base_amount')}:</span>
                <span>
                  {(() => {
                    const sortedKOLs = [...selectedKOLs].sort(
                      (a, b) => b.price_yuan - a.price_yuan
                    );
                    const baseAmount = sortedKOLs
                      .slice(0, kolsCount)
                      .reduce((acc, kol) => acc + Number(kol.price_yuan), 0);
                    return `${baseAmount.toFixed(2)} ${symbol || ''}`;
                  })()}
                </span>
              </div>

              {/* Post type 调整 */}
              {selectedTweetType > 0 &&
                serviceData &&
                (() => {
                  const selectedTweetTypeData = serviceData.tweet_types.find(
                    (type) => type.id === selectedTweetType
                  );
                  if (selectedTweetTypeData && selectedTweetTypeData.price_rate !== 100) {
                    const sortedKOLs = [...selectedKOLs].sort(
                      (a, b) => b.price_yuan - a.price_yuan
                    );
                    const baseAmount = sortedKOLs
                      .slice(0, kolsCount)
                      .reduce((acc, kol) => acc + Number(kol.price_yuan), 0);
                    const adjustment =
                      baseAmount * (selectedTweetTypeData.price_rate / 100) - baseAmount;
                    return (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          {getLocalizedText(selectedTweetTypeData.name)} (
                          {selectedTweetTypeData.price_rate}%):
                        </span>
                        <span className={adjustment > 0 ? 'text-green-600' : 'text-red-600'}>
                          {adjustment > 0 ? '+' : ''}
                          {adjustment.toFixed(2)} {symbol || ''}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}

              {/* Extra services 调整 */}
              {selectedExtraServices.length > 0 &&
                serviceData &&
                selectedExtraServices.map((serviceId) => {
                  const selectedExtraServiceData = serviceData.exts.find(
                    (ext) => ext.id === serviceId
                  );
                  if (selectedExtraServiceData) {
                    const sortedKOLs = [...selectedKOLs].sort(
                      (a, b) => b.price_yuan - a.price_yuan
                    );
                    const baseAmount = sortedKOLs
                      .slice(0, kolsCount)
                      .reduce((acc, kol) => acc + Number(kol.price_yuan), 0);
                    const extraAmount = baseAmount * (selectedExtraServiceData.price_rate / 100);
                    return (
                      <div key={serviceId} className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          {getLocalizedText(selectedExtraServiceData.name)} (+
                          {selectedExtraServiceData.price_rate}%):
                        </span>
                        <span className="text-green-600">
                          +{extraAmount.toFixed(2)} {symbol || ''}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })}

              {/* 总计 */}
              <div className="border-border flex items-center justify-between border-t pt-2 font-semibold">
                <span>{t('total_amount')}:</span>
                <span className="text-primary text-lg">
                  {calculateTotalAmountWithAdjustments().toFixed(2)} {symbol || ''}
                </span>
              </div>
            </div>
          </div>
        )}

        {selectedKOLs?.length && (
          <CompSubmitOrderAmountSlider
            min={1}
            max={selectedKOLs?.length}
            current={kolsCount}
            onValueChange={onKOLsChange}
            amount={calculateTotalAmountWithAdjustments().toFixed(2)}
          />
        )}
        <div className="bg-border h-px w-full"></div>
        <CompSubmitOrderInfo
          amount={calculateTotalAmountWithAdjustments().toFixed(2)}
          symbol={symbol}
          address={address}
          balance={balance}
          decimals={decimals}
        />

        <div className="flex items-center justify-between gap-x-12">
          <Button
            className="text-md h-6 max-w-64 flex-1 rounded-sm sm:h-10 sm:rounded-xl"
            variant="secondary"
            onClick={() => setOrderProgress(ORDER_PROGRESS.KOL_SQUARE)}
          >
            {t('btn_cancel')}
          </Button>
          <Button
            className="text-md flex h-6 max-w-64 flex-1 rounded-sm sm:h-10 sm:rounded-xl"
            onClick={handlePayment}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('btn_payment')}
              </>
            ) : (
              t('btn_payment')
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
