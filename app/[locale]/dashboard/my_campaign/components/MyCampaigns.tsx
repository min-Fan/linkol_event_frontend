import { useTranslations } from 'next-intl';

import { Card, CardContent } from '@shadcn-ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@shadcn-ui/breadcrumb';

import UIToolbar from '@ui/toolbar';
import CampaignList from './CampaignList';

export default function MyCampaigns() {
  const t = useTranslations('common');

  return (
    <Card className="h-full w-full p-0">
      <CardContent className="flex h-full flex-col space-y-4 p-4">
        <UIToolbar>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>{t('my_campaigns')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </UIToolbar>
        <CampaignList />
      </CardContent>
    </Card>
  );
}
