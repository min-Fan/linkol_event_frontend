'use client';

import { ReactNode } from 'react';
// @ts-ignore
import { ProgressProvider } from '@bprogress/next/app';

export default function BprogressProvider({ children }: { children: ReactNode }) {
  return (
    <ProgressProvider height="3px" color="#007AFF" options={{ showSpinner: false }} shallowRouting>
      {children}
    </ProgressProvider>
  );
}
