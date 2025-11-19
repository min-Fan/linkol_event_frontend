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
    <div className="flex flex-col justify-end gap-3 sm:flex-row">
      <Button
        onClick={onAddPerspective}
        className="bg-primary w-full !rounded-2xl py-6 text-base text-white sm:w-auto"
      >
        Make a Post
      </Button>
      <Button
        onClick={onLetAgentComment}
        className="bg-primary w-full !rounded-2xl py-6 text-base text-white sm:w-auto"
      >
        Let Agent Comment
      </Button>
    </div>
  );
}
