'use client';

import { PanelLeft } from 'lucide-react';

import { Button } from '@shadcn-ui/button';

import useSidebar from '@hooks/useSidebar';

export default function SidebarBtn() {
  const { toggleSidebar } = useSidebar();

  const handleToggleSidebar = () => {
    toggleSidebar();
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleToggleSidebar}>
      <PanelLeft className="size-5" />
    </Button>
  );
}
