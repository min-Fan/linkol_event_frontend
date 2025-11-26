'use client';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { useBetDetail } from '@hooks/useBetDetail';
import { useTranslations } from 'next-intl';

export default function OpinionAgentInsight() {
  const params = useParams();
  const opinionId = params?.opinion as string;
  const { topic, attitude, yesPrice } = useBetDetail(opinionId);
  const t = useTranslations('common');

  const [agentComment, setAgentComment] = useState<string | null>(null);
  const [loadingAgent, setLoadingAgent] = useState(false);

  const handleAgentAnalysis = async () => {
    if (!topic || !attitude || yesPrice === undefined) return;

    setLoadingAgent(true);
    try {
      const response = await fetch('/api/agent-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          marketQuestion: topic.content,
          tweetContent: attitude.content,
          yesPrice: yesPrice / 100, // 转换为 0-1 范围
        }),
      });

      const data = await response.json();
      if (response.ok && data.analysis) {
        setAgentComment(data.analysis);
      } else {
        setAgentComment(
          data.analysis ||
            'The markets are volatile, and my circuits are hazy. DYOR (Do Your Own Research).'
        );
      }
    } catch (error) {
      console.error('Agent analysis failed:', error);
      setAgentComment(
        'The markets are volatile, and my circuits are hazy. DYOR (Do Your Own Research).'
      );
    } finally {
      setLoadingAgent(false);
    }
  };

  if (!topic || !attitude) return null;

  return (
    <div className="from-primary/5 relative space-y-4 overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br to-transparent p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="text-foreground font-bold">{t('linkol_agent_insight')}</h3>
        </div>
        {!agentComment && (
          <button
            onClick={handleAgentAnalysis}
            disabled={loadingAgent}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingAgent ? t('thinking') : t('let_agent_comment')}
          </button>
        )}
      </div>

      {agentComment && (
        <div className="animate-fade-in text-foreground border-l-2 border-blue-500 py-1 pl-4 text-sm leading-relaxed">
          "{agentComment}"
        </div>
      )}
      {!agentComment && !loadingAgent && (
        <p className="text-muted-foreground text-sm">{t('agent_insight_description')}</p>
      )}
    </div>
  );
}
