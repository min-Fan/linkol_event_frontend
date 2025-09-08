import { ReactNode } from 'react';

import UITheme from '@ui/theme';
import UILanguage from '@ui/language';

import CompSidebarBtn from './components/SidebarBtn';
import CompCreateProjectBtn from './components/CreateProjectBtn';

export default function UIToolbar(props: { hasCreateProject?: boolean; children: ReactNode }) {
  const { children, hasCreateProject = false } = props;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2 capitalize">
        <CompSidebarBtn />
        {children}
      </div>
      <div className="flex items-center space-x-2">
        {hasCreateProject && <CompCreateProjectBtn />}
      </div>
    </div>
  );
}
