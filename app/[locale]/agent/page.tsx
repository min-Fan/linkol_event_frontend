'use client';

import React from 'react';
import {
  ProfileCard,
  InvitationLinks,
  RewardsHistory,
  CampaignsSection,
  MyInviteeSection,
} from './components';
import { useAgentDetails } from '@hooks/useAgentDetails';
import { useAppSelector } from '@store/hooks';

export default function MyAgentPage() {
  const { refreshAgentDetails, invalidateAgentDetails, totalReward, points, rank } =
    useAgentDetails();
  const isLoggedIn = useAppSelector((state) => state.userReducer?.isLoggedIn);

  const handleRefresh = () => {
    // 手动刷新所有数据
    invalidateAgentDetails();
  };

  return (
    <div className="min-h-screen w-full pt-10 pb-10 sm:pb-0">
      <div className="mx-auto h-full max-w-7xl">
        {isLoggedIn ? (
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
            {/* 左侧列 */}
            <div className="flex flex-col gap-2 lg:col-span-1">
              <ProfileCard />

              <InvitationLinks />

              <RewardsHistory />
            </div>

            {/* 右侧列 */}
            <div className="flex flex-col gap-2 lg:col-span-2">
              <CampaignsSection />

              <MyInviteeSection />
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center">
            <ProfileCard />
          </div>
        )}
      </div>
    </div>
  );
}
