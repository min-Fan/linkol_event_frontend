'use client';
import CompEditCampaignForm from './components/EditCampaignForm';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@shadcn-ui/card';
import UIToolbar from '@ui/toolbar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@shadcn-ui/breadcrumb';
import { ScrollArea } from '@shadcn-ui/scroll-area';
import { useParams } from 'next/navigation';

export default function EditCampaignPage() {
  const t = useTranslations('common');
  const { editId } = useParams();

  return (
    <Card className="h-full w-full p-0">
      <CardContent className="flex h-full flex-col space-y-4 p-4">
        <UIToolbar>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>{t('edit_campaign_title')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </UIToolbar>
        <ScrollArea className="relative h-full min-h-0">
          <CompEditCampaignForm editId={editId as string} />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
