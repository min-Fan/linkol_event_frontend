'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@shadcn/components/ui/card';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { getAgentDetails } from '@libs/request';
import { useAppSelector } from '@store/hooks';
import { useTranslations, useFormatter } from 'next-intl';
interface InvitationLinksProps {
  invitationCode?: string;
}

export default function InvitationLinks({ invitationCode }: InvitationLinksProps) {
  const [copied, setCopied] = useState(false);
  const [invitationLink, setInvitationLink] = useState('');
  const isLoggedIn = useAppSelector((state) => state.userReducer?.isLoggedIn);
  const t = useTranslations('common');
  const rules = [
    {
      id: '1',
      text: t.rich('invite_rule_1', {
        count: (chunks) => <span className="font-bold">1 pts</span>,
        points: (chunks) => <span className="font-bold">10 pts</span>,
      }),
    },
    {
      id: '2',
      text: t.rich('invite_rule_2', {
        points: (chunks) => <span className="font-bold">5 pts</span>,
      }),
    },
    {
      id: '3',
      text: t.rich('invite_rule_3', {
        points: (chunks) => <span className="font-bold">1 pt</span>,
      }),
    },
  ];

  // 获取agent详情以获取邀请码
  const { data: agentDetails } = useQuery({
    queryKey: ['agentDetails'],
    queryFn: getAgentDetails,
    enabled: isLoggedIn,
  });

  // 生成邀请链接
  useEffect(() => {
    const code = invitationCode || agentDetails?.data?.invite_code;
    if (code) {
      const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const locale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'en';
      const link = `${currentUrl}/${locale}/${code}`;
      setInvitationLink(link);
    }
  }, [invitationCode, agentDetails?.data?.invite_code]);

  const handleCopy = async () => {
    if (!invitationLink) {
      toast.error(t('invite_link_generating'));
      return;
    }

    try {
      await navigator.clipboard.writeText(invitationLink);
      setCopied(true);
      toast.success(t('copy_success'));
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error(t('copy_failed'));
    }
  };

  // 如果未登录，显示提示信息
  if (!isLoggedIn) {
    return (
      <Card className="rounded-lg border-1 p-4 shadow-none">
        <CardContent className="flex flex-col gap-6 p-0">
          <div className="bg-muted-foreground/5 flex flex-col items-center justify-center gap-4 rounded-2xl px-4 py-8">
            <div className="text-center">
              <h3 className="text-lg font-bold">{t('please_login_first')}</h3>
              <p className="text-muted-foreground text-sm">{t('login_to_generate_invite_link')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-lg border-1 p-4 shadow-none">
      <CardContent className="flex flex-col gap-4 p-0">
        <div className="bg-primary/5 flex flex-col gap-2 rounded-2xl px-2 py-3">
          <span className="text-sm font-medium">{t('invitation_links')}</span>
          <div className="flex items-center gap-2">
            <span className="text-primary flex-1 truncate text-sm">
              {invitationLink || t('generating')}
            </span>
            {invitationLink && (
              <div onClick={handleCopy} className="cursor-pointer p-0 pr-2">
                {copied ? (
                  <Check className="text-primary h-4 w-4" />
                ) : (
                  <Copy className="text-primary h-4 w-4" />
                )}
              </div>
            )}
          </div>
        </div>
        <div className="bg-primary/5 flex flex-col gap-2 rounded-2xl p-2">
          <span>{t('invitation_rules')}</span>
          <ul className="space-y-2 pl-2">
            {rules.map((rule) => (
              <li key={rule.id} className="flex items-center gap-2">
                <div className="bg-primary h-2 w-2 flex-shrink-0 rounded-full" />
                <span className="text-sm font-medium">{rule.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
