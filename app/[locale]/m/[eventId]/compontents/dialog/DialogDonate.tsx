import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@shadcn/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from '@shadcn/components/ui/dialog';
import { Success, Fail, MoneyBag } from '@assets/svg';
import { useTranslations } from 'next-intl';
import { useAppSelector } from '@store/hooks';
import { cn } from '@shadcn/lib/utils';
import { Loader2, HandCoins, Gift, ArrowRightLeft, Wallet } from 'lucide-react';
import Loader from '@ui/loading/loader';
import TokenIcon from 'app/components/TokenIcon';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  IEventInfoResponseData,
  getActivityDonateTokenInfo,
  IGetActivityDonateTokenInfoResponseDataItem,
  getDonateSuccess,
} from '@libs/request';
import { ChainType, getChainConfig } from '@constants/config';
import { Input } from '@shadcn/components/ui/input';
import { Label } from '@shadcn/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shadcn/components/ui/select';
import { ethers } from 'ethers';
import {
  useAccount,
  useSwitchChain,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useBalance,
} from 'wagmi';
import { erc20Abi } from 'viem';
import useUserInfo from '@hooks/useUserInfo';
import Activityservice_abi from '@constants/abi/Activityservice_abi.json';
import UIWallet from '@ui/wallet';
import { formatPrecision } from '@libs/utils';

interface DialogDonateProps {
  isOpen: boolean;
  onClose: () => void;
  eventInfo?: IEventInfoResponseData;
  onDonateSuccess?: () => void;
}

export default function DialogDonate({
  isOpen,
  onClose,
  eventInfo,
  onDonateSuccess,
}: DialogDonateProps) {
  const t = useTranslations('common');
  const { eventId } = useParams();
  const { address, chainId } = useAccount();
  const { isLogin } = useUserInfo();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  // Wagmi hooks for contract interactions
  const {
    writeContract: writeDonateContract,
    isPending: isDonatePending,
    error: donateError,
    data: donateTxHash,
  } = useWriteContract();
  const {
    writeContract: writeApproveContract,
    isPending: isApprovePending,
    error: approveError,
    data: approveTxHash,
  } = useWriteContract();

  // Wait for transaction receipts
  const { isLoading: isDonateConfirming, isSuccess: isDonateConfirmed } =
    useWaitForTransactionReceipt({
      hash: donateTxHash,
    });

  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } =
    useWaitForTransactionReceipt({
      hash: approveTxHash,
    });

  // 状态管理
  const [donateAmount, setDonateAmount] = useState('');
  const [selectedChain, setSelectedChain] = useState('');
  const [selectedToken, setSelectedToken] = useState('');
  const [tokenList, setTokenList] = useState<IGetActivityDonateTokenInfoResponseDataItem[]>([]);
  const [donateResult, setDonateResult] = useState<{
    isSuccess: boolean;
    amount: number;
    tokenSymbol: string;
  } | null>(null);
  const [donateErrorState, setDonateErrorState] = useState<string | null>(null);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [currentAllowance, setCurrentAllowance] = useState('0');
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isWrongChain, setIsWrongChain] = useState(false);

  // 获取链配置
  const chainConfig = getChainConfig((eventInfo?.chain_type as ChainType) || '');
  const expectedChainId = chainConfig ? parseInt(chainConfig.chainId) : null;

  // Read token allowance
  const { data: tokenAllowance, refetch: refetchAllowance } = useReadContract({
    address: selectedToken as `0x${string}`,
    abi: erc20Abi,
    functionName: 'allowance',
    args:
      selectedToken && address && chainConfig?.ActivityServiceAddress
        ? [address, chainConfig.ActivityServiceAddress as `0x${string}`]
        : undefined,
    query: {
      enabled:
        !!selectedToken && !!address && !!chainConfig?.ActivityServiceAddress && !isWrongChain,
    },
  });

  // Read token balance
  const { data: tokenBalance } = useBalance({
    address: address,
    token:
      selectedToken && selectedToken !== ethers.ZeroAddress
        ? (selectedToken as `0x${string}`)
        : undefined,
    query: {
      enabled: !!address && !!selectedToken && !isWrongChain,
    },
  });

  // 获取选中的代币信息
  const selectedTokenInfo = tokenList.find((token) => token.coin_address === selectedToken);

  // 余额充足校验（母币或代币）
  const donateAmountNum = parseFloat(donateAmount || '0');
  const availableBalance = tokenBalance ? parseFloat(tokenBalance.formatted) : 0;
  const hasSufficientBalance = donateAmountNum > 0 && availableBalance >= donateAmountNum;

  // 捐赠按钮文案（根据错误/状态动态展示）
  const donateButtonText = (() => {
    if (isDonatePending || isDonateConfirming) return t('donating');
    if (isWrongChain) return t('wrong_chain');
    if (!donateAmount) return t('donate_amount_invalid');
    if (!selectedToken) return t('donate_token_required');
    if (!!donateAmount && !!tokenBalance && !hasSufficientBalance) return t('insufficient_balance');
    if (needsApproval) return t('donate_approve_required');
    return t('donate');
  })();

  // 获取代币列表
  const fetchTokenList = useCallback(async () => {
    if (!eventId) return;

    try {
      setIsLoadingTokens(true);
      const response = await getActivityDonateTokenInfo({
        active_id: parseInt(eventId as string),
      });

      if (response.code === 200 && response.data) {
        setTokenList(response.data);
        // 默认选择第一个代币
        if (response.data.length > 0) {
          setSelectedToken(response.data[0].coin_address || '');
        }
      }
    } catch (error) {
      console.error('Failed to fetch token list:', error);
      toast.error(t('fetch_token_list_failed'));
    } finally {
      setIsLoadingTokens(false);
    }
  }, [eventId]);

  // 检查代币授权额度
  const checkAllowance = useCallback(() => {
    if (!selectedToken || !donateAmount || !address || !selectedChain) {
      setNeedsApproval(false);
      return;
    }

    // ETH和BNB等母币不需要授权
    const isETH = selectedToken === ethers.ZeroAddress;
    const isBNB = selectedTokenInfo?.coin_name?.toLowerCase() === 'bnb';
    const isNativeToken = isETH || isBNB;

    if (isNativeToken) {
      setNeedsApproval(false);
      setCurrentAllowance('0');
      return;
    }

    if (!tokenAllowance) {
      setNeedsApproval(true);
      return;
    }

    try {
      const allowance = tokenAllowance.toString();
      setCurrentAllowance(ethers.formatEther(allowance));

      // 检查是否需要授权（授权额度小于捐赠金额）
      const allowanceBN = BigInt(allowance);
      const amountBN = ethers.parseEther(donateAmount);

      // 如果授权额度是最大数量，则不需要再次授权
      if (allowanceBN === ethers.MaxUint256) {
        setNeedsApproval(false);
        setCurrentAllowance('∞');
      } else {
        setNeedsApproval(allowanceBN < amountBN);
      }
    } catch (error) {
      console.error('Check allowance failed:', error);
      setNeedsApproval(true); // 出错时默认需要授权
    }
  }, [
    selectedToken,
    donateAmount,
    address,
    selectedChain,
    tokenAllowance,
    selectedTokenInfo?.coin_name,
  ]);

  // 授权代币
  const handleApprove = useCallback(async () => {
    if (!selectedToken || !selectedChain || !chainConfig?.ActivityServiceAddress) {
      toast.error(t('please_select_token'));
      return;
    }

    // 输入金额校验
    if (!donateAmount || parseFloat(donateAmount) <= 0) {
      toast.error(t('donate_amount_invalid'));
      return;
    }

    // 母币不需要授权
    if (selectedToken === ethers.ZeroAddress) {
      setNeedsApproval(false);
      return;
    }

    try {
      // 授权为用户输入金额
      const approveAmount = ethers.parseEther(donateAmount);

      writeApproveContract({
        address: selectedToken as `0x${string}`,
        abi: erc20Abi,
        functionName: 'approve',
        args: [chainConfig.ActivityServiceAddress as `0x${string}`, approveAmount],
      });
    } catch (error: any) {
      console.error('Approve failed:', error);
      toast.error(error.message || t('donate_approve_failed'));
    }
  }, [selectedToken, selectedChain, chainConfig?.ActivityServiceAddress, donateAmount, writeApproveContract, t]);

  // 检查链是否正确
  const checkChain = useCallback(() => {
    if (!expectedChainId || !chainId) {
      setIsWrongChain(false);
      return;
    }
    setIsWrongChain(chainId !== expectedChainId);
  }, [chainId, expectedChainId]);

  // 切换到正确的链
  const handleSwitchChain = useCallback(async () => {
    if (!expectedChainId) {
      toast.error(t('wrong_chain'));
      return;
    }

    try {
      await switchChain({
        chainId: expectedChainId,
      });
    } catch (error) {
      console.error('Switch chain failed:', error);
      toast.error(t('switch_chain_failed'));
    }
  }, [expectedChainId, switchChain, t]);

  // 初始化
  useEffect(() => {
    if (isOpen && eventId) {
      setSelectedChain(eventInfo?.chain_type || '');
      fetchTokenList();
    }
  }, [isOpen, eventId, eventInfo?.chain_type, fetchTokenList]);

  // 监听代币和金额变化，检查授权额度
  useEffect(() => {
    if (selectedToken && donateAmount && address && selectedChain) {
      checkAllowance();
    } else {
      setNeedsApproval(false);
    }
  }, [selectedToken, donateAmount, address, selectedChain, checkAllowance]);

  // 监听链变化
  useEffect(() => {
    checkChain();
  }, [checkChain]);

  // 监听授权交易状态
  useEffect(() => {
    if (isApproveConfirmed) {
      toast.success(t('donate_approve_success'));
      setNeedsApproval(false);
      setCurrentAllowance('∞'); // 显示无限授权
      refetchAllowance();
    }
  }, [isApproveConfirmed, t, refetchAllowance]);

  // 监听捐赠交易状态
  useEffect(() => {
    if (isDonateConfirmed) {
      const selectedTokenInfo = tokenList.find((token) => token.coin_address === selectedToken);
      const tokenSymbol = selectedTokenInfo?.coin_name || 'Token';

      setDonateResult({
        isSuccess: true,
        amount: parseFloat(donateAmount),
        tokenSymbol,
      });

      // 静默上报 donate 成功
      (async () => {
        try {
          if (donateTxHash && eventId && selectedToken && donateAmount) {
            await getDonateSuccess({
              activeId: parseInt(eventId as string),
              tokenAddress: selectedToken,
              amount: donateAmount,
              txid: donateTxHash as string,
            });
          }
        } catch (e) {
          // 静默失败不提示
          console.error('getDonateSuccess failed silently:', e);
        }
      })();

      // 调用成功回调
      if (onDonateSuccess) {
        onDonateSuccess();
      }
    }
  }, [isDonateConfirmed, selectedToken, tokenList, donateAmount, onDonateSuccess, donateTxHash, eventId, t]);

  // 监听交易错误
  useEffect(() => {
    if (approveError) {
      console.error('Approve error:', approveError);
      toast.error(t('donate_approve_failed'));
    }
  }, [approveError, t]);

  useEffect(() => {
    if (donateError) {
      console.error('Donate error:', donateError);
      setDonateErrorState(donateError.message || t('donate_failed'));
    }
  }, [donateError, t]);

  // 重置状态
  const resetState = useCallback(() => {
    setDonateAmount('');
    setSelectedChain(eventInfo?.chain_type || '');
    setSelectedToken('');
    setDonateResult(null);
    setDonateErrorState(null);
    setCurrentAllowance('0');
    setNeedsApproval(false);
    setIsWrongChain(false);
    setTokenList([]);
    setIsLoadingTokens(false);
  }, [eventInfo?.chain_type]);

  // 关闭弹窗
  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  // 处理捐赠
  const handleDonate = useCallback(async () => {
    if (!isLogin) {
      toast.error(t('please_connect_wallet'));
      return;
    }

    if (isWrongChain) {
      toast.error(t('wrong_chain'));
      return;
    }

    if (!donateAmount || parseFloat(donateAmount) <= 0) {
      toast.error(t('donate_amount_invalid'));
      return;
    }

    if (!selectedToken) {
      toast.error(t('donate_token_required'));
      return;
    }

    if (!eventId) {
      toast.error(t('donate_event_id_required'));
      return;
    }

    // 余额不足拦截（母币或代币）
    if (!hasSufficientBalance) {
      toast.error(t('insufficient_balance'));
      return;
    }

    // 检查是否需要授权
    if (needsApproval) {
      toast.error(t('donate_approve_required'));
      return;
    }

    try {
      const amountInWei = ethers.parseEther(donateAmount);
      const isETH = selectedToken === ethers.ZeroAddress;
      const isBNB = selectedTokenInfo?.coin_name?.toLowerCase() === 'bnb';
      const isNativeToken = isETH || isBNB;

      writeDonateContract({
        address: chainConfig?.ActivityServiceAddress as `0x${string}`,
        abi: Activityservice_abi,
        functionName: 'donate',
        args: [selectedToken as `0x${string}`, amountInWei, eventId as string],
        value: isNativeToken ? amountInWei : 0n,
      });
    } catch (error: any) {
      console.error('Donate failed:', error);
      toast.error(error.message || t('donate_failed'));
    }
  }, [
    isLogin,
    isWrongChain,
    donateAmount,
    selectedToken,
    selectedChain,
    chainConfig?.ActivityServiceAddress,
    eventId,
    hasSufficientBalance,
    needsApproval,
    writeDonateContract,
    selectedTokenInfo?.coin_name,
    t,
  ]);

  const rules = [
    {
      id: '1',
      text: t('donate_rule_1'),
    },
    {
      id: '2',
      text: t('donate_rule_2'),
    },
    {
      id: '3',
      text: t('donate_rule_3'),
    },
  ];

  // 处理max按钮点击
  const handleMaxClick = useCallback(() => {
    if (tokenBalance) {
      const balance = parseFloat(tokenBalance.formatted);
      setDonateAmount(balance.toString());
    }
  }, [tokenBalance]);

  // 重试捐赠
  const handleRetry = useCallback(() => {
    setDonateErrorState(null);
    setDonateResult(null);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogClose asChild></DialogClose>
      <DialogContent
        className="border-border flex max-h-[90vh] w-96 max-w-full flex-col gap-0 overflow-hidden bg-transparent p-4 shadow-none sm:w-[450px] sm:max-w-full sm:p-0"
        nonClosable
      >
        {/* Header */}
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div
          className={cn(
            'bg-background space-y-4 rounded-t-xl rounded-b-xl sm:rounded-t-2xl sm:rounded-b-2xl'
          )}
        >
          {!isLogin || isWrongChain ? (
            // 未连接钱包状态
            <div className="flex flex-col items-center justify-center space-y-4 p-4 sm:p-6">
              <div className="bg-primary/10 flex h-20 w-20 items-center justify-center rounded-full">
                <MoneyBag className="text-primary h-10 w-10" />
              </div>
              <div className="text-center">
                <p className="text-md">{t('connect_wallet_to_claim')}</p>
                <p className="text-muted-foreground text-sm">
                  {t('connect_wallet_to_claim_description')}
                </p>
              </div>

              {/* 错误链提示 */}
              {isWrongChain && (
                <div className="flex w-full flex-col items-center justify-center rounded-md bg-yellow-100 p-4 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                  <p className="text-sm">
                    {t('wrong_chain_message', {
                      chainName: chainConfig?.name || eventInfo?.chain_type || 'Unknown',
                    })}
                  </p>
                  <Button
                    onClick={handleSwitchChain}
                    className="mt-2 bg-yellow-800 text-white hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600"
                  >
                    {t('switch_to_chain', {
                      chainName: chainConfig?.name || eventInfo?.chain_type || 'Unknown',
                    })}
                  </Button>
                </div>
              )}
              {!isWrongChain && (
                <div className="flex w-40">
                  <UIWallet
                    className="!h-auto flex-1 !rounded-lg"
                    onSuccess={handleClose}
                    chainId={expectedChainId ? expectedChainId : chainId}
                  />
                </div>
              )}
            </div>
          ) : isDonatePending || isDonateConfirming || isApprovePending || isApproveConfirming ? (
            // 加载状态
            <div className="flex flex-col items-center justify-center space-y-4 p-4 sm:p-6">
              <Loader />
              <div className="text-center">
                <p className="text-sm">
                  {isApprovePending || isApproveConfirming ? t('approving') : t('donating')}
                </p>
              </div>
            </div>
          ) : donateResult?.isSuccess ? (
            // 捐赠成功状态
            <div className="relative">
              <DotLottieReact
                src="/lottie/celebrations.lottie"
                loop
                autoplay={true}
                className="pointer-events-none absolute inset-0 h-full w-full"
                style={{ zIndex: 0 }}
              />
              <div className="flex flex-col items-center justify-center space-y-4 p-4 sm:p-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full">
                  <Success className="h-full w-full text-white" />
                </div>
                <div className="text-center">
                  <p className="text-md">{t('congratulations')}</p>
                  <p className="text-sm">{t('donate_success_message')}</p>
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
            </div>
          ) : donateErrorState ? (
            // 捐赠失败状态
            <div className="flex flex-col items-center justify-center space-y-4 p-4 sm:p-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full">
                <Fail className="h-full w-full text-white" />
              </div>
              <div className="text-center">
                <p className="text-md">{t('donate_failed')}</p>
                {/* <p className="text-muted-foreground text-sm">{donateErrorState}</p> */}
              </div>
              <div className="flex w-full gap-3">
                <Button onClick={handleRetry} variant="outline" className="flex-1">
                  {t('try_again')}
                </Button>
                <Button onClick={handleClose} variant="secondary" className="flex-1">
                  {t('later')}
                </Button>
              </div>
            </div>
          ) : (
            // 初始状态 - 显示捐赠表单
            <div className="flex w-full flex-col items-center justify-center">
              {/* 标题 */}

              <div className="flex w-full flex-col items-center justify-center space-y-2 p-4 sm:p-6">
                {/* 代币图标 */}
                <div className="relative z-10 flex w-full items-center justify-center py-4">
                  <div className="relative z-0 flex h-16 w-16 items-center justify-center">
                    <Gift className="text-primary h-12 w-12" />
                    <div className="bg-primary/30 absolute top-0 left-[-55%] z-[-1] h-[110%] w-[110%] rounded-full blur-xl" />
                    <div className="absolute top-0 left-[55%] z-[-1] h-[110%] w-[110%] rounded-full bg-[#BFFF00] blur-xl" />
                  </div>
                </div>

                {/* 代币类型选择器 */}
                <div className="border-border flex w-full items-center justify-between gap-2 space-y-2 rounded-xl border">
                  <Input
                    id="amount"
                    type="number"
                    placeholder={t('donate_amount_placeholder')}
                    value={donateAmount}
                    onChange={(e) => setDonateAmount(e.target.value)}
                    min="0"
                    className="m-0 flex-1 border-none !bg-transparent"
                  />
                  <Select
                    value={selectedToken}
                    onValueChange={setSelectedToken}
                    disabled={isLoadingTokens}
                  >
                    <SelectTrigger
                      className="flex justify-end rounded-xl border-none !bg-transparent"
                      icon={<ArrowRightLeft className="text-muted-foreground h-4 w-4" />}
                    >
                      <SelectValue
                        placeholder={isLoadingTokens ? t('loading_tokens') : t('select_token_type')}
                      />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      {tokenList.map((token) => (
                        <SelectItem key={token.id} value={token.coin_address || ''}>
                          <div className="border-border flex w-full items-center justify-end gap-2 border-r pr-2">
                            <span className="text-muted-foreground text-sm">{token.coin_name}</span>
                            <TokenIcon
                              type={token.coin_name || ''}
                              tokenIcon={token.icon || ''}
                              className="h-5 w-5 rounded-full"
                            />
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 捐赠金额输入 */}
                <div className="mb-5 w-full space-y-2">
                  <div className="itemcenter flex justify-between gap-1">
                    <Button
                      variant="outline"
                      className="dark:bg-muted hidden flex-1 !rounded-lg border-none bg-gray-200 !py-1 text-xs sm:block"
                      onClick={() => setDonateAmount('0.5')}
                    >
                      0.5 {selectedTokenInfo?.coin_name}
                    </Button>
                    <Button
                      variant="outline"
                      className="dark:bg-muted flex-1 !rounded-lg border-none bg-gray-200 !py-1 text-xs"
                      onClick={() => setDonateAmount('1')}
                    >
                      1 {selectedTokenInfo?.coin_name}
                    </Button>
                    <Button
                      variant="outline"
                      className="dark:bg-muted flex-1 !rounded-lg border-none bg-gray-200 !py-1 text-xs"
                      onClick={() => setDonateAmount('5')}
                    >
                      5 {selectedTokenInfo?.coin_name}
                    </Button>
                    <Button
                      variant="outline"
                      className="dark:bg-muted flex-1 !rounded-lg border-none bg-gray-200 !py-1 text-xs"
                      onClick={() => setDonateAmount('10')}
                    >
                      10 {selectedTokenInfo?.coin_name}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    {tokenBalance && selectedTokenInfo && (
                      <div className="text-muted-foreground ml-auto flex items-center gap-2 text-sm">
                        <Wallet className="text-muted-foreground h-3 w-3" />
                        <span className="text-muted-foreground text-sm">
                          {formatPrecision(tokenBalance.formatted)}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {selectedTokenInfo.coin_name}
                        </span>
                        <Button
                          variant="link"
                          onClick={handleMaxClick}
                          className="!h-auto !p-0 text-sm"
                        >
                          MAX
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* {needsApproval && donateAmount && (
                    <p className="text-muted-foreground text-xs">
                      {t('current_allowance')}: {formatPrecision(currentAllowance)}{' '}
                      {selectedTokenInfo?.coin_name}
                    </p>
                  )} */}
                </div>

                {/* 操作按钮 */}
                <div className="border-border flex w-full gap-3 border-b pb-5">
                  {needsApproval && (
                    <Button
                      onClick={handleApprove}
                      disabled={
                        isApprovePending || isApproveConfirming || !selectedToken || isWrongChain
                      }
                      className="h-9 w-full flex-1 rounded-full bg-gradient-to-r from-[#01CF7F] from-0% via-[#D4F5D0] via-30% to-[#01CF7F] to-80% bg-[length:200%_100%] bg-[position:100%_50%] !px-2 text-sm transition-[background-position] duration-200 ease-in-out hover:bg-[position:-60%_50%] disabled:cursor-not-allowed disabled:opacity-50 sm:!h-auto sm:w-auto sm:!rounded-full sm:!px-4 sm:!text-base"
                    >
                      {isApprovePending || isApproveConfirming ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('approving')}
                        </>
                      ) : (
                        <>
                          <HandCoins className="mr-2 h-4 w-4" />
                          {t('approve_token')}
                        </>
                      )}
                    </Button>
                  )}

                  <Button
                    onClick={handleDonate}
                    disabled={
                      isDonatePending ||
                      isDonateConfirming ||
                      !donateAmount ||
                      !selectedToken ||
                      (!!donateAmount && !!tokenBalance && !hasSufficientBalance) ||
                      needsApproval ||
                      isWrongChain
                    }
                    className="h-9 w-full flex-1 !rounded-xl bg-gradient-to-r from-[#007AFF] from-0% via-[#D4F5D0] via-30% to-[#007AFF] to-80% bg-[length:200%_100%] bg-[position:100%_50%] !px-2 text-sm transition-[background-position] duration-200 ease-in-out hover:bg-[position:-60%_50%] disabled:cursor-not-allowed disabled:opacity-50 sm:!h-auto sm:w-auto sm:!rounded-xl sm:!px-4 sm:!text-base"
                  >
                    {isDonatePending || isDonateConfirming ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <></>
                    )}
                    {donateButtonText}
                  </Button>
                </div>

                {needsApproval && isLogin && !isWrongChain && (
                  <p className="text-muted-foreground text-center text-sm">
                    {t('donate_approve_required')}
                  </p>
                )}

                <div className="flex w-full flex-col gap-2 rounded-2xl p-2">
                  <span>{t('donate_rules')}</span>
                  <ul className="space-y-2 pl-2">
                    {rules.map((rule) => (
                      <li key={rule.id} className="flex items-start gap-2">
                        <div className="bg-primary mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                        <span className="text-sm font-medium">{rule.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
