'use client';

import React from 'react';
import { Skeleton } from '@shadcn/components/ui/skeleton';

interface InviteeSkeletonProps {
  count?: number;
}

export default function InviteeSkeleton({ count = 6 }: InviteeSkeletonProps) {
  return (
    <div className="flex h-full min-h-[350px] flex-col items-center justify-center text-center">
      <Skeleton className="h-full w-full" />
    </div>
  );
}
