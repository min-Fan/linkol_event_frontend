'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { SquarePlus } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent } from '@shadcn-ui/card';
import { getProjectList } from '@libs/request';
import UIDialogAddNewProject from '@ui/dialog/AddNewProject';
import UILoading from '@ui/loading';

import CompProject from './Project';
import useUserInfo from '@hooks/useUserInfo';

interface Project {
  id: number;
  name: string;
  website: string;
  desc: string;
  icon: string;
  created_at: string;
  document_urls: string[] | null;
  user: number;
}

interface SelectProjectProps {
  onProjectSelect?: (projectId: string) => void;
  resetTrigger?: number; // 添加重置触发器
}

/**
 * 项目选择组件 - 专门用于创建模式
 * 特点：只在初始化时同步外部值，避免状态循环更新
 */
export default function SelectProject({ onProjectSelect, resetTrigger }: SelectProjectProps) {
  const t = useTranslations('common');
  const [projects, setProjects] = useState<Project[]>([]);
  const { isLogin } = useUserInfo();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [isSelecting, setIsSelecting] = useState(false); // 添加选择状态标志

  // 监听重置触发器
  useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger > 0) {
      setSelectedProject('');
      setIsSelecting(false);
      onProjectSelect?.('');
    }
  }, [resetTrigger]); // 移除onProjectSelect依赖，避免无限循环

  // 获取项目列表
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response: any = await getProjectList({ page: 1, limit: 9999 });

      if (response.code === 200 && response.data) {
        setProjects(response.data.list);
      } else {
        // toast.error(response.msg || t('fetch_projects_failed'));
      }
    } catch (error) {
      console.error('获取项目列表失败:', error);
      toast.error(t('fetch_projects_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  // 处理项目选择
  const handleProjectSelect = (projectId: string) => {
    // 防止重复选择同一个项目
    if (selectedProject === projectId) {
      console.log('重复选择同一个项目，跳过:', projectId);
      return;
    }

    // 防止正在选择时重复触发
    if (isSelecting) {
      console.log('正在选择中，跳过:', projectId);
      return;
    }

    console.log('handleProjectSelect', projectId, '当前选中:', selectedProject);
    setIsSelecting(true); // 设置选择状态

    // 使用函数式更新，确保状态更新的原子性
    setSelectedProject((prev) => {
      console.log('更新选中项目:', prev, '->', projectId);
      return projectId;
    });

    // 通知父组件
    onProjectSelect?.(projectId);

    // 延迟重置选择状态，确保状态更新完成
    setTimeout(() => {
      setIsSelecting(false);
      console.log('选择状态重置完成');
    }, 150);
  };

  // 处理创建项目成功后的刷新
  const handleProjectCreated = () => {
    fetchProjects();
  };

  // 初始加载项目列表
  useEffect(() => {
    if (isLogin) {
      fetchProjects();
    } else {
      setProjects([]);
      setSelectedProject('');
      setIsSelecting(false);
      onProjectSelect?.('');
    }
  }, [isLogin]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">
          {t('post_campaign_select_project')}
          <span className="ml-1 text-red-500">*</span>
        </h3>
        <div className="flex flex-col items-center justify-center py-20">
          <UILoading />
          <div className="text-muted-foreground mt-4">{t('loading_projects')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xl font-semibold">
        {t('post_campaign_select_project')}
        <span className="ml-1 text-red-500">*</span>
      </h3>

      <div className="3xl:grid-cols-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects?.map((project) => (
          <div
            key={project.id}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleProjectSelect(project.id.toString());
            }}
            className="cursor-pointer"
          >
            <CompProject
              logo={project.icon}
              title={project.name}
              link={project.website}
              description={project.desc}
              isSelected={selectedProject === project.id.toString()}
              className="cursor-pointer transition-all hover:shadow-lg"
            />
          </div>
        ))}

        <UIDialogAddNewProject onRefresh={handleProjectCreated}>
          <Card className="cursor-pointer rounded-3xl border-none p-0 shadow-[0px_7.51px_11.27px_0px_#0000000D] transition-all hover:shadow-lg">
            <CardContent className="p-0">
              <div className="text-muted-foreground hover:text-primary box-border flex min-h-50 flex-col items-center justify-center gap-y-2 p-6 transition-colors">
                <SquarePlus className="size-6" />
                <span className="text-base leading-5">{t('post_campaign_select_add')}</span>
              </div>
            </CardContent>
          </Card>
        </UIDialogAddNewProject>
      </div>
    </div>
  );
}
