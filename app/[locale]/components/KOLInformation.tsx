import { UserRound, Image, BookmarkCheck } from 'lucide-react';
import { KolRankListItem } from 'app/@types/types';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@shadcn-ui/tooltip';
import { AnimatePresence, motion } from 'motion/react';
import defaultAvatar from '@assets/image/avatar.png';
import { Twitter, TwitterBlack, Verified } from '@assets/svg';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import { updateSelectedKOLInfo } from 'app/store/reducers/userSlice';
import { updateChatView } from 'app/store/reducers/userSlice';
import { useLocale } from 'next-intl';
import { getKOLInfo } from '@libs/request';
export default function KOLInformation(props: { hasPartners?: boolean; kol?: KolRankListItem }) {
  const { hasPartners = true, kol } = props;
  const t = useTranslations('common');
  const dispatch = useAppDispatch();
  const lang = useLocale();
  const selectedKOLInfo = useAppSelector((state) => state.userReducer?.selectedKOLInfo);
  const twitterUrl = `https://x.com/${kol?.screen_name}`;
  const toTwitter = () => {
    window.open(twitterUrl, '_blank');
  };

  const copy = async (text: string | undefined) => {
    try {
      if (text == undefined) return;

      await navigator.clipboard.writeText(text);
      toast.success(t('copy_success'));
    } catch (error) {
      toast.error(t('copy_failed'));
    }
  };

  const handleKOLInfo = async () => {
    try {
      if ((selectedKOLInfo && selectedKOLInfo.id === kol?.id) || !kol?.id) return;
      const res = await getKOLInfo(kol.id.toString(), { language: lang });
      if (res.code === 200) {
        dispatch(updateSelectedKOLInfo(res.data));
        dispatch(updateChatView('preview'));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-2 p-2">
      <div className="flex items-center space-x-2">
        <div className="border-border bg-background relative box-border flex size-10 items-center justify-center rounded-full border">
          {(kol?.profile_image_url || kol?.icon) && (
            <img
              src={kol?.profile_image_url || kol?.icon}
              alt="avatar"
              className="relative z-10 h-full w-full rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = defaultAvatar.src;
              }}
              onClick={handleKOLInfo}
            />
          )}
          {!kol?.profile_image_url && !kol?.icon && <UserRound className="size-6" />}
          {selectedKOLInfo?.id == kol?.id && (
            <span className="animate-glow-ping bg-primary/80 absolute inset-0 z-0 rounded-full"></span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <dl className="cursor-pointer text-left" onClick={() => copy(kol?.screen_name)}>
            <dt className="text-foreground flex max-w-50 flex-nowrap items-center gap-x-1 truncate font-semibold">
              <span className="truncate">{kol?.name}</span>
              {kol?.is_verified && <Verified className="size-4 min-w-4" />}
            </dt>
            <dd className="text-muted-foreground max-w-50 truncate">@{kol?.screen_name}</dd>
          </dl>
          <TwitterBlack className="size-5" onClick={toTwitter} />
        </div>

        {/* <TooltipProvider>
          <Tooltip>
            
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-2">
                <dl className="cursor-default text-left">
                  <dt className="text-foreground flex max-w-50 flex-nowrap items-center gap-x-1 truncate font-semibold">
                    <span className="truncate">{kol?.name}</span>
                    {kol?.is_verified && <Verified className="size-4 min-w-4" />}
                  </dt>
                  <dd className="text-muted-foreground max-w-50 truncate">@{kol?.screen_name}</dd>
                </dl>
                <TwitterBlack className="size-5" onClick={toTwitter} />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="max-w-xs">
                <p className="font-semibold">{kol?.name}</p>
                <p className="text-xs">@{kol?.screen_name}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
         */}
      </div>
      {hasPartners && (
        <motion.div
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: 0.3 }}
          className="bg-muted-foreground/10 grid grid-cols-5 gap-2 rounded-2xl p-2"
        >
          {kol?.projects.map((project, index) => {
            if (index < 5) {
              return (
                <dl className="flex flex-col items-center justify-center space-y-1" key={index}>
                  <dd className="bg-border flex size-6 items-center justify-center overflow-hidden rounded-md">
                    {project.icon && (
                      <img
                        src={project.icon}
                        alt={project.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                    {!project.icon && <Image className="text-muted-foreground size-5" />}
                  </dd>
                  <dt className="text-muted-foreground max-w-full truncate text-left text-xs capitalize">
                    {project.name}
                  </dt>
                </dl>
              );
            }
          })}
        </motion.div>
      )}
    </div>
  );
}
