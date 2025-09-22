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

import { bindEmail } from '@libs/request';
import useUserInfo from '@hooks/useUserInfo';
import CompSendOTP from './components/SendOTP';
import { cn } from '@shadcn/lib/utils';

const FormSchema = z.object({
  email: z.string().trim().email(),
  code: z.string().trim().length(6),
});

type IBindEmailFormValues = z.infer<typeof FormSchema>;

export default function UIDialogBindEmail(props: {
  children: ReactNode;
  nonClosable?: boolean;
  kol?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const { children, open: externalOpen, onOpenChange: externalOnOpenChange } = props;
  const t = useTranslations('common');
  const { updateEmail } = useUserInfo();
  const [internalOpen, setInternalOpen] = useState<boolean>(false);

  // 使用外部控制的状态或内部状态
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen = externalOnOpenChange !== undefined ? externalOnOpenChange : setInternalOpen;
  const [isPending, startTransition] = useTransition();

  const form = useForm<IBindEmailFormValues>({
    resolver: zodResolver(FormSchema),
    mode: 'onChange', // 添加实时验证
    defaultValues: {
      email: '',
      code: '',
    },
  });
  const {
    getValues,
    handleSubmit,
    control,
    watch,
    formState: { isDirty, isValid },
  } = form;

  // 使用 watch 来获取实时的邮箱值
  const emailValue = watch('email');

  const onSubmit = (params: IBindEmailFormValues) => {
    startTransition(async () => {
      try {
        const { email, code } = params;

        const res = await bindEmail(
          {
            email,
            code,
          },
          props?.kol
        );

        if (res.code !== 200) {
          toast.error(t('bind_email_failed'));

          return;
        }

        updateEmail(email);

        toast.success(t('bind_email_success'));

        setIsOpen(false);
      } catch (error) {
        console.error(error);
        toast.error(t('bind_email_failed'));
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className={cn(
          'border-border w-96',
          props?.nonClosable && '[&_[data-radix-dialog-close]]:hidden'
        )}
        onInteractOutside={props?.nonClosable ? (e) => e.preventDefault() : undefined}
        onEscapeKeyDown={props?.nonClosable ? (e) => e.preventDefault() : undefined}
        nonClosable={props?.nonClosable}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{t('bind_email_title')}</DialogTitle>
          <DialogDescription>{t('bind_email_description')}</DialogDescription>
        </DialogHeader>
        <dl>
          <dt className="text-lg font-semibold capitalize">{t('bind_email_title')}</dt>
          <dd className="text-muted-foreground">{t('bind_email_description')}</dd>
        </dl>
        <div className="mx-auto w-full">
          <Form {...form}>
            <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
              <FormField
                control={control}
                name="email"
                render={({ field }) => {
                  return (
                    <FormItem className="grid gap-2">
                      <FormLabel className="capitalize">{t('form_email')}</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="m@example.com" />
                      </FormControl>
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={control}
                name="code"
                render={({ field }) => {
                  return (
                    <FormItem className="grid gap-2">
                      <div className="flex items-center">
                        <FormLabel className="capitalize">{t('form_otp')}</FormLabel>
                        <CompSendOTP email={emailValue} />
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
                  <span>{t('btn_bind_email')}</span>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
