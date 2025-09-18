'use client';

import { useTranslations } from 'next-intl';
import { Plus, Loader2, X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { ethers } from 'ethers';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@shadcn/components/ui/card';
import { Textarea } from '@shadcn/components/ui/textarea';
import { Button } from '@shadcn/components/ui/button';

import { ORDER_PROGRESS } from '@constants/app';
import useOrderProgress from '@hooks/uesOrderProgress';
import { useState, useEffect } from 'react';
import { Input } from '@shadcn/components/ui/input';
import { toast } from 'sonner';
import {
  uploadDoc,
  createProject,
  associateProject,
  IProjectListData,
  getProjectList,
  getOrderDetail,
  getProjectDetail,
} from '@libs/request';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { clearSelectedKOLInfo, updateQuickOrder } from '@store/reducers/userSlice';
import { Checkbox } from '@shadcn/components/ui/checkbox';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@shadcn/components/ui/pagination';
import { cn } from '@shadcn/lib/utils';
import CompSubmitOrderAmountSlider from './SubmitOrderAmountSlider';
import { useReadContract } from 'wagmi';
import { getContractAddress } from '@constants/config';
import { erc20Abi } from 'viem';
import { calculateTotalAmount } from '@libs/utils/format-bignumber';

export const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200KB

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // 下面是部分浏览器可能的扩展名类型
  'application/octet-stream',
  'text/plain',
];

const ALLOWED_EXTENSIONS = ['.txt'];

export default function CreateProductForm() {
  const t = useTranslations('common');
  const { setOrderProgress } = useOrderProgress();
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const dispatch = useAppDispatch();
  const quickOrder = useAppSelector((state) => state.userReducer?.quickOrder);
  // 项目列表相关状态
  const [viewMode, setViewMode] = useState<'create' | 'list'>('list'); // 默认显示列表
  const [projects, setProjects] = useState<IProjectListData[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(9); // 三列布局，每行3个，共显示9个
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    Number(quickOrder?.project_id) || null
  );
  const selectedKOLs = useAppSelector((state) => state.userReducer?.selectedKOLs);
  const [kolsCount, setKolsCount] = useState<number>(selectedKOLs?.length || 0);
  const [amount, setAmount] = useState<string>('');
  // 绑定的项目信息
  const [boundProject, setBoundProject] = useState<any>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const { data: decimals, refetch: refetchDecimals } = useReadContract({
    address: getContractAddress()?.pay_member_token_address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'decimals',
  });
  // 检查订单是否已绑定项目
  const checkOrderProject = async () => {
    if (!quickOrder?.order_id) return;

    try {
      setIsLoading(true);
      const res: any = await getOrderDetail({ order_id: Number(quickOrder.order_id) });

      if (res.code === 200 && res.data && res.data.project_id) {
        // 订单已绑定项目，获取项目详情
        const projectId = res.data.project_id;
        dispatch(updateQuickOrder({ key: 'project_id', value: projectId }));

        setIsLoadingProject(true);
        const projectRes: any = await getProjectDetail(projectId);
        setIsLoadingProject(false);

        if (projectRes.code === 200 && projectRes.data) {
          setBoundProject(projectRes.data);
        } else {
          toast.error(t('error_load_project_info'));
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedKOLs?.length || !decimals) {
      return;
    }

    const totalAmount = calculateTotalAmount(selectedKOLs, kolsCount, Number(decimals));
    setAmount(totalAmount);
  }, [kolsCount, decimals]);

  useEffect(() => {
    checkOrderProject();
  }, [quickOrder?.order_id]);

  const handleCreate = async () => {
    try {
      setIsLoading(true);
      const response: any = await createProject({
        name: projectName,
        desc: projectDescription,
        document_urls: fileUrls,
        tweet_url: '',
        icon: '',
      });
      if (response.code === 200) {
        toast.success(t('create_project_success'));
        dispatch(updateQuickOrder({ key: 'project_id', value: response.data.id }));
        setOrderProgress(ORDER_PROGRESS.SUBMIT_ORDER);
      } else {
        setIsLoading(false);
        toast.error(response.msg);
        dispatch(updateQuickOrder({ key: 'project_id', value: '' }));
      }
    } catch (error) {
      console.error(error);
      dispatch(updateQuickOrder({ key: 'project_id', value: '' }));
      toast.error(error.message);
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const selectedFiles = Array.from(e.target.files || []);

      // 类型校验
      const invalidFiles = selectedFiles.filter(
        (file) =>
          !ALLOWED_TYPES.includes(file.type) &&
          !ALLOWED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext))
      );
      if (invalidFiles.length > 0) {
        toast.error(
          `file type not supported: ${invalidFiles.map((f) => f.name).join(', ')}, only support TXT`
        );
        return;
      }

      // 检查文件大小
      const oversizedFiles = selectedFiles.filter((file) => file.size > MAX_FILE_SIZE);
      if (oversizedFiles.length > 0) {
        toast.error(`file ${oversizedFiles.map((f) => f.name).join(', ')} is larger than 200KB`);
        return;
      }

      setIsUploading(true);

      // 逐个上传文件
      const uploadPromises = selectedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response: any = await uploadDoc({
          file,
        });

        if (response.code === 200) {
          return {
            file,
            url: response.data.fileUri,
          };
        } else {
          throw new Error(`upload ${file.name} failed: ${response.msg}`);
        }
      });

      const results = await Promise.all(uploadPromises);

      // 更新文件和URL列表
      setFiles((prev) => [...prev, ...results.map((r) => r.file)]);
      setFileUrls((prev) => [...prev, ...results.flatMap((r) => r.url)]);
      setIsUploading(false);
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'file upload failed');
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFileUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const getProjects = async (currentPage = page) => {
    try {
      setIsLoadingList(true);
      const res: any = await getProjectList({ page: currentPage, size });
      if (res.code === 200) {
        setProjects(res.data.list);
        setTotal(res.data.total);
        setTotalPages(Math.ceil(res.data.total / size));
      } else {
        toast.error(res.msg || '获取项目列表失败');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || '获取项目列表失败');
    } finally {
      setIsLoadingList(false);
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    getProjects();
  }, [page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisiblePages = 5; // 最多显示5个页码

    if (totalPages <= maxVisiblePages) {
      // 总页数少于最大显示数，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 总页数多于最大显示数，显示部分页码
      if (page <= 3) {
        // 当前页靠前
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        // 当前页靠后
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        // 当前页在中间
        pages.push(1);
        pages.push('ellipsis');
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const hanldeNext = () => {
    dispatch(updateQuickOrder({ key: 'project_id', value: selectedProjectId }));
    setOrderProgress(ORDER_PROGRESS.SUBMIT_ORDER);
  };

  const handleSelectProject = (id: number) => {
    setSelectedProjectId(id === selectedProjectId ? null : id);
  };

  const handleAssociateSelectedProject = async () => {
    if (selectedProjectId === null) {
      toast.error(t('please_select_project'));
      return;
    }

    try {
      setIsLoading(true);

      // 更新到Redux store
      dispatch(updateQuickOrder({ key: 'project_id', value: selectedProjectId }));
      if (quickOrder?.order_id) {
        const res: any = await associateProject({
          order_id: Number(quickOrder.order_id),
          project_id: selectedProjectId,
        });

        if (res.code === 200) {
          toast.success(t('associate_project_success'));
          setOrderProgress(ORDER_PROGRESS.KOL_PROMOTION);
        } else {
          toast.error(res.msg);
          dispatch(updateQuickOrder({ key: 'project_id', value: '' }));
        }
      } else {
        toast.error(t('error_order_not_found'));
        dispatch(updateQuickOrder({ key: 'project_id', value: '' }));
        setOrderProgress(ORDER_PROGRESS.SUBMIT_ORDER);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
      setIsLoading(false);
      dispatch(updateQuickOrder({ key: 'project_id', value: '' }));
    } finally {
      setIsLoading(false);
    }
  };

  const orderAgain = () => {
    dispatch(updateQuickOrder({ key: 'project_id', value: '' }));
    dispatch(updateQuickOrder({ key: 'order_id', value: '' }));
    dispatch(updateQuickOrder({ key: 'order_no', value: '' }));
    dispatch(clearSelectedKOLInfo());
    setOrderProgress(ORDER_PROGRESS.KOL_SQUARE);
  };

  const onKOLsChange = (value: number[]) => {
    setKolsCount(value[0]);
  };

  // 如果正在初始加载，显示加载动画
  if (isInitialLoading) {
    return (
      <Card className="gap-2 p-6">
        <div className="flex items-center justify-center py-10">
          <Loader2 className="size-8 animate-spin" />
        </div>
      </Card>
    );
  }

  // 如果订单已绑定项目，则显示项目信息
  if (boundProject) {
    return (
      <Card className="gap-2 p-6">
        <CardHeader className="gap-4 px-0 pt-0">
          <CardTitle>
            <h1 className="text-base font-bold capitalize">{t('project_details')}</h1>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          {isLoadingProject ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="size-8 animate-spin" />
            </div>
          ) : (
            <>
              <div className="text-foreground space-y-2">
                <h3 className="text-muted-foreground font-semibold capitalize">
                  {t('project_name')}
                </h3>
                <p className="text-base">{boundProject.name}</p>
              </div>

              {boundProject.website && (
                <div className="text-foreground space-y-2">
                  <h3 className="text-muted-foreground font-semibold capitalize">{t('website')}</h3>
                  <span
                    className="text-primary hover:text-primary/90 cursor-pointer"
                    onClick={() => window.open(boundProject.website, '_blank')}
                  >
                    {boundProject.website}
                  </span>
                </div>
              )}

              <div className="text-foreground space-y-2">
                <h3 className="text-muted-foreground font-semibold capitalize">
                  {t('project_description')}
                </h3>
                <p className="text-sm">{boundProject.desc || '-'}</p>
              </div>

              {boundProject.document_urls && boundProject.document_urls.length > 0 && (
                <div className="text-foreground space-y-2">
                  <h3 className="text-muted-foreground font-semibold capitalize">
                    {t('documents')}
                  </h3>
                  <ul className="space-y-2">
                    {boundProject.document_urls.map((url, index) => (
                      <li
                        key={index}
                        className="bg-secondary flex items-center justify-between rounded-md p-2"
                      >
                        <span
                          className="hover:text-primary cursor-pointer truncate text-sm"
                          onClick={() => window.open(url, '_blank')}
                        >
                          {url.split('/').pop()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-center px-0 pt-4">
          <Button onClick={orderAgain} disabled={isLoading} className="w-auto">
            {t('btn_order_again')}
          </Button>
          {/* <Button 
            onClick={() => setOrderProgress(ORDER_PROGRESS.KOL_PROMOTION)} 
            disabled={isLoading}
            className="w-auto"
          >
            {t('btn_view_data')}
          </Button> */}
        </CardFooter>
      </Card>
    );
  }

  if (viewMode === 'list' && projects.length > 0) {
    return (
      <Card className="gap-2 border-none bg-transparent p-0 shadow-none">
        <CardHeader className="gap-0 px-0 pt-0">
          <div className="flex items-center justify-between">
            <CardTitle>
              <h1 className="text-base font-bold capitalize">{t('select_projects')}</h1>
            </CardTitle>
            <Button onClick={() => setViewMode('create')}>{t('btn_create_new')}</Button>
          </div>
        </CardHeader>
        <CardContent className="p-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {isLoadingList ? (
              <div className="col-span-3 flex items-center justify-center py-10">
                <Loader2 className="size-8 animate-spin" />
              </div>
            ) : (
              projects.map((project) => (
                <Card
                  key={project.id}
                  className={cn(
                    'gap-2 overflow-hidden rounded-2xl p-4 transition-all',
                    selectedProjectId === project.id ? 'ring-primary ring-2' : ''
                  )}
                >
                  <CardHeader className="gap-0 p-0">
                    <div className="flex items-start justify-between">
                      <CardTitle className="truncate text-base">{project.name}</CardTitle>
                      <Checkbox
                        checked={selectedProjectId === project.id}
                        onCheckedChange={() => handleSelectProject(project.id)}
                        className="h-5 w-5"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-1 p-0">
                    {project.website && (
                      <span className="text-primary text-sm">{project.website}</span>
                    )}
                    <p className="text-muted-foreground line-clamp-3 text-sm">
                      {project.desc || '-'}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center py-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) handlePageChange(page - 1);
                      }}
                      className={cn(
                        'cursor-pointer',
                        page === 1 ? 'pointer-events-none opacity-50' : ''
                      )}
                    />
                  </PaginationItem>

                  {getPageNumbers().map((pageNum, index) => (
                    <PaginationItem key={index}>
                      {pageNum === 'ellipsis' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          isActive={page === pageNum}
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(pageNum as number);
                          }}
                        >
                          {pageNum}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < totalPages) handlePageChange(page + 1);
                      }}
                      className={cn(
                        'cursor-pointer',
                        page === totalPages ? 'pointer-events-none opacity-50' : ''
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center px-0 pt-4">
          <Button
            onClick={hanldeNext}
            disabled={selectedProjectId === null || isLoading}
            className="w-full max-w-xs"
          >
            {isLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            {t('btn_next_step')}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <>
      {selectedKOLs?.length && (
        <CompSubmitOrderAmountSlider
          min={1}
          max={selectedKOLs?.length}
          current={kolsCount}
          onValueChange={onKOLsChange}
          amount={amount}
        />
      )}

      <Card className="gap-2 p-6 sm:border-none sm:p-0">
        <CardHeader className="gap-0 px-0 pt-0">
          <div className="flex items-center justify-between sm:hidden">
            <CardTitle>
              <h1 className="text-base font-bold capitalize">{t('create_project')}</h1>
            </CardTitle>
            {projects.length > 0 && (
              <Button variant="outline" onClick={() => setViewMode('list')}>
                {t('btn_select_existing')}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-0">
          <div className="text-foreground space-y-2">
            <h3 className="font-semibold capitalize">{t('project_name')}</h3>
            <div className="relative">
              <Textarea
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                maxLength={32}
                className="h-auto min-h-auto resize-none"
              />
              <p className="text-muted-foreground absolute right-1 bottom-1 text-sm">
                {projectName.length} / 32
              </p>
            </div>
          </div>
          <div className="text-foreground space-y-2">
            <h3 className="font-semibold capitalize">{t('project_description')}</h3>
            <div className="relative">
              <Textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                maxLength={2000}
                className="h-20"
              />
              <p className="text-muted-foreground absolute right-1 bottom-1 text-sm">
                {projectDescription.length} / 2000
              </p>
            </div>
          </div>
          <div className="text-muted-foreground space-y-2">
            <dl>
              <dt className="font-semibold capitalize">{t('add_documents')}</dt>
              <dd className="text-muted-foreground text-sm">{t('add_documents_description')}</dd>
            </dl>
            <div className="hover:bg-card border-secondary hover:border-primary bg-secondary relative mx-auto box-border flex max-w-md cursor-pointer flex-col items-center justify-center space-y-2 rounded-xl border p-6 transition-colors">
              {isUploading ? (
                <Loader2 className="size-6 animate-spin" />
              ) : (
                <Plus className="size-6" />
              )}
              <p>
                {t.rich('add_documents_ps', {
                  maxSize: (chunks) => (
                    <strong className="text-base">{MAX_FILE_SIZE / 1024 / 1024}KB</strong>
                  ),
                  format: (chunks) => <span className="text-sm">TXT</span>,
                })}
              </p>
              <Input
                type="file"
                id="file"
                multiple
                className="absolute top-0 left-0 h-full w-full opacity-0"
                accept=".txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
              />
            </div>

            {/* 已上传文件列表 */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium">{t('uploaded_files')}:</h4>
                <ul className="space-y-2">
                  {files.map((file, index) => (
                    <li
                      key={index}
                      className="bg-secondary flex items-center justify-between rounded-md p-2"
                    >
                      <span className="truncate text-sm">
                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-destructive hover:text-destructive/90"
                      >
                        <X className="size-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="flex gap-x-12 not-sm:hidden">
            <Button
              className="text-md h-6 flex-1 rounded-sm sm:h-10 sm:rounded-xl"
              variant="secondary"
              onClick={() => setViewMode('list')}
            >
              {t('btn_cancel')}
            </Button>
            <Button
              className="text-md h-6 flex-1 rounded-sm sm:h-10 sm:rounded-xl"
              onClick={handleCreate}
              disabled={isLoading || isUploading}
            >
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : t('btn_create')}
            </Button>
          </div>

          <Button
            className="mx-auto flex sm:hidden"
            onClick={handleCreate}
            disabled={isLoading || isUploading}
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : t('btn_create')}
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
