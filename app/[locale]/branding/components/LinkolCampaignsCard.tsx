import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { Card, CardContent } from '@shadcn-ui/card';
import { Button } from '@shadcn-ui/button';

import PagesRoute from '@constants/routes';
import { formatNumberKMB } from '@libs/utils';
import { Link } from '@libs/i18n/navigation';
import { IBrandingLinkolCampaign } from '@hooks/branding';

export default function LinkolCampaignsCard(props: { data: IBrandingLinkolCampaign }) {
  const { data } = props;
  const { name, screen_name, icons } = data;
  const t = useTranslations('common');

  return (
    <Card className="border-primary/15 shadow-muted-foreground/10 border-2 p-0 shadow-md">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="size-12 overflow-hidden rounded-full">
            <Image
              src=""
              overrideSrc={icons[0]}
              alt={screen_name}
              className="size-full"
              width={48}
              height={48}
            />
          </div>
          <dl className="flex-1 overflow-hidden font-medium">
            <dt className="truncate text-xl">{name}</dt>
            <dd className="text-muted-foreground truncate text-base">@{screen_name}</dd>
          </dl>
        </div>
        <div className="bg-primary/5 box-border flex items-center justify-between gap-x-2 rounded-xl p-4">
          <div className="text-primary space-y-1">
            <div className="text-base">{t('brand_value')}</div>
            <div className="text-xl">${data.band_value}</div>
          </div>
          <Link href={`${PagesRoute.BRANDING}/${data.screen_name}`}>
            <Button className="" size="sm">
              {t('btn_view')}
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-md text-muted-foreground truncate">
            {formatNumberKMB(data.uniqueKols)} {t('unique_snappers')}
          </p>
          <div className="flex justify-end">
            {data.icons &&
              data.icons.map((icon, iconIndex) => {
                return (
                  <div
                    className="border-background -ml-3.5 size-7 overflow-hidden rounded-full border"
                    key={iconIndex}
                  >
                    <Image src="" overrideSrc={icon} alt="avatar" className="size-full" />
                  </div>
                );
              })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
