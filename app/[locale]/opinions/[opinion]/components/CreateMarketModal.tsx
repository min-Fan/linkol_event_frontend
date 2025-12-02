'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Wallet,
  AlertCircle,
  Coins,
  TrendingUp,
  Gem,
  ScanLine,
  ShieldCheck,
  Rocket,
  Crown,
  Loader2,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/components/ui/dialog';
import { Input } from '@shadcn/components/ui/input';
import { useAccount, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { toast } from 'sonner';
import { useAppSelector } from '@store/hooks';
import useUserInfo from '@hooks/useUserInfo';
import { setupBet, setupBetSuccess, ISetupBetResponseData } from '@libs/request';
import { useBetList } from '@hooks/useBetList';
import Bet_abi from '@constants/abi/Bet_abi.json';
import {
  ChainType,
  getChainConfig,
  getChainTypeFromChainId,
} from '@constants/config';
import UIWallet from '@ui/wallet';
import XAuth from '@ui/profile/components/XAuth';
import { useTranslations } from 'next-intl';
import { Link } from '@libs/i18n/navigation';
import PagesRoute from '@constants/routes';

interface CreateMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'INPUT' | 'ANALYZING' | 'PAYMENT' | 'MINTING' | 'SUCCESS';

// 验证 Twitter URL 格式
const validateTwitterUrl = (url: string): boolean => {
  if (!url) return false;
  const twitterUrlPattern = /^(https?:\/\/)?(www\.)?(x\.com|twitter\.com)\/.+\/status\/\d+/i;
  return twitterUrlPattern.test(url.trim());
};

export const CreateMarketModal: React.FC<CreateMarketModalProps> = ({ isOpen, onClose }) => {
  const t = useTranslations('common');
  const [step, setStep] = useState<Step>('INPUT');
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [setupBetData, setSetupBetData] = useState<ISetupBetResponseData | null>(null);
  
  // 使用 ref 跟踪当前会话的交易 hash，避免处理旧会话的交易
  const currentSessionTxHashRef = useRef<string | null>(null);
  // 使用 ref 保存当前会话的 endTimestamp，确保回调时使用相同的值
  const currentSessionEndTimestampRef = useRef<number | null>(null);
  
  // 获取 bet list hook 用于刷新列表
  const { invalidateBetList } = useBetList();
  
  // 用户登录状态
  const { isLogin } = useUserInfo();
  const isTwitterLoggedIn = useAppSelector((state) => state.userReducer?.isLoggedIn);
  const twitterFullProfile = useAppSelector((state) => state.userReducer?.twitter_full_profile);
  const hasTwitterLogin = isTwitterLoggedIn && twitterFullProfile;
  
  // 钱包连接状态
  const { address, chainId: currentChainId, isConnected } = useAccount();
  const hasWalletConnected = isConnected && !!address;
  
  // 合约调用
  const {
    writeContract: writePayContract,
    isPending: isPayPending,
    error: payError,
    isError: isPayWriteError,
    data: payTxHash,
  } = useWriteContract();
  
  const {
    isLoading: isPayConfirming,
    isSuccess: isPayConfirmed,
    isError: isPayReceiptError,
    error: payReceiptError,
    data: payReceipt,
  } = useWaitForTransactionReceipt({
    hash: payTxHash,
    query: {
      enabled: !!payTxHash,
    },
  });
  
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  
  // 获取链配置
  const chainId = setupBetData?.chain_id || 84532;
  const chainType = getChainTypeFromChainId(chainId);
  const chainConfig = getChainConfig(chainType);
  const expectedChainId = chainConfig ? parseInt(chainConfig.chainId) : null;
  const isWrongChain = currentChainId !== expectedChainId;
  
  // 弹窗打开时，如果处于 INPUT 步骤，清除旧的 setupBetData（新会话）
  useEffect(() => {
    if (isOpen && step === 'INPUT' && setupBetData) {
      // 弹窗重新打开且处于 INPUT 步骤，说明是新会话，清除旧数据
      setSetupBetData(null);
    }
  }, [isOpen, step]);
  
  // 弹窗关闭时，清除当前会话的交易 hash 和 endTimestamp 引用
  useEffect(() => {
    if (!isOpen) {
      currentSessionTxHashRef.current = null;
      currentSessionEndTimestampRef.current = null;
    }
  }, [isOpen]);
  
  // 检查登录状态 - 打开弹窗时验证
  useEffect(() => {
    if (isOpen && step === 'INPUT') {
      if (!hasTwitterLogin) {
        // 如果未登录 Twitter，不阻止打开，但会在 UI 中提示
      }
    }
  }, [isOpen, step, hasTwitterLogin]);
  
  // Step 1: 分析并调用 setupBet 接口
  const handleAnalyze = useCallback(async () => {
    if (!url) return;
    
    // 验证 URL 格式
    if (!validateTwitterUrl(url)) {
      setError(t('create_market_invalid_url'));
      return;
    }
    
    // 检查 Twitter 登录
    if (!hasTwitterLogin) {
      setError(t('create_market_please_login_twitter'));
      return;
    }
    
    setError(null);
    setStep('ANALYZING');
    
    try {
      // 调用 setupBet 接口
      const response = await setupBet({ tweet_url: url.trim() });
      
      if (response?.data) {
        setSetupBetData(response.data);
        setStep('PAYMENT');
      } else {
        throw new Error(t('create_market_failed_setup'));
      }
    } catch (e: any) {
      console.error('Setup bet failed:', e);
      setStep('INPUT');
      const errorMessage = e?.response?.data?.msg || e?.message || t('create_market_failed_setup');
      setError(errorMessage);
    }
  }, [url, hasTwitterLogin]);
  
  // Step 2: 支付并调用合约
  const handlePayment = useCallback(async () => {
    if (!hasTwitterLogin) {
      toast.error(t('please_login_first') || 'Please login first');
      return;
    }
    
    if (!hasWalletConnected) {
      toast.error(t('please_connect_wallet') || 'Please connect wallet');
      return;
    }
    
    if (isWrongChain && expectedChainId) {
      try {
        await switchChain({ chainId: expectedChainId });
        return;
      } catch (error) {
        console.error('Switch chain failed:', error);
        toast.error(t('switch_chain_failed') || 'Switch chain failed');
        return;
      }
    }
    
    if (!setupBetData || !chainConfig?.AgentBetAddress) {
      toast.error(t('create_market_setup_data_unavailable'));
      return;
    }
    
    setStep('MINTING');
    
    try {
      // 计算时间戳
      const startTimestamp = Math.floor(Date.now() / 1000);
      const endTimestamp = Math.floor(Date.now() / 1000) + 3 * 24 * 60 * 60; // 3天后

      console.log('startTimestamp', startTimestamp);
      console.log('endTimestamp', endTimestamp);
      console.log('setupBetData.bet_topic_id', setupBetData.bet_topic_id);
      console.log('setupBetData.bet_topic_name', setupBetData.bet_topic_name);
      console.log('setupBetData.betTokenAddress', setupBetData.betTokenAddress);
      console.log('chainConfig.AgentBetAddress', chainConfig.AgentBetAddress);
      console.log('args', [
        setupBetData.bet_topic_id,
        setupBetData.bet_topic_name,
        startTimestamp,
        endTimestamp,
        setupBetData.betTokenAddress as `0x${string}`,
      ]);
      
      // 保存 endTimestamp 到 ref，用于回调时使用
      currentSessionEndTimestampRef.current = endTimestamp;
      
      // 调用 payForRegister 合约
      writePayContract({
        address: chainConfig.AgentBetAddress as `0x${string}`,
        abi: Bet_abi,
        functionName: 'payForRegister',
        args: [
          setupBetData.bet_topic_id,
          setupBetData.bet_topic_name,
          startTimestamp,
          endTimestamp,
          setupBetData.betTokenAddress as `0x${string}`,
        ],
      });
    } catch (error: any) {
      console.error('Payment failed:', error);
      setStep('PAYMENT');
      toast.error(error.message || t('payment_failed') || 'Payment failed');
    }
  }, [
    hasTwitterLogin,
    hasWalletConnected,
    isWrongChain,
    expectedChainId,
    setupBetData,
    chainConfig,
    writePayContract,
    switchChain,
    t,
  ]);
  
  // 当 payTxHash 更新时，记录到当前会话的 ref 中
  useEffect(() => {
    if (payTxHash && isOpen && (step === 'MINTING' || step === 'PAYMENT')) {
      currentSessionTxHashRef.current = payTxHash;
    }
  }, [payTxHash, isOpen, step]);
  
  // 监听支付交易确认
  useEffect(() => {
    // 只有在弹窗打开且处于 MINTING 或 PAYMENT 步骤时才处理交易结果
    // 并且交易 hash 必须匹配当前会话
    if (
      isOpen &&
      (step === 'MINTING' || step === 'PAYMENT') &&
      isPayConfirmed &&
      payTxHash &&
      payTxHash === currentSessionTxHashRef.current &&
      setupBetData
    ) {
      // 调用成功回调接口
      const callSetupBetSuccess = async () => {
        try {
          // 使用保存的 endTimestamp，确保与合约调用时使用相同的值
          const endTimestamp = currentSessionEndTimestampRef.current;
          if (!endTimestamp) {
            throw new Error(t('create_market_end_timestamp_not_found'));
          }
          await setupBetSuccess({
            tx_hash: payTxHash,
            id: setupBetData.bet_topic_id,
            endTimestamp: endTimestamp,
            betTokenAddress: setupBetData.betTokenAddress,
          });
          // 刷新 bet list
          await invalidateBetList();
          setStep('SUCCESS');
        } catch (error: any) {
          console.error('Setup bet success callback failed:', error);
          toast.error(error?.message || t('create_market_failed') || 'Create market failed');
          setStep('PAYMENT');
        }
      };
      
      callSetupBetSuccess();
    }
  }, [isOpen, step, isPayConfirmed, payTxHash, setupBetData, t]);
  
  // 监听支付错误
  useEffect(() => {
    // 只有在弹窗打开且处于 MINTING 或 PAYMENT 步骤时才处理错误
    // 并且交易 hash 必须匹配当前会话（如果有的话）
    if (
      isOpen &&
      (step === 'MINTING' || step === 'PAYMENT') &&
      isPayWriteError &&
      payError &&
      (!payTxHash || payTxHash === currentSessionTxHashRef.current)
    ) {
      console.error('Pay write error:', payError);
      setStep('PAYMENT');
      const errorMessage = payError.message || t('payment_failed') || 'Payment failed';
      toast.error(errorMessage);
    }
  }, [isOpen, step, isPayWriteError, payError, payTxHash, t]);
  
  useEffect(() => {
    // 只有在弹窗打开且处于 MINTING 或 PAYMENT 步骤时才处理错误
    // 并且交易 hash 必须匹配当前会话（如果有的话）
    if (
      isOpen &&
      (step === 'MINTING' || step === 'PAYMENT') &&
      isPayReceiptError &&
      payReceiptError &&
      (!payTxHash || payTxHash === currentSessionTxHashRef.current)
    ) {
      console.error('Pay receipt error:', payReceiptError);
      setStep('PAYMENT');
      const errorMessage = payReceiptError.message || t('create_market_payment_transaction_failed');
      toast.error(errorMessage);
    }
  }, [isOpen, step, isPayReceiptError, payReceiptError, payTxHash, t]);
  
  const reset = useCallback(() => {
    setStep('INPUT');
    setUrl('');
    setError(null);
    setSetupBetData(null);
    // 注意：payTxHash 来自 wagmi hook，无法直接重置
    // 但通过添加 isOpen 和 step 检查，可以避免处理旧的交易结果
  }, []);
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
      onClose();
    }
  };
  
  // 只有在当前会话的交易才显示加载状态
  const isProcessing = 
    (isPayPending || isPayConfirming) && 
    (!payTxHash || payTxHash === currentSessionTxHashRef.current) &&
    isOpen &&
    (step === 'MINTING' || step === 'PAYMENT')
    || isSwitchingChain;
  
  // 获取用户头像和名字
  const userAvatar = twitterFullProfile?.profile_image_url || '';
  const userName = twitterFullProfile?.name || '';
  
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[90%] w-full gap-0 overflow-hidden rounded-3xl p-0 shadow-2xl sm:max-w-lg">
        {/* Background Effects */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-yellow-500/10 to-transparent dark:from-yellow-500/10"></div>
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-yellow-500/20 blur-[80px]"></div>
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-600/20 blur-[80px]"></div>

        <div className="p-5 md:p-8">
          {/* Header (Dynamic based on step) */}
          <DialogHeader className="mb-6 text-center md:mb-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-600 shadow-lg ring-1 shadow-orange-500/40 ring-yellow-200/50 transition-all duration-500 md:h-16 md:w-16">
              {step === 'SUCCESS' ? (
                <Rocket className="h-7 w-7 text-white md:h-8 md:w-8" />
              ) : (
                <Gem className="h-7 w-7 text-white drop-shadow-md md:h-8 md:w-8" />
              )}
            </div>
            <DialogTitle className="text-center text-2xl font-black tracking-tight md:text-3xl">
              {step === 'PAYMENT'
                ? t('create_market_deploy_asset')
                : step === 'SUCCESS'
                  ? t('create_market_market_live')
                  : t('create_market_market_launchpad')}
            </DialogTitle>
            <p className="text-muted-foreground mt-2 px-4 text-center text-xs font-medium md:text-sm">
              {step === 'PAYMENT'
                ? t('create_market_verify_eligibility')
                : t('create_market_tokenize_tweet')}
            </p>
          </DialogHeader>

          {/* STEP 1: INPUT */}
          {step === 'INPUT' && (
            <div className="space-y-5 md:space-y-6">
              {/* Wealth Simulator Card */}
              <div className="relative overflow-hidden rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-50 to-orange-50 p-4 md:p-5 dark:from-yellow-900/20 dark:to-orange-900/10">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <Coins className="h-20 w-20 text-yellow-600 md:h-24 md:w-24 dark:text-yellow-500" />
                </div>

                <div className="relative z-10">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex items-center justify-center rounded-md bg-yellow-500 px-2 py-0.5 text-[10px] font-bold tracking-wider text-black uppercase">
                      {t('create_market_creator_royalty')}
                    </span>
                    <span className="animate-pulse text-xs font-semibold text-yellow-700 dark:text-yellow-400">
                      {t('create_market_perpetual_revenue')}
                    </span>
                  </div>

                  <div className="mb-2 flex items-end gap-3">
                    <span className="text-4xl font-black tracking-tighter drop-shadow-sm md:text-5xl">
                      5<span className="text-2xl md:text-3xl">%</span>
                    </span>
                    <span className="text-muted-foreground mb-2 text-xs font-medium md:text-sm">
                      {t('create_market_of_total_volume')}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="text-muted-foreground flex justify-between text-xs">
                      <span>{t('create_market_projected_volume')}</span>
                      <span>{t('create_market_your_payout')}</span>
                    </div>
                    <div className="flex h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                      <div className="h-full w-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-yellow-600 to-yellow-400"></div>
                    </div>
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-muted-foreground text-xs">{t('create_market_projected_amount')}</span>
                      <span className="text-base font-bold text-yellow-600 md:text-lg dark:text-yellow-400">
                        {t('create_market_payout_amount')}
                      </span>
                    </div>
                  </div>

                  {/* Event Ownership Rights */}
                  <div className="mt-4 flex items-start gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
                    <div className="mt-0.5 shrink-0 rounded-full bg-yellow-500 p-1.5 text-white shadow-sm">
                      <Crown className="h-3 w-3" />
                    </div>
                    <div className="text-xs">
                      <p className="mb-0.5 font-bold text-yellow-700 dark:text-yellow-400">
                        {t('create_market_event_owner_rights')}
                      </p>
                      <p className="text-muted-foreground leading-tight opacity-80">
                        {t('create_market_owner_rights_desc')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Section */}
              <div className="space-y-2 md:space-y-3">
                <label className="text-muted-foreground mb-2 ml-1 text-xs font-bold tracking-wider uppercase ">
                  {t('create_market_tweet_url_label')}
                </label>
                <div className="group relative">
                  <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600 opacity-20 blur transition duration-500 group-hover:opacity-60"></div>
                  <Input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder={t('create_market_tweet_url_placeholder')}
                    className="placeholder-muted-foreground relative !h-auto w-full rounded-xl !px-4 !py-3 text-sm shadow-inner transition-all focus:!border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none md:!py-4 md:!text-base"
                  />
                </div>
                {error && (
                  <div className="animate-in slide-in-from-top-1 flex items-center gap-2 px-2 text-xs font-medium text-red-500">
                    <AlertCircle className="h-3 w-3" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* 登录状态检查 */}
              {!hasTwitterLogin ? (
                <div className="flex w-full">
                  <XAuth className="!h-auto w-full rounded-xl bg-blue-600 py-4 text-base text-white shadow-lg transition-all hover:bg-blue-500" />
                </div>
              ) : (
                <div className="pt-2">
                  <button
                    onClick={handleAnalyze}
                    disabled={!url}
                    className="group relative w-full overflow-hidden rounded-xl px-6 py-3.5 shadow-xl transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 md:py-4"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-90 transition-opacity group-hover:opacity-100"></div>
                    <div className="relative flex items-center justify-center gap-2 text-xs font-black tracking-wide text-white uppercase md:text-sm">
                      <ScanLine className="h-4 w-4" />
                      <span>{t('create_market_analyze_launch')}</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: ANALYZING */}
          {step === 'ANALYZING' && (
            <div className="animate-in fade-in zoom-in-95 space-y-6 py-8 text-center duration-300 md:space-y-8 md:py-12">
              <div className="relative mx-auto h-24 w-24 md:h-28 md:w-28">
                <div className="border-surfaceHighlight absolute inset-0 rounded-full border-2"></div>
                <div className="absolute inset-0 animate-spin rounded-full border-t-2 border-blue-500"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-blue-500/10 md:h-20 md:w-20">
                    <ScanLine className="h-6 w-6 text-blue-500 md:h-8 md:w-8" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold md:text-xl">{t('create_market_ai_scanning')}</h3>
                <p className="text-muted-foreground text-xs md:text-sm">
                  {t('create_market_checking_viability')}
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT */}
          {step === 'PAYMENT' && setupBetData && (
            <div className="animate-in fade-in slide-in-from-right-4 space-y-5 duration-300 md:space-y-6">
              {/* Result Card */}
              <div className="flex items-start gap-4 rounded-xl border border-green-500/30 bg-green-500/5 p-4">
                <div className="shrink-0 rounded-full bg-green-500/20 p-2 text-green-500">
                  <ShieldCheck className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold md:text-base">{t('create_market_asset_eligible')}</h4>
                  <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                    {t('create_market_high_volume_detected', { id: setupBetData.bet_topic_id })}
                  </p>
                </div>
              </div>

              {/* Fee Section */}
              <div className="dark:bg-muted/20 bg-accent rounded-2xl p-5 md:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs font-medium md:text-sm">
                    {t('create_market_minting_fee')}
                  </span>
                  <span className="font-mono text-base font-bold md:text-lg">{t('create_market_minting_fee_amount')}</span>
                </div>
                {/* <div className="bg-border mb-4 h-px w-full"></div> */}
                {/* <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs font-medium md:text-sm">
                    Est. Weekly Revenue
                  </span>
                  <span className="text-xs font-bold text-green-500 md:text-sm">~$340.00</span>
                </div> */}
              </div>

              {/* 钱包连接检查 */}
              {!hasWalletConnected ? (
                <div className="flex w-full">
                  <UIWallet
                    className="!h-auto w-full flex-1 !rounded-xl !py-4"
                    chainId={expectedChainId || undefined}
                  />
                </div>
              ) : isWrongChain ? (
                <button
                  onClick={async () => {
                    if (expectedChainId) {
                      try {
                        await switchChain({ chainId: expectedChainId });
                      } catch (error) {
                        console.error('Switch chain failed:', error);
                        toast.error(t('switch_chain_failed') || 'Switch chain failed');
                      }
                    }
                  }}
                  disabled={isSwitchingChain}
                  className="w-full rounded-xl bg-yellow-600 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-yellow-500 disabled:cursor-wait disabled:opacity-70"
                >
                  {isSwitchingChain
                    ? t('switching') || 'Switching...'
                    : t('switch_to_chain', { chainName: chainConfig?.name || 'Base' }) ||
                      'Switch Chain'}
                </button>
              ) : (
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="group relative w-full overflow-hidden rounded-xl px-6 py-3.5 shadow-xl transition-all active:scale-95 disabled:cursor-wait disabled:opacity-70 md:py-4"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 opacity-90 transition-opacity group-hover:opacity-100"></div>
                  <div className="relative flex items-center justify-center gap-2 text-xs font-black tracking-wide text-white uppercase md:text-sm">
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{t('create_market_processing')}</span>
                      </>
                    ) : (
                      <>
                        <Wallet className="h-4 w-4" />
                        <span>{t('create_market_pay_mint')}</span>
                      </>
                    )}
                  </div>
                </button>
              )}
              <p className="text-muted-foreground text-center text-[10px]">
                {t('create_market_secure_transaction')}
              </p>
            </div>
          )}

          {/* STEP 4: MINTING (Processing Payment) */}
          {step === 'MINTING' && (
            <div className="space-y-6 py-8 text-center md:space-y-8 md:py-12">
              <div className="relative mx-auto h-24 w-24 md:h-28 md:w-28">
                <div className="border-surfaceHighlight absolute inset-0 rounded-full border-2"></div>
                <div className="absolute inset-0 animate-spin rounded-full border-t-2 border-yellow-500"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10 md:h-20 md:w-20">
                    <Wallet className="h-6 w-6 animate-pulse text-yellow-500 md:h-8 md:w-8" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold md:text-xl">{t('create_market_minting_asset')}</h3>
                <p className="text-muted-foreground text-xs md:text-sm">
                  {t('create_market_deploying_contract')}
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS */}
          {step === 'SUCCESS' && (
            <div className="animate-in zoom-in-95 relative text-center duration-500">
              {/* Confetti / Glow Effect */}
              <div className="pointer-events-none absolute inset-0 -top-20 bg-gradient-to-b from-yellow-500/10 to-transparent blur-3xl"></div>

              <div className="relative z-10">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-700 shadow-[0_0_30px_rgba(16,185,129,0.4)] md:mb-6 md:h-24 md:w-24">
                  <Rocket className="h-8 w-8 text-white drop-shadow-md md:h-10 md:w-10" />
                </div>

                <h3 className="mb-2 text-2xl font-black md:text-3xl">{t('create_market_market_deployed')}</h3>
                <p className="text-muted-foreground mb-6 text-xs md:mb-8 md:text-sm">
                  {t('create_market_owner_message')}
                </p>

                {/* Ownership Card */}
                <div className="dark:bg-muted/20 bg-accent mb-6 rounded-xl p-3 shadow-inner md:mb-8 md:p-4">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border">
                      {userAvatar ? (
                        <img
                          src={userAvatar}
                          className="h-full w-full rounded-full object-cover opacity-90"
                          alt={t('create_market_you')}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://picsum.photos/id/64/100/100';
                          }}
                        />
                      ) : (
                        <div className="h-full w-full rounded-full bg-gray-300"></div>
                      )}
                      <div className="absolute -top-1 -right-1 rounded-full bg-yellow-500 p-0.5 text-white shadow-sm">
                        <Crown className="h-2.5 w-2.5" />
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-muted-foreground text-[10px] font-bold uppercase">{t('create_market_role')}</p>
                      <p className="text-sm font-bold">{t('create_market_market_owner')}</p>
                      {userName && (
                        <p className="text-muted-foreground text-[10px] mt-0.5">@{twitterFullProfile?.screen_name || userName}</p>
                      )}
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-muted-foreground text-[10px] font-bold uppercase">
                        {t('create_market_revenue_share')}
                      </p>
                      <p className="text-lg font-black text-yellow-600 md:text-xl dark:text-yellow-500">
                        5.0%
                      </p>
                    </div>
                  </div>
                  {/* <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                    <div className="h-full w-1/12 bg-green-500"></div>
                  </div> */}
                  <div className="text-muted-foreground mt-2 flex justify-between font-mono text-[10px]">
                    <span>{t('create_market_status_live')}</span>
                    <span>{t('create_market_vol_zero')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={reset}
                    className="dark:bg-muted/20 bg-accent dark:hover:bg-muted/30 hover:bg-muted/30 rounded-xl py-3 text-xs font-bold transition-colors md:py-3.5 md:text-sm"
                  >
                    {t('create_market_view_market')}
                  </button>
                  {setupBetData && (
                    <Link
                      href={`${PagesRoute.OPINIONS}/${setupBetData.bet_topic_id}`}
                      onClick={reset}
                      className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 md:py-3.5 md:text-sm"
                    >
                      <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      {t('create_market_shill_to_earn')}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
