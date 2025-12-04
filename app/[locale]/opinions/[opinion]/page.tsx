'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@libs/i18n/navigation';
import { ArrowLeft, ExternalLink, HelpCircle, CheckCircle2, Droplet } from 'lucide-react';
import { Skeleton } from '@shadcn/components/ui/skeleton';
import PagesRoute from '@constants/routes';
import { useBetDetail } from '@hooks/useBetDetail';
import { useTranslations } from 'next-intl';
import { PredictionSide } from './types';
import defaultAvatar from '@assets/image/avatar.png';
import {
  useAccount,
  useSwitchChain,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from 'wagmi';
import { toast } from 'sonner';
import {
  ChainType,
  getChainConfig,
  getDefaultChain,
  getChainTypeFromChainId,
} from '@constants/config';
import useUserInfo from '@hooks/useUserInfo';
import Faucet_abi from '@constants/abi/faucet.json';
import { Loader2, Wallet } from 'lucide-react';
import UIWallet from '@ui/wallet';

// 导入新组件
import {
  OpinionTradingPanel,
  OpinionSentimentChart,
  OpinionCommentList,
  OpinionActivityList,
  OpinionTopVoiceList,
  OpinionBrandVoiceComparison,
  OpinionSentimentVoterList,
  OpinionShareModal,
  OpinionAgentInsight,
} from './components';

export default function OpinionsPage() {
  const params = useParams();
  const opinionId = params?.opinion as string;
  const t = useTranslations('common');
  const { address, chainId: currentChainId } = useAccount();
  const { isLogin } = useUserInfo();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  // 使用自定义 hook 获取 bet 详情数据
  const { betDetail, isLoading, isError, topic, attitude, commission, commentsTotal, chainId } =
    useBetDetail(opinionId);

  // 确定使用的链（chainId 为 0 或 undefined 时使用 base）
  const betChainId = !chainId || chainId === 0 ? getDefaultChain().chainId : chainId;
  // 根据 chainId 确定链类型
  const chainType = getChainTypeFromChainId(Number(betChainId));
  const chainConfig = getChainConfig(chainType);
  const expectedChainId = Number(betChainId);
  const isWrongChain = currentChainId !== expectedChainId;

  // 水龙头相关状态
  const [faucetHash, setFaucetHash] = useState<`0x${string}` | undefined>();
  const [pendingFaucetClaim, setPendingFaucetClaim] = useState(false);

  // 读取 canClaim 状态
  const { data: canClaimFaucet, refetch: refetchCanClaim } = useReadContract({
    address: chainConfig?.FaucetAddress as `0x${string}`,
    abi: Faucet_abi,
    functionName: 'canClaim',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!chainConfig?.FaucetAddress && !isWrongChain,
    },
  });

  // 写入合约 - 领取水龙头
  const {
    writeContract: writeFaucetClaim,
    isPending: isFaucetPending,
    error: faucetError,
  } = useWriteContract();

  // 等待交易确认
  const { isLoading: isFaucetConfirming, isSuccess: isFaucetSuccess } =
    useWaitForTransactionReceipt({
      hash: faucetHash,
    });

  // 执行实际的领取操作
  const executeFaucetClaim = useCallback(async () => {
    if (isWrongChain) {
      toast.error(t('wrong_chain') || 'Wrong chain');
      return;
    }

    if (!chainConfig?.FaucetAddress) {
      toast.error('Faucet contract address not configured');
      return;
    }

    if (!canClaimFaucet) {
      toast.error(t('cannot_claim_faucet') || 'Cannot claim faucet');
      return;
    }

    try {
      writeFaucetClaim({
        address: chainConfig.FaucetAddress as `0x${string}`,
        abi: Faucet_abi,
        functionName: 'claim',
      });
    } catch (error: any) {
      console.error('Faucet claim error:', error);
      toast.error(error?.message || t('faucet_claim_failed') || 'Faucet claim failed');
    }
  }, [isWrongChain, chainConfig?.FaucetAddress, canClaimFaucet, writeFaucetClaim, t]);

  // 处理水龙头领取按钮点击
  const handleFaucetClaim = useCallback(async () => {
    if (!isLogin) {
      // 如果未登录，标记待领取（用户需要先点击Sign按钮登录）
      setPendingFaucetClaim(true);
      return;
    }

    // 已登录，直接执行领取
    executeFaucetClaim();
  }, [isLogin, executeFaucetClaim]);

  // 处理链切换
  const handleSwitchChain = useCallback(async () => {
    if (!chainConfig) return;
    try {
      await switchChain({ chainId: expectedChainId });
    } catch (error) {
      console.error('Switch chain error:', error);
    }
  }, [switchChain, chainConfig, expectedChainId]);

  // 监听登录状态变化，登录成功后自动执行领取
  useEffect(() => {
    if (isLogin && pendingFaucetClaim) {
      // 登录成功且有待领取标记，自动执行领取
      setPendingFaucetClaim(false);
      // 延迟一下确保状态已更新
      setTimeout(() => {
        executeFaucetClaim();
      }, 500);
    }
  }, [isLogin, pendingFaucetClaim, executeFaucetClaim]);

  // 处理交易成功
  useEffect(() => {
    if (isFaucetSuccess && faucetHash) {
      toast.success(t('faucet_claim_success') || 'Faucet claim successful!');
      setFaucetHash(undefined);
      setPendingFaucetClaim(false);
      refetchCanClaim();
    }
  }, [isFaucetSuccess, faucetHash, refetchCanClaim, t]);

  // 处理交易错误
  useEffect(() => {
    if (faucetError) {
      toast.error(faucetError.message || t('faucet_claim_failed') || 'Faucet claim failed');
    }
  }, [faucetError, t]);

  // Tab 状态
  const [activeTab, setActiveTab] = useState<'prospective' | 'top_voice' | 'comments' | 'activity'>(
    'prospective'
  );

  // 时间框架状态
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<string>('1D');

  // Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareSide, setShareSide] = useState<PredictionSide>(PredictionSide.YES);

  const openShareModal = (side: PredictionSide) => {
    setShareSide(side);
    setIsShareModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto min-h-screen px-4 py-8 pb-20 transition-colors duration-300">
        <Link
          href={PagesRoute.OPINIONS}
          className="text-muted-foreground hover:text-foreground mb-6 flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> {t('back_to_markets')}
        </Link>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="border-border bg-card rounded-2xl border p-6">
              <div className="mb-6 flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="ml-auto space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-5/6" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !betDetail || !topic || !attitude) {
    return (
      <div className="container mx-auto min-h-screen px-4 py-8 pb-20 transition-colors duration-300">
        <Link
          href={PagesRoute.OPINIONS}
          className="text-muted-foreground hover:text-foreground mb-6 flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> {t('back_to_markets')}
        </Link>
        <div className="flex items-center justify-center py-12">
          <div className="text-destructive">{t('load_failed_retry')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen px-4 py-8 pb-20 transition-colors duration-300">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={PagesRoute.OPINIONS}
          className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> {t('back_to_markets')}
        </Link>
        <div className="flex items-center gap-2">
          {/* 水龙头按钮 */}
          {chainConfig?.FaucetAddress && (
            <div className="flex items-center gap-2">
              {!isLogin ? (
                <div className="relative">
                  <UIWallet
                    className="!h-auto !rounded-lg !px-3 !py-2 text-sm"
                    chainId={expectedChainId || undefined}
                  />
                </div>
              ) : (
                <button
                  onClick={isWrongChain ? handleSwitchChain : handleFaucetClaim}
                  disabled={
                    isFaucetPending ||
                    isFaucetConfirming ||
                    isSwitchingChain ||
                    (isLogin && !canClaimFaucet)
                  }
                  className="text-muted-foreground hover:text-primary flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                  title={t('faucet_claim') || 'Claim test tokens'}
                >
                  {isFaucetPending || isFaucetConfirming || isSwitchingChain ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t('claiming') || 'Claiming...'}
                    </>
                  ) : (
                    <>
                      <Droplet className="h-4 w-4" />
                      {t('faucet_claim') || 'Faucet'}
                    </>
                  )}
                </button>
              )}
            </div>
          )}
          <button
            onClick={() => {
              window.open('https://www.alchemy.com/faucets/base-sepolia', '_blank');
            }}
            className="text-muted-foreground hover:text-primary flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            title={t('faucet_claim') || 'Claim test tokens'}
          >
            <Droplet className="h-4 w-4" />
            {t('get_gas_fee') || 'Get gas fee'}
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content (Left Col) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Market Header Card */}
          <div className="border-border bg-card rounded-2xl border p-6">
            <div className="mb-6 flex items-center gap-4">
              <img
                src={topic.icon || ''}
                className="border-border h-16 w-16 rounded-full border-2"
                alt={topic.name || ''}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = defaultAvatar.src;
                }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-foreground text-2xl font-bold">{topic.name}</h1>
                  {false && <CheckCircle2 className="text-primary h-5 w-5" />}
                </div>
                <p className="text-primary">@{topic.screen_name}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-muted-foreground text-sm">{t('vol')}</p>
                <p className="text-primary font-mono text-lg font-bold">
                  ${commission.toLocaleString()}
                </p>
              </div>
            </div>

            <p className="text-foreground/90 mb-4 text-xl leading-relaxed font-medium">
              {topic.content}
            </p>

            <div className="border-border bg-muted/20 relative overflow-hidden rounded-xl border p-4">
              <div className="bg-primary absolute top-0 bottom-0 left-0 w-1"></div>
              <p className="text-muted-foreground pl-2 italic">"{attitude.content}"</p>
              {attitude.tweet_url && (
                <div className="mt-2 flex justify-end">
                  <a
                    href={attitude.tweet_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary flex items-center gap-1 text-xs hover:underline"
                  >
                    {t('view_original')} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Chart Section */}
          <div className="border-border bg-card min-h-[400px] rounded-2xl border p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-muted-foreground font-semibold">
                {t('price_history')} ({t('yes')})
              </h3>
              <div className="flex gap-2">
                {['1D'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setSelectedTimeFrame(tf)}
                    className={`rounded-lg px-3 py-1 text-xs transition-all ${
                      selectedTimeFrame === tf
                        ? 'bg-muted text-foreground font-semibold'
                        : 'text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
            <OpinionSentimentChart />
          </div>

          {/* AI Agent Section */}
          <OpinionAgentInsight />

          {/* Tabs Navigation */}
          <div>
            <div className="border-border flex overflow-x-auto border-b">
              <button
                onClick={() => setActiveTab('prospective')}
                className={`border-b-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'prospective' ? 'border-primary text-foreground' : 'text-muted-foreground hover:text-foreground border-transparent'}`}
              >
                {t('tab_prospective')}
              </button>
              <button
                onClick={() => setActiveTab('top_voice')}
                className={`border-b-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'top_voice' ? 'border-primary text-foreground' : 'text-muted-foreground hover:text-foreground border-transparent'}`}
              >
                {t('tab_top_voice')}
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`border-b-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'comments' ? 'border-primary text-foreground' : 'text-muted-foreground hover:text-foreground border-transparent'}`}
              >
                {t('tab_comments')} {commentsTotal !== undefined && `(${commentsTotal})`}
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`border-b-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'activity' ? 'border-primary text-foreground' : 'text-muted-foreground hover:text-foreground border-transparent'}`}
              >
                {t('tab_activity')}
              </button>
            </div>

            <div className="py-6">
              {activeTab === 'prospective' && (
                <div className="animate-fade-in">
                  {/* Hero Brand Voice Section */}
                  <OpinionBrandVoiceComparison />

                  {/* List Breakdown Section */}
                  <OpinionSentimentVoterList />
                </div>
              )}

              {activeTab === 'top_voice' && <OpinionTopVoiceList />}

              {activeTab === 'comments' && <OpinionCommentList />}

              {activeTab === 'activity' && <OpinionActivityList />}
            </div>
          </div>
        </div>

        {/* Sidebar (Right Col) */}
        <div className="space-y-6 lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <OpinionTradingPanel onShare={openShareModal} />
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <OpinionShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        side={shareSide}
      />
    </div>
  );
}
