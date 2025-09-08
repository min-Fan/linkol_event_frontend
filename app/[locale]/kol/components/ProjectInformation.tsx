import React from 'react';
import defaultAvatar from '@assets/image/avatar.png';

export default function ProjectInformation({
  projectName,
  projectIcon,
}: {
  projectName?: string;
  projectIcon?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="border-border bg-background box-border flex size-10 items-center justify-center overflow-hidden rounded-full border">
        <img
          src={projectIcon || defaultAvatar.src}
          alt=""
          className="h-full w-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = defaultAvatar.src;
          }}
        />
      </div>
      <span>{projectName || 'Project Name'}</span>
    </div>
  );
}
