import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';

import { Button } from '@shadcn-ui/button';

export default function ProjectApplication() {
  const t = useTranslations('common');

  return (
    <div className="flex justify-center lg:justify-end">
      <a href="#" title={t('project_application')} target="_blank">
        <Button className="!h-11 gap-x-1 !rounded-full !px-6 !text-base font-medium">
          <span>{t('project_application')}</span>
          <ArrowRight className="size-5" />
        </Button>
      </a>
    </div>
  );
}
