'use client';

import { useGetConst } from '@hooks/useGetConst';
import { useEffect } from 'react';
import PageLanding from './landing/page';
export default function ProjectPage() {
  const { getConst } = useGetConst();

  useEffect(() => {
    getConst();
  }, []);
  return <PageLanding />;
}
