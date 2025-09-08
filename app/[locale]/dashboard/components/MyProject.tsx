'use client';
import { useTranslations } from 'next-intl';

import { Card, CardContent } from '@shadcn-ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@shadcn-ui/breadcrumb';
import { ScrollArea } from '@shadcn-ui/scroll-area';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@shadcn-ui/pagination';

import UIToolbar from '@ui/toolbar';
import CompProjectCard from './ProjectCard';
import { getProjectList, deleteProject, IProjectListData } from '@libs/request';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Coffee } from 'lucide-react';
import { Button } from '@shadcn/components/ui/button';
import { Link } from '@libs/i18n/navigation';
import PagesRoute from '@constants/routes';
import { cn } from '@shadcn/lib/utils';
export default function MyProject() {
  const t = useTranslations('common');
  const [projectList, setProjectList] = useState<IProjectListData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const projects = async () => {
    try {
      setIsLoading(true);
      const res: any = await getProjectList({ page: currentPage, size: pageSize });
      setIsLoading(false);
      if (res.code === 200) {
        setProjectList(res.data.list);
        setTotal(res.data.total);
        setTotalPage(res.data.page_range.length);
      } else {
        toast.error(res.msg);
      }
    } catch (error) {
      console.error('get project list error', error);
      toast.error(error.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    projects();
  }, [currentPage, pageSize]);

  const handleDeleteProject = async (id: number) => {
    try {
      setIsLoading(true);
      const res: any = await deleteProject(id);
      setIsLoading(false);
      if (res.code === 200) {
        toast.success(t('delete_success'));
        // 刷新项目列表
        projects();
      } else {
        toast.error(res.msg || t('delete_failed'));
      }
    } catch (error) {
      console.error('delete project error', error);
      toast.error(error.message || t('delete_failed'));
      setIsLoading(false);
    }
  };

  const getPageNumbers = () => {
    const pages: number[] = [];
    for (let i = 1; i <= totalPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <Card className="h-full w-full p-0">
      <CardContent className="flex h-full w-full flex-col space-y-4 p-4">
        <UIToolbar hasCreateProject={true}>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>{t('my_project')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </UIToolbar>
        <div className="h-full flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex h-full w-full items-center justify-center">
              <Loader2 className="text-primary size-10 animate-spin" />
            </div>
          ) : projectList.length === 0 ? (
            <div className="flex h-full w-full flex-col items-center justify-center space-y-4">
              <Coffee className="text-muted-foreground size-10" />
              <p className="text-muted-foreground">{t('no_data')}</p>
              <Link href={PagesRoute.PROJECT}>
                <Button>{t('btn_create_project')}</Button>
              </Link>
            </div>
          ) : (
            <ScrollArea className="h-full w-full">
              <div className="grid w-full grid-cols-2 gap-4 xl:grid-cols-4">
                {projectList.map((item) => (
                  <CompProjectCard key={item.id} item={item} onDelete={handleDeleteProject} />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
        <div className="flex items-center justify-center">
          {totalPage > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={cn(
                      'cursor-pointer',
                      currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                    )}
                  />
                </PaginationItem>
                {getPageNumbers().map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={page === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPage) setCurrentPage(currentPage + 1);
                    }}
                    className={cn(
                      'cursor-pointer',
                      currentPage === totalPage ? 'pointer-events-none opacity-50' : ''
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
