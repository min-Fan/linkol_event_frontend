'use client';

import { useGetConst } from '@hooks/useGetConst';
import { useEffect } from 'react';
import MarketEventsLayout from './market_events/layout';
import MarketEventsPage from './market_events/page';
export default function ProjectPage() {
  const { getConst } = useGetConst();

  useEffect(() => {
    getConst();
  }, []);
  return (
    <MarketEventsLayout>
      <MarketEventsPage />
    </MarketEventsLayout>
  );
}
