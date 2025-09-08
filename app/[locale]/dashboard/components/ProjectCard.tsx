import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { EllipsisVertical, FilePen, Trash2 } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shadcn-ui/dropdown-menu';
import { Button } from '@shadcn-ui/button';

import PagesRoute from '@constants/routes';
import { Link } from '@libs/i18n/navigation';
import { IProjectListData } from '@libs/request';
import DeleteProjectDialog from './DeleteProjectDialog';

export default function ProjectCard({
  item,
  onDelete,
}: {
  item: IProjectListData;
  onDelete?: (id: number) => void;
}) {
  const t = useTranslations('common');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete(item.id);
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="bg-accent hover:bg-background hover:border-border w-full rounded-md border border-transparent p-4 transition-colors hover:shadow-xs">
      <div className="flex items-center gap-4">
        {item.icon && (
          <div className="h-20 w-20 min-w-20 overflow-hidden rounded-lg">
            <img src={item.icon} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex w-full items-center justify-between space-x-2">
            <dl className="w-full flex-1 overflow-hidden">
              <dt className="truncate text-base font-semibold">{item.name}</dt>
              <dd className="text-sm">
                <Link
                  className="text-primary block truncate underline"
                  href={item.website || ''}
                  target="_blank"
                >
                  {item.website || `visit-${item.name}.com`}
                </Link>
              </dd>
            </dl>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <EllipsisVertical className="size-5 cursor-pointer" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-border" align="end">
                <DropdownMenuItem className="cursor-pointer">
                  <Link
                    className="flex w-full items-center space-x-2"
                    href={`${PagesRoute.PROJECT}/${item.id}`}
                  >
                    <FilePen className="text-muted-foreground size-4" />
                    <span className="text-muted-foreground capitalize">{t('btn_edit')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={handleDeleteClick}>
                  <Trash2 className="text-destructive size-4" />
                  <span className="text-destructive capitalize">{t('btn_delete')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-muted-foreground w-full truncate">{item.desc || '-'}</p>
        </div>
      </div>

      <DeleteProjectDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        project={item}
      />
    </div>
  );
}
