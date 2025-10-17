'use client';

import React from 'react';
import { Users, UserPlus } from 'lucide-react';
import { Button } from '@shadcn/components/ui/button';
import { useTranslations } from 'next-intl';

interface InviteeEmptyStateProps {
  onInvite?: () => void;
}

export default function InviteeEmptyState({ onInvite }: InviteeEmptyStateProps) {
  const t = useTranslations('common');

  return (
    <div className="flex h-full min-h-[350px] flex-col items-center justify-center p-8 text-center">
      <div className="bg-muted-foreground/10 mb-4 rounded-full p-6">
        <Users className="text-muted-foreground h-12 w-12" />
      </div>

      <h3 className="mb-2 text-lg font-semibold">{t('no_invitees')}</h3>

      <p className="text-muted-foreground mb-6 max-w-sm text-sm">{t('no_invitees_description')}</p>
    </div>
  );
}
