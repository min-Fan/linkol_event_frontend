'use client';
import React from 'react';
import { Button } from '@shadcn/components/ui/button';
import { useTranslations } from 'next-intl';

interface OpinionActionsProps {
  onAddPerspective?: () => void;
  onLetAgentComment?: () => void;
}

export default function OpinionActions({
  onAddPerspective,
  onLetAgentComment,
}: OpinionActionsProps) {
  const t = useTranslations('common');
  return (
    <div className="flex flex-col justify-end gap-3 sm:flex-row">
      <Button
        onClick={onAddPerspective}
        className="bg-primary w-full !rounded-2xl py-6 text-base text-white sm:w-auto"
      >
        {t('make_a_post')}
      </Button>
      <Button
        onClick={onLetAgentComment}
        className="bg-primary w-full !rounded-2xl py-6 text-base text-white sm:w-auto"
      >
        {t('let_agent_comment')}
      </Button>
    </div>
  );
}
