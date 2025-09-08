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

import PagesRoute from '@constants/routes';
import { Link } from '@libs/i18n/navigation';
import UIToolbar from '@ui/toolbar';
import CompOrderDetailsPanel from './OrderDetailsPanel';
import CompOrderDetailsList from './OrderDetailsList';

export default function OrderDetails() {
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
                    href={PagesRoute.MY_ORDERS}
                    replace={true}
                  >
                    {t('my_project')}
                  </Link>
                </BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t('order_details')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </UIToolbar>
        <CompOrderDetailsPanel />
        <CompOrderDetailsList />
      </CardContent>
    </Card>
  );
}
