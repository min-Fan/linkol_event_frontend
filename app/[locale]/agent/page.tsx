'use client';

import React from 'react';
import {
  ProfileCard,
  InvitationLinks,
  RewardsHistory,
  CampaignsSection,
  MyInviteeSection,
} from './components';

export default function MyAgentPage() {
  const handleRedeem = () => {
    // 处理兑换奖励逻辑
    console.log('兑换奖励');
  };

  return (
    <div className="min-h-screen">
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
