import { useTranslations } from 'next-intl';

import { useBrandingLinkolCampaigns } from '@hooks/branding';
import UILoading from '@ui/loading';
import LinkolCampaignsList from './LinkolCampaignsList';

export default function LinkolCampaigns() {
  const t = useTranslations('common');
  const { data, isLoading } = useBrandingLinkolCampaigns(1, 999);

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold capitalize">{t('linkol_campaigns')}</h3>
        <div className="flex h-40 items-center justify-center">
          <UILoading />
        </div>
      </div>
    );
  }

  return <LinkolCampaignsList data={data} />;
}
