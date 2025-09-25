'use client';
import React from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

export default function TonProvider({ children }: { children: React.ReactNode }) {
  return (
    <TonConnectUIProvider manifestUrl="https://app.linkol.fun/tonconnect-manifest.json">
      {children}
    </TonConnectUIProvider>
  );
}
