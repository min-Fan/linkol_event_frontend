import { Popover, PopoverTrigger, PopoverContent } from '@shadcn/components/ui/popover';
import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { Button } from '@shadcn/components/ui/button';
import { Trash2 } from 'lucide-react';
import { ScrollArea } from '@shadcn/components/ui/scroll-area';
import { removeSelectedKOL } from '@store/reducers/userSlice';
import { AnimatePresence, motion } from 'motion/react';
import defaultAvatar from '@assets/image/avatar.png';
import { formatCurrency } from '@libs/utils';

export default function KOLSelectListView({ children }: { children: React.ReactNode }) {
  const t = useTranslations('common');
  const selectedKOLs = useAppSelector((state) => state.userReducer?.selectedKOLs);
  const dispatch = useAppDispatch();
  const payTokenInfo = useAppSelector((state) => state.userReducer?.pay_token_info);

  const estimateTotal = useMemo(() => {
    const amount = selectedKOLs?.reduce((acc, kol) => acc + kol.price_yuan, 0) || 0;

    return formatCurrency(amount, 2);
  }, [selectedKOLs]);
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-auto" side="bottom" align="start">
        <div className="grid gap-2 sm:gap-4">
          <div className="space-y-1 sm:space-y-2">
            <h4 className="leading-none font-medium">
              {t.rich('total_kol_agent_all', {
                count: (chunks) => (
                  <strong className="text-primary text-sm sm:text-base">
                    {selectedKOLs?.length || 0}
                  </strong>
                ),
              })}
            </h4>
            <p className="text-muted-foreground text-sm sm:text-base">
              {t.rich('expected_total_cost', {
                cost: (chunks) => (
                  <strong className="text-primary text-sm sm:text-base">
                    {estimateTotal || 0}
                  </strong>
                ),
              })}
            </p>
          </div>
          <ScrollArea className="max-h-[300px] pr-2">
            <div className="grid gap-2">
              <AnimatePresence mode="popLayout">
                {selectedKOLs?.map((kol) => (
                  <motion.div
                    initial={{ opacity: 0, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, filter: 'blur(10px)' }}
                    transition={{ duration: 0.3 }}
                    key={kol.id}
                    className="grid max-w-[300px] grid-cols-12 items-center justify-between gap-2 sm:max-w-[400px]"
                  >
                    <div className="col-span-2">
                      <img
                        src={kol.profile_image_url}
                        alt={kol.name}
                        className="h-full w-full rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = defaultAvatar.src;
                        }}
                      />
                    </div>
                    <div className="col-span-4">
                      <p className="sm:text-md text-sm">{kol.name}</p>
                      <p className="text-muted-foreground text-xs sm:text-sm">@{kol.screen_name}</p>
                    </div>
                    <div className="col-span-4 flex flex-col items-center justify-center">
                      <p className="text-primary sm:text-md text-sm">{kol.price_yuan}</p>
                      <p className="text-muted-foreground text-xs sm:text-sm">/tweet</p>
                    </div>
                    <div className="col-span-2 flex items-center justify-end">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => dispatch(removeSelectedKOL(kol))}
                      >
                        <Trash2 className="size-3 sm:size-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
