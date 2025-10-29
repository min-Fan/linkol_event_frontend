'use client';

import React, { useEffect, useState } from 'react';
import { IEventInfoResponseData, getVoteInfo, IGetVoteInfoResponseData, vote } from '@libs/request';
import { Loader2, Rocket } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Skeleton } from '@shadcn/components/ui/skeleton';
import { Button } from '@shadcn/components/ui/button';
import { track } from '@vercel/analytics';
import { useAppSelector } from '@store/hooks';

// 骨架屏组件
function EventVoteSkeleton() {
  return (
    <div className="flex h-full flex-col gap-2 sm:gap-4">
      {/* <div className="flex items-center gap-1">
        <Skeleton className="h-6 w-6 rounded-full sm:h-8 sm:w-8" />
        <Skeleton className="h-5 w-32 sm:h-6 sm:w-40" />
      </div> */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#BFFF00] bg-[#BFFF00]/15 p-3 sm:gap-4 sm:rounded-2xl">
        <Skeleton className="h-12 w-full rounded-lg sm:h-14 sm:rounded-xl" />

        {/* 按钮骨架屏 */}
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-9 flex-1 rounded-full" />
          <Skeleton className="h-9 flex-1 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function EventVote({ eventInfo }: { eventInfo: IEventInfoResponseData }) {
  const t = useTranslations('common');
  const locale = useLocale();
  const [voteInfo, setVoteInfo] = useState<IGetVoteInfoResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [votingType, setVotingType] = useState<'yes' | 'no' | null>(null);
  const twInfo = useAppSelector((state) => state.userReducer?.twitter_full_profile);

  useEffect(() => {
    const fetchVoteInfo = async () => {
      try {
        setLoading(true);
        const res = await getVoteInfo();
        if (res.code === 200 && res.data) {
          setVoteInfo(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch vote info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVoteInfo();
  }, []);

  // 计算 yes 的占比
  const calculateYesPercentage = () => {
    if (!voteInfo) return 50; // 默认值，用于加载状态

    const yes = voteInfo.yes_count || 0;
    const no = voteInfo.no_count || 0;
    const total = yes + no;

    if (total === 0) return 0; // 避免 0/0 的情况

    const percentage = Math.round((yes / total) * 100);
    return isNaN(percentage) ? 0 : percentage; // 防止 NaN
  };

  const yesPercentage = calculateYesPercentage();

  // 获取标题，根据语言选择
  const title = voteInfo ? (locale === 'en' ? voteInfo.en_title : voteInfo.title) : '';

  const handleVote = async (type: 'yes' | 'no') => {
    if (!voteInfo || voting) return;

    try {
      setVotingType(type);
      setVoting(true);
      const res = await vote({
        is_yes: type === 'yes' ? 1 : 0,
        vote_content_id: voteInfo.id,
      });

      if (res.code === 200) {
        // 投票成功后重新获取投票信息
        const updatedRes = await getVoteInfo();
        if (updatedRes.code === 200 && updatedRes.data) {
          setVoteInfo(updatedRes.data);

          // 埋点：投票成功
          track('Vote Success', {
            vote_type: type,
            vote_content_id: voteInfo.id,
            event_id: eventInfo.id,
            user_name: twInfo?.name,
            user_screen_name: twInfo?.screen_name,
          });
        }
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setVoting(false);
      setVotingType(null);
    }
  };

  // 检查用户是否已投票
  const hasVoted = voteInfo?.vote_detail?.is_vote;
  const userVote = voteInfo?.vote_detail?.is_yes;

  // 如果正在加载，显示骨架屏
  if (loading) {
    return <EventVoteSkeleton />;
  }

  return (
    <div className="flex h-full flex-col gap-2 sm:gap-4">
      {/* <div className="flex items-center gap-1">
        <div className="rounded-full bg-[#BFFF00] p-1">
          <Rocket className="h-4 w-4 sm:h-6 sm:w-6" />
        </div>
        <span className="text-sm font-semibold sm:text-base">{t('pump_progress')}</span>
      </div> */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#BFFF00] bg-[#BFFF00]/15 p-3 sm:gap-4 sm:rounded-2xl">
        <p className="rounded-lg bg-[#BFFF00] px-3 py-2 text-sm font-medium text-black sm:rounded-xl">
          {title}
        </p>

        {/* 已投票状态 - 只显示进度条 */}
        {hasVoted ? (
          <div className="flex items-center gap-3">
            <div className="bg-muted relative h-3 flex-1 overflow-hidden rounded-full sm:h-3">
              {/* 填充的渐变部分 */}
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${yesPercentage}%`,
                  background: 'linear-gradient(to right, #BFFF00, #1FEF80, #007AFF)',
                }}
              />
            </div>

            {/* 百分比显示 */}
            <span className="text-primary sm:text-md text-sm">{voteInfo.yes_count || 0} {t('people')}</span>
          </div>
        ) : (
          // 未投票状态 - 只显示按钮
          <div className="flex items-center gap-2">
            {/* No 按钮 */}
            {votingType !== 'yes' && (
              <Button
                variant="outline"
                className={`border-border text-muted-foreground/80 rounded-full border bg-transparent font-medium transition-all duration-300 ease-in-out hover:border-[#BFFF00] hover:bg-[#BFFF00]/40 disabled:opacity-50 ${
                  votingType === 'no' ? 'w-full' : 'flex-1'
                }`}
                onClick={() => handleVote('no')}
                disabled={voting}
              >
                <span>
                  {votingType === 'no' && voting ? (
                    <Loader2 className="!h-4 !w-4 animate-spin" />
                  ) : (
                    t('vote_no')
                  )}
                </span>
              </Button>
            )}

            {/* Yes 按钮 */}
            {votingType !== 'no' && (
              <Button
                variant="outline"
                className={`border-border text-muted-foreground/80 rounded-full border bg-transparent font-medium transition-all duration-300 ease-in-out hover:border-[#BFFF00] hover:bg-[#BFFF00]/40 disabled:opacity-50 ${
                  votingType === 'yes' ? 'w-full' : 'flex-1'
                }`}
                onClick={() => handleVote('yes')}
                disabled={voting}
              >
                <span>
                  {votingType === 'yes' && voting ? (
                    <Loader2 className="!h-4 !w-4 animate-spin" />
                  ) : (
                    t('vote_yes')
                  )}
                </span>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
