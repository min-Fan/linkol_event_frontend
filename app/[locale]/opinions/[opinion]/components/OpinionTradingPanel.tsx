'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
  ArrowRight,
  HelpCircle,
  Info,
  Share2,
  TrendingUp,
  Loader2,
  Wallet,
  Trophy,
  XCircle,
  CheckCircle,
  Lock,
  Crown,
  Coins,
  Clock,
} from 'lucide-react';
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
import { Link, useRouter } from '@libs/i18n/navigation';
import PagesRoute from '@constants/routes';
import OpinionShareModal from './OpinionShareModal';
import { cn } from '@shadcn/lib/utils';

interface OpinionTradingPanelProps {
  onShare?: (side: PredictionSide) => void;
  // Owner / Royalty Props
  isOwner?: boolean;
  accruedRoyalties?: number;
}

// 提取有效的错误消息
const extractErrorMessage = (error: any): string => {
  if (!error) return 'Unknown error';

  // 保存原始错误信息，以便在提取失败时返回
  const originalMessage = error.message || error.shortMessage || String(error);

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
    // 如果提取失败，返回 shortMessage
    return error.shortMessage || originalMessage;
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
    // 如果包含 "reverted"，尝试提取更详细的信息
    if (error.message.includes('reverted')) {
      // 尝试提取 "BetService: issuer not set" 这样的具体错误
      const serviceMatch = error.message.match(/(BetService|ContractError):\s*(.+?)(?:\n|$)/i);
      if (serviceMatch && serviceMatch[2]) {
        return serviceMatch[2].trim();
      }
      // 如果包含 "issuer not set" 这样的具体错误，直接返回
      if (error.message.includes('issuer not set')) {
        return 'BetService: issuer not set';
      }
      // 返回第一行或完整消息
      const firstLine = error.message.split('\n')[0];
      return firstLine || error.message;
    }
    // 如果提取失败，返回原始 message
    return error.message;
  }

  // 尝试从 cause 中获取
  if (error.cause) {
    const causeMessage = extractErrorMessage(error.cause);
    // 如果从 cause 中提取到了有效消息，返回它；否则继续使用原始消息
    if (causeMessage && causeMessage !== 'Unknown error') {
      return causeMessage;
    }
  }

  // 尝试从 data 中获取（某些错误可能在这里）
  if (error.data) {
    if (typeof error.data === 'string') {
      return error.data;
    }
    if (error.data.message) {
      const dataMessage = extractErrorMessage(error.data);
      // 如果从 data 中提取到了有效消息，返回它；否则继续使用原始消息
      if (dataMessage && dataMessage !== 'Unknown error') {
        return dataMessage;
      }
    }
  }

  // 如果都没有，返回原始错误信息或错误对象的字符串表示
  return originalMessage || String(error) || 'Unknown error';
};

export default function OpinionTradingPanel({
  onShare,
  isOwner: isOwnerProp = false,
  accruedRoyalties = 0,
}: OpinionTradingPanelProps) {
  const params = useParams();
  const opinionId = params?.opinion as string;
  const {
    yesPercentage,
    noPercentage,
    betDetail,
    tokenAddress,
    chainId,
    attitude,
    refreshBetDetail,
    invalidateBetDetail,
  } = useBetDetail(opinionId);
  const t = useTranslations('common');
  const { address, chainId: currentChainId, isConnected } = useAccount();
  const { isLogin } = useUserInfo();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const router = useRouter();

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
  const { data: eventInfo, refetch: refetchEventInfo } = useReadContract({
    address: chainConfig?.AgentBetAddress as `0x${string}`,
    abi: Bet_abi,
    functionName: 'getEventInfo',
    args: opinionId ? [BigInt(opinionId)] : undefined,
    query: {
      enabled: !!opinionId && !!chainConfig?.AgentBetAddress && !isWrongChain,
    },
  });

  // Read user bet info from contract
  const { data: betInfo, refetch: refetchBetInfo } = useReadContract({
    address: chainConfig?.AgentBetAddress as `0x${string}`,
    abi: Bet_abi,
    functionName: 'getBetInfo',
    args: opinionId && address ? [BigInt(opinionId), address as `0x${string}`] : undefined,
    query: {
      enabled: !!opinionId && !!address && !!chainConfig?.AgentBetAddress && !isWrongChain,
    },
  });

  // Read claimable amount from contract
  const { data: claimableAmount, refetch: refetchClaimableAmount } = useReadContract({
    address: chainConfig?.AgentBetAddress as `0x${string}`,
    abi: Bet_abi,
    functionName: 'getClaimableAmount',
    args: opinionId && address ? [BigInt(opinionId), address as `0x${string}`] : undefined,
    query: {
      enabled: !!opinionId && !!address && !!chainConfig?.AgentBetAddress && !isWrongChain,
    },
  });

  // Read owner address from contract
  const { data: ownerAddress } = useReadContract({
    address: chainConfig?.AgentBetAddress as `0x${string}`,
    abi: Bet_abi,
    functionName: 'getOwnerByBetId',
    args: opinionId ? [BigInt(opinionId)] : undefined,
    query: {
      enabled: !!opinionId && !!chainConfig?.AgentBetAddress && !isWrongChain,
    },
  });

  useEffect(() => {
    console.log('getEventInfo', eventInfo);
    console.log('claimableAmount', claimableAmount);
    console.log('betInfo', betInfo);
    console.log('ownerAddress', ownerAddress);
  }, [eventInfo, claimableAmount, ownerAddress]);

  // 判断当前用户是否为 owner
  // 如果合约返回的 owner 地址与用户连接的钱包地址相同，则为 owner
  const isOwnerFromContract =
    ownerAddress && address
      ? (ownerAddress as string).toLowerCase() === address.toLowerCase()
      : false;
  // 优先使用合约判断的结果，如果没有则使用 props 传入的值
  const isOwner = isOwnerFromContract || isOwnerProp;

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
  // Tab 值与 choice 值对应关系: 'yes' tab = choice 0, 'no' tab = choice 1
  const [activeTab, setActiveTab] = useState<'yes' | 'no'>('yes');
  // Owner royalty claim state
  const [isClaimingRoyalties, setIsClaimingRoyalties] = useState(false);
  const [hasClaimedRoyalties, setHasClaimedRoyalties] = useState(false);
  // Share modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareModalSide, setShareModalSide] = useState<PredictionSide>(PredictionSide.YES);
  const [shareModalAmount, setShareModalAmount] = useState<number | undefined>(undefined);
  // 使用 ref 跟踪是否应该显示分享弹窗（只在第一次下注时显示）
  const shouldShowShareModalRef = useRef<boolean>(false);
  // 使用 ref 跟踪已经处理过的下注交易 hash，避免重复显示 toast
  const processedBetTxHashRef = useRef<string | null>(null);

  // 解析用户下注信息
  // betInfo 结构: {amount: bigint, choice: number, claimed: boolean}
  // choice: 0 = YES, 1 = NO (从合约读取的值)
  const userBetAmount =
    betInfo && (betInfo as any).amount
      ? formatBigNumber(BigInt((betInfo as any).amount.toString()), tokenDecimalsValue)
      : '0';
  const userBetChoice =
    betInfo && (betInfo as any).choice !== undefined ? Number((betInfo as any).choice) : null; // 0 = YES, 1 = NO (从合约读取的值)
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

  // 解析获胜选择：0 = YES, 1 = NO
  const winningChoice =
    eventInfo && typeof eventInfo === 'object' && 'winningChoice' in eventInfo
      ? Number((eventInfo as any).winningChoice)
      : null;
  const winningSide =
    winningChoice !== null ? (winningChoice === 0 ? PredictionSide.YES : PredictionSide.NO) : null;

  // 判断用户是否是获胜者
  const isWinner =
    isSettled && hasUserBet && winningSide !== null && userBetChoice !== null
      ? userBetChoice === winningChoice
      : false;
  const isLoser =
    isSettled && hasUserBet && winningSide !== null && userBetChoice !== null
      ? userBetChoice !== winningChoice
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

  // 从 eventInfo 中获取 totalYesAmount 和 totalNoAmount
  const totalYesAmount =
    eventInfo && typeof eventInfo === 'object' && 'totalYesAmount' in eventInfo
      ? formatBigNumber(BigInt((eventInfo as any).totalYesAmount.toString()), tokenDecimalsValue)
      : '0';
  const totalNoAmount =
    eventInfo && typeof eventInfo === 'object' && 'totalNoAmount' in eventInfo
      ? formatBigNumber(BigInt((eventInfo as any).totalNoAmount.toString()), tokenDecimalsValue)
      : '0';

  const totalAmountNum = parseFloat(totalAmount || '0');
  const totalWinningAmountNum = parseFloat(totalWinningAmount || '0');
  const totalYesAmountNum = parseFloat(totalYesAmount || '0');
  const totalNoAmountNum = parseFloat(totalNoAmount || '0');

  // 获取当前选择方的总金额（使用实际的池子金额，而不是百分比）
  const selectedSideTotalAmount =
    selectedSide === PredictionSide.YES ? totalYesAmountNum : totalNoAmountNum;

  // 计算用户在整个池子中的占比
  // userBetAmount 来自 betInfo.amount（用户的下注数量）
  const userBetAmountNum = parseFloat(userBetAmount || '0');
  // 用户占比 = (用户下注金额 / 总金额) * 100
  const userSharePercentage =
    totalAmountNum > 0 && userBetAmountNum > 0
      ? ((userBetAmountNum / totalAmountNum) * 100).toFixed(2)
      : '0.00';

  // 计算预估份额：基于当前选择方的实际总金额
  // 预估份额 = (用户投入金额 / 当前选择方总金额) * 100
  const estShares =
    amountNum > 0 && selectedSideTotalAmount > 0
      ? ((amountNum / selectedSideTotalAmount) * 100).toFixed(4)
      : '0.0000';

  // 计算潜在回报百分比
  // 如果赢了，回报 = (总金额 / 获胜方总金额 - 1) * 100
  // 获胜方总金额 = selectedSideTotalAmount
  // 回报 = (totalAmountNum / selectedSideTotalAmount - 1) * 100
  const potentialReturnPercentage =
    selectedSideTotalAmount > 0 && amountNum > 0
      ? ((totalAmountNum / selectedSideTotalAmount - 1) * 100).toFixed(2)
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

  // 当 opinionId 变化时，重置分享弹窗标志和已处理的交易 hash
  useEffect(() => {
    shouldShowShareModalRef.current = false;
    processedBetTxHashRef.current = null;
  }, [opinionId]);

  // 根据用户下注信息设置默认值
  useEffect(() => {
    // 如果活动已结算，不处理下注信息
    if (isSettled) {
      return;
    }

    if (betInfo && (betInfo as any).amount && BigInt((betInfo as any).amount.toString()) > 0n) {
      const choice = Number((betInfo as any).choice); // 从合约读取: 0 = YES, 1 = NO
      // 设置用户选择的 side: 0 = YES, 1 = NO
      const userSide = choice === 0 ? PredictionSide.YES : PredictionSide.NO;
      setSelectedSide(userSide);
      // 如果活动未结算且用户已下注，设置 tab 为用户选择的方向
      // choice = 0 → 'yes' tab, choice = 1 → 'no' tab
      setActiveTab(choice === 0 ? 'yes' : 'no');
    }
  }, [betInfo, isSettled]);

  // 同步 activeTab 和 selectedSide（当用户切换 tab 时）
  // 'yes' tab → PredictionSide.YES → choice = 0
  // 'no' tab → PredictionSide.NO → choice = 1
  useEffect(() => {
    if (activeTab === 'yes') {
      setSelectedSide(PredictionSide.YES); // choice = 0
    } else if (activeTab === 'no') {
      setSelectedSide(PredictionSide.NO); // choice = 1
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
      const choice = selectedSide === PredictionSide.YES ? 0 : 1; // YES = 0, NO = 1
      const res: any = await doBetSuccess({
        bet_id: opinionId,
        amount: amount,
        choice: choice,
        token_address: tokenAddress,
        tx_hash: betTxHash,
        chainId: betChainId,
      });
      // 刷新 bet 详情接口数据
      invalidateBetDetail();
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
      // 检查是否已经处理过这个交易，避免重复显示 toast
      if (processedBetTxHashRef.current === betTxHash) {
        return;
      }
      
      // 标记这个交易已经处理过
      processedBetTxHashRef.current = betTxHash;
      
      toast.success(t('bet_success') || 'Bet placed successfully');
      const betAmount = parseFloat(amount || '0');
      setAmount('');
      // 静默调用回调接口
      callDoBetSuccessCallback();
      // 只在第一次下注时打开分享弹窗
      if (shouldShowShareModalRef.current) {
        setShareModalSide(selectedSide);
        setShareModalAmount(betAmount);
        setIsShareModalOpen(true);
        // 重置标志，确保后续下注不再显示
        shouldShowShareModalRef.current = false;
      }
      setTimeout(() => {
        refetchBetInfo();
        refetchEventInfo();
        refetchClaimableAmount();
        // 刷新 bet 详情接口数据
        invalidateBetDetail();
      }, 1000);
    }
  }, [isBetConfirmed, betTxHash, amount, selectedSide, callDoBetSuccessCallback, invalidateBetDetail, refetchBetInfo, refetchEventInfo, refetchClaimableAmount, t]);

  // 监听 claim 交易状态
  useEffect(() => {
    if (isClaimConfirmed && claimTxHash) {
      toast.success(t('claim_success') || 'Claim successful');
      // 静默调用回调接口
      callClaimSuccessCallback();
      // 重新获取合约信息以更新状态
      setTimeout(() => {
        refetchBetInfo();
        refetchEventInfo();
        refetchClaimableAmount();
      }, 1000);
    }
  }, [isClaimConfirmed, claimTxHash, refetchBetInfo, refetchEventInfo, refetchClaimableAmount]);

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
      console.error('Bet receipt error details:', {
        message: betReceiptError?.message,
        shortMessage: (betReceiptError as any)?.shortMessage,
        cause: (betReceiptError as any)?.cause,
        data: (betReceiptError as any)?.data,
      });
      const extractedMessage = extractErrorMessage(betReceiptError);
      console.log('Extracted error message:', extractedMessage);
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
  }, [isClaimWriteError, claimError]);

  // 监听 claim 交易确认错误
  useEffect(() => {
    if (isClaimReceiptError && claimReceiptError) {
      console.error('Claim receipt error:', claimReceiptError);
      const extractedMessage = extractErrorMessage(claimReceiptError);
      const errorMessage = extractedMessage || t('claim_failed') || 'Claim transaction failed';
      toast.error(errorMessage);
    }
  }, [isClaimReceiptError, claimReceiptError]);

  // 授权代币
  const handleApprove = useCallback(async () => {
    if (!tokenAddress || !chainConfig?.AgentBetAddress) {
      toast.error(t('please_select_token') || 'Please select token');
      return;
    }

    console.log('amount', amount);

    if (!amount || parseFloat(amount) <= 0) {
      toast.error(t('bet_amount_invalid') || 'Invalid amount');
      return;
    }

    if (tokenAddress === ethers.ZeroAddress) {
      setNeedsApproval(false);
      return;
    }

    try {
      // 授权1000
      const approveAmountBN = parseToBigNumber('1000', tokenDecimalsValue);
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
    amount,
    tokenAddress,
    chainConfig?.AgentBetAddress,
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
      toast.error(t('bet_amount_invalid') || 'Invalid amount');
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

    // 检查是否是第一次下注（只在第一次下注时显示分享弹窗）
    // betInfo 中 amount 为 0 或不存在时，表示还没下注过
    const isFirstBet = !betInfo || 
      !(betInfo as any).amount || 
      BigInt((betInfo as any).amount.toString()) === 0n;
    shouldShowShareModalRef.current = isFirstBet;

    try {
      const amountInWeiBN = parseToBigNumber(amount, tokenDecimalsValue);
      const amountInWei = BigInt(amountInWeiBN.toString()); // 转换为 bigint
      const choice = selectedSide === PredictionSide.YES ? 0 : 1; // YES = 0, NO = 1
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
      // 如果下注失败，重置分享弹窗标志
      shouldShowShareModalRef.current = false;
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
    betInfo,
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

  // Handle claim royalties
  const handleClaimRoyalties = useCallback(async () => {
    if (!isSettled) {
      toast.error(t('market_not_settled') || 'Market must be settled before claiming royalties');
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

    setIsClaimingRoyalties(true);
    try {
      // TODO: 实现实际的 claim royalties 合约调用
      // 这里先模拟一个异步操作
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setHasClaimedRoyalties(true);
      toast.success(t('royalties_claimed_success') || 'Royalties claimed successfully');
    } catch (error: any) {
      console.error('Claim royalties failed:', error);
      toast.error(error.message || t('claim_royalties_failed') || 'Claim royalties failed');
    } finally {
      setIsClaimingRoyalties(false);
    }
  }, [isSettled, hasTwitterLogin, hasWalletConnected, isWrongChain, t]);

  // --- RENDER: RESOLVED STATE (Winner/Loser) ---
  if (isSettled && hasUserBet) {
    return (
      <div className="sticky top-24 space-y-5">
        {/* --- OWNER ROYALTY CARD --- */}
        {isOwner && (
          <div className="animate-in slide-in-from-top-4 relative overflow-hidden rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 p-6 shadow-xl">
            {/* Decor */}
            <div className="pointer-events-none absolute top-0 right-0 p-4 opacity-10">
              <Crown className="h-24 w-24 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-yellow-500/20 blur-3xl"></div>

            <div className="relative z-10">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500 text-white shadow-sm">
                    <Crown className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-foreground text-sm font-bold tracking-wide uppercase">
                      {t('owner_dashboard') || 'Owner Dashboard'}
                    </h3>
                    <p className="text-muted-foreground text-[10px] font-medium">
                      {t('you_minted_this_asset') || 'You minted this asset'}
                    </p>
                  </div>
                </div>
                {/* Status Badge */}
                <div
                  className={`rounded-md border px-2 py-1 text-[10px] font-bold tracking-wider uppercase ${
                    isSettled
                      ? 'border-green-500/30 bg-green-500/20 text-green-500'
                      : 'border-yellow-500/30 bg-yellow-500/20 text-yellow-500'
                  }`}
                >
                  {isSettled
                    ? t('ready_to_claim') || 'Ready to Claim'
                    : t('accruing_fees') || 'Accruing Fees'}
                </div>
              </div>

              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="bg-card/60 rounded-xl border border-yellow-500/20 p-3 backdrop-blur-sm">
                  <p className="text-muted-foreground text-[10px] font-bold uppercase">
                    {t('total_volume') || 'Total Volume'}
                  </p>
                  <p className="text-foreground font-mono text-lg font-bold">
                    {formatPrecision((totalAmountNum / 1000000).toString())}M {displayTokenSymbol}
                  </p>
                </div>
                <div className="bg-card/60 rounded-xl border border-yellow-500/20 p-3 backdrop-blur-sm">
                  <p className="text-muted-foreground text-[10px] font-bold uppercase">
                    {t('royalty_rate') || 'Royalty Rate'}
                  </p>
                  <p className="font-mono text-lg font-bold text-green-500">5.0%</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="mb-2 flex items-end justify-between">
                  <span className="text-foreground text-sm font-medium">
                    {t('total_revenue') || 'Total Revenue'}
                  </span>
                  <span className="text-foreground text-2xl font-black tracking-tight">
                    {formatPrecision((totalAmountNum * 0.05).toString())} {displayTokenSymbol}
                  </span>
                </div>

                {/* Claim button commented out */}
                {/* {hasClaimedRoyalties ? (
                  <button
                    disabled
                    className="border-border bg-muted text-muted-foreground flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {t('revenue_claimed') || 'Revenue Claimed'}
                  </button>
                ) : (
                  <button
                    onClick={handleClaimRoyalties}
                    disabled={isClaimingRoyalties || !isSettled}
                    className={`group relative w-full overflow-hidden rounded-xl py-3.5 text-sm font-bold shadow-lg transition-transform active:scale-95 ${
                      isSettled
                        ? 'bg-foreground text-background'
                        : 'border-border bg-muted text-muted-foreground cursor-not-allowed border'
                    }`}
                  >
                    {isSettled && (
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 opacity-90 transition-opacity group-hover:opacity-100 animate-[shimmer_2s_infinite]"></div>
                    )}

                    <div
                      className={`relative flex items-center justify-center gap-2 ${
                        isSettled ? 'text-white' : ''
                      }`}
                    >
                      {isClaimingRoyalties ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t('processing') || 'Processing...'}
                        </>
                      ) : !isSettled ? (
                        <>
                          <Lock className="h-4 w-4" />
                          {t('locked_until_resolution') || 'Locked until Resolution'}
                        </>
                      ) : (
                        <>
                          <Coins className="h-4 w-4" />
                          {t('claim') || 'Claim'} {formatPrecision(accruedRoyalties.toString())}{' '}
                          {displayTokenSymbol}
                        </>
                      )}
                    </div>
                  </button>
                )} */}
              </div>

              <div className="border-border bg-muted/40 text-muted-foreground flex items-start gap-2 rounded-lg p-2 text-[10px]">
                <Clock className="mt-0.5 h-3 w-3 flex-shrink-0" />
                <p>
                  {t('royalties_accrue_info') ||
                    'Royalties accrue in real-time but can only be claimed after the market successfully resolves.'}
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="border-border bg-card h-fit rounded-2xl border p-6 shadow-xl">
          <div className="border-border mb-6 flex items-center justify-between border-b pb-4">
            <h3 className="text-foreground text-lg font-bold">
              {t('market_resolved') || 'Market Resolved'}
            </h3>
            {winningSide && (
              <span className="text-muted-foreground bg-muted flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold">
                {t('outcome') || 'Outcome'}:{' '}
                <span
                  className={winningSide === PredictionSide.YES ? 'text-green-500' : 'text-red-500'}
                >
                  {winningSide === PredictionSide.YES ? t('yes') : t('no')}
                </span>
              </span>
            )}
          </div>

          {/* Winner UI */}
          {isWinner && (
            <div className="animate-in zoom-in-95 space-y-6 duration-300">
              <div className="relative overflow-hidden rounded-xl border border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-6 text-center">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Trophy className="h-24 w-24 text-yellow-500" />
                </div>

                <Trophy className="mx-auto mb-2 h-12 w-12 text-yellow-500 drop-shadow-md" />
                <h4 className="text-foreground text-2xl font-black">
                  {t('victory') || 'Victory!'}
                </h4>
                <p className="text-muted-foreground mb-4 text-sm">
                  {t('you_predicted_correctly') || 'You predicted correctly.'}
                </p>

                <div className="bg-card/50 mb-6 flex flex-col items-center justify-center rounded-lg border border-yellow-500/20 p-3 backdrop-blur-sm">
                  <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                    {t('claimable_amount') || 'Claimable Amount'}
                  </span>
                  <span className="text-3xl font-black text-green-500">
                    {formatPrecision(claimableAmountFormatted)} {displayTokenSymbol}
                  </span>
                </div>

                {hasClaimed ? (
                  <button
                    disabled
                    className="bg-muted text-muted-foreground flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {t('rewards_claimed') || 'Rewards Claimed'}
                  </button>
                ) : (
                  <>
                    {!hasTwitterLogin ? (
                      <div className="flex w-full">
                        <XAuth className="!h-auto w-full rounded-xl bg-blue-600 py-4 text-base text-white shadow-lg transition-all hover:bg-blue-500" />
                      </div>
                    ) : !hasWalletConnected ? (
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
                    ) : !hasClaimableAmount ? (
                      <button
                        disabled
                        className="bg-muted text-muted-foreground flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold"
                      >
                        {t('no_claimable_amount') || 'No claimable amount'}
                      </button>
                    ) : (
                      <button
                        onClick={handleClaim}
                        disabled={isClaimPending || isClaimConfirming || !canClaim}
                        className="group relative w-full overflow-hidden rounded-xl bg-yellow-500 py-3.5 font-bold text-black shadow-lg shadow-yellow-500/20 transition-transform active:scale-95 disabled:cursor-wait disabled:opacity-70"
                      >
                        <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
                        <span className="flex items-center justify-center gap-2">
                          {isClaimPending || isClaimConfirming ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              {t('claiming') || 'Claiming...'}
                            </>
                          ) : (
                            <>
                              <Wallet className="h-4 w-4" /> {t('claim_rewards') || 'Claim Rewards'}
                            </>
                          )}
                        </span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Loser UI */}
          {isLoser && (
            <div className="animate-in zoom-in-95 space-y-6 duration-300">
              <div className="relative overflow-hidden rounded-xl border border-red-500/30 bg-gradient-to-br from-red-500/5 to-pink-500/5 p-6 text-center">
                {/* Background Elements */}
                <div className="pointer-events-none absolute -top-6 -right-6 p-4 opacity-5">
                  <XCircle className="h-40 w-40 text-red-500" />
                </div>

                <div className="relative z-10 mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                  <XCircle className="h-7 w-7 text-red-500" />
                </div>

                <h4 className="text-foreground relative z-10 mb-1 text-2xl font-black tracking-tight">
                  {t('position_liquidated') || 'Position Liquidated'}
                </h4>
                <p className="text-muted-foreground relative z-10 mb-6 text-sm">
                  {t('market_resolved_to') || 'Market resolved to'}{' '}
                  <span
                    className={
                      winningSide === PredictionSide.YES
                        ? 'font-bold text-green-500'
                        : 'font-bold text-red-500'
                    }
                  >
                    {winningSide === PredictionSide.YES ? t('yes') : t('no')}
                  </span>
                  .
                </p>

                <div className="bg-card/60 relative z-10 mb-6 flex items-center justify-between rounded-lg border border-red-500/10 p-4 shadow-inner backdrop-blur-md">
                  <div className="text-left">
                    <p className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                      {t('your_bet') || 'Your Bet'}
                    </p>
                    <p className="text-foreground text-lg font-bold">
                      {userBetChoice === 0 ? t('yes') : t('no')}
                    </p>
                  </div>
                  <div className="bg-border h-8 w-px"></div>
                  <div className="text-right">
                    <p className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                      {t('net_pnl') || 'Net PnL'}
                    </p>
                    <p className="text-lg font-bold text-red-500">
                      -{formatPrecision(userBetAmount)} {displayTokenSymbol}
                    </p>
                  </div>
                </div>

                <Link href={PagesRoute.OPINIONS}>
                  <button className="group bg-muted hover:bg-muted/80 border-border text-foreground relative z-10 w-full overflow-hidden rounded-xl border py-3.5 font-bold shadow-sm transition-all hover:shadow-md active:scale-95">
                    <span className="flex items-center justify-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />{' '}
                      {t('find_next_alpha') || 'Find Next Alpha'}
                    </span>
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>

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

  // --- RENDER: LIVE STATE (Betting) ---
  return (
    <div className="sticky top-24 space-y-5">
      {/* --- OWNER ROYALTY CARD --- */}
      {isOwner && (
        <div className="animate-in slide-in-from-top-4 relative overflow-hidden rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 p-6 shadow-xl">
          {/* Decor */}
          <div className="pointer-events-none absolute top-0 right-0 p-4 opacity-10">
            <Crown className="h-24 w-24 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-yellow-500/20 blur-3xl"></div>

          <div className="relative z-10">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500 text-white shadow-sm">
                  <Crown className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-foreground text-sm font-bold tracking-wide uppercase">
                    {t('owner_dashboard') || 'Owner Dashboard'}
                  </h3>
                  <p className="text-muted-foreground text-[10px] font-medium">
                    {t('you_minted_this_asset') || 'You minted this asset'}
                  </p>
                </div>
              </div>
              {/* Status Badge */}
              <div
                className={`rounded-md border px-2 py-1 text-[10px] font-bold tracking-wider uppercase ${
                  isSettled
                    ? 'border-green-500/30 bg-green-500/20 text-green-500'
                    : 'border-yellow-500/30 bg-yellow-500/20 text-yellow-500'
                }`}
              >
                {isSettled
                  ? t('ready_to_claim') || 'Ready to Claim'
                  : t('accruing_fees') || 'Accruing Fees'}
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="bg-card/60 rounded-xl border border-yellow-500/20 p-3 backdrop-blur-sm">
                <p className="text-muted-foreground text-[10px] font-bold uppercase">
                  {t('total_volume') || 'Total Volume'}
                </p>
                <p className="text-foreground font-mono text-base font-bold">
                  {formatPrecision((totalAmountNum / 1000000).toString())}M {displayTokenSymbol}
                </p>
              </div>
              <div className="bg-card/60 flex flex-col items-center justify-center rounded-xl border border-yellow-500/20 p-3 backdrop-blur-sm">
                <p className="text-muted-foreground text-[10px] font-bold uppercase">
                  {t('royalty_rate') || 'Royalty Rate'}
                </p>
                <p className="my-auto font-mono text-base font-bold text-green-500">5.0%</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="mb-2 flex items-end justify-between">
                <span className="text-foreground text-sm font-medium">
                  {t('royalties_share') || 'Total Revenue'}
                </span>
                <span className="text-foreground text-2xl font-black tracking-tight">
                  {formatPrecision((totalAmountNum * 0.05).toString())} {displayTokenSymbol}
                </span>
              </div>

              {/* Claim button commented out */}
              {/* {hasClaimedRoyalties ? (
                <button
                  disabled
                  className="border-border bg-muted text-muted-foreground flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold"
                >
                  <CheckCircle className="h-4 w-4" />
                  {t('revenue_claimed') || 'Revenue Claimed'}
                </button>
              ) : (
                <button
                  onClick={handleClaimRoyalties}
                  disabled={isClaimingRoyalties || !isSettled}
                  className={`group relative w-full overflow-hidden rounded-xl py-3.5 text-sm font-bold shadow-lg transition-transform active:scale-95 ${
                    isSettled
                      ? 'bg-foreground text-background'
                      : 'border-border bg-muted text-muted-foreground cursor-not-allowed border'
                  }`}
                >
                  {isSettled && (
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 opacity-90 transition-opacity group-hover:opacity-100 animate-[shimmer_2s_infinite]"></div>
                  )}

                  <div
                    className={`relative flex items-center justify-center gap-2 ${
                      isSettled ? 'text-white' : ''
                    }`}
                  >
                    {isClaimingRoyalties ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('processing') || 'Processing...'}
                      </>
                    ) : !isSettled ? (
                      <>
                        <Lock className="h-4 w-4" />
                        {t('locked_until_resolution') || 'Locked until Resolution'}
                      </>
                    ) : (
                      <>
                        <Coins className="h-4 w-4" />
                        {t('claim') || 'Claim'} {formatPrecision(accruedRoyalties.toString())}{' '}
                        {displayTokenSymbol}
                      </>
                    )}
                  </div>
                </button>
              )} */}
            </div>

            <div className="border-border bg-muted/40 text-muted-foreground flex items-start gap-2 rounded-lg p-2 text-[10px]">
              <Clock className="mt-0.5 h-3 w-3 flex-shrink-0" />
              <p>
                {t('royalties_accrue_info') ||
                  'Royalties accrue in real-time but can only be claimed after the market successfully resolves.'}
              </p>
            </div>
          </div>
        </div>
      )}
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
              {chainConfig?.name}
            </span>
          )}
        </div>

        {/* 未参与提示 */}
        {/* {isSettled && !hasUserBet && (
          <div className="text-muted-foreground py-8 text-center">
            <p>{t('you_did_not_participate') || 'You did not participate in this market.'}</p>
          </div>
        )} */}

        {/* Tab 切换 - 始终显示 YES/NO，下注后禁用已下注的一边 */}
        {!isSettled && (
          <div className="bg-muted/20 border-border relative mb-6 flex rounded-lg border p-1">
            <button
              onClick={() => setActiveTab('yes')}
              disabled={isEnded || (hasUserBet && userBetChoice !== 0)}
              className={`relative flex-1 rounded-md py-2.5 text-sm font-semibold transition-all ${
                activeTab === 'yes'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-muted-foreground hover:text-foreground'
              } ${hasUserBet && userBetChoice !== 0 ? 'cursor-not-allowed opacity-30' : ''} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {t('yes')} {yesPercentage.toFixed(1)}%
            </button>
            <button
              onClick={() => setActiveTab('no')}
              disabled={isEnded || (hasUserBet && userBetChoice !== 1)}
              className={`relative flex-1 rounded-md py-2.5 text-sm font-semibold transition-all ${
                activeTab === 'no'
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                  : 'text-muted-foreground hover:text-foreground'
              } ${hasUserBet && userBetChoice !== 1 ? 'cursor-not-allowed opacity-30' : ''} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {t('no')} {noPercentage.toFixed(1)}%
            </button>
          </div>
        )}

        {/* Existing Position Card (If any) */}
        {hasUserBet && !isSettled && (
          <div className="animate-in slide-in-from-top-2 relative mb-6 overflow-hidden rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold tracking-wide text-blue-500 uppercase">
                {t('your_position') || 'Your Position'}
              </span>
              <span
                className={`rounded px-2 py-0.5 text-xs font-bold ${
                  userBetChoice === 0
                    ? 'bg-green-500/20 text-green-500'
                    : 'bg-red-500/20 text-red-500'
                }`}
              >
                {userBetChoice === 0 ? t('yes') : t('no')} {t('holder') || 'Holder'}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-foreground text-2xl font-bold">
                  {userSharePercentage}%{' '}
                  <span className="text-muted-foreground text-sm font-normal">
                    {t('share') || 'Share'}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-xs">{t('value') || 'Value'}</p>
                <p className="text-foreground font-mono font-medium">
                  {formatPrecision(userBetAmount)} {displayTokenSymbol}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 下注后显示提示信息 */}
        {hasUserBet && !isSettled && (
          <div className="bg-muted/50 text-muted-foreground border-border mb-4 flex items-center gap-2 rounded-lg border p-2 text-xs">
            <Info className="h-3 w-3" />
            <span>
              {t('you_hold') || 'You hold'}{' '}
              <strong className={cn(userBetChoice === 0 ? 'text-green-500' : 'text-red-500')}>{userBetChoice === 0 ? t('yes') : t('no')}</strong>.{' '}
              {t('must_sell_before_betting_opposite') ||
                'You must sell your position before betting on the opposite side.'}
            </span>
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

      {/* Share Modal */}
      <OpinionShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        side={shareModalSide}
        mode="POST_TRADE"
        amountInvested={shareModalAmount}
      />
    </div>
  );
}
