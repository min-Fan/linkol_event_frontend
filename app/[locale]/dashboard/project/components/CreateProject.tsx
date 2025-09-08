'use client';

import { useTranslations } from 'next-intl';

import { Card, CardContent } from '@shadcn-ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@shadcn-ui/breadcrumb';
import { ScrollArea } from '@shadcn-ui/scroll-area';

import PagesRoute from '@constants/routes';
import { Link } from '@libs/i18n/navigation';
import UIToolbar from '@ui/toolbar';
import CompProjectCreateForm from './ProjectCreateForm';

export default function CompCreateProject() {
  const t = useTranslations('common');

  return (
    <Card className="h-full w-full p-0">
      <CardContent className="flex h-full flex-col space-y-4 p-4">
        <UIToolbar>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>
                  <Link
                    className="text-muted-foreground"
                    href={PagesRoute.DASHBOARD}
                    replace={true}
                  >
                    {t('my_project')}
                  </Link>
                </BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t('create_project')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </UIToolbar>
        <div className="h-full flex-1 overflow-hidden">
          <ScrollArea className="h-full w-full">
            <CompProjectCreateForm />
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
