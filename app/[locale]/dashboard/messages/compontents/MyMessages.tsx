import { useTranslations } from 'next-intl';

import { Card, CardContent } from '@shadcn-ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@shadcn-ui/breadcrumb';

import UIToolbar from '@ui/toolbar';
import MessagesAnalytics from './MessagesAnalytics';
import MessagesList from './MessagesList';
import { ScrollArea } from '@shadcn-ui/scroll-area';
export default function MyMessages() {
  const t = useTranslations('common');

  return (
    <Card className="h-full w-full overflow-hidden p-0">
      <CardContent className="flex h-full flex-col space-y-4 p-4">
        <UIToolbar>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>{t('my_messages')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </UIToolbar>
        <ScrollArea className="relative h-full min-h-0">
          {/* <MessagesAnalytics /> */}
          <MessagesList />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
