import React, { useEffect, useState, useCallback, memo, useRef } from 'react';
import { Button } from '@shadcn/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from '@shadcn/components/ui/dialog';
import { Loader2, LoaderCircle } from 'lucide-react';
import { Fail, Success, MoneyBag } from '@assets/svg';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import Loader from '@ui/loading/loader';
import { useAppSelector } from '@store/hooks';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi';
import { getContractAddress } from '@constants/config';
import Activityservice_abi from '@constants/abi/Activityservice_abi.json';
import { cn } from '@shadcn/lib/utils';
import { getExplorerLink } from '@constants/chains';
import {
  getReceiveRewardSignature,
  getReceiveRewardCallback,
  getSolanaClaimReward,
} from '@libs/request';
import UIWallet from '@ui/wallet';
import useUserInfo from '@hooks/useUserInfo';
import { DEFAULT_CHAIN } from '@constants/chains';
import { formatBigNumber, parseToBigNumber, toContractAmount } from '@libs/utils/format-bignumber';
import useUserActivityReward from '@hooks/useUserActivityReward';
import UIDialogBindEmail from '@ui/dialog/BindEmail';
import Connect from '@ui/solanaConnect/connect';
import { useWallet } from '@solana/wallet-adapter-react';

interface DialogClaimRewardProps {
  isOpen: boolean;
  onClose: () => void;
  eventInfo: any;
  onRefresh?: () => Promise<void>;
}

const DialogClaimReward = memo(
  function DialogClaimReward({ isOpen, onClose, eventInfo, onRefresh }: DialogClaimRewardProps) {
    const t = useTranslations('common');
    const [isClaiming, setIsClaiming] = useState(false);
    const [isClaimSuccess, setIsClaimSuccess] = useState(false);
    const [isClaimFailed, setIsClaimFailed] = useState(false);
    const [isWrongChain, setIsWrongChain] = useState(false);
    const [hasStartedClaim, setHasStartedClaim] = useState(false); // 跟踪是否已经开始领取流程
    const [isBindEmailDialogOpen, setIsBindEmailDialogOpen] = useState(false); // 绑定邮箱弹窗状态
    const [claimedAmount, setClaimedAmount] = useState<number>(0); // 缓存领取时的奖励数量
    const hasProcessedSuccessRef = useRef(false); // 跟踪是否已经处理过成功状态
    const isRequestingSignatureRef = useRef(false); // 跟踪是否正在请求签名
    const [signatureData, setSignatureData] = useState<{
      amounts: number[];
      rewardIds: number[];
      timestamp: number;
      signature: string;
      tokenAddress: string;
    } | null>(null);
    const { eventId } = useParams();
    const payTokenInfo = useAppSelector((state) => state.userReducer?.pay_token_info);
    const isLoggedIn = useAppSelector((state) => state.userReducer?.isLoggedIn);
    const twInfo = useAppSelector((state) => state.userReducer?.twitter_full_profile);
    const isLoginSolana = useAppSelector((state) => state.userReducer?.isLoginSolana);
    const { address, chainId } = useAccount();
    const { switchChain } = useSwitchChain();
    const { isPending, isConnected, isLogin, connect, login, logout, email } = useUserInfo();
    const { publicKey, signMessage } = useWallet();

    // 使用新的 hook 从 store 中获取用户活动奖励数据
    const {
      data: userActivityReward,
      isLoading: isUserActivityRewardLoading,
      refetch: refetchUserActivityReward,
      totalReceiveAmount,
    } = useUserActivityReward({
      eventId: eventInfo?.id?.toString() || '',
      enabled: !!eventInfo?.id && isOpen, // 只有在弹窗打开时才获取数据
    });

    // 合约调用
    const {
      data: claimData,
      writeContract: claimByReward,
      isError: isWriteError,
      error: writeError,
      isPending: isWritePending,
    } = useWriteContract();

    // 等待交易确认
    const {
      isLoading: isConfirming,
      isSuccess: isConfirmed,
      isError: isError,
      error: error,
    } = useWaitForTransactionReceipt({
      hash: claimData,
    });

    // 检查当前链是否为默认链
    useEffect(() => {
      if (chainId && DEFAULT_CHAIN.id !== chainId) {
        setIsWrongChain(true);
      } else {
        setIsWrongChain(false);
      }
    }, [chainId]);

    // 切换到默认链
    const handleSwitchChain = async () => {
      try {
        await switchChain({ chainId: DEFAULT_CHAIN.id });
      } catch (error) {
        console.error('切换链失败:', error);
        toast.error(t('switch_chain_failed'));
      }
    };

    // 检查邮箱是否已绑定
    const isEmailBound = () => {
      const userEmail = twInfo?.email || email || '';
      return userEmail && userEmail.includes('@') && userEmail.length > 3;
    };

    // 处理合约调用成功后的操作
    const handleContractSuccess = useCallback(async () => {
      setIsClaimSuccess(true);
      // 刷新用户活动奖励数据和父组件数据
      await refetchUserActivityReward();
      toast.success(
        t.rich('reward_claimed_successfully', {
          amount: (chunks) => <span className="text-primary">{claimedAmount}</span>,
        }),
        {
          action: (
            <Button
              variant="outline"
              onClick={() =>
                window.open(
                  getExplorerLink(chainId as number, claimData as `0x${string}`),
                  '_blank'
                )
              }
            >
              {t('view_transaction')}
            </Button>
          ),
        }
      );
      onRefresh?.();
    }, [t, claimedAmount, chainId, claimData, refetchUserActivityReward, onRefresh]);

    // 静默调用回调接口（不影响UI状态）
    const callActivityCallbackReward = useCallback(async () => {
      if (!claimData || !signatureData) {
        return;
      }

      try {
        // 静默调用回调接口，不处理返回结果，只记录日志
        const res: any = await getReceiveRewardCallback({
          rewardIds: signatureData.rewardIds,
          tx_hash: claimData,
        });
        setIsClaiming(false);
        // 直接显示成功状态
        handleContractSuccess();
        // 刷新用户活动奖励数据和父组件数据
        refetchUserActivityReward();
        console.log('Callback reward result:', res);
      } catch (error) {
        // 合约调用成功 回调无论是否成功都应该提示成功领取弹窗
        setIsClaiming(false);
        // 直接显示成功状态
        handleContractSuccess();
        // 刷新用户活动奖励数据和父组件数据
        refetchUserActivityReward();

        console.error('Failed to create activity callback reward (silent):', error);
      }
    }, [claimData, signatureData]);

    // 监听交易确认状态
    useEffect(() => {
      if (isConfirmed && !hasProcessedSuccessRef.current && isOpen) {
        hasProcessedSuccessRef.current = true; // 标记已处理，避免重复调用
        // setIsClaiming(false);
        // // 直接显示成功状态
        // handleContractSuccess();
        // 静默调用回调接口
        callActivityCallbackReward();
      }
    }, [isConfirmed, isOpen]);

    // 监听交易错误
    useEffect(() => {
      if (isError) {
        setIsClaiming(false);
        setIsClaimFailed(true);
        setHasStartedClaim(false); // 重置状态以允许重试
        hasProcessedSuccessRef.current = false; // 重置成功处理标记，允许重试
        isRequestingSignatureRef.current = false; // 重置签名请求标记
        toast.error(t('transaction_failed'));
        console.error('Transaction error:', error);
      }
    }, [isError, error, t]);

    // 监听合约调用错误状态
    useEffect(() => {
      if (isWriteError) {
        setIsClaiming(false);
        setIsClaimFailed(true);
        setHasStartedClaim(false); // 重置状态以允许重试
        hasProcessedSuccessRef.current = false; // 重置成功处理标记，允许重试
        isRequestingSignatureRef.current = false; // 重置签名请求标记
        toast.error(t('contract_call_failed'));
        console.error('Contract call error:', writeError);
      }
    }, [isWriteError, writeError, t]);

    const handleClose = useCallback(() => {
      setIsClaimSuccess(false);
      setIsClaimFailed(false);
      setSignatureData(null);
      setHasStartedClaim(false); // 重置开始领取状态
      setClaimedAmount(0); // 重置缓存的奖励数量
      setIsBindEmailDialogOpen(false); // 重置绑定邮箱弹窗状态
      hasProcessedSuccessRef.current = false; // 重置成功处理标记
      isRequestingSignatureRef.current = false; // 重置签名请求标记
      onClose();
    }, [onClose]);

    const handleClaimReward = useCallback(async () => {
      if (!address) {
        toast.error(t('please_connect_wallet'));
        return;
      }

      // 如果已经开始了领取流程或正在请求签名，避免重复执行
      if (hasStartedClaim || isRequestingSignatureRef.current) {
        return;
      }

      try {
        setIsClaiming(true);
        setHasStartedClaim(true); // 标记已经开始领取流程
        isRequestingSignatureRef.current = true; // 标记正在请求签名

        const availableRewards = totalReceiveAmount;
        if (availableRewards === 0 && eventInfo?.a_type === 'normal') {
          toast.error(t('no_rewards_to_claim'));
          setIsClaiming(false);
          setHasStartedClaim(false); // 重置状态以允许重试
          isRequestingSignatureRef.current = false; // 重置签名请求标记
          return;
        }

        // 缓存领取时的奖励数量，用于成功弹窗显示
        setClaimedAmount(availableRewards);

        // 1. 调用签名接口
        const signatureRes: any = await getReceiveRewardSignature({
          tokenAddress: getContractAddress().pay_member_token_address as `0x${string}`,
          // amount: toContractAmount(String(availableRewards), payTokenInfo?.decimals || 6).toString(),
          activeId: eventId as string,
          receiver: address,
        });

        if (signatureRes.code !== 200) {
          toast.error(signatureRes.msg || t('failed_to_get_signature'));
          setIsClaiming(false);
          setIsClaimFailed(true);
          setHasStartedClaim(false); // 重置状态以允许重试
          isRequestingSignatureRef.current = false; // 重置签名请求标记
          return;
        }

        if (signatureRes.data.code === 200) {
          onRefresh?.();
        }

        const { tokenAddress, amounts, rewardIds, timestamp, signature } = signatureRes.data;

        // 保存签名数据，用于后续回调
        setSignatureData({ amounts, rewardIds, timestamp, signature, tokenAddress });

        // 2. 调用合约方法
        claimByReward({
          address: getContractAddress().ActivityServiceAddress as `0x${string}`,
          abi: Activityservice_abi,
          functionName: 'claimByReward',
          args: [tokenAddress, amounts, rewardIds, timestamp, signature],
        });

        // 合约调用已发起，重置签名请求标记
        isRequestingSignatureRef.current = false;
      } catch (error) {
        console.error('Failed to claim reward:', error);
        toast.error(t('failed_to_claim_reward'));
        setIsClaiming(false);
        setIsClaimFailed(true);
        setHasStartedClaim(false); // 重置状态以允许重试
        isRequestingSignatureRef.current = false; // 重置签名请求标记
      }
    }, [
      address,
      hasStartedClaim,
      totalReceiveAmount,
      eventInfo?.a_type,
      t,
      eventId,
      onRefresh,
      claimByReward,
      payTokenInfo?.decimals,
    ]);

    const handleClaimRewardSolana = useCallback(async () => {
      if (!isLoginSolana || !publicKey) {
        toast.error(t('please_connect_wallet'));
        return;
      }

      // 如果已经开始了领取流程或正在请求签名，避免重复执行
      if (hasStartedClaim || isRequestingSignatureRef.current) {
        return;
      }

      try {
        setIsClaiming(true);
        setHasStartedClaim(true); // 标记已经开始领取流程
        isRequestingSignatureRef.current = true; // 标记正在请求签名

        const availableRewards = totalReceiveAmount;
        if (availableRewards === 0 && eventInfo?.a_type === 'normal') {
          toast.error(t('no_rewards_to_claim'));
          setIsClaiming(false);
          setHasStartedClaim(false); // 重置状态以允许重试
          isRequestingSignatureRef.current = false; // 重置签名请求标记
          return;
        }

        // 缓存领取时的奖励数量，用于成功弹窗显示
        setClaimedAmount(availableRewards);

        // 1. 构建需要签名的消息：receive_amount,active_id,时间戳
        const timestamp = Math.floor(Date.now() / 1000);
        // 将 availableRewards 转换为正确的精度（乘以 10^6）
        const amountWithPrecision = Math.floor(availableRewards * Math.pow(10, 6));
        const messageToSign = `${amountWithPrecision},${eventId},${timestamp}`;

        // 2. 使用 Solana 钱包签名消息
        if (!signMessage) {
          toast.error(t('wallet_not_connected'));
          setIsClaiming(false);
          setIsClaimFailed(true);
          setHasStartedClaim(false);
          isRequestingSignatureRef.current = false;
          return;
        }

        const messageBytes = new TextEncoder().encode(messageToSign);
        const signature = await signMessage(messageBytes);

        if (!signature) {
          toast.error(t('signature_failed'));
          setIsClaiming(false);
          setIsClaimFailed(true);
          setHasStartedClaim(false);
          isRequestingSignatureRef.current = false;
          return;
        }

        // 3. 将签名转换为 base64 字符串
        const signatureString = Buffer.from(signature).toString('base64');

        // 4. 调用领取接口提交签名
        const claimRes: any = await getSolanaClaimReward({
          receive_amount: amountWithPrecision,
          active_id: eventId as string,
          signature: signatureString,
          solana_address: publicKey.toString(),
        });

        // 重置签名请求标记
        isRequestingSignatureRef.current = false;

        if (claimRes.code === 200) {
          // 成功状态
          setIsClaiming(false);
          setIsClaimSuccess(true);
          toast.success(
            t.rich('reward_claimed_successfully', {
              amount: (chunks) => <span className="text-primary">{availableRewards}</span>,
            })
          );
          // 刷新用户活动奖励数据和父组件数据
          await refetchUserActivityReward();
          onRefresh?.();
        } else {
          // 失败状态
          setIsClaiming(false);
          setIsClaimFailed(true);
          setHasStartedClaim(false);
          toast.error(claimRes.msg || t('claim_failed'));
        }
      } catch (error) {
        console.error('Failed to claim reward:', error);
        toast.error(t('failed_to_claim_reward'));
        setIsClaiming(false);
        setIsClaimFailed(true);
        setHasStartedClaim(false);
        isRequestingSignatureRef.current = false;
      }
    }, [
      isLoginSolana,
      publicKey,
      hasStartedClaim,
      totalReceiveAmount,
      eventInfo?.a_type,
      t,
      eventId,
      signMessage,
      refetchUserActivityReward,
      onRefresh,
    ]);

    // 自动开始领取流程或显示绑定邮箱弹窗
    useEffect(() => {
      if (eventInfo?.chain_type === 'BASE') {
        if (
          isOpen &&
          !isClaiming &&
          !isClaimSuccess &&
          !isClaimFailed &&
          !hasStartedClaim && // 避免重复开始领取流程
          address &&
          !isWrongChain &&
          isLogin // 只有在登录状态下才自动执行领取流程
        ) {
          // 检查邮箱是否已绑定
          if (!isEmailBound()) {
            // 如果没有绑定邮箱，打开绑定邮箱弹窗
            setIsBindEmailDialogOpen(true);
          } else {
            // 如果已绑定邮箱，继续正常的领取流程
            handleClaimReward();
          }
        }
      } else {
        if (
          isOpen &&
          !isClaiming &&
          !isClaimSuccess &&
          !isClaimFailed &&
          !hasStartedClaim && // 避免重复开始领取流程
          isLoginSolana // 只有在登录状态下才自动执行领取流程
        ) {
          handleClaimRewardSolana();
        }
      }
    }, [
      isOpen,
      address,
      isWrongChain,
      hasStartedClaim,
      isClaiming,
      isClaimSuccess,
      isClaimFailed,
      isLogin,
      isLoginSolana,
      handleClaimReward,
      handleClaimRewardSolana,
      twInfo?.email,
      email,
      eventInfo?.chain_type,
    ]);

    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogClose asChild></DialogClose>
        <DialogContent
          className="border-border flex max-h-[90vh] w-96 max-w-full flex-col gap-0 overflow-hidden bg-transparent p-4 shadow-none sm:w-96 sm:max-w-full sm:p-0"
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
              'bg-background space-y-4 rounded-t-xl rounded-b-xl p-6 sm:rounded-t-2xl sm:rounded-b-2xl'
            )}
          >
            {(!isLogin && eventInfo?.chain_type === 'BASE') ||
            (isWrongChain && eventInfo?.chain_type === 'BASE') ||
            (!isLoginSolana && eventInfo?.chain_type === 'Solana') ? (
              // 未连接钱包状态
              <div className="flex flex-col items-center justify-center space-y-4">
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
                {isWrongChain && eventInfo?.chain_type === 'BASE' && (
                  <div className="flex w-full flex-col items-center justify-center rounded-md bg-yellow-100 p-4 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
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
                {!isWrongChain && eventInfo?.chain_type === 'BASE' && (
                  <div className="flex w-40">
                    <UIWallet className="!h-auto flex-1 !rounded-lg" onSuccess={handleClose} />
                  </div>
                )}
                {!isLoginSolana && eventInfo?.chain_type === 'Solana' && (
                  <div className="flex">
                    <Connect onSuccess={handleClose} onWalletModalOpen={handleClose} />
                  </div>
                )}
              </div>
            ) : isClaiming || isConfirming ? (
              // 加载状态
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader />
                <div className="text-center">
                  <p className="text-sm">{t('claiming')}</p>
                </div>
              </div>
            ) : isClaimSuccess ? (
              // 领取成功弹窗
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full">
                  <Success className="h-full w-full text-white" />
                </div>
                <div className="text-center">
                  <p className="text-md">{t('congratulations')}</p>
                  <p className="text-sm">
                    {t('reward_sent_to_wallet', {
                      amount: claimedAmount,
                      symbol: payTokenInfo?.symbol || 'USDC',
                    })}
                  </p>
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
            ) : isClaimFailed ? (
              // 领取失败弹窗
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full">
                  <Fail className="h-full w-full text-white" />
                </div>
                <div className="text-center">
                  <p className="text-md">{t('claim_failed')}</p>
                  <p className="text-muted-foreground text-sm">{t('claim_failed_description')}</p>
                </div>
                <div className="flex w-full gap-3">
                  <Button
                    variant="secondary"
                    onClick={handleClose}
                    className="border-border hover:bg-muted-foreground/10 !h-auto flex-1 !rounded-lg"
                  >
                    {t('close')}
                  </Button>
                  <Button
                    onClick={
                      eventInfo?.chain_type === 'BASE' ? handleClaimReward : handleClaimRewardSolana
                    }
                    disabled={isWrongChain || isClaiming || isConfirming || isWritePending}
                    className="bg-primary hover:bg-primary/90 !h-auto flex-1 !rounded-lg text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isClaiming || isConfirming || isWritePending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <MoneyBag className="mr-2 h-4 w-4" />
                    )}
                    {isClaiming || isConfirming || isWritePending ? t('claiming') : t('try_again')}
                  </Button>
                </div>
              </div>
            ) : (
              // 初始状态（通常不会显示，因为会自动开始领取）
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="bg-primary/10 flex h-20 w-20 items-center justify-center rounded-full">
                  <MoneyBag className="text-primary h-10 w-10" />
                </div>
                <div className="text-center">
                  <p className="text-md">{t('preparing_to_claim')}</p>
                  <p className="text-muted-foreground text-sm">
                    {t('preparing_to_claim_description')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>

        {/* 绑定邮箱弹窗 */}
        {isBindEmailDialogOpen && (
          <UIDialogBindEmail
            open={isBindEmailDialogOpen}
            onOpenChange={(open) => {
              setIsBindEmailDialogOpen(open);
              if (!open) {
                // 如果邮箱绑定成功或取消，检查是否可以继续领取流程
                if (eventInfo?.chain_type === 'BASE') {
                  if (isEmailBound() && address && !isWrongChain && isLogin) {
                    handleClaimReward();
                  } else {
                    // 如果没有成功绑定邮箱，关闭主弹窗
                    handleClose();
                  }
                } else {
                  if (isLoginSolana) {
                    handleClaimRewardSolana();
                  } else {
                    handleClose();
                  }
                }
              }
            }}
            nonClosable={false}
            kol={true}
          >
            <div />
          </UIDialogBindEmail>
        )}
      </Dialog>
    );
  },
  (prevProps, nextProps) => {
    // 自定义比较函数，只有在关键props真正改变时才重新渲染
    return (
      prevProps.isOpen === nextProps.isOpen &&
      prevProps.eventInfo?.id === nextProps.eventInfo?.id &&
      prevProps.onClose === nextProps.onClose &&
      prevProps.onRefresh === nextProps.onRefresh
    );
  }
);

export default DialogClaimReward;
