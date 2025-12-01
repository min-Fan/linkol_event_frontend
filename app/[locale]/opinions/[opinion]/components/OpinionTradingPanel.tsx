'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { ArrowRight, HelpCircle, Info, Share2, TrendingUp, Loader2, Wallet } from 'lucide-react';
import { useBetDetail } from '@hooks/useBetDetail';
import { useTranslations } from 'next-intl';
import { PredictionSide } from '../types';
import HowItWork from './HowItWork';
import { Input } from '@shadcn/components/ui/input';
import {
  useAccount,
  useSwitchChain,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useBalance,
} from 'wagmi';
import { erc20Abi, decodeEventLog } from 'viem';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import {
  ChainType,
  getChainConfig,
  getDefaultChain,
  getChainTypeFromChainId,
} from '@constants/config';
import useUserInfo from '@hooks/useUserInfo';
import Bet_abi from '@constants/abi/Bet_abi.json';
import { formatPrecision } from '@libs/utils';
import { parseToBigNumber, formatBigNumber } from '@libs/utils/format-bignumber';
import UIWallet from '@ui/wallet';
import XAuth from '@ui/profile/components/XAuth';
import { useAppSelector } from '@store/hooks';
import { doBetSuccess, claimSuccess } from '@libs/request';

interface OpinionTradingPanelProps {
  onShare?: (side: PredictionSide) => void;
}

// 提取有效的错误消息
const extractErrorMessage = (error: any): string => {
  if (!error) return '';

  // 尝试从 shortMessage 获取
  if (error.shortMessage) {
    // 如果是 "execution reverted" 类型，尝试从 message 中提取原因
    if (error.shortMessage.includes('reverted')) {
      // 从 message 中提取 "reason:" 后面的内容
      const reasonMatch = error.message?.match(/reason:\s*(.+?)(?:\n|$)/i);
      if (reasonMatch && reasonMatch[1]) {
        return reasonMatch[1].trim();
      }
      // 尝试从 message 中提取 "Execution reverted with reason:" 后面的内容
      const executionMatch = error.message?.match(
        /Execution reverted with reason:\s*(.+?)(?:\n|$)/i
      );
      if (executionMatch && executionMatch[1]) {
        return executionMatch[1].trim();
      }
    }
    return error.shortMessage;
  }

  // 尝试从 message 中提取原因
  if (error.message) {
    // 提取 "Execution reverted with reason:" 后面的内容
    const executionMatch = error.message.match(
      /Execution reverted with reason:\s*(.+?)(?:\n|Details:|$)/i
    );
    if (executionMatch && executionMatch[1]) {
      return executionMatch[1].trim();
    }
    // 提取 "reason:" 后面的内容
    const reasonMatch = error.message.match(/reason:\s*(.+?)(?:\n|Details:|$)/i);
    if (reasonMatch && reasonMatch[1]) {
      return reasonMatch[1].trim();
    }
    // 如果包含 "reverted"，返回简短消息
    if (error.message.includes('reverted')) {
      return error.message.split('\n')[0] || error.message;
    }
    return error.message;
  }

  // 尝试从 cause 中获取
  if (error.cause) {
    return extractErrorMessage(error.cause);
  }

  return '';
};

export default function OpinionTradingPanel({ onShare }: OpinionTradingPanelProps) {
  const params = useParams();
  const opinionId = params?.opinion as string;
  const { yesPercentage, noPercentage, betDetail, tokenAddress, chainId, attitude } =
    useBetDetail(opinionId);
  const t = useTranslations('common');
  const { address, chainId: currentChainId, isConnected } = useAccount();
  const { isLogin } = useUserInfo();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  // 检查 Twitter 登录状态
  const isTwitterLoggedIn = useAppSelector((state) => state.userReducer?.isLoggedIn);
  const twitterFullProfile = useAppSelector((state) => state.userReducer?.twitter_full_profile);
  const hasTwitterLogin = isTwitterLoggedIn && twitterFullProfile;

  // 检查钱包连接状态
  const hasWalletConnected = isConnected && !!address;

  // 确定使用的链（chainId 为 0 或 undefined 时使用 base）
  const betChainId = !chainId || chainId === 0 ? 84532 : Number(chainId);
  // 根据 chainId 确定链类型
  const chainType = getChainTypeFromChainId(betChainId);
  const chainConfig = getChainConfig(chainType);
  const expectedChainId = chainConfig ? parseInt(chainConfig.chainId) : null;
  const isWrongChain = currentChainId !== expectedChainId;

  // Wagmi hooks for contract interactions
  const {
    writeContract: writeBetContract,
    isPending: isBetPending,
    error: betError,
    isError: isBetWriteError,
    data: betTxHash,
  } = useWriteContract();
  const {
    writeContract: writeApproveContract,
    isPending: isApprovePending,
    error: approveError,
    isError: isApproveWriteError,
    data: approveTxHash,
  } = useWriteContract();
  const {
    writeContract: writeClaimContract,
    isPending: isClaimPending,
    error: claimError,
    isError: isClaimWriteError,
    data: claimTxHash,
  } = useWriteContract();

  // Wait for transaction receipts
  const {
    isLoading: isBetConfirming,
    isSuccess: isBetConfirmed,
    isError: isBetReceiptError,
    error: betReceiptError,
  } = useWaitForTransactionReceipt({
    hash: betTxHash,
    query: {
      enabled: !!betTxHash,
    },
  });

  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } =
    useWaitForTransactionReceipt({
      hash: approveTxHash,
      query: {
        enabled: !!approveTxHash,
      },
    });

  const {
    isLoading: isClaimConfirming,
    isSuccess: isClaimConfirmed,
    isError: isClaimReceiptError,
    error: claimReceiptError,
    data: claimReceipt,
  } = useWaitForTransactionReceipt({
    hash: claimTxHash,
    query: {
      enabled: !!claimTxHash,
    },
  });

  // Read token allowance
  const { data: tokenAllowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: 'allowance',
    args:
      tokenAddress && address && chainConfig?.AgentBetAddress
        ? [address, chainConfig.AgentBetAddress as `0x${string}`]
        : undefined,
    query: {
      enabled:
        !!tokenAddress &&
        !!address &&
        !!chainConfig?.AgentBetAddress &&
        !isWrongChain &&
        tokenAddress !== ethers.ZeroAddress,
    },
  });

  // Read token balance
  const { data: tokenBalance } = useBalance({
    address: address,
    token:
      tokenAddress && tokenAddress !== ethers.ZeroAddress
        ? (tokenAddress as `0x${string}`)
        : undefined,
    query: {
      enabled: !!address && !!tokenAddress && !isWrongChain,
    },
  });

  // Read token decimals
  const { data: tokenDecimals } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: 'decimals',
    query: {
      enabled: !!tokenAddress && !isWrongChain && tokenAddress !== ethers.ZeroAddress, // 原生代币不需要查询 decimals
    },
  });

  // Read token symbol
  const { data: tokenSymbol } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: 'symbol',
    query: {
      enabled: !!tokenAddress && !isWrongChain && tokenAddress !== ethers.ZeroAddress, // 原生代币不需要查询 symbol
    },
  });

  // Read event info from contract
  const { data: eventInfo } = useReadContract({
    address: chainConfig?.AgentBetAddress as `0x${string}`,
    abi: Bet_abi,
    functionName: 'getEventInfo',
    args: opinionId ? [BigInt(opinionId)] : undefined,
    query: {
      enabled: !!opinionId && !!chainConfig?.AgentBetAddress && !isWrongChain,
    },
  });

  // Read user bet info from contract
  const { data: betInfo } = useReadContract({
    address: chainConfig?.AgentBetAddress as `0x${string}`,
    abi: Bet_abi,
    functionName: 'getBetInfo',
    args: opinionId && address ? [BigInt(opinionId), address as `0x${string}`] : undefined,
    query: {
      enabled: !!opinionId && !!address && !!chainConfig?.AgentBetAddress && !isWrongChain,
    },
  });

  // Read claimable amount from contract
  const { data: claimableAmount } = useReadContract({
    address: chainConfig?.AgentBetAddress as `0x${string}`,
    abi: Bet_abi,
    functionName: 'getClaimableAmount',
    args: opinionId && address ? [BigInt(opinionId), address as `0x${string}`] : undefined,
    query: {
      enabled: !!opinionId && !!address && !!chainConfig?.AgentBetAddress && !isWrongChain,
    },
  });

  useEffect(() => {
    console.log('getEventInfo', eventInfo);
    console.log('claimableAmount', claimableAmount);
  }, [eventInfo, claimableAmount]);

  // 获取代币精度：原生代币使用18，ERC20代币使用合约返回的decimals
  const tokenDecimalsValue =
    tokenAddress === ethers.ZeroAddress ? 18 : tokenDecimals ? Number(tokenDecimals) : 18; // 默认18位精度

  // 获取代币 symbol：原生代币不显示 symbol
  const displayTokenSymbol =
    tokenAddress === ethers.ZeroAddress ? '' : (tokenSymbol as string) || '';

  const [selectedSide, setSelectedSide] = useState<PredictionSide>(PredictionSide.YES);
  const [amount, setAmount] = useState<string>('');
  const [currentAllowance, setCurrentAllowance] = useState('0');
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [activeTab, setActiveTab] = useState<'yes' | 'no' | 'claim'>('yes');

  // 解析用户下注信息
  // betInfo 结构: {amount: bigint, choice: number, claimed: boolean}
  const userBetAmount =
    betInfo && (betInfo as any).amount
      ? formatBigNumber(BigInt((betInfo as any).amount.toString()), tokenDecimalsValue)
      : '0';
  const userBetChoice =
    betInfo && (betInfo as any).choice !== undefined ? Number((betInfo as any).choice) : null; // 0 = NO, 1 = YES
  const hasUserBet = userBetChoice !== null && parseFloat(userBetAmount) > 0;

  const amountNum = parseFloat(amount || '0');
  const availableBalance = tokenBalance ? parseFloat(tokenBalance.formatted) : 0;
  const hasSufficientBalance = amountNum > 0 && availableBalance >= amountNum;

  // 解析合约返回的 eventInfo
  // eventInfo 结构: {name, startTimestamp, endTimestamp, betTokenAddress, exists, settled, winningChoice, totalAmount, totalWinningAmount}
  const isSettled =
    eventInfo && typeof eventInfo === 'object' && 'settled' in eventInfo
      ? Boolean((eventInfo as any).settled)
      : false;

  // 解析可领取金额
  const claimableAmountFormatted =
    claimableAmount !== undefined && claimableAmount !== null
      ? formatBigNumber(BigInt(claimableAmount.toString()), tokenDecimalsValue)
      : '0';
  const claimableAmountNum = parseFloat(claimableAmountFormatted || '0');
  const hasClaimableAmount = claimableAmountNum > 0;

  // 检查用户是否已领取
  const hasClaimed = betInfo && (betInfo as any).claimed !== undefined && (betInfo as any).claimed;

  // canClaim: 活动已结算（settled = true）且用户还未 claim（claimed = false）且可领取金额 > 0
  const canClaim = isSettled && betInfo && !hasClaimed && hasClaimableAmount;
  const totalAmount =
    eventInfo && typeof eventInfo === 'object' && 'totalAmount' in eventInfo
      ? formatBigNumber(BigInt((eventInfo as any).totalAmount.toString()), tokenDecimalsValue)
      : '0';
  const totalWinningAmount =
    eventInfo && typeof eventInfo === 'object' && 'totalWinningAmount' in eventInfo
      ? formatBigNumber(
          BigInt((eventInfo as any).totalWinningAmount.toString()),
          tokenDecimalsValue
        )
      : '0';
  const totalAmountNum = parseFloat(totalAmount || '0');
  const totalWinningAmountNum = parseFloat(totalWinningAmount || '0');

  // 获取当前选择方的占比（百分比）
  const selectedSidePercentage = selectedSide === PredictionSide.YES ? yesPercentage : noPercentage;

  // 计算预估份额：基于当前选择方的占比和总金额
  // 如果用户下注 amountNum，当前选择方的总金额 = totalAmountNum * selectedSidePercentage / 100
  // 预估份额 = (用户投入金额 / 当前选择方总金额) * 100
  // 简化：预估份额 = (amountNum / totalAmountNum) * (100 / selectedSidePercentage)
  const estShares =
    amountNum > 0 && totalAmountNum > 0 && selectedSidePercentage > 0
      ? ((amountNum / totalAmountNum) * (100 / selectedSidePercentage)).toFixed(4)
      : '0.0000';

  // 计算潜在回报百分比
  // 如果赢了，回报 = (总金额 / 获胜方总金额 - 1) * 100
  // 获胜方总金额 = totalAmountNum * selectedSidePercentage / 100
  // 回报 = (totalAmountNum / (totalAmountNum * selectedSidePercentage / 100) - 1) * 100
  // 简化：回报 = (100 / selectedSidePercentage - 1) * 100
  const potentialReturnPercentage =
    selectedSidePercentage > 0 && amountNum > 0
      ? ((100 / selectedSidePercentage - 1) * 100).toFixed(2)
      : '0.00';

  // 检查授权额度
  const checkAllowance = useCallback(() => {
    if (!tokenAddress || !amount || !address || !chainConfig?.AgentBetAddress) {
      setNeedsApproval(false);
      return;
    }

    // ETH和BNB等母币不需要授权
    const isETH = tokenAddress === ethers.ZeroAddress;
    if (isETH) {
      setNeedsApproval(false);
      setCurrentAllowance('0');
      return;
    }
    console.log('tokenAllowance', tokenAllowance);
    if (!tokenAllowance) {
      setNeedsApproval(true);
      return;
    }

    try {
      const allowance = tokenAllowance.toString();
      setCurrentAllowance(formatBigNumber(BigInt(allowance), tokenDecimalsValue));

      const allowanceBN = BigInt(allowance);
      const amountBNValue = parseToBigNumber(amount, tokenDecimalsValue);
      const amountBN = BigInt(amountBNValue.toString()); // 转换为 bigint

      if (allowanceBN === ethers.MaxUint256) {
        setNeedsApproval(false);
        setCurrentAllowance('∞');
      } else {
        setNeedsApproval(allowanceBN < amountBN);
      }
    } catch (error) {
      console.error('Check allowance failed:', error);
      setNeedsApproval(true);
    }
  }, [
    tokenAddress,
    amount,
    address,
    chainConfig?.AgentBetAddress,
    tokenAllowance,
    tokenDecimalsValue,
  ]);

  // 如果活动已结算且未领取，强制显示 Claim tab
  useEffect(() => {
    if (isSettled && !hasClaimed) {
      setActiveTab('claim');
    }
  }, [isSettled, hasClaimed]);

  // 根据用户下注信息设置默认值
  useEffect(() => {
    // 如果活动已结算，不处理下注信息（由上面的 useEffect 处理）
    if (isSettled) {
      return;
    }

    if (betInfo && (betInfo as any).amount && BigInt((betInfo as any).amount.toString()) > 0n) {
      const choice = Number((betInfo as any).choice);
      // 设置用户选择的 side: 0 = NO, 1 = YES
      const userSide = choice === 1 ? PredictionSide.YES : PredictionSide.NO;
      setSelectedSide(userSide);
      // 如果活动未结算且用户已下注，设置 tab 为用户选择的方向
      setActiveTab(choice === 1 ? 'yes' : 'no');
    }
  }, [betInfo, isSettled]);

  // 同步 activeTab 和 selectedSide（当用户切换 tab 时）
  useEffect(() => {
    if (activeTab === 'yes') {
      setSelectedSide(PredictionSide.YES);
    } else if (activeTab === 'no') {
      setSelectedSide(PredictionSide.NO);
    }
  }, [activeTab]);

  // 检查是否已结束
  useEffect(() => {
    if (!attitude?.end_at) {
      setIsEnded(false);
      return;
    }

    const checkEndTime = () => {
      const now = new Date().getTime();
      const endTime = new Date(attitude.end_at).getTime();
      setIsEnded(now >= endTime);
    };

    // 立即检查一次
    checkEndTime();

    // 每秒检查一次
    const interval = setInterval(checkEndTime, 1000);

    return () => clearInterval(interval);
  }, [attitude?.end_at]);

  // 监听授权变化
  useEffect(() => {
    if (tokenAddress && amount && address) {
      checkAllowance();
    } else {
      setNeedsApproval(false);
    }
  }, [tokenAddress, amount, address, checkAllowance]);

  // 监听授权交易状态
  useEffect(() => {
    if (isApproveConfirmed) {
      toast.success(t('donate_approve_success') || 'Approve successful');
      setNeedsApproval(false);
      setCurrentAllowance('∞');
      refetchAllowance();
    }
  }, [isApproveConfirmed, t, refetchAllowance]);

  // 静默调用下注成功回调接口
  const callDoBetSuccessCallback = useCallback(async () => {
    if (!betTxHash || !opinionId || !amount || !tokenAddress || !betChainId) {
      return;
    }

    try {
      // 静默调用回调接口，不处理返回结果，只记录日志
      const choice = selectedSide === PredictionSide.YES ? 1 : 0; // YES = 1, NO = 0
      const res: any = await doBetSuccess({
        bet_id: opinionId,
        amount: amount,
        choice: choice,
        token_address: tokenAddress,
        tx_hash: betTxHash,
        chainId: betChainId,
      });
      console.log('Do bet success callback result:', res);
    } catch (error) {
      // 静默处理错误，不影响UI
      console.error('Failed to call do bet success callback (silent):', error);
    }
  }, [betTxHash, opinionId, amount, tokenAddress, betChainId, selectedSide]);

  // 静默调用 claim 成功回调接口
  const callClaimSuccessCallback = useCallback(async () => {
    if (
      !claimTxHash ||
      !opinionId ||
      !tokenAddress ||
      !betChainId ||
      !address ||
      userBetChoice === null
    ) {
      return;
    }

    try {
      // 从交易收据中获取 amount (payout)
      // BetClaimed 事件包含 payout 字段
      let claimAmount = userBetAmount; // 默认值

      // 如果有交易收据，尝试从 logs 中解析 payout
      if (claimReceipt && claimReceipt.logs) {
        try {
          // 查找 BetClaimed 事件
          // BetClaimed 事件签名: BetClaimed(uint256 indexed id, address indexed bettor, uint256 payout)
          const betClaimedEvent = Bet_abi.find(
            (item: any) => item.name === 'BetClaimed' && item.type === 'event'
          );

          if (betClaimedEvent) {
            for (const log of claimReceipt.logs) {
              try {
                const decoded = decodeEventLog({
                  abi: [betClaimedEvent],
                  data: log.data,
                  topics: log.topics,
                }) as any;

                // 检查是否是当前用户的 claim
                if (
                  decoded.args &&
                  decoded.args.bettor &&
                  decoded.args.bettor.toLowerCase() === address.toLowerCase()
                ) {
                  // payout 是第三个参数（indexed 参数不算在 data 中）
                  if (decoded.args.payout) {
                    claimAmount = formatBigNumber(
                      BigInt(decoded.args.payout.toString()),
                      tokenDecimalsValue
                    );
                    break;
                  }
                }
              } catch (decodeError) {
                // 继续查找下一个 log
                continue;
              }
            }
          }
        } catch (parseError) {
          console.warn(
            'Failed to parse payout from receipt logs, using userBetAmount:',
            parseError
          );
        }
      }

      const res: any = await claimSuccess({
        bet_id: opinionId,
        receiver: address,
        amount: claimAmount,
        choice: userBetChoice,
        token_address: tokenAddress,
        tx_hash: claimTxHash,
        chainId: betChainId,
      });
      console.log('Claim success callback result:', res);
    } catch (error) {
      // 静默处理错误，不影响UI
      console.error('Failed to call claim success callback (silent):', error);
    }
  }, [
    claimTxHash,
    claimReceipt,
    opinionId,
    tokenAddress,
    betChainId,
    address,
    userBetChoice,
    userBetAmount,
    tokenDecimalsValue,
  ]);

  // 监听下注交易状态
  useEffect(() => {
    if (isBetConfirmed && betTxHash) {
      toast.success(t('bet_success') || 'Bet placed successfully');
      setAmount('');
      // 静默调用回调接口
      callDoBetSuccessCallback();
      // 可以在这里刷新数据
    }
  }, [isBetConfirmed, betTxHash, callDoBetSuccessCallback, t]);

  // 监听 claim 交易状态
  useEffect(() => {
    if (isClaimConfirmed && claimTxHash) {
      toast.success(t('claim_success') || 'Claim successful');
      // 静默调用回调接口
      callClaimSuccessCallback();
      // 可以在这里刷新数据
    }
  }, [isClaimConfirmed, claimTxHash, callClaimSuccessCallback, t]);

  // 监听授权合约调用错误
  useEffect(() => {
    if (isApproveWriteError && approveError) {
      console.error('Approve write error:', approveError);
      const extractedMessage = extractErrorMessage(approveError);
      const errorMessage = extractedMessage || t('donate_approve_failed') || 'Approve failed';
      toast.error(errorMessage);
    }
  }, [isApproveWriteError, approveError]);

  // 监听下注合约调用错误
  useEffect(() => {
    if (isBetWriteError && betError) {
      console.error('Bet write error:', betError);
      const extractedMessage = extractErrorMessage(betError);
      const errorMessage = extractedMessage || t('bet_failed') || 'Bet failed';
      toast.error(errorMessage);
    }
  }, [isBetWriteError, betError]);

  // 监听下注交易确认错误
  useEffect(() => {
    if (isBetReceiptError && betReceiptError) {
      console.error('Bet receipt error:', betReceiptError);
      const extractedMessage = extractErrorMessage(betReceiptError);
      const errorMessage = extractedMessage || t('bet_failed') || 'Bet transaction failed';
      toast.error(errorMessage);
    }
  }, [isBetReceiptError, betReceiptError, t]);

  // 监听 claim 合约调用错误
  useEffect(() => {
    if (isClaimWriteError && claimError) {
      console.error('Claim write error:', claimError);
      const extractedMessage = extractErrorMessage(claimError);
      const errorMessage = extractedMessage || t('claim_failed') || 'Claim failed';
      toast.error(errorMessage);
    }
  }, [isClaimWriteError, claimError, t]);

  // 监听 claim 交易确认错误
  useEffect(() => {
    if (isClaimReceiptError && claimReceiptError) {
      console.error('Claim receipt error:', claimReceiptError);
      const extractedMessage = extractErrorMessage(claimReceiptError);
      const errorMessage = extractedMessage || t('claim_failed') || 'Claim transaction failed';
      toast.error(errorMessage);
    }
  }, [isClaimReceiptError, claimReceiptError, t]);

  // 授权代币
  const handleApprove = useCallback(async () => {
    if (!tokenAddress || !chainConfig?.AgentBetAddress) {
      toast.error(t('please_select_token') || 'Please select token');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error(t('donate_amount_invalid') || 'Invalid amount');
      return;
    }

    if (tokenAddress === ethers.ZeroAddress) {
      setNeedsApproval(false);
      return;
    }

    try {
      const approveAmountBN = parseToBigNumber(amount, tokenDecimalsValue);
      const approveAmount = BigInt(approveAmountBN.toString()); // 转换为 bigint
      writeApproveContract({
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'approve',
        args: [chainConfig.AgentBetAddress as `0x${string}`, approveAmount],
      });
    } catch (error: any) {
      console.error('Approve failed:', error);
      toast.error(error.message || t('donate_approve_failed') || 'Approve failed');
    }
  }, [
    tokenAddress,
    chainConfig?.AgentBetAddress,
    amount,
    tokenDecimalsValue,
    writeApproveContract,
    t,
  ]);

  // 切换到正确的链
  const handleSwitchChain = useCallback(async () => {
    if (!expectedChainId) {
      toast.error(t('wrong_chain') || 'Wrong chain');
      return;
    }

    try {
      await switchChain({
        chainId: expectedChainId,
      });
    } catch (error) {
      console.error('Switch chain failed:', error);
      toast.error(t('switch_chain_failed') || 'Switch chain failed');
    }
  }, [expectedChainId, switchChain, t]);

  // 处理 max 按钮
  const handleMaxClick = useCallback(() => {
    if (tokenBalance) {
      const balance = parseFloat(tokenBalance.formatted);
      setAmount(balance.toString());
    }
  }, [tokenBalance]);

  // Claim
  const handleClaim = useCallback(async () => {
    if (!hasTwitterLogin) {
      toast.error(t('please_login_first') || 'Please login first');
      return;
    }

    if (!hasWalletConnected) {
      toast.error(t('please_connect_wallet') || 'Please connect wallet');
      return;
    }

    if (isWrongChain) {
      toast.error(t('wrong_chain') || 'Wrong chain');
      return;
    }

    if (!opinionId) {
      toast.error('Bet ID required');
      return;
    }

    if (userBetChoice === null) {
      toast.error(t('no_bet_found') || 'No bet found');
      return;
    }

    if (!canClaim) {
      toast.error(t('cannot_claim') || 'Cannot claim');
      return;
    }

    if (!hasClaimableAmount) {
      toast.error(t('no_claimable_amount') || 'No claimable amount');
      return;
    }

    if (!chainConfig?.AgentBetAddress) {
      toast.error('Bet contract address not configured');
      return;
    }

    try {
      writeClaimContract({
        address: chainConfig.AgentBetAddress as `0x${string}`,
        abi: Bet_abi,
        functionName: 'claim',
        args: [BigInt(opinionId)],
      });
    } catch (error: any) {
      console.error('Claim failed:', error);
      toast.error(error.message || t('claim_failed') || 'Claim failed');
    }
  }, [
    hasTwitterLogin,
    hasWalletConnected,
    isWrongChain,
    opinionId,
    userBetChoice,
    canClaim,
    chainConfig?.AgentBetAddress,
    writeClaimContract,
    t,
  ]);

  // 下注
  const handleTrade = useCallback(async () => {
    if (isSettled) {
      toast.error(t('event_settled') || 'Event has been settled');
      return;
    }

    if (isEnded) {
      toast.error(t('market_ended') || 'Market has ended');
      return;
    }

    if (!hasTwitterLogin) {
      toast.error(t('please_login_first') || 'Please login first');
      return;
    }

    if (!hasWalletConnected) {
      toast.error(t('please_connect_wallet') || 'Please connect wallet');
      return;
    }

    if (isWrongChain) {
      toast.error(t('wrong_chain') || 'Wrong chain');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error(t('donate_amount_invalid') || 'Invalid amount');
      return;
    }

    if (!tokenAddress) {
      toast.error(t('donate_token_required') || 'Token required');
      return;
    }

    if (!opinionId) {
      toast.error('Bet ID required');
      return;
    }

    if (!hasSufficientBalance) {
      toast.error(t('insufficient_balance') || 'Insufficient balance');
      return;
    }

    if (needsApproval) {
      toast.error(t('donate_approve_required') || 'Approval required');
      return;
    }

    if (!chainConfig?.AgentBetAddress) {
      toast.error('Bet contract address not configured');
      return;
    }

    try {
      const amountInWeiBN = parseToBigNumber(amount, tokenDecimalsValue);
      const amountInWei = BigInt(amountInWeiBN.toString()); // 转换为 bigint
      const choice = selectedSide === PredictionSide.YES ? 1 : 0; // YES = 1, NO = 0
      const isETH = tokenAddress === ethers.ZeroAddress;
      const isNativeToken = isETH;
      console.log('amountInWei', amountInWei);
      console.log('choice', choice);
      console.log('isNativeToken', isNativeToken);
      console.log('args', [BigInt(opinionId), amountInWei, choice]);

      writeBetContract({
        address: chainConfig.AgentBetAddress as `0x${string}`,
        abi: Bet_abi,
        functionName: 'doBet',
        args: [BigInt(opinionId), amountInWei, choice],
        value: isNativeToken ? amountInWei : 0n,
      });
    } catch (error: any) {
      console.error('Bet failed:', error);
      toast.error(error.message || t('bet_failed') || 'Bet failed');
    }
  }, [
    isSettled,
    isEnded,
    hasTwitterLogin,
    hasWalletConnected,
    isWrongChain,
    amount,
    tokenAddress,
    opinionId,
    hasSufficientBalance,
    needsApproval,
    selectedSide,
    chainConfig?.AgentBetAddress,
    tokenDecimalsValue,
    writeBetContract,
    t,
  ]);

  const isProcessing =
    isBetPending ||
    isBetConfirming ||
    isApprovePending ||
    isApproveConfirming ||
    isSwitchingChain ||
    isClaimPending ||
    isClaimConfirming;

  return (
    <div className="sticky top-24 space-y-5">
      <div className="border-border bg-card h-fit rounded-2xl border p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-foreground text-lg font-semibold">{t('place_order')}</h3>
          {isSettled ? (
            <span className="text-muted-foreground bg-muted flex items-center gap-1 rounded px-2 py-1 text-xs">
              <span className="h-2 w-2 rounded-full bg-purple-500"></span>{' '}
              {t('opinion_settled') || 'Settled'}
            </span>
          ) : isEnded ? (
            <span className="text-muted-foreground bg-muted flex items-center gap-1 rounded px-2 py-1 text-xs">
              <span className="h-2 w-2 rounded-full bg-red-500"></span> {t('opinion_stopped')}
            </span>
          ) : (
            <span className="text-muted-foreground bg-muted flex items-center gap-1 rounded px-2 py-1 text-xs">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>{' '}
              {t('opinion_live')}
            </span>
          )}
        </div>

        {/* Tab 切换 */}
        {isSettled && hasClaimed ? (
          // 活动已结算且已领取：不显示 tab，显示已领取状态
          <div className="border-border bg-muted/20 mb-6 rounded-lg border p-4">
            <div className="text-muted-foreground flex items-center justify-center gap-2">
              <Info className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">
                {t('already_claimed') || 'Already claimed'}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-muted/20 border-border mb-6 flex rounded-lg border p-1">
            {isSettled ? (
              // 活动已结算但未领取：只显示 Claim
              <button
                onClick={() => setActiveTab('claim')}
                className="flex-1 rounded-md bg-gradient-to-r from-green-600 to-emerald-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-500/20 transition-all"
              >
                {t('claim')}
              </button>
            ) : !hasUserBet ? (
              // 活动未结算且没下注时：显示 YES / NO
              <>
                <button
                  onClick={() => setActiveTab('yes')}
                  disabled={isEnded}
                  className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition-all ${
                    activeTab === 'yes'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-muted-foreground hover:text-foreground'
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {t('yes')} {yesPercentage.toFixed(1)}%
                </button>
                <button
                  onClick={() => setActiveTab('no')}
                  disabled={isEnded}
                  className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition-all ${
                    activeTab === 'no'
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                      : 'text-muted-foreground hover:text-foreground'
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {t('no')} {noPercentage.toFixed(1)}%
                </button>
              </>
            ) : (
              // 活动未结算且下注后：显示用户选择的方向 / Claim
              <>
                <button
                  onClick={() => setActiveTab(userBetChoice === 1 ? 'yes' : 'no')}
                  className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition-all ${
                    activeTab === 'yes' || activeTab === 'no'
                      ? userBetChoice === 1
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {userBetChoice === 1 ? t('yes') : t('no')}{' '}
                  {userBetChoice === 1 ? yesPercentage.toFixed(1) : noPercentage.toFixed(1)}%
                </button>
                <button
                  onClick={() => setActiveTab('claim')}
                  className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition-all ${
                    activeTab === 'claim'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/20'
                      : 'text-muted-foreground hover:text-green-500'
                  }`}
                >
                  {t('claim')}
                </button>
              </>
            )}
          </div>
        )}

        {/* Bet Tab Content (YES or NO) */}
        {(activeTab === 'yes' || activeTab === 'no') && !isSettled && (
          <>
            <div className="mb-6 space-y-4">
              <div>
                <label className="text-muted-foreground mb-2 block text-xs font-medium">
                  {displayTokenSymbol ? `${t('amount')} (${displayTokenSymbol})` : t('amount')}
                </label>
                <div
                  className={`border-border bg-muted/50 text-foreground placeholder-muted-foreground has-[:focus]:ring-primary has-[:focus]:ring-0.5 flex w-full flex-col gap-1 rounded-xl border px-4 py-2 transition-colors dark:bg-black/40 ${selectedSide === PredictionSide.YES ? 'has-[:focus]:border-primary' : 'has-[:focus]:border-red-500'}`}
                >
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    disabled={isEnded}
                    className="border-none !bg-transparent px-0 !text-2xl font-bold focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <div className="ml-auto flex flex-wrap items-center gap-2">
                    {tokenBalance && (
                      <div className="text-muted-foreground flex items-center gap-1 text-xs">
                        <Wallet className="h-3 w-3" />
                        <span>{formatPrecision(tokenBalance.formatted)}</span>
                      </div>
                    )}
                    <div className="ml-auto flex gap-1">
                      {[10, 50, 100].map((val) => (
                        <button
                          key={val}
                          onClick={() => {
                            const currentAmount = parseFloat(amount || '0');
                            setAmount((currentAmount + val).toString());
                          }}
                          disabled={isEnded}
                          className="bg-card border-border text-muted-foreground hover:bg-muted rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          +{val}
                        </button>
                      ))}
                      <button
                        onClick={handleMaxClick}
                        disabled={isEnded}
                        className="bg-card border-border text-primary hover:bg-muted rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {t('max')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-border bg-muted/20 space-y-2 rounded-xl border p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('est_shares')}</span>
                  <span className="text-foreground font-mono">
                    {amountNum > 0 ? estShares : '0.0000'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('potential_return')}</span>
                  <span className={`font-mono text-green-500`}>
                    {amountNum > 0 ? <>+{potentialReturnPercentage}%</> : '0.00%'}
                  </span>
                </div>
              </div>
            </div>

            {!hasTwitterLogin ? (
              // 未登录 Twitter，显示 Twitter 登录按钮
              <div className="flex w-full">
                <XAuth className="!h-auto w-full rounded-xl bg-blue-600 py-4 text-base text-white shadow-lg transition-all hover:bg-blue-500" />
              </div>
            ) : !hasWalletConnected ? (
              // 已登录 Twitter 但未连接钱包，显示连接钱包按钮
              <div className="flex w-full">
                <UIWallet
                  className="!h-auto w-full flex-1 !rounded-xl !py-4"
                  chainId={expectedChainId || undefined}
                />
              </div>
            ) : isWrongChain ? (
              <button
                onClick={handleSwitchChain}
                disabled={isSwitchingChain}
                className="w-full rounded-xl bg-yellow-600 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-yellow-500 disabled:cursor-wait disabled:opacity-70"
              >
                {isSwitchingChain
                  ? t('switching') || 'Switching...'
                  : t('switch_to_chain', { chainName: chainConfig?.name || 'Base' }) ||
                    'Switch Chain'}
              </button>
            ) : amountNum > 0 && !hasSufficientBalance ? (
              <button
                disabled
                className="w-full cursor-not-allowed rounded-xl bg-gray-500 py-4 text-base font-bold text-white opacity-70 shadow-lg transition-all"
              >
                {t('insufficient_balance') || 'Insufficient Balance'}
              </button>
            ) : needsApproval ? (
              <button
                onClick={handleApprove}
                disabled={isApprovePending || isApproveConfirming || !amount || !tokenAddress}
                className="w-full rounded-xl bg-green-600 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-green-500 disabled:cursor-wait disabled:opacity-70"
              >
                {isApprovePending || isApproveConfirming ? (
                  <>
                    <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                    {t('approving') || 'Approving...'}
                  </>
                ) : (
                  t('approve_token') || 'Approve Token'
                )}
              </button>
            ) : (
              <button
                onClick={handleTrade}
                disabled={
                  isSettled ||
                  isEnded ||
                  isProcessing ||
                  !amount ||
                  !tokenAddress ||
                  !hasSufficientBalance ||
                  needsApproval
                }
                className={`w-full rounded-xl py-4 text-base font-bold text-white shadow-lg transition-all ${
                  selectedSide === PredictionSide.YES
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500'
                    : 'bg-gradient-to-r from-red-500 to-orange-600 shadow-red-500/20 hover:from-red-400 hover:to-orange-500'
                } ${isProcessing ? 'cursor-wait opacity-70' : ''} disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {isBetPending || isBetConfirming ? (
                  <>
                    <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                    {t('opinion_processing') || 'Processing...'}
                  </>
                ) : (
                  `${t('buy')} ${selectedSide}`
                )}
              </button>
            )}
          </>
        )}

        {/* Claim Tab Content */}
        {activeTab === 'claim' && !hasClaimed && (
          <div className="space-y-4">
            {!hasTwitterLogin ? (
              // 未登录 Twitter，显示 Twitter 登录按钮
              <div className="flex w-full">
                <XAuth className="!h-auto w-full rounded-xl bg-blue-600 py-4 text-base text-white shadow-lg transition-all hover:bg-blue-500" />
              </div>
            ) : !hasWalletConnected ? (
              // 已登录 Twitter 但未连接钱包，显示连接钱包按钮
              <div className="flex w-full">
                <UIWallet
                  className="!h-auto w-full flex-1 !rounded-xl !py-4"
                  chainId={expectedChainId || undefined}
                />
              </div>
            ) : isWrongChain ? (
              <button
                onClick={handleSwitchChain}
                disabled={isSwitchingChain}
                className="w-full rounded-xl bg-yellow-600 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-yellow-500 disabled:cursor-wait disabled:opacity-70"
              >
                {isSwitchingChain
                  ? t('switching') || 'Switching...'
                  : t('switch_to_chain', { chainName: chainConfig?.name || 'Base' }) ||
                    'Switch Chain'}
              </button>
            ) : !hasUserBet ? (
              <div className="border-border text-muted-foreground flex h-40 items-center justify-center rounded-xl border border-dashed">
                {t('no_bet_found') || 'No bet found'}
              </div>
            ) : !isSettled ? (
              <>
                <div className="border-border bg-muted/20 space-y-3 rounded-xl border p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('your_bet') || 'Your Bet'}</span>
                    <span
                      className={`${userBetChoice === 1 ? 'text-green-500' : 'text-red-500'} text-foreground font-mono`}
                    >
                      {userBetChoice === 1 ? t('yes') : t('no')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('bet_amount') || 'Bet Amount'}</span>
                    <span className="text-foreground font-mono">
                      {formatPrecision(userBetAmount)} {displayTokenSymbol}
                    </span>
                  </div>
                </div>
                <div className="border-border text-muted-foreground flex items-center justify-center rounded-xl border border-dashed py-2">
                  <div className="text-center">
                    <p className="mb-1 flex items-center justify-center gap-1 font-medium">
                      <Info className="h-4 w-4 text-yellow-500" />
                      {t('wait_for_market_end') || 'Wait for market to end'}
                    </p>
                    <p className="text-xs">
                      {t('claim_after_market_end') || 'You can claim after the market ends'}
                    </p>
                  </div>
                </div>
              </>
            ) : hasClaimed ? (
              <div className="border-border text-muted-foreground flex h-40 items-center justify-center rounded-xl border border-dashed">
                {t('already_claimed') || 'Already claimed'}
              </div>
            ) : !hasClaimableAmount ? (
              <div className="border-border text-muted-foreground flex h-40 items-center justify-center rounded-xl border border-dashed">
                {t('no_claimable_amount') || 'No claimable amount'}
              </div>
            ) : (
              <>
                <div className="border-border bg-muted/20 space-y-3 rounded-xl border p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('your_bet') || 'Your Bet'}</span>
                    <span className="text-foreground font-mono">
                      {userBetChoice === 1 ? t('yes') : t('no')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('bet_amount') || 'Bet Amount'}</span>
                    <span className="text-foreground font-mono">
                      {formatPrecision(userBetAmount)} {displayTokenSymbol}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleClaim}
                  disabled={isClaimPending || isClaimConfirming || !canClaim || !hasClaimableAmount}
                  className="w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 py-4 text-base font-bold text-white shadow-lg transition-all hover:from-green-500 hover:to-emerald-500 disabled:cursor-wait disabled:opacity-70"
                >
                  {isClaimPending || isClaimConfirming ? (
                    <>
                      <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                      {t('claiming') || 'Claiming...'}
                    </>
                  ) : (
                    t('claim') || 'Claim'
                  )}
                </button>
              </>
            )}
          </div>
        )}

        {/* Share / Call Out Section */}
        {onShare && (
          <div className="border-border mt-6 border-t pt-6">
            <div className="from-muted to-card border-border rounded-xl border bg-gradient-to-br p-4">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-yellow-500" />
                <span className="text-foreground text-sm font-bold">{t('boost_your_side')}</span>
              </div>
              <p className="text-muted-foreground mb-3 text-xs">{t('share_position_rally')}</p>
              <button
                onClick={() => onShare(selectedSide)}
                className="bg-card border-border hover:bg-muted text-foreground flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-all"
              >
                <Share2 className="h-4 w-4" />
                {t('share_call_out')}
              </button>
            </div>
          </div>
        )}

        <div className="text-muted-foreground mt-4 space-y-2 text-xs">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-3 w-3 flex-shrink-0" />
            <p>{t('positions_locked_info')}</p>
          </div>
          {attitude?.end_at && (
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-3 w-3 flex-shrink-0" />
              <p>
                {t('market_ends_at')}: {new Date(attitude.end_at).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* <HowItWork /> */}
      {/* Rules / Credibility Section */}
      <div className="border-border bg-card rounded-2xl border p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-2">
          <HelpCircle className="text-muted-foreground h-5 w-5" />
          <h3 className="text-foreground text-lg font-semibold">{t('how_it_works')}</h3>
        </div>
        <div className="text-muted-foreground space-y-4 text-sm">
          <p className="leading-relaxed">
            <strong className="text-foreground mb-1 block">{t('resolution_criteria')}:</strong>
            {t('default_resolution_criteria')}
          </p>
          <ul className="list-disc space-y-2 pl-4">
            <li>{t('how_it_works_step_1')}</li>
            <li>{t('how_it_works_step_2')}</li>
            <li>{t('how_it_works_step_3')}</li>
            <li>{t('how_it_works_step_4')}</li>
            <li>{t('how_it_works_step_5')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
