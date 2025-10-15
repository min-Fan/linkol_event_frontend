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

export default function MyAgentPage() {
  const { refreshAgentDetails, invalidateAgentDetails, totalReward, points, rank } =
    useAgentDetails();

  const handleRefresh = () => {
    // 手动刷新所有数据
    invalidateAgentDetails();
  };

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto max-w-7xl">
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
      </div>
    </div>
  );
}
