'use client';
import React from 'react';
import Actives from './components/Actives';
import { useQuery } from '@tanstack/react-query';
import { getActivityFollowers } from '@libs/request';
import { useAppSelector } from '@store/hooks';

export default function page() {
  const isLoggedIn = useAppSelector((state) => state.userReducer?.isLoggedIn);
  const { data: followers } = useQuery({
    queryKey: ['activityFollowers'],
    queryFn: () => getActivityFollowers(),
    enabled: !!isLoggedIn,
  });
  return <Actives />;
}
