'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@shadcn/components/ui/dialog';
import { Card, CardContent } from '@shadcn/components/ui/card';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getPointsTopList, IGetPointsTopListItem } from '../../../libs/request';
import LoaderCircle from '@ui/loading/loader-circle';
import { RankFirst, RankSecond, RankThird } from '@assets/svg';
import defaultAvatar from '@assets/image/avatar.png';
import { cn } from '@shadcn/lib/utils';
import { useAgentDetails } from '../../../hooks/useAgentDetails';

interface RankingDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const getRankIcon = (rank: number) => {
  if (rank === 1) {
    return <RankFirst className="h-8 w-8 rounded-full" />;
  } else if (rank === 2) {
    return <RankSecond className="h-8 w-8 rounded-full" />;
  } else if (rank === 3) {
    return <RankThird className="h-8 w-8 rounded-full" />;
  }
  return <span className="text-md">{rank}</span>;
};

export default function RankingDialog({ isOpen, onClose }: RankingDialogProps) {
  const t = useTranslations('common');
  const [rankingData, setRankingData] = useState<IGetPointsTopListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取当前用户的统计数据
  const { points, rank } = useAgentDetails();

  // 获取排行榜数据
  const fetchRankingData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPointsTopList();
      if (response.data) {
        setRankingData(response.data);
      } else {
        setRankingData([]);
      }
    } catch (error) {
      console.error('获取排行榜数据失败:', error);
      setError(t('load_failed'));
      setRankingData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRankingData();
    }
  }, [isOpen]);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogClose asChild></DialogClose>
      <DialogContent className="border-border flex max-h-[90vh] w-96 max-w-full flex-col gap-0 overflow-hidden bg-transparent p-4 shadow-none sm:w-[450px] sm:max-w-full sm:p-0">
        {/* Header */}
        <DialogHeader className="bg-primary gap-0 rounded-t-xl p-2 text-center text-white sm:rounded-t-2xl sm:p-4">
          <DialogTitle className="text-center text-base font-semibold text-white">
            {t('ranking')}
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="bg-background rounded-b-xl p-4 sm:rounded-b-2xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <LoaderCircle text={`${t('loading')}...`} />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="bg-destructive/10 mb-4 rounded-full p-2">
                <X className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="text-md mb-2 font-semibold">{t('load_failed')}</h3>
              <p className="text-muted-foreground mb-6 text-sm">{error}</p>
              <button
                onClick={fetchRankingData}
                className="bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-white"
              >
                {t('retry')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 统计卡片 */}
              <div className="border-border grid grid-cols-2 gap-3 rounded-md border p-3">
                <div className="bg-primary/5 rounded-2xl p-4 text-center">
                  <div className="text-primary text-sm">{t('points_earned')}</div>
                  <div className="text-md text-primary">{points?.toLocaleString() || '0'}</div>
                </div>
                <div className="bg-primary/5 rounded-2xl p-4 text-center">
                  <div className="text-primary text-sm">{t('ranking')}</div>
                  <div className="text-md text-primary"># {rank || '-'}</div>
                </div>
              </div>

              {/* 排行榜列表 */}
              <div>
                <h3 className="mb-3 text-base font-semibold">{t('my_invitee')}</h3>
                <div className="border-border rounded-md border p-3">
                  {rankingData.length === 0 ? (
                    <div className="text-muted-foreground py-8 text-center">
                      <p>{t('no_data')}</p>
                    </div>
                  ) : (
                    rankingData.map((item, index) => {
                      const rank = index + 1;
                      return (
                        <div
                          key={item.id || index}
                          className="border-primary/5 hover:bg-primary/5 flex items-center justify-between border-b py-2 last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex w-10 items-center justify-center">
                              {getRankIcon(rank)}
                            </div>
                            {item.profile_image_url ? (
                              <img
                                src={item.profile_image_url}
                                alt={item.screen_name}
                                className={cn(
                                  'h-10 min-h-10 w-10 min-w-10 rounded-full',
                                  rank > 3 && 'h-6 min-h-6 w-6 min-w-6'
                                )}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = defaultAvatar.src;
                                }}
                              />
                            ) : (
                              <div
                                className={cn(
                                  'h-10 min-h-10 w-10 min-w-10 rounded-full bg-gradient-to-r from-orange-400 to-purple-600',
                                  rank > 3 && 'h-6 min-h-6 w-6 min-w-6'
                                )}
                              />
                            )}
                            <span
                              className={cn(
                                'text-md max-w-[120px] truncate',
                                rank <= 3 && 'text-base font-semibold'
                              )}
                            >
                              {item.screen_name || t('unknown_user')}
                            </span>
                          </div>
                          <div
                            className={cn(
                              rank <= 3 &&
                                'bg-primary/5 flex flex-col items-center justify-center rounded-2xl p-2 px-6'
                            )}
                          >
                            <span
                              className={cn(
                                'text-md',
                                rank <= 3 && 'text-primary text-base font-semibold'
                              )}
                            >
                              {item.point?.toLocaleString() || 0}{' '}
                            </span>
                            <span
                              className={cn(
                                'text-md pr-1',
                                rank <= 3 && 'text-primary pr-0 text-sm'
                              )}
                            >
                              {t('points')}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
