'use client';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { useBetDetail } from '@hooks/useBetDetail';
import { useTranslations } from 'next-intl';
import { getBetAiComment } from '@libs/request';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@shadcn/lib/utils';

export default function OpinionAgentInsight() {
  const params = useParams();
  const opinionId = params?.opinion as string;
  const { topic, attitude } = useBetDetail(opinionId);
  const t = useTranslations('common');

  const [agentComment, setAgentComment] = useState<string | null>(null);
  const [totalComments, setTotalComments] = useState<number | null>(null);
  const [loadingAgent, setLoadingAgent] = useState(false);

  const handleAgentAnalysis = async () => {
    if (!opinionId) return;

    setLoadingAgent(true);
    try {
      const response = await getBetAiComment({ bet_id: opinionId });
      if (response?.data) {
        setAgentComment(response.data.ai_comment);
        setTotalComments(response.data.total_comments);
      }
    } catch (error) {
      console.error('Agent analysis failed:', error);
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
        <div className="animate-fade-in space-y-3">
          {totalComments !== null && (
            <p className="text-muted-foreground text-xs">
              {t('based_on')} {totalComments} {t('comments')}
            </p>
          )}
          <div className="text-foreground border-l-2 border-blue-500 py-1 pl-4 text-sm leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, className, children, ...props }) {
                  return (
                    <code
                      className={cn(
                        'bg-muted rounded px-1 py-0.5 text-xs break-words whitespace-pre-wrap',
                        className
                      )}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                p: ({ children }) => (
                  <p className="mb-2 break-words whitespace-pre-wrap last:mb-0">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="mb-2 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-2 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol>
                ),
                li: ({ children }) => <li className="break-words">{children}</li>,
                h1: ({ children }) => <h1 className="mb-2 text-lg font-bold">{children}</h1>,
                h2: ({ children }) => <h2 className="mb-2 text-base font-bold">{children}</h2>,
                h3: ({ children }) => <h3 className="mb-2 text-sm font-bold">{children}</h3>,
                strong: ({ children }) => <strong className="font-bold">{children}</strong>,
              }}
            >
              {agentComment}
            </ReactMarkdown>
          </div>
        </div>
      )}
      {!agentComment && !loadingAgent && (
        <p className="text-muted-foreground text-sm">{t('agent_insight_description')}</p>
      )}
    </div>
  );
}
