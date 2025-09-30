'use client';

import { useGetConst } from '@hooks/useGetConst';
import { useEffect } from 'react';
import MarketEventsLayout from './m/layout';
import MarketEventsPage from './m/page';

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
