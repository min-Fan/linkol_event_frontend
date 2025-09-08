import { useTranslations } from 'next-intl';

import { Button } from '@shadcn-ui/button';
import { IProjectListData } from '@libs/request';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shadcn/components/ui/dialog';

interface DeleteProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  project: IProjectListData;
}

export default function DeleteProjectDialog({
  isOpen,
  onClose,
  onConfirm,
  project,
}: DeleteProjectDialogProps) {
  const t = useTranslations('common');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('delete_project_title')}</DialogTitle>
          <DialogDescription>
            {t.rich('delete_project_confirm', {
              name: (chunks) => <span className="text-destructive">{project.name}</span>,
            })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('btn_cancel')}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {t('btn_delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
