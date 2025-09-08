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
import CompProjectEditForm from './ProjectEditForm';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getProjectDetail } from '@libs/request';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { IProjectDetail } from 'app/@types/types';
import { useRouter } from 'next/navigation';
export default function CompCreateProject() {
  const t = useTranslations('common');
  const { projectId } = useParams();
  const [projectDetail, setProjectDetail] = useState<IProjectDetail>();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const projectData = async () => {
    try {
      setIsLoading(true);
      const res: any = await getProjectDetail(Number(projectId));
      setIsLoading(false);
      if (res.code === 200) {
        setProjectDetail(res.data);
      } else {
        router.push(PagesRoute.DASHBOARD);
        // toast.error(res.msg);
      }
    } catch (error) {
      console.error('get project detail error', error);
      toast.error(error.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    projectData();
  }, [projectId]);

  return (
    <Card className="relative h-full w-full p-0">
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
                <BreadcrumbPage>{t('edit_project')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </UIToolbar>
        <div className="relative flex h-full flex-1 overflow-hidden">
          {isLoading && (
            <div className="bg-background/60 absolute inset-0 z-10 flex h-full w-full items-center justify-center">
              <Loader2 className="text-primary size-10 animate-spin" />
            </div>
          )}
          <ScrollArea className="h-full w-full">
            <CompProjectEditForm projectDetail={projectDetail} />
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
