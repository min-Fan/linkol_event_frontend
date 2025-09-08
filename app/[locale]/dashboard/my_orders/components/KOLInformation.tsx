import { UserRound, Image } from 'lucide-react';
import { KolRankListItem } from 'app/@types/types';
import defaultAvatar from '@assets/image/avatar.png';

export default function KOLInformation(props: { hasPartners?: boolean; kol?: KolRankListItem }) {
  const { hasPartners = true, kol } = props;

  return (
    <div className="space-y-2 p-2">
      <div className="flex items-center space-x-2">
        <div className="border-border bg-background box-border flex size-10 items-center justify-center rounded-full border">
          {kol?.profile_image_url ? (
            <img
              src={kol.profile_image_url}
              alt={kol.name}
              className="size-10 rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = defaultAvatar.src;
              }}
            />
          ) : (
            <UserRound className="size-6" />
          )}
        </div>
        <dl className="text-left">
          <dt className="font-semibold">{kol?.name || 'Unknown'}</dt>
          <dd>@{kol?.screen_name || 'Unknown'}</dd>
        </dl>
      </div>
      {hasPartners && kol?.projects && kol.projects.length > 0 && (
        <div className="flex items-center space-x-2">
          {kol.projects.slice(0, 4).map((project, index) => (
            <dl key={index} className="flex flex-col items-center justify-center space-y-1">
              <dd className="bg-border flex size-6 items-center justify-center rounded-md">
                {project.icon ? (
                  <img
                    src={project.icon}
                    alt={project.name}
                    className="size-5 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = defaultAvatar.src;
                    }}
                  />
                ) : (
                  <Image className="text-muted-foreground size-5" />
                )}
              </dd>
              <dt className="text-xs capitalize">{project.name}</dt>
            </dl>
          ))}
        </div>
      )}
    </div>
  );
}
