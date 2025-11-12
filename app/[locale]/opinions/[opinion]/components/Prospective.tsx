'use client';
import React from 'react';
import DefaultAvatarImg from '@assets/image/avatar.png';

interface ProspectiveProps {
  agreePercentage: number;
  disagreePercentage: number;
}
export default function Prospective({ agreePercentage, disagreePercentage }: ProspectiveProps) {
  // 生成模拟头像
  const generateMockAvatars = (count: number) => {
    return Array.from({ length: Math.min(count, 8) }, (_, i) => ({
      id: i,
      color: `hsl(${(i * 360) / count}, 70%, 60%)`,
    }));
  };

  const mockAgreeAvatars = generateMockAvatars(8);
  const mockDisagreeAvatars = generateMockAvatars(8);

  return (
    <div className="space-y-4">
      {/* Agree Section */}
      <div className="rounded-xl bg-green-500/10 p-4">
        <div className="flex items-end justify-between">
          <div className="flex flex-col items-start gap-3">
            <span className="text-foreground text-sm font-medium">We agree with @CZ</span>
            <div className="flex -space-x-3">
              {mockAgreeAvatars.map((avatar) => (
                <div
                  key={avatar.id}
                  className="border-background h-8 w-8 rounded-full border-1"
                  style={{ backgroundColor: avatar.color }}
                >
                  <img
                    src={DefaultAvatarImg.src}
                    alt="avatar"
                    className="h-full w-full rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = DefaultAvatarImg.src;
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base text-green-600">YES</span>
            <span className="text-base text-green-600">• {agreePercentage}%</span>
          </div>
        </div>
      </div>

      {/* Disagree Section */}
      <div className="rounded-lg bg-red-500/10 p-4">
        <div className="flex items-end justify-between">
          <div className="flex flex-col items-start gap-3">
            <span className="text-foreground text-sm font-medium">We disagree with @CZ</span>
            <div className="flex -space-x-2">
              {mockDisagreeAvatars.map((avatar) => (
                <div
                  key={avatar.id}
                  className="border-background h-8 w-8 rounded-full border-1"
                  style={{ backgroundColor: avatar.color }}
                >
                  <img
                    src={DefaultAvatarImg.src}
                    alt="avatar"
                    className="h-full w-full rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = DefaultAvatarImg.src;
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base text-red-600">No</span>
            <span className="text-base text-red-600">• {disagreePercentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
