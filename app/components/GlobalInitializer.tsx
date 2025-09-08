'use client';

import { useEffect } from 'react';
import { useGetConst } from '@hooks/useGetConst';
import { usePayTokenInfo } from '@hooks/usePayTokenInfo';
export default function GlobalInitializer() {
  const { getConst } = useGetConst();
  const { getPayTokenInfo } = usePayTokenInfo();

  useEffect(() => {
    // getConst();
    getPayTokenInfo();
  }, []);

  return null;
}
