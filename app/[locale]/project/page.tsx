'use client';

import { useGetConst } from '@hooks/useGetConst';
import ComHome from '../components/Home';
import { useEffect } from 'react';
export default function ProjectPage() {
  const { getConst } = useGetConst();

  useEffect(() => {
    getConst();
  }, []);
  return <ComHome />;
}
