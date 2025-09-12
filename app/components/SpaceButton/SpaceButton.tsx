import React from 'react';

import './spacebutton.scss';
import { cn } from '@shadcn/lib/utils';

export default function SpaceButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button type="button" className={cn('space-button', className)} onClick={onClick}>
      <strong>{children}</strong>
      <div id="container-stars">
        <div id="stars"></div>
      </div>

      <div id="glow">
        <div className="circle"></div>
        <div className="circle"></div>
      </div>
    </button>
  );
}
