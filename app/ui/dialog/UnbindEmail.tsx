'use client';

import { ReactNode, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LoaderCircle } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@shadcn-ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@shadcn-ui/form';
import { Input } from '@shadcn-ui/input';
import { Button } from '@shadcn-ui/button';
import { toast } from 'sonner';

import { unbindEmail } from '@libs/request';
import useUserInfo from '@hooks/useUserInfo';
import CompSendOTP from './components/SendOTP';

const FormSchema = z.object({
  code: z.string().trim().length(6),
});

type IUnbindEmailFormValues = z.infer<typeof FormSchema>;

export default function UIDialogUnbindEmail(props: {
  email: string;
  children: ReactNode;
  kol?: boolean;
}) {
  const { email, children } = props;
  const t = useTranslations('common');
  const { updateEmail } = useUserInfo();

  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<IUnbindEmailFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      code: '',
    },
  });
  const {
    handleSubmit,
    control,
    formState: { isDirty, isValid },
  } = form;

  const onSubmit = (params: IUnbindEmailFormValues) => {
    startTransition(async () => {
      const { code } = params;

      const res = await unbindEmail(
        {
          email,
          code,
        },
        props?.kol
      );

      if (res.code !== 200) {
        toast.error(t('unbind_email_failed'));

        return;
      }

      updateEmail('');

      toast.success(t('unbind_email_success'));

      setIsOpen(false);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="border-border w-96">
        <DialogHeader className="sr-only">
          <DialogTitle>{t('unbind_email_title')}</DialogTitle>
          <DialogDescription>{t('unbind_email_description')}</DialogDescription>
        </DialogHeader>
        <dl>
          <dt className="text-lg font-semibold capitalize">{t('unbind_email_title')}</dt>
          <dd className="text-muted-foreground">{t('unbind_email_description')}</dd>
        </dl>
        <div className="mx-auto w-full">
          <Form {...form}>
            <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
              <FormItem className="grid gap-2">
                <FormLabel className="capitalize">{t('form_email')}</FormLabel>
                <FormControl>
                  <Input type="email" value={email} readOnly />
                </FormControl>
              </FormItem>
              <FormField
                control={control}
                name="code"
                render={({ field }) => {
                  return (
                    <FormItem className="grid gap-2">
                      <div className="flex items-center">
                        <FormLabel className="capitalize">{t('form_otp')}</FormLabel>
                        <CompSendOTP email={email} />
                      </div>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  );
                }}
              />
              <Button
                type="submit"
                className="mx-auto"
                disabled={!isValid || !isDirty || isPending}
              >
                {isPending ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <span>{t('btn_unbind_email')}</span>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
