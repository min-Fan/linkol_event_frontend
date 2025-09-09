import React from 'react';
import { Button } from '@shadcn/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from '@shadcn/components/ui/dialog';
import { useTranslations } from 'next-intl';
import { ScrollArea } from '@shadcn/components/ui/scroll-area';
import { Check } from 'lucide-react';

interface DialogBrandValueProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DialogBrandValue({ isOpen, onClose }: DialogBrandValueProps) {
  const t = useTranslations('common');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogClose asChild></DialogClose>
      <DialogContent
        className="border-border flex max-h-[90vh] w-full max-w-full flex-col gap-0 overflow-hidden bg-transparent p-2 shadow-none sm:w-[500px] sm:max-w-full sm:p-0"
        nonClosable
      >
        {/* Header */}
        <DialogHeader className="bg-primary gap-0 rounded-t-xl p-2 text-center text-white sm:rounded-t-2xl sm:p-4">
          <DialogTitle className="text-center text-base font-semibold text-white">
            {t('what_is_brand_value')}
          </DialogTitle>
          <DialogDescription>
            <p className="text-md text-center text-white opacity-90">
              {t('brand_value_description')}
            </p>
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="bg-background h-full space-y-4 overflow-y-auto rounded-b-xl p-4 pt-4 sm:rounded-b-2xl sm:p-4 sm:pt-8">
          {/* Brand Value Definition */}
          <div>
            <h3 className="text-foreground mb-2 text-base font-semibold">
              {t('brand_value_definition_title')}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t('brand_value_definition_text')}
            </p>
            <div className="bg-primary/5 border-primary mt-3 rounded-r-xl border-l-5 p-3">
              <p className="text-primary text-sm font-medium">{t('brand_value_formula')}</p>
            </div>
          </div>

          {/* How to Improve Brand Value */}
          <div>
            <h3 className="text-foreground mb-3 text-base font-semibold">
              {t('how_to_improve_brand_value')}
            </h3>
            <div className="space-y-3">
              <div className="bg-muted/50 border-border rounded-xl border p-3">
                <h4 className="mb-1 text-sm font-medium">{t('genuine_user_posts')}</h4>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {t('genuine_user_posts_desc')}
                </p>
              </div>
              <div className="bg-muted/50 border-border rounded-xl border p-3">
                <h4 className="mb-1 text-sm font-medium">{t('high_quality_content')}</h4>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {t('high_quality_content_desc')}
                </p>
              </div>
              <div className="bg-muted/50 border-border rounded-xl border p-3">
                <h4 className="mb-1 text-sm font-medium">{t('community_interaction')}</h4>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {t('community_interaction_desc')}
                </p>
              </div>
              <div className="bg-muted/50 border-border rounded-xl border p-3">
                <h4 className="mb-1 text-sm font-medium">{t('data_driven_approach')}</h4>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {t('data_driven_approach_desc')}
                </p>
              </div>
            </div>
          </div>

          {/* Brand Value Calculation */}
          <div className="bg-primary/10 rounded-xl p-4">
            <h3 className="text-foreground mb-3 text-base font-semibold">
              {t('brand_value_calculation')}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="mb-2 flex items-center gap-1 font-bold">
                  <span className="text-sm">{t('post_engagement')}</span>
                  <span className="text-sm">(40%)</span>
                </div>
                <p className="text-muted-foreground text-xs">{t('post_engagement_desc')}</p>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-1 font-bold">
                  <span className="text-sm">{t('user_influence')}</span>
                  <span className="text-sm">(30%)</span>
                </div>
                <p className="text-muted-foreground text-xs">{t('user_influence_desc')}</p>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-1 font-bold">
                  <span className="text-sm">{t('content_quality')}</span>
                  <span className="text-sm">(20%)</span>
                </div>
                <p className="text-muted-foreground text-xs">{t('content_quality_desc')}</p>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-1 font-bold">
                  <span className="text-sm">{t('sharing_effect')}</span>
                  <span className="text-sm">(10%)</span>
                </div>
                <p className="text-muted-foreground text-xs">{t('sharing_effect_desc')}</p>
              </div>
            </div>
          </div>

          {/* Got it! Button */}
          <div className="pt-4">
            <Button onClick={onClose} variant="secondary" className="w-40">
              <Check className="h-5 w-5" />
              {t('got_it')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
