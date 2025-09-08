import { ImageIcon } from 'lucide-react';

import { Card, CardContent } from '@shadcn-ui/card';
import { Checkbox } from '@shadcn-ui/checkbox';
import defaultAvatar from '@assets/image/avatar.png';

export default function Project(props: {
  logo: string;
  title: string;
  link: string;
  description: string;
  isSelected?: boolean;
  className?: string;
}) {
  const { logo, title, link, description, isSelected = false, className = '' } = props;

  return (
    <Card
      className={`rounded-3xl border-none p-0 shadow-[0px_7.51px_11.27px_0px_#0000000D] ${
        isSelected ? 'ring-primary bg-primary/5 ring-2' : ''
      } ${className}`}
    >
      <CardContent className="p-0">
        <div className="box-border min-h-50 space-y-2 p-6">
          <div className="flex gap-x-2">
            <div className="size-10 overflow-hidden rounded-lg">
              {logo ? (
                <img
                  src={logo}
                  alt="avatar"
                  className="size-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = defaultAvatar.src;
                  }}
                />
              ) : (
                <ImageIcon className="text-muted-foreground size-full" />
              )}
            </div>
            <dl className="w-full flex-1 text-base leading-5">
              <dt className="truncate font-bold">{title}</dt>
              <dd className="text-primary truncate font-medium">{link}</dd>
            </dl>
            <Checkbox checked={isSelected} />
          </div>
          <p className="text-muted-foreground line-clamp-5 text-base leading-5">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
