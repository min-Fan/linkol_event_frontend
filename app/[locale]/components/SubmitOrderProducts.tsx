'use client';

import { useEffect, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn-ui/card';
import { Checkbox } from '@shadcn-ui/checkbox';
import { toast } from 'sonner';

import { Plus } from '@assets/svg';
import { getProjectList, IProjectListData } from '@libs/request';
import UILoading from '@ui/loading';
import UIDialogAddNewProject from '@ui/dialog/AddNewProject';
import { updateChatView, updateQuickOrder } from '@store/reducers/userSlice';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import avatar from '@assets/image/avatar.png';

export default function SubmitOrderProducts() {
  const t = useTranslations('common');
  const [isPending, startTransition] = useTransition();
  const dispatch = useAppDispatch();
  const [projects, setProjects] = useState<IProjectListData[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const quickOrder = useAppSelector((state) => state.userReducer?.quickOrder);

  const handleSelectProject = (id: number) => {
    const projectId = id === selectedProjectId ? null : id;
    setSelectedProjectId(projectId);
    dispatch(updateQuickOrder({ key: 'project_id', value: projectId }));
    dispatch(updateChatView('preview'));
  };

  useEffect(() => {
    if (quickOrder?.project_id) {
      setSelectedProjectId(Number(quickOrder.project_id));
    } else {
      setSelectedProjectId(null);
    }
  }, [quickOrder]);

  const getProjects = () => {
    startTransition(async () => {
      try {
        const res: any = await getProjectList({ page: 1, size: 9999 });
        if (res.code === 200) {
          setProjects(res.data.list);

          console.log(res.data.list);
        } else {
          toast.error(res.msg || '获取项目列表失败');
        }
      } catch (error) {
        console.error(error);
        toast.error(error.message || '获取项目列表失败');
      }
    });
  };

  useEffect(() => {
    getProjects();
  }, []);

  return (
    <div className="space-y-2">
      <h3 className="text-xl font-semibold">{t('select_projects')}</h3>
      {isPending && (
        <div className="flex items-center justify-center py-10">
          <UILoading />
        </div>
      )}

      <div className="grid grid-cols-1 gap-2 px-0.5 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
        {!isPending &&
          projects.length > 0 &&
          projects.map((project) => (
            <Card
              key={project.id}
              className={clsx(
                'box-border min-h-35 gap-2 overflow-hidden rounded-3xl border-none px-6 py-4 shadow-[0px_4px_6px_0px_rgba(0,0,0,0.05)] transition-all',
                selectedProjectId === project.id ? 'ring-primary ring-2' : ''
              )}
            >
              <div className="gap-0 p-0">
                <div className="flex items-center justify-between">
                  <div className="box-border flex w-[calc(100%-1.25rem)] items-center gap-1 truncate pr-5 text-base">
                    <div className="size-10 overflow-hidden rounded-md">
                      {project?.icon ? (
                        <img
                          src={project?.icon}
                          alt="avatar"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = avatar.src;
                          }}
                        />
                      ) : (
                        <Image src={avatar} alt="avatar" className="size-10" />
                      )}
                    </div>
                    <div className="text-md font-medium">
                      <div>{project.name}</div>
                      <div className="text-primary">{project.website || '--'}</div>
                    </div>
                  </div>
                  <Checkbox
                    checked={selectedProjectId === project.id}
                    onCheckedChange={() => handleSelectProject(project.id)}
                    className="size-5"
                  />
                </div>
              </div>
              <CardContent className="flex flex-col gap-1 p-0">
                <p className="text-muted-foreground line-clamp-3 text-sm">{project?.desc}</p>
              </CardContent>
            </Card>
          ))}
        {!isPending && (
          <UIDialogAddNewProject onRefresh={getProjects}>
            <Card className="ring-border hover:ring-primary flex min-h-35 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-3xl border-none px-6 py-4 ring-1 transition-all hover:ring-2">
              <CardContent className="text-muted-foreground flex flex-col items-center justify-center gap-y-2">
                <Plus className="size-6" />
                <p className="text-md">{t('add_new_project')}</p>
              </CardContent>
            </Card>
          </UIDialogAddNewProject>
        )}
      </div>
    </div>
  );
}
