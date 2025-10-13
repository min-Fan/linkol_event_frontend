'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/components/ui/card';
import { Button } from '@shadcn/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface InvitationLinksProps {
  invitationLink: string;
}

const defaultRules = [
  {
    id: '1',
    text: (
      <span className="">
        Invite <span className="font-bold">1</span> friend ={' '}
        <span className="font-bold">10 points</span>{' '}
      </span>
    ),
  },
  {
    id: '2',
    text: (
      <span>
        Invitee grants endorsement = <span className="font-bold">extra 5 points</span>
      </span>
    ),
  },
  {
    id: '3',
    text: (
      <span>
        Get <span className="font-bold">1 point</span> for each interaction
      </span>
    ),
  },
];

export default function InvitationLinks({ invitationLink }: InvitationLinksProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(invitationLink);
      setCopied(true);
      toast.success('邀请链接已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('复制失败，请手动复制');
    }
  };

  return (
    <Card className="rounded-lg border-1 p-4 shadow-none">
      <CardContent className="flex flex-col gap-6 p-0">
        <div className="bg-primary/5 flex flex-col gap-2 rounded-2xl px-2 py-3">
          <span className="text-sm font-medium">Invitation Links</span>
          <div className="flex items-center gap-2">
            <span className="text-primary flex-1 truncate text-sm">{invitationLink}</span>
            <div onClick={handleCopy} className="cursor-pointer p-0 pr-2">
              {copied ? (
                <Check className="text-primary h-4 w-4" />
              ) : (
                <Copy className="text-primary h-4 w-4" />
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span>Invitation Rules</span>
          <ul className="space-y-2 pl-2">
            {defaultRules.map((rule) => (
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
