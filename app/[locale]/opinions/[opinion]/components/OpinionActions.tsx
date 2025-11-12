'use client';
import React from 'react';
import { Button } from '@shadcn/components/ui/button';

interface OpinionActionsProps {
  onAddPerspective?: () => void;
  onLetAgentComment?: () => void;
}

export default function OpinionActions({
  onAddPerspective,
  onLetAgentComment,
}: OpinionActionsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        onClick={onAddPerspective}
        className="w-full !rounded-full bg-primary py-6 text-base text-white sm:w-auto sm:flex-1"
      >
        Add my perspective earn points
      </Button>
      <Button
        onClick={onLetAgentComment}
        className="w-full !rounded-full bg-primary py-6 text-base text-white sm:w-auto sm:flex-1"
      >
        Let Agent comment
      </Button>
    </div>
  );
}

