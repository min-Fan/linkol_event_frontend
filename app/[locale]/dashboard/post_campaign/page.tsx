import CompCampaignForm from './components/CampaignForm';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@shadcn-ui/card';
import UIToolbar from '@ui/toolbar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@shadcn-ui/breadcrumb';
import { ScrollArea } from '@shadcn-ui/scroll-area';

export default function PostCampaignPage() {
  const t = useTranslations('common');

  return (
    <Card className="h-full w-full p-0">
      <CardContent className="flex h-full flex-col space-y-4 p-4">
        <UIToolbar>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>{t('post_campaign_title')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </UIToolbar>
        <ScrollArea className="relative h-full min-h-0">
          <CompCampaignForm />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
