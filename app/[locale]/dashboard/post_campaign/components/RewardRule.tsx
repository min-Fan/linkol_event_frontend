'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Plus, Trash2 } from 'lucide-react';

import { Card, CardContent } from '@shadcn-ui/card';
import { Input } from '@shadcn-ui/input';
import { Button } from '@shadcn-ui/button';
import { getRewardRule } from '@libs/request';
import { useAppSelector } from '@store/hooks';

interface RankingRule {
  id: string;
  rank: number;
  amount: string;
}

interface SegmentRule {
  id: string;
  startRank: string;
  endRank: string;
  amount: string;
}

interface RewardRuleItem {
  id: number;
  zh_name: string;
  en_name: string;
  code: string;
}

interface RewardRuleProps {
  activeTypeId: string;
  onChange?: (data: any) => void;
  onValidationChange?: (isValid: boolean) => void;
  resetTrigger?: number; // 添加重置触发器
  rewardAmount?: string; // 总奖励金额，用于验证
}

export default function RewardRule({
  activeTypeId,
  onChange,
  onValidationChange,
  resetTrigger,
  rewardAmount,
}: RewardRuleProps) {
  // 安全的数值处理函数
  const formatNumber = (value: string): string => {
    const num = parseFloat(value);
    if (isNaN(num)) return '';
    return num.toFixed(2);
  };

  const parseNumber = (value: string): number => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : Math.round(num * 100) / 100; // 保留两位小数
  };

  const handleNumberInput = (value: string, callback: (val: string) => void) => {
    // 允许输入数字和小数点
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      callback(value);
    }
  };
  const t = useTranslations('common');
  const locale = useLocale();
  const [rewardRules, setRewardRules] = useState<RewardRuleItem[]>([]);
  const [ruleType, setRuleType] = useState<string>('');
  const [randomParticipants, setRandomParticipants] = useState('');
  const payTokenInfo = useAppSelector((state) => state.userReducer?.pay_token_info);

  // 固定排名+随机发放规则
  const [rankingRules, setRankingRules] = useState<RankingRule[]>([
    { id: '1', rank: 1, amount: '' },
  ]);
  const [additionalRandomParticipants, setAdditionalRandomParticipants] = useState('');

  // 分段发放规则
  const [segmentRules, setSegmentRules] = useState<SegmentRule[]>([
    { id: '1', startRank: '1', endRank: '50', amount: '' },
  ]);

  // 监听重置触发器和初始数据
  useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger > 0) {
      setRuleType('');
      setRandomParticipants('');
      setRankingRules([{ id: '1', rank: 1, amount: '' }]);
      setAdditionalRandomParticipants('');
      setSegmentRules([{ id: '1', startRank: '1', endRank: '50', amount: '' }]);
    }
  }, [resetTrigger]);

  const getRules = async () => {
    try {
      const res = await getRewardRule();
      if (res.code === 200) {
        setRewardRules(res.data);
        if (res.data.length > 0) {
          setRuleType(res.data[0].code);
        }
      }
    } catch (error) {
      console.error('获取奖励规则失败:', error);
    }
  };
  // 获取奖励规则
  useEffect(() => {
    if (activeTypeId) {
      getRules();
    }
  }, [activeTypeId]);

  const getRankSuffix = (rank: number) => {
    if (rank === 1) return 'st';
    if (rank === 2) return 'nd';
    if (rank === 3) return 'rd';
    return 'th';
  };

  const addRankingRule = () => {
    const newRank = rankingRules.length + 1;
    setRankingRules([...rankingRules, { id: Date.now().toString(), rank: newRank, amount: '' }]);
  };

  const removeRankingRule = (id: string) => {
    if (rankingRules.length > 1) {
      setRankingRules(rankingRules.filter((rule) => rule.id !== id));
    }
  };

  const updateRankingRule = (id: string, amount: string) => {
    setRankingRules(rankingRules.map((rule) => (rule.id === id ? { ...rule, amount } : rule)));
  };

  const addSegmentRule = () => {
    const lastRule = segmentRules[segmentRules.length - 1];
    const lastEndRank = parseInt(lastRule.endRank) || 0;

    // 如果最后一段有结束排名，则自动计算下一段的起始排名
    const newStart = lastEndRank > 0 ? (lastEndRank + 1).toString() : '';
    const newEnd = '';

    setSegmentRules([
      ...segmentRules,
      { id: Date.now().toString(), startRank: newStart, endRank: newEnd, amount: '' },
    ]);
  };

  const validateSegmentRanks = (rules: SegmentRule[]) => {
    for (let i = 1; i < rules.length; i++) {
      const prevRule = rules[i - 1];
      const currentRule = rules[i];

      const prevEnd = parseInt(prevRule.endRank) || 0;
      const currentStart = parseInt(currentRule.startRank) || 0;

      if (currentStart <= prevEnd) {
        return false;
      }
    }
    return true;
  };

  const getSegmentError = (index: number, field: 'startRank' | 'endRank') => {
    if (index === 0 && field === 'startRank') return null;

    const currentRule = segmentRules[index];
    const prevRule = segmentRules[index - 1];

    if (field === 'startRank' && prevRule) {
      const prevEnd = parseInt(prevRule.endRank) || 0;
      const currentStart = parseInt(currentRule.startRank) || 0;

      if (prevEnd > 0 && currentStart <= prevEnd) {
        return `${t('reward_rule_rank_start_error')} ${prevEnd}`;
      }
    }

    if (field === 'endRank') {
      const currentStart = parseInt(currentRule.startRank) || 0;
      const currentEnd = parseInt(currentRule.endRank) || 0;
      if (currentEnd <= currentStart) {
        return t('reward_rule_rank_end_error');
      }

      // 检查下一段的起始排名
      const nextRule = segmentRules[index + 1];
      if (nextRule) {
        const nextStart = parseInt(nextRule.startRank) || 0;
        if (nextStart > 0 && nextStart <= currentEnd) {
          return `${t('reward_rule_rank_overlap_error')} ${nextStart}`;
        }
      }
    }

    return null;
  };

  // 计算总奖励金额
  const calculateTotalReward = (): number => {
    switch (ruleType) {
      case 'fixed_ranking_random_distribution':
        // 固定排名奖励总额
        const rankingTotal = rankingRules.reduce((total, rule) => {
          const amount = parseNumber(rule.amount);
          return Math.round((total + amount) * 100) / 100; // 保持精度
        }, 0);
        return rankingTotal;

      case 'segmented_distribution':
        // 分段发放总额
        const segmentTotal = segmentRules.reduce((total, rule) => {
          const amount = parseNumber(rule.amount);
          const startRank = parseInt(rule.startRank) || 0;
          const endRank = parseInt(rule.endRank) || 0;
          const participants = endRank - startRank + 1;
          const segmentReward = Math.round(amount * participants * 100) / 100;
          return Math.round((total + segmentReward) * 100) / 100;
        }, 0);
        return segmentTotal;

      default:
        return 0;
    }
  };

  // 检查总额是否超限
  const isTotalAmountExceeded = (): boolean => {
    if (!rewardAmount || ruleType === 'random_distribution') return false;

    const maxAmount = parseFloat(rewardAmount) || 0;
    const totalReward = calculateTotalReward();

    return totalReward > maxAmount;
  };

  // 获取总额错误信息
  const getTotalAmountError = (): string | null => {
    if (!isTotalAmountExceeded()) return null;

    const maxAmount = parseFloat(rewardAmount || '0');
    const totalReward = calculateTotalReward();

    return t('reward_rule_total_amount_exceeded', {
      total: totalReward,
      max: maxAmount,
    });
  };

  // 验证数据完整性
  const validateData = (): boolean => {
    // 首先检查总额是否超限
    if (isTotalAmountExceeded()) {
      return false;
    }

    switch (ruleType) {
      case 'random_distribution':
        return !!(randomParticipants && parseInt(randomParticipants) > 0);

      case 'fixed_ranking_random_distribution':
        const validRanks = rankingRules.every(
          (rule) => !!(rule.amount && parseNumber(rule.amount) > 0)
        );
        const validRandom = !!(
          additionalRandomParticipants && parseInt(additionalRandomParticipants) > 0
        );
        return validRanks && validRandom;

      case 'segmented_distribution':
        const validSegments = segmentRules.every(
          (rule) =>
            rule.startRank &&
            rule.endRank &&
            rule.amount &&
            parseInt(rule.startRank) > 0 &&
            parseInt(rule.endRank) > 0 &&
            parseNumber(rule.amount) > 0
        );
        const noErrors = segmentRules.every((rule, index) => {
          const startError = getSegmentError(index, 'startRank');
          const endError = getSegmentError(index, 'endRank');
          return !startError && !endError;
        });
        return validSegments && noErrors;

      default:
        return false;
    }
  };

  // 格式化输出数据
  const formatData = () => {
    const baseData = {
      ruleType: ruleType, // 添加ruleType信息
    };

    switch (ruleType) {
      case 'random_distribution':
        return {
          ...baseData,
          random_number: parseInt(randomParticipants) || 0,
        };

      case 'fixed_ranking_random_distribution':
        return {
          ...baseData,
          ranks: rankingRules.map((rule) => ({
            rank: rule.rank,
            reward: parseNumber(rule.amount),
          })),
          random_number: parseInt(additionalRandomParticipants) || 0,
        };

      case 'segmented_distribution':
        return {
          ...baseData,
          ranges: segmentRules.map((rule) => ({
            start: parseInt(rule.startRank) || 0,
            end: parseInt(rule.endRank) || 0,
            reward: parseNumber(rule.amount),
          })),
        };

      default:
        return baseData;
    }
  };

  // 监听数据变化并通知父组件
  useEffect(() => {
    const isValid = validateData();
    const formattedData = formatData();

    onValidationChange?.(isValid);
    onChange?.(formattedData);
  }, [ruleType, randomParticipants, rankingRules, additionalRandomParticipants, segmentRules]);

  const removeSegmentRule = (id: string) => {
    if (segmentRules.length > 1) {
      const newRules = segmentRules.filter((rule) => rule.id !== id);
      setSegmentRules(newRules);
    }
  };

  const updateSegmentRule = (id: string, field: keyof SegmentRule, value: string) => {
    const updatedRules = segmentRules.map((rule) =>
      rule.id === id ? { ...rule, [field]: value } : rule
    );
    setSegmentRules(updatedRules);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">{t('post_campaign_reward_rule')}</h3>

      {/* 奖励规则选择 */}
      <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:gap-4">
        {rewardRules.map((rule) => (
          <label
            key={rule.id}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent p-2 transition-colors hover:bg-gray-50 sm:border-none sm:p-0 sm:hover:bg-transparent"
          >
            <input
              type="radio"
              name="rewardRule"
              value={rule.code}
              checked={ruleType === rule.code}
              onChange={(e) => setRuleType(e.target.value)}
              className="h-4 w-4 flex-shrink-0"
            />
            <span className="text-base font-medium">
              {locale === 'zh' ? rule.zh_name : rule.en_name}
            </span>
          </label>
        ))}
      </div>

      {/* 根据选择的规则显示对应的UI - 只读模式下不显示详细配置 */}
      {ruleType === 'random_distribution' && (
        <Card className="rounded-3xl p-4 shadow-[0px_7.51px_11.27px_0px_#0000000D] sm:p-6">
          <div className="space-y-3">
            {/* 移动端：垂直布局，桌面端：水平布局 */}
            <div className="flex flex-col gap-3 text-base font-medium sm:flex-row sm:flex-wrap sm:items-center">
              <span className="whitespace-nowrap">{t('reward_rule_random')}</span>
              <div className="flex items-center gap-3">
                <Card className="border-border w-20 rounded-lg border p-0">
                  <CardContent className="p-0">
                    <Input
                      value={randomParticipants}
                      onChange={(e) => setRandomParticipants(e.target.value)}
                      className={`border-none text-center text-base leading-10 ${!randomParticipants ? 'bg-red-50' : ''}`}
                      placeholder=""
                    />
                  </CardContent>
                </Card>
                <span className="whitespace-nowrap">
                  {t('reward_rule_participants_share_total')}
                </span>
              </div>
            </div>
            {!randomParticipants && (
              <div className="text-sm text-red-500">* {t('field_required_short')}</div>
            )}
          </div>
        </Card>
      )}

      {ruleType === 'fixed_ranking_random_distribution' && (
        <Card className="rounded-3xl p-4 shadow-[0px_7.51px_11.27px_0px_#0000000D] sm:p-6">
          <div className="space-y-4">
            {rankingRules.map((rule, index) => (
              <div key={rule.id} className="space-y-3">
                {/* 移动端：垂直布局，桌面端：水平布局 */}
                <div className="flex flex-col gap-3 text-base sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-12 text-center font-medium">
                      {rule.rank}
                      {getRankSuffix(rule.rank)}
                    </div>
                    <span>{t('reward_rule_distribute')}</span>
                    <Card className="border-border w-32 rounded-lg border p-0">
                      <CardContent className="p-0">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={rule.amount}
                          onChange={(e) =>
                            handleNumberInput(e.target.value, (val) =>
                              updateRankingRule(rule.id, val)
                            )
                          }
                          onBlur={(e) => {
                            const formatted = formatNumber(e.target.value);
                            if (formatted !== e.target.value) {
                              updateRankingRule(rule.id, formatted);
                            }
                          }}
                          className={`border-none text-center text-base leading-10 ${!rule.amount ? 'bg-red-50' : ''}`}
                          placeholder="0.00"
                        />
                      </CardContent>
                    </Card>
                    <span></span>
                  </div>

                  {/* 按钮组：移动端居左，桌面端跟随内容 */}
                  <div className="flex gap-2 sm:ml-auto">
                    {index === rankingRules.length - 1 && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={addRankingRule}
                        className="bg-blue-500 text-white hover:bg-blue-600"
                      >
                        {t('reward_rule_add')}
                      </Button>
                    )}
                    {rankingRules.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => removeRankingRule(rule.id)}
                      >
                        {t('reward_rule_delete')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="border-border border-t pt-4">
              {/* 移动端：垂直布局，桌面端：水平布局 */}
              <div className="flex flex-col gap-3 text-base sm:flex-row sm:items-center">
                <span>{t('reward_rule_random_select')}</span>
                <div className="flex items-center gap-3">
                  <Card className="border-border w-20 rounded-lg border p-0">
                    <CardContent className="p-0">
                      <Input
                        value={additionalRandomParticipants}
                        onChange={(e) => setAdditionalRandomParticipants(e.target.value)}
                        className={`border-none text-center text-base leading-10 ${!additionalRandomParticipants ? 'bg-red-50' : ''}`}
                        placeholder=""
                      />
                    </CardContent>
                  </Card>
                  <span>{t('reward_rule_participants_share_remaining')}</span>
                </div>
              </div>
            </div>

            {/* 总额验证错误提示 */}
            {getTotalAmountError() && (
              <div className="text-sm font-medium text-red-500">* {getTotalAmountError()}</div>
            )}
          </div>
        </Card>
      )}

      {ruleType === 'segmented_distribution' && (
        <Card className="rounded-3xl p-4 shadow-[0px_7.51px_11.27px_0px_#0000000D] sm:p-6">
          <div className="space-y-4">
            {segmentRules.map((rule, index) => {
              const startError = getSegmentError(index, 'startRank');
              const endError = getSegmentError(index, 'endRank');

              return (
                <div key={rule.id} className="space-y-3">
                  {/* 移动端：垂直布局，桌面端：水平布局 */}
                  <div className="flex flex-col gap-3 text-base sm:flex-row sm:items-center">
                    {/* 排名范围输入 */}
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <Card
                          className={`border-border w-16 rounded-lg border p-0 ${startError ? 'border-red-500' : ''}`}
                        >
                          <CardContent className="p-0">
                            <Input
                              value={rule.startRank}
                              onChange={(e) =>
                                updateSegmentRule(rule.id, 'startRank', e.target.value)
                              }
                              className={`border-none text-center text-base leading-10 ${!rule.startRank ? 'bg-red-50' : ''}`}
                              placeholder=""
                            />
                          </CardContent>
                        </Card>
                      </div>
                      <span className="whitespace-nowrap">{t('reward_rule_to')}</span>
                      <div className="flex flex-col">
                        <Card
                          className={`border-border w-16 rounded-lg border p-0 ${endError ? 'border-red-500' : ''}`}
                        >
                          <CardContent className="p-0">
                            <Input
                              value={rule.endRank}
                              onChange={(e) =>
                                updateSegmentRule(rule.id, 'endRank', e.target.value)
                              }
                              className={`border-none text-center text-base leading-10 ${!rule.endRank ? 'bg-red-50' : ''}`}
                              placeholder=""
                            />
                          </CardContent>
                        </Card>
                      </div>
                      <span className="whitespace-nowrap">
                        {t('reward_rule_participants_distribute')}
                      </span>
                    </div>

                    {/* 金额输入 */}
                    <div className="flex items-center gap-3">
                      <Card className="border-border w-32 rounded-lg border p-0">
                        <CardContent className="p-0">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={rule.amount}
                            onChange={(e) =>
                              handleNumberInput(e.target.value, (val) =>
                                updateSegmentRule(rule.id, 'amount', val)
                              )
                            }
                            onBlur={(e) => {
                              const formatted = formatNumber(e.target.value);
                              if (formatted !== e.target.value) {
                                updateSegmentRule(rule.id, 'amount', formatted);
                              }
                            }}
                            className={`border-none text-center text-base leading-10 ${!rule.amount ? 'bg-red-50' : ''}`}
                            placeholder="0.00"
                          />
                        </CardContent>
                      </Card>
                      <span className="whitespace-nowrap"></span>
                    </div>

                    {/* 按钮组：移动端居左，桌面端跟随内容 */}
                    <div className="flex gap-2 sm:ml-auto">
                      {index === segmentRules.length - 1 && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={addSegmentRule}
                          className="bg-blue-500 text-white hover:bg-blue-600"
                        >
                          {t('reward_rule_add')}
                        </Button>
                      )}
                      {segmentRules.length > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removeSegmentRule(rule.id)}
                        >
                          {t('reward_rule_delete')}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* 错误提示 */}
                  {(startError || endError) && (
                    <div className="text-sm text-red-500">
                      {startError && <div>* {startError}</div>}
                      {endError && <div>* {endError}</div>}
                    </div>
                  )}
                </div>
              );
            })}

            {/* 总额验证错误提示 */}
            {getTotalAmountError() && (
              <div className="text-sm font-medium text-red-500">* {getTotalAmountError()}</div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
